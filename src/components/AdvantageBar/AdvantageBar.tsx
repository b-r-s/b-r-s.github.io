import React from 'react';
import './AdvantageBar.css';
import type { PlayerColorTheme } from '../../types/game';
import type { GameScores } from '../../utils/scoring';

interface AdvantageBarProps {
  scores: GameScores;
  playerColor: PlayerColorTheme;
}

// Map player color themes to actual RGB colors for the gradient
const PLAYER_COLORS: Record<PlayerColorTheme, { light: string; dark: string; border: string }> = {
  red: { light: '#dc2626', dark: '#ef4444', border: '#fca5a5' },
  blue: { light: '#1d4ed8', dark: '#3b82f6', border: '#93c5fd' },
  green: { light: '#15803d', dark: '#22c55e', border: '#86efac' },
  purple: { light: '#7c3aed', dark: '#a855f7', border: '#d8b4fe' },
  orange: { light: '#ea580c', dark: '#f97316', border: '#fdba74' },
  pink: { light: '#db2777', dark: '#ec4899', border: '#fbcfe8' },
};

export const AdvantageBar: React.FC<AdvantageBarProps> = ({ scores, playerColor }) => {
  // Calculate the advantage percentage (0-100)
  // Use the total score from ScoreBreakdown
  const redTotal = scores.red.total;
  const blackTotal = scores.black.total;
  const totalScore = redTotal + blackTotal;
  const redPercentage = totalScore > 0 ? (redTotal / totalScore) * 100 : 50;

  // Calculate score difference to show who's ahead
  const scoreDiff = Math.abs(redTotal - blackTotal);
  const leader = redTotal > blackTotal ? 'red' : blackTotal > redTotal ? 'black' : 'even';

  const playerColors = PLAYER_COLORS[playerColor];

  return (
    <div className="advantage-bar-container">
      <div className="advantage-bar">
        <div
          className="advantage-fill-red"
          style={{
            '--fill-height': `${redPercentage}%`,
            '--fill-bg': `linear-gradient(to bottom, ${playerColors.light} 0%, ${playerColors.dark} 50%, ${playerColors.light} 100%)`,
          } as React.CSSProperties}
        />
        <div
          className="advantage-fill-black"
          style={{ '--fill-height': `${100 - redPercentage}%` } as React.CSSProperties}
        />
      </div>

      {leader !== 'even' && (
        <div
          className={`advantage-indicator ${leader}`}
          style={leader === 'red' ? {
            '--indicator-border': playerColors.dark,
            '--indicator-color': playerColors.border,
          } as React.CSSProperties : undefined}
        >
          {scoreDiff > 0 && `+${Math.round(scoreDiff)}`}
        </div>
      )}
    </div>
  );
};
