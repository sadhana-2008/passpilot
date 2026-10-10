# Passport Readiness Copilot

An unofficial assistant built for DevFest on Campus 2026 (GDG Chennai). It helps Indian passport applicants prepare by building a personalized, cited document checklist, checking uploaded documents for inconsistencies, and drafting a handoff packet for their Passport Seva Kendra visit.

## Features
- **Orchestrator Agent**: Manages the flow, merges results, and ensures the response is in a structured JSON format.
- **Intake Agent**: Asks follow-up questions to determine the exact requirements (Fresh/Renewal, Minor, Tatkal, etc.) and saves to session state.
- **Policy Agent**: Queries the official guidelines to generate a cited checklist.
- **Document Agent**: Evaluates uploaded documents using Gemini Vision, identifies inconsistencies like name/DOB mismatch or expired proofs, and offers suggested fixes.
- **Handoff Agent**: Mocks an appointment booking, fetches application status, and generates a printable handoff PDF packet.
- **Safety Layer**: Ensures every policy checklist item has a citation, flags items that require officer confirmation, and enforces a mandatory disclaimer.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create a `.env` file (you can copy `.env.example`):
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   MODEL_NAME=gemini-3.8-flash
   USE_FIRESTORE=false
   ```

3. **Knowledge Base**
   Add official Passport Seva guidelines to `backend/passport_copilot/knowledge/guidelines.txt`. A placeholder is provided, but it should be replaced with real text.

## Running the Application

### Web UI (for testing)
Run the ADK Web Server:
```bash
adk web backend/passport_copilot/ --host 127.0.0.1 --port 5000
```
Then open your browser to the URL provided.

### API Server (for local frontend integration)
To expose the agent via an API for your Vite/React frontend, run:
```bash
adk api_server backend/passport_copilot/ --allow_origins=http://localhost:5173
```

### Deploy to Render
Render commands typically use `$PORT` and `0.0.0.0`:
```bash
adk api_server backend/passport_copilot/ --host 0.0.0.0 --port $PORT --allow_origins=https://your-frontend-domain.com
```

## Running Tests
Run tests with `pytest`:
```bash
python -m pytest backend/passport_copilot/tests/test_tools.py
```

## Demo Script
Run the `demo.py` script to see a simulated conversation where a student uploads two conflicting documents (Aadhaar and Voter ID).
```bash
python backend/passport_copilot/demo.py
```
