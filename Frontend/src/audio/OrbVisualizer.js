/* ------------------------------------------------------------------ *
 *  OrbVisualizer — a glowing, breathing orb wrapped in a live radial
 *  waveform. Reacts to two audio analysers:
 *    - userAnalyser   (mic input)   -> teal energy
 *    - agentAnalyser  (AI playback) -> magenta energy
 *  Whichever side is louder tints the orb; idle = gentle violet breathing.
 * ------------------------------------------------------------------ */
export class OrbVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.userAnalyser = null;
    this.agentAnalyser = null;
    this.running = false;
    this.t = 0;
    this.userLevel = 0;
    this.agentLevel = 0;
    this.NPOINTS = 96;
    this.wave = new Float32Array(this.NPOINTS);

    // Colours: user energy is teal; agent + idle follow the scenario accent.
    this.USER_RGB = [45, 212, 191];      // #2dd4bf
    this.accentRgb = [91, 157, 255];     // #5b9dff default (brand blue)
    this.idleRgb = this._idleFrom(this.accentRgb);

    this._resize = this._resize.bind(this);
    this._loop = this._loop.bind(this);
    window.addEventListener("resize", this._resize);
    this._resize();
  }

  setAnalysers(userAnalyser, agentAnalyser) {
    this.userAnalyser = userAnalyser;
    this.agentAnalyser = agentAnalyser;
    if (userAnalyser) this._uData = new Uint8Array(userAnalyser.frequencyBinCount);
    if (agentAnalyser) this._aData = new Uint8Array(agentAnalyser.frequencyBinCount);
  }

  setAccent(hex) {
    const rgb = hexToRgb(hex);
    if (rgb) {
      this.accentRgb = rgb;
      this.idleRgb = this._idleFrom(rgb);
    }
  }

  // A softened, slightly lightened version of the accent for the idle state.
  _idleFrom(rgb) {
    return [
      Math.round(rgb[0] * 0.55 + 150 * 0.45),
      Math.round(rgb[1] * 0.55 + 160 * 0.45),
      Math.round(rgb[2] * 0.55 + 185 * 0.45),
    ];
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width) return;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = rect.width;
    this.h = rect.height;
  }

  resize() { this._resize(); }

  start() {
    if (this.running) return;
    this.running = true;
    this._resize();
    requestAnimationFrame(this._loop);
  }

  stop() {
    this.running = false;
    window.removeEventListener("resize", this._resize);
  }

  _rms(analyser, data) {
    if (!analyser || !data) return 0;
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / data.length);
  }

  _freqInto(analyser, data, out) {
    if (!analyser || !data) return;
    analyser.getByteFrequencyData(data);
    const n = out.length;
    const bins = Math.floor(data.length * 0.6);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor((i / n) * bins);
      const target = data[idx] / 255;
      out[i] += (target - out[i]) * 0.25;
    }
  }

  _loop() {
    if (!this.running) return;
    this.t += 0.016;
    const { ctx, w, h } = this;
    if (!w || !h) { requestAnimationFrame(this._loop); return; }
    const cx = w / 2, cy = h / 2;
    const base = Math.min(w, h) * 0.22;

    const uTarget = this._rms(this.userAnalyser, this._uData) * 2.2;
    const aTarget = this._rms(this.agentAnalyser, this._aData) * 2.4;
    this.userLevel += (Math.min(uTarget, 1) - this.userLevel) * 0.18;
    this.agentLevel += (Math.min(aTarget, 1) - this.agentLevel) * 0.18;

    const agentDom = this.agentLevel >= this.userLevel;
    this._freqInto(agentDom ? this.agentAnalyser : this.userAnalyser,
                   agentDom ? this._aData : this._uData, this.wave);

    const energy = Math.max(this.userLevel, this.agentLevel);
    const breathe = (Math.sin(this.t * 1.4) * 0.5 + 0.5) * 0.06;
    const radius = base * (1 + breathe + energy * 0.55);

    const c = agentDom
      ? this._mix(this.idleRgb, this.accentRgb, Math.min(this.agentLevel * 1.6, 1))
      : this._mix(this.idleRgb, this.USER_RGB, Math.min(this.userLevel * 1.6, 1));

    ctx.clearRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.4);
    glow.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${0.30 + energy * 0.4})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    ctx.beginPath();
    for (let i = 0; i <= this.NPOINTS; i++) {
      const k = i % this.NPOINTS;
      const ang = (k / this.NPOINTS) * Math.PI * 2 - Math.PI / 2;
      const wob = this.wave[k] * base * 0.9 + Math.sin(this.t * 2 + k * 0.4) * 2;
      const r = radius * 1.18 + wob;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.55 + energy * 0.4})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Soft gradient "shadow" orb — fades to transparent at the rim so it
    // reads as a glowing volume of light rather than a solid ball.
    const orbR = radius * 1.4;
    const core = ctx.createRadialGradient(
      cx, cy - radius * 0.12, radius * 0.04,
      cx, cy, orbR
    );
    core.addColorStop(0.00, `rgba(255,255,255,${0.78 + energy * 0.18})`);
    core.addColorStop(0.16, `rgba(${c[0]},${c[1]},${c[2]},0.88)`);
    core.addColorStop(0.50, `rgba(${c[0]},${c[1]},${c[2]},0.40)`);
    core.addColorStop(0.78, `rgba(${c[0]},${c[1]},${c[2]},0.14)`);
    core.addColorStop(1.00, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle = core;
    ctx.fill();

    requestAnimationFrame(this._loop);
  }

  _mix(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }
}

function hexToRgb(hex) {
  if (!hex) return null;
  const m = hex.replace("#", "").match(/^([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
