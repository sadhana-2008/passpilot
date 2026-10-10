from google.adk import Agent
from ..tools.document_tools import extract_document_fields, compare_documents
import os

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.8-flash")

document_agent = Agent(
    name="document_agent",
    instruction="""You are the Document Specialist.
    Your task is to analyze user-uploaded documents using `extract_document_fields` and `compare_documents`.
    Call `extract_document_fields` on each uploaded file (given as file_refs), then pass the results to `compare_documents`.
    Return the final issues list.
    If any errors occur, inform the user about the missing data.""",
    model=MODEL_NAME,
    tools=[extract_document_fields, compare_documents]
)
