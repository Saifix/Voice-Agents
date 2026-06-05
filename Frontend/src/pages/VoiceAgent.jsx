import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Gate from "../components/Gate.jsx";
import ScenarioPicker from "../components/ScenarioPicker.jsx";
import CallView from "../components/CallView.jsx";

/* The voice-agent demo flow: collect profile -> pick a persona -> live call.
 * (Previously the app root; now nested under /demos/voice-agent.) */
export default function VoiceAgent() {
  const [step, setStep] = useState("gate");   // gate | pick | call
  const [user, setUser] = useState(null);      // { name, email, phone, country_code }
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
      {step !== "call" && <Nav />}

      {step === "gate" && (
        <>
          <div className="demo-back">
            <Link to="/demos" className="back-link">← All demos</Link>
          </div>
          <Gate
            scenarios={scenarios}
            onStart={(u) => { setUser(u); setStep("pick"); }}
          />
        </>
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
          user={user}
          scenario={scenario}
          onEnd={() => setStep("pick")}
        />
      )}
    </>
  );
}
