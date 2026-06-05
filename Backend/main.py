"""
Voice Agent — Backend
=====================

A FastAPI server that:
  * Securely proxies the Gemini *Live* API over a WebSocket (the browser never
    sees the API key).
  * Relays raw PCM audio both ways (browser mic -> Gemini, Gemini -> browser).
  * Persists settings, scenarios and usage records in PostgreSQL (see db.py).
  * Keeps the Gemini API key OUT of the database (apikey.json / env).
  * Enforces a per-session time limit.
  * Exposes a password-protected admin API.
  * Serves the built React frontend (Frontend/dist) as a single-page app.

This module is intentionally thin: it wires together the configuration,
middleware and routers that live in their own modules.

  config.py     paths, env loading, audio/session constants, model catalogue
  security.py   Gemini API key resolution + admin auth
  live.py       Gemini Live session config + scenario serialization
  schemas.py    Pydantic request bodies
  routers/      public, admin, websocket relay and SPA fallback
  db.py         PostgreSQL layer

Run:
    docker compose up -d db          # from the project root
    pip install -r requirements.txt
    python main.py                   # http://localhost:8000
"""

import config  # noqa: F401  (import for side effect: loads .env on startup)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import db
from routers import public, admin, ws, spa


def create_app() -> FastAPI:
    app = FastAPI(title="Voice Agent")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173", "http://127.0.0.1:5173",
            "http://localhost:8000", "http://127.0.0.1:8000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup():
        try:
            db.init_db()
            print("[db] connected and ready.")
        except Exception as e:  # noqa: BLE001
            print("\n" + "=" * 70)
            print("[db] Could not connect to PostgreSQL.")
            print(f"     {type(e).__name__}: {e}")
            print("=" * 70 + "\n")

    # Order matters: the SPA catch-all must be registered LAST so it does not
    # shadow the API routes or the WebSocket relay.
    app.include_router(public.router)
    app.include_router(admin.router)
    app.include_router(ws.router)
    app.include_router(spa.router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
