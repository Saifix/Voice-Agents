/* ------------------------------------------------------------------ *
 *  AudioEngine — owns the mic capture, the gap-free playback scheduler
 *  and the WebSocket relay to the backend. UI-agnostic: it reports back
 *  through the `handlers` callbacks passed to the constructor.
 *
 *  handlers = {
 *    onReady(info),      // live session opened  { model, voice, name }
 *    onAnalysers(u, a),  // analyser nodes ready (for the visualizer)
 *    onText(text),       // streamed transcript text
 *    onStatus(text),     // status-line updates
 *    onClose(),          // session ended / socket closed
 *    onError(message),
 *  }
 * ------------------------------------------------------------------ */
const SEND_RATE = 16000;
const RECV_RATE = 24000;

export class AudioEngine {
  constructor(handlers = {}) {
    this.h = handlers;
    this.ws = null;
    this.micCtx = null;
    this.playCtx = null;
    this.micStream = null;
    this.workletNode = null;
    this.micSource = null;
    this.userAnalyser = null;
    this.agentAnalyser = null;
    this.playGain = null;
    this.muted = false;
    this.ready = false;      // true once Gemini's live session is up
    this.playHead = 0;
    this.scheduled = [];
    this.active = false;
  }

  async start({ scenarioId, ...profile }) {
    this._profile = profile;       // { name, email, phone, country_code }
    this._scenarioId = scenarioId;
    await this._setupAudio();
    this._connectWs();
  }

  async _setupAudio() {
    // --- Mic capture @ 16 kHz ---
    this.micStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });

    this.micCtx = new AudioContext({ sampleRate: SEND_RATE });
    await this.micCtx.audioWorklet.addModule("/capture-processor.js");

    this.micSource = this.micCtx.createMediaStreamSource(this.micStream);
    this.userAnalyser = this.micCtx.createAnalyser();
    this.userAnalyser.fftSize = 1024;
    this.userAnalyser.smoothingTimeConstant = 0.7;
    this.micSource.connect(this.userAnalyser);

    this.workletNode = new AudioWorkletNode(this.micCtx, "capture-processor");
    this.micSource.connect(this.workletNode);
    this.workletNode.port.onmessage = (e) => {
      // Don't stream audio until Gemini's session is ready (avoids losing the
      // user's first words during the ~5s connect).
      if (!this.ready || this.muted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      this.ws.send(floatToPCM16(e.data));
    };

    // --- Playback @ 24 kHz ---
    this.playCtx = new AudioContext({ sampleRate: RECV_RATE });
    this.playGain = this.playCtx.createGain();
    this.agentAnalyser = this.playCtx.createAnalyser();
    this.agentAnalyser.fftSize = 1024;
    this.agentAnalyser.smoothingTimeConstant = 0.7;
    this.playGain.connect(this.agentAnalyser);
    this.agentAnalyser.connect(this.playCtx.destination);

    // Make sure neither context is left suspended by autoplay policy
    // (would otherwise silently drop playback / capture).
    try { await this.micCtx.resume(); } catch (_) {}
    try { await this.playCtx.resume(); } catch (_) {}

    this.h.onAnalysers?.(this.userAnalyser, this.agentAnalyser);
  }

  _connectWs() {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () =>
      ws.send(JSON.stringify({ type: "start", ...this._profile, scenario_id: this._scenarioId }));
    ws.onmessage = (ev) => {
      if (typeof ev.data === "string") this._handleControl(JSON.parse(ev.data));
      else this._enqueueAudio(ev.data);
    };
    ws.onerror = () => this.h.onStatus?.("Connection error.");
    ws.onclose = () => { if (this.active) { this.active = false; this.h.onClose?.(); } };
  }

  _handleControl(msg) {
    switch (msg.type) {
      case "ready":
        this.active = true;
        this.ready = true;   // open the mic gate — start streaming audio now
        this.h.onReady?.(msg);
        break;
      case "text":
        this.h.onText?.(msg.text);
        break;
      case "interrupted":
        this._flushPlayback();
        break;
      case "limit_reached":
        this.h.onLimit?.();
        break;
      case "turn_complete":
        break;
      case "error":
        this.h.onError?.(msg.message || "An error occurred.");
        break;
    }
  }

  _enqueueAudio(arrayBuffer) {
    const ctx = this.playCtx;
    if (!ctx) return;
    const pcm = new Int16Array(arrayBuffer);
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;

    const buffer = ctx.createBuffer(1, f32.length, RECV_RATE);
    buffer.copyToChannel(f32, 0);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.playGain);

    const now = ctx.currentTime;
    if (this.playHead < now) this.playHead = now + 0.04;
    src.start(this.playHead);
    this.playHead += buffer.duration;

    this.scheduled.push(src);
    src.onended = () => {
      const i = this.scheduled.indexOf(src);
      if (i >= 0) this.scheduled.splice(i, 1);
    };
  }

  _flushPlayback() {
    for (const src of this.scheduled) { try { src.stop(); } catch (_) {} }
    this.scheduled = [];
    this.playHead = 0;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  sendText(text) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "text", text }));
    }
  }

  stop(sendStop = true) {
    this.active = false;
    if (sendStop && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify({ type: "stop" })); } catch (_) {}
    }
    try { this.ws && this.ws.close(); } catch (_) {}
    this._flushPlayback();
    [this.micCtx, this.playCtx].forEach((c) => { try { c && c.close(); } catch (_) {} });
    this.micStream && this.micStream.getTracks().forEach((t) => t.stop());
  }
}

function floatToPCM16(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out.buffer;
}
