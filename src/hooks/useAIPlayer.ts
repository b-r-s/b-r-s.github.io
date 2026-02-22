import { useEffect, useMemo, useRef } from 'react';
import type { GameState, BoardState, Player } from '../types/game';
import { useAI } from './useAI';
import { executeMove, checkGameOver } from '../utils/gameLogic';
import { playKingSound, playAIMoveSound, playAIJumpSound } from '../utils/sound';
import { calculateScore } from '../utils/scoring';

interface AIPlayerOptions {
  gameState: GameState;
  onStateUpdate: (updater: (prev: GameState) => GameState) => void;
  onGameEnd?: (winner: Player | 'draw', moveCount: number) => void;
}

/**
 * Custom hook that manages AI player behavior.
 * Handles AI turn logic, move execution, and multi-jump sequences.
 */
export const useAIPlayer = ({ gameState, onStateUpdate, onGameEnd }: AIPlayerOptions) => {
  const { getBestMove } = useAI();
  const processingRef = useRef(false);

  // Memoize score calculation function to avoid recreating on every render
  const updateScores = useMemo(() => {
    return (board: BoardState) => {
      const redScore = calculateScore(board, 'red');
      const blackScore = calculateScore(board, 'black');
      return { red: redScore, black: blackScore };
    };
  }, []);

  useEffect(() => {
    // Only run AI logic when it's AI's turn
    if (
      gameState.gameMode === 'PvAI' &&
      gameState.currentPlayer === 'black' &&
      !gameState.winner &&
      !gameState.isAiTurn &&
      !processingRef.current
    ) {
      // Mark AI turn as active and set processing flag
      processingRef.current = true;
      onStateUpdate(prev => ({ ...prev, isAiTurn: true }));

      // Add a delay to make AI feel more human-like
      const timer = setTimeout(async () => {
        // Fetch the best move asynchronously before updating state
        const aiMove = await getBestMove(gameState.board, 'black', gameState.aiLevel);

        if (!aiMove) {
          // No valid moves - player wins
          onStateUpdate(prev => ({ ...prev, winner: 'red', isAiTurn: false }));
          processingRef.current = false;
          return;
        }

        // Check if this is a multi-jump sequence
        if (aiMove.isJump && aiMove.jumpSequence && aiMove.jumpSequence.length > 1) {
          // Handle multi-jump: animate each jump sequentially
          let currentBoard = gameState.board;
          let currentPos = aiMove.from;
          let jumpIndex = 0;

          const executeNextJump = () => {
            if (jumpIndex >= aiMove.jumpSequence!.length) {
              // All jumps complete, finalize the turn
              onStateUpdate(prev => {
                const elapsed = Date.now() - prev.turnStartTime;
                const winner = checkGameOver(currentBoard);
                const newMoveCount = prev.moveCount + 1;

                // Notify parent if game ended
                if (winner && onGameEnd) {
                  onGameEnd(winner, newMoveCount);
                }

                // Add to move history for beginner level
                const newMoveHistory = prev.aiLevel === 'beginner' ? [
                  ...prev.moveHistory,
                  {
                    move: aiMove,
                    boardBefore: prev.board,
                    scoresBefore: prev.scores,
                    playerBefore: prev.currentPlayer,
                    timeBefore: {
                      turnStartTime: prev.turnStartTime,
                      totalTime: prev.totalTime
                    }
                  }
                ] : prev.moveHistory;

                return {
                  ...prev,
                  board: currentBoard,
                  currentPlayer: 'red',
                  isAiTurn: false,
                  selectedPosition: null,
                  validMoves: [],
                  winner: winner,
                  scores: updateScores(currentBoard),
                  turnStartTime: Date.now(),
                  totalTime: { ...prev.totalTime, black: prev.totalTime.black + elapsed },
                  lastAIMove: undefined,
                  moveHistory: newMoveHistory,
                  moveCount: newMoveCount,
                };
              });
              processingRef.current = false;
              return;
            }

            const landingPos = aiMove.jumpSequence![jumpIndex];

            // Calculate the jumped piece position
            const jumpedRow = (currentPos.row + landingPos.row) / 2;
            const jumpedCol = (currentPos.col + landingPos.col) / 2;

            // Execute this single jump
            const newBoard = currentBoard.map(r => [...r]);
            const piece = { ...newBoard[currentPos.row][currentPos.col]! };

            // Remove jumped piece
            newBoard[jumpedRow][jumpedCol] = null;

            // Move the piece
            newBoard[landingPos.row][landingPos.col] = piece;
            newBoard[currentPos.row][currentPos.col] = null;

            // Check for king promotion
            if (!piece.isKing) {
              if (piece.color === 'black' && landingPos.row === 7) {
                piece.isKing = true;
                newBoard[landingPos.row][landingPos.col] = piece;
                playKingSound();
              }
            }

            // Play AI jump sound
            playAIJumpSound();

            // Update state with this jump and show highlight
            currentBoard = newBoard;
            onStateUpdate(prevState => ({
              ...prevState,
              board: currentBoard,
              scores: updateScores(currentBoard),
              lastAIMove: {
                from: currentPos,
                to: landingPos,
                timestamp: Date.now()
              }
            }));

            currentPos = landingPos;
            jumpIndex++;

            // Schedule next jump after delay
            setTimeout(executeNextJump, 2500);
          };

          // Start the jump sequence
          executeNextJump();

        } else {
          // Single move or single jump - execute immediately
          if (aiMove.isJump) playAIJumpSound();
          else playAIMoveSound();

          onStateUpdate(prev => {
            const newBoard = executeMove(prev.board, aiMove);

            // Check for king promotion
            const movedPiece = newBoard[aiMove.to.row][aiMove.to.col];
            if (movedPiece?.isKing && !prev.board[aiMove.from.row][aiMove.from.col]?.isKing) {
              playKingSound();
            }

            const elapsed = Date.now() - prev.turnStartTime;
            const winner = checkGameOver(newBoard);
            const newMoveCount = prev.moveCount + 1;

            // Notify parent if game ended
            if (winner && onGameEnd) {
              onGameEnd(winner, newMoveCount);
            }

            // Add to move history for beginner level
            const newMoveHistory = prev.aiLevel === 'beginner' ? [
              ...prev.moveHistory,
              {
                move: aiMove,
                boardBefore: prev.board,
                scoresBefore: prev.scores,
                playerBefore: prev.currentPlayer,
                timeBefore: {
                  turnStartTime: prev.turnStartTime,
                  totalTime: prev.totalTime
                }
              }
            ] : prev.moveHistory;

            return {
              ...prev,
              board: newBoard,
              currentPlayer: 'red',
              isAiTurn: false,
              selectedPosition: null,
              validMoves: [],
              winner: winner,
              scores: updateScores(newBoard),
              turnStartTime: Date.now(),
              totalTime: { ...prev.totalTime, black: prev.totalTime.black + elapsed },
              lastAIMove: {
                from: aiMove.from,
                to: aiMove.to,
                timestamp: Date.now()
              },
              moveHistory: newMoveHistory,
              moveCount: newMoveCount,
            };
          });
          processingRef.current = false;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.winner, gameState.isAiTurn, getBestMove, onStateUpdate, onGameEnd, updateScores]);
};
