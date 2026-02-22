import React, { useState } from 'react';
import type { FC } from 'react';
import './GameButton.css';
// Import BOTH the Values (numbers) and the Colors (names)
import { NeonHueValues } from '../../types/neon-hues';
import type { NeonColor } from '../../types/neon-hues';

interface GameButtonProps {
  label: React.ReactNode;
  color?: string;
  onClick?: () => void;
  hue?: NeonColor;
  hoverHue?: NeonColor; // New optional prop for hover color
  width?: number;
  height?: number;
  padding?: number;
  className?: string;
  opacity?: number;
  fontSize?: number | string;
}

export const GameButton: FC<GameButtonProps> = ({
  label,
  color,
  onClick,
  hue, // no default value, optional
  hoverHue,
  width = 200,
  height = 50,
  padding = 10,
  className = '',
  opacity = 1.0,
  fontSize = 16
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Determine the current hue value to use
  // If hovered and hoverHue is provided, use it. Otherwise use base hue.
  const activeHueName = (isHovered && hoverHue) ? hoverHue : hue;
  const activeHueValue = activeHueName ? NeonHueValues[activeHueName] : undefined;

  // Only set --btn-hue if a valid hue is provided (not undefined or 'None')
  const buttonStyle = {
    ...(activeHueValue !== undefined ? { '--btn-hue': activeHueValue } : {}),
    color: color,
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    padding: padding ? `${padding}px` : undefined,
    opacity: opacity,
    // Logic: If it's a number, append 'px'. If it's a string (like '1.2rem'), use it directly.
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
  } as React.CSSProperties;

  /**
   * Handle click to toggle hover state for mobile touch support.
   * On touch devices, this ensures the hover color change still works.
   */
  const handleClick = () => {
    // Briefly trigger hover state for visual feedback on touch devices
    setIsHovered(true);
    onClick?.();
    // Reset after a short delay to allow the visual transition
    setTimeout(() => setIsHovered(false), 200);
  };

  return (
    <button
      className={`game-button${className ? ' ' + className : ''}`}
      onClick={handleClick}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 200)}
    >
      {label}
    </button>
  );
};