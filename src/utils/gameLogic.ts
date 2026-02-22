import type { BoardState, Move, Piece, Position, Player } from '../types/game';
import { BOARD_SIZE } from './constants';

/*
  Verifies if a specific row/column coordinate exists within our 8x8 checkerboard.
  Basically stops the code from trying to access squares off the edge of the world.
*/
export const isValidPos = (pos: Position): boolean => {
  return (
    pos.row >= 0 &&
    pos.row < BOARD_SIZE &&
    pos.col >= 0 &&
    pos.col < BOARD_SIZE
  );
};

// Simple check to see if there is literally any piece at a given spot.
export const hasPiece = (board: BoardState, pos: Position): boolean => {
  return isValidPos(pos) && board[pos.row][pos.col] !== null;
};

// Safe way to grab what's on a square without crashing if the position is invalid.
export const getPiece = (board: BoardState, pos: Position): Piece | null => {
  if (!isValidPos(pos)) return null;
  return board[pos.row][pos.col];
};

/*
  This is the heavy lifter for finding jump chains (multi-jumps).
  It recursively looks ahead: "If I jump here, can I jump again?"
  Because in checkers, if you CAN jump, you often HAVE to keep jumping.
*/
const getMultiJumpSequences = (
  board: BoardState,
  piece: Piece,
  currentPos: Position,
  visited: Position[] = []
): Move[] => {
  const sequences: Move[] = [];
  const directions = [];

  // Red moves UP (-1), Black moves DOWN (+1). Kings move BOTH ways.
  if (piece.color === 'red' || piece.isKing) {
    directions.push({ row: -1, col: -1 }, { row: -1, col: 1 });
  }
  if (piece.color === 'black' || piece.isKing) {
    directions.push({ row: 1, col: -1 }, { row: 1, col: 1 });
  }

  directions.forEach((dir) => {
    const jumpRow = currentPos.row + dir.row * 2;
    const jumpCol = currentPos.col + dir.col * 2;
    const jumpPos = { row: jumpRow, col: jumpCol };

    // We can only jump if the landing spot is empty and actually on the board.
    if (isValidPos(jumpPos) && board[jumpRow][jumpCol] === null) {
      const midRow = currentPos.row + dir.row;
      const midCol = currentPos.col + dir.col;
      const midPos = { row: midRow, col: midCol };
      const midPiece = board[midRow][midCol];

      // And of course, we need an opponent's piece in the middle to jump over.
      if (midPiece && midPiece.color !== piece.color) {

        // Prevent infinite loops where a King jumps back and forth over the same spot (if that were possible)
        const alreadyJumped = visited.some(v => v.row === midRow && v.col === midCol);

        if (!alreadyJumped) {
          // Temporarily simulate the board state AFTER this jump to see what's next.
          const tempBoard = board.map(r => [...r]);
          tempBoard[jumpRow][jumpCol] = piece;
          tempBoard[currentPos.row][currentPos.col] = null;
          tempBoard[midRow][midCol] = null;

          const newVisited = [...visited, midPos];

          // RECURSION: Go deeper!
          const furtherJumps = getMultiJumpSequences(tempBoard, piece, jumpPos, newVisited);

          if (furtherJumps.length > 0) {
            // We found more jumps! Add them to the sequence.
            furtherJumps.forEach(furtherJump => {
              sequences.push({
                from: currentPos,
                to: furtherJump.to,
                isJump: true,
                jumpedPiece: midPos,
                jumpSequence: [jumpPos, ...(furtherJump.jumpSequence || [])]
              });
            });
          } else {
            // No more jumps possible, this is the end of the line.
            sequences.push({
              from: currentPos,
              to: jumpPos,
              isJump: true,
              jumpedPiece: midPos,
              jumpSequence: [jumpPos]
            });
          }
        }
      }
    }
  });

  return sequences;
};

