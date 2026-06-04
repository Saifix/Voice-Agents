import React, { useState } from "react";
import { COUNTRIES } from "../countryCodes.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Name + email + phone (with country code) gate. All fields required. */
export default function Gate({ onStart, scenarios = [] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [iso, setIso] = useState("PK");
  const [phone, setPhone] = useState("");

  const dial = COUNTRIES.find((c) => c.iso === iso)?.dial || "+92";
  const phoneDigits = phone.replace(/\D/g, "");
  const emailOk = EMAIL_RE.test(email.trim());
  const phoneOk = phoneDigits.length >= 7 && phoneDigits.length <= 15;
  const canStart = name.trim().length >= 2 && emailOk && phoneOk;

  function start() {
    if (!canStart) return;
    onStart({
      name: name.trim(),
      email: email.trim(),
      country_code: dial,
      phone: `${dial} ${phoneDigits}`,
    });
  }

  return (
    <main className="stage">
     <div className="gate-wrap">
      <section className="card">
        <h1>Talk to your assistant</h1>
        <p className="sub">Enter your details to begin.</p>

        <div className="row">
          <label className="field" htmlFor="name">Your name</label>
          <input id="name" type="text" placeholder="e.g. Saif" value={name}
            autoComplete="name" onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="row">
          <label className="field" htmlFor="email">Email</label>
          <input id="email" type="text" inputMode="email" placeholder="you@example.com" value={email}
            autoComplete="email" onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && start()} />
          {email.length > 0 && !emailOk && <div className="field-err">Enter a valid email address.</div>}
        </div>

        <div className="row">
          <label className="field" htmlFor="phone">Phone number</label>
          <div className="phone-row">
            <select aria-label="Country code" value={iso} onChange={(e) => setIso(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.iso} value={c.iso}>{c.dial} {c.name}</option>
              ))}
            </select>
            <input id="phone" type="tel" inputMode="tel" placeholder="3001234567" value={phone}
              autoComplete="tel" onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()} />
          </div>
          {phone.length > 0 && !phoneOk && <div className="field-err">Enter a valid phone number.</div>}
        </div>

        <button className="btn" type="button" disabled={!canStart} onClick={start}>
          Start talking
        </button>
      </section>

      {scenarios.length > 0 && (
        <div className="home-scenarios">
          <div className="hs-title">Available agents</div>
          <div className="hs-grid">
            {scenarios.map((s) => (
              <div key={s.id} className="hs-card" style={{ "--card-accent": s.accent }}>
                <span className="hs-emoji">{s.emoji}</span>
                <div className="hs-meta">
                  <div className="hs-name">{s.name}</div>
                  <div className="hs-desc">{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
     </div>
    </main>
  );
}
