"""
FastAPI server for PassPilot — bridges the React frontend to the ADK agent.
"""
import asyncio
import os
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv

# Load env BEFORE importing agents so MODEL_NAME is available at import time
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

from backend.passport_copilot.agent import root_agent

# ─── Session management ────────────────────────────────────────────────────────
session_service = InMemorySessionService()
runner: Runner | None = None

APP_NAME = "passpilot"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    global runner
    runner = Runner(
        agent=root_agent,
        session_service=session_service,
        app_name=APP_NAME,
    )
    yield
    await runner.close()


app = FastAPI(title="PassPilot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response models ─────────────────────────────────────────────────
class StartRequest(BaseModel):
    user_id: str | None = None  # caller can supply or we generate one


class StartResponse(BaseModel):
    user_id: str
    session_id: str


class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str


# ─── Endpoints ─────────────────────────────────────────────────────────────────
@app.post("/api/session", response_model=StartResponse)
async def create_session(req: StartRequest):
    """Create a new conversation session."""
    user_id = req.user_id or f"user-{uuid.uuid4().hex[:8]}"
    session_id = f"session-{uuid.uuid4().hex[:12]}"
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=user_id,
        session_id=session_id,
    )
    return StartResponse(user_id=user_id, session_id=session_id)


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Send a message and stream back the agent's response as plain text."""
    if runner is None:
        raise HTTPException(status_code=503, detail="Runner not initialised")

    message = types.Content(
        role="user",
        parts=[types.Part(text=req.message)],
    )

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            async for event in runner.run_async(
                user_id=req.user_id,
                session_id=req.session_id,
                new_message=message,
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            yield part.text
        except Exception as exc:  # noqa: BLE001
            yield f"\n\n[Error: {exc}]"

    return StreamingResponse(event_stream(), media_type="text/plain")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
