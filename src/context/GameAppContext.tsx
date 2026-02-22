
import React from 'react';
import { useGameState } from '../hooks/useGameState';
import { useSettings } from '../hooks/useSettings';
import { GameAppContext,  } from './GameAppContextValue';
import type { GameAppContextType } from './GameAppContextValue';
export const GameAppProvider = ({ children }: { children: React.ReactNode }) => {
  const settingsState = useSettings();
  const gameState = useGameState(settingsState.settings);

  // Compose the context value
  const value: GameAppContextType = {
    ...settingsState,
    ...gameState,
  };

  return (
    <GameAppContext.Provider value={value}>
      {children}
    </GameAppContext.Provider>
  );
};


