from google.adk import Context

def save_case_profile(tool_context: Context, profile: dict) -> str:
    """
    Saves the user's case profile to session state.
    The profile should contain: application_type, is_minor, name_change, tatkal, lost_or_damaged, language.
    """
    if "case_profile" not in tool_context.session.state:
        tool_context.session.state["case_profile"] = {}
    
    tool_context.session.state["case_profile"].update(profile)
    return "Case profile saved successfully."
