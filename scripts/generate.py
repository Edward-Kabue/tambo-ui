#!/usr/bin/env python3
"""
generate.py — CLI to generate creative React components via gpt-oss-20b.

Usage:
    python scripts/generate.py "a floating 3D crystal" \
        --category 3d-scenes
    python scripts/generate.py "parallax hero section" \
        --category scroll-animations
    python scripts/generate.py "magnetic button" \
        --category micro-interactions \
        --url https://example.com/reference
    python scripts/generate.py "aurora background" \
        --category shader-backgrounds \
        --image https://example.com/mood.jpg

The agent can fetch reference URLs (web pages) and image URLs to
inform the component design. Fetched content is summarised and injected
into the prompt.
"""

import argparse
import json
import os
import re
import subprocess
import sys
import hashlib
import datetime
from pathlib import Path
from typing import Optional

import openai

# ---------------------------------------------------------------------------
# Fetch helpers — allow the agent to access links and images
# ---------------------------------------------------------------------------


def fetch_url_content(url: str, max_chars: int = 3000) -> str:
    """Fetch a web page and return a text summary (stripped HTML)."""
    try:
        import urllib.request
        from html.parser import HTMLParser

        class _Strip(HTMLParser):
            def __init__(self):
                super().__init__()
                self._parts: list[str] = []
                self._skip = False

            def handle_starttag(self, tag, _):
                if tag in ("script", "style", "noscript"):
                    self._skip = True

            def handle_endtag(self, tag):
                if tag in ("script", "style", "noscript"):
                    self._skip = False

            def handle_data(self, data):
                if not self._skip:
                    self._parts.append(data.strip())

            def text(self):
                return " ".join(p for p in self._parts if p)

        req = urllib.request.Request(
            url, headers={"User-Agent": "CreativeAgent/1.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="replace")
        s = _Strip()
        s.feed(html)
        text = s.text()
        return text[:max_chars]
    except Exception as exc:
        return f"[Could not fetch URL: {exc}]"


def describe_image_url(url: str) -> str:
    """Return a description string for an image URL.

    In a full setup the agent would call a vision model. Here we pass
    the URL directly so the LLM can reference it in component props.
    """
    return (
        f"The user provided a reference image at: {url}\n"
        "Incorporate this image URL as a prop default or background.\n"
        "Use <img src='{url}' /> or Three.js useTexture('{url}') "
        "as appropriate."
    )


# ---------------------------------------------------------------------------
# Agent wrapper (mirrors tambo_agent/main.py)
# ---------------------------------------------------------------------------

# Point at LM Studio local endpoint
openai.api_base = os.getenv("LM_STUDIO_URL", "http://localhost:1234/v1")
openai.api_key = os.getenv("LM_STUDIO_KEY", "EMPTY")

MODEL = os.getenv("LM_STUDIO_MODEL", "openai/gpt-oss-20b")
TEMPERATURE = float(os.getenv("AGENT_TEMPERATURE", "0.2"))

ROOT = Path(__file__).resolve().parent.parent
PROMPTS_DIR = ROOT / "tambo_agent" / "prompts"
COMPONENTS_DIR = ROOT / "generated_components"
MANIFEST = COMPONENTS_DIR / "index.json"

CATEGORIES = [
    "3d-scenes",
    "scroll-animations",
    "micro-interactions",
    "shader-backgrounds",
    "page-transitions",
]


def load_system_prompt() -> str:
    return (PROMPTS_DIR / "system_creative.txt").read_text()


def load_few_shot() -> list[dict]:
    return json.loads((PROMPTS_DIR / "few_shot_examples.json").read_text())


def build_messages(
    prompt: str,
    category: str,
    url_context: Optional[str] = None,
    image_context: Optional[str] = None,
    retry_error: Optional[str] = None,
) -> list[dict]:
    """Build the chat messages array for the LLM call."""
    system = load_system_prompt()

    # Add few-shot examples for the target category
    examples = load_few_shot()
    cat_examples = [e for e in examples if e["category"] == category]
    if cat_examples:
        system += "\n\nFEW-SHOT EXAMPLES:\n"
        for ex in cat_examples:
            system += (
                f"\nUser: {ex['prompt']}\n"
                f"Assistant:\n{ex['output_snippet']}\n"
            )

    messages = [{"role": "system", "content": system}]

    user_content = f"Category: {category}\n\nDescription: {prompt}"

    if url_context:
        user_content += f"\n\nREFERENCE PAGE CONTENT:\n{url_context}"
    if image_context:
        user_content += f"\n\n{image_context}"
    if retry_error:
        user_content += (
            "\n\nThe previous attempt had this TypeScript error — "
            f"please fix it:\n{retry_error}"
        )

    messages.append({"role": "user", "content": user_content})
    return messages


def call_agent(messages: list[dict]) -> str:
    """Send messages to gpt-oss-20b and return the raw text."""
    resp = openai.ChatCompletion.create(
        model=MODEL,
        messages=messages,
        temperature=TEMPERATURE,
        max_tokens=4096,
    )
    return resp.choices[0].message.content.strip()


def strip_markdown_fences(text: str) -> str:
    """Remove ```tsx ... ``` or ```jsx ... ``` fences if model wraps."""
    text = re.sub(
        r"^```(?:tsx|jsx|typescript|javascript)?\s*\n?", "", text
    )
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def infer_component_name(prompt: str) -> str:
    """Turn a prompt into a PascalCase component name."""
    words = re.sub(r"[^a-zA-Z0-9 ]", "", prompt).split()
    # Take first 3 meaningful words
    meaningful = [w.capitalize() for w in words if len(w) > 2][:3]
    return "".join(meaningful) or "GeneratedComponent"


def validate_tsx(file_path: Path) -> Optional[str]:
    """Run tsc --noEmit on the file. Return error text or None on success."""
    tsconfig = ROOT / "preview" / "tsconfig.json"
    if not tsconfig.exists():
        # Skip validation if preview app not set up yet
        return None
    try:
        result = subprocess.run(
            [
                "npx", "tsc", "--noEmit", "--esModuleInterop",
                "--jsx", "react-jsx", "--moduleResolution", "bundler",
                "--skipLibCheck", str(file_path)
            ],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=str(ROOT / "preview"),
        )
        if result.returncode != 0:
            return result.stderr or result.stdout
    except FileNotFoundError:
        return None  # tsc not available, skip
    except subprocess.TimeoutExpired:
        return None
    return None


def update_manifest(name: str, category: str, prompt: str, file_path: str):
    """Append entry to generated_components/index.json."""
    manifest: list[dict] = []
    if MANIFEST.exists():
        manifest = json.loads(MANIFEST.read_text())

    entry = {
        "name": name,
        "category": category,
        "file": file_path,
        "prompt": prompt,
        "prompt_hash": hashlib.sha256(
            prompt.encode()
        ).hexdigest()[:12],
        "generated_at": datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat(),
    }

    # Update existing or append
    existing = [i for i, e in enumerate(manifest) if e["name"] == name]
    if existing:
        manifest[existing[0]] = entry
    else:
        manifest.append(entry)

    MANIFEST.write_text(json.dumps(manifest, indent=2))


def generate(
    prompt: str,
    category: str,
    name: Optional[str] = None,
    url: Optional[str] = None,
    image: Optional[str] = None,
) -> Path:
    """Full generation pipeline: prompt → LLM → validate → write."""

    if category not in CATEGORIES:
        print(f"Error: category must be one of {CATEGORIES}")
        sys.exit(1)

    component_name = name or infer_component_name(prompt)
    out_dir = COMPONENTS_DIR / category
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{component_name}.tsx"

    # Fetch external context if provided
    url_context = fetch_url_content(url) if url else None
    image_context = describe_image_url(image) if image else None

    print(f"🔧 Generating {component_name} in {category}...")
    print(f"   Model: {MODEL} @ {openai.api_base}")

    messages = build_messages(
        prompt, category, url_context, image_context
    )
    raw = call_agent(messages)
    tsx = strip_markdown_fences(raw)

    # Write first attempt
    out_file.write_text(tsx)
    print(f"   ✅ Written to {out_file.relative_to(ROOT)}")

    # Validate
    error = validate_tsx(out_file)
    if error:
        print("   ⚠️  TypeScript error, retrying with error context...")
        messages2 = build_messages(
            prompt, category, url_context, image_context,
            retry_error=error
        )
        raw2 = call_agent(messages2)
        tsx2 = strip_markdown_fences(raw2)
        out_file.write_text(tsx2)
        error2 = validate_tsx(out_file)
        if error2:
            print(
                "   ⚠️  Still has errors (component written anyway):\n"
                f"{error2[:500]}"
            )
        else:
            print("   ✅ Retry succeeded!")

    update_manifest(
        component_name, category, prompt,
        f"{category}/{component_name}.tsx"
    )
    print("   📦 Manifest updated.\n")
    return out_file


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate creative React components via AI agent"
    )
    parser.add_argument(
        "prompt",
        help="Natural-language component description"
    )
    parser.add_argument(
        "--category", "-c",
        choices=CATEGORIES,
        default="3d-scenes",
        help="Component category (default: 3d-scenes)",
    )
    parser.add_argument(
        "--name", "-n",
        help="Component name (PascalCase). Auto-inferred if omitted."
    )
    parser.add_argument(
        "--url", "-u",
        help="Reference URL — agent will fetch and analyse page content"
    )
    parser.add_argument(
        "--image", "-i",
        help="Reference image URL — agent will incorporate into design"
    )

    args = parser.parse_args()
    generate(args.prompt, args.category, args.name, args.url, args.image)


if __name__ == "__main__":
    main()
