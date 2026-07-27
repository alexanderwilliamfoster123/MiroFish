// audio.js — fully synthesized sound, no audio files.
// Weapon fire, impacts, footsteps, damage, UI, and ambient pad are all
// generated with the Web Audio API at runtime (mirrors the original's
// "no art assets" constraint).

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.noiseBuf = null;
  }

  // Must be called from a user gesture (pointer lock / click).
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6;

    // gentle limiter so overlapping shots don't clip
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 24; comp.ratio.value = 8;
    comp.attack.value = 0.002; comp.release.value = 0.2;
    this.master.connect(comp).connect(this.ctx.destination);

    this.noiseBuf = this._makeNoise(1.0);
    this._startAmbient();
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  setVolume(v) { if (this.master) this.master.gain.value = v; }

  _makeNoise(seconds) {
    const n = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  _noiseSrc() { const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; return s; }

  // Low-frequency ambient wind/rumble bed.
  _startAmbient() {
    const t = this.ctx.currentTime;
    const g = this.ctx.createGain(); g.gain.value = 0.05; g.connect(this.master);
    const src = this._noiseSrc(); src.loop = true;
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.4;
    src.connect(lp).connect(g);
    // slow LFO on the filter for a breathing wind feel
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lfoG = this.ctx.createGain(); lfoG.gain.value = 140;
    lfo.connect(lfoG).connect(lp.frequency);
    src.start(t); lfo.start(t);

    const drone = this.ctx.createOscillator(); drone.type = 'sine'; drone.frequency.value = 42;
    const dg = this.ctx.createGain(); dg.gain.value = 0.03; drone.connect(dg).connect(this.master); drone.start(t);
  }

  // 3D-ish attenuation from distance (simple, cheap).
  _distGain(dist) { return Math.min(1, 8 / (dist + 1)); }

  gunshot(dist = 0) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const out = this.ctx.createGain();
    out.gain.value = this._distGain(dist) * 0.9;
    out.connect(this.master);

    // Sharp transient: filtered noise burst
    const src = this._noiseSrc();
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(1.0, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(bp).connect(env).connect(out);
    src.start(t); src.stop(t + 0.13);

    // Low body thump
    const osc = this.ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.09);
    const oe = this.ctx.createGain();
    oe.gain.setValueAtTime(0.7, t); oe.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(oe).connect(out); osc.start(t); osc.stop(t + 0.11);

    // Crack (high click)
    const crack = this._noiseSrc();
    const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
    const ce = this.ctx.createGain(); ce.gain.setValueAtTime(0.5, t); ce.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    crack.connect(hp).connect(ce).connect(out); crack.start(t); crack.stop(t + 0.04);
  }

  dryFire() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'square'; o.frequency.value = 900;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.05);
  }

  reload() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    // mag out, mag in, charging handle — three metallic clicks
    [0, 0.35, 0.7].forEach((d, i) => {
      const t = t0 + d;
      const s = this._noiseSrc();
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = [1200, 900, 2200][i]; bp.Q.value = 3;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      s.connect(bp).connect(g).connect(this.master); s.start(t); s.stop(t + 0.07);
    });
  }

  impact(dist = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noiseSrc();
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.2;
    const g = this.ctx.createGain(); g.gain.value = this._distGain(dist) * 0.35;
    g.gain.setValueAtTime(g.gain.value, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    s.connect(bp).connect(g).connect(this.master); s.start(t); s.stop(t + 0.07);
  }

  hitConfirm() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(2000, t + 0.05);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.09);
  }

  enemyFire(dist) { this.gunshot(dist + 3); }

  playerHurt() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.25);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    o.connect(lp).connect(g).connect(this.master); o.start(t); o.stop(t + 0.3);
  }

  footstep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noiseSrc();
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    s.connect(lp).connect(g).connect(this.master); s.start(t); s.stop(t + 0.11);
  }

  waveStart() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [523, 659, 784].forEach((f, i) => {
      const t = t0 + i * 0.12;
      const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.31);
    });
  }

  gameOver() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [392, 330, 262, 196].forEach((f, i) => {
      const t = t0 + i * 0.18;
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
      o.connect(lp).connect(g).connect(this.master); o.start(t); o.stop(t + 0.52);
    });
  }

  victory() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const t = t0 + i * 0.14;
      const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.42);
    });
  }
}
