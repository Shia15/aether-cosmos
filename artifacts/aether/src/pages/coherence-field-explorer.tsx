import { useEffect, useRef } from "react";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Share+Tech+Mono&display=swap');

#cfe-root {
  --bg: #05060a;
  --panel: #0c0e16;
  --gold: #d4af37;
  --amber: #ffb347;
  --cyan: #4fe8e8;
  --cyan-dim: #1c5c5c;
  --text: #e8e2d0;
  --border: #2a2418;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 20%, #0d1120 0%, #05060a 70%);
  color: var(--text);
  font-family: 'Share Tech Mono', monospace;
  overflow: hidden;
}
#cfe-root *, #cfe-root *::before, #cfe-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

#cfe-header {
  padding: 14px 22px 10px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  background: linear-gradient(180deg, rgba(212,175,55,0.06), transparent);
  flex-shrink: 0;
}
#cfe-header h1 {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  color: var(--gold);
  text-shadow: 0 0 18px rgba(212,175,55,0.35);
}
.cfe-subtitle {
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  color: var(--cyan);
  opacity: 0.75;
  text-transform: uppercase;
}

#cfe-main {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 0;
}

#cfe-controls {
  border-right: 1px solid var(--border);
  padding: 16px;
  overflow-y: auto;
  background: rgba(212,175,55,0.02);
}
#cfe-controls::-webkit-scrollbar { width: 6px; }
#cfe-controls::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

.cfe-section-title {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  letter-spacing: 1.5px;
  color: var(--amber);
  text-transform: uppercase;
  margin: 16px 0 8px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 5px;
}
.cfe-section-title:first-child { margin-top: 0; }

.cfe-ctrl { margin-bottom: 12px; }
.cfe-ctrl label {
  display: flex;
  justify-content: space-between;
  font-size: 0.70rem;
  color: var(--text);
  opacity: 0.85;
  margin-bottom: 5px;
}
.cfe-ctrl label .cfe-val { color: var(--cyan); }
.cfe-ctrl input[type=range] {
  width: 100%;
  accent-color: var(--gold);
  height: 3px;
}

.cfe-op-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}
.cfe-op-btn {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.65rem;
  padding: 7px 4px;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
  letter-spacing: 0.5px;
}
.cfe-op-btn:hover { border-color: var(--cyan); color: var(--cyan); }
.cfe-op-btn.active {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(212,175,55,0.08);
  box-shadow: 0 0 12px rgba(212,175,55,0.25);
}

#cfe-canvas-wrap {
  position: relative;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

#cfe-metrics-bar {
  display: flex;
  gap: 20px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.3);
  flex-wrap: wrap;
  flex-shrink: 0;
}
.cfe-metric { display: flex; flex-direction: column; gap: 2px; }
.cfe-metric .m-label {
  font-size: 0.60rem;
  letter-spacing: 1px;
  color: var(--amber);
  opacity: 0.8;
  text-transform: uppercase;
}
.cfe-metric .m-value {
  font-size: 0.90rem;
  color: var(--cyan);
  text-shadow: 0 0 8px rgba(79,232,232,0.4);
}

#cfe-canvas { flex: 1; width: 100%; display: block; }

#cfe-footer {
  padding: 6px 18px;
  border-top: 1px solid var(--border);
  font-size: 0.60rem;
  color: var(--text);
  opacity: 0.45;
  letter-spacing: 1px;
  text-align: center;
  flex-shrink: 0;
}

