"""Serve the built React SPA (Frontend/dist). Registered last so it only
catches paths not claimed by the API or the WebSocket relay."""

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from config import DIST_DIR

router = APIRouter()

_NOT_BUILT = {
    "message": "Frontend not built yet. Run `npm install && npm run build` in the "
               "Frontend folder, or use the Vite dev server (`npm run dev`, port 5173)."
}


@router.get("/{full_path:path}")
async def spa(full_path: str):
    if not DIST_DIR.exists():
        return JSONResponse(_NOT_BUILT, status_code=200)
    candidate = (DIST_DIR / full_path).resolve()
    if candidate.is_file() and str(candidate).startswith(str(DIST_DIR.resolve())):
        return FileResponse(candidate)
    return FileResponse(DIST_DIR / "index.html")
