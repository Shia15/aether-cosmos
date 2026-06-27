import React, { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────── */
const BG    = "#04060e";
const GOLD  = "#c8a030";
const QUANT = "#00ffe0";
const DIM   = "#2a4060";
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── module-level types ───────────── */
interface LiveCursor {
  id: string; nx: number; ny: number; color: string; label: string;
}

interface TrailPoint {
  x: number; y: number; ts: number;
}

/* ── sunset color interpolation ────
   age: 0 = head (fresh), 1 = tail (old)         */
function sunsetRgba(age: number, opacity: number): string {
  const stops: [number,number,number][] = [
    [1.00, 0.88, 0.00], // gold
    [1.00, 0.45, 0.00], // orange
    [1.00, 0.04, 0.28], // red-pink
    [0.60, 0.00, 0.80], // violet
    [0.10, 0.00, 0.20], // deep purple
  ];
  const n = stops.length - 1;
  const p = Math.min(age, 0.9999) * n;
  const i = Math.floor(p);
  const t = p - i;
  const [r1,g1,b1] = stops[i];
  const [r2,g2,b2] = stops[i + 1];
  const r = Math.round((r1 + (r2-r1)*t) * 255);
  const g = Math.round((g1 + (g2-g1)*t) * 255);
  const b = Math.round((b1 + (b2-b1)*t) * 255);
  return `rgba(${r},${g},${b},${opacity.toFixed(3)})`;
}

/* ── deterministic scatter ────────── */
function scatter(idx: number, seed: number): [number,number] {
  const a = Math.sin(idx * 1.2345 + seed * 0.001) * 6;
  const b = Math.cos(idx * 0.9876 + seed * 0.002) * 6;
  return [a, b];
}

/* ── generate or recall session ID ─ */
function getSessionId(): string {
  const key = "aether.live.uid";
  let id = localStorage.getItem(key);
  if (!id) {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes).map(b => b.toString(16).padStart(2,"0")).join("").toUpperCase();
    localStorage.setItem(key, id);
  }
  return id;
}

/* ═══════════════════════════════════════════════
   CANVAS COMPONENT
   ═══════════════════════════════════════════════ */
