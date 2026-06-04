import React, { useEffect, useRef, useState } from "react";
import Visualizer from "./Visualizer.jsx";
import { AudioEngine } from "../audio/AudioEngine.js";

export default function CallView({ user, scenario, onEnd }) {
  const engineRef = useRef(null);
  const startedRef = useRef(false);   // guard against StrictMode double-mount
  const tickRef = useRef(null);
  const [analysers, setAnalysers] = useState({ user: null, agent: null });
  const [status, setStatus] = useState("Connecting…");
  const [statusHtml, setStatusHtml] = useState(null);
  const [caption, setCaption] = useState("");
  const [muted, setMuted] = useState(false);
  const [remaining, setRemaining] = useState(null); // seconds left
  const [ended, setEnded] = useState(false);
  const [connecting, setConnecting] = useState(true);

  function startCountdown(seconds) {
    setRemaining(seconds);
    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return r;
        if (r <= 1) { clearInterval(tickRef.current); return 0; }
        return r - 1;
      });
    }, 1000);
  }

  function finish(reason) {
    if (ended) return;
    setEnded(true);
    clearInterval(tickRef.current);
    engineRef.current?.stop(true);
    if (reason === "limit") {
      setConnecting(false);
      setStatusHtml(null);
      setStatus("Time's up — 2 minute limit reached.");
      setCaption("This demo is limited to 2 minutes per session.");
      setTimeout(() => onEnd(), 2200);
    } else {
      onEnd();
    }
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const engine = new AudioEngine({
      onAnalysers: (user, agent) => setAnalysers({ user, agent }),
      onReady: (info) => {
        setConnecting(false);
        setStatusHtml(`<strong>${info.scenario || "Assistant"}</strong> · voice <strong>${info.voice}</strong>`);
        setCaption(`Hi ${info.name}, I'm listening…`);
        startCountdown(info.max_seconds || 120);
      },
      onText: (t) => setCaption((c) => (c + t).slice(-400)),
      onStatus: (s) => { setStatusHtml(null); setStatus(s); },
      onError: (m) => { setConnecting(false); setStatusHtml(null); setStatus(m); },
      onLimit: () => finish("limit"),
      onClose: () => finish("close"),
    });
    engineRef.current = engine;

    engine.start({ ...user, scenarioId: scenario?.id }).catch((e) => {
      alert("Microphone access is required to talk to the assistant.\n\n" + e.message);
      onEnd();
    });

    return () => { clearInterval(tickRef.current); engine.stop(true); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMute() {
    const m = engineRef.current?.toggleMute();
    setMuted(!!m);
    setStatusHtml(null);
    setStatus(m ? "Microphone muted" : "Listening…");
  }

  const mmss = remaining === null
    ? null
    : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
  const low = remaining !== null && remaining <= 30;

  // ---- Connecting state -------------------------------------------------- #
  if (connecting) {
    return (
      <main className="stage call-stage">
        <div className="connecting">
          <div className="connect-orb" style={{ "--c": scenario?.accent || "#5b9dff" }} />
          <div className="dot-loader"><span /><span /><span /></div>
          <div className="connect-title">Connecting to {scenario?.name || "your assistant"}…</div>
          <div className="connect-sub">Setting up the live voice session — one moment</div>
          <button className="back-link" type="button" onClick={() => finish("close")}>Cancel</button>
        </div>
      </main>
    );
  }

  // ---- Live / ended state ------------------------------------------------ #
  return (
    <main className="stage call-stage">
      {mmss !== null && (
        <div className={"timer" + (low ? " low" : "")}>
          <span className="timer-dot" /> {mmss}
        </div>
      )}

      <div className="viz-wrap">
        <Visualizer userAnalyser={analysers.user} agentAnalyser={analysers.agent} accent={scenario?.accent} />
      </div>

      <div className="captions">{caption}</div>

      {statusHtml ? (
        <div className="status-line" dangerouslySetInnerHTML={{ __html: statusHtml }} />
      ) : (
        <div className="status-line">{status}</div>
      )}

      <div className="controls">
        <button
          className={"icon-btn" + (muted ? " muted" : "")}
          title={muted ? "Unmute" : "Mute"} type="button" onClick={handleMute} disabled={ended}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
          </svg>
        </button>
        <button className="icon-btn end" title="End" type="button" onClick={() => finish("close")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>
      </div>
    </main>
  );
}