/*
  The master function for figuring out where a specific piece can go.
  'checkMultiJump' flag lets us toggle between looking for full recursive chains (for AI)
  or just the immediate next step (for human Interface).
*/
export const getValidMovesForPiece = (
  board: BoardState,
  piece: Piece,
  pos: Position,
  checkMultiJump: boolean = true
): Move[] => {
  let jumps: Move[] = [];

  if (checkMultiJump) {
    // For AI: We want the full path of destruction.
    jumps = getMultiJumpSequences(board, piece, pos);
  } else {
    // For Humans: We just want to know where they can click NEXT.
    // We manually check for valid single jumps without recursing.
    const directions = [];
    if (piece.color === 'red' || piece.isKing) directions.push({ row: -1, col: -1 }, { row: -1, col: 1 });
    if (piece.color === 'black' || piece.isKing) directions.push({ row: 1, col: -1 }, { row: 1, col: 1 });

    directions.forEach((dir) => {
      const jumpRow = pos.row + dir.row * 2;
      const jumpCol = pos.col + dir.col * 2;
      const landingPos = { row: jumpRow, col: jumpCol };

      if (isValidPos(landingPos) && board[jumpRow][jumpCol] === null) {
        const midRow = pos.row + dir.row;
        const midCol = pos.col + dir.col;
        const midPiece = board[midRow][midCol];

        if (midPiece && midPiece.color !== piece.color) {
          jumps.push({
            from: pos,
            to: landingPos,
            isJump: true,
            jumpedPiece: { row: midRow, col: midCol },
            jumpSequence: [landingPos]
          });
        }
      }
    });
  }

  // KEY RULE: If jumps are available, you CANNOT make a simple move.
  if (jumps.length > 0) {
    return jumps;
  }

  // If no jumps, then we look for simple specific steps to empty adjacent squares.
  const moves: Move[] = [];
  const directions = [];

  if (piece.color === 'red' || piece.isKing) {
    directions.push({ row: -1, col: -1 }, { row: -1, col: 1 });
  }
  if (piece.color === 'black' || piece.isKing) {
    directions.push({ row: 1, col: -1 }, { row: 1, col: 1 });
  }

  directions.forEach(dir => {
    const targetRow = pos.row + dir.row;
    const targetCol = pos.col + dir.col;
    const targetPos = { row: targetRow, col: targetCol };

    if (isValidPos(targetPos) && board[targetRow][targetCol] === null) {
      moves.push({
        from: pos,
        to: targetPos,
        isJump: false
      });
    }
  });

  return moves;
};

/*
  Scans the WHOLE board for a player to find ALL possible moves.
  Crucially, this enforces the "Mandatory Jump" rule globally.
  If even ONE piece can jump, all non-jump moves are disallowed.
*/
export const getAllValidMoves = (board: BoardState, player: Player): Move[] => {
  const allMoves: Move[] = [];
  const allJumps: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === player) {
        const moves = getValidMovesForPiece(board, piece, { row, col });
        moves.forEach(move => {
          if (move.isJump) {
            allJumps.push(move);
          } else {
            allMoves.push(move);
          }
        });
      }
    }
  }

  if (allJumps.length > 0) {
    return allJumps;
  }

  return allMoves;
};

/*
  Actually applies a move to the board data structure.
  Handles moving the piece, removing the victim (if it's a jump), and King promotion.
*/
export const executeMove = (board: BoardState, move: Move): BoardState => {
  const newBoard = board.map(r => [...r]); // Always copy state, never mutate!
  const piece = { ...newBoard[move.from.row][move.from.col]! };

  if (move.isJump && move.jumpSequence) {
    // Logic for Multi-Jumps (or even single jumps formatted as sequences)
    let currentPos = move.from;

    for (const landingPos of move.jumpSequence) {
      // Math to find the square exactly between start and end (the victim)
      const jumpedRow = (currentPos.row + landingPos.row) / 2;
      const jumpedCol = (currentPos.col + landingPos.col) / 2;

      // Delete the captured piece
      newBoard[jumpedRow][jumpedCol] = null;

      // Move the hero piece
      newBoard[landingPos.row][landingPos.col] = piece;
      newBoard[currentPos.row][currentPos.col] = null;

      currentPos = landingPos;
    }
  } else {
    // Simple move logic
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;

    if (move.isJump && move.jumpedPiece) {
      newBoard[move.jumpedPiece.row][move.jumpedPiece.col] = null;
    }
  }

  // KING PROMOTION: Reaching the far end of the board.
  if (!piece.isKing) {
    if ((piece.color === 'red' && move.to.row === 0) ||
      (piece.color === 'black' && move.to.row === 7)) {
      piece.isKing = true;
    }
  }

  return newBoard;
};

// Simple check: If a player has NO moves left, they lose.
export const checkGameOver = (board: BoardState): 'red' | 'black' | 'draw' | null => {
  const redMoves = getAllValidMoves(board, 'red');
  const blackMoves = getAllValidMoves(board, 'black');

  if (redMoves.length === 0) return 'black';
  if (blackMoves.length === 0) return 'red';

  return null;
};