function LiveCursorsCanvas({ ownId }: { ownId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const cursorsRef = useRef<LiveCursor[]>([]);
  const trailsRef  = useRef<Map<string, TrailPoint[]>>(new Map());
  const ownPos     = useRef<{ x: number; y: number } | null>(null);
  const sendTimer  = useRef<number>(0);
  const pollTimer  = useRef<number>(0);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;

    /* -- resize canvas to parent ---- */
    function resize() {
      const parent = cv!.parentElement;
      if (!parent) return;
      cv!.width  = parent.clientWidth;
      cv!.height = parent.clientHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv.parentElement!);

    /* -- send cursor position -------- */
    async function sendCursor(nx: number, ny: number) {
      try {
        await fetch("/api/live/cursor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ownId, nx, ny, label: ownId.slice(0,6) }),
        });
      } catch { /* ignore */ }
    }

    /* -- poll all cursors ------------ */
    async function poll() {
      try {
        const res  = await fetch("/api/live/cursors");
        const json = await res.json() as { cursors: LiveCursor[] };
        cursorsRef.current = json.cursors ?? [];
      } catch { /* ignore */ }
    }

    /* -- mousemove ------------------- */
    function onMouseMove(e: MouseEvent) {
      const rect = cv!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = x / rect.width;
      const ny = y / rect.height;
      ownPos.current = { x, y };
      // throttle send to every 80ms
      const now = Date.now();
      if (now - sendTimer.current > 80) {
        sendTimer.current = now;
        sendCursor(nx, ny);
      }
    }
    cv.addEventListener("mousemove", onMouseMove);
    // also track global mouse
    function onGlobalMove(e: MouseEvent) {
      const rect = cv!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      ownPos.current = { x, y };
    }
    window.addEventListener("mousemove", onGlobalMove);

    /* -- start polling --------------- */
    poll();
    const pollId = setInterval(() => {
      pollTimer.current++;
      poll();
    }, 100);

    /* -- render loop ----------------- */
    function draw() {
      const W = cv!.width, H = cv!.height;
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      // Faint star field (deterministic, based on canvas size)
      ctx!.fillStyle = "rgba(60,80,120,0.35)";
      for (let i = 0; i < 80; i++) {
        const sx = Math.abs(Math.sin(i * 1.7831 + 0.5)) * W;
        const sy = Math.abs(Math.cos(i * 1.3217 + 0.3)) * H;
        const sr = 0.5 + (i % 3) * 0.4;
        ctx!.beginPath(); ctx!.arc(sx, sy, sr, 0, Math.PI*2); ctx!.fill();
      }

      // Subtle grid
      ctx!.strokeStyle = "rgba(42,64,96,0.15)"; ctx!.lineWidth = 0.5;
      const GRID = 80;
      for (let x = 0; x < W; x += GRID) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke();
      }
      for (let y = 0; y < H; y += GRID) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke();
      }

      const now    = Date.now();
      const TRAIL_TTL = 750; // ms

      // Build the list of cursors to render (include own cursor if tracked)
      const all = [...cursorsRef.current];
      const hasOwn = all.some(c => c.id === ownId);
      if (!hasOwn && ownPos.current) {
        const own = ownPos.current;
        all.push({
          id: ownId,
          nx: own.x / W,
          ny: own.y / H,
          color: "#FFD700",
          label: ownId.slice(0,6),
        });
      }

      for (const cur of all) {
        const cx = cur.nx * W;
        const cy = cur.ny * H;
        if (!isFinite(cx) || !isFinite(cy)) continue;

        // Update trail
        const trail = trailsRef.current.get(cur.id) ?? [];
        const head  = trail[0];
        if (!head || Math.hypot(cx - head.x, cy - head.y) > 1.5) {
          trail.unshift({ x: cx, y: cy, ts: now });
          if (trail.length > 40) trail.length = 40;
        }
        const fresh = trail.filter(p => now - p.ts < TRAIL_TTL);
        trailsRef.current.set(cur.id, fresh);

        // Draw trail fragments (oldest first for correct layering)
        const isOwn = cur.id === ownId;
        const seedNum = cur.id.split("").reduce((a,c) => a + c.charCodeAt(0), 0);

        for (let i = fresh.length - 1; i >= 0; i--) {
          const age = (now - fresh[i].ts) / TRAIL_TTL;
          const opacity = Math.pow(1 - age, 1.8) * (isOwn ? 0.95 : 0.75);
          if (opacity < 0.02) continue;
          const radius = (isOwn ? 5.5 : 4) * (1 - age * 0.6) + 1;
          const [sx, sy] = scatter(i, seedNum);
          const px = fresh[i].x + sx * age;
          const py = fresh[i].y + sy * age;
          if (!isFinite(px) || !isFinite(py)) continue;
          const col = sunsetRgba(age, opacity);
          // Fragment glow
          if (radius > 2 && opacity > 0.15) {
            const glowR = radius * 2.5;
            const glowGrad = ctx!.createRadialGradient(px, py, 0, px, py, glowR);
            glowGrad.addColorStop(0, sunsetRgba(age, opacity * 0.5));
            glowGrad.addColorStop(1, "transparent");
            ctx!.beginPath(); ctx!.arc(px, py, glowR, 0, Math.PI*2);
            ctx!.fillStyle = glowGrad; ctx!.fill();
          }
          ctx!.beginPath(); ctx!.arc(px, py, radius, 0, Math.PI*2);
          ctx!.fillStyle = col; ctx!.fill();
        }

        // Draw cursor head
        const headR = isOwn ? 22 : 16;
        const headGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, headR);
        headGrad.addColorStop(0,   cur.color + "cc");
        headGrad.addColorStop(0.4, cur.color + "44");
        headGrad.addColorStop(1,   "transparent");
        ctx!.beginPath(); ctx!.arc(cx, cy, headR, 0, Math.PI*2);
        ctx!.fillStyle = headGrad; ctx!.fill();

        const dotR = isOwn ? 6 : 5;
        ctx!.beginPath(); ctx!.arc(cx, cy, dotR, 0, Math.PI*2);
        ctx!.fillStyle = cur.color; ctx!.fill();

        // Label
        const lbl = isOwn ? "YOU" : cur.label;
        ctx!.font = `8px Space Mono`;
        ctx!.textAlign = "left";
        ctx!.fillStyle = cur.color + "cc";
        ctx!.fillText(lbl, cx + dotR + 5, cy - 4);
        if (isOwn) {
          ctx!.fillStyle = "rgba(200,160,48,0.4)";
          ctx!.fillText("(you)", cx + dotR + 5, cy + 7);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(pollId);
      ro.disconnect();
      cv.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousemove", onGlobalMove);
    };
  }, [ownId]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%", cursor: "none" }}
    />
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function LiveCursorsPage() {
  const [ownId]       = useState<string>(() => getSessionId());
  const [online, setOnline] = useState<LiveCursor[]>([]);

  /* poll for sidebar list */
  useEffect(() => {
    let alive = true;
    async function tick() {
      try {
        const res  = await fetch("/api/live/cursors");
        const json = await res.json() as { cursors: LiveCursor[] };
        if (alive) setOnline(json.cursors ?? []);
      } catch { /* ignore */ }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const onlineCount = online.length + (online.some(c => c.id === ownId) ? 0 : 1);

  const tag = (label: string, val: string | number, col = GOLD): React.ReactElement => (
    <div style={{ fontFamily: MN, fontSize: 7.5, lineHeight: 2.0 }}>
      <span style={{ color: DIM, letterSpacing: "0.12em" }}>{label}&nbsp;</span>
      <span style={{ color: col }}>{val}</span>
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 48px)", background: BG, position: "relative",
      overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* ── overlay header ── */}
      <div style={{ position: "absolute", top: 12, left: 16, zIndex: 20,
        background: "rgba(4,6,14,0.82)",
        border: `1px solid ${QUANT}22`, borderRadius: 4,
        padding: "10px 14px", backdropFilter: "blur(6px)" }}>
        <div style={{ fontFamily: OR, fontSize: 9, color: QUANT, letterSpacing: 2,
          marginBottom: 4 }}>
          AETHER &middot; LIVE VIEWING QUEUE
        </div>
        {tag("online", onlineCount, QUANT)}
        {tag("your id", ownId.slice(0,8), "#FFD700")}
        <div style={{ marginTop: 6, fontFamily: MN, fontSize: 7,
          color: "rgba(100,140,180,0.5)", lineHeight: 1.7 }}>
          move your cursor to appear<br />
          each visitor is a comet
        </div>
      </div>

      {/* ── online users list ── */}
      <div style={{ position: "absolute", top: 12, right: 16, zIndex: 20,
        background: "rgba(4,6,14,0.82)",
        border: `1px solid ${GOLD}18`, borderRadius: 4,
        padding: "10px 14px", backdropFilter: "blur(6px)",
        maxHeight: "60vh", overflowY: "auto", minWidth: 140 }}>
        <div style={{ fontFamily: OR, fontSize: 7.5, color: GOLD,
          letterSpacing: 1.5, marginBottom: 8 }}>
          LIVE
        </div>
        {/* own entry always shows */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%",
            background: "#FFD700", boxShadow: "0 0 6px #FFD700" }} />
          <span style={{ fontFamily: MN, fontSize: 8, color: "#FFD700" }}>
            {ownId.slice(0,6)} (you)
          </span>
        </div>
        {online.filter(c => c.id !== ownId).map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%",
              background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
            <span style={{ fontFamily: MN, fontSize: 8, color: c.color + "cc" }}>
              {c.label}
            </span>
          </div>
        ))}
        {online.filter(c => c.id !== ownId).length === 0 && (
          <div style={{ fontFamily: MN, fontSize: 7, color: DIM, lineHeight: 1.7 }}>
            waiting for others...
          </div>
        )}
      </div>

      {/* ── bottom legend ── */}
      <div style={{ position: "absolute", bottom: 14, left: "50%",
        transform: "translateX(-50%)", zIndex: 20,
        background: "rgba(4,6,14,0.75)",
        border: `1px solid rgba(42,64,96,0.4)`,
        borderRadius: 20, padding: "5px 18px",
        backdropFilter: "blur(4px)" }}>
        <span style={{ fontFamily: MN, fontSize: 7.5,
          color: "rgba(100,140,180,0.6)", letterSpacing: "0.14em" }}>
          sunset comet tail &middot; each colour is a unique visitor &middot; 5s idle timeout
        </span>
      </div>

      {/* ── main canvas ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <LiveCursorsCanvas ownId={ownId} />
      </div>
    </div>
  );
}
