from google.adk import Agent
from ..tools.search import search_guidelines
import os

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-2.5-flash")

policy_agent = Agent(
    name="policy_agent",
    instruction="""You are the Policy Specialist.
    Your task is to generate a checklist of required documents based on the official guidelines.
    Call `search_guidelines` using the user's query and their `case_profile`.
    Return checklist items in the format: [{item, source_document, section, needs_officer_confirmation}].
    Rules:
    1. Answer ONLY from the retrieved text.
    2. If retrieval returns nothing relevant, say you don't know and point to the official Passport Seva site.
    3. Never state a rule from model memory. Never invent fees or timelines.
    4. Set `needs_officer_confirmation` to true for any item related to eligibility, approval, or police verification outcome.
    """,
    model=MODEL_NAME,
    tools=[search_guidelines]
)
