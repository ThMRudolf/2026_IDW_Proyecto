import os
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()


import json

with open("control/credencials_rdf.json") as f:
    config = json.load(f)

CLIENT_ID = config["credentials"]["client_id"]
CLIENT_SECRET = config["credentials"]["client_secret"]

async def get_access_token() -> str:
    credentials = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {credentials}"},
            data={"grant_type": "client_credentials"},
        )
    return response.json()["access_token"]


async def get_artist_data(artist_id: str, token: str) -> dict:
    """Fetch popularity score from Spotify Web API."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.spotify.com/v1/artists/{artist_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
    data = response.json()
    #print(f"Fetched data for {artist_id}: {data.get('name')}, popularity: {data.get('popularity')}")
    return {
        "popularity": data.get("popularity"),
        "followers": data.get("followers", {}).get("total"),
    }


async def get_monthly_listeners(artist_id: str) -> int | None:
    """Scrape monthly listeners from Spotify artist page."""
    url = f"https://open.spotify.com/artist/{artist_id}"
    #print(f"Fetching monthly listeners from {url}")
    headers = {"User-Agent": "Mozilla/5.0"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    # Extract from meta tag or JSON-LD
    import re
    #print(f"Fetched page for {artist_id}, length: {len(data)}, first 500 chars: {data[:500]}")
    #print(f"Fetched data for {artist_id}: {data.get('name')}, popularity: {data.get('popularity')}")

    match = re.search(r'"monthlyListeners":(\d+)', response.text)
    if match:
        return int(match.group(1))
    return None