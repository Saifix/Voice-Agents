"""
Voice Agent — Backend
=====================

A FastAPI server that:
  * Securely proxies the Gemini 3.1 Flash *Live* API over a WebSocket
    (the browser never sees the API key).
  * Relays raw PCM audio both ways (browser mic -> Gemini, Gemini -> browser).
  * Persists settings, scenarios and usage records in PostgreSQL (see db.py).
  * Keeps the Gemini API key OUT of the database (apikey.json / env).
  * Enforces a per-session time limit (2 minutes).
  * Exposes a password-protected admin API.
  * Serves the built React frontend (Frontend/dist) as a single-page app.

Run:
    docker compose up -d db          # from the project root
    pip install -r requirements.txt
    python main.py                   # http://localhost:8000
"""

import os
import json
import asyncio
import hashlib
import secrets
import datetime
import traceback
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from google import genai
from google.genai import types

import db

# --------------------------------------------------------------------------- #
#  Paths & env
# --------------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
FRONTEND_DIR = ROOT_DIR / "Frontend"
DIST_DIR = FRONTEND_DIR / "dist"
APIKEY_PATH = BASE_DIR / "apikey.json"   # the ONE thing not stored in Postgres

load_dotenv(ROOT_DIR / ".env", override=True)
load_dotenv(BASE_DIR / ".env", override=True)

SEND_SAMPLE_RATE = 16000
RECEIVE_SAMPLE_RATE = 24000
MAX_SESSION_SECONDS = 120  # hard limit per conversation

AVAILABLE_VOICES = [
    "Zephyr", "Puck", "Charon", "Kore", "Fenrir",
    "Aoede", "Leda", "Orus", "Callirrhoe", "Autonoe",
]
AVAILABLE_MODELS = [
    "models/gemini-3.1-flash-live-preview",
    "models/gemini-2.5-flash-preview-native-audio-dialog",
    "models/gemini-2.0-flash-live-001",
]


# --------------------------------------------------------------------------- #
#  API key — local file, falling back to env (never in Postgres)
# --------------------------------------------------------------------------- #
def _read_secret_file() -> str:
    """Read the key from a Docker secret file (mounted read-only, not an env var)."""
    path = os.environ.get("GEMINI_API_KEY_FILE", "/run/secrets/gemini_api_key")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


def get_api_key() -> str:
    # Priority: admin-set key (persisted file) -> Docker secret -> env var.
    if APIKEY_PATH.exists():
        try:
            with open(APIKEY_PATH, "r", encoding="utf-8") as f:
                key = (json.load(f).get("api_key") or "").strip()
                if key:
                    return key
        except (json.JSONDecodeError, OSError):
            pass
    secret = _read_secret_file()
    if secret:
        return secret
    return os.environ.get("GEMINI_API_KEY", "").strip()


def set_api_key(key: str) -> None:
    with open(APIKEY_PATH, "w", encoding="utf-8") as f:
        json.dump({"api_key": key.strip()}, f)


# --------------------------------------------------------------------------- #
#  Admin auth
# --------------------------------------------------------------------------- #
_active_tokens: set[str] = set()


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def require_admin(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin token")
    token = authorization.split(" ", 1)[1]
    if token not in _active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")


# --------------------------------------------------------------------------- #
#  Gemini Live helpers
# --------------------------------------------------------------------------- #
def build_live_config(voice: str, system_instruction: str | None) -> types.LiveConnectConfig:
    return types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        media_resolution="MEDIA_RESOLUTION_MEDIUM",
        system_instruction=system_instruction or None,
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice or "Zephyr")
            )
        ),
        context_window_compression=types.ContextWindowCompressionConfig(
            trigger_tokens=104857,
            sliding_window=types.SlidingWindow(target_tokens=52428),
        ),
    )


def public_scenario(s: dict) -> dict:
    """Scenario fields safe to expose to end users (no prompt)."""
    return {
        "id": s.get("id"),
        "name": s.get("name", "Scenario"),
        "description": s.get("description", ""),
        "emoji": s.get("emoji", "💬"),
        "accent": s.get("accent", "#5b9dff"),
        "voice": s.get("voice", ""),
    }


# --------------------------------------------------------------------------- #
#  FastAPI app
# --------------------------------------------------------------------------- #
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
        print(f"     DATABASE_URL = {db.DATABASE_URL}")
        print("     Start it with:  docker compose up -d db   (from the project root)")
        print("=" * 70 + "\n")


# ----- Public API ---------------------------------------------------------- #
@app.get("/api/health")
async def health():
    s = db.get_settings()
    return {"ok": True, "model": s["model"], "voice": s["voice"], "has_api_key": bool(get_api_key())}


