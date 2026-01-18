import { useState, useEffect } from 'react';
import './Sidebar.css';
import type { AILevel, Player, PlayerColorTheme, BoardColorTheme } from '../../types/game';
import type { ScoreBreakdown } from '../../utils/scoring';
import type { GameSettings } from '../../hooks/useSettings';
import { COLOR_THEME_LABELS, BOARD_THEME_LABELS, BOARD_COLOR_SCHEMES } from '../../utils/colorThemes';

export interface SidebarProps {
  aiLevel: AILevel;
  onAILevelChange: (level: AILevel) => void;
  scores: { red: ScoreBreakdown; black: ScoreBreakdown };
  currentPlayer: Player;
  turnStartTime: number;
  totalTime: { red: number; black: number };
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  showPlayAgain?: boolean;
  onPlayAgain?: () => void;
  canUndo?: boolean;
  onUndo?: () => void;
  logo?: string;
  gameInProgress?: boolean;
}

// Helper to format milliseconds to MM:SS
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function Sidebar({
  aiLevel,
  onAILevelChange,
  scores,
  currentPlayer,
  turnStartTime,
  totalTime,
  settings,
  onSettingsChange,
  showPlayAgain,
  onPlayAgain,
  canUndo,
  onUndo,
  logo,
  gameInProgress
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'colors' | 'board'>('game');
  const [currentMoveTime, setCurrentMoveTime] = useState(0);

  // Get winner from scores if available (winner is set when total is not 0 and the other is 0 or game is over)
  // Actually, we need to know if the game is over. We'll infer from totalTime: if both timers are not running and showPlayAgain is true, stop timer.
  const gameOver = showPlayAgain;

  // Update current move timer every 100ms, but stop if game is over
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setCurrentMoveTime(Date.now() - turnStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [turnStartTime, gameOver]);


  // Stat labels and tooltips (match GameOverModal)
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

  // Map playerColor to emoji for display
  // No emoji needed, use CSS circle for color indicator

  const renderPlayerScore = (player: Player) => {
    const isActive = currentPlayer === player;
    const score = scores[player];
    const playerTotalTime = totalTime[player];
    const moveTime = isActive ? currentMoveTime : 0;
    const colorClass = player === 'red' ? 'text-red' : 'text-black';
    const isAI = player === 'black' ? true : false;

    // Dynamic label and emoji for human player
    let label = '';
    let colorClassName = '';
    if (player === 'red') {
      label = `${COLOR_THEME_LABELS[settings.playerColor].replace(/^[^ ]+ /, '')} (You)`; // Remove emoji from label
      colorClassName = `color-indicator color-${settings.playerColor}`;
    } else {
      label = 'Black (AI)';
      colorClassName = 'color-indicator color-black';
    }

    return (
      <div className={`player-score-card ${isActive ? 'active' : ''}`}>
        <div className="card-header">
          <span className="player-name">
            <span className={colorClassName}></span>
            <span className={colorClass}>{label}</span>
            {isAI && <span className="ai-difficulty-label"> {aiLevel.charAt(0).toUpperCase() + aiLevel.slice(1)}</span >}
            {isActive && <span className="animate-pulse">⏱️</span>}
          </span>
        </div>
        <div className="sidebar-stat-breakdown">
          {STAT_KEYS.map((key) => (
            <div className="sidebar-stat" key={key}>
              <span className="sidebar-stat-label tooltip-container">
                {STAT_LABELS[key].name}
                <span className="sidebar-tooltip">{STAT_LABELS[key].tooltip}</span>
              </span>
              <span className="sidebar-stat-value">{score[key].toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="timer-row">
          <span>Move: {isActive ? formatTime(moveTime) : '--:--'}</span>
          <span>Total: {formatTime(playerTotalTime)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="sidebar">
      {/* Tabs */}
      <div className="sidebar-tabs" style={{ position: 'relative' }}>
        <button
          className={`sidebar-tab ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          Stats
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          AI
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          Pieces
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          Board
        </button>

        {/* Play Again Overlay */}
        {showPlayAgain && (
          <button
            className="play-again-overlay-btn"
            onClick={onPlayAgain}
          >
            Play Again
          </button>
        )}
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'game' ? (
          <>
            <div className="sidebar-header-with-logo">
              {logo && <img src={logo} alt="Checkers4Pi Logo" className="sidebar-logo" />}
              <h2 className="sidebar-title">Current Match</h2>
            </div>
            <div className="match-stats-container">
              {renderPlayerScore('red')}
              {renderPlayerScore('black')}
            </div>

            {/* Undo Move Button - Only for Beginner Level */}
            {canUndo && (
              <button
                className="undo-move-btn"
                onClick={onUndo}
                title="Undo the last move (both yours and AI's)"
              >
                ⟲ Undo Move
              </button>
            )}
          </>
        ) : activeTab === 'settings' ? (
          <>
            <h2 className="sidebar-title">AI Difficulty</h2>
            <div className="settings-content">
              <button
                className={`difficulty-btn ${aiLevel === 'beginner' ? 'active' : ''}`}
                onClick={() => onAILevelChange('beginner')}
              >
                <span>🟢</span> Beginner
              </button>

              <button
                className={`difficulty-btn ${aiLevel === 'intermediate' ? 'active' : ''}`}
                onClick={() => onAILevelChange('intermediate')}
              >
                <span>🟡</span> Intermediate
              </button>

              <button
                className={`difficulty-btn ${aiLevel === 'advanced' ? 'active' : ''}`}
                onClick={() => onAILevelChange('advanced')}
              >
                <span>🔴</span> Advanced
              </button>

              {/* AI Moves First toggle - only for Advanced level, disabled once game starts */}
              {aiLevel === 'advanced' && (
                <label className={`ai-first-toggle ${gameInProgress ? 'disabled' : ''}`}>
                  <input
                    type="checkbox"
                    checked={settings.aiMovesFirst}
                    onChange={(e) => onSettingsChange({ aiMovesFirst: e.target.checked })}
                    disabled={gameInProgress}
                  />
                  <span>AI moves first (extra challenge)</span>
                  {gameInProgress && <span className="toggle-hint"> (restart to change)</span>}
                </label>
              )}

              <p className="difficulty-desc">
                {aiLevel === 'beginner' && 'Random moves. Good for learning the rules.'}
                {aiLevel === 'intermediate' && 'Balanced. Prioritizes captures.'}
                {aiLevel === 'advanced' && !settings.aiMovesFirst && 'Strategic. Thinks ahead and plays to win.'}
                {aiLevel === 'advanced' && settings.aiMovesFirst && 'Maximum difficulty! The AI strikes first and plays ruthlessly.'}
              </p>
            </div>
          </>
        ) : activeTab === 'colors' ? (
          <>
            <h2 className="sidebar-title">Player Color</h2>
            <div className="settings-content">
              {(Object.keys(COLOR_THEME_LABELS) as PlayerColorTheme[]).map((color) => (
                <button
                  key={color}
                  className={`difficulty-btn color-btn ${settings.playerColor === color ? 'active' : ''}`}
                  onClick={() => onSettingsChange({ playerColor: color })}
                >
                  <span className={`color-indicator color-${color}`}></span>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                  {color === 'red' && ' (Classic)'}
                </button>
              ))}
              <p className="difficulty-desc">
                Choose your checker color! The AI will always use black.
              </p>
            </div>
          </>
        ) : activeTab === 'board' ? (
          <>
            <h2 className="sidebar-title">Board Colors</h2>
            <p className="difficulty-desc">
              Choose your board color scheme for the checkerboard.
            </p>
            <div className="settings-content">
              {(Object.keys(BOARD_THEME_LABELS) as BoardColorTheme[]).map((theme) => {
                const colors = BOARD_COLOR_SCHEMES[theme];
                return (
                  <button
                    key={theme}
                    className={`difficulty-btn color-btn ${settings.boardColors === theme ? 'active' : ''}`}
                    onClick={() => onSettingsChange({ boardColors: theme })}
                  >
                    <span className="board-color-indicator">
                      <span className="board-color-circle" style={{ background: colors.light }}></span>
                      <span className="board-color-circle" style={{ background: colors.dark }}></span>
                    </span>
                    {BOARD_THEME_LABELS[theme]}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
