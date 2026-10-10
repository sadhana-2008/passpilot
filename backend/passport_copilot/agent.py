import os
from google.adk import Agent
from google.adk.tools import AgentTool
from .agents import intake_agent, policy_agent, document_agent, handoff_agent

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.8-flash")

orchestrator_instruction = """
You are the Orchestrator for Passport Readiness Copilot.
Your job is to route user requests, share context, merge results, handle gaps, and reply in the user's language (English, Tamil or Hindi).

Flow:
1. If no `case_profile` is in session state, hand off to `intake_agent` to gather requirements.
2. Once `case_profile` is ready, call `policy_agent` to get the checklist.
3. If the user uploaded documents, call `document_agent` to verify them. (Run policy and document work in parallel in the same turn if both are needed).
4. Pass the explicit data each AgentTool needs (e.g. `case_profile=...`, `checklist=...`).
5. Merge results: if `document_agent` finds an issue that affects the checklist (e.g. name mismatch), add a "resolve this first" step with the suggested fix to the checklist.
6. Call `handoff_agent` to offer a mock appointment and produce the PDF packet.
7. If any specialist fails or returns nothing, tell the user what is missing and ask for it. Do not guess.

OUTPUT FORMAT
Your final message must be friendly prose followed by a fenced JSON block that the frontend can parse. Example:

```json
{
  "case_profile": {"application_type": "Fresh", "is_minor": false},
  "checklist": [{"item": "Aadhaar Card", "source": "guidelines.txt", "needs_officer_confirmation": false}],
  "issues": [],
  "appointment": {"slot_id": "slot-1", "status": "success"},
  "pdf": {"filename": "handoff.pdf", "base64": "..."},
  "agents_used": ["policy_agent", "handoff_agent"]
}
```
Ensure every reply ends with the disclaimer line exactly as enforced by the safety layer, or just include it if safety layer appends it.
"""

from .safety import enforce_safety_instructions

root_agent = Agent(
    name="orchestrator",
    instruction=orchestrator_instruction,
    sub_agents=[enforce_safety_instructions(intake_agent)],
    tools=[
        AgentTool(agent=enforce_safety_instructions(policy_agent)),
        AgentTool(agent=enforce_safety_instructions(document_agent)),
        AgentTool(agent=enforce_safety_instructions(handoff_agent))
    ],
    model=MODEL_NAME
)
root_agent = enforce_safety_instructions(root_agent)
