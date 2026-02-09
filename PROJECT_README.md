# Creative Components — AI-Generated Three.js & GSAP Library

**AI-powered component generation using open-source GPT models, Three.js, and GSAP.**

Generate production-ready, copy-pasteable React components from natural language prompts. Each component is a single `.tsx` file — just copy it into your project, install peer dependencies, and you're done.

---

## 🚀 Quick Start

### 1. View the Gallery

The preview gallery is running at **http://localhost:5173**

```bash
cd preview
npm run dev
```

Browse 10 seed components across 5 categories with live previews, interactive demos, and copy-to-clipboard functionality.

### 2. Generate New Components

```bash
# Basic generation
python scripts/generate.py "floating 3D crystal with rainbow refraction" --category 3d-scenes

# With reference URL (agent fetches and analyzes the page)
python scripts/generate.py "parallax hero section" --category scroll-animations --url https://example.com/inspiration

# With reference image URL (agent incorporates the image into the component)
python scripts/generate.py "product showcase viewer" --category 3d-scenes --image https://picsum.photos/512

# Specify custom component name
python scripts/generate.py "aurora background" --category shader-backgrounds --name CustomAurora
```

Generated components appear in `generated_components/<category>/` and auto-register in the gallery.

---

## 📁 Project Structure

```
agent/
├── BRD_Creative_Components.md        # Business requirements document
├── PROJECT_README.md                 # This file
├── scripts/
│   ├── generate.py                   # CLI: generates components via LM Studio
│   └── validate.sh                   # TypeScript validation wrapper
├── tambo_agent/
│   ├── main.py                       # Existing agent (LM Studio client)
│   ├── components.ts                 # Tambo component registry
│   ├── requirements.txt              # Python dependencies
│   └── prompts/
│       ├── system_creative.txt       # System prompt enforcing component contract
│       └── few_shot_examples.json    # Few-shot examples per category
├── generated_components/             # ← All generated components live here
│   ├── 3d-scenes/
│   ├── scroll-animations/
│   ├── micro-interactions/
│   ├── shader-backgrounds/
│   ├── page-transitions/
│   ├── index.json                    # Auto-generated manifest
│   ├── package.json                  # Type definitions for editor support
│   └── tsconfig.json                 # TypeScript config
└── preview/                          # Vite gallery app
    ├── src/
    │   ├── App.tsx                   # Header + category filter
    │   └── Gallery.tsx               # Component grid with lazy loading
    ├── vite.config.ts
    └── package.json
```

---

## 🎨 Component Categories

| Category              | Description                                           | Examples                          |
|-----------------------|-------------------------------------------------------|-----------------------------------|
| **3d-scenes**         | Three.js hero sections, product viewers, particle systems | FloatingKnot, ProductViewer      |
| **scroll-animations** | Parallax, reveal-on-scroll, pinned sections            | ParallaxReveal, HorizontalScroll |
| **micro-interactions**| Button hovers, loaders, cursor effects                 | MagneticButton, PulseLoader      |
| **shader-backgrounds**| GLSL shaders, gradient meshes, particle fog            | AuroraMesh, ParticleFog          |
| **page-transitions**  | Route transitions, crossfades, wipe effects            | WipeTransition, CrossfadeDepth   |

---

## 🧩 Using Components in Your Project

### 1. Copy the component file

```bash
cp generated_components/3d-scenes/FloatingKnot.tsx src/components/
```

### 2. Install peer dependencies

```bash
npm install three @react-three/fiber @react-three/drei gsap
```

### 3. Import and use

```tsx
import FloatingKnot from './components/FloatingKnot';

function App() {
  return (
    <div>
      <FloatingKnot speed={1.2} color="#ff6600" />
    </div>
  );
}
```

That's it. No config, no build setup — each component is fully self-contained.

---

## 🤖 Agent Features

### Link & Image Fetching

The agent can access external references to inform generation:

```bash
# Fetch a reference webpage
python scripts/generate.py "recreate this hero section" \
  --category scroll-animations \
  --url https://awwwards.com/sites/some-site

# Incorporate a reference image
python scripts/generate.py "3D crystal with this texture" \
  --category 3d-scenes \
  --image https://example.com/crystal-texture.jpg
```

The agent:
- **For URLs:** Fetches the page, strips HTML, and summarizes key visual characteristics
- **For images:** Passes the URL as a prop default (e.g., `imageUrl`, `backgroundImage`)

