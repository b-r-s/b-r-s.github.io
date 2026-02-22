import { calculateScore } from './scoring';
import { MINIMAX_DEPTH, TERMINAL_SCORE } from './constants';
import type { BoardState, Move, Player } from '../types/game';
import { getAllValidMoves, executeMove } from './gameLogic';

/**
 * A helper to figure out "how good is this board state for me?"
 * It just subtracts the opponent's score from our score.
 * Positive = Good for us. Negative = Good for them.
 */
export const evaluateBoard = (board: BoardState, player: Player): number => {
  const score = calculateScore(board, player);
  const opponent = player === 'red' ? 'black' : 'red';
  const opponentScore = calculateScore(board, opponent);

  return score.total - opponentScore.total;
};

/**
 * The Minimax Algorithm!
 * This is how the 'Advanced' AI thinks ahead.
 */
export const minimax = (
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  player: Player
): number => {
  // Base case: If we've looked far enough ahead, just score the board as it is.
  if (depth === 0) {
    return evaluateBoard(board, player);
  }

  // Whose turn is it in this hypothetical future?
  const currentPlayer = maximizingPlayer ? player : (player === 'red' ? 'black' : 'red');
  const moves = getAllValidMoves(board, currentPlayer);

  // If someone has no moves, the game is over.
  if (moves.length === 0) {
    return maximizingPlayer ? -TERMINAL_SCORE : TERMINAL_SCORE;
  }

  // Move Ordering: Evaluate jumps/captures first to maximize pruning efficiency.
  const sortedMoves = [...moves].sort((a, b) => {
    if (a.isJump && !b.isJump) return -1;
    if (!a.isJump && b.isJump) return 1;
    return 0;
  });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      const newBoard = executeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, player);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      const newBoard = executeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, player);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

/**
 * Pure function to find the best move using Minimax.
 * This is the core logic that will run in the Web Worker.
 */
export const findBestMove = (
  board: BoardState,
  player: Player,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Move | null => {
  const allMoves = getAllValidMoves(board, player);

  if (allMoves.length === 0) {
    return null;
  }

  // BEGINNER: Pure chaos. Just picks a random move.
  if (difficulty === 'beginner') {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // INTERMEDIATE: Uses minimax with depth=1 (looks one move ahead)
  if (difficulty === 'intermediate') {
    let bestMove: Move | null = null;
    let bestScore = -Infinity;

    for (const move of allMoves) {
      const newBoard = executeMove(board, move);
      const score = minimax(newBoard, 1, -Infinity, Infinity, false, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove || allMoves[0];
  }

  // ADVANCED: Deep search with Alpha-Beta, Move Ordering, and "Battery Guard".
  if (difficulty === 'advanced') {
    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    let currentDepth = MINIMAX_DEPTH - 1;

    // Ordered moves: Jumps first, then King promotions.
    const orderedMoves = [...allMoves].sort((a, b) => {
      if (a.isJump && !b.isJump) return -1;
      if (!a.isJump && b.isJump) return 1;

      // Check for king promotion
      const aIsPromo = !board[a.from.row][a.from.col]?.isKing && (a.to.row === 0 || a.to.row === 7);
      const bIsPromo = !board[b.from.row][b.from.col]?.isKing && (b.to.row === 0 || b.to.row === 7);
      if (aIsPromo && !bIsPromo) return -1;
      if (!aIsPromo && bIsPromo) return 1;

      return 0;
    });

    for (const move of orderedMoves) {
      const start = performance.now();
      const newBoard = executeMove(board, move);
      const score = minimax(newBoard, currentDepth, -Infinity, Infinity, false, player);

      // "Battery Guard": If a single branch takes > 200ms, we are likely on a 
      // lower-end mobile device. Reduce depth for remaining branches to save battery 
      // and ensure responsiveness.
      const elapsed = performance.now() - start;
      if (elapsed > 200 && currentDepth > 3) {
        currentDepth--;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove || allMoves[0];
  }

  return allMoves[Math.floor(Math.random() * allMoves.length)];
};
