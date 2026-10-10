import json
import os
import base64
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

MOCK_DATA_DIR = Path(__file__).parent.parent / "mock_data"
OUTPUTS_DIR = Path(__file__).parent.parent.parent.parent / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

def get_appointment_slots(city: str) -> list[dict]:
    """
    Returns available mock appointment slots for the specified city.
    [MOCK]
    """
    try:
        with open(MOCK_DATA_DIR / "slots.json", "r") as f:
            data = json.load(f)
        return [slot for slot in data.get("slots", []) if slot["city"].lower() == city.lower()]
    except Exception as e:
        return []

def book_appointment(slot_id: str, case_id: str) -> dict:
    """
    Mocks booking an appointment.
    [MOCK]
    """
    return {
        "status": "success",
        "message": f"[MOCK] Appointment {slot_id} booked successfully for case {case_id}.",
        "slot_id": slot_id,
        "case_id": case_id
    }

def get_application_status(reference_number: str) -> dict:
    """
    Returns mock application status based on a reference number.
    [MOCK]
    """
    try:
        with open(MOCK_DATA_DIR / "statuses.json", "r") as f:
            data = json.load(f)
        return data.get("statuses", {}).get(reference_number, {
            "status": "Not Found",
            "interpretation": "Reference number not found in mock data.",
            "next_step": "Check the reference number and try again."
        })
    except Exception:
        return {"status": "Error", "interpretation": "Failed to read mock data.", "next_step": ""}

def generate_handoff_pdf(case_profile: dict, checklist: list, issues: list, appointment: dict) -> dict:
    """
    Generates a PDF summary for the handoff packet using reportlab.
    Returns: {"filename": str, "base64": str}
    """
    filename = f"handoff_{case_profile.get('application_type', 'case')}.pdf"
    filepath = OUTPUTS_DIR / filename
    
    c = canvas.Canvas(str(filepath), pagesize=letter)
    width, height = letter
    y = height - 50
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "Passport Readiness Copilot - Handoff Packet")
    y -= 30
    
    c.setFont("Helvetica", 12)
    c.drawString(50, y, f"Application Type: {case_profile.get('application_type', 'N/A')}")
    y -= 20
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Checklist:")
    y -= 20
    c.setFont("Helvetica", 12)
    for item in checklist:
        c.drawString(70, y, f"- {item.get('item', '')} (Source: {item.get('source', '')})")
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50
            
    if issues:
        y -= 10
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Flagged Issues:")
        y -= 20
        c.setFont("Helvetica", 12)
        for issue in issues:
            c.drawString(70, y, f"- {issue.get('type', '')}: {issue.get('detail', '')}")
            y -= 20
            c.drawString(90, y, f"Fix: {issue.get('suggested_fix', '')}")
            y -= 20
            if y < 50:
                c.showPage()
                y = height - 50
                
    if appointment:
        y -= 10
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y, "Appointment Details:")
        y -= 20
        c.setFont("Helvetica", 12)
        c.drawString(70, y, f"Slot ID: {appointment.get('slot_id', 'N/A')}, Status: {appointment.get('status', 'N/A')}")
        y -= 30
        
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, 30, "Disclaimer: Unofficial assistant. Uses synthetic/mock data. Final decisions are made by the Passport Office.")
    
    c.save()
    
    with open(filepath, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
        
    return {"filename": filename, "base64": b64}
