"""
Configuration — paths, environment loading and shared constants.

Importing this module loads the project's .env files exactly once, so every
other module can rely on environment variables already being present.
"""

from pathlib import Path

from dotenv import load_dotenv

# --------------------------------------------------------------------------- #
#  Paths
# --------------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parent          # <root>/Backend
ROOT_DIR = BASE_DIR.parent                           # <root>
FRONTEND_DIR = ROOT_DIR / "Frontend"
DIST_DIR = FRONTEND_DIR / "dist"                     # built React SPA
APIKEY_PATH = BASE_DIR / "apikey.json"               # the ONE thing not in Postgres

# Load env from the project root first, then allow a Backend-local override.
load_dotenv(ROOT_DIR / ".env", override=True)
load_dotenv(BASE_DIR / ".env", override=True)

# --------------------------------------------------------------------------- #
#  Audio / session constants
# --------------------------------------------------------------------------- #
SEND_SAMPLE_RATE = 16000        # browser mic -> Gemini
RECEIVE_SAMPLE_RATE = 24000     # Gemini -> browser
MAX_SESSION_SECONDS = 120       # hard limit per conversation

# --------------------------------------------------------------------------- #
#  Gemini model / voice catalogue (surfaced to the admin panel)
# --------------------------------------------------------------------------- #
AVAILABLE_VOICES = [
    "Zephyr", "Puck", "Charon", "Kore", "Fenrir",
    "Aoede", "Leda", "Orus", "Callirrhoe", "Autonoe",
]
AVAILABLE_MODELS = [
    "models/gemini-3.1-flash-live-preview",
    "models/gemini-2.5-flash-preview-native-audio-dialog",
    "models/gemini-2.0-flash-live-001",
]
