"""
Database layer (PostgreSQL via SQLAlchemy Core).

Stores everything EXCEPT the Gemini API key:
  * app_config   — singleton "settings" row (model, fallback voice, prompt,
                   admin password hash)
  * scenarios    — the selectable personas (voice + prompt + accent)
  * usage_records— one row per completed voice session

The API key is intentionally kept out of the database (see main.py — it lives
in a local apikey.json / the GEMINI_API_KEY env var).
"""

import os
import hashlib
import secrets

from sqlalchemy import (
    create_engine, MetaData, Table, Column, String, Float, Text, DateTime,
    select, insert, update, delete, func, text,
)
from sqlalchemy.dialects.postgresql import JSONB

# --------------------------------------------------------------------------- #
#  Connection
# --------------------------------------------------------------------------- #
DEFAULT_DB_URL = "postgresql+psycopg2://voiceagent:voiceagent@localhost:5433/voiceagent"


def _normalise(url: str) -> str:
    # Allow a plain "postgresql://" URL and pin it to the psycopg2 driver.
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


DATABASE_URL = _normalise(os.environ.get("DATABASE_URL", DEFAULT_DB_URL))
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
metadata = MetaData()

app_config = Table(
    "app_config", metadata,
    Column("key", String, primary_key=True),
    Column("value", JSONB, nullable=False),
)

scenarios = Table(
    "scenarios", metadata,
    Column("id", String, primary_key=True),
    Column("name", String, nullable=False),
    Column("description", Text, default=""),
    Column("emoji", String, default="💬"),
    Column("accent", String, default="#5b9dff"),
    Column("voice", String, default="Zephyr"),
    Column("system_instruction", Text, default=""),
    Column("sort_order", Float, default=0),
)

usage_records = Table(
    "usage_records", metadata,
    Column("id", String, primary_key=True),
    Column("name", String),
    Column("email", String),
    Column("phone", String),
    Column("country_code", String),
    Column("model", String),
    Column("voice", String),
    Column("scenario", String),
    Column("started_at", DateTime(timezone=True)),
    Column("ended_at", DateTime(timezone=True)),
    Column("duration_seconds", Float),
)

# --------------------------------------------------------------------------- #
#  Seed data
# --------------------------------------------------------------------------- #
DEFAULT_SETTINGS = {
    "model": "models/gemini-3.1-flash-live-preview",
    "voice": "Zephyr",
    "system_instruction": (
        "You are a warm, concise and helpful real-time voice assistant. "
        "Keep replies natural and conversational."
    ),
    "admin_password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
}

DEFAULT_SCENARIOS = [
    {
        "id": "zameen",
        "name": "Zameen.pk Property Consultant",
        "description": "Buy, sell or rent property across Pakistan — in Urdu.",
        "emoji": "🏠",
        "accent": "#1f9d57",
        "voice": "Orus",
        "system_instruction": (
            "You are a professional property consultant for Zameen.pk, Pakistan's leading "
            "real-estate portal. Speak primarily in natural, polite Urdu, mixing in the common "
            "English real-estate terms that Pakistanis use. Begin with a warm greeting such as "
            "'Assalam-o-Alaikum, Zameen.pk mein khush aamadeed'. Help the caller buy, sell or rent "
            "residential and commercial property across cities like Lahore, Karachi, Islamabad, "
            "Rawalpindi and Faisalabad, and popular societies such as DHA, Bahria Town, Gulberg and "
            "Johar Town. Ask about their purpose (kharidna, bechna ya kiraya), budget in PKR using "
            "lakh and crore, preferred location, plot size in marla or kanal, and number of bedrooms. "
            "Quote realistic price ranges, explain a few options, and offer to arrange a visit or "
            "connect them with an agent. Keep replies concise and courteous. Never promise legal or "
            "ownership guarantees — always advise verifying documents and ownership before any deal."
        ),
    },
    {
        "id": "cheesious",
        "name": "Cheesious — Online Order",
        "description": "Order pizza, broast and wings from Cheesious.",
        "emoji": "🍕",
        "accent": "#e23744",
        "voice": "Puck",
        "system_instruction": (
            "You are a friendly order-taking agent for Cheesious, a popular Pakistani fast-food "
            "restaurant famous for pizzas, chicken broast, wings, burgers and loaded fries. Greet the "
            "customer cheerfully and speak in a casual Pakistani style, mixing Urdu and English "
            "naturally. Take their order: suggest popular items and deals (for example the Cheesious "
            "Special Pizza, Chicken Broast, Crunchy Wings and combo deals), confirm pizza size "
            "(small, medium or large), quantity, add-ons and drinks, and gently upsell a deal or "
            "dessert. Then collect the delivery address and area, a contact number, and the payment "
            "method (Cash on Delivery or card). Read back the complete order, give an estimated total "
            "in PKR, and quote a delivery time of around 35 to 45 minutes. Be quick, warm and helpful. "
            "If an item is unavailable, politely suggest an alternative."
        ),
    },
    {
        "id": "english",
        "name": "English Tutor",
        "description": "Practise spoken English, grammar and IELTS prep.",
        "emoji": "📚",
        "accent": "#2563eb",
        "voice": "Aoede",
        "system_instruction": (
            "You are a patient, encouraging English-speaking tutor for Pakistani learners. Help the "
            "student improve spoken English, grammar, vocabulary and pronunciation, and assist with "
            "IELTS or exam preparation when asked. Speak mostly in clear, simple English at a "
            "comfortable pace; when the learner seems confused, briefly explain in Urdu and then "
            "switch back to English. Gently correct mistakes by repeating the correct sentence and "
            "explaining why it is better. Ask short questions to keep the learner talking, praise "
            "their effort, and suggest only one small improvement at a time. Maintain an upbeat, "
            "supportive tone throughout."
        ),
    },
    {
        "id": "wapda",
        "name": "WAPDA Complaint Helpline",
        "description": "Register electricity complaints — Urdu & English.",
        "emoji": "⚡",
        "accent": "#f59e0b",
        "voice": "Charon",
        "system_instruction": (
            "You are a courteous customer-service agent for the WAPDA / DISCO electricity complaint "
            "helpline in Pakistan (in the style of LESCO, IESCO or K-Electric). Speak in the typical "
            "helpline mix of Urdu and English. Greet the caller professionally and help with "
            "complaints such as load-shedding, unscheduled power outages (bijli band hai), voltage "
            "fluctuation, faulty or burnt meters, wrong or excessive billing, transformer faults and "
            "new connection requests. Politely ask for the caller's reference or account number, their "
            "area or feeder name, and a short description of the issue. Acknowledge the problem "
            "empathetically, register the complaint, and provide a complaint tracking number (make up "
            "a plausible one such as 'CMP-' followed by digits) along with an expected resolution "
            "timeframe. Stay calm and reassuring even if the caller is frustrated, and never make "
            "guarantees you cannot keep."
        ),
    },
]


