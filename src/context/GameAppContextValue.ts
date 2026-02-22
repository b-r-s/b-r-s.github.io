import type { GameSettings } from '../hooks/useSettings';
import type { GameState, AILevel } from '../types/game';
import { createContext } from 'react';

export interface GameAppContextType {
  // From useSettings
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
  // From useGameState
  gameState: GameState;
  handleTileClick: (row: number, col: number) => void;
  movePiece: (from: { row: number; col: number }, to: { row: number; col: number }) => void;
  setAILevel: (level: AILevel) => void;
  restartGame: () => void;
  undoMove: () => void;
  clearUndoHighlight: () => void;
  toastMessage: string | null;
}

export const GameAppContext = createContext<GameAppContextType | undefined>(undefined);