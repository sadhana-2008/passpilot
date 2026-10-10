"""
test_document_validation.py — Automated test suite for Document Validation Agent integration.

Covers all 12 requirements:
1. The provided demo JSON payload.
2. Different names with matching dates of birth.
3. Matching document fields.
4. Missing case ID or malformed documents.
5. Insufficient data.
6. Human-review-required responses.
7. API connection failure and timeout.
8. HTTP errors and invalid JSON.
9. Unavailable policy rules.
10. Draft or unverified rules never presented as verified.
11. Handoff receiving the actual validation result.
12. Agent imports and orchestrator integration.
"""

import json
from unittest.mock import patch, MagicMock
import pytest
import requests
from starlette.testclient import TestClient

from backend.server import app
from backend.passport_copilot.tools.document_validation import (
    validate_documents as client_validate_documents,
    get_sourced_rules,
    check_api_health,
    get_api_base_url,
)
from backend.passport_copilot.tools.document_tools import validate_documents as engine_validate_documents
from backend.passport_copilot.workflow import orchestrate_document_validation
from backend.passport_copilot.agents.handoff import assess_handoff, filter_verified_rules
from backend.passport_copilot.agents import document_agent, handoff_agent, policy_agent, intake_agent
from backend.passport_copilot.agent import root_agent

client = TestClient(app)


