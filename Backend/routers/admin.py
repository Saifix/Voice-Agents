"""Password-protected admin API: config, usage and scenario management."""

from fastapi import APIRouter, Header, HTTPException

import db
from config import AVAILABLE_MODELS, AVAILABLE_VOICES
from schemas import LoginBody, ConfigBody, ScenarioBody
from security import (
    hash_password, create_token, require_admin, get_api_key, set_api_key,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ----- Auth ---------------------------------------------------------------- #
@router.post("/login")
async def admin_login(body: LoginBody):
    s = db.get_settings()
    if hash_password(body.password) != s["admin_password_hash"]:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"token": create_token()}


# ----- Config -------------------------------------------------------------- #
@router.get("/config")
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


@router.post("/config")
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


# ----- Usage --------------------------------------------------------------- #
@router.get("/usage")
async def get_usage(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    records, summary = db.get_usage()
    return {"records": records, "summary": summary}


@router.delete("/usage")
async def clear_usage(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    db.clear_usage()
    return {"ok": True}


# ----- Scenarios ----------------------------------------------------------- #
@router.get("/scenarios")
async def admin_list_scenarios(authorization: str | None = Header(default=None)):
    require_admin(authorization)
    return {"scenarios": db.list_scenarios(), "available_voices": AVAILABLE_VOICES}


@router.post("/scenarios")
async def admin_create_scenario(body: ScenarioBody, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    return db.create_scenario(body.model_dump())


@router.put("/scenarios/{scenario_id}")
async def admin_update_scenario(scenario_id: str, body: ScenarioBody, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    updated = db.update_scenario(scenario_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return updated


@router.delete("/scenarios/{scenario_id}")
async def admin_delete_scenario(scenario_id: str, authorization: str | None = Header(default=None)):
    require_admin(authorization)
    if not db.delete_scenario(scenario_id):
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {"ok": True}
