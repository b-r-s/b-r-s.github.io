import React, { useState, useMemo } from 'react';
import './Board.css';
import { CheckerPieceMemo as CheckerPiece } from '../CheckerPiece';
import { getValidMovesForPiece } from '../../utils/gameLogic';
import type { GameState, PlayerColorTheme } from '../../types/game';
import { GameOverModal } from '../GameOver/GameOverModal';
import { AdvantageBar } from '../AdvantageBar';

export interface BoardProps {
  gameState: GameState;
  onTileClick: (row: number, col: number) => void;
  onMovePiece: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  onRestart: () => void;
  onClearUndoHighlight: () => void;
  toastMessage: string | null;
  playerColor: PlayerColorTheme;
  onModalFadeComplete?: () => void;
}

export const Board: React.FC<BoardProps> = ({ gameState, onTileClick, onMovePiece, onClearUndoHighlight, toastMessage, playerColor, onModalFadeComplete }) => {
  const { board, selectedPosition, validMoves, lastAIMove, lastUndoMove, winner } = gameState;
  const [draggingPos, setDraggingPos] = useState<{ row: number; col: number } | null>(null);
  const [hoveredSquare, setHoveredSquare] = useState<{ row: number; col: number } | null>(null);
  const [pieceHovered, setPieceHovered] = useState<{ row: number; col: number } | null>(null);
  const [hoverValidMoves, setHoverValidMoves] = useState<any[]>([]);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Show modal when game ends
  React.useEffect(() => {
    if (winner) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [winner]);

  // Clear undo move highlight after animation
  React.useEffect(() => {
    if (lastUndoMove) {
      const timer = setTimeout(() => {
        onClearUndoHighlight();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [lastUndoMove, onClearUndoHighlight]);

  // Performance optimization: create a Set for O(1) lookup instead of O(n) array.some()
  const validMoveMap = useMemo(() => {
    const map = new Set<string>();
    validMoves.forEach(m => map.add(`${m.to.row},${m.to.col}`));
    return map;
  }, [validMoves]);

  const hoverValidMoveMap = useMemo(() => {
    const map = new Set<string>();
    hoverValidMoves.forEach(m => map.add(`${m.to.row},${m.to.col}`));
    return map;
  }, [hoverValidMoves]);

  // AI Jump Trail lookup Sets for O(1) performance
  const aiTrailStartKey = useMemo(() => {
    const trail = lastAIMove?.trail;
    return trail ? `${trail.startSquare.row},${trail.startSquare.col}` : null;
  }, [lastAIMove?.trail]);

  const aiTrailCapturedMap = useMemo(() => {
    const map = new Set<string>();
    lastAIMove?.trail?.capturedSquares.forEach(pos => map.add(`${pos.row},${pos.col}`));
    return map;
  }, [lastAIMove?.trail]);

  const aiTrailLandingMap = useMemo(() => {
    const map = new Set<string>();
    lastAIMove?.trail?.landingSquares.forEach(pos => map.add(`${pos.row},${pos.col}`));
    return map;
  }, [lastAIMove?.trail]);

  const aiTrailPathMap = useMemo(() => {
    // Map of squareKey to an array of objects describing each segment on that square
    const map = new Map<string, { grad: string; size: string; pos: string }[]>();
    const trail = lastAIMove?.trail;
    if (!trail) return map;

    const fullSequence = [trail.startSquare, ...trail.landingSquares];

    // Gradient definitions matching corrected CSS angles for perpendicular isolines
    // ur/dl movements are / lines; ul/dr movements are \ lines.
    const angles: Record<string, string> = {
      'ur': '135deg', 'dl': '135deg',
      'ul': '45deg', 'dr': '45deg'
    };

    const addSegment = (key: string, grad: string, size: string, pos: string) => {
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ grad, size, pos });
    };

    for (let i = 0; i < fullSequence.length - 1; i++) {
      const from = fullSequence[i];
      const to = fullSequence[i + 1];

      const dr = to.row > from.row ? 1 : -1;
      const dc = to.col > from.col ? 1 : -1;

      const rowDirChar = dr > 0 ? 'd' : 'u';
      const colDirChar = dc > 0 ? 'r' : 'l';
      const dirKey = `${rowDirChar}${colDirChar}`;
      const angle = angles[dirKey];
      const grad = `linear-gradient(${angle}, transparent 30%, rgba(147, 51, 234, 0.4) 42%, #9333ea 50%, rgba(147, 51, 234, 0.4) 58%, transparent 70%)`;

      // 1. Source Square: needs OUTGOING line from center to the direction corner
      const outPos = `${rowDirChar === 'u' ? 'top' : 'bottom'} ${colDirChar === 'r' ? 'right' : 'left'}`;
      addSegment(`${from.row},${from.col}`, grad, '50% 50%', outPos);

      // 2. Intermediate (Captured) Square: needs FULL line through the square
      const midRow = (from.row + to.row) / 2;
      const midCol = (from.col + to.col) / 2;
      addSegment(`${midRow},${midCol}`, grad, '100% 100%', 'center');

      // 3. Target (Landing) Square: needs INCOMING line from the origin-direction corner to center
      // The incoming quadrant is opposite to the movement direction.
      const inRowDirChar = dr > 0 ? 'u' : 'd';
      const inColDirChar = dc > 0 ? 'l' : 'r';
      const inPos = `${inRowDirChar === 'u' ? 'top' : 'bottom'} ${inColDirChar === 'r' ? 'right' : 'left'}`;
      addSegment(`${to.row},${to.col}`, grad, '50% 50%', inPos);
    }
    return map;
  }, [lastAIMove?.trail]);

  // Create a Set of jump landing positions for beginner jump hints
  // Shows target emoji on ALL landing squares in jump sequence (including multi-jumps)
  const jumpLandingMap = useMemo(() => {
    const map = new Set<string>();
    if (gameState.aiLevel === 'beginner' && gameState.currentPlayer === 'red') {
      if (selectedPosition) {
        // Show landing targets for the selected piece's jumps (all squares in sequence)
        validMoves.forEach(move => {
          if (move.isJump) {
            // For multi-jumps, mark all intermediate landing positions
            if (move.jumpSequence && move.jumpSequence.length > 0) {
              move.jumpSequence.forEach(pos => {
                map.add(`${pos.row},${pos.col}`);
              });
            } else {
              // Single jump - mark the final position
              map.add(`${move.to.row},${move.to.col}`);
            }
          }
        });
      } else {
        // Show all possible jump landing squares (forced jump scenario)
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece?.color === 'red') {
              // Check if this piece has any jump moves available
              const pieceJumps = getValidMovesForPiece(gameState.board, piece, { row, col });
              pieceJumps.forEach(move => {
                if (move.isJump) {
                  // Mark all squares in jump sequence
                  if (move.jumpSequence && move.jumpSequence.length > 0) {
                    move.jumpSequence.forEach(pos => {
                      map.add(`${pos.row},${pos.col}`);
                    });
                  } else {
                    map.add(`${move.to.row},${move.to.col}`);
                  }
                }
              });
            }
          }
        }
      }
    }
    return map;
  }, [validMoves, gameState.aiLevel, gameState.currentPlayer, gameState.board, selectedPosition]);

  const onDragStart = (row: number, col: number) => {
    // Select the piece so valid moves are calculated
    onTileClick(row, col);
    setDraggingPos({ row, col });
    setPieceHovered(null); // Clear hover glow when dragging starts
    setHoverValidMoves([]); // Clear hover moves
  };

  const onDrop = (row: number, col: number) => {
    if (draggingPos) {
      // Check if target is a valid move
      const isValid = validMoves.some(
        (move) => move.to.row === row && move.to.col === col && move.from.row === draggingPos.row && move.from.col === draggingPos.col
      );

      if (isValid) {
        onMovePiece(draggingPos, { row, col });
      }
    }
    setDraggingPos(null);
    setHoveredSquare(null);
  };

  const onDragEnd = () => {
    setDraggingPos(null);
    setHoveredSquare(null);
    setPieceHovered(null);
    setHoverValidMoves([]);
  };

  const onDragOver = (e: React.DragEvent, row: number, col: number) => {
    // Always prevent default to allow drop on the element (makes the whole square a drop zone)
    e.preventDefault();

    // Update hovered square for highlighting
    if (draggingPos && (hoveredSquare?.row !== row || hoveredSquare?.col !== col)) {
      setHoveredSquare({ row, col });
    }

    if (draggingPos) {
      const isValid = validMoves.some(
        (move) => move.to.row === row && move.to.col === col && move.from.row === draggingPos.row && move.from.col === draggingPos.col
      );

      // Only show "move" cursor if it's a valid move
      if (isValid) {
        e.dataTransfer.dropEffect = "move";
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    }
  };

  const onDragEnter = () => {
    // We handle hover highlighting in onDragOver for better reliability
  };

  const onMouseEnter = (row: number, col: number) => {
    if (!draggingPos) {
      const piece = board[row][col];
      // Only allow hover effects for the current player's pieces
      if (piece && piece.color === gameState.currentPlayer) {
        setPieceHovered({ row, col });
        // Calculate valid moves for this piece to show hints
        const moves = getValidMovesForPiece(board, piece, { row, col });
        setHoverValidMoves(moves);
      } else {
        setPieceHovered(null);
        setHoverValidMoves([]);
      }
    }
  };

  const onMouseLeave = () => {
    if (!draggingPos) {
      setPieceHovered(null);
      setHoverValidMoves([]);
    }
  };

  // Touch event handlers for mobile support
  const onTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });

    const piece = board[row][col];
    if (piece && piece.color === gameState.currentPlayer) {
      // Show valid moves on touch
      onTileClick(row, col);
      setDraggingPos({ row, col });
      setPieceHovered({ row, col });
      const moves = getValidMovesForPiece(board, piece, { row, col });
      setHoverValidMoves(moves);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!draggingPos || !touchStartPos) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.classList.contains('board-square')) {
      const dataKey = element.getAttribute('data-position');
      if (dataKey) {
        const [row, col] = dataKey.split('-').map(Number);
        if (hoveredSquare?.row !== row || hoveredSquare?.col !== col) {
          setHoveredSquare({ row, col });
        }
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!draggingPos || !touchStartPos) {
      setDraggingPos(null);
      setHoveredSquare(null);
      setPieceHovered(null);
      setHoverValidMoves([]);
      return;
    }

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element && element.classList.contains('board-square')) {
      const dataKey = element.getAttribute('data-position');
      if (dataKey) {
        const [row, col] = dataKey.split('-').map(Number);
        const isValid = validMoves.some(
          (move) => move.to.row === row && move.to.col === col &&
            move.from.row === draggingPos.row && move.from.col === draggingPos.col
        );

        if (isValid) {
          onMovePiece(draggingPos, { row, col });
        }
      }
    }

    setDraggingPos(null);
    setHoveredSquare(null);
    setTouchStartPos(null);
    setPieceHovered(null);
    setHoverValidMoves([]);
  };

  const onTouchCancel = () => {
    setDraggingPos(null);
    setHoveredSquare(null);
    setTouchStartPos(null);
    setPieceHovered(null);
    setHoverValidMoves([]);
  };

  return (
    <div className="board-container">
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}
      {showModal && winner && (
        <GameOverModal
          winner={winner}
          scores={gameState.scores}
          playerColor={playerColor}
          onFadeComplete={() => {
            setShowModal(false);
            onModalFadeComplete?.();
          }}
        />
      )}
      <div className="board-with-advantage">
        <div className="checkerboard">
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isDark = (rowIndex + colIndex) % 2 === 1;

              // Check if this square is selected (clicked)
              const isSelected = selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex;

              // Check if this square is the source of the current drag
              const isDragSource = draggingPos?.row === rowIndex && draggingPos?.col === colIndex;

              // Check if this square is a valid move target for the selected piece
              const isValidMove = validMoveMap.has(`${rowIndex},${colIndex}`);

              // Check if this square is a valid move target for the hovered piece
              const isHoverValidMove = hoverValidMoveMap.has(`${rowIndex},${colIndex}`);

              const isCurrentPlayerPiece = piece?.color === gameState.currentPlayer;

              // Determine if this square should glow
              // 1. It's the piece being hovered
              const isPieceHovered = pieceHovered?.row === rowIndex && pieceHovered?.col === colIndex;

              // 2. It's a valid target for the dragged piece and we're hovering over it
              const isValidHovered = draggingPos && hoveredSquare?.row === rowIndex && hoveredSquare?.col === colIndex && isValidMove;

              // 3. It's the source of the drag (gold border)
              const showGoldBorder = isDragSource || (isValidHovered);

              // Check if this square is part of the last AI move
              const isAIMoveSquare = lastAIMove && (
                (lastAIMove.from.row === rowIndex && lastAIMove.from.col === colIndex) ||
                (lastAIMove.to.row === rowIndex && lastAIMove.to.col === colIndex)
              );

              // Check if this square is part of the last undo move
              const isUndoMoveSquare = lastUndoMove && (
                (lastUndoMove.from.row === rowIndex && lastUndoMove.from.col === colIndex) ||
                (lastUndoMove.to.row === rowIndex && lastUndoMove.to.col === colIndex)
              );

              // Check if this square is a jump landing target (beginner hint)
              const isJumpLanding = jumpLandingMap.has(`${rowIndex},${colIndex}`);

              // AI Jump Trail visualization
              const squareKey = `${rowIndex},${colIndex}`;
              const isAITrailStart = aiTrailStartKey === squareKey;
              const isAITrailCaptured = aiTrailCapturedMap.has(squareKey);
              const isAITrailLanding = aiTrailLandingMap.has(squareKey);

              const segments = aiTrailPathMap.get(squareKey);
              const stackedGradients = segments ? segments.map(s => s.grad).join(', ') : '';
              const stackedSizes = segments ? segments.map(s => s.size).join(', ') : '';
              const stackedPositions = segments ? segments.map(s => s.pos).join(', ') : '';

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  data-position={`${rowIndex}-${colIndex}`}
                  className={`
                  board-square 
                  ${isDark ? 'dark' : 'light'} 
                  ${isValidMove ? 'valid-move' : ''} 
                  ${isHoverValidMove && !draggingPos ? 'hover-valid-move' : ''}
                  ${isSelected ? 'selected' : ''} 
                  ${showGoldBorder ? 'gold-border' : ''}
                  ${isPieceHovered ? 'piece-hovered' : ''}
                  ${isAIMoveSquare ? 'ai-move-highlight' : ''}
                  ${isUndoMoveSquare ? 'undo-move-highlight' : ''}
                  ${isAITrailStart ? 'ai-trail-start' : ''}
                  ${isAITrailCaptured ? 'ai-trail-captured' : ''}
                  ${isAITrailLanding ? 'ai-trail-landing' : ''}
                `}
                  onClick={() => onTileClick(rowIndex, colIndex)}
                  onDragOver={(e) => onDragOver(e, rowIndex, colIndex)}
                  onDrop={() => onDrop(rowIndex, colIndex)}
                  onDragEnter={onDragEnter}
                  onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                  onMouseLeave={onMouseLeave}
                  onTouchStart={(e) => onTouchStart(e, rowIndex, colIndex)}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onTouchCancel={onTouchCancel}
                >
                  {stackedGradients && (
                    <div
                      className="trail-path-overlay"
                      style={{
                        backgroundImage: stackedGradients,
                        backgroundSize: stackedSizes,
                        backgroundPosition: stackedPositions
                      }}
                    />
                  )}
                  {/* Highlight marker for valid moves (either selected or hovered) handled by CSS ::after */}

                  {/* Beginner jump hint - shows target on landing square */}
                  {isJumpLanding && (
                    <div className="jump-hint-arrow">🎯</div>
                  )}

                  {piece && (
                    <CheckerPiece
                      color={piece.color}
                      isKing={piece.isKing}
                      position={{ row: rowIndex, col: colIndex }}
                      isSelected={isSelected}
                      draggable={isCurrentPlayerPiece}
                      onDragStart={() => onDragStart(rowIndex, colIndex)}
                      onDragEnd={onDragEnd}
                      colorTheme={piece.color === 'red' ? playerColor : undefined}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
        <AdvantageBar scores={gameState.scores} playerColor={playerColor} />
      </div>
    </div>
  );
};
