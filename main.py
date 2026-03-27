"""""
DB file (created automatically):
  data/artists_db.json

Run:
    uvicorn main:app --reload --port 8000

Interactive docs: http://localhost:8000/docs
"""

import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from spotify_client import get_access_token, get_artist_data, get_monthly_listeners
from json_updater import load_artists, save_artists


# ══════════════════════════════════════════════════
# App setup
# ══════════════════════════════════════════════════

BASE_DIR             = Path(__file__).parent
CREDENCIAL_KEYS_FILE = BASE_DIR / "Control/credencials_rdf.json"
DB_FILE              = BASE_DIR / "data/artists.json"

app = FastAPI(title="Concert Manager API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/artists")
def get_artists():
    """Return current local JSON data."""
    return load_artists()


@app.post("/artists/sync")
async def sync_all_artists():
    """Fetch latest Spotify data and update the local JSON for all artists."""
    token = await get_access_token()
    data = load_artists()

    for artist in data["artists"]:
        artist_id = artist["spotify_id"]

        # Fetch from Spotify API
        spotify_data = await get_artist_data(artist_id, token)
        artist["popularity"] = spotify_data["popularity"]
        artist["followers"] = spotify_data["followers"]

        # Scrape monthly listeners
        artist["monthly_listeners"] = await get_monthly_listeners(artist_id)

    save_artists(data)
    return {"message": "Synced successfully", "artists": data["artists"]}


@app.post("/artists/{artist_id}/sync")
async def sync_one_artist(artist_id: str):
    """Sync a single artist by their Spotify ID."""
    token = await get_access_token()
    data = load_artists()

    artist = next((a for a in data["artists"] if a["spotify_id"] == artist_id), None)
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found in JSON")

    spotify_data = await get_artist_data(artist_id, token)
    artist["popularity"] = spotify_data["popularity"]
    artist["followers"] = spotify_data["followers"]
    artist["monthly_listeners"] = await get_monthly_listeners(artist_id)

    save_artists(data)
    return {"message": "Synced", "artist": artist}