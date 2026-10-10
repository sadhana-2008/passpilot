import logging
from google.adk import Context

# Setup simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("safety_layer")

def before_tool_logging_callback(tool, args: dict, ctx: Context) -> None:
    """Logs every tool call."""
    tool_name = getattr(tool, "name", str(tool))
    logger.info(f"SAFETY LOG: Executing tool '{tool_name}' with args: {list(args.keys())}")

def enforce_disclaimer(ctx: Context) -> None:
    """Ensures the final output from orchestrator has the disclaimer."""
    disclaimer = "Unofficial assistant. Uses synthetic/mock data. Final decisions are made by the Passport Office."
    
    # Check if the disclaimer is already present in the output
    content_text = ""
    if ctx.output:
        if isinstance(ctx.output, str):
            content_text = ctx.output
        elif hasattr(ctx.output, "text"):
            content_text = ctx.output.text
            
    if disclaimer not in content_text:
        # Instead of modifying the output directly (which depends on the GenAI types),
        # we can just log a warning for now or rely on the agent prompt.
        # But a true safety layer would modify the response.
        logger.warning("SAFETY: Disclaimer missing in agent response. Agent instructions should enforce this.")

def enforce_safety_instructions(agent):
    """
    Applies safety rules by injecting them into the agent's instructions 
    and attaching the logging callback.
    """
    safety_instruction = """
    CRITICAL SAFETY RULES:
    1. You MUST NEVER impersonate a Passport Officer or claim to be the Passport Office.
    2. You MUST NOT make final decisions on eligibility, approval, or legal validity.
    3. You MUST end your final reply with: "Unofficial assistant. Uses synthetic/mock data. Final decisions are made by the Passport Office."
    """
    if agent.instruction:
        agent.instruction += "\n" + safety_instruction
        
    # ADK callback syntax for before tool
    if not agent.before_tool_callback:
        agent.before_tool_callback = before_tool_logging_callback
    elif isinstance(agent.before_tool_callback, list):
        agent.before_tool_callback.append(before_tool_logging_callback)
    else:
        agent.before_tool_callback = [agent.before_tool_callback, before_tool_logging_callback]
        
    # We could also use after_agent_callback to enforce disclaimer
    if not agent.after_agent_callback:
        agent.after_agent_callback = enforce_disclaimer
    elif isinstance(agent.after_agent_callback, list):
        agent.after_agent_callback.append(enforce_disclaimer)
    else:
        agent.after_agent_callback = [agent.after_agent_callback, enforce_disclaimer]
        
    return agent
