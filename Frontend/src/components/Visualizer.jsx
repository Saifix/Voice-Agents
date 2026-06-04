import React, { useEffect, useRef } from "react";
import { OrbVisualizer } from "../audio/OrbVisualizer.js";

/* Renders the reactive orb canvas. Owns an OrbVisualizer instance, feeds it
 * the analyser nodes, and tints it with the active scenario's accent colour. */
export default function Visualizer({ userAnalyser, agentAnalyser, accent }) {
  const canvasRef = useRef(null);
  const vizRef = useRef(null);

  useEffect(() => {
    const viz = new OrbVisualizer(canvasRef.current);
    vizRef.current = viz;
    viz.start();
    // Keep the canvas crisp as it flex-shrinks to fit the available space.
    const ro = new ResizeObserver(() => viz.resize());
    ro.observe(canvasRef.current);
    return () => { ro.disconnect(); viz.stop(); };
  }, []);

  useEffect(() => {
    if (vizRef.current && (userAnalyser || agentAnalyser)) {
      vizRef.current.setAnalysers(userAnalyser, agentAnalyser);
    }
  }, [userAnalyser, agentAnalyser]);

  useEffect(() => {
    if (vizRef.current && accent) vizRef.current.setAccent(accent);
  }, [accent]);

  return <canvas id="viz" ref={canvasRef} />;
}
