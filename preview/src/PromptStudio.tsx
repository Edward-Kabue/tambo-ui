import React, { useState, useEffect, useCallback, useRef, DragEvent } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FewShotExample {
  category: string;
  prompt: string;
  component_name: string;
  output_snippet: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    componentName?: string;
    category?: string;
    file?: string;
    code?: string;
    error?: boolean;
  };
}

interface GenerateResponse {
  ok?: boolean;
  error?: string;
  details?: string;
  component?: {
    name: string;
    category: string;
    file: string;
    code: string;
  };
  output?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "3d-scenes",
  "scroll-animations",
  "micro-interactions",
  "shader-backgrounds",
  "page-transitions",
];

const EXAMPLE_PROMPTS = [
  { text: "Floating crystal 3D scene", category: "3d-scenes" },
  { text: "Magnetic button interaction", category: "micro-interactions" },
  { text: "Aurora shader background", category: "shader-backgrounds" },
  { text: "Parallax scroll reveal", category: "scroll-animations" },
  { text: "Page wipe transition", category: "page-transitions" },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  // Main layout
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0d0d0d",
    color: "#e0e0e0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0d0d0d",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  logo: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  categorySelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#e0e0e0",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
  },
  settingsBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  },

  // Messages area
  messagesContainer: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "24px 0",
  },
  messagesInner: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 24px",
  },

  // Empty state
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: "400px",
    textAlign: "center" as const,
    padding: "40px 24px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "8px",
  },
  emptySubtitle: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "32px",
    maxWidth: "400px",
  },
  exampleChips: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    justifyContent: "center",
    maxWidth: "600px",
  },
  exampleChip: {
    padding: "10px 16px",
    borderRadius: "20px",
    border: "1px solid #333",
    background: "#1a1a1a",
    color: "#aaa",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  // Message bubbles
  messageRow: {
    marginBottom: "24px",
  },
  userMessage: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "70%",
    padding: "12px 16px",
    borderRadius: "18px 18px 4px 18px",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  assistantMessage: {
    display: "flex",
    justifyContent: "flex-start",
  },
  assistantBubble: {
    maxWidth: "100%",
    width: "100%",
  },
  componentCard: {
    background: "#1a1a1a",
    borderRadius: "12px",
    border: "1px solid #222",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #222",
    background: "#151515",
  },
  cardHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  componentBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    background: "#6c5ce722",
    color: "#6c5ce7",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  },
  componentName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#fff",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  cardBtn: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  codeBlock: {
    padding: "16px",
    maxHeight: "400px",
    overflowY: "auto" as const,
    background: "#0d0d0d",
  },
  code: {
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: "12px",
    lineHeight: 1.6,
    color: "#e0e0e0",
    whiteSpace: "pre-wrap" as const,
    margin: 0,
  },
  errorCard: {
    background: "#1a1a1a",
    borderRadius: "12px",
    border: "1px solid #fd79a833",
    padding: "16px",
  },
  errorText: {
    color: "#fd79a8",
    fontSize: "13px",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    whiteSpace: "pre-wrap" as const,
  },

  // Loading indicator
  loadingRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "24px",
  },
  loadingBubble: {
    padding: "16px 20px",
    borderRadius: "18px 18px 18px 4px",
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6c5ce7",
    animation: "pulse 1.4s ease-in-out infinite",
  },

  // Input area
  inputContainer: {
    padding: "16px 24px 24px",
    borderTop: "1px solid #1a1a1a",
    background: "#0d0d0d",
  },
  inputInner: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "24px",
    border: "1px solid #333",
    background: "#1a1a1a",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  inputWrapperFocused: {
    borderColor: "#6c5ce7",
    boxShadow: "0 0 0 2px rgba(108, 92, 231, 0.15)",
  },
  textarea: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "#e0e0e0",
    fontSize: "14px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: 1.5,
    resize: "none" as const,
    outline: "none",
    minHeight: "24px",
    maxHeight: "200px",
  },
  sendBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    background: "#333",
    cursor: "not-allowed",
  },
  inputHint: {
    textAlign: "center" as const,
    fontSize: "11px",
    color: "#555",
    marginTop: "8px",
  },

  // Modal
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    background: "#111",
    borderRadius: "16px",
    border: "1px solid #222",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column" as const,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #222",
  },
  modalTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
  },
  modalClose: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "#888",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "0",
  },

  // Tabs (for settings modal)
  tabs: {
    display: "flex",
    gap: "4px",
    padding: "0 20px",
    borderBottom: "1px solid #222",
    background: "#0d0d0d",
  },
  tab: {
    padding: "12px 16px",
    border: "none",
    borderBottom: "2px solid transparent",
    background: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: {
    color: "#6c5ce7",
    borderBottomColor: "#6c5ce7",
  },
  tabContent: {
    padding: "24px",
  },

  // Editor styles (preserved from original)
  label: {
    display: "block",
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  editorTextarea: {
    width: "100%",
    minHeight: "350px",
    padding: "16px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontSize: "13px",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    lineHeight: 1.6,
    resize: "vertical" as const,
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    alignItems: "center",
  },
  btnSave: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 12px rgba(108,92,231,0.3)",
  },
  btnReset: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "1px solid #333",
    background: "transparent",
    color: "#aaa",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  status: {
    fontSize: "13px",
    color: "#55efc4",
    marginLeft: "8px",
  },
  statusError: {
    fontSize: "13px",
    color: "#fd79a8",
    marginLeft: "8px",
  },
  // Few-shot card styles
  exList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  exCard: {
    background: "#0d0d0d",
    borderRadius: "10px",
    border: "1px solid #222",
    padding: "20px",
    transition: "border-color 0.2s ease",
  },
  exHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
  },
  exBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    background: "#6c5ce722",
    color: "#6c5ce7",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    whiteSpace: "nowrap" as const,
  },
  exDelete: {
    padding: "4px 10px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "transparent",
    color: "#888",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  exInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontSize: "13px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    outline: "none",
    marginBottom: "8px",
    transition: "border-color 0.2s ease",
  },
  exSmallTextarea: {
    width: "100%",
    minHeight: "120px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontSize: "12px",
    fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
    lineHeight: 1.5,
    resize: "vertical" as const,
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  exFieldLabel: {
    fontSize: "11px",
    color: "#666",
    marginBottom: "4px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  exField: {
    marginBottom: "10px",
  },
  addBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px dashed #444",
    background: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s ease",
    marginTop: "8px",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "#0a0a0a",
    color: "#e0e0e0",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
  },
  // Image capture styles
  dropzone: {
    border: "2px dashed #333",
    borderRadius: "12px",
    padding: "48px 24px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#0a0a0a",
    position: "relative" as const,
  },
  dropzoneActive: {
    border: "2px dashed #6c5ce7",
    background: "#6c5ce711",
    boxShadow: "0 0 30px rgba(108,92,231,0.1) inset",
  },
  dropIcon: {
    fontSize: "36px",
    marginBottom: "12px",
    display: "block",
    color: "#444",
  },
  dropText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.6,
  },
  dropAccent: {
    color: "#6c5ce7",
    fontWeight: 600,
  },
  urlRow: {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
  },
  imgGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },
  imgCard: {
    background: "#0d0d0d",
    borderRadius: "10px",
    border: "1px solid #222",
    overflow: "hidden",
    transition: "border-color 0.2s ease",
    position: "relative" as const,
  },
  imgPreview: {
    width: "100%",
    height: "160px",
    objectFit: "cover" as const,
    display: "block",
    background: "#000",
  },
  imgInfo: {
    padding: "10px 12px",
  },
  imgName: {
    fontSize: "12px",
    color: "#aaa",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginBottom: "4px",
  },
  imgMeta: {
    fontSize: "11px",
    color: "#555",
  },
  imgActions: {
    display: "flex",
    gap: "6px",
    marginTop: "8px",
  },
  imgBtn: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #333",
    background: "transparent",
    color: "#888",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center" as const,
  },
  imgBtnDanger: {
    flex: 1,
    padding: "6px 8px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "transparent",
    color: "#fd79a8",
    fontSize: "11px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center" as const,
  },
  emptyImages: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#444",
    fontSize: "14px",
  },
};

