from google.adk import Agent
from ..tools.handoff_tools import get_appointment_slots, book_appointment, get_application_status, generate_handoff_pdf
import os

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")

handoff_agent = Agent(
    name="handoff_agent",
    instruction="""You are the Handoff Specialist.
    Your task is to finalize the user's handoff packet and appointment.
    Given the `checklist`, `issues`, and `case_profile`, first offer them a mock appointment slot (use `get_appointment_slots`).
    If they choose a slot, book it using `book_appointment`.
    Finally, generate the handoff PDF using `generate_handoff_pdf` and return its data to the orchestrator.
    If the user asks for application status, use `get_application_status`.
    Explain things in plain, friendly language with a clear next step.
    """,
    model=MODEL_NAME,
    tools=[get_appointment_slots, book_appointment, get_application_status, generate_handoff_pdf]
)
