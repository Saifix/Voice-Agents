"""Pydantic request bodies for the admin API."""

from pydantic import BaseModel


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
