import React from 'react';
import './GamePlayInstructions.css';


interface GamePlayInstructionsProps {
  onBack: () => void;
}

export const GamePlayInstructions: React.FC<GamePlayInstructionsProps> = ({ onBack }) => (
  <div className="gameplay-instructions-container">
    <h2>How to Play</h2>

    <div className="gameplay-instructions-list">

      {/* ── GETTING STARTED ── */}
      <div className="gameplay-instruction-item">
        <strong>Getting Started</strong>
        <p className="instruction-paragraph">
          Capture all of your opponent's pieces, or block them so they cannot move.
          You play as Red (colour is customisable) and the AI plays as Black.
          Red always moves first (unless the AI in advanced mode and is set to move first). Play is on the dark squares of an 8×8 board.
        </p>
      </div>

      {/* ── MOVEMENT & PROMOTION ── */}
      <div className="gameplay-instruction-item">
        <strong>Movement &amp; Promotion</strong>
        <p className="instruction-paragraph">
          Pieces move diagonally forward to adjacent empty dark squares.
          When a piece reaches the opponent's back rank it is crowned a <em>King</em> —
          marked with a golden crown — and may then move and capture in all four diagonal directions.
        </p>
      </div>

      {/* ── CAPTURING ── */}
      <div className="gameplay-instruction-item">
        <strong>Mandatory Capturing</strong>
        <p className="instruction-paragraph">
          If a jump is available you <em>MUST</em> take it. The jumped piece is removed.
          If further jumps are possible with the same piece after landing, you <em>MUST</em> keep jumping
          until no more captures are available (multi-jump).
        </p>
      </div>

      {/* ── DIFFICULTY LEVELS ── */}
      <div className="gameplay-instruction-item">
        <strong>Difficulty Levels</strong>
        <p className="instruction-paragraph">
          Choose your level on the <em>AI</em> tab before the game starts.
          AI settings are locked once the first move is made.
        </p>

        <div className="level-block level-beginner">
          <span className="level-badge">🟢 Beginner</span>
          <ul className="level-details">
            <li>AI makes simplified, mostly random moves.</li>
            <li><span className="feature-on">✔ Undo Move</span> — reverses your last move <em>and</em> the AI's reply.
            You may undo back to the start of the game.</li>
            <li><span className="feature-off">✘ AI Moves First</span> — not available at this level.</li>
          </ul>
        </div>

        <div className="level-block level-intermediate">
          <span className="level-badge">🟡 Intermediate</span>
          <ul className="level-details">
            <li>AI uses the Minimax algorithm — it looks ahead and prioritises captures.</li>
            <li><span className="feature-off">✘ Undo Move</span> — disabled.</li>
            <li><span className="feature-off">✘ AI Moves First</span> — not available at this level.</li>
            <li>This is the default level when starting a new game (unless Lock AI Level is on).</li>
          </ul>
        </div>

        <div className="level-block level-advanced">
          <span className="level-badge">🔴 Advanced</span>
          <ul className="level-details">
            <li>Deep Minimax with alpha-beta pruning — thinks several moves ahead and plays to win.</li>
            <li><span className="feature-off">✘ Undo Move</span> — disabled.</li>
            <li><span className="feature-on">✔ AI Moves First</span> — toggle on the AI tab for maximum difficulty; the AI strikes before you've placed a piece. An overlay appears on the board prompting you to tap when you're ready.</li>
          </ul>
        </div>
      </div>

      {/* ── GAME CONTROLS ── */}
      <div className="gameplay-instruction-item">
        <strong>Game Controls</strong>
        <ul className="level-details">
          <li><strong>New Game</strong> — restarts immediately. If <em>Lock AI Level</em> is on your chosen difficulty carries over; otherwise the level resets to Intermediate.</li>
          <li><strong>Lock AI Level</strong> (AI tab) — when checked, your selected difficulty is remembered across new games for the current session. Enabled by default.</li>
          <li><strong>⏸ Pause</strong> (Stats tab) — stops the clock and blocks input. Disabled during the AI's turn.</li>
          <li><strong>Undo Move</strong> — Beginner only. Appears when at least one full round (your move + AI reply) has been played.</li>
        </ul>
      </div>

      {/* ── SCORING METRICS ── */}
      <div className="gameplay-instruction-item">
        <strong>Scoring Metrics</strong>
        <p className="instruction-paragraph">
          Each player's card on the Stats tab shows a live score breakdown:
        </p>
        <div className="scoring-grid">
          <div className="scoring-row">
            <span className="scoring-label">Material</span>
            <span className="scoring-desc">Sum of all your pieces on the board. Regular piece&nbsp;= 10 pts, King&nbsp;= 15 pts. Drops as pieces are captured.</span>
          </div>
          <div className="scoring-row">
            <span className="scoring-label">Power</span>
            <span className="scoring-desc">King bonus only — starts at 0 and grows only when you have crowned pieces (15 pts each). A good measure of board control late in the game.</span>
          </div>
          <div className="scoring-row">
            <span className="scoring-label">Strategy</span>
            <span className="scoring-desc">Positional score: mobility (available moves), advancement (how far forward your pieces are), center control, back-rank safety, and piece support.</span>
          </div>
          <div className="scoring-row">
            <span className="scoring-label">Moves</span>
            <span className="scoring-desc">Total number of turns taken by this player this game — available at all difficulty levels.</span>
          </div>
          <div className="scoring-row scoring-total">
            <span className="scoring-label">Total</span>
            <span className="scoring-desc">Material + Power + Strategy combined. The higher this number relative to your opponent's, the stronger your current board position.</span>
          </div>
        </div>
      </div>

      {/* ── VISUAL AIDS ── */}
      <div className="gameplay-instruction-item">
        <strong>Visual Aids</strong>
        <ul className="level-details">
          <li><strong>AI Trail</strong> — a green start square, explosion on captures, and an amethyst glow on the landing square so you can always follow the AI's last move.</li>
          <li><strong>Jump Hints</strong> — pieces with mandatory jumps pulse subtly at Beginner and Intermediate levels.</li>
          <li><strong>Move &amp; Total timers</strong> — the Stats tab shows time spent on the current move and total time per player.</li>
        </ul>
      </div>

      {/* ── CUSTOMISATION ── */}
      <div className="gameplay-instruction-item">
        <strong>Customisation</strong>
        <ul className="level-details">
          <li><strong>Player Color</strong> (Pieces tab) — choose Red, Blue, Green, Purple, Orange, or Pink. The AI always plays Black.</li>
          <li><strong>Board Colors</strong> (Board tab) — several colour schemes for the board squares. Changes apply instantly at any time.</li>
        </ul>
      </div>

    </div>{/* end list */}

    <div className="instructions-actions">
      <button onClick={onBack} className="game-btn back-btn">Back</button>
    </div>
  </div>
);

export default GamePlayInstructions;
