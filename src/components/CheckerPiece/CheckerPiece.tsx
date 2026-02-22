import React, { useRef, useEffect, useState } from 'react';
import type { FC } from 'react';
import './CheckerPiece.css';
import type { PlayerColorTheme } from '../../types/game';
import { getColorFilterCSS, COLOR_THEMES } from '../../utils/colorThemes';

// Import images from assets
import RedChecker from '../../assets/RedChecker.png';
import BlackChecker from '../../assets/BlackChecker.png';
import RedKing from '../../assets/RedKing.png';
import BlackKing from '../../assets/BlackKing.png';

export interface CheckerPieceProps {
  color: string;
  isKing: boolean;
  position: { row: number; col: number };
  isSelected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  colorTheme?: PlayerColorTheme;
}

export const CheckerPiece: FC<CheckerPieceProps> = ({
  color,
  isKing,
  isSelected,
  draggable,
  onDragStart,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  colorTheme,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dragImage, setDragImage] = useState<HTMLCanvasElement | HTMLImageElement | null>(null);

  // Select the appropriate PNG based on color and king status
  const getPieceImage = () => {
    if (isKing) {
      return color === 'red' ? RedKing : BlackKing;
    }
    return color === 'red' ? RedChecker : BlackChecker;
  };

  const pieceImage = getPieceImage();

  // Create colored canvas image for drag ghost when color theme changes
  useEffect(() => {
    if (!colorTheme || !imgRef.current || !canvasRef.current) {
      setDragImage(imgRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    if (!ctx) return;

    // Wait for image to load
    const createColoredDragImage = () => {
      canvas.width = 80;
      canvas.height = 80;

      // Apply the color filter using canvas
      const filter = COLOR_THEMES[colorTheme];
      ctx.filter = `hue-rotate(${filter.hueRotate}deg) saturate(${filter.saturate}) brightness(${filter.brightness})`;
      
      ctx.drawImage(img, 0, 0, 80, 80);
      
      // Reset filter
      ctx.filter = 'none';
      
      setDragImage(canvas);
    };

    if (img.complete) {
      createColoredDragImage();
    } else {
      img.onload = createColoredDragImage;
    }
  }, [colorTheme, pieceImage]);

  const classNames = [
    'checker-piece',
    isKing ? 'king' : '',
    isSelected ? 'selected' : '',
    draggable ? 'draggable' : ''
  ].filter(Boolean).join(' ');

  // Apply color filter if colorTheme is provided
  const colorFilterStyle = colorTheme ? { filter: getColorFilterCSS(colorTheme) } : {};

  const handleDragStart = (e: React.DragEvent) => {
    // Use the colored canvas or fallback to the original image
    if (dragImage) {
      try {
        // Set drag image with offset at center (40x40 is approx center of 80x80 piece)
        e.dataTransfer.setDragImage(dragImage, 40, 40);
      } catch (err) {
        // Silently fail if drag image can't be set - browser will use default
      }
    }

    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';

    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      className={classNames}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Visible piece */}
      <img
        src={pieceImage}
        alt={`${color} ${isKing ? 'king' : 'checker'}`}
        className="checker-piece"
        draggable={false}
        style={colorFilterStyle}
      />

      {/* Hidden image for drag ghost - preloaded and clean */}
      <img
        ref={imgRef}
        src={pieceImage}
        alt="drag-ghost"
        className="drag-ghost"
      />
      
      {/* Hidden canvas for colored drag image */}
      <canvas
        ref={canvasRef}
        className="drag-ghost"
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
// Only re-render if the piece's actual properties change
export const CheckerPieceMemo = React.memo<CheckerPieceProps>(CheckerPiece, (prev, next) => {
  return (
    prev.color === next.color &&
    prev.isKing === next.isKing &&
    prev.isSelected === next.isSelected &&
    prev.draggable === next.draggable &&
    prev.position.row === next.position.row &&
    prev.position.col === next.position.col &&
    prev.colorTheme === next.colorTheme
  );
});
