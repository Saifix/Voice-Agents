# Demo Voice Agents by Saif

Real-time voice agents powered by the **Gemini Live API**, with a React UI
(reactive gradient orb + live sound waves), per-agent personas, and a
password-protected admin panel. Fully containerized with automatic HTTPS.

🔗 **Live:** https://saifix.dev

---

## Features

- 🎙️ **Real-time voice** — speak and hear natural replies; barge-in supported.
- 🧑‍💼 **Multiple agents (scenarios)** — each with its own voice, prompt and accent
  colour. Ships with: Zameen.pk Property Consultant (Urdu), Cheesious online
  ordering, English Tutor, and a WAPDA complaint helpline.
- ✨ **Polished UX** — connecting animation, "speak only when the agent is ready"
  handshake, and a 2-minute session timer with countdown.
- 📇 **Lead capture** — name, email and phone (with country code) before each call.
- 🔐 **Admin panel** — manage scenarios, model, voice and API key; view usage.
- 🗄️ **PostgreSQL** for settings, scenarios and usage records.
- 🔑 API key handled as a **Docker secret** — never in the image or the repo.

## Architecture

```
Browser ──(WebSocket, 16 kHz PCM)──► FastAPI ──► Gemini Live API
   ▲  React SPA (orb, gate, admin)      │  proxies audio both ways
   └──────(24 kHz PCM audio)────────────┘
                                        └──► PostgreSQL (settings/scenarios/usage)
Caddy terminates HTTPS and proxies everything (incl. /ws) to the app.
```

| Path | What |
|------|------|
| `Backend/` | FastAPI app (`main.py`), DB layer (`db.py`) |
| `Frontend/` | React + Vite SPA (`src/`), served by the backend in production |
| `Dockerfile` | Multi-stage: build the SPA → run FastAPI serving it |
| `docker-compose.yml` | `db` + `web` + `caddy` (HTTPS) |
| `Caddyfile` | Reverse proxy + automatic TLS |
| `.github/workflows/deploy.yml` | Push-to-deploy CI/CD |

## Run it (Docker)

Create a `.env` in the project root:

```env
GEMINI_API_KEY=your-gemini-api-key
SITE_ADDRESS=your-domain.com      # or localhost for local use
```

Then:

```bash
docker compose up -d --build
```

Open the app (`https://your-domain.com`, or `http://localhost` if `SITE_ADDRESS=localhost`).
Tables are created and seeded automatically on first run.

> Microphone access requires HTTPS (or `localhost`).

## Local development (hot reload)

Run only Postgres in Docker; the app on the host:

```bash
docker compose up -d db                       # Postgres on 127.0.0.1:5433
cd Backend && pip install -r requirements.txt && python main.py   # :8000
cd Frontend && npm install && npm run dev                          # :5173
```

## Admin

Visit `/admin` (default password **`admin123`** — change it immediately).
Add/edit/delete agents, set the model/voice/API key, and review usage.

## Deployment (CI/CD)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which SSHes into the
server and runs `git reset --hard origin/main && docker compose up -d --build`.

Required GitHub Actions secrets: `DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY`.
The server keeps its own `.env`; secrets are never committed.

## Tech

FastAPI · WebSockets · google-genai (Gemini Live) · React + Vite · PostgreSQL +
SQLAlchemy · Docker Compose · Caddy.
