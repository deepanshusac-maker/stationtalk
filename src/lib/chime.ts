/**
 * Soothing Audio Synthesizer for StationTalk.
 *
 * Generates a warm, gentle acoustic resonance (similar to a wooden kalimba
 * or soft water droplet) through a low-pass filter with zero harsh highs.
 */

class SoothingSound {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
   * Plays a calm, gentle acoustic tone (warm low-pass filtered marimba/kalimba drop).
   * Extremely soft, warm, and relaxing.
   */
  public playArrivalChime(volume = 0.08) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master low-pass filter to eliminate any sharp or piercing high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);
      filter.Q.setValueAtTime(1.2, now);
      filter.connect(ctx.destination);

      // Two warm harmonic frequencies (E4: 329.63Hz, B4: 493.88Hz) — peaceful perfect fifth
      const notes = [
        { freq: 329.63, delay: 0, duration: 0.55 },
        { freq: 493.88, delay: 0.06, duration: 0.65 },
      ];

      notes.forEach(({ freq, delay, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + delay);

        // Soft, gentle swell and natural acoustic exponential decay
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(volume, now + delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now + delay);
        osc.stop(now + delay + duration);
      });
    } catch {
      // AudioContext autoplay restrictions or disabled sound
    }
  }
}

export const transitChime = new SoothingSound();
