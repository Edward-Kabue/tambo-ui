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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s: Record<string, React.CSSProperties> = {
  root: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "24px",
  },
  tab: {
    padding: "10px 20px",
    borderRadius: "8px 8px 0 0",
    border: "1px solid #333",
    borderBottom: "none",
    background: "transparent",
    color: "#888",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  tabActive: {
    padding: "10px 20px",
    borderRadius: "8px 8px 0 0",
    border: "1px solid #6c5ce7",
    borderBottom: "none",
    background: "#6c5ce722",
    color: "#6c5ce7",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  panel: {
    background: "#111",
    borderRadius: "0 12px 12px 12px",
    border: "1px solid #222",
    padding: "24px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  textarea: {
    width: "100%",
    minHeight: "420px",
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
  // --- Few-shot card styles ---
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
};

const CATEGORIES = [
  "3d-scenes",
  "scroll-animations",
  "micro-interactions",
  "shader-backgrounds",
  "page-transitions",
];

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
      <label style={s.label}>
        System Prompt — tambo_agent/prompts/system_creative.txt
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          ...s.textarea,
          borderColor: dirty ? "#6c5ce7" : "#333",
        }}
        spellCheck={false}
      />
      <div style={s.actions}>
        <button style={s.btnSave} onClick={save} disabled={!dirty}>
          Save Changes
        </button>
        {dirty && (
          <button style={s.btnReset} onClick={() => setContent(original)}>
            Discard
          </button>
        )}
        {status && (
          <span style={status.error ? s.statusError : s.status}>
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
    <div style={s.exCard}>
      <div style={s.exHeader}>
        <span style={s.exBadge}>{example.category}</span>
        <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#ddd" }}>
          {example.component_name || "Untitled"}
        </span>
        <button
          style={s.exDelete}
          onClick={() => onDelete(index)}
          title="Remove example"
        >
          Remove
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={s.exField}>
          <div style={s.exFieldLabel}>Category</div>
          <select
            value={example.category}
            onChange={(e) => update("category", e.target.value)}
            style={s.select}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={s.exField}>
          <div style={s.exFieldLabel}>Component Name</div>
          <input
            value={example.component_name}
            onChange={(e) => update("component_name", e.target.value)}
            style={s.exInput}
            placeholder="PascalCase name"
          />
        </div>
      </div>

      <div style={s.exField}>
        <div style={s.exFieldLabel}>Prompt</div>
        <textarea
          value={example.prompt}
          onChange={(e) => update("prompt", e.target.value)}
          style={{ ...s.exSmallTextarea, minHeight: "60px" }}
          placeholder="Natural-language description of the component..."
        />
      </div>

      <div style={s.exField}>
        <div style={s.exFieldLabel}>Output Snippet (TSX code)</div>
        <textarea
          value={example.output_snippet}
          onChange={(e) => update("output_snippet", e.target.value)}
          style={s.exSmallTextarea}
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
        <label style={{ ...s.label, marginBottom: 0 }}>
          Few-Shot Examples — tambo_agent/prompts/few_shot_examples.json
        </label>
        <span style={{ fontSize: "13px", color: "#666" }}>
          {examples.length} example{examples.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={s.exList}>
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

      <button style={s.addBtn} onClick={handleAdd}>
        + Add Example
      </button>

      <div style={s.actions}>
        <button style={s.btnSave} onClick={save} disabled={!dirty}>
          Save Changes
        </button>
        {dirty && (
          <button
            style={s.btnReset}
            onClick={() => {
              setExamples(JSON.parse(original));
            }}
          >
            Discard
          </button>
        )}
        {status && (
          <span style={status.error ? s.statusError : s.status}>
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

const imgStyles: Record<string, React.CSSProperties> = {
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
  grid: {
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
  emptyState: {
    padding: "40px",
    textAlign: "center" as const,
    color: "#444",
    fontSize: "14px",
  },
};

const ImageCapture: React.FC = () => {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<{ msg: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  // Load existing captures
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

  // Listen for paste events globally
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
      <label style={s.label}>
        Reference Images — Capture screenshots, paste images, or import from URL
      </label>

      {/* Drop zone */}
      <div
        style={{
          ...imgStyles.dropzone,
          ...(dragging ? imgStyles.dropzoneActive : {}),
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
        <span style={imgStyles.dropIcon}>
          {dragging ? "\u2B07" : "\u{1F5BC}"}
        </span>
        <div style={imgStyles.dropText}>
          <span style={imgStyles.dropAccent}>Click to upload</span>,
          drag and drop, or <span style={imgStyles.dropAccent}>Ctrl+V</span> to paste
          <br />
          PNG, JPG, GIF, WebP, SVG
        </div>
      </div>

      {/* URL import */}
      <div style={imgStyles.urlRow}>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUrlImage()}
          placeholder="Or paste an image URL and press Enter..."
          style={{ ...s.exInput, flex: 1, marginBottom: 0 }}
        />
        <button
          style={s.btnSave}
          onClick={fetchUrlImage}
          disabled={!urlInput.trim()}
        >
          Fetch
        </button>
      </div>

      {/* Status */}
      {status && (
        <div style={{ marginTop: "12px" }}>
          <span style={status.error ? s.statusError : s.status}>
            {status.msg}
          </span>
        </div>
      )}

      {/* Image grid */}
      {loading ? (
        <div style={imgStyles.emptyState}>Loading...</div>
      ) : images.length === 0 ? (
        <div style={imgStyles.emptyState}>
          No captured images yet. Upload or paste a reference image to get started.
        </div>
      ) : (
        <div style={imgStyles.grid}>
          {images.map((img) => (
            <div key={img.name} style={imgStyles.imgCard}>
              <img
                src={img.url}
                alt={img.name}
                style={imgStyles.imgPreview}
                loading="lazy"
              />
              <div style={imgStyles.imgInfo}>
                <div style={imgStyles.imgName} title={img.name}>{img.name}</div>
                <div style={imgStyles.imgMeta}>
                  {formatSize(img.size)} &middot; {new Date(img.createdAt).toLocaleDateString()}
                </div>
                <div style={imgStyles.imgActions}>
                  <button
                    style={imgStyles.imgBtn}
                    onClick={() => copyUrl(img.url)}
                  >
                    Copy URL
                  </button>
                  <button
                    style={imgStyles.imgBtnDanger}
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

      {/* Usage hint */}
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
        Copy the URL and pass it to the generator:
        <pre style={{
          marginTop: "8px",
          padding: "10px 12px",
          background: "#111",
          borderRadius: "6px",
          color: "#aaa",
          fontSize: "12px",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          overflow: "auto",
        }}>
{`python scripts/generate.py "component description" \\
  --category 3d-scenes --image <captured-url>`}
        </pre>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Prompt Studio (main export)
// ---------------------------------------------------------------------------

const PromptStudio: React.FC = () => {
  const [tab, setTab] = useState<"system" | "examples" | "captures">("system");

  return (
    <div style={s.root}>
      <div style={s.tabs}>
        <button
          style={tab === "system" ? s.tabActive : s.tab}
          onClick={() => setTab("system")}
        >
          System Prompt
        </button>
        <button
          style={tab === "examples" ? s.tabActive : s.tab}
          onClick={() => setTab("examples")}
        >
          Few-Shot Examples
        </button>
        <button
          style={tab === "captures" ? s.tabActive : s.tab}
          onClick={() => setTab("captures")}
        >
          Image Capture
        </button>
      </div>
      <div style={s.panel}>
        {tab === "system" && <SystemPromptEditor />}
        {tab === "examples" && <FewShotEditor />}
        {tab === "captures" && <ImageCapture />}
      </div>
    </div>
  );
};

export default PromptStudio;
