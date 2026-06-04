# Demo Voice Agents by Saif

A real-time voice assistant built on the **Gemini 3.1 Flash Live** API, with a
**React** frontend (reactive gradient orb + live sound waves, minimal theme), a
password-protected admin panel, and **PostgreSQL** persistence.

```
Voice Agent/
├── docker-compose.yml      db (Postgres 16) + web (full app) services
├── Dockerfile              multi-stage: build React -> serve via FastAPI
├── .dockerignore
├── Backend/                FastAPI — proxies Gemini Live, serves the SPA
│   ├── main.py             API, WebSocket relay, 2-min session limit
│   ├── db.py               SQLAlchemy: settings, scenarios, usage records
│   ├── requirements.txt
│   └── apikey.json         (auto-created if you set the key in the admin panel)
├── Frontend/               React + Vite app
│   ├── vite.config.js       dev proxy: /api + /ws -> :8000
│   ├── public/capture-processor.js   AudioWorklet (16 kHz PCM capture)
│   └── src/
│       ├── main.jsx          routes: /  and  /admin
│       ├── App.jsx           gate -> scenario picker -> call
│       ├── audio/
│       │   ├── AudioEngine.js     mic capture, playback scheduler, WebSocket
│       │   └── OrbVisualizer.js   reactive gradient orb / sound waves
│       └── components/  Gate · ScenarioPicker · CallView · Visualizer · Admin
├── ai_studio_code.py       original reference script
└── .env                    GEMINI_API_KEY=... , DATABASE_URL=...
```

## How it works

- The browser captures mic audio at **16 kHz PCM16** (via an `AudioWorklet`) and
  streams it over a WebSocket to the backend.
- The backend holds the Gemini API key (never exposed to the browser), opens a
  `client.aio.live.connect(...)` session and relays audio both ways.
- Gemini's **24 kHz PCM16** audio is scheduled gap-free for playback; barge-in
  interruptions flush the playback buffer.
- Two `AnalyserNode`s (mic + AI output) drive the visualizer: teal when you speak,
  the scenario's accent colour when the assistant speaks, soft breathing when idle.
- Each session is **limited to 2 minutes**, enforced on the server, with a live
  countdown shown in the UI.

## Persistence

Everything **except the API key** lives in PostgreSQL:

- `app_config` — model, fallback voice, system instruction, admin password hash
- `scenarios` — the selectable personas
- `usage_records` — one row per completed session

The **Gemini API key is never stored in the database**. In Docker it is provided
as a **Docker secret**: the value is taken from `GEMINI_API_KEY` in `.env` at
`compose up` time and mounted read-only at `/run/secrets/gemini_api_key` inside
the container — it is *not* a container environment variable, so it never appears
in `docker inspect` or the image layers. The backend resolves the key in this
order: admin-set `apikey.json` → secret file → `GEMINI_API_KEY` env (for local dev).

**Database data is durable.** Postgres lives in the named volume
`voiceagent_pgdata`, which survives `docker compose down` / `up` and rebuilds.
It is only removed by an explicit `docker compose down -v` (or deleting the
volume). Usage records can be cleared from the admin panel without touching the
rest of the data.

## Run — everything in Docker (recommended)

The whole app (Postgres + a single image that builds the React frontend and runs
the FastAPI backend serving it) runs with one command:

```bash
# from the project root — make sure .env has GEMINI_API_KEY=...
docker compose up -d --build
```

- **App:** http://localhost:8000  (frontend, API and `/ws` are all same-origin)
- **Postgres:** exposed on host port **5433** (internal `db:5432`)
- `GEMINI_API_KEY` from `.env` is injected as a **Docker secret** (mounted file,
  not an env var). Tables are auto-created and seeded on first start.

Stop / reset:
```bash
docker compose down        # stop — KEEPS the database
docker compose up -d       # start again — data is still there
docker compose down -v     # stop AND wipe the database volume
```

> Changing the key in `.env` later: `docker compose up -d` (recreates `web`).
> `.env` is the durable source for the key.

## Run — local dev (hot reload)

Run Postgres in Docker but the backend/frontend on the host:

```bash
docker compose up -d db                 # Postgres only, on localhost:5433
cd Backend && pip install -r requirements.txt && python main.py   # :8000
cd Frontend && npm install && npm run dev                          # :5173 (proxies to :8000)
```

Open the app, enter your name, click **Allow location** (optional — you can
continue if denied), pick a scenario, then allow microphone access.

> Mic + geolocation require a *secure context*. `localhost` counts as secure, so
> local dev works. To deploy on another host, serve over **HTTPS**.

## Scenarios

Ships with four realistic Pakistan scenarios — each with its own voice, detailed
prompt and accent colour that tints the orb:

- 🏠 **Zameen.pk Property Consultant** (Urdu) · 🍕 **Cheesious — Online Order** ·
  📚 **English Tutor** · ⚡ **WAPDA Complaint Helpline** (Urdu/English)

Admins can create, edit and delete scenarios from the admin panel. The public
`/api/scenarios` endpoint exposes display metadata only — never the prompt.

## Admin panel

Open **/admin**. Default password: **`admin123`** (change it from the panel).

- **Scenarios**: add / edit / delete personas (voice + prompt + accent + emoji).
- **Defaults & credentials**: model, fallback voice + instruction, **API key**.
- **Usage records**: per-session name, scenario, voice, location and duration.
