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
  onUndo?: () => void;  logo?: string;}

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
  logo
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'colors' | 'board'>('game');
  const [currentMoveTime, setCurrentMoveTime] = useState(0);

  // Update current move timer every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoveTime(Date.now() - turnStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [turnStartTime]);

  const renderPlayerScore = (player: Player, label: string, emoji: string) => {
    const isActive = currentPlayer === player;
    const score = scores[player];
    const playerTotalTime = totalTime[player];
    const moveTime = isActive ? currentMoveTime : 0;
    const colorClass = player === 'red' ? 'text-red' : 'text-black';
    const isAI = player === 'black' ? true : false;

    return (
      <div className={`player-score-card ${isActive ? 'active' : ''}`}>
        <div className="card-header">
          <span className="player-name">
            <span className="player-emoji">{emoji}

            </span>
            <span className={colorClass}>{label}</span>
            {isAI && <span className="ai-difficulty-label"> {aiLevel.charAt(0).toUpperCase() + aiLevel.slice(1)}</span >}

            {isActive && <span className="animate-pulse">⏱️</span>}
          </span>
          <span className="player-total-score">
            {score.total.toFixed(0)}
          </span>
        </div>

        <div className="score-details">
          <span>Mat: {score.material.toFixed(0)}</span>
          <span className="opacity-50">|</span>
          <span>Pow: {score.power.toFixed(0)}</span>
          <span className="opacity-50">|</span>
          <span>Str: {score.strategy.toFixed(0)}</span>
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
              {renderPlayerScore('red', 'Red (You)', '🔴')}
              {renderPlayerScore('black', 'Black (AI)', '⚫')}
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

              <p className="difficulty-desc">
                {aiLevel === 'beginner' && 'Random moves. Good for learning the rules.'}
                {aiLevel === 'intermediate' && 'Balanced. Prioritizes captures.'}
                {aiLevel === 'advanced' && 'Strategic. Thinks ahead and plays to win.'}
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
