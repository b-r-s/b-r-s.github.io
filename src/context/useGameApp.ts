import { useContext } from 'react';
import { GameAppContext } from './GameAppContextValue';

export const useGameApp = () => {
  const ctx = useContext(GameAppContext);
  if (!ctx) {
    throw new Error('useGameApp must be used within a GameAppProvider');
  }
  return ctx;
};