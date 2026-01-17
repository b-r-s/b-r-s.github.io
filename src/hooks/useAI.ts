import { useCallback } from 'react';
import { calculateScore } from '../utils/scoring';
import { MINIMAX_DEPTH, TERMINAL_SCORE } from '../utils/constants';
import type { BoardState, Move, Player } from '../types/game';
import { getAllValidMoves, executeMove } from '../utils/gameLogic';

/*
  A helper to figure out "how good is this board state for me?"
  It just subtracts the opponent's score from our score.
  Positive = Good for us. Negative = Good for them.
*/
const evaluateBoard = (board: BoardState, player: Player): number => {
  const score = calculateScore(board, player);
  const opponent = player === 'red' ? 'black' : 'red';
  const opponentScore = calculateScore(board, opponent);

  return score.total - opponentScore.total;
};

/*
  The Minimax Algorithm!
  This is how the 'Advanced' AI thinks ahead.
  It simulates moves, then simulates the opponent's best response, then OUR response to that...
  down to a certain 'depth' (how many turns ahead).
  
  'alpha' and 'beta' are used for pruning - basically, if the AI finds a move that is
  already worse than a move it found earlier, it stops checking that path to save time.
*/
const minimax = (
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
    // If maximizing player is stuck, they lose (bad score).
    // If minimizing player (opponent) is stuck, we win (good score).
    return maximizingPlayer ? -TERMINAL_SCORE : TERMINAL_SCORE;
  }

  if (maximizingPlayer) {
    // We want the HIGHEST score possible.
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = executeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, player);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);

      // Pruning: If beta <= alpha, the opponent will never let us get here, so stop looking.
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    // Opponent wants the LOWEST score possible (best for them, worst for us).
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = executeMove(board, move);
      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, player);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);

      if (beta <= alpha) break;
    }
    return minEval;
  }
};

export const useAI = () => {
  const getBestMove = useCallback((
    board: BoardState,
    player: Player,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): Move | null => {

    // First, let's see what is actually LEGAL to do.
    // This function already handles the "Mandatory Jump" rule for us.
    const allMoves = getAllValidMoves(board, player);

    if (allMoves.length === 0) {
      return null; // I guess I'll die.
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

    // ADVANCED: The big brain mode.
    if (difficulty === 'advanced') {
      let bestMove: Move | null = null;
      let bestScore = -Infinity;

      for (const move of allMoves) {
        // Run a simulation of this move...
        const newBoard = executeMove(board, move);

        // ...and see several turns into the future.
        const score = minimax(newBoard, MINIMAX_DEPTH, -Infinity, Infinity, false, player);

        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      // If for some reason everything is terrible, just pick the first valid move.
      return bestMove || allMoves[0];
    }

    // Default fallback
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }, []);

  return { getBestMove };
};
