import React, { useState } from "react";
import Gallery from "./Gallery";
import PromptStudio from "./PromptStudio";

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f0f0f0",
  },
  header: {
    padding: "40px 32px 24px",
    borderBottom: "1px solid #1f1f1f",
    background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #6c5ce7, #00cec9)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    maxWidth: "600px",
  },
  nav: {
    display: "flex",
    gap: "8px",
    padding: "16px 32px",
    flexWrap: "wrap" as const,
    borderBottom: "1px solid #1f1f1f",
  },
  navBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #333",
    background: "transparent",
    color: "#aaa",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  navBtnActive: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #6c5ce7",
    background: "#6c5ce722",
    color: "#6c5ce7",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 600,
  },
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "3d-scenes", label: "3D Scenes" },
  { id: "scroll-animations", label: "Scroll Animations" },
  { id: "micro-interactions", label: "Micro-Interactions" },
  { id: "shader-backgrounds", label: "Shader Backgrounds" },
  { id: "page-transitions", label: "Page Transitions" },
];

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [view, setView] = useState<"gallery" | "prompts">("gallery");

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={styles.title}>Creative Components Gallery</h1>
            <p style={styles.subtitle}>
              AI-generated Three.js & GSAP components. Copy any component into your
              React project — each is a single self-contained .tsx file.
            </p>
          </div>
          <button
            onClick={() => setView(view === "gallery" ? "prompts" : "gallery")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: view === "prompts" ? "1px solid #6c5ce7" : "1px solid #333",
              background: view === "prompts" ? "#6c5ce722" : "transparent",
              color: view === "prompts" ? "#6c5ce7" : "#aaa",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap" as const,
              flexShrink: 0,
              marginTop: "4px",
            }}
          >
            {view === "prompts" ? "Back to Gallery" : "Prompt Studio"}
          </button>
        </div>
      </header>

      {view === "gallery" ? (
        <>
          <nav style={styles.nav}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={activeCategory === cat.id ? styles.navBtnActive : styles.navBtn}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          <Gallery activeCategory={activeCategory} />
        </>
      ) : (
        <PromptStudio />
      )}
    </div>
  );
};

export default App;
