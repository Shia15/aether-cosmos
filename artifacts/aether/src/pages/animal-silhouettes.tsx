import { useEffect, useRef, useState } from "react";

const BG    = "#04060E";
const GOLD  = "#C8A030";
const AURORA = "#00FFB2";
const MONO  = "'Space Mono', monospace";
const DISP  = "'Cinzel', serif";
const SERIF = "'Crimson Pro', serif";

/* ── Geometry helpers (module scope) ── */
function sampleLine(x1: number, y1: number, x2: number, y2: number, n: number) {
  const p: {x:number,y:number}[] = [];
  for (let i = 0; i < n; i++) { const t = i / (n - 1 || 1); p.push({ x: x1+(x2-x1)*t, y: y1+(y2-y1)*t }); }
  return p;
}
function sampleArc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number) {
  const p: {x:number,y:number}[] = [];
  for (let i = 0; i < n; i++) { const t = i / (n - 1 || 1); const a = a0+(a1-a0)*t; p.push({ x: cx+Math.cos(a)*rx, y: cy+Math.sin(a)*ry }); }
  return p;
}

/* ── Silhouette point sets (module scope) ── */
function serpentPts() {
  const p: {x:number,y:number}[] = [];
  for (let i = 0; i < 80; i++) { const t = i/79; p.push({ x: -0.9+1.6*t, y: Math.sin(t*Math.PI*2.5)*0.45*(0.3+t*0.7) }); }
  p.push(...sampleArc(0.72, Math.sin(2.5*Math.PI)*0.28, 0.07, 0.07, 0, Math.PI*2, 14));
  return p;
}
function birdPts() {
  const p: {x:number,y:number}[] = [];
  p.push(...sampleLine(0,0.06,-0.52,-0.14,14), ...sampleLine(-0.52,-0.14,-0.95,-0.6,18), ...sampleLine(-0.95,-0.6,-0.72,-0.62,6));
  p.push(...sampleLine(0,0.06,0.52,-0.14,14), ...sampleLine(0.52,-0.14,0.95,-0.6,18), ...sampleLine(0.95,-0.6,0.72,-0.62,6));
  p.push(...sampleArc(0,0.1,0.12,0.2,0,Math.PI*2,20), ...sampleLine(0,-0.08,0,-0.28,8));
  p.push(...sampleLine(-0.04,-0.28,-0.12,-0.38,5), ...sampleLine(0.04,-0.28,0.12,-0.38,5));
  return p;
}
function scorpionPts() {
  const p: {x:number,y:number}[] = [];
  p.push(...sampleArc(-0.1,0.04,0.3,0.2,0,Math.PI*2,36));
  for (let i = 0; i < 42; i++) { const t = i/41; const ang = -t*3.2; const rad = 0.06+t*0.38; p.push({ x: 0.22+Math.cos(ang)*rad, y: -0.04+Math.sin(ang)*rad-t*0.16 }); }
  p.push(...sampleLine(-0.38,-0.08,-0.58,-0.24,8), ...sampleLine(-0.58,-0.24,-0.46,-0.36,5));
  p.push(...sampleLine(-0.32,0.16,-0.52,0.32,8), ...sampleLine(-0.52,0.32,-0.38,0.42,5));
  return p;
}
function aurochsPts() {
  const p: {x:number,y:number}[] = [];
  p.push(...sampleArc(0,-0.06,0.46,0.22,0,Math.PI*2,38));
  p.push(...sampleLine(-0.32,0.12,-0.36,0.5,10), ...sampleLine(-0.1,0.14,-0.14,0.5,10));
  p.push(...sampleLine(0.1,0.14,0.14,0.5,10), ...sampleLine(0.32,0.12,0.38,0.5,10));
  p.push(...sampleLine(0.4,-0.16,0.74,-0.06,12), ...sampleLine(0.56,-0.08,0.72,-0.3,8));
  p.push(...sampleLine(0.68,-0.1,0.88,-0.28,8));
  return p;
}
function foxPts() {
  const p: {x:number,y:number}[] = [];
  p.push(...sampleArc(0,0,0.2,0.18,0,Math.PI*2,28));
  p.push(...sampleLine(-0.2,-0.08,-0.46,-0.38,10), ...sampleLine(-0.16,-0.1,-0.28,-0.42,8));
  p.push(...sampleLine(0.2,-0.08,0.46,-0.38,10), ...sampleLine(0.16,-0.1,0.28,-0.42,8));
  for (let i = 0; i < 30; i++) { const t = i/29; const ang = -0.4+t*0.8; const r = 0.36+Math.sin(t*Math.PI)*0.12; p.push({ x: Math.cos(ang+Math.PI)*r, y: Math.sin(ang+Math.PI)*r*0.6+0.1 }); }
  p.push(...sampleLine(-0.28,0.1,-0.4,0.24,8), ...sampleLine(0.28,0.1,0.4,0.24,8));
  return p;
}

