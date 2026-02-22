import React from 'react';
import './GamePlayInstructions.css';


interface GamePlayInstructionsProps {
  onBack: () => void;
}

interface InstructionItem {
  title: string;
  text: string | string[];
}


const instructions: InstructionItem[] = [
  {
    title: 'Getting Started',
    text: [
      'Welcome to Checkers4Pi! The goal is simple: capture all of your opponent\'s pieces or block them so they cannot move.',
      'You play as Red ( with options to change your color), and the AI plays as Black. Red always moves first. The game is played on the dark squares of an 8x8 board.'
    ]
  },
  {
    title: 'Movement & Promotion',
    text: [
      'Pieces move diagonally forward to adjacent empty dark squares.',
      'When a piece reaches the farthest row (the "back rank"), it is promoted to a King. Kings are distinguished by a golden crown and can move and capture both forward and backward.'
    ]
  },
  {
    title: 'Mandatory Capturing',
    text: [
      'If you can jump over an opponent\'s piece to an empty square, you MUST do so. The jumped piece is then captured.',
      'If you land in a position where another jump is possible with the same piece, you must continue jumping until no more captures are available.'
    ]
  },
  {
    title: 'AI Opponent',
    text: [
      'There are three difficulty levels: Beginner, Intermediate, and Advanced. Difficulty settings are locked once a match starts to ensure game stability.',
      'Beginner: The AI makes simplified moves. You can "Undo" your last move to try a different strategy.',
      'Intermediate & Advanced: The AI uses a professional Minimax algorithm to think several moves ahead. "Undo" is disabled in these modes.',
      'Advanced + AI First: For the ultimate challenge, you can allow the AI to move first.'
    ]
  },
  {
    title: 'Match Controls',
    text: [
      'New Match: If you wish to change difficulty or restart a game, use the "New" button in the Sidebar.',
      'Thinking Ticks: During AI turns, a pulsing ⏱️ icon appears. If the AI background process takes too long, the system will automatically complete a safe move for you.'
    ]
  },
  {
    title: 'Visual Aids',
    text: [
      'AI Trails: When the AI moves, its path is highlighted. A green square marks the start, captured pieces are indicated by an explosion animation, and an Amethyst glow marks where the piece landed.',
      'Jump Hints: In Beginner and Intermediate modes, pieces with available jumps will pulse with a subtle hint to help you spot mandatory moves.'
    ]
  }
];

const renderText = (text: string | string[]) => {
  if (Array.isArray(text)) {
    return text.map((paragraph, idx) => (
      <p key={idx} className="instruction-paragraph">{paragraph}</p>
    ));
  }
  return text;
};

// This creates a standard JavaScript string
const backLabel = 'Back';

export const GamePlayInstructions: React.FC<GamePlayInstructionsProps> = ({ onBack }) => (
  <div className="gameplay-instructions-container">
    <h2>How to Play</h2>

    <div className="gameplay-instructions-list">
      {instructions.map((item, index) => (
        <div key={index} className="gameplay-instruction-item">
          <strong>{item.title}</strong>
          <div>{renderText(item.text)}</div>
        </div>
      ))}
    </div>

    <div className="instructions-actions">
      <button
        onClick={onBack}
        className="game-btn back-btn"
      >
        {backLabel}
      </button>
    </div>
  </div>
);

export default GamePlayInstructions;
