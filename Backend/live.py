"""
Gemini Live helpers — session configuration and scenario serialization.
"""

from google.genai import types


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
