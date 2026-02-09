# Tambo Agentic UI Component Generator

A lightweight framework that turns natural-language prompts into ready-to-use React components.  
Built on top of the [Tambo](https://github.com/tambo-ai/tambo) agent framework and the
[Tambo template repo](https://github.com/tambo-ai/tambo-template).

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
- [Agent Design & Loop Explanation](#agent-design--loop-explanation)

---

## Overview
This project demonstrates an **agentic** architecture for UI generation:

1. **User Input** - A natural-language description (e.g., _"Create a button that says 'Submit' in a green background"_).
2. **AskAgent** - Wraps the prompt into a system instruction that forces an LLM to return a **JSON-encoded JSX** tree.
3. **ParseAgent** - Validates the JSON, extracts component metadata, and writes a `.tsx` file under `agent/components/`.
4. **Preview** - The new component is hot-module-replaced (HMR) so the UI instantly reflects the change.

The generated component can be imported anywhere in your React app:

```tsx
import MyButton from "./agent/components/MyButton";

function App() {
  return <MyButton />;
}
```

---  

## Architecture
```
[UI] --> AskAgent --> ParseAgent --> File System
                               ^
                               |
                          PreviewAgent (optional)
```

- **Agents** are stateless, reusable units defined in `agent/`.
- The **flow graph** is declared in `pages/index.tsx` using `<Tambo>` and `<AgentNode>`.
- **Configuration** lives in `tambo.config.ts`; you can swap LLM providers or adjust temperature without touching code.

---  

## Getting Started

### Prerequisites
- Node.js 18 + 20 (recommended)
- Yarn or npm
- (Optional) Ollama server (`ollama serve`) if you want to run a local LLM.

### Installation
```bash
git clone https://github.com/your-org/tambo-agentic-ui.git
cd tambo-agentic-ui
npm install   # or yarn install
```

### Run the Demo
```bash
# If you want to use a local Ollama model:
ollama serve

# Start the dev server:
npm run dev   # Vite opens http://localhost:5173

# Interact:
# 1. Type a component description.
# 2. Click "Generate".
# 3. The component appears in the preview pane.
```

---  

## Agents

### AskAgent
Wraps the user prompt into a system-level instruction that forces the LLM to return **JSON-encoded JSX**.

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
Validates the JSON, extracts the component name, and writes a `.tsx` file.

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
A lightweight `PreviewAgent` can be wired to the same output so the UI instantly re-renders the new component without a full page reload.

---  

## Configuration
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
```bash
npm test   # or yarn test
```
Core tests verify JSON parsing, malformed-output handling, and file-write safety.

---  

## Extending the Framework
- Add a `StyleAgent` to inject CSS modules.
- Swap LLM providers by editing `tambo.config.ts`.
- Integrate with an existing design system.
- Publish the generated component folder as an NPM package.

---  

## License
MIT (c) 2026 EDWARD KABUE

---  

## Agent Design & Loop Explanation
Please see **README-AGENT.md** for a deep dive into the self-referential "Ralph Wiggum" loop, how RAG/LangChain can be used, and prompt-engineering optimizations.
