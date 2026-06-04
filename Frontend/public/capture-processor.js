/* AudioWorklet that buffers mic samples and posts them in fixed-size chunks.
 * The AudioContext is created at 16 kHz, so no resampling is needed here —
 * we just accumulate Float32 samples and ship ~128 ms chunks to the main
 * thread, which converts them to PCM16 and sends them over the WebSocket. */
class CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = new Float32Array(2048); // ~128 ms at 16 kHz
    this._idx = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const channel = input[0];
      for (let i = 0; i < channel.length; i++) {
        this._buf[this._idx++] = channel[i];
        if (this._idx === this._buf.length) {
          this.port.postMessage(this._buf.slice(0));
          this._idx = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("capture-processor", CaptureProcessor);
