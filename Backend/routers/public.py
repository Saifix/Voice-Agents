"""Public (unauthenticated) API: health check and the scenario catalogue."""

from fastapi import APIRouter

import db
from security import get_api_key
from live import public_scenario

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
async def health():
    s = db.get_settings()
    return {"ok": True, "model": s["model"], "voice": s["voice"], "has_api_key": bool(get_api_key())}


@router.get("/scenarios")
async def list_scenarios():
    return {"scenarios": [public_scenario(s) for s in db.list_scenarios()]}
