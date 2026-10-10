from pathlib import Path
import re

KNOWLEDGE_DIR = Path(__file__).parent.parent / "knowledge"

def load_guidelines() -> list[dict]:
    try:
        with open(KNOWLEDGE_DIR / "guidelines.txt", "r") as f:
            content = f.read()
            
        sections = []
        current_section = "General"
        current_text = []
        
        for line in content.split("\n"):
            if line.startswith("Section:"):
                if current_text:
                    sections.append({
                        "section": current_section,
                        "passage": "\n".join(current_text).strip(),
                        "source": "guidelines.txt"
                    })
                current_section = line.replace("Section:", "").strip()
                current_text = []
            elif line.strip() and not line.startswith("---") and not line.startswith("[PLACEHOLDER]"):
                current_text.append(line.strip())
                
        if current_text:
            sections.append({
                "section": current_section,
                "passage": "\n".join(current_text).strip(),
                "source": "guidelines.txt"
            })
            
        return sections
    except Exception:
        return []

def search_guidelines(query: str, case_profile: dict) -> list[dict]:
    """
    Searches the official Passport Seva guidelines for rules matching the query or case profile.
    Returns a list of passages with their source and section: [{passage, source, section}].
    """
    sections = load_guidelines()
    if not sections:
        return []

    # Simple keyword search (in a real app, this would be vector search)
    keywords = set(re.findall(r'\w+', query.lower()))
    
    # Add context from profile
    if case_profile.get("is_minor"):
        keywords.add("minor")
    if case_profile.get("tatkal"):
        keywords.add("tatkal")
        
    results = []
    for s in sections:
        passage_lower = s["passage"].lower()
        section_lower = s["section"].lower()
        
        # Calculate a simple match score
        score = sum(1 for kw in keywords if kw in passage_lower or kw in section_lower)
        if score > 0:
            results.append((score, s))
            
    # Sort by score descending and return top matches
    results.sort(key=lambda x: x[0], reverse=True)
    return [r[1] for r in results[:3]]
