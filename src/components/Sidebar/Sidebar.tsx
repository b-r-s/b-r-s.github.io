import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
import './Sidebar.css';
import { GameButton } from '../GameButton/GameButton';
import type { AILevel, Player, PlayerColorTheme, BoardColorTheme } from '../../types/game';
import type { ScoreBreakdown } from '../../utils/scoring';
import type { GameSettings } from '../../hooks/useSettings';
import { COLOR_THEME_LABELS, BOARD_THEME_LABELS, BOARD_COLOR_SCHEMES } from '../../utils/colorThemes';

import { NeonColors } from '../../types/neon-hues';

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
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'settings' | 'colors' | 'board'>('game');
  const [currentMoveTime, setCurrentMoveTime] = useState(0);
  const [tipToastVisible, setTipToastVisible] = useState(false);
  const [tipToastPos, setTipToastPos] = useState<{ top: number; right: number } | null>(null);
  const tipBtnRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTipToast = useCallback(() => {
    if (tipBtnRef.current) {
      const rect = tipBtnRef.current.getBoundingClientRect();
      setTipToastPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
    setTipToastVisible(true);
  }, []);

  const hideTipToast = useCallback(() => {
    setTipToastVisible(false);
    setTipToastPos(null);
  }, []);

  const handleTipTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setTipToastVisible(true), 500);
  }, []);

  const handleTipTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Keep toast visible briefly after finger lifts so user can read it
    setTimeout(() => setTipToastVisible(false), 2500);
  }, []);

  // Auto-dismiss the success tip message after 2 seconds
  useEffect(() => {
    if (paymentStatus === 'success') {
      const t = setTimeout(() => resetPaymentStatus?.(), 2000);
      return () => clearTimeout(t);
    }
  }, [paymentStatus, resetPaymentStatus]);

  // Get winner from scores if available (winner is set when total is not 0 and the other is 0 or game is over)
  // actually, we need to know if the game is over. We'll infer from totalTime: if both timers are not running and showPlayAgain is true, stop timer.
  const gameOver = showPlayAgain;

  // Update current move timer every 100ms, but only after the first move has been made
  // and stop if game is over. This prevents the timer from running before any move is made.
  useEffect(() => {
    if (gameOver || !gameInProgress) return;
    const interval = setInterval(() => {
      setCurrentMoveTime(Date.now() - turnStartTime);
    }, 100);
    return () => clearInterval(interval);
  }, [turnStartTime, gameOver, gameInProgress]);

  // Derive the displayed move time — 0:00 until the game actually starts
  const displayedMoveTime = gameInProgress ? currentMoveTime : 0;


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
    const moveTime = isActive ? displayedMoveTime : 0;
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
          <div className="card-header-actions">
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
            {/* Tip button — only on human player card */}
            {player === 'red' && createPayment && paymentStatus === 'idle' && (
              <div className="tip-btn-wrapper">
                <button
                  ref={tipBtnRef}
                  className="tip-btn"
                  onMouseEnter={showTipToast}
                  onMouseLeave={hideTipToast}
                  onTouchStart={handleTipTouchStart}
                  onTouchEnd={handleTipTouchEnd}
                  onClick={() => {
                    hideTipToast();
                    fetch('/api/health').catch(() => {});
                    resetPaymentStatus?.();
                    createPayment(0.5, 'Tip for Checkers4Pi — Thank you!');
                  }}
                  aria-label="Send a 0.5 π tip"
                >
                  $
                </button>
              </div>
            )}
            {tipToastVisible && tipToastPos && (
              <div
                className="tip-info-toast"
                role="tooltip"
                style={{ top: tipToastPos.top, right: tipToastPos.right }}
              >
                Checkers4Pi is free, always. If you enjoy it, send a small tip in Test Pi — it costs you nothing real and helps confirm Pi ecosystem connectivity. 🙏
                <span className="tip-info-cta">Tap <strong>$</strong> to send 0.5π.</span>
              </div>
            )}
          </div>
        </div>
        {/* Inline payment status — human player only */}
        {player === 'red' && paymentStatus !== 'idle' && (
          <div className="tip-status">
            {paymentStatus === 'pending' && (
              <span className="tip-status-pending">⏳ Processing payment in Pi Browser…</span>
            )}
            {paymentStatus === 'success' && (
              <span className="tip-status-success">
                ✅ Tip received! Thank you 🎉
                <button className="tip-reset-btn" onClick={resetPaymentStatus}>✕</button>
              </span>
            )}
            {(paymentStatus === 'cancelled' || paymentStatus === 'error') && (
              <span className="tip-status-fail">
                {paymentStatus === 'cancelled' ? '❌ Cancelled.' : '❌ Error, try again.'}
                <button className="tip-reset-btn" onClick={resetPaymentStatus}>Dismiss</button>
              </span>
            )}
          </div>
        )}
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
        ) : null}
      </div>
    </div>
  );
}
