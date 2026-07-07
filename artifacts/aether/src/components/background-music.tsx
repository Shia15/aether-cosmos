import { useEffect, useRef, useState, useCallback } from "react";
import { Music, Volume2, Headphones } from "lucide-react";

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/aether-ambient.mp3`;
const LS_KEY = "aether.music.v1";
const TEAL = "#2ef0d8";
const GOLD = "#f0b429";

type Saved = { playing: boolean; volume: number };

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { playing: true, volume: 0.45 };
    const p = JSON.parse(raw);
    const volume = typeof p.volume === "number" && isFinite(p.volume) ? Math.min(1, Math.max(0, p.volume)) : 0.45;
    const playing = typeof p.playing === "boolean" ? p.playing : true;
    return { playing, volume };
  } catch {
    return { playing: true, volume: 0.45 };
  }
}

function getPageText(): string {
  const bar = document.querySelector("[data-aether-bar]");
  const excluded = new Set<Node>(bar ? [bar] : []);

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const el = node.parentElement;
        if (!el) return NodeFilter.FILTER_REJECT;
        const tag = el.tagName.toLowerCase();
        if (["script", "style", "noscript"].includes(tag)) return NodeFilter.FILTER_REJECT;
        let cur: Element | null = el;
        while (cur) {
          if (excluded.has(cur)) return NodeFilter.FILTER_REJECT;
          if (cur.tagName === "NAV" || cur.getAttribute("role") === "navigation") return NodeFilter.FILTER_REJECT;
          if (cur.getAttribute("data-aether-bar") != null) return NodeFilter.FILTER_REJECT;
          cur = cur.parentElement;
        }
        const cs = window.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return NodeFilter.FILTER_REJECT;
        const t = node.textContent?.trim() ?? "";
        if (t.length < 3) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  const chunks: string[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n.textContent?.trim() ?? "";
    if (t) chunks.push(t);
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const saved = useRef<Saved>(loadSaved());

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(saved.current.volume);
  const [hover, setHover] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const persist = useCallback((next: Partial<Saved>) => {
    const merged: Saved = {
      playing: next.playing ?? saved.current.playing,
      volume: next.volume ?? saved.current.volume,
    };
    saved.current = merged;
    try { localStorage.setItem(LS_KEY, JSON.stringify(merged)); } catch { /* ignore */ }
  }, []);

  const clearFade = useCallback(() => {
    if (fadeRef.current !== null) { cancelAnimationFrame(fadeRef.current); fadeRef.current = null; }
  }, []);

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const el = audioRef.current;
    if (!el) return;
    clearFade();
    const start = el.volume;
    const t0 = performance.now();
    const dur = 1600;
    const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      el.volume = clamp(start + (target - start) * k * (2 - k));
      if (k < 1) { fadeRef.current = requestAnimationFrame(step); }
      else { el.volume = clamp(target); fadeRef.current = null; if (onDone) onDone(); }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, [clearFade]);

  const startPlayback = useCallback((): Promise<void> => {
    const el = audioRef.current;
    if (!el) return Promise.resolve();
    if (!el.paused) { setPlaying(true); setNeedsGesture(false); persist({ playing: true }); return Promise.resolve(); }
    el.volume = 0;
    return el.play().then(() => {
      setPlaying(true); setNeedsGesture(false); persist({ playing: true }); fadeTo(saved.current.volume);
    }).catch(() => { setPlaying(false); setNeedsGesture(true); });
  }, [fadeTo, persist]);

  const stopPlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    fadeTo(0, () => { el.pause(); });
    setPlaying(false);
    persist({ playing: false });
  }, [fadeTo, persist]);

  const toggle = useCallback(() => {
    if (playing) stopPlayback(); else startPlayback().catch(() => {});
  }, [playing, startPlayback, stopPlayback]);

  const toggleReadAloud = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = getPageText();
    if (!text) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.88;
    utt.pitch = 1.05;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }, [speaking]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;
    el.volume = 0;
    if (!saved.current.playing) return undefined;

    function removeGesture() {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    }
    function onFirst() { removeGesture(); startPlayback().catch(() => {}); }

    startPlayback().catch(() => {
      window.addEventListener("pointerdown", onFirst);
      window.addEventListener("keydown", onFirst);
    });
    return removeGesture;
  }, [startPlayback]);

  useEffect(() => () => clearFade(), [clearFade]);
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    persist({ volume: v });
    const el = audioRef.current;
    if (el && playing) { clearFade(); el.volume = v; }
  }, [persist, playing, clearFade]);

  return (
    <div
      data-aether-bar
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "fixed", bottom: 66, right: 20, zIndex: 9998, display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse" }}
    >
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      {/* ── Music toggle ── */}
      <button
        onClick={toggle}
        title={playing ? "Pause ambient music" : "Play ambient music"}
        aria-label={playing ? "Pause ambient music" : "Play ambient music"}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
          border: `1px solid ${playing ? TEAL : "#1a3040"}`,
          background: playing ? "rgba(46,240,216,0.12)" : "rgba(4,6,14,0.86)",
          color: playing ? TEAL : "#8fb3c8",
          backdropFilter: "blur(6px)",
          boxShadow: playing ? "0 0 18px rgba(46,240,216,0.35)" : "0 2px 10px rgba(0,0,0,0.4)",
          transition: "all 0.25s",
        }}
      >
        {needsGesture && !playing && (
          <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1px solid ${TEAL}`, opacity: 0.6, animation: "aetherMusicPulse 1.8s ease-out infinite", pointerEvents: "none" }} />
        )}
        {playing ? (
          <span style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ display: "block", width: 2.5, borderRadius: 2, background: TEAL, height: 6, animation: `aetherEq 900ms ease-in-out ${i * 140}ms infinite` }} />
            ))}
          </span>
        ) : (
          <Music style={{ width: 18, height: 18 }} />
        )}
      </button>

      {/* ── Volume slider (hover reveal) ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, overflow: "hidden",
        maxWidth: hover ? 168 : 0, opacity: hover ? 1 : 0,
        paddingLeft: hover ? 12 : 0, paddingRight: hover ? 12 : 0,
        height: 38, borderRadius: 19,
        border: hover ? "1px solid #1a3040" : "1px solid transparent",
        background: "rgba(4,6,14,0.86)", backdropFilter: "blur(6px)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", whiteSpace: "nowrap",
      }}>
        <Volume2 style={{ width: 15, height: 15, color: "#8fb3c8", flexShrink: 0 }} />
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          aria-label="Music volume"
          style={{ width: 96, accentColor: TEAL, cursor: "pointer" }}
        />
      </div>

      {/* ── Read-aloud button ── */}
      <button
        onClick={toggleReadAloud}
        title={speaking ? "Stop reading" : "Read page aloud"}
        aria-label={speaking ? "Stop reading" : "Read page aloud"}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
          border: `1px solid ${speaking ? GOLD : "#1a3040"}`,
          background: speaking ? "rgba(240,180,41,0.12)" : "rgba(4,6,14,0.86)",
          color: speaking ? GOLD : "#8fb3c8",
          backdropFilter: "blur(6px)",
          boxShadow: speaking ? "0 0 18px rgba(240,180,41,0.35)" : "0 2px 10px rgba(0,0,0,0.4)",
          transition: "all 0.25s",
        }}
      >
        {speaking && (
          <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1px solid ${GOLD}`, opacity: 0.5, animation: "aetherMusicPulse 1.4s ease-out infinite", pointerEvents: "none" }} />
        )}
        {speaking ? (
          <span style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 16 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ display: "block", width: 2, borderRadius: 2, background: GOLD, height: 5, animation: `aetherEq 700ms ease-in-out ${i * 110}ms infinite` }} />
            ))}
          </span>
        ) : (
          <Headphones style={{ width: 18, height: 18 }} />
        )}
      </button>

      <style>{`
        @keyframes aetherEq {
          0%, 100% { height: 5px; }
          50% { height: 15px; }
        }
        @keyframes aetherMusicPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
