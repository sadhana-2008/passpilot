"""
document_validation.py — Client tool for calling the PassPilot FastAPI document-validation backend.

Integrates with the external validation API (POST /api/documents/validate) and sourced rules (GET /api/rules).
Configurable via the PASSPILOT_API_URL environment variable (default: http://127.0.0.1:8000).
"""

import logging
import os
from typing import Any
import requests

logger = logging.getLogger("passport_copilot.document_validation")

DEFAULT_BASE_URL = "http://127.0.0.1:8000"
DEFAULT_TIMEOUT_SECONDS = 5.0


def get_api_base_url() -> str:
    """Returns the configured base URL for the PassPilot validation API."""
    base_url = os.getenv("PASSPILOT_API_URL", DEFAULT_BASE_URL).strip()
    return base_url.rstrip("/")


def validate_documents(
    case_id: str,
    documents: list[dict],
    api_url: str | None = None,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """
    Sends document fields to the FastAPI backend for validation.

    ADK-compatible tool signature:
        validate_documents(case_id: str, documents: list[dict]) -> dict

    Expected request format:
    {
        "case_id": "DEMO-001",
        "documents": [
            {
                "type": "identity",
                "fields": {
                    "name": "Arjun Kumar",
                    "date_of_birth": "2005-04-12"
                }
            },
            ...
        ]
    }
    """
    # 1. Validate input structure
    if not isinstance(case_id, str) or not case_id.strip():
        logger.warning("Validation rejected: missing or invalid case_id.")
        return {
            "status": "error",
            "error_type": "ValidationError",
            "error": "Invalid or missing case_id. A non-empty string case_id is required.",
            "case_id": case_id,
            "checks": [],
            "requires_human_review": False,
            "has_insufficient_data": True,
        }

    if not isinstance(documents, list):
        logger.warning("Validation rejected: documents is not a list.")
        return {
            "status": "error",
            "error_type": "ValidationError",
            "error": "Malformed documents payload: documents must be a list.",
            "case_id": case_id,
            "checks": [],
            "requires_human_review": False,
            "has_insufficient_data": True,
        }

    for i, doc in enumerate(documents):
        if not isinstance(doc, dict):
            logger.warning("Validation rejected: document item at index %d is not a dict.", i)
            return {
                "status": "error",
                "error_type": "ValidationError",
                "error": f"Malformed documents payload: document at index {i} must be a dictionary.",
                "case_id": case_id,
                "checks": [],
                "requires_human_review": False,
                "has_insufficient_data": True,
            }

    # Construct request URL without hardcoding full path in multiple places
    target_url = api_url or f"{get_api_base_url()}/api/documents/validate"
    payload = {
        "case_id": case_id,
        "documents": documents,
    }

    # Safe logging: log metadata only, avoid logging sensitive personal details
    logger.info(
        "Dispatching document validation request to %s for case_id=%s with %d document(s).",
        target_url,
        case_id,
        len(documents),
    )

    try:
        response = requests.post(
            target_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=timeout,
        )

        if response.status_code == 200:
            try:
                data = response.json()
            except Exception as json_err:
                logger.error("Failed to parse JSON response from %s: %s", target_url, json_err)
                return {
                    "status": "error",
                    "error_type": "InvalidJSON",
                    "error": f"Validation API returned invalid JSON: {json_err}",
                    "case_id": case_id,
                    "validation_result": None,
                }

            if not isinstance(data, dict):
                logger.error("Unexpected response structure from %s: expected dict, got %s", target_url, type(data))
                return {
                    "status": "error",
                    "error_type": "UnexpectedStructure",
                    "error": f"Validation API returned unexpected response structure: expected JSON object.",
                    "case_id": case_id,
                    "validation_result": None,
                }

            # Return actual structured API response
            if "case_id" not in data and case_id:
                data["case_id"] = case_id
            return data

        # Non-200 HTTP response
        logger.error("Validation API error: HTTP %d from %s", response.status_code, target_url)
        return {
            "status": "error",
            "error_type": "HTTPError",
            "status_code": response.status_code,
            "error": f"Validation API returned HTTP {response.status_code}: {response.text}",
            "case_id": case_id,
            "validation_result": None,
        }

    except requests.exceptions.Timeout as timeout_err:
        logger.error("Validation API request timed out after %.1f seconds: %s", timeout, timeout_err)
        return {
            "status": "error",
            "error_type": "Timeout",
            "error": f"Document validation API timed out after {timeout}s at {target_url}.",
            "case_id": case_id,
            "validation_result": None,
        }

    except requests.exceptions.ConnectionError as conn_err:
        logger.error("Could not connect to validation API at %s: %s", target_url, conn_err)
        return {
            "status": "error",
            "error_type": "ConnectionError",
            "error": (
                f"Failed to connect to validation API at {target_url}. "
                f"The backend service is unreachable or offline: {conn_err}"
            ),
            "case_id": case_id,
            "validation_result": None,
        }

    except Exception as exc:
        logger.error("Unexpected error calling validation API: %s", exc)
        return {
            "status": "error",
            "error_type": "RequestException",
            "error": f"Unexpected error communicating with validation API at {target_url}: {exc}",
            "case_id": case_id,
            "validation_result": None,
        }


def get_sourced_rules(
    status: str | None = None,
    api_url: str | None = None,
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
) -> dict[str, Any]:
    """
    Requests sourced passport rules from the backend (GET /api/rules).
    """
    target_url = api_url or f"{get_api_base_url()}/api/rules"
    params = {"status": status} if status else {}

    try:
        response = requests.get(target_url, params=params, timeout=timeout)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict):
                return data
            return {"status": "ok", "rules": data}
        return {
            "status": "error",
            "error_type": "HTTPError",
            "status_code": response.status_code,
            "error": f"Rules API returned HTTP {response.status_code}: {response.text}",
            "rules": [],
        }
    except requests.exceptions.ConnectionError as conn_err:
        return {
            "status": "error",
            "error_type": "ConnectionError",
            "error": f"Could not connect to rules API at {target_url}: {conn_err}",
            "rules": [],
        }
    except requests.exceptions.Timeout as timeout_err:
        return {
            "status": "error",
            "error_type": "Timeout",
            "error": f"Rules API timed out after {timeout}s at {target_url}: {timeout_err}",
            "rules": [],
        }
    except Exception as exc:
        return {
            "status": "error",
            "error_type": "RequestException",
            "error": f"Error retrieving rules from {target_url}: {exc}",
            "rules": [],
        }


def check_api_health(
    api_url: str | None = None,
    timeout: float = 3.0,
) -> dict[str, Any]:
    """
    Checks if the backend API is reachable (GET /health).
    """
    target_url = api_url or f"{get_api_base_url()}/health"
    try:
        resp = requests.get(target_url, timeout=timeout)
        if resp.status_code == 200:
            return {"status": "ok", "url": target_url}
        return {"status": "error", "status_code": resp.status_code, "url": target_url}
    except Exception as exc:
        return {"status": "error", "error": str(exc), "url": target_url}
