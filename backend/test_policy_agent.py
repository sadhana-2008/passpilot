
from google.adk.runners import InMemoryRunner
from passport_copilot.agent import root_agent

runner = InMemoryRunner(agent=root_agent, app_name="passpilot_test")


async def main():
    response = await runner.run_debug(
        "What should I do if my Indian passport is lost?"
    )
    print(response)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
