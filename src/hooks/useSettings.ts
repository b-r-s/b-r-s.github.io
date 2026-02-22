import { useState, useEffect } from 'react';

import type { PlayerColorTheme, BoardColorTheme } from '../types/game';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  difficulty: Difficulty;
  soundEnabled: boolean;
  showHints: boolean;
  playerColor: PlayerColorTheme;
  boardColors: BoardColorTheme;
  aiMovesFirst: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'medium',
  soundEnabled: true,
  showHints: false,
  playerColor: 'red',
  boardColors: 'classic',
  aiMovesFirst: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Load settings from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('checkers4pi-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load settings from storage:', error);
    }
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('checkers4pi-settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to storage:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};