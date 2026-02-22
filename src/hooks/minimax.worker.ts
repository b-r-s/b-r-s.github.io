import { findBestMove } from '../utils/aiLogic';
import type { BoardState, Player, AILevel } from '../types/game';

/**
 * Web Worker for Minimax AI. 
 * This offloads heavy computation from the main UI thread.
 */
self.onmessage = (e: MessageEvent<{ board: BoardState, player: Player, difficulty: AILevel }>) => {
  const { board, player, difficulty } = e.data;

  try {
    const bestMove = findBestMove(board, player, difficulty);
    self.postMessage({ bestMove });
  } catch (error) {
    // In case of error in the worker, we don't want the UI thread to hang forever.
    self.postMessage({ error: (error as Error).message });
  }
};