@media(max-width: 700px) {
  #cfe-main { grid-template-columns: 1fr; }
  #cfe-controls { border-right: none; border-bottom: 1px solid var(--border); max-height: 220px; }
}
`;

const OP_NAMES = ["□ Square", "◡ Arc", "⊗ Fold", "Helix", "Weave", "Collapse"];
const PHI = 1.6180339887;

export default function CoherenceFieldExplorerPage() {
  const ampRef   = useRef<HTMLInputElement>(null);
  const freqRef  = useRef<HTMLInputElement>(null);
  const rateRef  = useRef<HTMLInputElement>(null);
  const decohRef = useRef<HTMLInputElement>(null);
  const pitchRef = useRef<HTMLInputElement>(null);

  const vAmpRef   = useRef<HTMLSpanElement>(null);
  const vFreqRef  = useRef<HTMLSpanElement>(null);
  const vRateRef  = useRef<HTMLSpanElement>(null);
  const vDecohRef = useRef<HTMLSpanElement>(null);
  const vPitchRef = useRef<HTMLSpanElement>(null);

  const mMeanRef  = useRef<HTMLSpanElement>(null);
  const mPeakRef  = useRef<HTMLSpanElement>(null);
  const mPhaseRef = useRef<HTMLSpanElement>(null);
  const mOpRef    = useRef<HTMLSpanElement>(null);

  const opStateRef   = useRef(0);
  const modeStateRef = useRef<"lattice" | "contour">("lattice");
  const tRef = useRef(0);

  useEffect(() => {
    const cv = document.getElementById("cfe-canvas") as HTMLCanvasElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    let W = 0, H = 0;
    function resize() {
      const wrap = document.getElementById("cfe-canvas-wrap");
      const bar  = document.getElementById("cfe-metrics-bar");
      if (!wrap) return;
      const wRect = wrap.getBoundingClientRect();
      const barH  = bar ? bar.getBoundingClientRect().height : 0;
      W = cv.width  = wRect.width  * devicePixelRatio;
      H = cv.height = (wRect.height - barH) * devicePixelRatio;
      cv.style.width  = wRect.width + "px";
      cv.style.height = (wRect.height - barH) + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    // Slider live display
    const sliders: [React.RefObject<HTMLInputElement>, React.RefObject<HTMLSpanElement>, string][] = [
      [ampRef,   vAmpRef,   "amp"],
      [freqRef,  vFreqRef,  "freq"],
      [rateRef,  vRateRef,  "rate"],
      [decohRef, vDecohRef, "decoh"],
      [pitchRef, vPitchRef, "pitch"],
    ];
    const cleanupSliders = sliders.map(([inpRef, dispRef]) => {
      const handler = () => { if (dispRef.current && inpRef.current) dispRef.current.textContent = parseFloat(inpRef.current.value).toFixed(2); };
      inpRef.current?.addEventListener("input", handler);
      return () => inpRef.current?.removeEventListener("input", handler);
    });

    // Op buttons
    document.querySelectorAll<HTMLButtonElement>(".cfe-op-btn[data-op]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".cfe-op-btn[data-op]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        opStateRef.current = parseInt(btn.dataset.op!);
        if (mOpRef.current) mOpRef.current.textContent = OP_NAMES[opStateRef.current];
      });
    });

    // Mode buttons
    document.querySelectorAll<HTMLButtonElement>(".cfe-op-btn[data-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".cfe-op-btn[data-mode]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        modeStateRef.current = btn.dataset.mode as "lattice" | "contour";
      });
    });

    function getState() {
      return {
        amp:   parseFloat(ampRef.current?.value   ?? "0.70"),
        freq:  parseFloat(freqRef.current?.value  ?? "3.0"),
        rate:  parseFloat(rateRef.current?.value  ?? "1.00"),
        decoh: parseFloat(decohRef.current?.value ?? "0.15"),
        pitch: parseFloat(pitchRef.current?.value ?? "2.0"),
      };
    }

    function opTransform(val: number, x: number, y: number, t: number): number {
      const s = getState();
      switch (opStateRef.current) {
        case 0: return val;
        case 1: return Math.sin(val * Math.PI / 2);
        case 2: return val * Math.cos(x * 0.02 + t);
        case 3: { const h = Math.sin(x * 0.03 * s.pitch + t) * Math.cos(y * 0.03 * s.pitch - t); return val * 0.5 + h * 0.5; }
        case 4: return val * Math.sin(x * 0.015 + t) * Math.cos(y * 0.015 - t * 0.7);
        case 5: { const d = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2) / (W * 0.5); return val * Math.exp(-d * 2 + Math.sin(t) * 0.3); }
        default: return val;
      }
    }

    function fieldAt(x: number, y: number, t: number): number {
      const s = getState();
      const nx = x / 40 * s.freq, ny = y / 40 * s.freq;
      let v = Math.sin(nx + t * s.rate) * Math.cos(ny - t * s.rate * 0.8);
      v += Math.sin((nx + ny) * 0.5 * PHI + t * s.rate * 1.1) * 0.4;
      v *= s.amp;
      v *= Math.exp(-s.decoh * (0.3 + 0.2 * Math.sin(t * 0.3)));
      return opTransform(v, x, y, t);
    }

    function colorFor(v: number): string {
      const t2 = Math.max(0, Math.min(1, (v + 1) / 2));
      const r = Math.round(79 + (212 - 79) * t2);
      const g = Math.round(232 + (175 - 232) * t2);
      const b = Math.round(232 + (55 - 232) * t2);
      return `rgb(${r},${g},${b})`;
    }

    let meanAcc = 0, peakAcc = 0, samples = 0;

    function drawLattice(t: number) {
      ctx.fillStyle = "#05060a"; ctx.fillRect(0, 0, W, H);
      const step = 18 * devicePixelRatio;
      meanAcc = 0; peakAcc = 0; samples = 0;
      for (let x = 0; x < W; x += step) {
        for (let y = 0; y < H; y += step) {
          const v = fieldAt(x, y, t);
          meanAcc += v; peakAcc = Math.max(peakAcc, Math.abs(v)); samples++;
          const r = (Math.abs(v) * 0.5 + 0.15) * step * 0.5;
          ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, r), 0, Math.PI * 2);
          ctx.fillStyle = colorFor(v); ctx.globalAlpha = 0.35 + Math.abs(v) * 0.5; ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawContour(t: number) {
      ctx.fillStyle = "#05060a"; ctx.fillRect(0, 0, W, H);
      const step = 6 * devicePixelRatio;
      meanAcc = 0; peakAcc = 0; samples = 0;
      const levels = 10;
      for (let x = 0; x < W; x += step) {
        for (let y = 0; y < H; y += step) {
          const v = fieldAt(x, y, t);
          meanAcc += v; peakAcc = Math.max(peakAcc, Math.abs(v)); samples++;
          const band = Math.floor((v + 1) / 2 * levels) / levels;
          ctx.fillStyle = colorFor(v);
          ctx.globalAlpha = Math.abs(Math.sin(band * Math.PI * levels)) > 0.85 ? 0.9 : 0.12;
          ctx.fillRect(x, y, step, step);
        }
      }
      ctx.globalAlpha = 1;
    }

    let rafId: number;
    function loop() {
      const s = getState();
      tRef.current += 0.016 * s.rate;
      if (modeStateRef.current === "lattice") drawLattice(tRef.current);
      else drawContour(tRef.current);
      if (mMeanRef.current) mMeanRef.current.textContent = (meanAcc / Math.max(1, samples)).toFixed(3);
      if (mPeakRef.current) mPeakRef.current.textContent = peakAcc.toFixed(3);
      if (mPhaseRef.current) mPhaseRef.current.textContent = ((tRef.current * PHI) % (2 * Math.PI)).toFixed(3);
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      cleanupSliders.forEach(fn => fn());
    };
  }, []);

  return (
    <div id="cfe-root">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <header id="cfe-header">
        <div>
          <h1>COHERENCE FIELD EXPLORER</h1>
          <div className="cfe-subtitle">C(x,t) · φ-Time Scheduling · Ptah Operator Console</div>
        </div>
        <div className="cfe-subtitle">φ = {PHI.toFixed(10)}</div>
      </header>

      <div id="cfe-main">
        <div id="cfe-controls">
          <div className="cfe-section-title">Field Parameters</div>

          <div className="cfe-ctrl">
            <label>Coherence Amplitude (κ) <span className="cfe-val" ref={vAmpRef}>0.70</span></label>
            <input ref={ampRef} type="range" min="0.1" max="1.5" step="0.01" defaultValue="0.70" />
          </div>
          <div className="cfe-ctrl">
            <label>Spatial Frequency <span className="cfe-val" ref={vFreqRef}>3.0</span></label>
            <input ref={freqRef} type="range" min="0.5" max="10" step="0.1" defaultValue="3.0" />
          </div>
          <div className="cfe-ctrl">
            <label>φ-Time Rate <span className="cfe-val" ref={vRateRef}>1.00</span></label>
            <input ref={rateRef} type="range" min="0.05" max="3" step="0.05" defaultValue="1.00" />
          </div>
          <div className="cfe-ctrl">
            <label>Decoherence (η) <span className="cfe-val" ref={vDecohRef}>0.15</span></label>
            <input ref={decohRef} type="range" min="0" max="1" step="0.01" defaultValue="0.15" />
          </div>
          <div className="cfe-ctrl">
            <label>Helix Pitch <span className="cfe-val" ref={vPitchRef}>2.0</span></label>
            <input ref={pitchRef} type="range" min="0.5" max="6" step="0.1" defaultValue="2.0" />
          </div>

          <div className="cfe-section-title">Ptah Operator</div>
          <div className="cfe-op-grid">
            <button className="cfe-op-btn active" data-op="0">□ Square</button>
            <button className="cfe-op-btn" data-op="1">◡ Arc</button>
            <button className="cfe-op-btn" data-op="2">⊗ Fold</button>
            <button className="cfe-op-btn" data-op="3">Helix</button>
            <button className="cfe-op-btn" data-op="4">Weave</button>
            <button className="cfe-op-btn" data-op="5">Collapse</button>
          </div>

          <div className="cfe-section-title">Render Mode</div>
          <div className="cfe-op-grid">
            <button className="cfe-op-btn active" data-mode="lattice">Lattice</button>
            <button className="cfe-op-btn" data-mode="contour">Contour</button>
          </div>
        </div>

        <div id="cfe-canvas-wrap">
          <div id="cfe-metrics-bar">
            <div className="cfe-metric"><span className="m-label">Mean C(x,t)</span><span className="m-value" ref={mMeanRef}>0.000</span></div>
            <div className="cfe-metric"><span className="m-label">Peak Amplitude</span><span className="m-value" ref={mPeakRef}>0.000</span></div>
            <div className="cfe-metric"><span className="m-label">φ-Phase</span><span className="m-value" ref={mPhaseRef}>0.000</span></div>
            <div className="cfe-metric"><span className="m-label">Operator State</span><span className="m-value" ref={mOpRef}>□ Square</span></div>
          </div>
          <canvas id="cfe-canvas"></canvas>
        </div>
      </div>

      <footer id="cfe-footer">
        GUF / UHAF ECOSYSTEM — INTERACTIVE VISUALIZATION MODULE — SPECULATIVE FRAMEWORK, ILLUSTRATIVE ONLY
      </footer>
    </div>
  );
}
