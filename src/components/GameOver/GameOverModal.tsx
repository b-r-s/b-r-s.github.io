import React from 'react';
import { FallingEmojis } from './FallingEmojis';
import './GameOverModal.css';
import BlackKing from '../../assets/BlackKing.png';



import type { GameScores } from '../../utils/scoring';
import { COLOR_THEME_LABELS } from '../../utils/colorThemes';
import type { PlayerColorTheme } from '../../types/game';

interface GameOverModalProps {
  winner: 'red' | 'black' | 'draw';
  scores: GameScores;
  playerColor: PlayerColorTheme;
  onNewGame: () => void;
  onExit: () => void;
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

const HUMAN_COLOR_HEX: Record<PlayerColorTheme, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
};

const HUMAN_COLOR_NAME: Record<PlayerColorTheme, string> = {
  red: 'Red',
  blue: 'Blue',
  green: 'Green',
  purple: 'Purple',
  orange: 'Orange',
  pink: 'Pink',
};

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, scores, playerColor, onNewGame, onExit }) => {
  const isRedWin = winner === 'red';
  const humanColorLabel = COLOR_THEME_LABELS[playerColor];
  const humanColorName = HUMAN_COLOR_NAME[playerColor];
  const humanColorHex = HUMAN_COLOR_HEX[playerColor];

  const winnerLabel = winner === 'red'
    ? `${humanColorName} (You)`
    : winner === 'black'
      ? 'Black (AI)'
      : 'Draw';

  const getMessage = () => {
    switch (winner) {
      case 'red': return `${humanColorName} Wins!`;
      case 'black': return 'Black Wins!';
      case 'draw': return 'Game Drawn!';
      default: return 'Game Over';
    }
  };

  const humanLabelForStats = humanColorLabel.replace(/^[^\s]+\s+/, '');

  return (
    <>
      {isRedWin && <FallingEmojis />}
      <div className="game-over-overlay">
        <div className="game-over-content" style={{ ['--human-win-color' as string]: humanColorHex }}>
          <div className="game-over-winner-panel">
            <div className="winner-color-badge" aria-hidden="true">●</div>
            <h2 className="game-over-title">{getMessage()}</h2>
            <img src={BlackKing} alt="Black King" className="winner-king-image" />
          </div>
          <p className="game-over-message">
            {winner === 'draw' ? 'No more moves possible.' : `Congratulations ${winnerLabel}!`}
          </p>
          <div className="gameover-stats-breakdown">
            <div className="gameover-player-block">
              <div className="gameover-stats-player-label">
                {humanLabelForStats} (You)
              </div>
              <div className="gameover-stats-row">
                {STAT_KEYS.map((key) => (
                  <div className="gameover-stat tooltip-container" key={key}>
                    <span className="gameover-stat-label">{STAT_LABELS[key].name}</span>
                    <span className="sidebar-tooltip">{STAT_LABELS[key].tooltip}</span>
                    <span className="gameover-stat-value">{scores.red[key].toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="gameover-player-block">
              <div className="gameover-stats-player-label">
                Black (AI)
              </div>
              <div className="gameover-stats-row">
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
          <div className="game-over-actions">
            <button className="play-again-btn" onClick={onNewGame}>
              New Game
            </button>
            <button className="exit-game-btn" onClick={onExit}>
              Exit to Pi Browser
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
