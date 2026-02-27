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
	- In Advanced mode, there is an option to allow the AI to play first -- this increases the difficulty of the game.

### 3. Pi Network Integration
- User authentication via Pi SDK
- Payment processing ready
- Designed for Pi Browser

### 4. Rich Gameplay
- Drag-and-drop piece movement
- Multi-jump sequences
- King promotions
- Real-time scoring
- Sound and Visual effects

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Source Code: github.com/b-r-s/b-r-s.github.io          │
│  (single repo — all code lives here)                    │
└────────────────┬────────────────────┬───────────────────┘
                 │                    │
          GitHub Actions           Vercel
          (on every push)       (on every push)
                 │                    │
                 ▼                    ▼
    ┌────────────────────┐  ┌─────────────────────────┐
    │  GitHub Pages      │  │  Vercel Serverless      │
    │  b-r-s.github.io   │  │  checkers4-pi.vercel.app│
    │  (React frontend)  │  │  (Express API backend)  │
    └────────────────────┘  └─────────────────────────┘
                 │                    │
                 └──────┬─────────────┘
                        │
                 Pi Browser loads
                 b-r-s.github.io
                 API calls go to
                 checkers4-pi.vercel.app
```

### Frontend: GitHub Pages
- Built by GitHub Actions (`npm run build`) on every push to `main`
- Serves compiled `dist/` folder at `https://b-r-s.github.io`
- Workflow: `.github/workflows/deploy.yml`

### Backend: Vercel
- Serverless Express API at `https://checkers4-pi.vercel.app`
- Handles Pi payment approval and completion server-side
- Requires `PI_API_KEY` environment variable set in Vercel dashboard
- Auto-deploys from `b-r-s/b-r-s.github.io` repo on every push

### Pi Developer Portal Configuration
- **App URL (Production URL):** `https://checkers4-pi.vercel.app` ← must match exactly
- **API Key:** Set in Vercel env vars as `PI_API_KEY`

## Technology Stack

- **React 19**: Modern UI framework
- **TypeScript**: Type-safe code
- **Vite**: Fast build tool
- **Vanilla CSS**: Custom styling (Zero-framework architecture)
- **Pi SDK**: Pi Network integration (`window.Pi` global, called directly)
- **Web Audio API**: Sound effects
- **GitHub Actions**: CI/CD for frontend builds
- **Vercel**: Serverless backend hosting

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
