import os
from typing import Any
from google.adk import Agent
from ..tools.handoff_tools import (
    get_appointment_slots,
    book_appointment,
    get_application_status,
    generate_handoff_pdf,
)

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.8-flash")
DISCLAIMER_TEXT = "PassPilot is an unofficial assistant and the Passport Office makes the final decision."


def filter_verified_rules(rules: list[dict] | None) -> list[dict]:
    """
    Filters a list of rules to only include verified, complete policy rules.
    Draft or unverified rules are never treated as verified.
    """
    if not rules or not isinstance(rules, list):
        return []

    verified = []
    for r in rules:
        if not isinstance(r, dict):
            continue

        if str(r.get("status", "")).lower() != "verified":
            continue

        rule_text = r.get("rule_text") or ""
        source_name = r.get("source_name") or ""
        source_url = r.get("source_url") or ""

        # Reject incomplete or placeholder evidence
        if (
            not r.get("rule_id")
            or not r.get("title")
            or not isinstance(rule_text, str)
            or not rule_text.strip()
            or "[TO VERIFY]" in rule_text.upper()
            or "TO FILL" in str(source_name).upper()
            or "TO FILL" in str(source_url).upper()
            or not str(source_name).strip()
            or not str(source_url).strip()
        ):
            continue

        verified.append(r)

    return verified


def format_handoff_response(
    status: str,
    reason: str,
    relevant_checks: list[str],
    relevant_rules: list[str],
    next_steps: list[str],
    disclaimer: str = DISCLAIMER_TEXT,
) -> str:
    """Formats the handoff response strictly according to the required 5 sections."""
    checks_str = "\n".join(f"   - {c}" for c in relevant_checks) if relevant_checks else "   - None"
    rules_str = "\n".join(f"   - {r}" for r in relevant_rules) if relevant_rules else "   - None"
    steps_str = "\n".join(f"   - {s}" for s in next_steps) if next_steps else "   - Consult the Passport Office."

    return (
        f"1. Handoff status: {status}\n"
        f"2. Reason: {reason}\n"
        f"3. Relevant validation checks and verified rules:\n"
        f"   Checks:\n{checks_str}\n"
        f"   Verified rules:\n{rules_str}\n"
        f"4. Recommended next steps:\n{steps_str}\n"
        f"5. Disclaimer: {disclaimer}"
    )


