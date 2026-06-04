import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, tokenStore } from "../api.js";

const EMPTY_SCENARIO = {
  name: "", description: "", emoji: "💬", accent: "#5b9dff",
  voice: "Zephyr", system_instruction: "",
};

export default function Admin() {
  const [authed, setAuthed] = useState(!!tokenStore.get());
  const [pw, setPw] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const [cfg, setCfg] = useState(null);
  const [usage, setUsage] = useState(null);
  const [form, setForm] = useState({ model: "", voice: "", system_instruction: "", api_key: "", new_password: "" });

  const [scenarios, setScenarios] = useState([]);
  const [voices, setVoices] = useState([]);
  const [editing, setEditing] = useState(null); // null | {id?, ...fields}

  function flash(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  async function loadAll() {
    try {
      const c = await api("/api/admin/config");
      setCfg(c);
      setForm((f) => ({ ...f, model: c.model, voice: c.voice, system_instruction: c.system_instruction || "" }));
      setUsage(await api("/api/admin/usage"));
      const sc = await api("/api/admin/scenarios");
      setScenarios(sc.scenarios || []);
      setVoices(sc.available_voices || []);
    } catch (e) {
      if (e.message === "Unauthorized") setAuthed(false);
      else flash(e.message);
    }
  }

  useEffect(() => {
    if (authed) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function login() {
    try {
      const { token } = await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: pw }) });
      tokenStore.set(token);
      setPw("");
      setAuthed(true);
    } catch (e) {
      flash(e.message || "Login failed");
    }
  }

  async function saveConfig() {
    try {
      await api("/api/admin/config", {
        method: "POST",
        body: JSON.stringify({
          model: form.model,
          voice: form.voice,
          system_instruction: form.system_instruction,
          api_key: form.api_key.trim() || null,
          new_password: form.new_password.trim() || null,
        }),
      });
      setForm((f) => ({ ...f, api_key: "", new_password: "" }));
      flash("Configuration saved");
      loadAll();
    } catch (e) {
      flash(e.message || "Save failed");
    }
  }

  async function clearUsage() {
    if (!confirm("Delete all usage records? This cannot be undone.")) return;
    try {
      await api("/api/admin/usage", { method: "DELETE" });
      flash("Records cleared");
      loadAll();
    } catch (e) {
      flash(e.message || "Failed");
    }
  }

  /* ---------- scenario CRUD ---------- */
  async function saveScenario() {
    const body = JSON.stringify({
      name: editing.name,
      description: editing.description,
      emoji: editing.emoji || "💬",
      accent: editing.accent || "#5b9dff",
      voice: editing.voice,
      system_instruction: editing.system_instruction,
    });
    try {
      if (editing.id) {
        await api(`/api/admin/scenarios/${editing.id}`, { method: "PUT", body });
      } else {
        await api("/api/admin/scenarios", { method: "POST", body });
      }
      setEditing(null);
      flash("Scenario saved");
      loadAll();
    } catch (e) {
      flash(e.message || "Save failed");
    }
  }

  async function deleteScenario(id) {
    if (!confirm("Delete this scenario?")) return;
    try {
      await api(`/api/admin/scenarios/${id}`, { method: "DELETE" });
      flash("Scenario deleted");
      loadAll();
    } catch (e) {
      flash(e.message || "Delete failed");
    }
  }

  /* ---------- login screen ---------- */
  if (!authed) {
    return (
      <>
        <Topbar />
        <main className="stage">
          <section className="card">
            <h1>Admin panel</h1>
            <p className="sub">Enter the admin password to manage scenarios, the model, API key and usage.</p>
            <div className="row">
              <label className="field" htmlFor="pw">Password</label>
              <input id="pw" type="text" placeholder="••••••••" value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()} />
            </div>
            <button className="btn" type="button" onClick={login}>Unlock</button>
          </section>
        </main>
        <Toast msg={toast} />
      </>
    );
  }

  /* ---------- dashboard ---------- */
  const s = usage?.summary;
  return (
    <>
      <Topbar />
      <div className="admin-wrap">
        {/* Usage */}
        <div className="panel">
          <h2>Usage overview</h2>
          <div className="stats">
            <Stat n={s?.total_sessions ?? "—"} l="Sessions" />
            <Stat n={s?.total_minutes ?? "—"} l="Minutes used" />
            <Stat n={s?.unique_users ?? "—"} l="Unique users" />
            <Stat n={(s?.total_seconds ?? 0) + "s"} l="Total audio" />
          </div>
        </div>

        {/* Scenarios */}
        <div className="panel">
          <div className="panel-head">
            <h2>Scenarios</h2>
            {!editing && (
              <button className="mini-btn" type="button" onClick={() => setEditing({ ...EMPTY_SCENARIO })}>
                + Add scenario
              </button>
            )}
          </div>

          {editing ? (
            <ScenarioForm
              editing={editing} setEditing={setEditing} voices={voices}
              onSave={saveScenario} onCancel={() => setEditing(null)}
            />
          ) : (
            scenarios.length === 0
              ? <p className="muted-text">No scenarios yet. Add one for users to choose from.</p>
              : scenarios.map((sc) => (
                <div className="scn-row" key={sc.id}>
                  <div className="badge" style={{
                    background: `color-mix(in srgb, ${sc.accent} 18%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${sc.accent} 45%, transparent)`,
                  }}>{sc.emoji}</div>
                  <div className="meta">
                    <div className="nm">{sc.name}</div>
                    <div className="ds">{sc.voice} · {sc.description}</div>
                  </div>
                  <div className="acts">
                    <button className="mini-btn" type="button" onClick={() => setEditing({ ...sc })}>Edit</button>
                    <button className="mini-btn del" type="button" onClick={() => deleteScenario(sc.id)}>Delete</button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Global config */}
        <div className="panel">
          <h2>Defaults &amp; credentials</h2>
          <div className="grid-2">
            <div className="row">
              <label className="field">Model</label>
              <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
                {cfg?.available_models.map((m) => <option key={m} value={m}>{m.split("/").pop()}</option>)}
              </select>
            </div>
            <div className="row">
              <label className="field">Fallback voice</label>
              <select value={form.voice} onChange={(e) => setForm({ ...form, voice: e.target.value })}>
                {cfg?.available_voices.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <label className="field">Fallback system instruction</label>
            <textarea rows={2} value={form.system_instruction}
              onChange={(e) => setForm({ ...form, system_instruction: e.target.value })} />
          </div>
          <div className="row">
            <label className="field">
              Gemini API key{" "}
              <span className="muted-text">
                {cfg?.has_api_key ? `(current: ${cfg.api_key_masked})` : "(not set)"}
              </span>
            </label>
            <input type="text" placeholder="Leave blank to keep current key"
              value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} />
          </div>
          <div className="row">
            <label className="field">Change admin password</label>
            <input type="text" placeholder="Leave blank to keep current password"
              value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
          </div>
          <button className="btn" type="button" onClick={saveConfig}>Save configuration</button>
        </div>

        {/* Records */}
        <div className="panel">
          <h2>Session records</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>When</th><th>Name</th><th>Scenario</th><th>Voice</th><th>Location</th><th>Duration</th></tr>
              </thead>
              <tbody>
                {usage?.records?.length ? usage.records.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.started_at).toLocaleString()}</td>
                    <td>{r.name}</td>
                    <td>{r.scenario || "Default"}</td>
                    <td>{r.voice}</td>
                    <td>{r.location?.lat != null ? `${r.location.lat}, ${r.location.lon}` : (r.location?.denied ? "denied" : "—")}</td>
                    <td>{fmtDuration(r.duration_seconds)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="muted-text">No sessions recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn danger" type="button" onClick={clearUsage} style={{ marginTop: 16, width: "auto", padding: "10px 18px" }}>
            Clear all records
          </button>
        </div>
      </div>
      <Toast msg={toast} />
    </>
  );
}

/* ---------- scenario create/edit form ---------- */
function ScenarioForm({ editing, setEditing, voices, onSave, onCancel }) {
  const set = (k, v) => setEditing({ ...editing, [k]: v });
  const valid = editing.name.trim().length >= 2;
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
      <div className="grid-2">
        <div className="row">
          <label className="field">Name</label>
          <input type="text" value={editing.name} placeholder="e.g. Travel Guide" onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="row">
          <label className="field">Voice</label>
          <select value={editing.voice} onChange={(e) => set("voice", e.target.value)}>
            {voices.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="row">
          <label className="field">Emoji</label>
          <input type="text" value={editing.emoji} maxLength={4} onChange={(e) => set("emoji", e.target.value)} />
        </div>
        <div className="row">
          <label className="field">Accent colour</label>
          <input type="color" value={editing.accent} onChange={(e) => set("accent", e.target.value)} />
        </div>
      </div>
      <div className="row">
        <label className="field">Description</label>
        <input type="text" value={editing.description} placeholder="Short tagline shown on the card"
          onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="row">
        <label className="field">System instruction (prompt)</label>
        <textarea rows={4} value={editing.system_instruction} placeholder="How should this persona behave?"
          onChange={(e) => set("system_instruction", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn" type="button" onClick={onSave} disabled={!valid} style={{ width: "auto", padding: "11px 20px" }}>
          {editing.id ? "Save changes" : "Create scenario"}
        </button>
        <button className="btn ghost" type="button" onClick={onCancel} style={{ width: "auto", padding: "11px 20px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------- small presentational helpers ---------- */
function Topbar() {
  return (
    <header className="topbar">
      <div className="brand"><span className="dot" /> Demo Voice Agents by Saif · Admin</div>
      <Link to="/">← Back to app</Link>
    </header>
  );
}
function Stat({ n, l }) {
  return <div className="stat"><div className="n">{n}</div><div className="l">{l}</div></div>;
}
function Toast({ msg }) {
  return <div className={"toast" + (msg ? " show" : "")}>{msg}</div>;
}
function fmtDuration(sec) {
  sec = Math.round(sec || 0);
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}m ${sec % 60}s` : `${sec}s`;
}
