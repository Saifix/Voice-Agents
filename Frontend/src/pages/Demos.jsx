import React from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import { Icon } from "../components/icons.jsx";

/* Demo catalogue. Add a new entry here to surface another showcase.
 * `to` makes a card live + clickable; omit it for a "coming soon" tile. */
const DEMOS = [
  {
    icon: "mic",
    accent: "#5b9dff",
    title: "Voice Agent",
    desc: "Real-time speech-to-speech assistant on Gemini Live — pick a persona and talk to it in the browser.",
    to: "/demos/voice-agent",
    tag: "Live",
  },
  {
    icon: "layers",
    accent: "#2dd4bf",
    title: "RAG Chat",
    desc: "Grounded question-answering over a document corpus with citations and retrieval tuning.",
  },
  {
    icon: "nodes",
    accent: "#a78bfa",
    title: "Multi-Agent Orchestrator",
    desc: "An event-driven crew of specialized agents coordinating a multi-step task end to end.",
  },
];

export default function Demos() {
  return (
    <>
      <Nav />
      <main className="portfolio">
        <section className="pf-section demos-head">
          <p className="eyebrow"><span className="eyebrow-dot" /> Interactive showcases</p>
          <h1 className="demos-title">Live Demos</h1>
          <p className="demos-sub">
            Hands-on builds you can try right here. More land as I ship them.
          </p>
        </section>

        <section className="pf-section">
          <div className="demo-grid">
            {DEMOS.map((d) => {
              const inner = (
                <>
                  <span className="demo-icon" style={{ "--card-accent": d.accent }}>
                    <Icon name={d.icon} size={26} />
                  </span>
                  <div className="demo-meta">
                    <div className="demo-card-head">
                      <h3>{d.title}</h3>
                      <span className={`demo-tag ${d.to ? "live" : "soon"}`}>
                        {d.to ? (d.tag || "Live") : "Coming soon"}
                      </span>
                    </div>
                    <p>{d.desc}</p>
                  </div>
                  {d.to && <span className="demo-go"><Icon name="arrowRight" size={18} /></span>}
                </>
              );
              return d.to ? (
                <Link
                  key={d.title}
                  to={d.to}
                  className="demo-card"
                  style={{ "--card-accent": d.accent }}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={d.title}
                  className="demo-card soon"
                  style={{ "--card-accent": d.accent }}
                  aria-disabled="true"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
