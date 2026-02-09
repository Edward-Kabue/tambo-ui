# Tambo Agentic UI Component Generator

A lightweight framework that turns natural‑language prompts into ready‑to‑use React components.  
Built on top of the [Tambo](https://github.com/tambo-ai/tambo) agent framework and the
[Tambo template repo](https://github.com/tambo-ai/tambo-template).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run the Demo](#run-the-demo)
- [Agents](#agents)
  - [`AskAgent`](#askagent)
  - [`ParseAgent`](#parseagent)
  - [Preview Flow](#preview-flow)
- [Configuration](#configuration)
- [Testing](#testing)
- [Extending the Framework](#extending-the-framework)
- [License](#license)

---

## Overview

This project demonstrates how an **agentic** architecture can automate UI component creation:

1. **User Input** – A natural‑language description (e.g., “Create a card that shows user avatar and name”).
2. **AskAgent** – Wraps the prompt, calls an LLM (OpenAI/Ollama) and requests a JSON‑encoded JSX tree.
3. **ParseAgent** – Validates the LLM output, converts it to a `.tsx` file under `agent/components/`.
4. **Preview** – Dynamically imports the generated component and renders it in the browser.

The result is a single file that can be dropped into any React project and used like:

```tsx
import MyCard from "./agent/components/MyCard";

function App() {
  return <MyCard />;
}
```

---

## Architecture

```
[UI] ──► AskAgent ──► ParseAgent ──► File System
                               ▲
                               │
                          PreviewAgent (optional)
```

- **Agents** are stateless, reusable units defined in `agent/`.
- The **flow graph** is declared in `pages/index.tsx` using `<Tambo>` and `<AgentNode>`.
- **Configuration** lives in `tambo.config.ts`, allowing you to swap LLM providers or tweak temperature without touching code.

---

## Getting Started

### Prerequisites

- Node.js 18+ (or 20)
- Yarn or npm
- Optional: Ollama server (`ollama serve`) for a local LLM

### Installation

```bash
# Clone the repo (or copy this folder)
git clone https://github.com/your-org/tambo-agentic-ui.git
cd tambo-agentic-ui

# Install dependencies
npm install   # or yarn install
```

### Run the Demo

```bash
# Start the local LLM (if using Ollama)
ollama serve

# Run the dev server
npm run dev   # Vite will open http://localhost:5173 by default

# Interact with the UI:
# 1. Type a component description
# 2. Click “Generate”
# 3. See the generated component in the preview pane
```

---

## Agents

### AskAgent

- **Purpose**: Accepts user text, formats a system prompt that instructs the LLM to output **JSON‑encoded JSX**.
- **Key Code** (`agent/AskAgent.tsx`):

```tsx
export const Ask = () => (
  <AgentNode name="Ask" flow={flow}>
    {({ message }) => {
      const prompt = `You are a code generator. Given the description below, output a React component as JSON: ${message}`;
      return <LLMRequest prompt={prompt} />;
    }}
  </AgentNode>
);
```

### ParseAgent

- **Purpose**: Parses the LLM’s JSON, converts it to a `.tsx` file, and writes it to disk.
- **Key Code** (`agent/ParseAgent.tsx`):

```tsx
export const Parse = () => (
  <AgentNode name="Parse" flow={flow}>
    {({ data }) => {
      const componentName = inferComponentName(data);
      const filePath = `agent/components/${componentName}.tsx`;
      return <FileWrite path={filePath} content={renderJSXToTSX(data)} />;
    }}
  </AgentNode>
);
```

### Preview Flow

A lightweight agent (`PreviewAgent`) can be wired to the same output as `ParseAgent` so that the UI instantly re‑renders the new component without a full page reload.

---

## Configuration

`/tambo.config.ts`

```ts
export default {
  llm: {
    endpoint: process.env.LLM_ENDPOINT ?? "http://localhost:11434/v1",
    model: "gpt-4o-mini",
    temperature: 0.2,
  },
};
```

All sensitive values should be stored in environment variables and never committed.

---

## Testing

Run the unit tests with:

```bash
npm test   # or yarn test
```

Key tests cover:
- Successful JSON parsing in `ParseAgent`.
- Handling of malformed LLM output.
- File overwrite confirmation logic.

---

## Extending the Framework

1. **Add a new agent** – e.g., `StyleAgent` to inject CSS modules.
2. **Swap LLM providers** – Change the endpoint or model in `tambo.config.ts`.
3. **Integrate with a design system** – Wrap generated components in your existing theme context.
4. **Publish as an NPM package** – Expose the `agent/components/` folder for reuse.

---

## License

MIT © 2026 EDWARD KABUE

---
