import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Demos from "./pages/Demos.jsx";
import VoiceAgent from "./pages/VoiceAgent.jsx";
import Admin from "./components/Admin.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/demos/voice-agent" element={<VoiceAgent />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
