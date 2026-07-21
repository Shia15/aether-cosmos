import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BASE = import.meta.env.BASE_URL as string;
const IMAGE_INDEX_URL = `${BASE}image-index.json`;

// ── Google Photos album: Time Build Field Map ─────────────────────────────────
const GPHOTO_BASE = "https://lh3.googleusercontent.com/pw/";
const GPHOTO_IDS = [
  "AP1GczPN8JCYz6-b_NwZp7X-i3Sf8VzlSzPo2QSNzueA4O8_G_GjEeZyv0fs4C5kP5gW2v3o2-x3SQGM8vh3HLyq7Q4zXzW_tyybRdi9YVVOwWrt4Di13lxa",
  "AP1GczOLwn4KhTuq8O83iuQDM6oT5coixEwj1u_e4yx6FvRzY8nVRhREanPsAtU5Yq40qFVEIMI2_t9QRqLUghKf-Uy-UVqyzThwt5dhJV8n4cOo35snWMZ4",
  "AP1GczO-PCPvwdtMQn4T4N_ibcQhhJYjVuc1djoyMyK7N_6f8QouEGbjDPDrfKM1uEgru1Bb9ugFjWKMljWQJY6j4eyVnhc_6eiKgspEo-xTFSRPWcZwVGNk",
  "AP1GczM0FY0fOrnVU2SttB0TJhlxs21dlx8JjYc4YkMPn0zYZRuezofRiIjMiI3y6tzg_4v9MJKStvIyOBzy31xy5ow8iDs9FOVtoFnIbJH3NVqi6apWm80a",
  "AP1GczM_KuaYHTAdqBMjXdoT4NL7MFV2VZSIDzudHvM3g-_tBHP0t3rpZeCW22rzxOKlYgvAAggfhfo5TuzoQe8KfO_tn2l9FC8TspQPZT4yJbIsGuZThf1U",
  "AP1GczNlfLcKzKNmpJBYIMg2uHpetuCn6rotXXyDj5vCJ5NgwpuZFiUSBEVF99gHO1OZYlneJDLVoEI0dJPMZYhrC4dNd-6TNQuvslLTNjYRh2SPZRNTtRie",
  "AP1GczNViy9I_wQzPrOOboDycpBE7Igr7ta8ZS120-aNN_V4p6U4QWrykW9t-Yxw9nuE7t62bPRd4sBmTaWA18MEP66BPyFWMgiR9fB-t6l5utJG68bxBaTv",
  "AP1GczO4aJNxiBC-x53wrr-Wf-aKoaUQwrieLGg_QqokSj6W7ChniQsroR_oekw_iHwOnGJ5ewanonZkIhDtiTX1rc5NmYZ159E2V4Id7fxcArykGphTseaE",
  "AP1GczOJLoHm4JKL8S5BejX6MKgmadAEM8NMYjnpjydnZOP1lYkBmktS8LzQ9V88HHy2Z7UelMRUho90VuD_K7PdJxtJYemuPyQqs6bEaH2_uczeiDlkoK0l",
  "AP1GczOMawlsK_J0FF058BtN41ktp8V_uSb33m9CevvF5xh_3ihQv6ewhEPA3TcDpIYSqGzSz64rRFGCAuZMnYcuK6DBnzEppjNDi5Bt-IzlT1i-JpnIUifk",
  "AP1GczOZo73G8plsjKvMbmhQSZ0BqdYqaAcEnRCqYoCAGx01kEG7kfEzX6vHW5Engf0Rg6V4BYWtshcJmmIqJFIRC-5vu7rBBCJhqpdU2kTs8jjvQhm8p3X0",
  "AP1GczP_a-1caLcJWDQjF5OtsbB2jd86x9IidsEfa12GTay9S27bxwEIo6ATNcRzikxbP6b1vzTST13qiag5uXoR-LWSMFy_7ywQ8d29Anun5GLAuWit_BK3",
  "AP1GczPinieVSBx6ysqkb479-RmjFmrwpGeEM86m5Eup70Mn-tRaqPxDXQyMSCONXGv3DHT8lprRNcRoI5stn0cO1JQoNmSAAx7Wv5M-t_QZXdwQ3Lb-T4zJ",
  "AP1GczMAakFBXIe1ut66DbRPF3tuQGjOYTEtBtsofGg0hsemSttv1q3QaG3XT8w--bn0bruD78bHloJSxmNaaMkWIXBP26cfCmbuEbk2SN8D2ivgrn5hrups",
];

