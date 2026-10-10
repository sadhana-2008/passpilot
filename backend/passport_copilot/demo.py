import asyncio
import os
from dotenv import load_dotenv

# Load .env BEFORE importing agents so MODEL_NAME is available at module-load time
load_dotenv()

from google.adk import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from backend.passport_copilot.agent import root_agent


async def run_demo():
    print("=======================================")
    print(" Passport Readiness Copilot - Demo")
    print("=======================================")

    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        session_service=session_service,
        app_name="passpilot_demo",
    )

    # Create a session first
    await session_service.create_session(
        app_name="passpilot_demo",
        user_id="test_user",
        session_id="test_session",
    )

    user_input = (
        "Hi, I'm a student applying for a fresh passport. "
        "I'm over 18. Here are my Aadhaar and Voter ID. "
        "The file references are doc_1 and doc_2."
    )
    print(f"User: {user_input}\n")

    message = types.Content(
        role="user",
        parts=[types.Part(text=user_input)],
    )

    print("Copilot:")
    async for event in runner.run_async(
        user_id="test_user",
        session_id="test_session",
        new_message=message,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    print(part.text, end="", flush=True)

    print()  # newline after streaming output


if __name__ == "__main__":
    asyncio.run(run_demo())
