import { useEffect, useRef } from "react";

const PAGE_CSS = `
#nlp-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0a0e1a 0%, #030509 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
#nlp-root *, #nlp-root *::before, #nlp-root *::after { margin: 0; padding: 0; box-sizing: border-box; }
#nlp-canvas { display: block; width: 100%; height: 100%; }
#nlp-panel {
  position: absolute; top: 16px; left: 16px;
  background: rgba(10, 14, 26, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(120, 180, 255, 0.25);
  border-radius: 10px;
  padding: 12px 16px;
  color: #cfe3ff;
  font-size: 12px;
  line-height: 1.6;
  max-width: 260px;
  box-shadow: 0 0 24px rgba(80, 140, 255, 0.08);
  z-index: 10;
}
#nlp-panel b { color: #8fd3ff; }
.nlp-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; }
.nlp-row input[type=range] { width: 110px; accent-color: #6fc7ff; }
.nlp-row select {
  background: rgba(255,255,255,0.06);
  color: #cfe3ff;
  border: 1px solid rgba(120,180,255,0.3);
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
}
#nlp-hint {
  position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%);
  color: rgba(200, 220, 255, 0.55);
  font-size: 11px; letter-spacing: 0.3px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}
`;

export default function NodeLatticePage() {
  const decayRef = useRef<HTMLInputElement>(null);
  const speedRef = useRef<HTMLInputElement>(null);
  const topoRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const canvas = document.getElementById("nlp-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;

    function resize() {
      const parent = canvas.parentElement!;
      W = canvas.width = parent.clientWidth;
      H = canvas.height = parent.clientHeight;
    }
    resize();
    window.addEventListener("resize", onResize);

    let nodes: { x: number; y: number; r?: number; c?: number }[] = [];
    let edges: { a: number; b: number }[] = [];
    let adjacency: number[][] = [];
    let sourceIndex = 0;
    let hopDistance: number[] = [];
    let waveFront = 0;
    let lastActivate = 0;

    function onResize() { resize(); buildLattice(); }

    function buildLattice() {
      nodes = []; edges = [];
      const topo = topoRef.current?.value ?? "grid";
      const margin = 60;
      const usableW = W - margin * 2;
      const usableH = H - margin * 2;

      if (topo === "grid") {
        const cols = Math.max(6, Math.round(usableW / 70));
        const rows = Math.max(5, Math.round(usableH / 70));
        const dx = usableW / (cols - 1);
        const dy = usableH / (rows - 1);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          nodes.push({ x: margin + c * dx + (Math.random() - 0.5) * 8, y: margin + r * dy + (Math.random() - 0.5) * 8, r, c });
        }
        const idx = (r: number, c: number) => r * cols + c;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          if (c < cols - 1) edges.push({ a: idx(r, c), b: idx(r, c + 1) });
          if (r < rows - 1) edges.push({ a: idx(r, c), b: idx(r + 1, c) });
        }
      } else if (topo === "hex") {
        const cols = Math.max(7, Math.round(usableW / 60));
        const rows = Math.max(6, Math.round(usableH / 70));
        const dx = usableW / (cols - 1);
        const dy = usableH / (rows - 1);
        const grid: number[][] = [];
        for (let r = 0; r < rows; r++) {
          grid.push([]);
          for (let c = 0; c < cols; c++) {
            const offset = r % 2 === 0 ? 0 : dx / 2;
            nodes.push({ x: margin + c * dx + offset, y: margin + r * dy, r, c });
            grid[r].push(nodes.length - 1);
          }
        }
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const cur = grid[r][c];
          if (c < cols - 1) edges.push({ a: cur, b: grid[r][c + 1] });
          if (r < rows - 1) {
            const isEven = r % 2 === 0;
            const c1 = isEven ? c - 1 : c, c2 = isEven ? c : c + 1;
            if (grid[r + 1][c1] !== undefined) edges.push({ a: cur, b: grid[r + 1][c1] });
            if (grid[r + 1][c2] !== undefined) edges.push({ a: cur, b: grid[r + 1][c2] });
          }
        }
      } else {
        const count = Math.max(60, Math.round((usableW * usableH) / 9000));
        for (let i = 0; i < count; i++) nodes.push({ x: margin + Math.random() * usableW, y: margin + Math.random() * usableH });
        const k = 3;
        for (let i = 0; i < nodes.length; i++) {
          const dists: { j: number; d: number }[] = [];
          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue;
            dists.push({ j, d: (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2 });
          }
          dists.sort((a, b) => a.d - b.d);
          for (let n = 0; n < k; n++) {
            const j = dists[n].j;
            if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) edges.push({ a: i, b: j });
          }
        }
      }

      adjacency = nodes.map(() => [] as number[]);
      edges.forEach(e => { adjacency[e.a].push(e.b); adjacency[e.b].push(e.a); });

      let best = 0, bestD = Infinity;
      nodes.forEach((n, i) => { const d = (n.x - W / 2) ** 2 + (n.y - H / 2) ** 2; if (d < bestD) { bestD = d; best = i; } });
      setSource(best);
    }

    function setSource(i: number) {
      sourceIndex = i;
      hopDistance = new Array(nodes.length).fill(Infinity);
      const queue = [i]; hopDistance[i] = 0; let head = 0;
      while (head < queue.length) {
        const cur = queue[head++];
        for (const nb of adjacency[cur]) { if (hopDistance[nb] === Infinity) { hopDistance[nb] = hopDistance[cur] + 1; queue.push(nb); } }
      }
      waveFront = 0; lastActivate = performance.now();
    }

    function onCanvasClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let best = -1, bestD = Infinity;
      nodes.forEach((n, i) => { const d = (n.x - mx) ** 2 + (n.y - my) ** 2; if (d < bestD) { bestD = d; best = i; } });
      if (best >= 0 && bestD < 2500) setSource(best);
    }
    canvas.addEventListener("click", onCanvasClick);

    topoRef.current?.addEventListener("change", buildLattice);

    let rafId: number;
    function draw(t: number) {
      ctx.clearRect(0, 0, W, H);
      const speed = parseFloat(speedRef.current?.value ?? "4");
      const decay = parseFloat(decayRef.current?.value ?? "0.55");
      waveFront = ((t - lastActivate) / 1000) * speed;

      const intensity = nodes.map((_, i) => {
        const hd = hopDistance[i];
        if (hd === Infinity) return 0;
        const reach = waveFront - hd;
        if (reach < 0) return 0;
        const fade = Math.pow(1 - decay, hd);
        const pulse = Math.max(0, 1 - reach * 0.35);
        return Math.min(1, fade * (0.35 + 0.65 * Math.min(1, reach)) + fade * pulse * 0.5);
      });

      edges.forEach(e => {
        const ia = intensity[e.a], ib = intensity[e.b];
        const strength = (ia + ib) / 2;
        if (strength <= 0.01) { ctx.strokeStyle = "rgba(90,110,150,0.10)"; ctx.lineWidth = 1; }
        else { ctx.strokeStyle = `rgba(120,200,255,${0.06 + strength * 0.55})`; ctx.lineWidth = 1 + strength * 1.5; }
        ctx.beginPath(); ctx.moveTo(nodes[e.a].x, nodes[e.a].y); ctx.lineTo(nodes[e.b].x, nodes[e.b].y); ctx.stroke();
      });

      nodes.forEach((n, i) => {
        const inten = intensity[i];
        const isSource = i === sourceIndex;
        const baseR = isSource ? 7 : 3 + inten * 2.5;
        if (inten > 0.02 || isSource) {
          const glowR = baseR * (isSource ? 6 : 3 + inten * 4);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
          grad.addColorStop(0, `rgba(140,210,255,${isSource ? 0.5 : inten * 0.35})`);
          grad.addColorStop(1, "rgba(140,210,255,0)");
          ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, baseR, 0, Math.PI * 2);
        if (isSource) { ctx.fillStyle = "#fff8e0"; }
        else { const lit = Math.round(60 + inten * 195); ctx.fillStyle = `rgba(${lit - 20},${lit},255,${0.4 + inten * 0.6})`; }
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }

    buildLattice();
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onCanvasClick);
    };
  }, []);

  return (
    <div id="nlp-root">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <canvas id="nlp-canvas"></canvas>
      <div id="nlp-panel">
        <div><b>Node Lattice</b></div>
        <div className="nlp-row">
          <span>Decay per hop</span>
          <input ref={decayRef} type="range" min="0.1" max="0.9" step="0.05" defaultValue="0.55" />
        </div>
        <div className="nlp-row">
          <span>Propagation speed</span>
          <input ref={speedRef} type="range" min="1" max="10" step="1" defaultValue="4" />
        </div>
        <div className="nlp-row">
          <span>Topology</span>
          <select ref={topoRef} defaultValue="grid">
            <option value="grid">Grid lattice</option>
            <option value="hex">Hex-packed</option>
            <option value="random">Random graph</option>
          </select>
        </div>
      </div>
      <div id="nlp-hint">click any node to set it as source — watch illumination spread through neighbors</div>
    </div>
  );
}
