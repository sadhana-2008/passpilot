
from policy_agent import lookup_rules

print("\nTEST 1: Empty query")
print(lookup_rules(""))

print("\nTEST 2: Unverified passport rule")
result = lookup_rules("lost or damaged passport")
print(result)

assert result["status"] == "no_matching_rules", (
    "Expected no matches while all rules are unverified."
)

print("\nTEST 3: Invalid query")
assert lookup_rules("   ")["status"] == "invalid_query"

print("\nAll local policy lookup tests passed.")
