import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Gate from "./components/Gate.jsx";
import ScenarioPicker from "./components/ScenarioPicker.jsx";
import CallView from "./components/CallView.jsx";

export default function App() {
  const [step, setStep] = useState("gate");   // gate | pick | call
  const [user, setUser] = useState(null);      // { name, location }
  const [scenario, setScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((d) => setScenarios(d.scenarios || []))
      .catch(() => setScenarios([]));
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="brand"><span className="dot" /> Demo Voice Agents by Saif</div>
        <Link to="/admin">Admin</Link>
      </header>

      {step === "gate" && (
        <Gate
          onStart={(u) => { setUser(u); setStep("pick"); }}
        />
      )}

      {step === "pick" && (
        <ScenarioPicker
          name={user?.name}
          scenarios={scenarios}
          onSelect={(s) => { setScenario(s); setStep("call"); }}
        />
      )}

      {step === "call" && (
        <CallView
          name={user.name}
          location={user.location}
          scenario={scenario}
          onEnd={() => setStep("pick")}
        />
      )}
    </>
  );
}
