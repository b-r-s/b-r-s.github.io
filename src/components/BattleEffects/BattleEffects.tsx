import React, { useEffect } from 'react';
import './BattleEffects.css';

export interface BattleEffectsProps {
  activeEffect: 'splash' | 'explosion' | 'sunk' | 'text' | null;
  position?: { x: number; y: number };
  text?: string;
  variant?: 'default' | 'gold';
  onComplete?: () => void;
}

export const BattleEffects: React.FC<BattleEffectsProps> = ({
  activeEffect,
  position,
  text,
  variant = 'default',
  onComplete
}) => {
  useEffect(() => {
    if (!activeEffect) return;

    // Fallback timeout in case animation end doesn't fire or just as a safety net
    // The longest animation in CSS is 2s (sinkShip, textFade)
    const timeoutId = setTimeout(() => {
      // We rely on onAnimationEnd primarily, but this could be a safety
    }, 2100);

    return () => clearTimeout(timeoutId);
  }, [activeEffect]);

  const handleAnimationEnd = () => {
    if (onComplete) {
      onComplete();
    }
  };

  if (!activeEffect) return null;

  return (
    <div className="battle-effect-container">
      {activeEffect === 'splash' && (
        <div
          className="effect-splash"
          onAnimationEnd={handleAnimationEnd}
          style={position ? { position: 'absolute', left: position.x, top: position.y } : {}}
        >
          💧
        </div>
      )}

      {activeEffect === 'explosion' && (
        <div
          className={`effect-explosion ${variant}`}
          onAnimationEnd={handleAnimationEnd}
          style={position ? { position: 'absolute', left: position.x, top: position.y } : {}}
        >
          💥
        </div>
      )}

      {activeEffect === 'sunk' && (
        <div className="effect-sunk-emoji" onAnimationEnd={handleAnimationEnd}>
          🚢
        </div>
      )}

      {activeEffect === 'text' && text && (
        <div className="effect-text" onAnimationEnd={handleAnimationEnd}>
          {text}
        </div>
      )}
    </div>
  );
};
