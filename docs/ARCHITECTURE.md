# Checkers4Pi Architecture

## Overview

Checkers4Pi is a **single-page responsive web application** designed for the Pi Network ecosystem. It works seamlessly in both desktop and mobile browsers, including the Pi Browser.

## Why No Separate Mobile Package?

The Pi ecosystem primarily uses the **Pi Browser** (a web browser) on mobile devices. This means:
- ✅ A responsive web app works perfectly
- ✅ Single codebase is easier to maintain
- ✅ Faster development and deployment
- ❌ No need for React Native or separate mobile builds

## Project Structure

```
checkers4pi/
├── src/
│   ├── components/      # React UI components
│   │   ├── Board/       # Main game board
│   │   ├── CheckerPiece/ # Draggable pieces
│   │   ├── Sidebar/     # Settings & controls
│   │   ├── AdvantageBar/ # Score visualization
│   │   └── GameOver/    # End game modal
│   ├── hooks/           # Custom React hooks
│   │   ├── useAI.ts     # AI opponent (Minimax algorithm)
│   │   ├── useGameState.ts # Game state management
│   │   ├── usePiNetwork.ts # Pi SDK integration
│   │   ├── useSettings.ts # User preferences
│   │   └── useStatistics.ts # Game stats tracking
│   ├── types/           # TypeScript type definitions
│   │   └── game.ts      # Core game types
│   ├── utils/           # Utility functions
│   │   ├── gameLogic.ts # Checkers rules engine
│   │   ├── scoring.ts   # Advanced scoring system
│   │   ├── sound.ts     # Web Audio API sounds
│   │   ├── colorThemes.ts # Theme system
│   │   └── constants.ts # Game constants
│   ├── assets/          # Images and static files
│   ├── App.tsx          # Root component
│   └── main.tsx         # Entry point
├── docs/                # Documentation
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
└── README.md            # Documentation
```

## Key Features

### 1. Responsive Design
- Works on all screen sizes
- Touch-optimized for mobile
- Desktop mouse/keyboard support

### 2. AI Opponent
	- **Beginner**: Random moves
	- **Intermediate**: Minimax algorithm (depth = 1) with positional weighting (center control, king's row, etc.)
	- **Advanced**: Minimax algorithm (depth > 1) with alpha-beta pruning and full positional scoring
│   │   ├── scoring.ts   # Advanced scoring system (material, positional weighting)

### 3. Pi Network Integration
- User authentication via Pi SDK
- Payment processing ready
- Designed for Pi Browser

### 4. Rich Gameplay
- Drag-and-drop piece movement
- Multi-jump sequences
- King promotions
- Real-time scoring
- Sound effects

## Technology Stack

- **React 19**: Modern UI framework
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Pi SDK**: Pi Network integration
- **Web Audio API**: Sound effects

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The app can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Pi Network's hosting (when available)

Just run `npm run build` and deploy the `dist/` folder.
