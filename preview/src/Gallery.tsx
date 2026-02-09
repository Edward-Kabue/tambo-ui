import React, { Suspense, lazy, useState, useCallback } from "react";
import manifest from "../../generated_components/index.json";

// ---------------------------------------------------------------------------
// Lazy-load every component from the generated_components directory
// ---------------------------------------------------------------------------

const componentModules: Record<string, React.LazyExoticComponent<React.FC<any>>> = {
  FloatingKnot:         lazy(() => import("@components/3d-scenes/FloatingKnot")),
  ProductViewer:        lazy(() => import("@components/3d-scenes/ProductViewer")),
  AuroraMesh:           lazy(() => import("@components/shader-backgrounds/AuroraMesh")),
  ParticleFog:          lazy(() => import("@components/shader-backgrounds/ParticleFog")),
  WipeTransition:       lazy(() => import("@components/page-transitions/WipeTransition")),
  CrossfadeDepth:       lazy(() => import("@components/page-transitions/CrossfadeDepth")),
};

// Default props for preview rendering
const previewProps: Record<string, Record<string, any>> = {
  FloatingKnot:         { speed: 1, color: "#6c5ce7" },
  ProductViewer:        { imageUrl: "https://picsum.photos/512/512", rotateSpeed: 0.5, color: "#ffffff" },
  FloatingCrystalScene: { speed: 1, color: "#00cec9" },
  CreateHeroComponet:   {},
  ParallaxReveal:       { children: React.createElement("h2", { style: { fontSize: 24, color: "#fff", padding: 20, textAlign: "center" as const }}, "↓ I fade in on scroll ↓"), offset: 60 },
  HorizontalScroll:     { children: [1,2,3].map(i => React.createElement("div", { key: i, style: { width: "80vw", height: "300px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, fontWeight: 700, color: "#333", background: `hsl(${i*100}, 60%, 85%)`, flexShrink: 0 }}, `Panel ${i}`)) },
  MagneticButton:       { children: "Hover me", strength: 0.35, backgroundColor: "#6c5ce7" },
  PulseLoader:          { size: 14, color: "#00cec9", count: 4 },
  AuroraMesh:           { colors: ["#6c5ce7","#00cec9","#fd79a8"] as [string,string,string], speed: 0.8 },
  ParticleFog:          { count: 300, color: "#ffffff", speed: 0.2, size: 0.02 },
  WipeTransition:       {},
  CrossfadeDepth:       {},
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))",
    gap: "24px",
    padding: "32px",
  },
  card: {
    background: "#111",
    borderRadius: "12px",
    border: "1px solid #222",
    overflow: "hidden",
    transition: "border-color 0.3s ease",
  },
  previewArea: {
    position: "relative" as const,
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0a",
    overflow: "hidden",
  },
  info: {
    padding: "16px 20px",
    borderTop: "1px solid #222",
  },
  name: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#f0f0f0",
    marginBottom: "4px",
  },
  category: {
    fontSize: "12px",
    color: "#6c5ce7",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: "8px",
  },
  prompt: {
    fontSize: "13px",
    color: "#666",
    lineHeight: 1.4,
    marginBottom: "12px",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  btn: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "transparent",
    color: "#aaa",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnPrimary: {
    padding: "6px 14px",
    borderRadius: "6px",
    border: "1px solid #6c5ce7",
    background: "#6c5ce722",
    color: "#6c5ce7",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    color: "#444",
    fontSize: "14px",
  },
  empty: {
    padding: "80px 32px",
    textAlign: "center" as const,
    color: "#444",
    fontSize: "16px",
  },
};

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

interface CardProps {
  item: typeof manifest[number];
}

const ComponentCard: React.FC<CardProps> = ({ item }) => {
  const [copied, setCopied] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const Comp = componentModules[item.name];

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(`generated_components/${item.file}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item.file]);

  if (!Comp) return null;

  // For transition components, we need an "active" toggle
  const isTransition = item.category === "page-transitions";
  const transitionProps = isTransition ? { active: showToggle, children: React.createElement("div", { style: { padding: 40, color: "#fff", textAlign: "center" as const, fontSize: 24 } }, `${item.name} Content`) } : {};

  return (
    <div style={styles.card}>
      <div style={styles.previewArea}>
        <Suspense fallback={<div style={styles.loading}>Loading…</div>}>
          <div style={{ width: "100%", height: "100%" }}>
            <Comp {...(previewProps[item.name] || {})} {...transitionProps} />
          </div>
        </Suspense>
      </div>
      <div style={styles.info}>
        <div style={styles.category}>{item.category}</div>
        <div style={styles.name}>{item.name}</div>
        <div style={styles.prompt}>{item.prompt}</div>
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={handleCopyPath}>
            {copied ? "✓ Copied!" : "Copy Path"}
          </button>
          {isTransition && (
            <button style={styles.btn} onClick={() => setShowToggle((p) => !p)}>
              {showToggle ? "Hide" : "Trigger"}
            </button>
          )}
          <button
            style={styles.btn}
            onClick={() => window.open(`https://github.com/user/agent/blob/main/generated_components/${item.file}`, "_blank")}
          >
            Source
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

interface GalleryProps {
  activeCategory: string;
}

const Gallery: React.FC<GalleryProps> = ({ activeCategory }) => {
  const items = activeCategory === "all"
    ? manifest
    : manifest.filter((m) => m.category === activeCategory);

  if (items.length === 0) {
    return <div style={styles.empty}>No components in this category yet.</div>;
  }

  return (
    <div style={styles.grid}>
      {items.map((item) => (
        <ComponentCard key={item.name} item={item} />
      ))}
    </div>
  );
};

export default Gallery;
