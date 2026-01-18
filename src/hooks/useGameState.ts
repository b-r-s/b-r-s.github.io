import { useState, useCallback, useEffect, useRef } from 'react';
import type { BoardState, Position, GameState, Move, Player } from '../types/game';
import { useAI } from './useAI';
import { calculateScore } from '../utils/scoring';
import { playMoveSound, playJumpSound, playKingSound, playAIMoveSound, playAIJumpSound } from '../utils/sound';
import { BOARD_SIZE, TOAST_DURATION_MS } from '../utils/constants';
import {
  getAllValidMoves,
  executeMove,
  checkGameOver,
  getValidMovesForPiece
} from '../utils/gameLogic';

/*
  Sets up the initial board with the standard 8x8 checkerboard layout.
  Rows 0-2 get Black pieces, Rows 5-7 get Red pieces.
  We only place pieces on the dark squares (where (row + col) is odd).
*/
const createInitialBoard = (): BoardState => {
  const board: BoardState = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          board[row][col] = { color: 'black', isKing: false };
        } else if (row > 4) {
          board[row][col] = { color: 'red', isKing: false };
        }
      }
    }
  }
  return board;
};

export const useGameState = (
  settings: import('./useSettings').GameSettings,
  onGameEnd?: (winner: Player | 'draw', moveCount: number) => void
) => {
  const { getBestMove } = useAI();

  // Map difficulty settings to AI levels
  const getAILevelFromDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): 'beginner' | 'intermediate' | 'advanced' => {
    switch (difficulty) {
      case 'easy': return 'beginner';
      case 'medium': return 'intermediate';
      case 'hard': return 'advanced';
      default: return 'intermediate';
    }
  };
  /*
    Main state container for the game.
    We track everything here: the board, whose turn it is, scores, and time.
  */
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialBoard = createInitialBoard();
    const redScore = calculateScore(initialBoard, 'red');
    const blackScore = calculateScore(initialBoard, 'black');
    const aiLevel = getAILevelFromDifficulty(settings.difficulty);
    const aiMovesFirst = aiLevel === 'advanced' && settings.aiMovesFirst;
    return {
      board: initialBoard,
      currentPlayer: aiMovesFirst ? 'black' : 'red',
      selectedPosition: null,
      validMoves: [],
      winner: null,
      gameMode: 'PvAI',
      isAiTurn: false,
      aiLevel: aiLevel,
      scores: {
        red: redScore,
        black: blackScore
      },
      turnStartTime: Date.now(),
      totalTime: { red: 0, black: 0 },
      moveHistory: [],
      moveCount: 0,
    };
  });

  /* 
    This state locks a player into using a specific piece when they are in the 
    middle of a multi-jump sequence. If you jump, and can jump again, you 
    CANNOT switch pieces. 
  */
  const [multiJumpSource, setMultiJumpSource] = useState<Position | null>(null);

  // Simple toast message for showing "Jump is mandatory!" warnings.
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Track the toast timeout so we can clean it up properly
  const toastTimeoutRef = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    // Clear any existing timeout to prevent memory leaks
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }, []);

  // Clean up toast timeout when component unmounts
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Memoize score calculations to avoid recalculating on every render
  // Only recalculates when the board reference changes
  const updateScores = useCallback((board: BoardState) => {
    const redScore = calculateScore(board, 'red');
    const blackScore = calculateScore(board, 'black');
    return { red: redScore, black: blackScore };
  }, []);

  // NOTE: lastAIMove trail is now cleared when the player selects a piece (in handleTileClick)
  // The old auto-clear timer was removed to allow the trail to persist

  /*
    SHARED LOGIC: This is the heart of move execution, used by both click and drag-drop.
    We extracted this to avoid ~120 lines of duplication.
  */
  const processMoveExecution = useCallback((
    move: Move,
    prevState: GameState
  ): GameState => {
    // Play appropriate sound for the move type
    if (move.isJump) playJumpSound();
    else playMoveSound();

    const newBoard = executeMove(prevState.board, move);

    // Check if this move created a King
    const movedPiece = newBoard[move.to.row][move.to.col];
    const wasPromoted = !prevState.board[move.from.row][move.from.col]?.isKing && movedPiece?.isKing;
    if (wasPromoted) {
      playKingSound();
    }

    const elapsed = Date.now() - prevState.turnStartTime;

    /*
       Multi-Jump Handling:
       If the user just jumped, we verify if they can jump AGAIN from the new spot.
       If they can, we DO NOT end their turn. We instead 'lock' them to that piece.
       (Unless they just got promoted to King - that usually ends the turn immediately).
    */
    let nextPlayer: Player = prevState.currentPlayer === 'red' ? 'black' : 'red';
    let lockPiece: Position | null = null;
    let keepTurn = false;

    if (move.isJump && !wasPromoted) {
      const followUpMoves = getValidMovesForPiece(newBoard, movedPiece!, move.to, false);
      const canJumpAgain = followUpMoves.some(m => m.isJump);

      if (canJumpAgain) {
        keepTurn = true;
        nextPlayer = prevState.currentPlayer; // Keep turn with same player
        lockPiece = move.to; // Lock selection to the new position
      }
    }

    if (keepTurn) {
      setMultiJumpSource(lockPiece);
      // Immediately calculate and show the next available jumps
      const nextMoves = getValidMovesForPiece(
        newBoard,
        newBoard[lockPiece!.row][lockPiece!.col]!,
        lockPiece!,
        false
      ).filter(m => m.isJump);

      // For multi-jump continuations, don't add to history yet
      return {
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPosition: lockPiece,
        validMoves: nextMoves,
        scores: updateScores(newBoard),
      };
    } else {
      // Turn ends here - add to move history for beginner level only
      setMultiJumpSource(null);
      const winner = checkGameOver(newBoard);
      const newMoveCount = prevState.moveCount + 1;

      // Call onGameEnd callback if game ended
      if (winner && onGameEnd) {
        onGameEnd(winner, newMoveCount);
      }

      // Add to move history for undo functionality (beginner level only)
      const newMoveHistory = prevState.aiLevel === 'beginner' ? [
        ...prevState.moveHistory,
        {
          move,
          boardBefore: prevState.board,
          scoresBefore: prevState.scores,
          playerBefore: prevState.currentPlayer,
          timeBefore: {
            turnStartTime: prevState.turnStartTime,
            totalTime: prevState.totalTime
          }
        }
      ] : prevState.moveHistory;

      const newState = {
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPosition: null,
        validMoves: [],
        winner: winner,
        scores: updateScores(newBoard),
        turnStartTime: Date.now(),
        totalTime: {
          ...prevState.totalTime,
          [prevState.currentPlayer]: prevState.totalTime[prevState.currentPlayer] + elapsed
        },
        lastAIMove: undefined,
        lastUndoMove: undefined,
        moveHistory: newMoveHistory,
        moveCount: newMoveCount,
        isAiTurn: false,
      };

      return newState;
    }
  }, [updateScores, onGameEnd]);

  // Trigger AI move directly - no useEffect needed
  const triggerAIMove = useCallback(() => {
    // Add delay for human-like feel
    setTimeout(() => {
      // 1. Mark as processing
      setGameState(prev => {
        if (prev.currentPlayer !== 'black' || prev.gameMode !== 'PvAI' || prev.winner || prev.isAiTurn) {
          return prev;
        }
        return { ...prev, isAiTurn: true };
      });

      // 2. Calculate the move outside the state updater
      const currentBoard = gameState.board;
      const aiMove = getBestMove(currentBoard, 'black', gameState.aiLevel);

      if (!aiMove) {
        setGameState(prev => ({ ...prev, winner: 'red', isAiTurn: false }));
        return;
      }

      // 3. Orchestrate execution
      if (aiMove.isJump && aiMove.jumpSequence && aiMove.jumpSequence.length > 1) {
        // Handle multi-jump sequence
        let iteratedBoard = currentBoard;
        let currentPos = aiMove.from;
        let jumpIndex = 0;

        const capturedSquares: Position[] = [];
        const landingSquares: Position[] = [];
        const startSquare = aiMove.from;

        const executeNextJump = () => {
          if (jumpIndex >= aiMove.jumpSequence!.length) {
            // All jumps complete
            const finalElapsed = Date.now() - gameState.turnStartTime;
            const winner = checkGameOver(iteratedBoard);
            const newMoveCount = gameState.moveCount + 1;

            if (winner && onGameEnd) onGameEnd(winner, newMoveCount);

            const newHistory = gameState.aiLevel === 'beginner' ? [
              ...gameState.moveHistory,
              {
                move: aiMove,
                boardBefore: currentBoard,
                scoresBefore: gameState.scores,
                playerBefore: 'black' as Player,
                timeBefore: { turnStartTime: gameState.turnStartTime, totalTime: gameState.totalTime }
              }
            ] : gameState.moveHistory;

            setGameState(prev => ({
              ...prev,
              board: iteratedBoard,
              currentPlayer: 'red',
              isAiTurn: false,
              winner,
              scores: updateScores(iteratedBoard),
              turnStartTime: Date.now(),
              totalTime: { ...prev.totalTime, black: prev.totalTime.black + finalElapsed },
              lastAIMove: {
                from: aiMove.from,
                to: aiMove.to,
                timestamp: Date.now(),
                trail: { startSquare, capturedSquares: [...capturedSquares], landingSquares: [...landingSquares] }
              },
              moveHistory: newHistory,
              moveCount: newMoveCount
            }));
            return;
          }

          const landingPos = aiMove.jumpSequence![jumpIndex];
          const jumpedRow = (currentPos.row + landingPos.row) / 2;
          const jumpedCol = (currentPos.col + landingPos.col) / 2;

          capturedSquares.push({ row: jumpedRow, col: jumpedCol });
          landingSquares.push(landingPos);

          const newBoard = [...iteratedBoard.map(row => [...row])];
          newBoard[landingPos.row][landingPos.col] = iteratedBoard[currentPos.row][currentPos.col];
          newBoard[currentPos.row][currentPos.col] = null;
          newBoard[jumpedRow][jumpedCol] = null;

          const piece = newBoard[landingPos.row][landingPos.col];
          if (piece && !piece.isKing) {
            if (piece.color === 'black' && landingPos.row === 7) {
              newBoard[landingPos.row][landingPos.col] = { ...piece, isKing: true };
              playKingSound();
            }
          }

          playAIJumpSound();
          iteratedBoard = newBoard;

          setGameState(prev => ({
            ...prev,
            board: iteratedBoard,
            lastAIMove: {
              from: currentPos,
              to: landingPos,
              timestamp: Date.now(),
              trail: { startSquare, capturedSquares: [...capturedSquares], landingSquares: [...landingSquares] }
            }
          }));

          currentPos = landingPos;
          jumpIndex++;
          setTimeout(executeNextJump, 2000);
        };

        playAIMoveSound();
        setTimeout(executeNextJump, 800);
      } else {
        // Single move or single jump
        playAIMoveSound();
        const newBoard = executeMove(currentBoard, aiMove);
        const movedPiece = newBoard[aiMove.to.row][aiMove.to.col];
        if (!currentBoard[aiMove.from.row][aiMove.from.col]?.isKing && movedPiece?.isKing) playKingSound();
        if (aiMove.isJump) playAIJumpSound();

        const elapsed = Date.now() - gameState.turnStartTime;
        const winner = checkGameOver(newBoard);
        const newCount = gameState.moveCount + 1;

        if (winner && onGameEnd) onGameEnd(winner, newCount);

        const newHistory = gameState.aiLevel === 'beginner' ? [
          ...gameState.moveHistory,
          {
            move: aiMove,
            boardBefore: currentBoard,
            scoresBefore: gameState.scores,
            playerBefore: 'black' as Player,
            timeBefore: { turnStartTime: gameState.turnStartTime, totalTime: gameState.totalTime }
          }
        ] : gameState.moveHistory;

        const trail = aiMove.isJump && aiMove.jumpedPiece ? {
          startSquare: aiMove.from,
          capturedSquares: [aiMove.jumpedPiece],
          landingSquares: [aiMove.to]
        } : undefined;

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: 'red',
          isAiTurn: false,
          winner,
          scores: updateScores(newBoard),
          turnStartTime: Date.now(),
          totalTime: { ...prev.totalTime, black: prev.totalTime.black + elapsed },
          lastAIMove: {
            from: aiMove.from,
            to: aiMove.to,
            timestamp: Date.now(),
            trail
          },
          moveHistory: newHistory,
          moveCount: newCount
        }));
      }
    }, 1000);
  }, [getBestMove, updateScores, onGameEnd, gameState]);

  // Trigger AI move when it becomes AI's turn - this IS appropriate for useEffect
  // because we're responding to the state changing to require AI action
  useEffect(() => {
    if (
      gameState.currentPlayer === 'black' &&
      gameState.gameMode === 'PvAI' &&
      !gameState.winner &&
      !gameState.isAiTurn
    ) {
      triggerAIMove();
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.winner, gameState.isAiTurn, triggerAIMove]);

  /*
    Handles all user interactions with the board squares.
    This is where we enforce rules like "Mandatory Jumps" and "Turn Locking".
  */
  const handleTileClick = useCallback((row: number, col: number) => {
    if (gameState.isAiTurn || gameState.winner) return;

    setGameState(prev => {
      const clickedPiece = prev.board[row][col];
      const isCurrentPlayerPiece = clickedPiece?.color === prev.currentPlayer;

      // --- PIECE SELECTION LOGIC ---
      if (isCurrentPlayerPiece) {
        // If the user already started a multi-jump, they must finish it with the SAME piece.
        if (multiJumpSource) {
          if (row !== multiJumpSource.row || col !== multiJumpSource.col) {
            showToast("You must continue jumping with the active piece!");
            return prev;
          }
        }

        // Check if ANY move on the board is a jump. If so, regular moves are disabled.
        const allPlayerMoves = getAllValidMoves(prev.board, prev.currentPlayer);
        const mustJump = allPlayerMoves.some(m => m.isJump);

        // Get the moves specifically for the piece the user clicked.
        // We pass 'false' to get just the immediate single steps, for a better UX.
        const moves = getValidMovesForPiece(prev.board, clickedPiece!, { row, col }, false);

        // If a jump is mandatory, we filter out any non-jump moves for this piece.
        const filteredMoves = mustJump ? moves.filter(m => m.isJump) : moves;

        // If the user clicked a piece that CAN'T jump, but they MUST jump somewhere...
        if (mustJump && filteredMoves.length === 0) {
          // Only annoy them with a toast if they are trying to switch selection
          if (prev.selectedPosition?.row !== row || prev.selectedPosition?.col !== col) {
            showToast("Jump is mandatory! Choose a piece that can jump.");
          }
          return prev;
        }

        // If they clicked a piece that has moves, but we filtered them all out because they weren't jumps...
        if (mustJump && !filteredMoves.some(m => m.isJump)) {
          showToast("Jump is mandatory! You must take the jump.");
          return { ...prev, selectedPosition: { row, col }, validMoves: [] };
        }

        // Clear AI trail when human selects a piece
        return { ...prev, selectedPosition: { row, col }, validMoves: filteredMoves, lastAIMove: undefined };
      }

      // --- MOVE EXECUTION LOGIC ---
      // If the user clicked an empty square and has a piece selected...
      if (!clickedPiece && prev.selectedPosition) {
        const move = prev.validMoves.find(
          m => m.to.row === row && m.to.col === col,
        );

        if (move) {
          return processMoveExecution(move, prev);
        }
      }

      // --- DESELECTION LOGIC ---
      // If locked in a multi-jump, you cannot deselect!
      if (multiJumpSource) {
        showToast("You must finish your multi-jump sequence!");
        return prev;
      }

      return { ...prev, selectedPosition: null, validMoves: [] };
    });
  }, [gameState.isAiTurn, gameState.winner, multiJumpSource, showToast, processMoveExecution]);

  // Mirrors the exact same logic as above but for Drag-and-Drop events.
  const movePiece = useCallback((from: { row: number; col: number }, to: { row: number; col: number }) => {
    if (multiJumpSource) {
      if (from.row !== multiJumpSource.row || from.col !== multiJumpSource.col) {
        showToast("You must move the active starting piece!");
        return;
      }
    }

    const isValid = gameState.validMoves.some(
      m => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === to.col,
    );
    if (!isValid) return;

    setGameState(prev => {
      const move = prev.validMoves.find(
        m => m.from.row === from.row && m.from.col === from.col && m.to.row === to.row && m.to.col === to.col,
      );
      if (!move) return prev;

      return processMoveExecution(move, prev);
    });
  }, [multiJumpSource, gameState.validMoves, showToast, processMoveExecution]);

  const setAILevel = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    setGameState(prev => ({ ...prev, aiLevel: level }));
  }, []);

  const undoMove = useCallback(() => {
    setGameState(prev => {
      // Only allow undo for beginner level, need at least 2 moves (human + AI)
      if (prev.aiLevel !== 'beginner' || prev.moveHistory.length < 2 || prev.isAiTurn) {
        return prev;
      }

      // Undo both the AI's last move AND the human move before it
      // Get the entry from 2 moves ago (before human's last move)
      const entryToRestore = prev.moveHistory[prev.moveHistory.length - 2];

      // Create visual feedback for the undone move (show human's move being undone)
      const undoVisual = {
        from: entryToRestore.move.to,
        to: entryToRestore.move.from,
        timestamp: Date.now()
      };

      // Restore state from before the human's last move
      return {
        ...prev,
        board: entryToRestore.boardBefore,
        currentPlayer: entryToRestore.playerBefore,
        scores: entryToRestore.scoresBefore,
        turnStartTime: entryToRestore.timeBefore.turnStartTime,
        totalTime: entryToRestore.timeBefore.totalTime,
        moveHistory: prev.moveHistory.slice(0, -2), // Remove last 2 moves
        lastUndoMove: undoVisual,
        lastAIMove: undefined,
        selectedPosition: null,
        validMoves: [],
        winner: null, // Clear winner if we're undoing
        isAiTurn: false, // Reset AI turn flag
      };
    });
    setMultiJumpSource(null);
  }, []);

  const restartGame = useCallback(() => {
    const initialBoard = createInitialBoard();
    const redScore = calculateScore(initialBoard, 'red');
    const blackScore = calculateScore(initialBoard, 'black');

    setGameState(prev => {
      // Use the current aiLevel from game state, not from settings
      const aiLevel = prev.aiLevel;
      // AI moves first only in advanced mode when setting is enabled
      const aiMovesFirst = aiLevel === 'advanced' && settings.aiMovesFirst;

      return {
        board: initialBoard,
        currentPlayer: aiMovesFirst ? 'black' : 'red',
        selectedPosition: null,
        validMoves: [],
        winner: null,
        gameMode: prev.gameMode,
        isAiTurn: false,
        aiLevel: aiLevel,
        scores: {
          red: redScore,
          black: blackScore
        },
        turnStartTime: Date.now(),
        totalTime: { red: 0, black: 0 },
        moveHistory: [],
        lastUndoMove: undefined,
        moveCount: 0,
      };
    });
    setMultiJumpSource(null);
    setToastMessage(null);
  }, [settings.aiMovesFirst]);

  const clearUndoHighlight = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      lastUndoMove: undefined
    }));
  }, []);

  return { gameState, handleTileClick, movePiece, setAILevel, restartGame, undoMove, clearUndoHighlight, toastMessage };
};
