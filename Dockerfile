# ------------------------------------------------------------------ #
#  Voice Agent — single image: builds the React frontend, then runs
#  the FastAPI backend which serves the built SPA + the WebSocket relay.
#  Build context is the project root (see docker-compose.yml).
# ------------------------------------------------------------------ #

# ---- Stage 1: build the React frontend --------------------------- #
FROM node:20-alpine AS frontend
WORKDIR /app/Frontend
COPY Frontend/package.json Frontend/package-lock.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build          # -> /app/Frontend/dist

# ---- Stage 2: Python backend ------------------------------------- #
FROM python:3.11-slim AS backend
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app/Backend

COPY Backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY Backend/ ./
# Preserve the repo layout main.py expects: <root>/Backend and <root>/Frontend/dist
COPY --from=frontend /app/Frontend/dist /app/Frontend/dist

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
