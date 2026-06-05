"""WebSocket relay: browser mic <-> Gemini Live, with a per-session time limit."""

import json
import asyncio
import secrets
import datetime
import traceback

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from google import genai
from google.genai import types

import db
from config import SEND_SAMPLE_RATE, MAX_SESSION_SECONDS
from security import get_api_key
from live import build_live_config

router = APIRouter()


@router.websocket("/ws")
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
