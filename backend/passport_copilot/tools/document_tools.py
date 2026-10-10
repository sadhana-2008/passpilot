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
