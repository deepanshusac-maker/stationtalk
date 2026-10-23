/**
 * Web Audio Transit Chime Synthesizer.
 *
 * Plays a warm, gentle two-tone railway arrival chime synthesized
 * dynamically using browser Web Audio API (0 external assets, zero latency).
 */

class TransitChime {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Plays a gentle, nostalgic 2-tone railway platform chime (e.g. C5 -> G4 -> C5).
   */
  public playArrivalChime(volume = 0.15) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0, duration: 0.35 },    // C5
        { freq: 659.25, time: 0.22, duration: 0.45 }, // E5
        { freq: 783.99, time: 0.46, duration: 0.7 },  // G5
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Warm harmonic overtone
        const overtone = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(volume, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

        overtoneGain.gain.setValueAtTime(0, now + time);
        overtoneGain.gain.linearRampToValueAtTime(volume * 0.25, now + time + 0.02);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration * 0.7);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        gain.connect(ctx.destination);
        overtoneGain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + duration);
        overtone.start(now + time);
        overtone.stop(now + time + duration);
      });
    } catch {
      // AudioContext autoplay restrictions or disabled sound
    }
  }
}

export const transitChime = new TransitChime();
