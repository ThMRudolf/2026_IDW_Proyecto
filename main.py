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

# ══════════════════════════════════════════════════
# App setup
# ══════════════════════════════════════════════════

BASE_DIR             = Path(__file__).parent
CREDENCIAL_KEYS_FILE = BASE_DIR / "Control/credencials_rdf.json"
DB_FILE              = BASE_DIR / "data/artists.json"

TM_BASE = "https://app.ticketmaster.com/discovery/v2"

app = FastAPI(title="Concert Manager API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)