function gphotoBig(id: string): string {
  return `${GPHOTO_BASE}${id}=w1920-h1080-no`;
}
function gphotoThumb(id: string): string {
  return `${GPHOTO_BASE}${id}=w400-h400-no`;
}

// ── Image index entry ─────────────────────────────────────────────────────────
interface ImageEntry {
  file: string;
  dir: string;
  cat: string;
  video?: boolean;
  url?: string;
}

function imgSrc(it: ImageEntry): string {
  return it.url ?? `/api/storage/public-objects/${it.dir}/${it.file}`;
}

// ── Hero Carousel ─────────────────────────────────────────────────────────────
const INTERVAL_MS = 5200;
const FADE_MS = 900;

function HeroCarousel() {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = GPHOTO_IDS.length;

  const advance = (dir: 1 | -1) => {
    if (fading) return;
    setPrev(cur);
    setFading(true);
    const next = (cur + dir + n) % n;
    setTimeout(() => {
      setCur(next);
      setPrev(null);
      setFading(false);
    }, FADE_MS);
  };

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => advance(1), INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cur, paused, fading]);

  return (
    <div
      style={{ position: "relative", width: "100%", aspectRatio: "16/7", overflow: "hidden", background: "#0b0906", borderRadius: 0, cursor: "default" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Previous (fading out) */}
      {prev !== null && (
        <img
          key={`prev-${prev}`}
          src={gphotoBig(GPHOTO_IDS[prev])}
          alt=""
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", opacity: fading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            filter: "brightness(0.75)",
          }}
        />
      )}
      {/* Current */}
      <img
        key={`cur-${cur}`}
        src={gphotoBig(GPHOTO_IDS[cur])}
        alt={`AETHER Time Field · Frame ${cur + 1}`}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: fading ? 0.15 : 1,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
          filter: "brightness(0.78)",
        }}
      />
      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(11,9,6,0.85) 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(11,9,6,0.45) 0%, transparent 40%, transparent 60%, rgba(11,9,6,0.45) 100%)", pointerEvents: "none" }} />

      {/* Hero text */}
      <div style={{ position: "absolute", bottom: "2.2rem", left: "2.5rem", right: "2.5rem", pointerEvents: "none" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: "#f5c84c", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", marginBottom: 8, opacity: 0.85 }}>
          AETHER · Time Build Field Map · Frame {cur + 1} of {n}
        </div>
        <h2 style={{ margin: 0, fontSize: "clamp(1.4rem,3.5vw,2.5rem)", fontWeight: 700, color: "#f4f1ea", letterSpacing: "-0.02em", lineHeight: 1.15, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
          The Field Where AETHER Is Built
        </h2>
        <p style={{ margin: "0.55rem 0 0", color: "#e2d9c8", fontSize: "0.93rem", maxWidth: 540, lineHeight: 1.6, textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
          Every image is a coherence node — a moment in the crystallization of knowledge into architecture.
        </p>
      </div>

      {/* Arrows */}
      {["prev", "next"].map((d) => (
        <button
          key={d}
          onClick={() => advance(d === "prev" ? -1 : 1)}
          style={{
            position: "absolute", top: "50%", [d === "prev" ? "left" : "right"]: "1.2rem",
            transform: "translateY(-50%)", background: "rgba(245,200,76,0.12)",
            border: "1px solid rgba(245,200,76,0.3)", borderRadius: "50%",
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#f5c84c", cursor: "pointer", fontSize: 18, transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,200,76,0.28)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,200,76,0.12)")}
        >
          {d === "prev" ? "‹" : "›"}
        </button>
      ))}

      {/* Dot indicators */}
      <div style={{ position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {GPHOTO_IDS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPrev(cur); setFading(true); setTimeout(() => { setCur(i); setPrev(null); setFading(false); }, FADE_MS); }}
            style={{
              width: i === cur ? 22 : 7, height: 7, borderRadius: 4, border: "none",
              background: i === cur ? "#f5c84c" : "rgba(244,241,234,0.35)",
              cursor: "pointer", padding: 0,
              transition: "width 0.35s ease, background 0.25s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Thumbnail Strip (Google Photos) ──────────────────────────────────────────
function ThumbStrip() {
  return (
    <div style={{ padding: "1.5rem 0 0.5rem" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "#f5c84c", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", padding: "0 2rem 0.75rem", opacity: 0.75 }}>
        All {GPHOTO_IDS.length} frames · Google Photos album
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 2rem 0.5rem", scrollbarWidth: "thin", scrollbarColor: "#f5c84c22 transparent" }}>
        {GPHOTO_IDS.map((id, i) => (
          <a key={id} href={`https://photos.app.goo.gl/FSaANFbuXUA3dwow8`} target="_blank" rel="noreferrer" style={{ flexShrink: 0, display: "block" }}>
            <img
              src={gphotoThumb(id)}
              alt={`Field frame ${i + 1}`}
              loading="lazy"
              style={{ width: 110, height: 74, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(245,200,76,0.18)", display: "block", transition: "transform 0.2s, border-color 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; (e.currentTarget as HTMLImageElement).style.borderColor = "rgba(245,200,76,0.6)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; (e.currentTarget as HTMLImageElement).style.borderColor = "rgba(245,200,76,0.18)"; }}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Infinite marquee ribbon of all AETHER images ───────────────────────────────
function AetherRibbon({ entries }: { entries: ImageEntry[] }) {
  const items = entries.filter((e) => !e.video).slice(0, 120);
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <div style={{ overflow: "hidden", padding: "1.8rem 0 0.5rem" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "#f5c84c", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", padding: "0 2rem 0.85rem", opacity: 0.75 }}>
        AETHER Visual Library · {entries.length} assets · Streaming
      </div>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            display: "flex", gap: 8, width: "max-content",
            animation: "ribbon-scroll 90s linear infinite",
          }}
        >
          {doubled.map((it, i) => (
            <div
              key={`${it.dir}-${it.file}-${i}`}
              style={{ flexShrink: 0, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "#0f0c09" }}
              title={`${it.cat} · ${it.file}`}
            >
              <img
                src={imgSrc(it)}
                alt={it.file}
                loading="lazy"
                style={{ width: 90, height: 60, objectFit: "cover", display: "block", opacity: 0.88 }}
              />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 60, background: "linear-gradient(to right, #0b0906, transparent)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 60, background: "linear-gradient(to left, #0b0906, transparent)", pointerEvents: "none" }} />
      </div>
      <style>{`@keyframes ribbon-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ── Full masonry-style gallery ─────────────────────────────────────────────────
interface GallerySection {
  label: string;
  items: ImageEntry[];
}

function MasonryGallery({ entries }: { entries: ImageEntry[] }) {
  const [filter, setFilter] = useState<"all" | "gpt_imgs" | "linkedin_imgs">("all");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const visible = entries.filter((e) => !e.video && (filter === "all" || e.dir === filter));

  const sections: GallerySection[] = [];
  const catMap = new Map<string, ImageEntry[]>();
  for (const it of visible) {
    const key = it.cat || "uncategorized";
    if (!catMap.has(key)) catMap.set(key, []);
    catMap.get(key)!.push(it);
  }
  catMap.forEach((items, label) => sections.push({ label, items }));
  sections.sort((a, b) => b.items.length - a.items.length);

  return (
    <div style={{ padding: "1.8rem 2rem 3rem" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "#f5c84c", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: "1.2rem", opacity: 0.75 }}>
        Complete AETHER Image Archive · {visible.length} images
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.8rem", flexWrap: "wrap" }}>
        {(["all", "gpt_imgs", "linkedin_imgs"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", borderRadius: 20, fontSize: "0.82rem", cursor: "pointer",
              fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em",
              background: filter === f ? "#f5c84c" : "rgba(245,200,76,0.08)",
              color: filter === f ? "#0b0906" : "#f5c84c",
              border: `1px solid ${filter === f ? "#f5c84c" : "rgba(245,200,76,0.25)"}`,
              transition: "all 0.18s",
            }}
          >
            {f === "all" ? `All (${entries.filter(e => !e.video).length})` : f === "gpt_imgs" ? `GPT Images (${entries.filter(e => e.dir === "gpt_imgs" && !e.video).length})` : `LinkedIn (${entries.filter(e => e.dir === "linkedin_imgs" && !e.video).length})`}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sections.map((sec) => (
        <div key={sec.label} style={{ marginBottom: "2.2rem" }}>
          <div style={{ fontSize: "0.75rem", letterSpacing: "0.25em", color: "#a78bfa", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: "0.75rem", opacity: 0.85 }}>
            {sec.label} · {sec.items.length}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
            {sec.items.map((it) => (
              <div
                key={`${it.dir}-${it.file}`}
                onClick={() => setLightbox(imgSrc(it))}
                style={{ borderRadius: 7, overflow: "hidden", cursor: "zoom-in", background: "#0f0c09", border: "1px solid rgba(255,255,255,0.06)", aspectRatio: "4/3" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,200,76,0.4)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                title={it.file}
              >
                <img src={imgSrc(it)} alt={it.file} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.9 }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(11,9,6,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
        >
          <img src={lightbox} alt="" style={{ maxWidth: "92vw", maxHeight: "90vh", borderRadius: 10, boxShadow: "0 8px 60px rgba(0,0,0,0.8)", border: "1px solid rgba(245,200,76,0.2)" }} />
          <button onClick={() => setLightbox(null)} style={{ position: "fixed", top: 20, right: 24, background: "rgba(245,200,76,0.12)", border: "1px solid rgba(245,200,76,0.3)", color: "#f5c84c", borderRadius: "50%", width: 38, height: 38, fontSize: 18, cursor: "pointer" }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function TimeFieldMap() {
  const [entries, setEntries] = useState<ImageEntry[]>([]);

  useEffect(() => {
    fetch(IMAGE_INDEX_URL)
      .then((r) => r.json())
      .then((data: ImageEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  return (
    <div style={{ background: "#0b0906", minHeight: "100vh", color: "#f4f1ea" }}>
      {/* Header */}
      <div style={{ padding: "2rem 2rem 0.5rem", borderBottom: "1px solid rgba(245,200,76,0.1)" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.38em", color: "#f5c84c", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8, opacity: 0.8 }}>
          AETHER · Visual Intelligence Archive
        </div>
        <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, letterSpacing: "-0.03em", color: "#f4f1ea" }}>
          Time Build Field Map
        </h1>
        <p style={{ color: "#c9bfa8", fontSize: "0.95rem", margin: "0 0 1rem", maxWidth: 680, lineHeight: 1.65 }}>
          A living carousel of all images that constitute the AETHER knowledge field — from the Time Build album through the complete AI-generated visual library. The field updates naturally as new frames are added.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingBottom: "1rem" }}>
          {[
            { label: "14 Field Frames", sub: "Google Photos · Time Build" },
            { label: `${entries.filter(e => !e.video).length || 462} Archive Images`, sub: "GPT + LinkedIn assets" },
            { label: "Auto-Updating", sub: "Crossfade · 5.2s interval" },
            { label: "Click any image", sub: "Full-size lightbox" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(245,200,76,0.06)", border: "1px solid rgba(245,200,76,0.15)", borderRadius: 8, padding: "0.5rem 0.9rem" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f5c84c" }}>{s.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#8a7d6a", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero carousel */}
      <HeroCarousel />

      {/* Thumbnail strip */}
      <ThumbStrip />

      {/* Divider */}
      <div style={{ margin: "1.8rem 2rem 0", height: 1, background: "linear-gradient(to right, transparent, rgba(245,200,76,0.25), transparent)" }} />

      {/* Streaming ribbon of all AETHER assets */}
      <AetherRibbon entries={entries} />

      {/* Divider */}
      <div style={{ margin: "1rem 2rem 0", height: 1, background: "linear-gradient(to right, transparent, rgba(245,200,76,0.15), transparent)" }} />

      {/* Full gallery */}
      <MasonryGallery entries={entries} />

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: "0.8rem", color: "#6b6055", fontFamily: "'DM Mono',monospace" }}>
          AETHER · Time Build Field Map · {new Date().getFullYear()}
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link to="/search" style={{ color: "#f5c84c", fontSize: "0.82rem", textDecoration: "none", opacity: 0.7 }}>
            Semantic Search →
          </Link>
          <Link to="/knowledge-map" style={{ color: "#f5c84c", fontSize: "0.82rem", textDecoration: "none", opacity: 0.7 }}>
            Knowledge Map →
          </Link>
          <a href="https://photos.app.goo.gl/FSaANFbuXUA3dwow8" target="_blank" rel="noreferrer" style={{ color: "#f5c84c", fontSize: "0.82rem", textDecoration: "none", opacity: 0.7 }}>
            Google Photos Album ↗
          </a>
        </div>
      </div>
    </div>
  );
}