type RGB = [number,number,number];
const TEAL:    RGB = [29,158,117];
const CORAL:   RGB = [216,90,48];
const PURPLE:  RGB = [127,119,221];
const AMBER:   RGB = [239,159,39];
const FOXTAIL: RGB = [252,156,36];

const ANIMALS = [
  { name: "Serpent",  glyph: "𓆙", col: TEAL,    pts: serpentPts()   },
  { name: "Vulture",  glyph: "𓅃", col: PURPLE,  pts: birdPts()      },
  { name: "Scorpion", glyph: "𓆞", col: CORAL,   pts: scorpionPts()  },
  { name: "Aurochs",  glyph: "𓃗", col: AMBER,   pts: aurochsPts()   },
  { name: "Fox",      glyph: "𓃱", col: FOXTAIL, pts: foxPts()       },
];

function rgbA(col: RGB, a: number) { return `rgba(${col[0]},${col[1]},${col[2]},${a})`; }
function lerpCol(a: RGB, b: RGB, f: number): RGB {
  return [a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
}

const FORM_DUR = 120, HOLD_DUR = 110, DISP_DUR = 60, N = 150;

export default function AnimalSilhouettesPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const nameRef    = useRef<HTMLDivElement>(null);
  const [wellLabel, setWellLabel] = useState("Attract");
  const wellModeRef  = useRef<"attract"|"repel">("attract");
  const animalIdxRef = useRef(0);
  const triggerRef   = useRef({ scatter: false, next: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = canvas!.getBoundingClientRect();
      canvas!.width  = Math.round(r.width  * DPR);
      canvas!.height = Math.round(r.height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas!.width  / DPR;
    const H = () => canvas!.height / DPR;

    let particles = Array.from({ length: N }, (_, i) => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5,
      flickerPhase: Math.random()*Math.PI*2,
      flickerSpeed: 0.08+Math.random()*0.1,
      tid: i,
    }));

    let phase: "form"|"hold"|"disperse" = "form";
    let phaseTimer = 0;
    let t = 0;
    let wells: {x:number,y:number,strength:number,sign:number,alpha:number,fading:boolean}[] = [];
    let dragWell: typeof wells[0] | null = null;
    let pointerDown = false, startX = 0, startY = 0, startTime = 0;

    function getTarget(p: typeof particles[0]) {
      const animal = ANIMALS[animalIdxRef.current];
      const src = animal.pts[p.tid % animal.pts.length];
      const sc = Math.min(W(), H()) * 0.38;
      return { x: W()/2 + src.x*sc, y: H()*0.48 + src.y*sc };
    }

    function scatter() {
      particles.forEach(p => {
        const ang = Math.random()*Math.PI*2, sp = 1.5+Math.random()*2.5;
        p.vx = Math.cos(ang)*sp; p.vy = Math.sin(ang)*sp;
      });
    }

    /* Pointer events */
    canvas.addEventListener("pointerdown", e => {
      pointerDown = true; dragWell = null;
      const r = canvas!.getBoundingClientRect();
      startX = e.clientX - r.left; startY = e.clientY - r.top;
      startTime = performance.now();
    });
    canvas.addEventListener("pointermove", e => {
      if (!pointerDown) return;
      const r = canvas!.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      const dist = Math.hypot(mx-startX, my-startY), held = performance.now()-startTime;
      if (!dragWell && (dist > 9 || held > 160)) {
        dragWell = { x: mx, y: my, strength: 0.4, sign: wellModeRef.current === "attract" ? 1 : -1, alpha: 1, fading: false };
        wells.push(dragWell);
        if (wells.length > 2) wells[0].fading = true;
      }
      if (dragWell) { dragWell.x = mx; dragWell.y = my; dragWell.strength = Math.min(dragWell.strength+0.02, 1.8); }
    });
    const endP = () => { if (dragWell) { dragWell.fading = true; dragWell = null; } pointerDown = false; };
    canvas.addEventListener("pointerup", endP);
    canvas.addEventListener("pointercancel", endP);

    let rafId = 0;
    function frame() {
      t++;
      const w = W(), h = H();
      ctx.fillStyle = "rgba(4,6,14,0.22)";
      ctx.fillRect(0, 0, w, h);

      /* Phase transitions */
      phaseTimer++;
      if (triggerRef.current.scatter) {
        triggerRef.current.scatter = false;
        scatter(); phase = "disperse"; phaseTimer = 0;
        if (nameRef.current) nameRef.current.textContent = "";
      }
      if (triggerRef.current.next) {
        triggerRef.current.next = false;
        animalIdxRef.current = (animalIdxRef.current + 1) % ANIMALS.length;
        if (nameRef.current) nameRef.current.textContent = "";
        phase = "disperse"; phaseTimer = 0; scatter();
      }
      if (phase === "form"    && phaseTimer > FORM_DUR) { phase = "hold"; phaseTimer = 0; if (nameRef.current) { const a = ANIMALS[animalIdxRef.current]; nameRef.current.textContent = a.glyph + " " + a.name; } }
      else if (phase === "hold"    && phaseTimer > HOLD_DUR) { phase = "disperse"; phaseTimer = 0; if (nameRef.current) nameRef.current.textContent = ""; scatter(); }
      else if (phase === "disperse" && phaseTimer > DISP_DUR) { animalIdxRef.current = (animalIdxRef.current+1) % ANIMALS.length; phase = "form"; phaseTimer = 0; }

      wells = wells.filter(wl => wl.alpha > 0.01);
      wells.forEach(wl => { if (wl.fading) { wl.strength *= 0.93; wl.alpha *= 0.92; } });

      const col   = ANIMALS[animalIdxRef.current].col;
      const prev  = ANIMALS[(animalIdxRef.current + ANIMALS.length - 1) % ANIMALS.length].col;
      const dispF = phase === "disperse" ? Math.min(phaseTimer/DISP_DUR, 1) : 0;
      const drawCol = lerpCol(col, prev, dispF * 0.5);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      particles.forEach(p => {
        let fx = 0, fy = 0;
        if (phase === "form" || phase === "hold") {
          const tgt = getTarget(p);
          const jit = phase === "hold" ? 2.2 : 0;
          const tx = tgt.x + Math.sin(t*0.05+p.flickerPhase)*jit;
          const ty = tgt.y + Math.cos(t*0.05+p.flickerPhase)*jit;
          const dx = tx-p.x, dy = ty-p.y, d = Math.hypot(dx,dy)||0.01;
          const pull = Math.min(d*0.016, 1.8);
          fx += dx/d*pull; fy += dy/d*pull;
        } else { fy += 0.015; }
        wells.forEach(wl => {
          const dx = wl.x-p.x, dy = wl.y-p.y, d = Math.hypot(dx,dy)||0.01;
          if (d < 200) { const f = wl.strength*3600/(d*d+400); fx += dx/d*f*wl.sign*0.045; fy += dy/d*f*wl.sign*0.045; }
        });
        p.vx = (p.vx+fx)*0.87; p.vy = (p.vy+fy)*0.87;
        p.x  = Math.max(2, Math.min(w-2, p.x+p.vx));
        p.y  = Math.max(2, Math.min(h-2, p.y+p.vy));
        const flicker = phase === "hold" ? (0.65+0.35*Math.sin(t*p.flickerSpeed+p.flickerPhase)) : 0.85;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI*2); ctx.fillStyle = rgbA(drawCol, 0.08*flicker); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI*2); ctx.fillStyle = rgbA(drawCol, 0.88*flicker); ctx.fill();
      });
      if (phase === "hold") {
        for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) {
          const a = particles[i], b = particles[j];
          const dx = b.x-a.x, dy = b.y-a.y, d = Math.hypot(dx,dy);
          if (d < 20) { ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle = rgbA(drawCol,(1-d/20)*0.15); ctx.lineWidth=0.6; ctx.stroke(); }
        }
      }
      wells.forEach(wl => {
        const bc: RGB = wl.sign > 0 ? [120,170,255] : [255,130,90];
        for (let k = 2; k >= 1; k--) { ctx.beginPath(); ctx.arc(wl.x,wl.y,8+k*10,0,Math.PI*2); ctx.strokeStyle=rgbA(bc,wl.alpha*0.08/k); ctx.lineWidth=0.8; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(wl.x,wl.y,4,0,Math.PI*2); ctx.fillStyle=rgbA(bc,wl.alpha*0.7); ctx.fill();
      });
      ctx.restore();
      rafId = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  function toggleWell() {
    const next = wellModeRef.current === "attract" ? "repel" : "attract";
    wellModeRef.current = next;
    setWellLabel(next === "attract" ? "Attract" : "Repel");
  }

  const btnStyle: React.CSSProperties = {
    fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    padding: "8px 16px", border: `1px solid rgba(200,160,48,0.25)`,
    background: "rgba(200,160,48,0.04)", color: "#c0b080",
    cursor: "pointer", borderRadius: 2, transition: "all 0.2s",
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#c8c0b0", fontFamily: SERIF }}>
      {/* Header */}
      <div style={{ padding: "40px 40px 28px", borderBottom: "1px solid rgba(200,160,48,0.12)" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 4, color: AURORA, marginBottom: 10, textTransform: "uppercase" }}>
          AETHER -- Ancient Glyphs -- Particle Morphogenesis
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: 28, color: "#e0d8c8", letterSpacing: 2, marginBottom: 10 }}>
          Animal Silhouette Bursts
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: "#907868", lineHeight: 1.7, maxWidth: 640 }}>
          150 particles steer toward sacred animal target points, assembling ancient Egyptian hieroglyphic
          silhouettes. Hold-drag to open a gravity well that distorts the form.
          Each silhouette disperses into the void before the next crystallizes.
        </p>
        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {ANIMALS.map(a => (
            <span key={a.name} style={{ fontFamily: MONO, fontSize: 9, color: "rgba(200,160,48,0.5)", letterSpacing: 1 }}>
              {a.glyph} {a.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 40px 48px", gap: 20 }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "min(580px, 100%)",
            aspectRatio: "1/1",
            borderRadius: 4,
            background: "#030508",
            cursor: "crosshair",
            touchAction: "none",
            border: "1px solid rgba(200,160,48,0.12)",
          }}
        />

        {/* Animal name */}
        <div ref={nameRef} style={{
          fontFamily: DISP, fontSize: 22, color: "#e0d8c8",
          minHeight: 28, textAlign: "center", letterSpacing: 2,
        }} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button style={btnStyle} onClick={() => { triggerRef.current.next = true; }}>
            Next Animal &#9658;
          </button>
          <button style={btnStyle} onClick={toggleWell}>
            Well: {wellLabel}
          </button>
          <button style={btnStyle} onClick={() => { triggerRef.current.scatter = true; }}>
            &#10022; Scatter
          </button>
        </div>

        <p style={{ fontFamily: SERIF, fontSize: 13, color: "#605850", maxWidth: 500, textAlign: "center", lineHeight: 1.6 }}>
          Particles steer toward target points, the reverse of every firework. Hold-drag to open a
          gravity well (attract or repel) that distorts the silhouette while it holds.
        </p>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, width: "100%", maxWidth: 600, marginTop: 8 }}>
          {[
            ["Particles", "150"],
            ["Phase", "Form -> Hold -> Disperse"],
            ["Animals", "5 hieroglyphic forms"],
            ["Well Types", "Attract / Repel"],
          ].map(([lbl, val]) => (
            <div key={lbl} style={{ border: "1px solid rgba(200,160,48,0.1)", background: "rgba(200,160,48,0.02)", padding: "12px 14px", borderRadius: 2 }}>
              <div style={{ fontFamily: MONO, fontSize: 7, color: "rgba(200,160,48,0.4)", letterSpacing: 2, marginBottom: 5, textTransform: "uppercase" }}>{lbl}</div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