# ─── 1. The provided demo JSON ──────────────────────────────────────────────────
def test_demo_json_payload():
    """
    Test 1: Use the exact demo request format:
    case_id: DEMO-001, identity with Arjun Kumar, address with Arjun Raj, both DOB 2005-04-12.
    """
    demo_payload = {
        "case_id": "DEMO-001",
        "documents": [
            {
                "type": "identity",
                "fields": {
                    "name": "Arjun Kumar",
                    "date_of_birth": "2005-04-12",
                },
            },
            {
                "type": "address",
                "fields": {
                    "name": "Arjun Raj",
                    "date_of_birth": "2005-04-12",
                },
            },
        ],
    }

    # Test directly against FastAPI endpoint
    response = client.post("/api/documents/validate", json=demo_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["case_id"] == "DEMO-001"
    assert data["requires_human_review"] is True
    assert data["has_insufficient_data"] is False

    # Name mismatch should be flagged
    name_check = next((c for c in data["checks"] if c["check_id"] == "CHK_NAME_MATCH"), None)
    assert name_check is not None
    assert name_check["status"] == "failed"
    assert "Arjun Kumar" in name_check["details"]
    assert "Arjun Raj" in name_check["details"]

    # DOB match should pass
    dob_check = next((c for c in data["checks"] if c["check_id"] == "CHK_DOB_MATCH"), None)
    assert dob_check is not None
    assert dob_check["status"] == "passed"


# ─── 2. Different names with matching dates of birth ───────────────────────────
def test_different_names_matching_dob():
    """
    Test 2: Verifies that different names with matching DOB reports name mismatch.
    """
    payload = {
        "case_id": "CASE-DIFF-NAME",
        "documents": [
            {
                "type": "identity",
                "fields": {"name": "Priya Sharma", "date_of_birth": "1999-08-20"},
            },
            {
                "type": "address",
                "fields": {"name": "Priya Verma", "date_of_birth": "1999-08-20"},
            },
        ],
    }

    result = engine_validate_documents(payload["documents"], case_id=payload["case_id"])
    assert result["requires_human_review"] is True
    assert any(c["check_id"] == "CHK_NAME_MATCH" and c["status"] == "failed" for c in result["checks"])
    assert any(c["check_id"] == "CHK_DOB_MATCH" and c["status"] == "passed" for c in result["checks"])


# ─── 3. Matching document fields ───────────────────────────────────────────────
def test_matching_document_fields():
    """
    Test 3: Identical names and identical dates of birth across documents.
    """
    payload = {
        "case_id": "CASE-MATCH",
        "documents": [
            {
                "type": "identity",
                "fields": {"name": "Arjun Kumar", "date_of_birth": "2005-04-12"},
            },
            {
                "type": "address",
                "fields": {"name": "Arjun Kumar", "date_of_birth": "2005-04-12"},
            },
        ],
    }

    resp = client.post("/api/documents/validate", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["requires_human_review"] is False
    assert data["has_insufficient_data"] is False
    assert all(c["status"] == "passed" for c in data["checks"])


# ─── 4. Missing case ID or malformed documents ─────────────────────────────────
def test_missing_case_id_or_malformed_documents():
    """
    Test 4: Missing case ID or malformed documents return identifiable error.
    """
    valid_docs = [{"type": "identity", "fields": {"name": "Arjun"}}]

    # Missing case ID (None or empty string)
    err_case_none = client_validate_documents(case_id=None, documents=valid_docs)
    assert err_case_none["status"] == "error"
    assert err_case_none["error_type"] == "ValidationError"
    assert "case_id" in err_case_none["error"].lower()

    err_case_empty = client_validate_documents(case_id="   ", documents=valid_docs)
    assert err_case_empty["status"] == "error"
    assert err_case_empty["error_type"] == "ValidationError"

    # Malformed documents payload (not a list)
    err_docs_type = client_validate_documents(case_id="C-1", documents="invalid_not_list")
    assert err_docs_type["status"] == "error"
    assert err_docs_type["error_type"] == "ValidationError"
    assert "list" in err_docs_type["error"]

    # Malformed document item (items not dict)
    err_doc_item = client_validate_documents(case_id="C-1", documents=["not_a_dict"])
    assert err_doc_item["status"] == "error"
    assert err_doc_item["error_type"] == "ValidationError"
    assert "dictionary" in err_doc_item["error"]


# ─── 5. Insufficient data ─────────────────────────────────────────────────────
def test_insufficient_data():
    """
    Test 5: Insufficient data cases (empty list, single doc, missing name).
    """
    # Empty documents
    res_empty = engine_validate_documents([], case_id="EMPTY-1")
    assert res_empty["has_insufficient_data"] is True
    assert res_empty["requires_human_review"] is True

    # Single document (cannot cross-compare)
    res_single = engine_validate_documents([
        {"type": "identity", "fields": {"name": "Arjun", "date_of_birth": "2005-04-12"}}
    ], case_id="SINGLE-1")
    assert res_single["has_insufficient_data"] is True
    assert any(c["check_id"] == "CHK_DOC_COUNT" for c in res_single["checks"])

    # Missing name in one document
    res_missing_name = engine_validate_documents([
        {"type": "identity", "fields": {"name": "", "date_of_birth": "2005-04-12"}},
        {"type": "address", "fields": {"name": "Arjun", "date_of_birth": "2005-04-12"}},
    ], case_id="NO-NAME")
    assert res_missing_name["has_insufficient_data"] is True


# ─── 6. Human-review-required responses ────────────────────────────────────────
def test_human_review_required_responses():
    """
    Test 6: Responses with requires_human_review: true trigger human review recommendation.
    """
    val_result = {
        "case_id": "DEMO-001",
        "checks": [
            {
                "check_id": "CHK_NAME_MATCH",
                "name": "Name Consistency Check",
                "status": "failed",
                "details": "Name mismatch detected: 'Arjun Kumar' vs 'Arjun Raj'.",
                "requires_human_review": True,
            }
        ],
        "requires_human_review": True,
        "has_insufficient_data": False,
        "disclaimer": "PassPilot is an unofficial assistant and the Passport Office makes the final decision.",
    }

    handoff = assess_handoff(validation_result=val_result)
    assert handoff["handoff_status"] == "Human review recommended"
    assert "CHK_NAME_MATCH" in " ".join(handoff["relevant_checks"])

    # Neutral language check
    resp_lower = handoff["formatted_response"].lower()
    assert "fraud" not in resp_lower
    assert "fake" not in resp_lower
    assert "guaranteed" not in resp_lower


# ─── 7. API connection failure and timeout ─────────────────────────────────────
def test_api_connection_failure_and_timeout():
    """
    Test 7: Connection errors and timeouts return identifiable errors without crashing.
    """
    docs = [{"type": "identity", "fields": {"name": "Arjun"}}]

    # Connection error simulation
    with patch("requests.post", side_effect=requests.exceptions.ConnectionError("Connection refused")):
        res_conn = client_validate_documents(case_id="C-FAIL", documents=docs, api_url="http://unreachable:9999/api/documents/validate")
        assert res_conn["status"] == "error"
        assert res_conn["error_type"] == "ConnectionError"
        assert "unreachable" in res_conn["error"].lower() or "connection" in res_conn["error"].lower()

    # Timeout simulation
    with patch("requests.post", side_effect=requests.exceptions.Timeout("Request timed out")):
        res_timeout = client_validate_documents(case_id="C-TIMEOUT", documents=docs, api_url="http://timeout:9999/api/documents/validate")
        assert res_timeout["status"] == "error"
        assert res_timeout["error_type"] == "Timeout"
        assert "timed out" in res_timeout["error"].lower()


# ─── 8. HTTP errors and invalid JSON ───────────────────────────────────────────
def test_http_errors_and_invalid_json():
    """
    Test 8: HTTP 500 error and non-JSON/malformed response handling.
    """
    docs = [{"type": "identity", "fields": {"name": "Arjun"}}]

    # HTTP 500
    mock_500 = MagicMock()
    mock_500.status_code = 500
    mock_500.text = "Internal Server Error"
    with patch("requests.post", return_value=mock_500):
        res_500 = client_validate_documents(case_id="C-500", documents=docs)
        assert res_500["status"] == "error"
        assert res_500["error_type"] == "HTTPError"
        assert res_500["status_code"] == 500

    # Invalid JSON
    mock_bad_json = MagicMock()
    mock_bad_json.status_code = 200
    mock_bad_json.json.side_effect = json.JSONDecodeError("Invalid JSON", "doc", 0)
    with patch("requests.post", return_value=mock_bad_json):
        res_json = client_validate_documents(case_id="C-BAD-JSON", documents=docs)
        assert res_json["status"] == "error"
        assert res_json["error_type"] == "InvalidJSON"


# ─── 9. Unavailable policy rules ───────────────────────────────────────────────
def test_unavailable_policy_rules():
    """
    Test 9: get_sourced_rules handles connection failure and timeouts safely.
    """
    with patch("requests.get", side_effect=requests.exceptions.ConnectionError("Offline")):
        res_rules = get_sourced_rules(api_url="http://offline:9999/api/rules")
        assert res_rules["status"] == "error"
        assert res_rules["error_type"] == "ConnectionError"
        assert res_rules["rules"] == []


# ─── 10. Draft or unverified rules never presented as verified ──────────────────
def test_draft_or_unverified_rules_never_official():
    """
    Test 10: Sourced rules endpoint draft rules are never treated as verified official guidance.
    """
    draft_rules = [
        {
            "rule_id": "R001",
            "title": "Name match",
            "status": "draft",
            "rule_text": "[TO VERIFY] Name must match",
            "source_name": "TO FILL",
            "source_url": "TO FILL",
        }
    ]

    filtered = filter_verified_rules(draft_rules)
    assert len(filtered) == 0

    val_result = {
        "checks": [{"check_id": "CHK_1", "status": "passed"}],
        "requires_human_review": False,
        "has_insufficient_data": False,
    }
    handoff = assess_handoff(validation_result=val_result, verified_rules=draft_rules)
    assert "R001" not in " ".join(handoff["relevant_rules"])
    assert "No verified rules" in " ".join(handoff["relevant_rules"])


# ─── 11. Handoff receiving the actual validation result ─────────────────────────
def test_handoff_receives_actual_validation_result():
    """
    Test 11: Orchestration passes actual validation results to handoff agent assessment.
    """
    docs = [
        {"type": "identity", "fields": {"name": "Arjun Kumar", "date_of_birth": "2005-04-12"}},
        {"type": "address", "fields": {"name": "Arjun Raj", "date_of_birth": "2005-04-12"}},
    ]

    mock_resp = {
        "case_id": "DEMO-001",
        "checks": [
            {
                "check_id": "CHK_NAME_MATCH",
                "name": "Name Consistency Check",
                "status": "failed",
                "details": "Name mismatch: 'Arjun Kumar' vs 'Arjun Raj'.",
                "requires_human_review": True,
            }
        ],
        "requires_human_review": True,
        "has_insufficient_data": False,
        "disclaimer": "PassPilot is an unofficial assistant and the Passport Office makes the final decision.",
    }

    mock_post = MagicMock()
    mock_post.status_code = 200
    mock_post.json.return_value = mock_resp

    with patch("requests.post", return_value=mock_post):
        wf_res = orchestrate_document_validation(documents=docs, case_id="DEMO-001")

        assert wf_res["status"] == "ok"
        assert wf_res["case_id"] == "DEMO-001"
        assert wf_res["validation_result"]["requires_human_review"] is True

        handoff = wf_res["handoff_assessment"]
        assert handoff["handoff_status"] == "Human review recommended"
        assert "CHK_NAME_MATCH" in " ".join(handoff["relevant_checks"])
        assert "Arjun Kumar" in handoff["reason"] or "Arjun Raj" in handoff["reason"]


# ─── 12. Agent imports and orchestrator integration ────────────────────────────
def test_agent_imports_and_orchestrator_integration():
    """
    Test 12: Verify all agents load successfully, tools are registered, and model is gemini-3.8-flash.
    """
    # Ensure all agents import
    assert document_agent.name == "document_agent"
    assert handoff_agent.name == "handoff_agent"
    assert policy_agent.name == "policy_agent"
    assert intake_agent.name == "intake_agent"
    assert root_agent.name == "orchestrator"

    # Check document_agent tools
    doc_tool_names = [getattr(t, "name", getattr(t, "__name__", str(t))) for t in document_agent.tools]
    assert "validate_documents_api" in doc_tool_names or "validate_documents" in doc_tool_names
    assert "get_sourced_rules" in doc_tool_names
    assert "extract_document_fields" in doc_tool_names
    assert "compare_documents" in doc_tool_names

    # Check model name: must use configured default gemini-3.8-flash, NEVER gemini-2.5-flash
    for ag in [document_agent, handoff_agent, intake_agent, root_agent]:
        assert "gemini-2.5-flash" not in ag.model
        assert "gemini-3.8-flash" in ag.model
