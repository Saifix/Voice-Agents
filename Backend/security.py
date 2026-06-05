"""
Security — Gemini API key resolution and admin authentication.

The Gemini API key is intentionally kept OUT of the database: it lives in a
local apikey.json (admin-set), a Docker secret file, or the environment.
"""

import os
import json
import hashlib
import secrets

from fastapi import HTTPException

from config import APIKEY_PATH


# --------------------------------------------------------------------------- #
#  API key — local file, falling back to Docker secret then env var
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
#  Admin auth — in-memory tokens (cleared on restart)
# --------------------------------------------------------------------------- #
_active_tokens: set[str] = set()


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def create_token() -> str:
    """Issue and register a fresh admin session token."""
    token = secrets.token_urlsafe(32)
    _active_tokens.add(token)
    return token


def require_admin(authorization: str | None) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin token")
    token = authorization.split(" ", 1)[1]
    if token not in _active_tokens:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")
