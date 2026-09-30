/**
 * Enterprise Web Audio synthesizer for real-time notification sounds.
 * Generates pleasant, crystal-clear chimes in pure Web Audio API without needing external MP3 files.
 */
let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playNotificationSound = (type = "TRANSACTION", volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(Math.min(Math.max(volume, 0.05), 1.0), now);

    if (type === "TRANSACTION" || type === "SALE" || type === "PAYMENT" || type === "SUCCESS") {
      // Crisp 3-note ascending cash register / POS success chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        noteGain.gain.setValueAtTime(0, now + idx * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } else if (type === "WARNING" || type === "DANGER" || type === "INVENTORY") {
      // Attention chime (double alert tone)
      const freqs = [620, 520];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        noteGain.gain.setValueAtTime(0, now + idx * 0.15);
        noteGain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
    } else {
      // Pleasant ambient announcement bell
      const freqs = [587.33, 880.00]; // D5, A5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        noteGain.gain.setValueAtTime(0, now + idx * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.55);
      });
    }
  } catch (err) {
    console.debug("Audio chime skipped:", err);
  }
};
