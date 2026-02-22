# Pi Hub Ecosystem Guide 🌌🎮

This document outlines the architecture and workflow for hosting multiple Pi Network games under a single verified domain (`b-r-s.github.io`). 

## 🏗 Directory Structure

The hub uses a **Root + Subfolder** strategy to maintain domain verification while allowing infinite games.

```text
repository-root/
├── validation-key.txt    # CRITICAL: Do not delete (Maintains Domain Verification)
├── .nojekyll             # Allows GitHub Pages to serve folders starting with underscore
├── index.html            # The "Game Portal" / Landing Page
├── README.md             # Hub-level documentation
├── checkers/             # Checkers4Pi (Subdirectory)
│   ├── index.html
│   ├── assets/
│   └── docs/             # Game-specific documentation
└── [future-game]/        # Place future games in their own folders
```

## 🚀 Adding a New Game

To add a new game (e.g., *Battleship4Pi*) to this hub:

### 1. Configure the Build Path
Vite (and most modern tools) must be told they are living in a subfolder.
In `vite.config.ts`, add the `base` property:

```typescript
export default defineConfig({
  base: '/battleship/', // Must match the folder name on GitHub
  // ... rest of config
})
```

### 2. Build the Assets
Run the build command:
```bash
npm run build
```

### 3. Deploy to the Hub
1. Create a folder named `battleship` in your `b-r-s.github.io` repository.
2. Copy the contents of your `dist/` folder into that `battleship` folder.
3. Update the root `index.html` (the Game Hub landing page) to add a link to your new game.

## 🛡 Maintaining Verification
The Pi Network bot periodically checks `https://b-r-s.github.io/validation-key.txt`. 
- **NEVER** move or delete the `validation-key.txt` from the root.
- All games hosted on this domain are automatically "covered" by this root-level verification.

## 📝 Reviewer Documentation
The Pi Review team expects to find documentation (Privacy, AI Strategy, etc.) easily.
- **Best Practice:** Keep a `docs/` folder inside each game's subdirectory (e.g., `/checkers/docs/`) so the reviewer sees them immediately when inspecting the project folder on GitHub.

---
*Last Updated: February 2026*