// Add keyframes for loading animation
const loadingKeyframes = `
@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`;

// ---------------------------------------------------------------------------
// System Prompt Editor
// ---------------------------------------------------------------------------

const SystemPromptEditor: React.FC = () => {
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState<{ msg: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prompts/system")
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content);
        setOriginal(d.content);
        setLoading(false);
      })
      .catch(() => {
        setStatus({ msg: "Failed to load system prompt", error: true });
        setLoading(false);
      });
  }, []);

  const save = useCallback(async () => {
    try {
      const res = await fetch("/api/prompts/system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setOriginal(content);
        setStatus({ msg: "Saved" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        const d = await res.json();
        setStatus({ msg: d.error || "Save failed", error: true });
      }
    } catch {
      setStatus({ msg: "Network error", error: true });
    }
  }, [content]);

  const dirty = content !== original;

  if (loading) return <div style={{ color: "#666", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <label style={styles.label}>
        System Prompt - tambo_agent/prompts/system_creative.txt
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          ...styles.editorTextarea,
          borderColor: dirty ? "#6c5ce7" : "#333",
        }}
        spellCheck={false}
      />
      <div style={styles.actions}>
        <button style={styles.btnSave} onClick={save} disabled={!dirty}>
          Save Changes
        </button>
        {dirty && (
          <button style={styles.btnReset} onClick={() => setContent(original)}>
            Discard
          </button>
        )}
        {status && (
          <span style={status.error ? styles.statusError : styles.status}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Few-Shot Example Card
// ---------------------------------------------------------------------------

interface ExCardProps {
  example: FewShotExample;
  index: number;
  onChange: (index: number, updated: FewShotExample) => void;
  onDelete: (index: number) => void;
}

const ExampleCard: React.FC<ExCardProps> = ({ example, index, onChange, onDelete }) => {
  const update = (field: keyof FewShotExample, value: string) => {
    onChange(index, { ...example, [field]: value });
  };

  return (
    <div style={styles.exCard}>
      <div style={styles.exHeader}>
        <span style={styles.exBadge}>{example.category}</span>
        <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#ddd" }}>
          {example.component_name || "Untitled"}
        </span>
        <button
          style={styles.exDelete}
          onClick={() => onDelete(index)}
          title="Remove example"
        >
          Remove
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={styles.exField}>
          <div style={styles.exFieldLabel}>Category</div>
          <select
            value={example.category}
            onChange={(e) => update("category", e.target.value)}
            style={styles.select}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={styles.exField}>
          <div style={styles.exFieldLabel}>Component Name</div>
          <input
            value={example.component_name}
            onChange={(e) => update("component_name", e.target.value)}
            style={styles.exInput}
            placeholder="PascalCase name"
          />
        </div>
      </div>

      <div style={styles.exField}>
        <div style={styles.exFieldLabel}>Prompt</div>
        <textarea
          value={example.prompt}
          onChange={(e) => update("prompt", e.target.value)}
          style={{ ...styles.exSmallTextarea, minHeight: "60px" }}
          placeholder="Natural-language description of the component..."
        />
      </div>

      <div style={styles.exField}>
        <div style={styles.exFieldLabel}>Output Snippet (TSX code)</div>
        <textarea
          value={example.output_snippet}
          onChange={(e) => update("output_snippet", e.target.value)}
          style={styles.exSmallTextarea}
          placeholder="Full TSX code example..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Few-Shot Examples Editor
// ---------------------------------------------------------------------------

const FewShotEditor: React.FC = () => {
  const [examples, setExamples] = useState<FewShotExample[]>([]);
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState<{ msg: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prompts/examples")
      .then((r) => r.json())
      .then((d: FewShotExample[]) => {
        setExamples(d);
        setOriginal(JSON.stringify(d, null, 2));
        setLoading(false);
      })
      .catch(() => {
        setStatus({ msg: "Failed to load examples", error: true });
        setLoading(false);
      });
  }, []);

  const handleChange = useCallback((index: number, updated: FewShotExample) => {
    setExamples((prev) => prev.map((e, i) => (i === index ? updated : e)));
  }, []);

  const handleDelete = useCallback((index: number) => {
    setExamples((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAdd = useCallback(() => {
    setExamples((prev) => [
      ...prev,
      {
        category: "3d-scenes",
        prompt: "",
        component_name: "NewComponent",
        output_snippet: "",
      },
    ]);
  }, []);

  const save = useCallback(async () => {
    try {
      const body = JSON.stringify(examples, null, 2);
      const res = await fetch("/api/prompts/examples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) {
        setOriginal(body);
        setStatus({ msg: "Saved" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        const d = await res.json();
        setStatus({ msg: d.error || "Save failed", error: true });
      }
    } catch {
      setStatus({ msg: "Network error", error: true });
    }
  }, [examples]);

  const dirty = JSON.stringify(examples, null, 2) !== original;

  if (loading) return <div style={{ color: "#666", padding: "40px" }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <label style={{ ...styles.label, marginBottom: 0 }}>
          Few-Shot Examples - tambo_agent/prompts/few_shot_examples.json
        </label>
        <span style={{ fontSize: "13px", color: "#666" }}>
          {examples.length} example{examples.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={styles.exList}>
        {examples.map((ex, i) => (
          <ExampleCard
            key={`${ex.component_name}-${i}`}
            example={ex}
            index={i}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <button style={styles.addBtn} onClick={handleAdd}>
        + Add Example
      </button>

      <div style={styles.actions}>
        <button style={styles.btnSave} onClick={save} disabled={!dirty}>
          Save Changes
        </button>
        {dirty && (
          <button
            style={styles.btnReset}
            onClick={() => {
              setExamples(JSON.parse(original));
            }}
          >
            Discard
          </button>
        )}
        {status && (
          <span style={status.error ? styles.statusError : styles.status}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Image Capture
// ---------------------------------------------------------------------------

interface CapturedImage {
  name: string;
  url: string;
  size: number;
  createdAt: string;
}

const ImageCapture: React.FC = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<{ msg: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const loadImages = useCallback(async () => {
    try {
      const res = await fetch("/api/captures");
      const data = await res.json();
      setImages(data);
    } catch {
      setStatus({ msg: "Failed to load captures", error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadImages(); }, [loadImages]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) uploadFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setStatus({ msg: "Uploading..." });
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch("/api/captures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: reader.result as string,
            filename: file.name,
          }),
        });
        if (res.ok) {
          setStatus({ msg: "Captured" });
          setTimeout(() => setStatus(null), 2000);
          loadImages();
        } else {
          const d = await res.json();
          setStatus({ msg: d.error || "Upload failed", error: true });
        }
      } catch {
        setStatus({ msg: "Upload failed", error: true });
      }
    };
    reader.readAsDataURL(file);
  }, [loadImages]);

  const fetchUrlImage = useCallback(async () => {
    if (!urlInput.trim()) return;
    setStatus({ msg: "Fetching image..." });
    try {
      const res = await fetch(urlInput);
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) {
        setStatus({ msg: "URL did not return an image", error: true });
        return;
      }
      const ext = blob.type.split("/")[1] || "png";
      const file = new File([blob], `url-capture.${ext}`, { type: blob.type });
      uploadFile(file);
      setUrlInput("");
    } catch {
      setStatus({ msg: "Could not fetch image from URL", error: true });
    }
  }, [urlInput, uploadFile]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image/")) {
        uploadFile(files[i]);
      }
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image/")) {
        uploadFile(files[i]);
      }
    }
    e.target.value = "";
  }, [uploadFile]);

  const deleteImage = useCallback(async (name: string) => {
    try {
      await fetch(`/api/captures/${encodeURIComponent(name)}`, { method: "DELETE" });
      loadImages();
    } catch {
      setStatus({ msg: "Delete failed", error: true });
    }
  }, [loadImages]);

  const copyUrl = useCallback((url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setStatus({ msg: "URL copied" });
    setTimeout(() => setStatus(null), 2000);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <label style={styles.label}>
        Reference Images - Capture screenshots, paste images, or import from URL
      </label>

      <div
        style={{
          ...styles.dropzone,
          ...(dragging ? styles.dropzoneActive : {}),
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <span style={styles.dropIcon}>
          {dragging ? "\u2B07" : "\u{1F5BC}"}
        </span>
        <div style={styles.dropText}>
          <span style={styles.dropAccent}>Click to upload</span>,
          drag and drop, or <span style={styles.dropAccent}>Ctrl+V</span> to paste
          <br />
          PNG, JPG, GIF, WebP, SVG
        </div>
      </div>

      <div style={styles.urlRow}>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUrlImage()}
          placeholder="Or paste an image URL and press Enter..."
          style={{ ...styles.exInput, flex: 1, marginBottom: 0 }}
        />
        <button
          style={styles.btnSave}
          onClick={fetchUrlImage}
          disabled={!urlInput.trim()}
        >
          Fetch
        </button>
      </div>

      {status && (
        <div style={{ marginTop: "12px" }}>
          <span style={status.error ? styles.statusError : styles.status}>
            {status.msg}
          </span>
        </div>
      )}

      {loading ? (
        <div style={styles.emptyImages}>Loading...</div>
      ) : images.length === 0 ? (
        <div style={styles.emptyImages}>
          No captured images yet. Upload or paste a reference image to get started.
        </div>
      ) : (
        <div style={styles.imgGrid}>
          {images.map((img) => (
            <div key={img.name} style={styles.imgCard}>
              <img
                src={img.url}
                alt={img.name}
                style={styles.imgPreview}
                loading="lazy"
              />
              <div style={styles.imgInfo}>
                <div style={styles.imgName} title={img.name}>{img.name}</div>
                <div style={styles.imgMeta}>
                  {formatSize(img.size)} &middot; {new Date(img.createdAt).toLocaleDateString()}
                </div>
                <div style={styles.imgActions}>
                  <button
                    style={styles.imgBtn}
                    onClick={() => copyUrl(img.url)}
                  >
                    Copy URL
                  </button>
                  <button
                    style={styles.imgBtnDanger}
                    onClick={() => deleteImage(img.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: "24px",
        padding: "16px 20px",
        background: "#0a0a0a",
        borderRadius: "8px",
        border: "1px solid #222",
        fontSize: "13px",
        color: "#666",
        lineHeight: 1.6,
      }}>
        <strong style={{ color: "#888" }}>How to use:</strong> Captured images are saved to{" "}
        <code style={{ color: "#6c5ce7", fontSize: "12px" }}>preview/public/captures/</code>.
        You can reference them in your prompts or use the --image flag with the CLI.
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Settings Modal
// ---------------------------------------------------------------------------

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<"system" | "examples" | "captures">("system");

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Settings</span>
          <button style={styles.modalClose} onClick={onClose}>
            x
          </button>
        </div>
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === "system" ? styles.tabActive : {}) }}
            onClick={() => setTab("system")}
          >
            System Prompt
          </button>
          <button
            style={{ ...styles.tab, ...(tab === "examples" ? styles.tabActive : {}) }}
            onClick={() => setTab("examples")}
          >
            Few-Shot Examples
          </button>
          <button
            style={{ ...styles.tab, ...(tab === "captures" ? styles.tabActive : {}) }}
            onClick={() => setTab("captures")}
          >
            Image Capture
          </button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.tabContent}>
            {tab === "system" && <SystemPromptEditor />}
            {tab === "examples" && <FewShotEditor />}
            {tab === "captures" && <ImageCapture />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Loading Indicator
// ---------------------------------------------------------------------------

const LoadingIndicator: React.FC = () => (
  <div style={styles.loadingRow}>
    <div style={styles.loadingBubble}>
      <div style={{ ...styles.loadingDot, animationDelay: "0s" }} />
      <div style={{ ...styles.loadingDot, animationDelay: "0.2s" }} />
      <div style={{ ...styles.loadingDot, animationDelay: "0.4s" }} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// User Message
// ---------------------------------------------------------------------------

interface UserMessageProps {
  content: string;
}

const UserMessage: React.FC<UserMessageProps> = ({ content }) => (
  <div style={styles.messageRow}>
    <div style={styles.userMessage}>
      <div style={styles.userBubble}>{content}</div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Assistant Message
// ---------------------------------------------------------------------------

interface AssistantMessageProps {
  message: Message;
  onCopy: () => void;
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = () => {
    if (message.metadata?.code) {
      navigator.clipboard.writeText(message.metadata.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy();
    }
  };

  if (message.metadata?.error) {
    return (
      <div style={styles.messageRow}>
        <div style={styles.assistantMessage}>
          <div style={styles.assistantBubble}>
            <div style={styles.errorCard}>
              <div style={styles.errorText}>{message.content}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.messageRow}>
      <div style={styles.assistantMessage}>
        <div style={styles.assistantBubble}>
          <div style={styles.componentCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardHeaderLeft}>
                {message.metadata?.category && (
                  <span style={styles.componentBadge}>{message.metadata.category}</span>
                )}
                <span style={styles.componentName}>
                  {message.metadata?.componentName || "Component"}
                </span>
              </div>
              <div style={styles.cardActions}>
                <button
                  style={styles.cardBtn}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Collapse" : "Expand"}
                </button>
                <button style={styles.cardBtn} onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
                {message.metadata?.componentName && (
                  <button
                    style={styles.cardBtn}
                    onClick={() => window.location.href = `/?component=${message.metadata?.componentName}`}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
            {expanded && message.metadata?.code && (
              <div style={styles.codeBlock}>
                <pre style={styles.code}>{message.metadata.code}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  onSelectPrompt: (prompt: string, category: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyTitle}>Component Generator</div>
    <div style={styles.emptySubtitle}>
      Describe a React component and I'll generate it with Three.js, GSAP, and modern styling.
    </div>
    <div style={styles.exampleChips}>
      {EXAMPLE_PROMPTS.map((ex) => (
        <button
          key={ex.text}
          style={styles.exampleChip}
          onClick={() => onSelectPrompt(ex.text, ex.category)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#6c5ce7";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#333";
            e.currentTarget.style.color = "#aaa";
          }}
        >
          {ex.text}
        </button>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main Chat Component
// ---------------------------------------------------------------------------

const PromptStudio: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState(() => {
    return localStorage.getItem("promptStudio.category") || "3d-scenes";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Persist category
  useEffect(() => {
    localStorage.setItem("promptStudio.category", category);
  }, [category]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const generateComponent = useCallback(async (prompt: string, cat: string) => {
    if (!prompt.trim() || isGenerating) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category: cat }),
      });

      const data: GenerateResponse = await res.json();

      if (data.ok && data.component) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Generated ${data.component.name}`,
          timestamp: new Date(),
          metadata: {
            componentName: data.component.name,
            category: data.component.category,
            file: data.component.file,
            code: data.component.code,
          },
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: data.error || data.details || "Generation failed",
          timestamp: new Date(),
          metadata: { error: true },
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Network error - make sure the dev server is running and LM Studio is available",
        timestamp: new Date(),
        metadata: { error: true },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const handleSubmit = useCallback(() => {
    generateComponent(input, category);
  }, [input, category, generateComponent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleSelectPrompt = useCallback((prompt: string, cat: string) => {
    setCategory(cat);
    generateComponent(prompt, cat);
  }, [generateComponent]);

  const canSend = input.trim().length > 0 && !isGenerating;

  return (
    <>
      <style>{loadingKeyframes}</style>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>Component Studio</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.categorySelect}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            style={styles.settingsBtn}
            onClick={() => setSettingsOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6c5ce7";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#333";
              e.currentTarget.style.color = "#888";
            }}
          >
            Settings
          </button>
        </header>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          <div style={styles.messagesInner}>
            {messages.length === 0 ? (
              <EmptyState onSelectPrompt={handleSelectPrompt} />
            ) : (
              <>
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <UserMessage key={msg.id} content={msg.content} />
                  ) : (
                    <AssistantMessage
                      key={msg.id}
                      message={msg}
                      onCopy={() => {}}
                    />
                  )
                )}
                {isGenerating && <LoadingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <div style={styles.inputInner}>
            <div
              style={{
                ...styles.inputWrapper,
                ...(inputFocused ? styles.inputWrapperFocused : {}),
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Describe a component..."
                style={styles.textarea}
                rows={1}
              />
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                style={{
                  ...styles.sendBtn,
                  ...(canSend ? {} : styles.sendBtnDisabled),
                }}
              >
                {isGenerating ? "..." : "\u2191"}
              </button>
            </div>
            <div style={styles.inputHint}>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default PromptStudio;
