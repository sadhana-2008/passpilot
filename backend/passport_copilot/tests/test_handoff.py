import json
from pathlib import Path
from unittest.mock import patch, MagicMock
import httpx
import pytest
from starlette.testclient import TestClient

from backend.passport_copilot.agents import handoff_agent, assess_handoff, evaluate_human_handoff
from backend.passport_copilot.agents.handoff import (
    filter_verified_rules,
    format_handoff_response,
    DISCLAIMER_TEXT,
)
from backend.passport_copilot.tools.document_tools import (
    validate_documents,
    call_document_validation_api,
)
from backend.passport_copilot.workflow import (
    orchestrate_document_validation,
    fetch_verified_policy_rules,
)
from backend.server import app


def test_name_mismatch_triggers_human_review():
    """
    Test 1: A name mismatch with requires_human_review: true.
    Verifies neutral, non-accusatory language, check ID inclusion,
    next steps, disclaimer, and human review recommendation.
    """
    docs = [
        {"document_type": "Aadhaar Card", "name": "Meenakshi Raghavan", "dob": "1998-05-15", "expiry_date": None},
        {"document_type": "Birth Certificate", "name": "Meenakshi R", "dob": "1998-05-15", "expiry_date": None},
    ]

    # Run document validation
    val_result = validate_documents(docs)
    assert val_result["requires_human_review"] is True
    assert val_result["has_insufficient_data"] is False
    assert any(c["check_id"] == "CHK_NAME_MATCH" and c["status"] == "failed" for c in val_result["checks"])

    # Run handoff assessment
    handoff = assess_handoff(validation_result=val_result)
    assert handoff["handoff_status"] == "Human review recommended"
    assert "CHK_NAME_MATCH" in " ".join(handoff["relevant_checks"])
    assert DISCLAIMER_TEXT in handoff["disclaimer"]

    # Verify formatted response conforms to 5-part structure
    formatted = handoff["formatted_response"]
    assert "1. Handoff status: Human review recommended" in formatted
    assert "2. Reason:" in formatted
    assert "3. Relevant validation checks and verified rules:" in formatted
    assert "4. Recommended next steps:" in formatted
    assert "5. Disclaimer:" in formatted

    # Neutral language verification: never accuse of fraud or claim fake/authentic
    lower_resp = formatted.lower()
    assert "fraud" not in lower_resp
    assert "fake" not in lower_resp
    assert "authentic" not in lower_resp
    assert "guaranteed" not in lower_resp


def test_insufficient_data_triggers_human_review():
    """
    Test 2: Insufficient data triggers human review.
    Covers empty list, single document, and missing name.
    """
    # Case A: Empty list
    val_empty = validate_documents([])
    assert val_empty["has_insufficient_data"] is True
    assert val_empty["requires_human_review"] is True
    handoff_empty = assess_handoff(validation_result=val_empty)
    assert handoff_empty["handoff_status"] == "Human review recommended"
    assert "insufficient" in handoff_empty["reason"].lower()

    # Case B: Single document (cannot cross-compare)
    val_single = validate_documents([
        {"document_type": "Aadhaar", "name": "Sharan Kumar", "dob": "1998-05-15"}
    ])
    assert val_single["has_insufficient_data"] is True
    assert val_single["requires_human_review"] is True
    handoff_single = assess_handoff(validation_result=val_single)
    assert handoff_single["handoff_status"] == "Human review recommended"
    assert "CHK_DOC_COUNT" in " ".join(handoff_single["relevant_checks"])

    # Case C: Missing name field
    val_missing_name = validate_documents([
        {"document_type": "Aadhaar", "name": "", "dob": "1998-05-15"},
        {"document_type": "Voter ID", "name": "Sharan Kumar", "dob": "1998-05-15"},
    ])
    assert val_missing_name["has_insufficient_data"] is True
    assert val_missing_name["requires_human_review"] is True


