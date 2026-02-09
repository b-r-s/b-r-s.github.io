🎨 UI & Theme Guidelines: Checkers4Pi
This document defines the visual standards and user interface requirements for Checkers4Pi to ensure a premium, mobile-first experience within the Pi Browser.

1. Design Philosophy
Our design uses a "Complementary-Native" approach. We use a palette that feels at home in the Pi Ecosystem (Amethyst & Gold) without exactly mimicking official system apps, maintaining our identity as an independent community project.

2. Color Palette
• Blue: Use a "Deep Indigo" or "Royal Blue" ($#1E40AF$). It feels more like a strategy game and less like a basic hyperlink blue.
• White: Use an "Off-White" or "Ghost White" ($#F8FAFC$). Pure white ($#FFFFFF$) can be harsh on OLED phone screens at night.
• Green: Use a "Vibrant Cyan" or "Mint Green" ($#2DD4BF$). It pops perfectly against Blue and White and makes the game feel "alive."
• Gold: Use a "Deep Gold" or "Rich Gold" ($#B7950B$). It feels more like a strategy game and less like a basic hyperlink blue.
• Purple: Use a "Deep Purple" or "Rich Purple" ($#6A0DAD$). It feels more like a strategy game and less like a basic hyperlink blue.
• Red: Use a "Deep Red" or "Rich Red" ($#B7950B$). It feels more like a strategy game and less like a basic hyperlink blue.

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
