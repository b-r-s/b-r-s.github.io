🎨 UI & Theme Guidelines: Checkers4Pi
This document defines the visual standards and user interface requirements for Checkers4Pi to ensure a premium, mobile-first experience within the Pi Browser.

1. Design Philosophy
Our design uses a "Complementary-Native" approach. We use a palette that feels at home in the Pi Ecosystem (Amethyst & Orange) without exactly mimicking official system apps, maintaining our identity as an independent community project.

2. Color Palette
• Background (Amethyst): Use a "Deep Purple" palette (`--bg-dark: #33124e`, `--amethyst: #4D2A7A`). It feels more like a strategy game and fits the Pi Ecosystem seamlessly.
• Text / Light Elements: Use an "Off-White" or "Ghost White" (`--text-primary: #F8FAFC`). Pure white (`#FFFFFF`) can be harsh on OLED phone screens at night.
• Accents (Green/Magenta): Use vibrant, high-contrast accents (`--accent-medium: #5bc441`, `--accent-dark: #5a0748`). Green pops perfectly against the darker backgrounds and makes the game feel "alive."
• Borders (Orange): Warm orange tones (`--border-dark: #ee6705`, `--border-light: #f6934c`) provide distinct separation for interactive elements.
• Board Defaults: Base board tiles use a clear dichotomy of light (`--board-light: #ffffff`) and dark (`--board-dark: #3b82f6`).

3. Layout & Responsiveness
• Mobile-First: The app is locked to portrait orientation.

• Safe Zones: All UI elements must maintain a 20px margin from the top to account for the Pi Browser URL bar.

• Touch Targets: Buttons and interactive squares are a minimum of 48x48px to prevent "fat-finger" errors.

• Scrolling: `touch-action: none` is applied to the game board to prevent accidental page scrolling during piece movement.

4. Typography
• Primary Font: System-default Sans-Serif (Roboto/San Francisco) for maximum performance.

• Weights: 400 for general text, 700 for game status (e.g., "Your Turn").

5. Components
• The King Piece: Stylized with a minimalist gold crown overlay.

• AI Thinking Indicator: A purple pulse effect on the AI's side of the board during depth calculations.

• Pi SDK Modals: Use standard Pi Network styling for any authentication or payment flows.
