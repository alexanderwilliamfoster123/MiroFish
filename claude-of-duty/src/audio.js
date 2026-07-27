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

  // ===== flight-mode sounds =====

  // Continuous jet engine: layered noise + tonal whine, throttle-controlled.
  startEngine() {
    if (!this.ctx || this._engine) return;
    const t = this.ctx.currentTime;
    const out = this.ctx.createGain(); out.gain.value = 0.0; out.connect(this.master);

    // turbine whine (two detuned saws)
    const o1 = this.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 90;
    const o2 = this.ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 92;
    const whineGain = this.ctx.createGain(); whineGain.gain.value = 0.15;
    const whineLp = this.ctx.createBiquadFilter(); whineLp.type = 'lowpass'; whineLp.frequency.value = 1400;
    o1.connect(whineGain); o2.connect(whineGain); whineGain.connect(whineLp).connect(out);

    // combustion roar (looping noise through bandpass)
    const roar = this._noiseSrc(); roar.loop = true;
    const roarBp = this.ctx.createBiquadFilter(); roarBp.type = 'lowpass'; roarBp.frequency.value = 500;
    const roarGain = this.ctx.createGain(); roarGain.gain.value = 0.4;
    roar.connect(roarBp).connect(roarGain).connect(out);

    o1.start(t); o2.start(t); roar.start(t);
    this._engine = { out, o1, o2, whineLp, roarBp, roarGain };
  }

  setEngine(throttle, speed) {
    if (!this._engine) return;
    const e = this._engine; const now = this.ctx.currentTime;
    const th = Math.max(0, Math.min(1.2, throttle));
    e.out.gain.setTargetAtTime(0.25 + th * 0.25, now, 0.1);
    e.o1.frequency.setTargetAtTime(80 + th * 220, now, 0.15);
    e.o2.frequency.setTargetAtTime(82 + th * 224, now, 0.15);
    e.whineLp.frequency.setTargetAtTime(800 + th * 3000, now, 0.2);
    e.roarBp.frequency.setTargetAtTime(300 + th * 900 + speed * 0.4, now, 0.2);
  }

  stopEngine() {
    if (!this._engine) return;
    const e = this._engine; const t = this.ctx.currentTime;
    e.out.gain.setTargetAtTime(0, t, 0.2);
    try { e.o1.stop(t + 0.6); e.o2.stop(t + 0.6); } catch (_) {}
    this._engine = null;
  }

  cannon() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noiseSrc();
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.8;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    s.connect(bp).connect(g).connect(this.master); s.start(t); s.stop(t + 0.07);
    const o = this.ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.05);
    const og = this.ctx.createGain(); og.gain.setValueAtTime(0.3, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(og).connect(this.master); o.start(t); o.stop(t + 0.07);
  }

  missileLaunch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noiseSrc();
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(400, t);
    bp.frequency.exponentialRampToValueAtTime(2500, t + 0.5); bp.Q.value = 1.5;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    s.connect(bp).connect(g).connect(this.master); s.start(t); s.stop(t + 0.72);
  }

  lockTone(locked) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator(); o.type = 'square';
    o.frequency.value = locked ? 1500 : 900;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + (locked ? 0.08 : 0.05));
    o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.1);
  }

  explosion(dist = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const out = this.ctx.createGain(); out.gain.value = this._distGain(dist * 0.3) * 1.2; out.connect(this.master);
    const s = this._noiseSrc();
    const lp = this.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + 0.6);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(1.0, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    s.connect(lp).connect(g).connect(out); s.start(t); s.stop(t + 0.82);
    const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(80, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.5);
    const og = this.ctx.createGain(); og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(og).connect(out); o.start(t); o.stop(t + 0.62);
  }

  warn() {
    // missile-warning "beep beep"
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [0, 0.15].forEach((d) => {
      const t = t0 + d;
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 660;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.11);
    });
  }
}
