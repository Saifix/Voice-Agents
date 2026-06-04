import React from "react";

/* Grid of scenario cards. Each card is tinted with its own accent colour.
 * Selecting one starts the live session with that persona. */
export default function ScenarioPicker({ name, scenarios, onSelect }) {
  return (
    <main className="stage">
      <div className="picker">
        <div className="picker-head">
          <h1>Choose a scenario{name ? `, ${name}` : ""}</h1>
          <p>Each scenario has its own voice and personality. Pick one to start talking.</p>
        </div>

        {scenarios.length === 0 ? (
          <p className="muted-text" style={{ textAlign: "center" }}>
            No scenarios available yet. An admin can add them in the admin panel.
          </p>
        ) : (
          <div className="scenario-grid">
            {scenarios.map((s, i) => (
              <button
                key={s.id}
                className="scenario-card"
                style={{ "--card-accent": s.accent, animationDelay: `${i * 60}ms` }}
                onClick={() => onSelect(s)}
                type="button"
              >
                <div className="emoji">{s.emoji}</div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <span className="voice-tag">Voice · {s.voice}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
