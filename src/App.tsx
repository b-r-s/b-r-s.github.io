import './App.css';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { GamePlayInstructions } from './components/GamePlayInstructions';
import { useGameState } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';
import { BOARD_COLOR_SCHEMES } from './utils/colorThemes';
import { getContrastingHighlightColor } from './utils/contrastUtils';
import { useEffect, useState } from 'react';
import { usePiNetwork } from './hooks/usePiNetwork';
import logo from './assets/icon-192x192.png';





// Internal component for the orientation warning to avoid duplication
const LandscapeWarning = ({ logo }: { logo: string }) => (
  <div className="landscape-warning">
    <div className="warning-content">
      <img src={logo} alt="Checkers4Pi Logo" className="rotate-icon-img" />
      <h2>Please Rotate Your Device</h2>
      <p>Checkers4Pi is designed for Portrait Mode.</p>
    </div>
  </div>
);

function App() {
  // DEV-ONLY: Preview authentication screens for styling
  // To use: add ?previewAuth=checking or ?previewAuth=failed to your local URL
  // 'checking' shows the loading/auth screen, 'failed' shows the error/failure screen
  //  
  //  http://localhost:5174/?previewAuth=failed 


  const previewAuth = (() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('previewAuth');
    }
    return null;
  })();

  const { settings, updateSettings } = useSettings();
  const { gameState, handleTileClick, movePiece, setAILevel, restartGame, undoMove, clearUndoHighlight, toastMessage } = useGameState(settings);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Pi Network authentication
  const { authenticate, createPayment, paymentStatus, resetPaymentStatus, debugLog } = usePiNetwork();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Auth never blocks the game — Pi auth is only required for the tip/payment
    // feature, not to play. Always resolve to the game regardless of outcome.
    if (typeof window !== 'undefined' && 'Pi' in window) {
      const authTimeout = new Promise<void>(resolve =>
        setTimeout(() => {
          console.warn('Pi auth timed out after 20s — proceeding to game.');
          resolve();
        }, 20000)
      );
      Promise.race([authenticate(), authTimeout])
        .finally(() => setAuthChecked(true));
    } else {
      // No Pi SDK (dev environment or non-Pi browser) — go straight to game
      setAuthChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestart = () => {
    setShowPlayAgain(false);
    restartGame();
  };

  const handleStartGame = () => {
    setShowSplash(false);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleHideInstructions = () => {
    setShowInstructions(false);
  };

  // When aiMovesFirst setting changes and no moves have been made, restart to apply
  useEffect(() => {
    if (gameState.moveCount === 0 && !showSplash) {
      restartGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.aiMovesFirst]);

  // Apply board colors as CSS variables
  useEffect(() => {
    const colors = BOARD_COLOR_SCHEMES[settings.boardColors];
    document.documentElement.style.setProperty('--board-light', colors.light);
    document.documentElement.style.setProperty('--board-dark', colors.dark);
    // Set dynamic jump highlight color based on contrast with dark squares
    const highlightColor = getContrastingHighlightColor(colors.dark);
    document.documentElement.style.setProperty('--jump-highlight-color', highlightColor);
  }, [settings.boardColors]);


  // --- MAIN RENDER LOGIC ---

  // 1. Handle loading state (auth not yet checked)
  if (!authChecked && previewAuth !== 'checking' && previewAuth !== 'failed') {
    return (
      <div className="app-container loading">
        <LandscapeWarning logo={logo} />
        <div className="loading-content">
          <img src={logo} alt="Checkers4Pi" className="loading-logo" />
          <div className="loading-text animate-pulse">Connecting to Pi Ecosystem...</div>
        </div>
      </div>
    );
  }

  // 2. Handle specific preview or error states
  let currentError = previewAuth === 'failed' ? 'Authentication failed.' : null;
  let authErrorDetail = '';
  if (!currentError && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('pi_auth_error');
      if (stored) {
        currentError = 'Authentication failed.';
        authErrorDetail = stored;
      }
    } catch (_) {}
  }
  const isCheckingPreview = previewAuth === 'checking';

  if (currentError || isCheckingPreview) {
    return (
      <div className="app-container error">
        <LandscapeWarning logo={logo} />
        <div className="auth-error-content">
          <img src={logo} alt="Checkers4Pi" className="error-logo" />
          {isCheckingPreview ? (
            <div className="loading-text">Connecting to Pi Ecosystem...</div>
          ) : (
            <>
              <div className="error-badge">{currentError}</div>
              <h1>Initialization Failed</h1>
              <p className="error-detail">
                {authErrorDetail ? (
                  <>
                    <b>Error:</b> {authErrorDetail}<br />
                  </>
                ) : null}
                This app requires the Pi Network SDK.<br />
                Please open in the Pi Browser or use the Pi Developer Portal sandbox for full functionality.
              </p>
              <button className="welcome-button" onClick={() => window.location.reload()}>
                Retry Connection
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 3. Main Application Flow (Splash -> Game)
  return (
    <div className="app-container">
      <LandscapeWarning logo={logo} />

      {showSplash ? (
        showInstructions ? (
          <GamePlayInstructions onBack={handleHideInstructions} />
        ) : (
          <SplashScreen onStart={handleStartGame} onShowInstructions={handleShowInstructions} />
        )
      ) : (
        <div className="game-layout">
          <div className="main-content">
            <Board
              gameState={gameState}
              onTileClick={handleTileClick}
              onMovePiece={movePiece}
              onRestart={handleRestart}
              onClearUndoHighlight={clearUndoHighlight}
              toastMessage={toastMessage}
              playerColor={settings.playerColor}
              onModalFadeComplete={() => setShowPlayAgain(true)}
            />
          </div>
          <Sidebar
            aiLevel={gameState.aiLevel}
            onAILevelChange={setAILevel}
            scores={gameState.scores}
            currentPlayer={gameState.currentPlayer}
            turnStartTime={gameState.turnStartTime}
            totalTime={gameState.totalTime}
            settings={settings}
            onSettingsChange={updateSettings}
            showPlayAgain={showPlayAgain}
            onRestart={handleRestart}
            moveHistory={gameState.moveHistory}
            canUndo={gameState.aiLevel === 'beginner' && gameState.moveHistory.length >= 2 && !gameState.isAiTurn && !gameState.winner}
            onUndo={undoMove}
            logo={logo}
            gameInProgress={gameState.moveCount > 0}
            createPayment={createPayment}
            paymentStatus={paymentStatus}
            resetPaymentStatus={resetPaymentStatus}
            debugLog={debugLog}
          />
        </div>
      )}
    </div>
  );
}


export default App;
