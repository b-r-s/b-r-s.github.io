// Simple synth sounds using Web Audio API to avoid external assets

// Singleton AudioContext
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  // AudioContext often starts in 'suspended' state until first user interaction.
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playMoveSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 300;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Silent fail
  }
};

export const playJumpSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
    osc.type = 'triangle';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Silent fail
  }
};

export const playKingSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Fanfare-ish
    const now = ctx.currentTime;
    osc.type = 'square';

    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    osc.start();
    osc.stop(now + 0.8);
  } catch (e) {
    // Silent fail
  }
};

// AI-specific sounds with different tones
export const playAIMoveSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 450; // Higher frequency than human
    osc.type = 'square'; // Different waveform (human uses sine)

    gain.gain.setValueAtTime(0.15, ctx.currentTime); // Louder than human (0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Silent fail
  }
};

export const playAIJumpSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(550, ctx.currentTime); // Much higher than human (400Hz)
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.1); // Higher peak (vs 600Hz)
    osc.type = 'sawtooth'; // Different waveform (human uses triangle)

    gain.gain.setValueAtTime(0.15, ctx.currentTime); // Louder than human (0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Silent fail
  }
};
