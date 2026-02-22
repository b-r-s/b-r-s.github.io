import type { BoardState, Player } from '../types/game';
import { BOARD_SIZE, SCORING_WEIGHTS, PIECE_VALUES } from './constants';

export interface ScoreBreakdown {
  material: number;
  power: number;
  strategy: number;
  total: number;
}

export interface GameScores {
  red: ScoreBreakdown;
  black: ScoreBreakdown;
}

// Helper to check if a position is on the board
const isValidPos = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

// Helper to get all valid moves for a specific player (simplified for scoring)
// We need this to calculate mobility
const getMoveCount = (board: BoardState, player: Player): number => {
  let moveCount = 0;
  const size = BOARD_SIZE;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const piece = board[row][col];
      if (piece && piece.color === player) {
        const directions = [];
        if (piece.color === 'red' || piece.isKing) directions.push({ row: -1, col: -1 }, { row: -1, col: 1 });
        if (piece.color === 'black' || piece.isKing) directions.push({ row: 1, col: -1 }, { row: 1, col: 1 });

        directions.forEach((dir) => {
          // Simple Move
          const targetRow = row + dir.row;
          const targetCol = col + dir.col;
          if (isValidPos(targetRow, targetCol) && board[targetRow][targetCol] === null) {
            moveCount++;
          }
          // Jump Move
          const jumpRow = row + dir.row * 2;
          const jumpCol = col + dir.col * 2;
          if (isValidPos(jumpRow, jumpCol) && board[jumpRow][jumpCol] === null) {
            const midRow = row + dir.row;
            const midCol = col + dir.col;
            const midPiece = board[midRow][midCol];
            if (midPiece && midPiece.color !== piece.color) {
              moveCount++;
            }
          }
        });
      }
    }
  }
  return moveCount;
};

export const calculateScore = (board: BoardState, player: Player): ScoreBreakdown => {
  let material = 0;
  let power = 0;
  let strategy = 0;

  // Mobility (Strategy)
  const myMoves = getMoveCount(board, player);
  strategy += myMoves * SCORING_WEIGHTS.MOBILITY;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.color !== player) continue;

      // Level 1: Material
      if (piece.isKing) {
        material += PIECE_VALUES.KING;
      } else {
        material += PIECE_VALUES.REGULAR;
      }

      // Level 2: Power (Kings)
      if (piece.isKing) {
        power += PIECE_VALUES.KING;
      }

      // Level 3: Strategy (Positional)

      // Advancement (Forward progress)
      if (!piece.isKing) {
        const advancement = piece.color === 'red' ? (BOARD_SIZE - 1 - row) : row;
        strategy += advancement * SCORING_WEIGHTS.ADVANCEMENT;

        // Back Rank Guard (Home row safety)
        if ((piece.color === 'red' && row === BOARD_SIZE - 1) || (piece.color === 'black' && row === 0)) {
          strategy += SCORING_WEIGHTS.BACK_RANK;
        }
      }

      // Center Control (Columns 2-5)
      if (col >= 2 && col <= 5) {
        strategy += SCORING_WEIGHTS.CENTER_CONTROL;
      }

      // Formation/Support (Diagonal neighbors)
      const dir = piece.color === 'red' ? 1 : -1; // Look "backwards"
      const supportRow = row + dir;
      if (isValidPos(supportRow, col - 1) && board[supportRow][col - 1]?.color === player) strategy += SCORING_WEIGHTS.SUPPORT;
      if (isValidPos(supportRow, col + 1) && board[supportRow][col + 1]?.color === player) strategy += SCORING_WEIGHTS.SUPPORT;
    }
  }

  return {
    material: Math.floor(material),
    power: Math.floor(power),
    strategy: Math.floor(strategy),
    total: Math.floor(material + power + strategy)
  };
};
