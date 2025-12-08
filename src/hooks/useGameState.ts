import { useState, useCallback, useEffect, useRef } from 'react';
import type { BoardState, Position, GameState, Move, Player } from '../types/game';
import { useAI } from './useAI';
import { calculateScore } from '../utils/scoring';
import { playMoveSound, playJumpSound, playKingSound } from '../utils/sound';
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

export const useGameState = () => {
  /*
    Main state container for the game.
    We track everything here: the board, whose turn it is, scores, and time.
  */
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createInitialBoard(),
    currentPlayer: 'red',
    selectedPosition: null,
    validMoves: [],
    winner: null,
    gameMode: 'PvAI',
    isAiTurn: false,
    aiLevel: 'intermediate',
    scores: {
      red: { material: 0, power: 0, strategy: 0, total: 0 },
      black: { material: 0, power: 0, strategy: 0, total: 0 }
    },
    turnStartTime: Date.now(),
    totalTime: { red: 0, black: 0 },
  }));

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

  const { getBestMove } = useAI();

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

  const updateScores = useCallback((board: BoardState) => {
    const redScore = calculateScore(board, 'red');
    const blackScore = calculateScore(board, 'black');
    return { red: redScore, black: blackScore };
  }, []);

  // On first load, calculate the initial scores so the UI isn't empty.
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      scores: updateScores(prev.board)
    }));
  }, [updateScores]);

  // Clear the AI move highlight after the animation completes (1s animation + buffer)
  useEffect(() => {
    if (gameState.lastAIMove) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, lastAIMove: undefined }));
      }, 1200); // Slightly longer than the 1s animation

      return () => clearTimeout(timer);
    }
  }, [gameState.lastAIMove]);

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

      return {
        ...prevState,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPosition: lockPiece,
        validMoves: nextMoves,
        scores: updateScores(newBoard),
      };
    } else {
      // Turn ends here.
      setMultiJumpSource(null);
      const winner = checkGameOver(newBoard);
      return {
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
        lastAIMove: undefined
      };
    }
  }, [updateScores]);

  /*
    Logic for the AI's turn.
    If it's Black's turn and the game isn't over, we let the AI think for a second
    (to make it feel like a human opponent) and then execute its best move.
    
    FIXED: Removed gameState.board from dependencies to prevent race conditions.
  */
  useEffect(() => {
    if (
      gameState.gameMode === 'PvAI' &&
      gameState.currentPlayer === 'black' &&
      !gameState.winner &&
      !gameState.isAiTurn
    ) {
      setGameState(prev => ({ ...prev, isAiTurn: true }));

      const timer = setTimeout(() => {
        // Use functional update to always get the freshest state
        setGameState(prev => {
          const aiMove = getBestMove(prev.board, 'black', prev.aiLevel);

          if (aiMove) {
            // Check if this is a multi-jump sequence
            if (aiMove.isJump && aiMove.jumpSequence && aiMove.jumpSequence.length > 1) {
              // Multi-jump: animate each jump sequentially
              let currentBoard = prev.board;
              let currentPos = aiMove.from;
              let jumpIndex = 0;

              const executeNextJump = () => {
                if (jumpIndex >= aiMove.jumpSequence!.length) {
                  // All jumps complete, finalize the turn
                  const elapsed = Date.now() - prev.turnStartTime;
                  const winner = checkGameOver(currentBoard);

                  setGameState(prevState => ({
                    ...prevState,
                    board: currentBoard,
                    currentPlayer: 'red',
                    isAiTurn: false,
                    selectedPosition: null,
                    validMoves: [],
                    winner: winner,
                    scores: updateScores(currentBoard),
                    turnStartTime: Date.now(),
                    totalTime: { ...prevState.totalTime, black: prevState.totalTime.black + elapsed },
                    lastAIMove: undefined // Clear to avoid stale highlight
                  }));
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

                // Play jump sound
                playJumpSound();

                // Update state with this jump and show highlight
                currentBoard = newBoard;
                setGameState(prevState => ({
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
                setTimeout(executeNextJump, 1800); // 1.8s between jumps
              };

              // Start the jump sequence
              executeNextJump();

              // Return current state (will be updated by executeNextJump)
              return prev;

            } else {
              // Single move or single jump - execute immediately
              if (aiMove.isJump) playJumpSound();
              else playMoveSound();

              const newBoard = executeMove(prev.board, aiMove);

              // If the AI just got a King, celebrate it!
              const movedPiece = newBoard[aiMove.to.row][aiMove.to.col];
              if (movedPiece?.isKing && !prev.board[aiMove.from.row][aiMove.from.col]?.isKing) {
                playKingSound();
              }

              const elapsed = Date.now() - prev.turnStartTime;
              const winner = checkGameOver(newBoard);

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
                }
              };
            }
          } else {
            // If the AI has absolutely no moves left, Red wins by default.
            return { ...prev, winner: 'red', isAiTurn: false };
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.winner, getBestMove, updateScores]);

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

        return { ...prev, selectedPosition: { row, col }, validMoves: filteredMoves };
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

  const restartGame = useCallback(() => {
    setGameState(prev => ({
      board: createInitialBoard(),
      currentPlayer: 'red',
      selectedPosition: null,
      validMoves: [],
      winner: null,
      gameMode: prev.gameMode,
      isAiTurn: false,
      aiLevel: prev.aiLevel,
      scores: {
        red: { material: 0, power: 0, strategy: 0, total: 0 },
        black: { material: 0, power: 0, strategy: 0, total: 0 }
      },
      turnStartTime: Date.now(),
      totalTime: { red: 0, black: 0 },
    }));
    setMultiJumpSource(null);
    setToastMessage(null);
  }, []);

  return { gameState, handleTileClick, movePiece, setAILevel, restartGame, toastMessage };
};