def assess_handoff(
    validation_result: dict[str, Any] | None = None,
    verified_rules: list[dict[str, Any]] | None = None,
    error_message: str | None = None,
) -> dict[str, Any]:
    """
    Evaluates document validation results and verified policy rules
    to determine if human review by a Passport Officer is recommended.
    """
    # Case 1: Validation service failure or unreachable
    if error_message:
        status = "Unable to determine"
        reason = (
            f"Document validation failed or the validation service was unreachable "
            f"({error_message}). Discrepancies cannot be evaluated without reliable verification results."
        )
        relevant_checks = ["Service error: validation results unavailable"]
        relevant_rules = ["None"]
        next_steps = [
            "Verify that the document validation service is operational and retry the request.",
            "If the service remains unavailable, present physical original documents to a Passport Officer at the Passport Seva Kendra (PSK).",
            "Consult the official Passport Seva portal (https://www.passportindia.gov.in/) for official guidelines.",
        ]
        formatted = format_handoff_response(status, reason, relevant_checks, relevant_rules, next_steps)
        return {
            "handoff_status": status,
            "reason": reason,
            "relevant_checks": relevant_checks,
            "relevant_rules": relevant_rules,
            "recommended_next_steps": next_steps,
            "disclaimer": DISCLAIMER_TEXT,
            "formatted_response": formatted,
        }

    # Case 2: Validation result is missing, null, or empty
    if validation_result is None or not isinstance(validation_result, dict) or "checks" not in validation_result:
        status = "Unable to determine"
        reason = (
            "Required document validation results are missing or invalid. "
            "Discrepancies cannot be evaluated without validation data."
        )
        relevant_checks = ["Validation results missing"]
        relevant_rules = ["None"]
        next_steps = [
            "Perform document validation before requesting human handoff review.",
            "Consult the official Passport Seva portal (https://www.passportindia.gov.in/) for checklist guidance.",
        ]
        formatted = format_handoff_response(status, reason, relevant_checks, relevant_rules, next_steps)
        return {
            "handoff_status": status,
            "reason": reason,
            "relevant_checks": relevant_checks,
            "relevant_rules": relevant_rules,
            "recommended_next_steps": next_steps,
            "disclaimer": DISCLAIMER_TEXT,
            "formatted_response": formatted,
        }

    # Filter rules to ensure only verified rules are evaluated
    valid_verified_rules = filter_verified_rules(verified_rules)

    checks = validation_result.get("checks", [])
    requires_human_review_flag = bool(validation_result.get("requires_human_review", False))
    has_insufficient_data_flag = bool(validation_result.get("has_insufficient_data", False))

    failed_checks = [
        c for c in checks
        if isinstance(c, dict) and (c.get("status") == "failed" or c.get("requires_human_review") is True)
    ]
    insufficient_checks = [
        c for c in checks
        if isinstance(c, dict) and c.get("status") == "insufficient_data"
    ]
    rules_requiring_officer = [
        r for r in valid_verified_rules
        if r.get("needs_officer_confirmation") is True
    ]

    has_discrepancies = len(failed_checks) > 0
    has_insufficient = has_insufficient_data_flag or len(insufficient_checks) > 0
    needs_officer = len(rules_requiring_officer) > 0

    if requires_human_review_flag or has_insufficient or has_discrepancies or needs_officer:
        status = "Human review recommended"
        reason_parts = []

        if has_insufficient:
            reason_parts.append(
                "Insufficient document data was provided to complete automated cross-verification."
            )

        for fc in failed_checks:
            detail = fc.get("details", fc.get("name", "Document discrepancy"))
            cid = fc.get("check_id", "Check")
            reason_parts.append(f"A discrepancy was identified ({cid}: {detail}).")

        if needs_officer:
            rule_titles = ", ".join(r.get("rule_id", "Rule") for r in rules_requiring_officer)
            reason_parts.append(
                f"Applicable verified policy guidance ({rule_titles}) specifies requirements "
                "that necessitate official Passport Officer confirmation."
            )

        reason = " ".join(reason_parts) if reason_parts else (
            "Human review is recommended due to validation flags requiring official examination."
        )

        relevant_checks = [
            f"{c.get('check_id', 'CHK')}: {c.get('details', c.get('name', ''))}"
            for c in checks
            if c.get("status") in ("failed", "insufficient_data") or c.get("requires_human_review")
        ]
        if not relevant_checks:
            relevant_checks = ["None"]

        relevant_rules = [
            f"{r.get('rule_id', 'RULE')}: {r.get('title', '')} (Source: {r.get('source_name', 'official portal')})"
            for r in valid_verified_rules
        ]
        if not relevant_rules:
            relevant_rules = ["None (No verified rules applicable. Draft or unverified guidance is excluded)."]

        next_steps = []
        # Tailored practical steps based on findings
        if any("name" in str(c.get("check_id", "")).lower() or "name" in str(c.get("details", "")).lower() for c in failed_checks):
            next_steps.append(
                "Provide an official supporting document that aligns the name variation across records "
                "(such as a Gazette notification, marriage certificate, or deed poll declaration)."
            )
        if any("dob" in str(c.get("check_id", "")).lower() or "dob" in str(c.get("details", "")).lower() for c in failed_checks):
            next_steps.append(
                "Ensure Date of Birth matches across all submitted records by providing an amended or authoritative birth proof."
            )
        if any("expiry" in str(c.get("check_id", "")).lower() or "expired" in str(c.get("details", "")).lower() for c in failed_checks):
            next_steps.append(
                "Replace expired document proofs with current, valid unexpired documents."
            )
        if has_insufficient:
            next_steps.append(
                "Upload the missing supporting documents to enable complete cross-verification."
            )

        next_steps.append(
            "Present physical original documents and self-attested copies to the verifying officer at the Passport Seva Kendra (PSK)."
        )
        next_steps.append(
            "Consult the official Passport Seva portal at https://www.passportindia.gov.in/ for case-specific appointment procedures."
        )

    else:
        status = "Not currently flagged"
        reason = (
            "No discrepancies or unresolved issues were detected across the submitted document fields. "
            "Automated consistency checks have passed."
        )
        relevant_checks = [
            f"{c.get('check_id', 'CHK')}: Passed - {c.get('name', '')}"
            for c in checks
        ]
        if not relevant_checks:
            relevant_checks = ["All automated checks passed"]

        relevant_rules = [
            f"{r.get('rule_id', 'RULE')}: {r.get('title', '')} (Source: {r.get('source_name', 'official portal')})"
            for r in valid_verified_rules
        ]
        if not relevant_rules:
            relevant_rules = ["None (No verified rules applicable. Draft or unverified guidance is excluded)."]

        next_steps = [
            "Bring original physical documents and self-attested photocopies to your scheduled PSK appointment.",
            "Verify all personal details on the official Passport Seva portal (https://www.passportindia.gov.in/) before attending.",
        ]

    formatted = format_handoff_response(status, reason, relevant_checks, relevant_rules, next_steps)

    return {
        "handoff_status": status,
        "reason": reason,
        "relevant_checks": relevant_checks,
        "relevant_rules": relevant_rules,
        "recommended_next_steps": next_steps,
        "disclaimer": DISCLAIMER_TEXT,
        "formatted_response": formatted,
    }


