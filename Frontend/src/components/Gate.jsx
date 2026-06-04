import React, { useState } from "react";

/* Name + location gate. Calls onStart({ name, location }) once both are set.
 * Location can be denied — the user may still continue. */
export default function Gate({ onStart }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState(null);
  const [locState, setLocState] = useState({ cls: "", text: "Location not shared yet" });
  const [locLabel, setLocLabel] = useState("Allow location");
  const [locOk, setLocOk] = useState(false);

  const canStart = name.trim().length >= 2 && location;

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocation({ denied: true, reason: "unsupported" });
      setLocState({ cls: "err", text: "Geolocation not supported — you can still continue." });
      return;
    }
    setLocState({ cls: "", text: "Requesting location…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: +pos.coords.latitude.toFixed(5),
          lon: +pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy),
        };
        setLocation(loc);
        setLocState({ cls: "ok", text: `Location shared (±${loc.accuracy} m)` });
        setLocLabel("Location allowed ✓");
        setLocOk(true);
      },
      (err) => {
        setLocation({ denied: true, reason: err.message });
        setLocState({ cls: "err", text: "Location denied — you can still continue." });
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <main className="stage">
      <section className="card">
        <h1>Talk to your assistant</h1>
        <p className="sub">
          Enter your name and share your location to begin.
        </p>

        <div className="row">
          <label className="field" htmlFor="name">Your name</label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Saif"
            value={name}
            autoComplete="given-name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="row">
          <label className="field">Location</label>
          <button
            className={"btn ghost" + (locOk ? " ok" : "")}
            type="button"
            onClick={requestLocation}
          >
            {locLabel}
          </button>
          <div className={"loc-status " + locState.cls}>
            <span className="pill" /><span>{locState.text}</span>
          </div>
        </div>

        <button
          className="btn"
          type="button"
          disabled={!canStart}
          onClick={() => onStart({ name: name.trim(), location })}
        >
          Start talking
        </button>
      </section>
    </main>
  );
}
