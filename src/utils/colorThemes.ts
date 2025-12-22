import type { PlayerColorTheme, ColorFilter, BoardColorTheme, BoardColors } from '../types/game';
import goldBoardSquare from '../assets/gold-board-square.png';

// CSS filter values to transform the red checker to different colors
export const COLOR_THEMES: Record<PlayerColorTheme, ColorFilter> = {
  red: {
    hueRotate: 0,
    saturate: 1,
    brightness: 1,
  },
  blue: {
hueRotate: 219, 
saturate: 5, 
brightness: 0.7,
  },
  green: {
    hueRotate: 83,
    saturate: 7.3,
    brightness: 1.2,
  },

 
  purple: {
    hueRotate: 270,
    saturate: 1.4,
    brightness: 1.1,
  },
  orange: {
    hueRotate: 20,
    saturate: 1.5,
    brightness: 1.1,
  },
  pink: {
    hueRotate: 320,
    saturate: 1.3,
    brightness: 1.15,
  },
};

export const COLOR_THEME_LABELS: Record<PlayerColorTheme, string> = {
  red: '🔴 Red (Classic)',
  blue: '🔵 Blue',
  green: '🟢 Green',
  purple: '🟣 Purple',
  orange: '🟠 Orange',
  pink: '🩷 Pink',
};

export function getColorFilterCSS(theme: PlayerColorTheme): string {
  const filter = COLOR_THEMES[theme];
  return `hue-rotate(${filter.hueRotate}deg) saturate(${filter.saturate}) brightness(${filter.brightness})`;
}

// Board color schemes
export const BOARD_COLOR_SCHEMES: Record<BoardColorTheme, BoardColors> = {
  classic: {
    light: '#ffffff',
    dark: '#3b82f6',
  },
  wooden: {
    light: '#f5deb3',
    dark: '#8b4513',
  },
  modern: {
    light: '#e5e7eb',
    dark: '#374151',
  },
  ocean: {
    light: '#dbeafe',
    dark: '#0c4a6e',
  },
  // Temporarily commented out until metallic images are ready
  // goldsilver: {
  //   light: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e8e8e8 25%, #d3d3d3 50%, #c0c0c0 75%, #b8b8b8 100%)',
  //   dark: 'radial-gradient(circle at 30% 30%, #f4c430 0%, #daa520 25%, #d4af37 50%, #c5a028 75%, #b8860b 100%)',
  // },
  // copperbronze: {
  //   light: 'radial-gradient(circle at 30% 30%, #f4a460 0%, #e88a5c 25%, #da8a67 50%, #c87533 75%, #b87333 100%)',
  //   dark: 'radial-gradient(circle at 30% 30%, #7d8b6b 0%, #6f7a5d 25%, #64704f 50%, #576345 75%, #4a5338 100%)',
  // },
  // blackgold: {
  //   light: `url(${goldBoardSquare})`,
  //   dark: '#3b82f6',
  // },
};

export const BOARD_THEME_LABELS: Record<BoardColorTheme, string> = {
  classic: 'Classic (White & Blue)',
  wooden: 'Wooden (Beige & Brown)',
  modern: 'Modern (Gray & Charcoal)',
  ocean: 'Ocean (Sky & Navy)',
  // Temporarily commented out until metallic images are ready
  // goldsilver: 'Metallic (Gold & Silver)',
  // copperbronze: 'Metallic (Copper & Bronze)',
  // blackgold: 'Luxury (Blue & Gold)',
};