@app.get("/api/scenarios")
async def list_scenarios():
    return {"scenarios": [public_scenario(s) for s in db.list_scenarios()]}


# ----- Admin: models ------------------------------------------------------- #
class LoginBody(BaseModel):
    password: str


class ConfigBody(BaseModel):
    model: str | None = None
    voice: str | None = None
    api_key: str | None = None
    system_instruction: str | None = None
    new_password: str | None = None


class ScenarioBody(BaseModel):
    name: str
    description: str | None = ""
    emoji: str | None = "💬"
    accent: str | None = "#5b9dff"
    voice: str | None = "Zephyr"
    system_instruction: str | None = ""


@app.post("/api/admin/login")
async def admin_login(body: LoginBody):
    s = db.get_settings()
    if hash_password(body.password) != s["admin_password_hash"]:
        raise HTTPException(status_code=401, detail="Incorrect password")
    token = secrets.token_urlsafe(32)
    _active_tokens.add(token)
    return {"token": token}


@app.get("/api/admin/config")
async def get_admin_config(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    s = db.get_settings()
    key = get_api_key()
    masked = (key[:4] + "•" * max(0, len(key) - 8) + key[-4:]) if len(key) > 8 else ("•" * len(key))
    return {
        "model": s["model"],
        "voice": s["voice"],
        "system_instruction": s.get("system_instruction", ""),
        "api_key_masked": masked,
        "has_api_key": bool(key),
        "available_models": AVAILABLE_MODELS,
        "available_voices": AVAILABLE_VOICES,
    }


@app.post("/api/admin/config")
async def update_admin_config(body: ConfigBody, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    partial = {
        "model": body.model,
        "voice": body.voice,
        "system_instruction": body.system_instruction,
    }
    if body.new_password:
        partial["admin_password_hash"] = hash_password(body.new_password)
    db.update_settings(partial)
    if body.api_key:  # api key lives outside the DB
        set_api_key(body.api_key)
    return {"ok": True}


@app.get("/api/admin/usage")
async def get_usage(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    records, summary = db.get_usage()
    return {"records": records, "summary": summary}


@app.delete("/api/admin/usage")
async def clear_usage(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    db.clear_usage()
    return {"ok": True}


# ----- Admin: scenarios ---------------------------------------------------- #
@app.get("/api/admin/scenarios")
async def admin_list_scenarios(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    return {"scenarios": db.list_scenarios(), "available_voices": AVAILABLE_VOICES}


@app.post("/api/admin/scenarios")
async def admin_create_scenario(body: ScenarioBody, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    return db.create_scenario(body.model_dump())


@app.put("/api/admin/scenarios/{scenario_id}")
async def admin_update_scenario(scenario_id: str, body: ScenarioBody, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    updated = db.update_scenario(scenario_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return updated


@app.delete("/api/admin/scenarios/{scenario_id}")
async def admin_delete_scenario(scenario_id: str, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    if not db.delete_scenario(scenario_id):
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {"ok": True}


# --------------------------------------------------------------------------- #
#  WebSocket relay  (browser  <->  Gemini Live)
# --------------------------------------------------------------------------- #
@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    settings = db.get_settings()
    api_key = get_api_key()

    if not api_key:
        await ws.send_json({"type": "error", "message": "No Gemini API key configured. Set it in the admin panel."})
        await ws.close()
        return

    try:
        first = await ws.receive_json()
    except Exception:
        await ws.close()
        return

    if first.get("type") != "start":
        await ws.send_json({"type": "error", "message": "Expected a start message."})
        await ws.close()
        return

    scenario = db.get_scenario(first.get("scenario_id"))
    voice = scenario["voice"] if scenario else settings["voice"]
    system_instruction = scenario["system_instruction"] if scenario else settings.get("system_instruction")

    started_at = datetime.datetime.now(datetime.timezone.utc)
    session_record = {
        "id": secrets.token_hex(8),
        "name": (first.get("name") or "Anonymous").strip()[:80],
        "email": (first.get("email") or "").strip()[:120],
        "phone": (first.get("phone") or "").strip()[:40],
        "country_code": (first.get("country_code") or "").strip()[:8],
        "model": settings["model"],
        "voice": voice,
        "scenario": scenario["name"] if scenario else "Default",
        "started_at": started_at,
        "ended_at": None,
        "duration_seconds": 0,
    }
    start_monotonic = asyncio.get_event_loop().time()

    client = genai.Client(http_options={"api_version": "v1beta"}, api_key=api_key)
    live_config = build_live_config(voice, system_instruction)

    ready_msg = {
        "type": "ready",
        "model": settings["model"],
        "voice": voice,
        "scenario": scenario["name"] if scenario else "Default",
        "name": session_record["name"],
        "max_seconds": MAX_SESSION_SECONDS,
    }
    # Nudge the model to greet first. The client stays in "Connecting…" (mic
    # held) until the first audio actually arrives — proof the agent is fully
    # warmed up and responding — so the user never talks into a dead session.
    greeting_trigger = (
        "The call has just connected. Greet the user warmly in ONE short sentence, "
        "in the language and style of your role, and invite them to speak."
    )

    try:
        async with client.aio.live.connect(model=settings["model"], config=live_config) as session:
            ready_event = asyncio.Event()

            await session.send_client_content(
                turns=types.Content(role="user", parts=[types.Part(text=greeting_trigger)]),
                turn_complete=True,
            )

            async def signal_ready():
                if not ready_event.is_set():
                    ready_event.set()
                    await ws.send_json(ready_msg)

            async def browser_to_gemini():
                while True:
                    message = await ws.receive()
                    if message.get("type") == "websocket.disconnect":
                        raise WebSocketDisconnect()
                    if "bytes" in message and message["bytes"] is not None:
                        await session.send_realtime_input(
                            audio=types.Blob(
                                data=message["bytes"],
                                mime_type=f"audio/pcm;rate={SEND_SAMPLE_RATE}",
                            )
                        )
                    elif "text" in message and message["text"] is not None:
                        try:
                            payload = json.loads(message["text"])
                        except json.JSONDecodeError:
                            continue
                        if payload.get("type") == "text" and payload.get("text"):
                            await session.send_client_content(
                                turns=types.Content(role="user", parts=[types.Part(text=payload["text"])]),
                                turn_complete=True,
                            )
                        elif payload.get("type") == "stop":
                            raise WebSocketDisconnect()

            async def gemini_to_browser():
                while True:
                    turn = session.receive()
                    async for response in turn:
                        sc = getattr(response, "server_content", None)
                        if sc is not None and getattr(sc, "interrupted", False):
                            await ws.send_json({"type": "interrupted"})
                        if data := response.data:
                            # First audio byte => the agent is truly ready.
                            await signal_ready()
                            await ws.send_bytes(data)
                            continue
                        if text := response.text:
                            await ws.send_json({"type": "text", "text": text})
                    await ws.send_json({"type": "turn_complete"})

            async def ready_fallback():
                # Safety net: if no audio arrives within 12s, open the mic anyway.
                await asyncio.sleep(12)
                await signal_ready()

            async def enforce_time_limit():
                # Start the clock only once the conversation is actually live.
                await ready_event.wait()
                await asyncio.sleep(MAX_SESSION_SECONDS)
                try:
                    await ws.send_json({"type": "limit_reached"})
                except Exception:
                    pass
                raise WebSocketDisconnect()

            async with asyncio.TaskGroup() as tg:
                tg.create_task(browser_to_gemini())
                tg.create_task(gemini_to_browser())
                tg.create_task(ready_fallback())
                tg.create_task(enforce_time_limit())

    except* WebSocketDisconnect:
        pass
    except* Exception as eg:
        traceback.print_exception(eg)
        try:
            await ws.send_json({"type": "error", "message": "Live session error. Check the server logs."})
        except Exception:
            pass
    finally:
        elapsed = asyncio.get_event_loop().time() - start_monotonic
        session_record["ended_at"] = datetime.datetime.now(datetime.timezone.utc)
        session_record["duration_seconds"] = round(elapsed, 1)
        try:
            db.add_usage(session_record)
        except Exception as e:  # noqa: BLE001
            print(f"[db] failed to persist usage record: {e}")
        try:
            await ws.close()
        except Exception:
            pass


# --------------------------------------------------------------------------- #
#  Serve the built React SPA (Frontend/dist)
# --------------------------------------------------------------------------- #
_NOT_BUILT = {
    "message": "Frontend not built yet. Run `npm install && npm run build` in the "
               "Frontend folder, or use the Vite dev server (`npm run dev`, port 5173)."
}


@app.get("/{full_path:path}")
async def spa(full_path: str):
    if not DIST_DIR.exists():
        return JSONResponse(_NOT_BUILT, status_code=200)
    candidate = (DIST_DIR / full_path).resolve()
    if candidate.is_file() and str(candidate).startswith(str(DIST_DIR.resolve())):
        return FileResponse(candidate)
    return FileResponse(DIST_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
