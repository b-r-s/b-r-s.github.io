// Game configuration constants
export const BOARD_SIZE = 8;

// AI configuration
export const AI_THINK_TIME_MS = 1000;
export const MINIMAX_DEPTH = 6; // Matching AI-STRATEGY.md (6 ply)
export const TERMINAL_SCORE = 10000;

// Scoring weights (Integer-based for mobile battery optimization)
export const SCORING_WEIGHTS = {
  MOBILITY: 2,
  ADVANCEMENT: 1,
  SUPPORT: 2,
  CENTER_CONTROL: 3,    // Matching AI-STRATEGY.md
  BACK_RANK: 5,         // Matching AI-STRATEGY.md
} as const;

// UI timing
export const TOAST_DURATION_MS = 3000;

// Piece values (Integer-based)
export const PIECE_VALUES = {
  REGULAR: 10,          // Matching AI-STRATEGY.md
  KING: 15,             // Matching AI-STRATEGY.md
} as const;