def test_no_discrepancies_not_flagged():
    """
    Test 3: No discrepancies and no human-review flag -> 'Not currently flagged'.
    """
    docs = [
        {"document_type": "Aadhaar", "name": "Sharan Kumar", "dob": "1998-05-15", "expiry_date": None},
        {"document_type": "Voter ID", "name": "Sharan Kumar", "dob": "1998-05-15", "expiry_date": None},
    ]

    val_result = validate_documents(docs)
    assert val_result["requires_human_review"] is False
    assert val_result["has_insufficient_data"] is False
    assert all(c["status"] == "passed" for c in val_result["checks"])

    handoff = assess_handoff(validation_result=val_result)
    assert handoff["handoff_status"] == "Not currently flagged"
    assert "No discrepancies" in handoff["reason"]
    assert "1. Handoff status: Not currently flagged" in handoff["formatted_response"]
    assert DISCLAIMER_TEXT in handoff["disclaimer"]


def test_failed_or_unreachable_validation_api():
    """
    Test 4: A failed or unreachable validation API.
    Verifies service failure is reported and handoff status is 'Unable to determine'.
    """
    docs = [{"document_type": "Aadhaar", "name": "Sharan Kumar"}]

    # Simulate network failure (e.g. Connection refused)
    with patch("httpx.Client.post", side_effect=httpx.ConnectError("Connection refused")):
        api_result = call_document_validation_api(docs, api_url="http://invalid-host:9999/api/documents/validate")
        assert api_result["status"] == "error"
        assert "unreachable" in api_result["error"].lower()

        # Orchestration workflow test with failed API
        wf_result = orchestrate_document_validation(docs, validation_api_url="http://invalid-host:9999/api/documents/validate")
        assert wf_result["status"] == "error"
        assert wf_result["validation_result"] is None

        handoff = wf_result["handoff_assessment"]
        assert handoff["handoff_status"] == "Unable to determine"
        assert "validation failed" in handoff["reason"].lower() or "unreachable" in handoff["reason"].lower()
        assert "1. Handoff status: Unable to determine" in handoff["formatted_response"]
        assert DISCLAIMER_TEXT in handoff["disclaimer"]


def test_missing_validation_results():
    """
    Test 5: Missing validation results.
    Verifies assessment returns 'Unable to determine' when results are None, empty, or missing checks.
    """
    # None result
    handoff_none = assess_handoff(validation_result=None)
    assert handoff_none["handoff_status"] == "Unable to determine"
    assert "missing" in handoff_none["reason"].lower()
    assert "1. Handoff status: Unable to determine" in handoff_none["formatted_response"]

    # Empty dictionary without checks
    handoff_empty_dict = assess_handoff(validation_result={})
    assert handoff_empty_dict["handoff_status"] == "Unable to determine"
    assert "missing" in handoff_empty_dict["reason"].lower()

    # Malformed result
    handoff_malformed = assess_handoff(validation_result={"invalid": True})
    assert handoff_malformed["handoff_status"] == "Unable to determine"


