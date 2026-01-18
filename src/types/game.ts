import type { ScoreBreakdown } from '../utils/scoring';

export type Player = 'red' | 'black';

export type PlayerColorTheme = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'pink';

export type BoardColorTheme = 'classic' | 'wooden' | 'modern' | 'ocean';

export interface ColorFilter {
  hueRotate: number;
  saturate: number;
  brightness: number;
}

export interface BoardColors {
  light: string;
  dark: string;
}

export interface Piece {
  color: Player;
  isKing: boolean;
}

export type BoardState = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  isJump: boolean;
  jumpedPiece?: Position;
  jumpSequence?: Position[]; // Array of intermediate positions for multi-jumps
}

export type GameMode = 'PvP' | 'PvAI';

export type AILevel = 'beginner' | 'intermediate' | 'advanced';

export interface MoveHistoryEntry {
  move: Move;
  boardBefore: BoardState;
  scoresBefore: {
    red: ScoreBreakdown;
    black: ScoreBreakdown;
  };
  playerBefore: Player;
  timeBefore: {
    turnStartTime: number;
    totalTime: { red: number; black: number };
  };
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  selectedPosition: Position | null;
  validMoves: Move[];
  winner: Player | 'draw' | null;
  gameMode: GameMode;
  isAiTurn: boolean;
  aiLevel: AILevel;
  scores: {
    red: ScoreBreakdown;
    black: ScoreBreakdown;
  };
  turnStartTime: number;
  totalTime: {
    red: number;
    black: number;
  };
  lastAIMove?: {
    from: Position;
    to: Position;
    timestamp: number;
    trail?: {
      startSquare: Position;
      capturedSquares: Position[];
      landingSquares: Position[];
    };
  };
  lastUndoMove?: {
    from: Position;
    to: Position;
    timestamp: number;
  };
  moveHistory: MoveHistoryEntry[];
  moveCount: number;
}
