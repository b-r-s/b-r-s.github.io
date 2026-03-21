import React, { useRef } from 'react';
import './GamePlayInstructions.css';


interface GamePlayInstructionsProps {
  onBack: () => void;
}

interface InstructionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const InstructionSection: React.FC<InstructionSectionProps> = ({ title, children, defaultOpen = false }) => (
  <details className="gameplay-section" open={defaultOpen}>
    <summary className="gameplay-section-summary">{title}</summary>
    <div className="gameplay-section-content">{children}</div>
  </details>
);

export const GamePlayInstructions: React.FC<GamePlayInstructionsProps> = ({ onBack }) => {
  const listRef = useRef<HTMLDivElement>(null);

  const setAllSectionsOpen = (open: boolean) => {
    if (!listRef.current) return;
    const sections = listRef.current.querySelectorAll<HTMLDetailsElement>('details.gameplay-section');
    sections.forEach(section => {
      section.open = open;
    });
  };

  return (
  <div className="gameplay-instructions-container">
    <h2>How to Play Checkers4Pi</h2>

    <div className="instructions-section-controls">
      <button
        type="button"
        className="instructions-control-btn"
        onClick={() => setAllSectionsOpen(true)}
      >
        Expand All
      </button>
      <button
        type="button"
        className="instructions-control-btn"
        onClick={() => setAllSectionsOpen(false)}
      >
        Collapse All
      </button>
    </div>

    <div className="gameplay-instructions-list" ref={listRef}>
      <InstructionSection title="Mobile Portrait Mode" defaultOpen={true}>
        <div className="gameplay-instruction-item device-notice">
          <p className="instruction-paragraph">
            Checkers4Pi is designed for mobile phones. Tablet and Browser support will be added soon.
            For best readability and touch control, keep your device in portrait mode.
          </p>
          <p className="instruction-paragraph">
            If the device rotates to landscape, you will see a rotate reminder until portrait mode is restored.
          </p>
        </div>
      </InstructionSection>

      <InstructionSection title="Getting Started">
        <div className="gameplay-instruction-item">
          <p className="instruction-paragraph">
            Capture all of your opponent's pieces, or block them so they cannot move.
            You play as the human side (custom color), and the AI always plays black pieces.
            Play is on the dark squares of an 8x8 board.
          </p>
          <p className="instruction-paragraph">
            Human moves first by default. If AI Moves First is enabled, black starts instead.
          </p>
        </div>
      </InstructionSection>

      <InstructionSection title="Movement and Promotion">
        <div className="gameplay-instruction-item">
          <p className="instruction-paragraph">
            Pieces move diagonally forward to adjacent empty dark squares.
            When a piece reaches the opponent back rank, it becomes a King.
            Kings can move and capture in both forward and backward diagonal directions.
          </p>
        </div>
      </InstructionSection>

      <InstructionSection title="Mandatory Capturing">
        <div className="gameplay-instruction-item">
          <p className="instruction-paragraph">
            If any jump is available, you must take a jump.
            If another jump is available from your landing square, you must continue with that same piece.
            The game locks you to that piece until the jump chain is complete.
          </p>
        </div>
      </InstructionSection>

      <InstructionSection title="Sidebar Tabs">
        <div className="gameplay-instruction-item">
          <p className="instruction-paragraph">
            The sidebar has four tabs: Stats, AI, Pieces, and Board.
          </p>
          <div className="level-block level-beginner">
            <span className="level-badge">Stats Tab</span>
            <ul className="level-details">
              <li>Shows both player cards with Material, Power, Strategy, Moves, and Total.</li>
              <li>Shows Move timer and Total timer for each player.</li>
              <li>Buttons that appear during an active game: New Game and Pause or Resume.</li>
              <li>Undo button appears only in Beginner difficulty after at least one full round (your move plus AI move).</li>
              <li>Tip controls (0.1 Pi, 0.5 Pi, 1 Pi) are shown on the human player card when payment status is idle.</li>
            </ul>
          </div>

          <div className="level-block level-intermediate">
            <span className="level-badge">AI Tab</span>
            <ul className="level-details">
              <li>Select Beginner, Intermediate, or Advanced difficulty before the game starts.</li>
              <li>Difficulty buttons are disabled once the game is in progress.</li>
              <li>Keep this level on new games controls whether New Game preserves your chosen difficulty.</li>
              <li>AI Moves First appears only when Advanced is selected, and can only be changed before the game starts.</li>
            </ul>
          </div>

          <div className="level-block level-advanced">
            <span className="level-badge">Pieces and Board Tabs</span>
            <ul className="level-details">
              <li>Pieces tab: change your checker color at any time. AI remains black.</li>
              <li>Board tab: switch board themes at any time; colors apply immediately.</li>
            </ul>
          </div>
        </div>
      </InstructionSection>

      <InstructionSection title="AI Levels and Gameplay Impact">
        <div className="gameplay-instruction-item">
          <div className="level-block level-beginner">
            <span className="level-badge">Beginner</span>
            <ul className="level-details">
              <li>AI chooses legal moves with randomized behavior, so play is less predictable and usually easier.</li>
              <li>Undo Move is available (after one full round).</li>
              <li>Beginner-only jump target marker appears on landing squares as a visual helper.</li>
              <li>AI Moves First option is not shown at this level.</li>
            </ul>
          </div>

          <div className="level-block level-intermediate">
            <span className="level-badge">Intermediate</span>
            <ul className="level-details">
              <li>AI uses Minimax with a shallow look-ahead for balanced play.</li>
              <li>No Undo Move at this level.</li>
              <li>No AI Moves First option at this level.</li>
              <li>This is the default level when Keep this level on new games is off.</li>
            </ul>
          </div>

          <div className="level-block level-advanced">
            <span className="level-badge">Expert (Advanced in the UI)</span>
            <ul className="level-details">
              <li>AI uses deeper Minimax with alpha-beta pruning and move ordering, so it plans stronger tactical sequences.</li>
              <li>No Undo Move at this level.</li>
              <li>AI Moves First option is available only here. When enabled, the board shows a tap-to-begin overlay so you can set options before AI starts.</li>
            </ul>
          </div>
        </div>
      </InstructionSection>

      <InstructionSection title="Buttons and When They Appear">
        <div className="gameplay-instruction-item">
          <ul className="level-details">
            <li>New Game: shown while a game is in progress. Restarts immediately.</li>
            <li>Pause or Resume: shown while a game is in progress. Pause is disabled during AI turn.</li>
            <li>Undo Move: shown only in Beginner and only after one full round is available to undo.</li>
            <li>Difficulty buttons: available before game start, disabled after first move.</li>
            <li>AI Moves First toggle: only visible in Advanced and disabled after game start.</li>
            <li>Tip buttons: available on the human card when payment status is idle; replaced by status messages while processing or after success or cancel.</li>
          </ul>
        </div>
      </InstructionSection>

      <InstructionSection title="Scoring Metrics">
        <div className="gameplay-instruction-item">
          <p className="instruction-paragraph">
            The Stats tab shows a live score breakdown for each side:
          </p>
          <div className="scoring-grid">
            <div className="scoring-row">
              <span className="scoring-label">Material</span>
              <span className="scoring-desc">Piece value total. Regular piece = 10 points, King = 15 points.</span>
            </div>
            <div className="scoring-row">
              <span className="scoring-label">Power</span>
              <span className="scoring-desc">King-only subtotal. Measures how much king strength you currently have.</span>
            </div>
            <div className="scoring-row">
              <span className="scoring-label">Strategy</span>
              <span className="scoring-desc">Positional value from mobility, advancement, center control, back-rank safety, and support.</span>
            </div>
            <div className="scoring-row">
              <span className="scoring-label">Moves</span>
              <span className="scoring-desc">Total turns completed by that player in the current game.</span>
            </div>
            <div className="scoring-row scoring-total">
              <span className="scoring-label">Total</span>
              <span className="scoring-desc">Material + Power + Strategy. Useful for comparing board advantage.</span>
            </div>
          </div>
        </div>
      </InstructionSection>

      <InstructionSection title="Board Animations and What They Mean">
        <div className="gameplay-instruction-item">
          <ul className="level-details">
            <li>Valid Move Pulse: when you select or hover a movable piece, legal destination squares pulse.</li>
            <li>Mandatory Jump Highlight: pieces that must jump are outlined and pulsing so you cannot miss forced captures.</li>
            <li>Beginner Jump Target Marker: in Beginner mode, landing squares for jump options display a target marker.</li>
            <li>AI Trail Start Marker: green highlighted start square shows where the AI move began.</li>
            <li>AI Capture Explosion: captured squares flash an explosion effect to make jump sequences clear.</li>
            <li>AI Landing Glow and Path: landing squares and diagonal path overlays show the exact route of AI multi-jumps.</li>
            <li>AI Goes First Overlay: when enabled in Advanced, the board waits for your tap before the first AI move.</li>
            <li>Toast Notifications: short messages appear for rule enforcement and status updates (for example mandatory jump warnings).</li>
          </ul>
        </div>
      </InstructionSection>

      <InstructionSection title="Extra Notes">
        <div className="gameplay-instruction-item">
          <ul className="level-details">
            <li>The game enforces mandatory jump rules for both click and drag interactions.</li>
            <li>If Keep this level on new games is off, New Game resets difficulty to Intermediate.</li>
            <li>If Keep this level on new games is on, New Game keeps your selected difficulty.</li>
          </ul>
        </div>
      </InstructionSection>

    </div>{/* end list */}

    <div className="instructions-actions">
      <button onClick={onBack} className="game-btn back-btn">Back</button>
    </div>
  </div>
  );
};

export default GamePlayInstructions;
