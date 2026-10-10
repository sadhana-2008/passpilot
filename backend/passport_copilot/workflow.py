import os
import json
from pathlib import Path
from typing import Any

from .tools.document_tools import call_document_validation_api
from .agents.handoff import assess_handoff, filter_verified_rules


RULES_FILE = Path(__file__).parent.parent / "rules.json"


def fetch_verified_policy_rules(case_profile: dict | None = None) -> list[dict]:
    """
    Retrieves verified policy rules from the verified corpus.
    Guarantees that ONLY verified rules are returned (draft or unverified rules are rejected).
    """
    try:
        from backend.policy_agent import lookup_rules
        res = lookup_rules(query="passport document requirement name dob address", case_profile=case_profile)
        if res.get("status") == "ok":
            return filter_verified_rules(res.get("rules", []))
    except Exception:
        pass

    # Direct fallback from rules.json
    try:
        if RULES_FILE.exists():
            with open(RULES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            return filter_verified_rules(data.get("rules", []))
    except Exception:
        pass

    return []


def orchestrate_document_validation(
    documents: list[dict],
    case_profile: dict | None = None,
    validation_api_url: str | None = None,
) -> dict[str, Any]:
    """
    Smallest reliable Python orchestration function:
    1. Calls document validation via the validation API (POST /api/documents/validate).
    2. Examines the structured result.
    3. Retrieves relevant verified policy rules.
    4. Calls the handoff assessment when appropriate, passing actual results and verified rules.
    5. Returns the validation result and handoff assessment together.
    """
    # 1. Call document validation API
    val_resp = call_document_validation_api(documents, api_url=validation_api_url)

    # 2. Check for service failure or missing validation result
    if val_resp.get("status") == "error":
        error_msg = val_resp.get("error", "Document validation service error")
        handoff_res = assess_handoff(validation_result=None, error_message=error_msg)
        return {
            "status": "error",
            "error": error_msg,
            "validation_result": None,
            "handoff_assessment": handoff_res,
        }

    if not isinstance(val_resp, dict) or "checks" not in val_resp:
        error_msg = "Validation results are missing or malformed."
        handoff_res = assess_handoff(validation_result=None, error_message=error_msg)
        return {
            "status": "error",
            "error": error_msg,
            "validation_result": None,
            "handoff_assessment": handoff_res,
        }

    # 3. Retrieve relevant verified policy rules
    verified_rules = fetch_verified_policy_rules(case_profile=case_profile)

    # 4. Invoke handoff assessment with actual results and verified rules
    handoff_res = assess_handoff(
        validation_result=val_resp,
        verified_rules=verified_rules,
    )

    # 5. Return both together
    return {
        "status": "ok",
        "validation_result": val_resp,
        "handoff_assessment": handoff_res,
    }
