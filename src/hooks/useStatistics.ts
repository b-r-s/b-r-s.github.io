import { useState, useEffect, useCallback } from 'react';

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  averageMoves: number;
  totalMoves: number;
}

const DEFAULT_STATS: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  averageMoves: 0,
  totalMoves: 0,
};

export const useStatistics = () => {
  const [stats, setStats] = useState<GameStatistics>(DEFAULT_STATS);

  // Load statistics from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-checkers-statistics');
      if (stored) {
        const parsedStats = JSON.parse(stored);
        setStats({ ...DEFAULT_STATS, ...parsedStats });
      }
    } catch (error) {
      console.warn('Failed to load statistics from storage:', error);
    }
  }, []);

  // Save statistics to storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('ai-checkers-statistics', JSON.stringify(stats));
    } catch (error) {
      console.warn('Failed to save statistics to storage:', error);
    }
  }, [stats]);

  const recordGameResult = useCallback((won: boolean, moves: number) => {
    setStats(prev => {
      const gamesPlayed = prev.gamesPlayed + 1;
      const gamesWon = won ? prev.gamesWon + 1 : prev.gamesWon;
      const gamesLost = won ? prev.gamesLost : prev.gamesLost + 1;
      const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100 * 10) / 10 : 0;

      const currentStreak = won ? prev.currentStreak + 1 : 0;
      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      const totalMoves = prev.totalMoves + moves;
      const averageMoves = gamesPlayed > 0 ? Math.round((totalMoves / gamesPlayed) * 10) / 10 : 0;

      return {
        gamesPlayed,
        gamesWon,
        gamesLost,
        winRate,
        currentStreak,
        bestStreak,
        averageMoves,
        totalMoves,
      };
    });
  }, []);

  const resetStatistics = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, []);

  return {
    stats,
    recordGameResult,
    resetStatistics,
  };
};