# --------------------------------------------------------------------------- #
#  Init & helpers
# --------------------------------------------------------------------------- #
def init_db() -> None:
    """Create tables and seed defaults. Raises if the DB is unreachable."""
    metadata.create_all(engine)
    # Lightweight migration: add columns that may be missing on an older DB
    # (e.g. one created before email/phone replaced location).
    with engine.begin() as conn:
        for col in ("email", "phone", "country_code"):
            conn.execute(text(f"ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS {col} TEXT"))
    with engine.begin() as conn:
        has_settings = conn.execute(
            select(app_config.c.key).where(app_config.c.key == "settings")
        ).first()
        if not has_settings:
            conn.execute(insert(app_config).values(key="settings", value=DEFAULT_SETTINGS))

        count = conn.execute(select(func.count()).select_from(scenarios)).scalar()
        if not count:
            for i, s in enumerate(DEFAULT_SCENARIOS):
                conn.execute(insert(scenarios).values(sort_order=i, **s))


# ----- settings ------------------------------------------------------------ #
def get_settings() -> dict:
    with engine.connect() as conn:
        row = conn.execute(
            select(app_config.c.value).where(app_config.c.key == "settings")
        ).first()
    return dict(row[0]) if row else dict(DEFAULT_SETTINGS)


def update_settings(partial: dict) -> dict:
    s = get_settings()
    for k, v in partial.items():
        if v is not None:
            s[k] = v
    with engine.begin() as conn:
        conn.execute(
            update(app_config).where(app_config.c.key == "settings").values(value=s)
        )
    return s


# ----- scenarios ----------------------------------------------------------- #
def list_scenarios() -> list[dict]:
    with engine.connect() as conn:
        rows = conn.execute(
            select(scenarios).order_by(scenarios.c.sort_order, scenarios.c.name)
        ).mappings().all()
    return [dict(r) for r in rows]


def get_scenario(scenario_id: str | None) -> dict | None:
    if not scenario_id:
        return None
    with engine.connect() as conn:
        r = conn.execute(
            select(scenarios).where(scenarios.c.id == scenario_id)
        ).mappings().first()
    return dict(r) if r else None


def create_scenario(data: dict) -> dict:
    sid = secrets.token_hex(6)
    with engine.begin() as conn:
        max_order = conn.execute(
            select(func.coalesce(func.max(scenarios.c.sort_order), 0))
        ).scalar() or 0
        conn.execute(insert(scenarios).values(id=sid, sort_order=max_order + 1, **data))
    return get_scenario(sid)


def update_scenario(scenario_id: str, data: dict) -> dict | None:
    with engine.begin() as conn:
        res = conn.execute(
            update(scenarios).where(scenarios.c.id == scenario_id).values(**data)
        )
        if res.rowcount == 0:
            return None
    return get_scenario(scenario_id)


def delete_scenario(scenario_id: str) -> bool:
    with engine.begin() as conn:
        res = conn.execute(delete(scenarios).where(scenarios.c.id == scenario_id))
    return res.rowcount > 0


# ----- usage --------------------------------------------------------------- #
def add_usage(record: dict) -> None:
    with engine.begin() as conn:
        conn.execute(insert(usage_records).values(**record))


def get_usage():
    with engine.connect() as conn:
        rows = conn.execute(
            select(usage_records).order_by(usage_records.c.started_at.desc())
        ).mappings().all()
    records = []
    for r in rows:
        d = dict(r)
        for k in ("started_at", "ended_at"):
            if d.get(k) is not None:
                d[k] = d[k].isoformat()
        records.append(d)
    total_seconds = sum((r.get("duration_seconds") or 0) for r in records)
    summary = {
        "total_sessions": len(records),
        "total_seconds": round(total_seconds, 1),
        "total_minutes": round(total_seconds / 60, 1),
        "unique_users": len({r.get("name", "") for r in records}),
    }
    return records, summary


def clear_usage() -> None:
    with engine.begin() as conn:
        conn.execute(delete(usage_records))
