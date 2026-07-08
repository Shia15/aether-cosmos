import { useEffect, useRef, useState, useCallback } from "react";
import { Music, Pause, Volume2 } from "lucide-react";

const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/aether-ambient.mp3`;
const LS_KEY = "aether.music.v1";
const TEAL = "#f5c84c";

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

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const saved = useRef<Saved>(loadSaved());

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(saved.current.volume);
  const [hover, setHover] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  const persist = useCallback((next: Partial<Saved>) => {
    const merged: Saved = {
      playing: next.playing ?? saved.current.playing,
      volume: next.volume ?? saved.current.volume,
    };
    saved.current = merged;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(merged));
    } catch {
      // ignore storage failures
    }
  }, []);

  const clearFade = useCallback(() => {
    if (fadeRef.current !== null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }
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
      const eased = k * (2 - k);
      el.volume = clamp(start + (target - start) * eased);
      if (k < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        el.volume = clamp(target);
        fadeRef.current = null;
        if (onDone) onDone();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, [clearFade]);

  const startPlayback = useCallback((): Promise<void> => {
    const el = audioRef.current;
    if (!el) return Promise.resolve();
    if (!el.paused) {
      setPlaying(true);
      setNeedsGesture(false);
      persist({ playing: true });
      return Promise.resolve();
    }
    el.volume = 0;
    return el.play().then(() => {
      setPlaying(true);
      setNeedsGesture(false);
      persist({ playing: true });
      fadeTo(saved.current.volume);
    }).catch(() => {
      setPlaying(false);
      setNeedsGesture(true);
    });
  }, [fadeTo, persist]);

  const stopPlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    fadeTo(0, () => {
      el.pause();
    });
    setPlaying(false);
    persist({ playing: false });
  }, [fadeTo, persist]);

  const toggle = useCallback(() => {
    if (playing) stopPlayback();
    else startPlayback().catch(() => {});
  }, [playing, startPlayback, stopPlayback]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return undefined;
    el.volume = 0;
    if (!saved.current.playing) return undefined;

    function removeGesture() {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    }
    function onFirst() {
      removeGesture();
      startPlayback().catch(() => {});
    }

    startPlayback().catch(() => {
      window.addEventListener("pointerdown", onFirst);
      window.addEventListener("keydown", onFirst);
    });

    return removeGesture;
  }, [startPlayback]);

  useEffect(() => () => clearFade(), [clearFade]);

  const onVolume = useCallback((v: number) => {
    setVolume(v);
    persist({ volume: v });
    const el = audioRef.current;
    if (el && playing) {
      clearFade();
      el.volume = v;
    }
  }, [persist, playing, clearFade]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "fixed",
        bottom: 66,
        right: 20,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexDirection: "row-reverse",
      }}
    >
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      <button
        onClick={toggle}
        title={playing ? "Pause ambient music" : "Play ambient music"}
        aria-label={playing ? "Pause ambient music" : "Play ambient music"}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 46,
          height: 46,
          borderRadius: "50%",
          cursor: "pointer",
          border: `1px solid ${playing ? TEAL : "#3a3220"}`,
          background: playing ? "rgba(245,200,76,0.12)" : "rgba(11,9,6,0.86)",
          color: playing ? TEAL : "#cfc3a4",
          backdropFilter: "blur(6px)",
          boxShadow: playing ? "0 0 18px rgba(245,200,76,0.35)" : "0 2px 10px rgba(0,0,0,0.4)",
          transition: "all 0.25s",
        }}
      >
        {needsGesture && !playing && (
          <span
            style={{
              position: "absolute",
              inset: -3,
              borderRadius: "50%",
              border: `1px solid ${TEAL}`,
              opacity: 0.6,
              animation: "aetherMusicPulse 1.8s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}
        {playing ? (
          <span style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 2.5,
                  borderRadius: 2,
                  background: TEAL,
                  height: 6,
                  animation: `aetherEq 900ms ease-in-out ${i * 140}ms infinite`,
                }}
              />
            ))}
          </span>
        ) : (
          <Music style={{ width: 18, height: 18 }} />
        )}
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflow: "hidden",
          maxWidth: hover ? 168 : 0,
          opacity: hover ? 1 : 0,
          paddingLeft: hover ? 12 : 0,
          paddingRight: hover ? 12 : 0,
          height: 38,
          borderRadius: 19,
          border: hover ? "1px solid #3a3220" : "1px solid transparent",
          background: "rgba(11,9,6,0.86)",
          backdropFilter: "blur(6px)",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          whiteSpace: "nowrap",
        }}
      >
        <Volume2 style={{ width: 15, height: 15, color: "#cfc3a4", flexShrink: 0 }} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          aria-label="Music volume"
          style={{ width: 96, accentColor: TEAL, cursor: "pointer" }}
        />
      </div>

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