def test_draft_or_unverified_rules_never_presented_as_verified():
    """
    Test 6: A response that includes only draft or unverified rules.
    Verifies that the handoff logic never presents draft rules as verified.
    """
    draft_rules = [
        {
            "rule_id": "R001",
            "title": "Name must match across documents",
            "status": "draft",
            "rule_text": "[TO VERIFY] Applicant name must be consistent.",
            "source_name": "TO FILL: official page name",
            "source_url": "TO FILL: specific official page URL",
            "verified_on": None,
            "verified_by": None,
        },
        {
            "rule_id": "R002",
            "title": "DOB must match across documents",
            "status": "draft",
            "rule_text": "[TO VERIFY] Date of birth must be the same.",
            "source_name": "TO FILL",
            "source_url": "TO FILL",
            "verified_on": None,
            "verified_by": None,
        },
    ]

    # filter_verified_rules should reject all draft rules
    filtered = filter_verified_rules(draft_rules)
    assert len(filtered) == 0

    # Passing draft rules to assess_handoff must not present them as verified
    val_result = {
        "checks": [
            {"check_id": "CHK_NAME_MATCH", "name": "Name Consistency", "status": "passed", "requires_human_review": False}
        ],
        "requires_human_review": False,
        "has_insufficient_data": False,
        "disclaimer": DISCLAIMER_TEXT,
    }

    handoff = assess_handoff(validation_result=val_result, verified_rules=draft_rules)
    assert "R001" not in " ".join(handoff["relevant_rules"])
    assert "R002" not in " ".join(handoff["relevant_rules"])
    assert "No verified rules" in " ".join(handoff["relevant_rules"])

    # Now verify that a genuinely verified rule IS included properly
    verified_rules = [
        {
            "rule_id": "VR001",
            "title": "Minor Applicant Parental Consent",
            "status": "verified",
            "rule_text": "Minor passport applications require consent from both parents.",
            "source_name": "Passport Seva Official Portal",
            "source_url": "https://www.passportindia.gov.in/AppOnlineProject/online/faqServices",
            "verified_on": "2026-01-10",
            "verified_by": "Compliance Lead",
            "needs_officer_confirmation": True,
        }
    ]

    valid_filtered = filter_verified_rules(verified_rules)
    assert len(valid_filtered) == 1
    assert valid_filtered[0]["rule_id"] == "VR001"

    handoff_verified = assess_handoff(validation_result=val_result, verified_rules=verified_rules)
    assert "VR001" in " ".join(handoff_verified["relevant_rules"])
    # Because needs_officer_confirmation is True, human review is recommended!
    assert handoff_verified["handoff_status"] == "Human review recommended"


def test_fastapi_endpoints():
    """
    Test 7: Direct testing of POST /api/documents/validate and GET /api/rules via TestClient.
    """
    client = TestClient(app)

    # 1. Test GET /api/rules
    resp_rules = client.get("/api/rules")
    assert resp_rules.status_code == 200
    data_rules = resp_rules.json()
    assert data_rules["status"] == "ok"
    assert isinstance(data_rules["rules"], list)

    # 2. Test GET /api/rules with status filter
    resp_draft = client.get("/api/rules?status=draft")
    assert resp_draft.status_code == 200
    data_draft = resp_draft.json()
    assert all(r.get("status") == "draft" for r in data_draft["rules"])

    # 3. Test POST /api/documents/validate with name mismatch
    mismatch_payload = {
        "documents": [
            {"document_type": "Aadhaar", "name": "Meenakshi Raghavan", "dob": "1998-05-15"},
            {"document_type": "Birth Certificate", "name": "Meenakshi R", "dob": "1998-05-15"},
        ]
    }
    resp_val = client.post("/api/documents/validate", json=mismatch_payload)
    assert resp_val.status_code == 200
    val_data = resp_val.json()
    assert val_data["requires_human_review"] is True
    assert any(c["check_id"] == "CHK_NAME_MATCH" and c["status"] == "failed" for c in val_data["checks"])

    # 4. Test POST /api/documents/validate with matching documents
    matching_payload = {
        "documents": [
            {"document_type": "Aadhaar", "name": "Meenakshi Raghavan", "dob": "1998-05-15"},
            {"document_type": "Voter ID", "name": "Meenakshi Raghavan", "dob": "1998-05-15"},
        ]
    }
    resp_match = client.post("/api/documents/validate", json=matching_payload)
    assert resp_match.status_code == 200
    match_data = resp_match.json()
    assert match_data["requires_human_review"] is False
    assert match_data["has_insufficient_data"] is False


def test_handoff_agent_and_export():
    """
    Test 8: Verify handoff_agent export, configuration, and tools.
    """
    assert handoff_agent.name == "handoff_agent"
    assert "Human Handoff Specialist" in handoff_agent.instruction
    assert "1. Handoff status:" in handoff_agent.instruction
    assert "5. Disclaimer:" in handoff_agent.instruction
    assert "gemini-2.5-flash" not in handoff_agent.model

    # Check tools available
    tool_names = [getattr(t, "name", getattr(t, "__name__", str(t))) for t in handoff_agent.tools]
    assert "evaluate_human_handoff" in tool_names
    assert "get_appointment_slots" in tool_names
    assert "book_appointment" in tool_names
    assert "get_application_status" in tool_names
    assert "generate_handoff_pdf" in tool_names
