
import asyncio
from google.adk.runners import InMemoryRunner
from passport_copilot.agents.policy import policy_agent


async def main():
    runner = InMemoryRunner(
        agent=policy_agent,
        app_name="policy_direct_test",
    )

    response = await runner.run_debug(
        "What should I do if my Indian passport is lost?"
    )

    print("\nPolicy Agent test completed.")


if __name__ == "__main__":
    asyncio.run(main())
