import React, { useState, useEffect } from 'react';
import { FallingEmojis } from './FallingEmojis';
import './GameOverModal.css';



import type { GameScores } from '../../utils/scoring';
import { COLOR_THEME_LABELS } from '../../utils/colorThemes';
import type { PlayerColorTheme } from '../../types/game';

interface GameOverModalProps {
  winner: 'red' | 'black' | 'draw';
  scores: GameScores;
  playerColor: PlayerColorTheme;
  onFadeComplete?: () => void;
}


const STAT_LABELS = {
  material: {
    name: 'Material',
    tooltip: 'Sum of all your pieces (regular = 3, king = 5).',
  },
  power: {
    name: 'Power',
    tooltip: 'Total value of your kings (each king = 5).',
  },
  strategy: {
    name: 'Strategy',
    tooltip: 'Mobility, advancement, center control, back rank, and support.',
  },
  total: {
    name: 'Total',
    tooltip: 'Sum of Material, Power, and Strategy.',
  },
} as const;

type StatKey = keyof typeof STAT_LABELS;
const STAT_KEYS: StatKey[] = ['material', 'power', 'strategy', 'total'];

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, scores, playerColor, onFadeComplete }) => {
  const isRedWin = winner === 'red';
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fading out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Notify parent when fade is complete (2s + 500ms fade animation)
    const completeTimer = setTimeout(() => {
      onFadeComplete?.();
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onFadeComplete]);

  const getMessage = () => {
    switch (winner) {
      case 'red': return 'Red Wins! 🎉';
      case 'black': return 'Black Wins!';
      case 'draw': return 'Game Drawn!';
      default: return 'Game Over';
    }
  };

  const titleClass = winner === 'red' ? 'red' : winner === 'black' ? 'black' : 'draw';

  return (
    <>
      {isRedWin && <FallingEmojis />}
      <div className={`game-over-overlay ${!isVisible ? 'fade-out' : ''}`}>
        <div className="game-over-content">
          <h2 className={`game-over-title ${titleClass}`}>{getMessage()}</h2>
          <p className="game-over-message">
            {winner === 'draw' ? 'No more moves possible.' : `Congratulations ${winner}!`}
          </p>
          <div className="gameover-stats-breakdown">
            <div className="gameover-stats-row">
              <div className="gameover-stats-player-label">
                {COLOR_THEME_LABELS[playerColor]} (You)
              </div>
              {STAT_KEYS.map((key) => (
                <div className="gameover-stat tooltip-container" key={key}>
                  <span className="gameover-stat-label">{STAT_LABELS[key].name}</span>
                  <span className="sidebar-tooltip">{STAT_LABELS[key].tooltip}</span>
                  <span className="gameover-stat-value">{scores.red[key].toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="gameover-stats-row">
              <div className="gameover-stats-player-label">
                Black (AI)
              </div>
              {STAT_KEYS.map((key) => (
                <div className="gameover-stat tooltip-container" key={key}>
                  <span className="gameover-stat-label">{STAT_LABELS[key].name}</span>
                  <span className="sidebar-tooltip">{STAT_LABELS[key].tooltip}</span>
                  <span className="gameover-stat-value">{scores.black[key].toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
