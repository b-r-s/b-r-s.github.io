import { useEffect, useState } from 'react';
import './FallingEmojis.css';

const EMOJIS = ['🔴', '👑', '🎉', '🔥', '✨', '🏆'];

interface Emoji {
  id: number;
  char: string;
  left: number;
  animationDuration: number;
  delay: number;
}

export const FallingEmojis = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Generate random emojis
    const newEmojis = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      char: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100, // Random horizontal position
      animationDuration: 2 + Math.random() * 3, // Random fall speed (2-5s)
      delay: Math.random() * 2 // Random start delay
    }));
    setEmojis(newEmojis);

    // Hide after 4.5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="falling-emojis-container">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="falling-emoji"
          style={{
            '--emoji-left': `${emoji.left}%`,
            '--emoji-animation': `fall ${emoji.animationDuration}s linear ${emoji.delay}s 1 forwards`
          } as React.CSSProperties}
        >
          {emoji.char}
        </div>
      ))}
    </div>
  );
};