def evaluate_human_handoff(
    validation_result: dict | None = None,
    verified_rules: list | None = None,
) -> str:
    """
    Agent tool: Evaluates document validation results and verified rules,
    returning the structured 5-section handoff assessment string.
    """
    res = assess_handoff(validation_result=validation_result, verified_rules=verified_rules)
    return res["formatted_response"]


HANDOFF_INSTRUCTION = """You are the Human Handoff Specialist for PassPilot, an unofficial Passport Readiness Assistant.

YOUR TASK:
Review actual document-validation results and relevant verified policy rules to assess whether human review by the Passport Office is required.

ASSESSMENT RULES:
1. Review ACTUAL document-validation results and relevant VERIFIED policy rules.
2. Recommend human review ("Human review recommended") when:
   - `requires_human_review` is true,
   - `has_insufficient_data` is true,
   - Document discrepancies remain unresolved (e.g. name, date of birth, expiry mismatches), or
   - Verified policy guidance requires official officer confirmation (`needs_officer_confirmation` is true).
3. If no discrepancies exist, data is complete, `requires_human_review` is false, and no verified rules require officer confirmation, return "Not currently flagged".
4. Return "Unable to determine" when validation failed, validation service is unreachable, or required validation results are missing or invalid.
5. Explain discrepancies in neutral, non-accusatory language.
6. NEVER claim that documents are authentic or fraudulent.
7. NEVER make final eligibility decisions or guarantee passport approval, rejection, or processing times.
8. NEVER claim a case was sent to an officer or an appointment was booked unless an integrated system confirms that action.
9. NEVER invent rules, evidence, citations, or validation results.
10. Only cite rules that are VERIFIED. Never treat draft or unverified rules as official or verified guidance. If only draft rules are present, state that no verified rules apply.
11. Never request real passport numbers, Aadhaar numbers, or other sensitive government identifiers.
12. Clearly state that PassPilot is an unofficial assistant and the Passport Office makes the final decision.

Use the `evaluate_human_handoff` tool to compute the standard assessment whenever structured validation results are available.
You can also use existing handoff tools (`get_appointment_slots`, `book_appointment`, `get_application_status`, `generate_handoff_pdf`) when requested by the orchestrator.

RESPONSE FORMAT:
1. Handoff status: [Human review recommended | Not currently flagged | Unable to determine]
2. Reason: [Neutral, non-accusatory explanation]
3. Relevant validation checks and verified rules:
   Checks:
   - [check IDs and descriptions]
   Verified rules:
   - [verified rule IDs and titles, or None]
4. Recommended next steps:
   - [Practical next steps]
5. Disclaimer: PassPilot is an unofficial assistant and the Passport Office makes the final decision.
"""

handoff_agent = Agent(
    name="handoff_agent",
    instruction=HANDOFF_INSTRUCTION,
    model=MODEL_NAME,
    tools=[
        evaluate_human_handoff,
        get_appointment_slots,
        book_appointment,
        get_application_status,
        generate_handoff_pdf,
    ],
)
