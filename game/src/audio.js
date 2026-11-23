// Procedural Web Audio sound engine: crisp card flicks, wood snaps, brass chimes, and fanfares.

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, duration, type = 'triangle', gainPeak = 0.12, delay = 0, endFreq = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(duration, filterFreq = 1800, gainPeak = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.45));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, now);
    filter.Q.setValueAtTime(1.4, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainPeak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  cardSelect(selected = true) {
    this.playNoise(0.055, selected ? 2600 : 1600, 0.075);
    this.playTone(selected ? 520 : 340, 0.08, 'triangle', 0.07, 0, selected ? 680 : 260);
  }

  cardDeal() {
    for (let i = 0; i < 4; i += 1) {
      this.playNoise(0.06, 2100 + i * 180, 0.055, i * 0.055);
    }
  }

  tableSnap() {
    this.playNoise(0.07, 900, 0.14);
    this.playTone(165, 0.11, 'sine', 0.14, 0, 72);
  }

  comboChime(tier = 1) {
    const notes = tier >= 2 ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37, 659.25];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, 'triangle', 0.09, idx * 0.055);
    });
  }

  clashImpact(playerWon, trumped) {
    this.tableSnap();
    if (playerWon) {
      this.comboChime(trumped ? 2 : 1);
    } else {
      this.playTone(210, 0.25, 'sawtooth', 0.07, 0.04, 118);
      this.playTone(145, 0.3, 'triangle', 0.09, 0.08, 92);
    }
  }

  invalidBuzz() {
    this.playTone(170, 0.11, 'sawtooth', 0.055, 0, 140);
  }

  victoryFanfare() {
    const chord = [392.0, 493.88, 587.33, 783.99, 987.77];
    chord.forEach((freq, idx) => {
      this.playTone(freq, 0.55, 'triangle', 0.1, idx * 0.075);
      this.playTone(freq * 0.5, 0.65, 'sine', 0.06, idx * 0.075);
    });
  }

  defeatChord() {
    const notes = [293.66, 261.63, 220.0, 174.61];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.65, 'triangle', 0.08, idx * 0.11, freq * 0.96);
    });
  }

  gambitGong() {
    this.playTone(196, 0.55, 'triangle', 0.14, 0, 188);
    this.playTone(392, 0.45, 'sine', 0.09, 0.02, 384);
    this.playTone(587.33, 0.35, 'triangle', 0.06, 0.04);
  }

  relicClaim() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone(f, 0.32, 'triangle', 0.09, i * 0.055);
    });
  }
}
