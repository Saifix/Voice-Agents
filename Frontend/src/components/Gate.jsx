import React, { useState } from "react";

// Common country dial codes (Pakistan first). Unique dial codes keep the
// controlled <select> simple.
const COUNTRY_CODES = [
  { iso: "PK", dial: "+92", name: "Pakistan" },
  { iso: "US", dial: "+1", name: "United States" },
  { iso: "GB", dial: "+44", name: "United Kingdom" },
  { iso: "AE", dial: "+971", name: "UAE" },
  { iso: "SA", dial: "+966", name: "Saudi Arabia" },
  { iso: "IN", dial: "+91", name: "India" },
  { iso: "AU", dial: "+61", name: "Australia" },
  { iso: "DE", dial: "+49", name: "Germany" },
  { iso: "FR", dial: "+33", name: "France" },
  { iso: "TR", dial: "+90", name: "Türkiye" },
  { iso: "QA", dial: "+974", name: "Qatar" },
  { iso: "KW", dial: "+965", name: "Kuwait" },
  { iso: "OM", dial: "+968", name: "Oman" },
  { iso: "BD", dial: "+880", name: "Bangladesh" },
  { iso: "MY", dial: "+60", name: "Malaysia" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Name + email + phone (with country code) gate. All fields required. */
export default function Gate({ onStart }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+92");
  const [phone, setPhone] = useState("");

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
            <select aria-label="Country code" value={dial} onChange={(e) => setDial(e.target.value)}>
              {COUNTRY_CODES.map((c) => (
                <option key={c.iso} value={c.dial}>{c.iso} {c.dial}</option>
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
    </main>
  );
}
