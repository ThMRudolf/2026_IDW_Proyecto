import json
from pathlib import Path

JSON_PATH = Path("data/artists.json")

def load_artists() -> dict:
    return json.loads(JSON_PATH.read_text())

def save_artists(data: dict):
    JSON_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))