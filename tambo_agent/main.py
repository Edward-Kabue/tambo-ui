
"""
Minimal interactive CLI that talks to the local LM Studio
server using the OpenAI Python client.

- The default model is `openai/gpt-oss-20b` (the LM Studio OSS model).
- Uses prompt_toolkit for a nice command‑line interface.
- No external `tambo` package is required.
"""

import asyncio

# Prompt toolkit imports
from prompt_toolkit import PromptSession

# OpenAI client (configured to point at LM Studio)
import openai

# Configure the OpenAI client to use LM Studio's local endpoint.
# If your LM Studio instance runs on a different host/port, adjust
# the `api_base` value accordingly.
openai.api_base = "http://localhost:1234/v1"
# Use the default OpenAI API key placeholder; LM Studio ignores it.
openai.api_key = "EMPTY"


class Agent:
    """
    Lightweight wrapper around the OpenAI chat completion endpoint.
    It simply forwards user prompts to LM Studio and returns the model's
    text response.
    """
    def __init__(self, model: str = "openai/gpt-oss-20b"):
        self.model = model

    def run(self, prompt: str) -> str:
        """
        Send a user prompt to the model and return the generated text.
        """
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content.strip()


async def main() -> None:
    """
    Main entry point: set up the prompt‑toolkit session and run an
    interactive chat loop.
    """
    agent = Agent()
    session = PromptSession(">>> ")

    print(
        "LM Studio Agent CLI\n"
        "Type your message and press Enter.\n"
        "Ctrl‑C to exit.\n"
    )

    while True:
        try:
            user_input = await session.prompt_async()
        except KeyboardInterrupt:
            print("\nExiting.")
            break

        if not user_input.strip():
            continue

        reply = agent.run(user_input)
        print(reply)

if __name__ == "__main__":
    asyncio.run(main())
