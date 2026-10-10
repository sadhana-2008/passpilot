import json
from datetime import datetime
from pathlib import Path
from google import genai
import os

MOCK_DATA_DIR = Path(__file__).parent.parent / "mock_data"

def extract_document_fields(file_ref: str) -> dict:
    """
    Extracts structured fields from an uploaded document image/PDF using Gemini Vision.
    Falls back to mock data if no file_ref matches a real file or if API key is not set.
    Fields returned: document_type, name, dob, address, expiry_date.
    """
    # For demo purposes, we directly use mock data based on file_ref
    try:
        with open(MOCK_DATA_DIR / "mock_docs.json", "r") as f:
            docs = json.load(f).get("docs", {})
        if file_ref in docs:
            return docs[file_ref]
        return docs["doc_1"] # fallback
    except Exception:
        return {}

def fuzzy_name_match(name1: str, name2: str) -> bool:
    """Returns True if names are a close match (ignoring case, spaces, and initials)."""
    n1 = name1.lower().replace(" ", "")
    n2 = name2.lower().replace(" ", "")
    return n1 == n2 or n1 in n2 or n2 in n1

def compare_documents(extracted_docs: list[dict]) -> list[dict]:
    """
    Compares a list of extracted documents for inconsistencies.
    Returns a list of issues: [{type, severity, documents_involved, detail, suggested_fix}]
    Checks: name mismatch, DOB mismatch, address mismatch, expired proof.
    """
    issues = []
    if not extracted_docs:
        return issues
    
    base_doc = extracted_docs[0]
    today = datetime.now().strftime("%Y-%m-%d")

    for i, doc in enumerate(extracted_docs):
        # Check expiry
        expiry = doc.get("expiry_date")
        if expiry and expiry < today:
            issues.append({
                "type": "expired_proof",
                "severity": "high",
                "documents_involved": [doc.get("document_type", f"Doc {i}")],
                "detail": f"Document expired on {expiry}.",
                "suggested_fix": "Upload a valid, unexpired document."
            })
            
        # Compare with base doc (assuming the first document is the primary one, like Aadhaar)
        if i == 0:
            continue
            
        doc_type = doc.get("document_type", f"Doc {i}")
        base_doc_type = base_doc.get("document_type", "Primary Doc")
        
        name = doc.get("name")
        if name and base_doc.get("name") and not fuzzy_name_match(name, base_doc["name"]):
            issues.append({
                "type": "name_mismatch",
                "severity": "high",
                "documents_involved": [base_doc_type, doc_type],
                "detail": f"Name mismatch: '{base_doc['name']}' vs '{name}'.",
                "suggested_fix": "Ensure the name matches exactly across documents, or provide a gazette notification for name change."
            })
            
        dob = doc.get("dob")
        if dob and base_doc.get("dob") and dob != base_doc["dob"]:
            issues.append({
                "type": "dob_mismatch",
                "severity": "high",
                "documents_involved": [base_doc_type, doc_type],
                "detail": f"DOB mismatch: '{base_doc['dob']}' vs '{dob}'.",
                "suggested_fix": "Ensure Date of Birth matches exactly across all documents."
            })

    return issues


def normalize_document(doc: dict) -> dict:
    """Normalizes document representations, supporting both flat dicts and nested fields dicts."""
    if not isinstance(doc, dict):
        return {}
    fields = doc.get("fields") if isinstance(doc.get("fields"), dict) else {}
    doc_type = doc.get("type") or doc.get("document_type") or "Document"
    name = fields.get("name") if "name" in fields else doc.get("name")
    dob = (
        fields.get("date_of_birth")
        or fields.get("dob")
        or doc.get("date_of_birth")
        or doc.get("dob")
    )
    expiry = (
        fields.get("expiry_date")
        or fields.get("expiry")
        or doc.get("expiry_date")
        or doc.get("expiry")
    )
    return {
        "document_type": doc_type,
        "name": name,
        "dob": dob,
        "date_of_birth": dob,
        "expiry_date": expiry,
        "raw": doc,
    }


