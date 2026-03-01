import { useState, useEffect } from 'react';
import React from 'react';
import './Sidebar.css';
import { GameButton } from '../GameButton/GameButton';
import type { AILevel, Player, PlayerColorTheme, BoardColorTheme } from '../../types/game';
import type { ScoreBreakdown } from '../../utils/scoring';
import type { GameSettings } from '../../hooks/useSettings';
import { COLOR_THEME_LABELS, BOARD_THEME_LABELS, BOARD_COLOR_SCHEMES } from '../../utils/colorThemes';

import { NeonColors } from '../../types/neon-hues';

const DebugPanel = ({ lines }: { lines: string[] }) => {
  const [localLines, setLocalLines] = React.useState<string[]>(lines);

  // Read directly from localStorage on mount + every 2s
  // React state may be stale if Pi Browser froze JS before commits
  React.useEffect(() => {
    const read = () => {
      try {
        const saved = localStorage.getItem('pi_debug_log');
        if (saved) {
          const parsed: string[] = JSON.parse(saved);
          if (parsed.length > 0) setLocalLines(parsed);
        }
      } catch (_) {}
    };
    read();
    const id = setInterval(read, 1500);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (lines.length > localLines.length) setLocalLines(lines);
  }, [lines]);

  const display = localLines.length > 0 ? localLines : ['Waiting for Pi callbacks...'];

  return (
    <div style={{
      marginTop: '8px', background: '#111', border: '1px solid #333',
      borderRadius: '6px', padding: '8px', maxHeight: '200px',
      overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px',
      lineHeight: '1.6', textAlign: 'left',
    }}>
      {display.map((line, i) => (
        <div key={i} style={{
          color: /FAIL|ERROR|THREW/.test(line) ? '#ff5252'
               : /OK|resolved/.test(line) ? '#00c853'
               : '#ccc',
          wordBreak: 'break-all',
        }}>{line}</div>
      ))}
    </div>
  );
};

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
  canUndo?: boolean;
  onUndo?: () => void;
  logo?: string;
  gameInProgress?: boolean;
  onRestart?: () => void;
  moveHistory?: import('../../types/game').MoveHistoryEntry[];
  createPayment?: (amount: number, memo: string) => Promise<void>;
  paymentStatus?: 'idle' | 'pending' | 'success' | 'cancelled' | 'error';
  resetPaymentStatus?: () => void;
  debugLog?: string[];
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
  canUndo,
  onUndo,
 // logo,
  gameInProgress,
  onRestart,
  moveHistory = [],
  createPayment,
  paymentStatus = 'idle',
  resetPaymentStatus,
  debugLog = [],
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'colors' | 'board' | 'support'>('game');
  const [currentMoveTime, setCurrentMoveTime] = useState(0);

  // Pre-warm the Vercel serverless function as soon as the Support tab is opened
  // so the cold-start delay doesn't eat into the 60-second payment approval window.
  useEffect(() => {
    if (activeTab === 'support') {
      fetch('/api/health').catch(() => {});
    }
  }, [activeTab]);

  // Get winner from scores if available (winner is set when total is not 0 and the other is 0 or game is over)
  // actually, we need to know if the game is over. We'll infer from totalTime: if both timers are not running and showPlayAgain is true, stop timer.
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
    moves: {
      name: 'Moves',
      tooltip: 'Total number of moves made by this player.',
    },
  } as const;
  type StatKey = keyof typeof STAT_LABELS;
  const STAT_KEYS: StatKey[] = ['material', 'power', 'strategy', 'moves', 'total'];

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
      label = `${COLOR_THEME_LABELS[settings.playerColor].replace(/^[^ ]+ /, '')} (You)`;
      colorClassName = `color-indicator color-${settings.playerColor}`;
    } else {
      label = 'Black (AI)';
      colorClassName = 'color-indicator color-black';
    }

    const playerMoves = moveHistory.filter(m => m.playerBefore === player).length;

    return (
      <div className={`player-score-card ${isActive ? 'active' : ''}`}>
        <div className="card-header">
          <span className="player-name">
            <span className={colorClassName}></span>
            <span className={colorClass}>{label}</span>
            {isAI && <span className="ai-difficulty-label"> {aiLevel.charAt(0).toUpperCase() + aiLevel.slice(1)}</span >}
            {isActive && <span className="animate-pulse">⏱️</span>}
          </span>
          {/* Undo Move Button - Only for Beginner Level */}
          {canUndo && player === 'red' && (
            <div className="tooltip-container">
              <button
                className="undo-move-btn"
                onClick={onUndo}
              >
                Undo Move
              </button>
              <span className="sidebar-tooltip">Undo the last move (both yours and AI's)</span>
            </div>
          )}
        </div>
        <div className="sidebar-stat-breakdown">
          {STAT_KEYS.map((key) => {
            const val = key === 'moves' ? playerMoves : score[key as keyof typeof score];
            return (
              <div className="sidebar-stat tooltip-container" key={key}>
                <span className="sidebar-stat-label">
                  {STAT_LABELS[key].name}
                </span>
                <span className="sidebar-stat-value">{val.toFixed(0)}</span>
                <span className="sidebar-tooltip">{STAT_LABELS[key].tooltip}</span>
              </div>
            );
          })}
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
      <div className="sidebar-tabs">
        <GameButton
          hue={NeonColors.Purple}
          hoverHue={NeonColors.Gold}
          label='Stats'
          onClick={() => setActiveTab('game')}
          className='tab-button'
        />
        <GameButton
          hue={NeonColors.Purple}
          hoverHue={NeonColors.Gold}
          label='AI'
          onClick={() => setActiveTab('settings')}
          className='tab-button'
        />
        <GameButton
          hue={NeonColors.Purple}
          hoverHue={NeonColors.Gold}
          label='Pieces'
          onClick={() => setActiveTab('colors')}
          className='tab-button'
        />
        <GameButton
          hue={NeonColors.Purple}
          hoverHue={NeonColors.Gold}
          label='Board'
          onClick={() => setActiveTab('board')}
          className='tab-button'
        />
        <GameButton
          hue={NeonColors.Gold}
          hoverHue={NeonColors.Purple}
          label='π Support'
          onClick={() => { setActiveTab('support'); resetPaymentStatus?.(); }}
          className='tab-button'
        />
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'game' ? (
          <>
            <div className="sidebar-header-with-logo">
{/*               <div className="sidebar-title-group">
                {logo && <img src={logo} alt="Checkers4Pi Logo" className="sidebar-logo" />}
                <h2 className="sidebar-title">Current Match</h2>
              </div> */}
              {gameInProgress && (
                <div className="tooltip-container">
                  <GameButton
                    className="new-game-btn"
                    label='New Game ?'
                    onClick={onRestart}
                    width={160}
                    hue={NeonColors.Green}

                  />
                  <span className="sidebar-tooltip">Start a fresh match</span>
                </div>
              )}
            </div>
            <div className="match-stats-container">
              {renderPlayerScore('red')}
              {renderPlayerScore('black')}
            </div>


          </>
        ) : activeTab === 'settings' ? (
          <>
            <h2 className="sidebar-title">AI Difficulty</h2>
            <div className="settings-content">
              <button
                className={`difficulty-btn ${aiLevel === 'beginner' ? 'active' : ''} ${gameInProgress ? 'disabled' : ''}`}
                onClick={() => !gameInProgress && onAILevelChange('beginner')}
                disabled={gameInProgress}
              >
                <span>🟢</span> Beginner
              </button>

              <button
                className={`difficulty-btn ${aiLevel === 'intermediate' ? 'active' : ''} ${gameInProgress ? 'disabled' : ''}`}
                onClick={() => !gameInProgress && onAILevelChange('intermediate')}
                disabled={gameInProgress}
              >
                <span>🟡</span> Intermediate
              </button>

              <button
                className={`difficulty-btn ${aiLevel === 'advanced' ? 'active' : ''} ${gameInProgress ? 'disabled' : ''}`}
                onClick={() => !gameInProgress && onAILevelChange('advanced')}
                disabled={gameInProgress}
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
                  {/* <span className={`color-indicator color-${color}`}></span> */}
                  <div className="color-indicator" style={{ backgroundColor: color, height: '20px', width: '20px', border: '2px solid black', borderRadius: '50%' }}></div>
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
                    <div className="board-color-indicator">
                      <div
                        className="board-color-circle"
                        style={{ '--circle-bg': colors.light } as React.CSSProperties}
                      ></div>
                      <div
                        className="board-color-circle"
                        style={{ '--circle-bg': colors.dark } as React.CSSProperties}
                      ></div>
                    </div>
                    {BOARD_THEME_LABELS[theme]}
                  </button>
                );
              })}
            </div>
          </>
        ) : activeTab === 'support' ? (
          <>
            <h2 className="sidebar-title">Support This App</h2>
            <div className="settings-content">
              <p className="difficulty-desc">
                Checkers4Pi is free, always. If you enjoy it,
                send a small tip in Test Pi — it costs you nothing real
                and helps confirm Pi ecosystem connectivity. 🙏
              </p>
              {paymentStatus === 'idle' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[0.1, 0.5, 1].map((amt) => (
                    <button
                      key={amt}
                      className="difficulty-btn"
                      onClick={() => createPayment?.(amt, `Tip for Checkers4Pi — Thank you!`)}
                      disabled={!createPayment}
                    >
                      π {amt} — Tip the Developer
                    </button>
                  ))}
                </div>
              )}
              {paymentStatus === 'pending' && (
                <div>
                  <p className="difficulty-desc" style={{ color: '#f0b90b' }}>⏳ Processing payment in Pi Browser…</p>
                  <DebugPanel lines={debugLog} />
                </div>
              )}
              {paymentStatus === 'success' && (
                <p className="difficulty-desc" style={{ color: '#00c853' }}>✅ Thank you! Your tip was received. 🎉</p>
              )}
              {paymentStatus === 'cancelled' && (
                <>
                  <p className="difficulty-desc" style={{ color: '#888' }}>Payment cancelled. No Pi was sent.</p>
                  {debugLog.length > 0 && <DebugPanel lines={debugLog} />}
                  <button className="difficulty-btn" onClick={resetPaymentStatus}>Try Again</button>
                </>
              )}
              {paymentStatus === 'error' && (
                <>
                  <p className="difficulty-desc" style={{ color: '#ff5252' }}>❌ Something went wrong. Please try again.</p>
                  {debugLog.length > 0 && <DebugPanel lines={debugLog} />}
                  <button className="difficulty-btn" onClick={resetPaymentStatus}>Try Again</button>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
