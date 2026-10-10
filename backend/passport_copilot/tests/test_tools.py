from backend.passport_copilot.tools.handoff_tools import get_appointment_slots, get_application_status
from backend.passport_copilot.tools.document_tools import extract_document_fields, compare_documents
from backend.passport_copilot.tools.search import search_guidelines

def test_get_appointment_slots():
    slots = get_appointment_slots("Chennai")
    assert len(slots) > 0
    assert slots[0]["city"].lower() == "chennai"

def test_get_application_status():
    status = get_application_status("REF12345")
    assert status["status"] == "Pending Police Verification"
    
    missing = get_application_status("NONEXISTENT")
    assert missing["status"] == "Not Found"

def test_compare_documents():
    docs = [
        {"document_type": "Aadhaar", "name": "Sharan Kumar", "dob": "1998-05-15", "expiry_date": None},
        {"document_type": "Voter ID", "name": "Sharan K", "dob": "1998-05-15", "expiry_date": None}, # fuzzy match passes
        {"document_type": "Driving License", "name": "S K", "dob": "1998-05-16", "expiry_date": "2024-01-01"} # Mismatch dob, name, and expired
    ]
    issues = compare_documents(docs)
    assert len(issues) == 3
    types = [i["type"] for i in issues]
    assert "expired_proof" in types
    assert "name_mismatch" in types
    assert "dob_mismatch" in types

def test_search_guidelines():
    # Test hit
    results = search_guidelines("minor", {"is_minor": True})
    assert len(results) > 0
    assert any("minor" in r["section"].lower() or "minor" in r["passage"].lower() for r in results)
    
    # Test no hit (if searching for something not in guidelines)
    results = search_guidelines("astronaut", {})
    assert len(results) == 0

def test_generate_handoff_pdf():
    from backend.passport_copilot.tools.handoff_tools import generate_handoff_pdf
    pdf = generate_handoff_pdf(
        case_profile={"application_type": "Fresh"},
        checklist=[{"item": "Aadhaar", "source": "guidelines.txt"}],
        issues=[{"type": "name_mismatch", "detail": "Mismatch", "suggested_fix": "Fix"}],
        appointment={"slot_id": "slot-1", "status": "success"}
    )
    assert "filename" in pdf
    assert "base64" in pdf
    assert pdf["filename"].startswith("handoff_Fresh")

def test_safety_callbacks():
    from backend.passport_copilot.safety import enforce_safety_instructions
    from google.adk import Agent
    
    agent = Agent(name="test", instruction="Test", model="gemini-3.8-flash")
    agent = enforce_safety_instructions(agent)
    
    assert "CRITICAL SAFETY RULES:" in agent.instruction
    assert "Unofficial assistant." in agent.instruction
    
    # Check callbacks are set
    assert agent.before_tool_callback is not None
    assert agent.after_agent_callback is not None