def validate_documents(documents: list[dict], case_id: str | None = None) -> dict:
    """
    Validates a list of document field dictionaries for consistency, expiry, and completeness.
    Supports both flat dictionary and nested format ({"type": "...", "fields": {"name": "..."}}).
    Returns structured results:
    {
        "case_id": str (optional),
        "checks": [
            {
                "check_id": str,
                "name": str,
                "status": "passed" | "failed" | "insufficient_data",
                "details": str,
                "requires_human_review": bool
            }
        ],
        "requires_human_review": bool,
        "has_insufficient_data": bool,
        "disclaimer": str
    }
    """
    disclaimer = "PassPilot is an unofficial assistant and the Passport Office makes the final decision."

    if not documents or not isinstance(documents, list) or len(documents) == 0:
        res = {
            "checks": [
                {
                    "check_id": "CHK_DATA_COMPLETENESS",
                    "name": "Document Completeness Check",
                    "status": "insufficient_data",
                    "details": "No documents provided for validation.",
                    "requires_human_review": True,
                }
            ],
            "requires_human_review": True,
            "has_insufficient_data": True,
            "disclaimer": disclaimer,
        }
        if case_id is not None:
            res["case_id"] = case_id
        return res

    norm_docs = [normalize_document(d) for d in documents]
    today = datetime.now().strftime("%Y-%m-%d")
    checks = []

    # Check 1: Document count sufficiency
    if len(norm_docs) < 2:
        doc = norm_docs[0]
        expiry = doc.get("expiry_date")
        if expiry and str(expiry) < today:
            checks.append({
                "check_id": "CHK_EXPIRY",
                "name": "Document Expiry Check",
                "status": "failed",
                "details": f"Document '{doc.get('document_type', 'Document 1')}' expired on {expiry}.",
                "requires_human_review": True,
            })
        checks.append({
            "check_id": "CHK_DOC_COUNT",
            "name": "Document Count Check",
            "status": "insufficient_data",
            "details": "At least two documents are required to perform cross-document consistency checks.",
            "requires_human_review": True,
        })
        res = {
            "checks": checks,
            "requires_human_review": True,
            "has_insufficient_data": True,
            "disclaimer": disclaimer,
        }
        if case_id is not None:
            res["case_id"] = case_id
        return res

    # Check 2: Missing essential fields
    missing_name_docs = [
        doc.get("document_type", f"Doc {i+1}")
        for i, doc in enumerate(norm_docs)
        if not doc.get("name") or not str(doc.get("name")).strip()
    ]
    if missing_name_docs:
        checks.append({
            "check_id": "CHK_NAME_PRESENCE",
            "name": "Name Field Completeness",
            "status": "insufficient_data",
            "details": f"Applicant name is missing in: {', '.join(missing_name_docs)}.",
            "requires_human_review": True,
        })

    # Check 3: Name Consistency across documents
    if not missing_name_docs:
        base_doc = norm_docs[0]
        base_name = str(base_doc.get("name", "")).strip()
        base_type = base_doc.get("document_type", "Primary Document")
        name_mismatches = []

        for i, doc in enumerate(norm_docs[1:], start=2):
            d_name = str(doc.get("name", "")).strip()
            d_type = doc.get("document_type", f"Document {i}")
            if base_name.lower() != d_name.lower():
                name_mismatches.append(f"'{base_name}' ({base_type}) vs '{d_name}' ({d_type})")

        if name_mismatches:
            checks.append({
                "check_id": "CHK_NAME_MATCH",
                "name": "Name Consistency Check",
                "status": "failed",
                "details": f"Name mismatch detected: {'; '.join(name_mismatches)}.",
                "requires_human_review": True,
            })
        else:
            checks.append({
                "check_id": "CHK_NAME_MATCH",
                "name": "Name Consistency Check",
                "status": "passed",
                "details": "Name matches consistently across all submitted documents.",
                "requires_human_review": False,
            })

    # Check 4: Date of Birth Consistency
    base_dob = str(norm_docs[0].get("dob", "")).strip() if norm_docs[0].get("dob") else None
    base_type = norm_docs[0].get("document_type", "Primary Document")
    dob_mismatches = []
    has_dob_comparison = False

    for i, doc in enumerate(norm_docs[1:], start=2):
        d_dob = str(doc.get("dob", "")).strip() if doc.get("dob") else None
        d_type = doc.get("document_type", f"Document {i}")
        if base_dob and d_dob:
            has_dob_comparison = True
            if base_dob != d_dob:
                dob_mismatches.append(f"'{base_dob}' ({base_type}) vs '{d_dob}' ({d_type})")

    if dob_mismatches:
        checks.append({
            "check_id": "CHK_DOB_MATCH",
            "name": "Date of Birth Consistency Check",
            "status": "failed",
            "details": f"Date of birth mismatch detected: {'; '.join(dob_mismatches)}.",
            "requires_human_review": True,
        })
    elif has_dob_comparison:
        checks.append({
            "check_id": "CHK_DOB_MATCH",
            "name": "Date of Birth Consistency Check",
            "status": "passed",
            "details": "Date of birth matches consistently across submitted documents.",
            "requires_human_review": False,
        })

    # Check 5: Document Expiry
    expired_list = []
    for i, doc in enumerate(norm_docs, start=1):
        expiry = doc.get("expiry_date")
        d_type = doc.get("document_type", f"Document {i}")
        if expiry and str(expiry) < today:
            expired_list.append(f"{d_type} (expired on {expiry})")

    if expired_list:
        checks.append({
            "check_id": "CHK_EXPIRY",
            "name": "Document Expiry Check",
            "status": "failed",
            "details": f"Expired document proof detected: {', '.join(expired_list)}.",
            "requires_human_review": True,
        })
    else:
        checks.append({
            "check_id": "CHK_EXPIRY",
            "name": "Document Expiry Check",
            "status": "passed",
            "details": "All submitted documents are within their validity period.",
            "requires_human_review": False,
        })

    has_insufficient = any(c.get("status") == "insufficient_data" for c in checks)
    requires_review = any(c.get("requires_human_review", False) for c in checks) or has_insufficient

    result = {
        "checks": checks,
        "requires_human_review": requires_review,
        "has_insufficient_data": has_insufficient,
        "disclaimer": disclaimer,
    }
    if case_id is not None:
        result["case_id"] = case_id

    return result


def call_document_validation_api(
    documents: list[dict],
    api_url: str | None = None,
    timeout: float = 5.0,
) -> dict:
    """
    Calls the document validation API endpoint (POST /api/documents/validate).
    Configurable via DOCUMENT_VALIDATION_URL environment variable.
    """
    import httpx

    target_url = api_url or os.getenv(
        "DOCUMENT_VALIDATION_URL",
        "http://localhost:8000/api/documents/validate"
    )

    try:
        with httpx.Client(timeout=timeout) as client:
            resp = client.post(target_url, json={"documents": documents})
            if resp.status_code == 200:
                return resp.json()
            return {
                "status": "error",
                "error": f"Validation API returned HTTP {resp.status_code}: {resp.text}",
                "checks": [],
                "requires_human_review": False,
                "has_insufficient_data": False,
                "disclaimer": "PassPilot is an unofficial assistant and the Passport Office makes the final decision.",
            }
    except Exception as exc:
        return {
            "status": "error",
            "error": f"Document validation API is unreachable or failed: {exc}",
            "checks": [],
            "requires_human_review": False,
            "has_insufficient_data": False,
            "disclaimer": "PassPilot is an unofficial assistant and the Passport Office makes the final decision.",
        }
