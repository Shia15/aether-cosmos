/*═══════════════════════════════════════════════════════════════════
  Image Upload — drag & drop images from your computer into AETHER
  Stored in Replit Object Storage (GCS), served via /api/storage/objects/
  Saved to localStorage vault so AI Image Nest picks them up.
═══════════════════════════════════════════════════════════════════*/
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Image as ImageIcon, X, CheckCircle, AlertCircle, Loader2, Trash2, ExternalLink, FolderOpen } from "lucide-react";
import { useLocation } from "wouter";

const VAULT_KEY = "aether.imagevault.v1";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

interface VaultImage {
  id: string;
  name: string;
  objectPath: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  tags?: string[];
}

function loadVault(): VaultImage[] {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]"); } catch { return []; }
}
function saveVault(v: VaultImage[]) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(v.slice(0, 500)));
}

interface UploadItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  objectPath?: string;
  url?: string;
}

async function requestUploadUrl(file: File): Promise<{ uploadURL: string; objectPath: string }> {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

async function uploadToGCS(uploadURL: string, file: File, onProgress: (p: number) => void): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`GCS ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}

const B = {
  bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.45)",
  line: "rgba(245,200,76,0.12)", lineHover: "rgba(245,200,76,0.35)",
  green: "#4ade80", red: "#fb7185", blue: "#60a5fa",
};

export default function ImageUploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [vault, setVault] = useState<VaultImage[]>(loadVault);
  const [dragging, setDragging] = useState(false);
  const [tab, setTab] = useState<"upload" | "library">("upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, nav] = useLocation();

  const addFiles = useCallback((files: File[]) => {
    const valid = files.filter(f => {
      if (!ACCEPTED.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });
    const newItems: UploadItem[] = valid.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      status: "pending",
      progress: 0,
    }));
    setItems(prev => [...newItems, ...prev]);
  }, []);

  const uploadAll = useCallback(async () => {
    setItems(prev => prev.map(it => it.status === "pending" ? { ...it, status: "uploading" } : it));
    const pending = items.filter(it => it.status === "pending");
    await Promise.all(pending.map(async (item) => {
      try {
        const { uploadURL, objectPath } = await requestUploadUrl(item.file);
        await uploadToGCS(uploadURL, item.file, (p) => {
          setItems(prev => prev.map(it => it.id === item.id ? { ...it, progress: p } : it));
        });
        const url = `/api/storage/objects/${objectPath.replace(/^\/objects\//, "")}`;
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: "done", progress: 100, objectPath, url } : it));
        const entry: VaultImage = {
          id: item.id, name: item.file.name, objectPath, url,
          size: item.file.size, type: item.file.type,
          uploadedAt: new Date().toISOString(),
        };
        setVault(prev => { const v = [entry, ...prev]; saveVault(v); return v; });
      } catch (err: any) {
        setItems(prev => prev.map(it => it.id === item.id ? { ...it, status: "error", error: String(err.message) } : it));
      }
    }));
  }, [items]);

  const uploadSingle = useCallback(async (id: string) => {
    const item = items.find(it => it.id === id);
    if (!item || item.status !== "pending") return;
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: "uploading" } : it));
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(item.file);
      await uploadToGCS(uploadURL, item.file, (p) => {
        setItems(prev => prev.map(it => it.id === id ? { ...it, progress: p } : it));
      });
      const url = `/api/storage/objects/${objectPath.replace(/^\/objects\//, "")}`;
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: "done", progress: 100, objectPath, url } : it));
      const entry: VaultImage = {
        id, name: item.file.name, objectPath, url,
        size: item.file.size, type: item.file.type,
        uploadedAt: new Date().toISOString(),
      };
      setVault(prev => { const v = [entry, ...prev]; saveVault(v); return v; });
    } catch (err: any) {
      setItems(prev => prev.map(it => it.id === id ? { ...it, status: "error", error: String(err.message) } : it));
    }
  }, [items]);

  const remove = (id: string) => {
    setItems(prev => { const it = prev.find(x => x.id === id); if (it) URL.revokeObjectURL(it.preview); return prev.filter(x => x.id !== id); });
  };

  const deleteVault = (id: string) => {
    setVault(prev => { const v = prev.filter(x => x.id !== id); saveVault(v); return v; });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const pendingCount = items.filter(it => it.status === "pending").length;
  const uploadingCount = items.filter(it => it.status === "uploading").length;

  useEffect(() => () => { items.forEach(it => URL.revokeObjectURL(it.preview)); }, []);

  const fmtSize = (b: number) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(0)} KB`;

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 16px", borderBottom: `1px solid ${B.line}`, background: "linear-gradient(180deg,rgba(245,200,76,0.06),transparent)" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: B.gold, marginBottom: 4 }}>Image Upload</div>
        <div style={{ fontSize: 12, color: B.dim }}>Upload images from your computer · stored in AETHER cloud · available in AI Image Nest</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${B.line}`, padding: "0 32px" }}>
        {(["upload", "library"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "12px 20px", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${B.gold}` : "2px solid transparent", color: tab === t ? B.gold : B.dim, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 400, textTransform: "capitalize" }}>
            {t === "upload" ? `Upload${pendingCount ? ` (${pendingCount} pending)` : ""}` : `Library (${vault.length})`}
          </button>
        ))}
        <button onClick={() => nav("/ai-image-nest")} style={{ marginLeft: "auto", padding: "12px 16px", background: "none", border: "none", color: B.dim, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
          <ExternalLink size={13} /> Open AI Image Nest
        </button>
      </div>

      <div style={{ padding: "24px 32px 80px" }}>
        {tab === "upload" && (
          <>
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? B.gold : B.lineHover}`, borderRadius: 14, padding: "48px 32px", textAlign: "center", cursor: "pointer", transition: "all .2s", background: dragging ? "rgba(245,200,76,0.05)" : "transparent", marginBottom: 20 }}
            >
              <Upload size={36} color={dragging ? B.gold : B.dim} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: dragging ? B.gold : B.ivory, marginBottom: 6 }}>
                {dragging ? "Drop images here" : "Drag & drop images here"}
              </div>
              <div style={{ fontSize: 12, color: B.dim, marginBottom: 16 }}>or click to browse · PNG, JPG, WebP, GIF, SVG · up to 20 MB each</div>
              <div style={{ display: "inline-block", padding: "8px 24px", background: "rgba(245,200,76,0.12)", border: `1px solid ${B.gold}44`, borderRadius: 8, color: B.gold, fontSize: 13, fontWeight: 600 }}>
                <FolderOpen size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />Browse Files
              </div>
              <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} multiple style={{ display: "none" }}
                onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
            </div>

            {/* Upload all button */}
            {pendingCount > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <button onClick={uploadAll} disabled={uploadingCount > 0}
                  style={{ padding: "10px 28px", background: B.gold, color: "#0b0906", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 14, cursor: uploadingCount > 0 ? "not-allowed" : "pointer", opacity: uploadingCount > 0 ? 0.6 : 1 }}>
                  {uploadingCount > 0 ? `Uploading…` : `Upload All (${pendingCount})`}
                </button>
              </div>
            )}

            {/* Queue */}
            {items.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                {items.map(item => (
                  <div key={item.id} style={{ background: B.panel, border: `1px solid ${B.line}`, borderRadius: 10, overflow: "hidden", position: "relative" }}>
                    <img src={item.preview} alt={item.file.name} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                    {/* Status overlay */}
                    {item.status === "uploading" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(11,9,6,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Loader2 size={24} color={B.gold} style={{ animation: "spin 1s linear infinite" }} />
                        <div style={{ fontSize: 12, color: B.gold }}>{item.progress}%</div>
                        <div style={{ width: "60%", height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                          <div style={{ width: `${item.progress}%`, height: "100%", background: B.gold, borderRadius: 2, transition: "width .2s" }} />
                        </div>
                      </div>
                    )}
                    {item.status === "done" && (
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <CheckCircle size={20} color={B.green} />
                      </div>
                    )}
                    {item.status === "error" && (
                      <div style={{ position: "absolute", inset: 0, background: "rgba(11,9,6,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, gap: 6 }}>
                        <AlertCircle size={20} color={B.red} />
                        <div style={{ fontSize: 11, color: B.red, textAlign: "center" }}>{item.error}</div>
                      </div>
                    )}
                    <div style={{ padding: "8px 10px" }}>
                      <div style={{ fontSize: 11, color: B.ivory, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{item.file.name}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: B.dim }}>{fmtSize(item.file.size)}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          {item.status === "pending" && (
                            <button onClick={() => uploadSingle(item.id)} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(245,200,76,0.15)", border: `1px solid ${B.gold}44`, borderRadius: 4, color: B.gold, cursor: "pointer" }}>Upload</button>
                          )}
                          <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: B.dim, padding: 2 }}>
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <div style={{ textAlign: "center", color: B.dim, fontSize: 13, marginTop: 32 }}>
                No images queued · drag some from your computer or click Browse
              </div>
            )}
          </>
        )}

        {tab === "library" && (
          <>
            <div style={{ fontSize: 12, color: B.dim, marginBottom: 16 }}>
              {vault.length} images stored · available across all AETHER pages
            </div>
            {vault.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: B.dim }}>
                <ImageIcon size={40} color={B.dim} style={{ marginBottom: 12 }} />
                <div>No images uploaded yet · switch to Upload tab to add some</div>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
              {vault.map(img => (
                <div key={img.id} style={{ background: B.panel, border: `1px solid ${B.line}`, borderRadius: 10, overflow: "hidden" }}>
                  <img src={img.url} alt={img.name}
                    style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div style={{ padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, color: B.ivory, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{img.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: B.dim }}>{fmtSize(img.size)}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <a href={img.url} target="_blank" rel="noreferrer" style={{ color: B.dim, display: "flex" }}><ExternalLink size={12} /></a>
                        <button onClick={() => deleteVault(img.id)} style={{ background: "none", border: "none", cursor: "pointer", color: B.red, padding: 2 }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: B.dim, marginTop: 3 }}>{new Date(img.uploadedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
