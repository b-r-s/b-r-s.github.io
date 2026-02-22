import { useCallback, useRef, useMemo } from 'react';
import type { BoardState, Move, Player, AILevel } from '../types/game';
import { findBestMove } from '../utils/aiLogic';

export const useAI = () => {
  const workerRef = useRef<Worker | null>(null);

  /**
   * Initializes or returns the existing Web Worker.
   */
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      // Vite special syntax for workers
      workerRef.current = new Worker(new URL('./minimax.worker.ts', import.meta.url), {
        type: 'module'
      });
    }
    return workerRef.current;
  }, []);

  /**
   * Asynchronously calculates the best move for the given board and player.
   */
  const getBestMoveAsync = useCallback((
    board: BoardState,
    player: Player,
    difficulty: AILevel = 'intermediate'
  ): Promise<Move | null> => {
    return new Promise((resolve) => {
      // 5-second safeguard timeout
      const timeoutId = setTimeout(() => {
        console.warn('AI Worker timed out (5s). Falling back to main thread.');
        resolve(findBestMove(board, player, difficulty));
      }, 5000);

      const worker = getWorker();

      // One-time listener for this specific request
      const handleMessage = (e: MessageEvent) => {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);

        if (e.data.error) {
          console.error('AI Worker error:', e.data.error);
          // Fallback to synchronous calculation on main thread if worker fails
          resolve(findBestMove(board, player, difficulty));
        } else {
          resolve(e.data.bestMove);
        }
      };

      const handleError = (e: ErrorEvent) => {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', handleMessage);
        worker.removeEventListener('error', handleError);
        console.error('AI Worker ErrorEvent:', e);
        // Fallback
        resolve(findBestMove(board, player, difficulty));
      };

      worker.addEventListener('message', handleMessage);
      worker.addEventListener('error', handleError);

      worker.postMessage({ board, player, difficulty });
    });
  }, [getWorker]);

  // Stable return object to prevent downstream re-renders or cleanup cycles
  return useMemo(() => ({ getBestMove: getBestMoveAsync }), [getBestMoveAsync]);
};
