import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During dev the React app runs on :5173 and proxies API + WebSocket traffic
// to the FastAPI backend on :8000, so everything stays same-origin (no CORS,
// and relative /ws + /capture-processor.js URLs just work).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/ws": { target: "ws://localhost:8000", ws: true },
    },
  },
  build: {
    outDir: "dist",
  },
});
