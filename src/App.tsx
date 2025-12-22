import './App.css';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { useGameState } from './hooks/useGameState';
import { useSettings } from './hooks/useSettings';
import { BOARD_COLOR_SCHEMES } from './utils/colorThemes';
import { useEffect, useState } from 'react';
import logo from './assets/logo.png';

function App() {
  const { gameState, handleTileClick, movePiece, setAILevel, restartGame, undoMove, clearUndoHighlight, toastMessage } = useGameState();
  const { settings, updateSettings } = useSettings();
  const [showPlayAgain, setShowPlayAgain] = useState(false);

  const handleRestart = () => {
    setShowPlayAgain(false);
    restartGame();
  };

  // Apply board colors as CSS variables
  useEffect(() => {
    const colors = BOARD_COLOR_SCHEMES[settings.boardColors];
    document.documentElement.style.setProperty('--board-light', colors.light);
    document.documentElement.style.setProperty('--board-dark', colors.dark);
  }, [settings.boardColors]);

  return (
    <div className="app-container">
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
          onPlayAgain={handleRestart}
          canUndo={gameState.aiLevel === 'beginner' && gameState.moveHistory.length >= 2 && !gameState.isAiTurn && !gameState.winner}
          onUndo={undoMove}
          logo={logo}
        />
      </div>
    </div>
  );
}

export default App;
