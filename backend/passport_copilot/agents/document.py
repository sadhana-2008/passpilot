import os
from google.adk import Agent
from ..tools.document_tools import (
    extract_document_fields,
    compare_documents,
    call_document_validation_api,
)

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.8-flash")

document_agent = Agent(
    name="document_agent",
    instruction="""You are the Document Specialist.
    Your task is to analyze and validate user-uploaded documents.
    1. If uploaded as file references, call `extract_document_fields` on each uploaded file (given as file_refs).
    2. When a user asks to compare or validate document fields, call `call_document_validation_api` to run validation via the validation API (POST /api/documents/validate) and use its actual structured response.
    3. You can also use `compare_documents` to check for inconsistencies locally.
    4. Return the structured validation results including all checks, issues, and human review flags.
    5. If any errors occur or validation fails, inform the user about the missing data or service error. Do not guess or fabricate results.""",
    model=MODEL_NAME,
    tools=[extract_document_fields, compare_documents, call_document_validation_api],
)