### Model Configuration

Configured in `tambo_agent/main.py`:

```python
openai.api_base = "http://localhost:1234/v1"  # LM Studio endpoint
MODEL = "openai/gpt-oss-20b"                   # Open-source GPT model
TEMPERATURE = 0.2                               # Low for reproducibility
```

Change `MODEL` to any local model running in LM Studio or Ollama.

---

## 📦 Peer Dependencies

All components require:

| Package                 | Version   | Purpose                          |
|-------------------------|-----------|----------------------------------|
| `react`                | ^18.0.0   | React framework                  |
| `react-dom`            | ^18.0.0   | React DOM renderer               |
| `three`                | ^0.170.0  | 3D rendering (3D scenes, shaders)|
| `@react-three/fiber`   | ^8.17.0   | React renderer for Three.js      |
| `@react-three/drei`    | ^9.117.0  | Three.js helpers & abstractions  |
| `gsap`                 | ^3.12.0   | Animation library                |

**License Notes:**
- GSAP's "Standard" license is **free for most projects**. Only paid "Business" license is needed if GSAP itself is a core feature of your product.
- All other dependencies: MIT or Apache-2.0.

---

## 🛠️ Development

### Start the preview gallery

```bash
cd preview
npm install
npm run dev
```

Open http://localhost:5173

### Generate a component

```bash
python scripts/generate.py "your prompt here" --category <category>
```

### Validate TypeScript

```bash
./scripts/validate.sh generated_components/3d-scenes/FloatingKnot.tsx
```

Or use the built-in retry logic in `generate.py` which auto-validates and retries on errors.

---

## 🔧 Configuration

### System Prompt

Edit `tambo_agent/prompts/system_creative.txt` to enforce different component contracts.

Current rules:
- Default-export React.FC with typed Props
- Use `@react-three/fiber` for 3D, `gsap` for animation
- Respect `prefers-reduced-motion`
- Guard SSR with `typeof window`
- No eval, no external scripts
- Inline styles only (no CSS modules, no Tailwind)

### Few-Shot Examples

Add examples to `tambo_agent/prompts/few_shot_examples.json` to improve generation quality for specific patterns.

---

## 📖 Documentation

- **BRD:** [BRD_Creative_Components.md](BRD_Creative_Components.md) — full business requirements, architecture, milestones
- **Generated Components:** Each `.tsx` file includes JSDoc with `@description`, `@props`, `@example`, and `@peerdeps`

---

## 🚢 Deployment

### Publish as NPM Package

```bash
cd generated_components
npm publish
```

Users can then:

```bash
npm install @yourorg/creative-components
```

```tsx
import { FloatingKnot, MagneticButton } from '@yourorg/creative-components';
```

### Or: GitHub as Component Library

Users clone and copy-paste components directly:

```bash
git clone https://github.com/yourorg/creative-components
cp creative-components/generated_components/3d-scenes/FloatingKnot.tsx src/
```

---

## ⚠️ Known Issues & Notes

- **TypeScript errors resolved:** The `generated_components` folder now has its own `tsconfig.json` and `node_modules` with all type definitions. Errors should clear automatically. If not, reload VS Code window (`Cmd+Shift+P` → "Reload Window").
- **GSAP ScrollTrigger:** Requires `gsap.registerPlugin(ScrollTrigger)` at module scope — all scroll components include this.
- **Three.js performance:** Some 3D components may drop below 60fps on low-end hardware. Adjust particle counts, resolution, or shadow settings as needed.

---

## 🎯 Roadmap

- [ ] VS Code extension for in-editor generation
- [ ] Support for React Server Components (`"use client"` directive)
- [ ] WebXR (AR/VR) component category
- [ ] Physics engine integration (Cannon.js / Rapier)
- [ ] Design token theming system
- [ ] Vision model support (GPT-4V, LLaVA) for image analysis

---

## 📄 License

MIT © 2026

Built with [Tambo](https://github.com/tambo-ai/tambo), [Three.js](https://threejs.org), and [GSAP](https://greensock.com/gsap/).

---

**Gallery running at:** http://localhost:5173  
**Generate:** `python scripts/generate.py "your prompt" --category <cat>`  
**Copy-paste components into any React project. Zero config required.**
