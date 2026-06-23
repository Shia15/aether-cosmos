import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const GRN  = "#44cc77";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ══════════════════════════════════════════════════════
   CAVITY NAVIER-STOKES CANVAS
   Vorticity-stream function method on 38×38 grid
══════════════════════════════════════════════════════ */
function CavityCanvas({ Re, lidSpeed, showField }:
  { Re: number; lidSpeed: number; showField: boolean }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<{
    psi: Float64Array; omega: Float64Array;
    particles: { x: number; y: number; age: number; loop: number }[];
    loopCount: number; t: number;
  } | null>(null);

  const paramsRef = useRef({ Re, lidSpeed, showField });
  useEffect(() => { paramsRef.current = { Re, lidSpeed, showField }; }, [Re, lidSpeed, showField]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    const N  = 36;                    // interior grid points
    const NW = N + 2;                 // with ghost/boundary
    const h  = 1.0 / (N + 1);
    const newArr = () => new Float64Array(NW * NW);
    const psi   = newArr();
    const omega  = newArr();
    const psiNew = newArr();

    /* Particle system — 260 tracers */
    const NP = 260;
    const parts: { x: number; y: number; age: number; loop: number; lastX: number }[] = [];
    for (let k = 0; k < NP; k++) {
      parts.push({ x: Math.random(), y: Math.random(), age: Math.random() * 200, loop: 0, lastX: 0.5 });
    }
    stateRef.current = { psi, omega, particles: parts, loopCount: 0, t: 0 };

    const gIdx = (i: number, j: number) => i * NW + j;  // i=row(y), j=col(x)

    /* Velocity from stream function */
    const getUV = (i: number, j: number): [number, number] => {
      const u = (psi[gIdx(Math.min(i+1, NW-1), j)] - psi[gIdx(Math.max(i-1, 0), j)]) / (2 * h);
      const v = -(psi[gIdx(i, Math.min(j+1, NW-1))] - psi[gIdx(i, Math.max(j-1, 0))]) / (2 * h);
      return [u, v];
    };

    const draw = () => {
      const { Re: RE, lidSpeed: LID, showField: SF } = paramsRef.current;
      const nu = LID / RE;   // kinematic viscosity
      const DT = 0.003;
      const JACS = 10;        // Jacobi iterations per frame

      /* ── Update boundary ω (Thom's formula) ───────── */
      /* Top wall (lid moving at LID) */
      for (let j = 1; j <= N; j++) {
        const ij = gIdx(NW-1, j);
        omega[ij] = -2.0 * psi[gIdx(NW-2, j)] / (h * h) - 2.0 * LID / h;
      }
      /* Bottom wall */
      for (let j = 1; j <= N; j++) omega[gIdx(0, j)] = -2.0 * psi[gIdx(1, j)] / (h * h);
      /* Left wall */
      for (let i = 1; i <= N; i++) omega[gIdx(i, 0)] = -2.0 * psi[gIdx(i, 1)] / (h * h);
      /* Right wall */
      for (let i = 1; i <= N; i++) omega[gIdx(i, NW-1)] = -2.0 * psi[gIdx(i, NW-2)] / (h * h);

      /* ── Interior ω advection-diffusion (explicit) ─ */
      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
          const [u, v] = getUV(i, j);
          const ij = gIdx(i, j);
          const lap = (omega[gIdx(i+1,j)] + omega[gIdx(i-1,j)] +
                       omega[gIdx(i,j+1)] + omega[gIdx(i,j-1)] - 4*omega[ij]) / (h*h);
          const adv = u * (omega[gIdx(i,j+1)] - omega[gIdx(i,j-1)]) / (2*h)
                    + v * (omega[gIdx(i+1,j)] - omega[gIdx(i-1,j)]) / (2*h);
          omega[ij] += DT * (nu * lap - adv);
        }
      }

      /* ── Jacobi solve ∇²ψ = -ω ─────────────────── */
      for (let jac = 0; jac < JACS; jac++) {
        for (let i = 1; i <= N; i++) {
          for (let j = 1; j <= N; j++) {
            psiNew[gIdx(i,j)] = 0.25 * (
              psi[gIdx(i+1,j)] + psi[gIdx(i-1,j)] +
              psi[gIdx(i,j+1)] + psi[gIdx(i,j-1)] +
              h * h * omega[gIdx(i,j)]
            );
          }
        }
        psi.set(psiNew);
      }

      /* ── Advect particles ───────────────────────── */
      for (const p of parts) {
        p.age++;
        /* Convert to grid coords */
        const gx = p.x * (N + 1);
        const gy = p.y * (N + 1);
        const gi = Math.min(N, Math.max(1, Math.round(gy)));
        const gj = Math.min(N, Math.max(1, Math.round(gx)));
        const [u, v] = getUV(gi, gj);
        p.lastX = p.x;
        p.x += u * DT * 6;
        p.y -= v * DT * 6;
        /* Wrap detection for loop counting */
        if (p.lastX > 0.8 && p.x < 0.2) p.loop++;
        if (p.lastX < 0.2 && p.x > 0.8) p.loop--;
        /* Respawn if OOB or too old */
        if (p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1 || p.age > 400) {
          p.x = Math.random(); p.y = Math.random();
          p.age = 0; p.loop = 0; p.lastX = p.x;
        }
      }

      /* ── Draw ───────────────────────────────────── */
      ctx.fillStyle = `${BG}cc`; ctx.fillRect(0, 0, W, H);

      /* Cavity border */
      const PX = 40, PY = 30, CW = W - 80, CH = H - 70;

      /* ψ streamline heatmap */
      const cellW = CW / N, cellH = CH / N;
      let psiMin = Infinity, psiMax = -Infinity;
      for (let i = 1; i <= N; i++)
        for (let j = 1; j <= N; j++) {
          const v2 = psi[gIdx(i,j)];
          if (v2 < psiMin) psiMin = v2;
          if (v2 > psiMax) psiMax = v2;
        }
      const psiRange = psiMax - psiMin || 1;

      for (let i = 1; i <= N; i++) {
        for (let j = 1; j <= N; j++) {
          const v2 = (psi[gIdx(i,j)] - psiMin) / psiRange;
          /* Map v2 [0,1] → hue */
          const hue = 200 + v2 * 160;
          const l   = 12 + v2 * 25;
          ctx.fillStyle = `hsl(${hue},70%,${l}%)`;
          const x2 = PX + (j-1) * cellW;
          const y2 = PY + (N - i) * cellH;
          ctx.fillRect(x2, y2, cellW + 1, cellH + 1);
        }
      }

      /* Velocity vectors (every 5 cells) */
      if (SF) {
        for (let i = 3; i <= N; i += 5) {
          for (let j = 3; j <= N; j += 5) {
            const [u, v] = getUV(i, j);
            const mag = Math.sqrt(u*u + v*v);
            if (mag < 0.01) continue;
            const x2 = PX + (j - 0.5) * cellW;
            const y2 = PY + (N - i + 0.5) * cellH;
            const scale = Math.min(1.5, mag * 12) * cellW * 2.5;
            const ex = x2 + (u / mag) * scale;
            const ey = y2 - (v / mag) * scale;  // flip y
            ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(ex, ey);
            ctx.strokeStyle = `rgba(46,240,216,${Math.min(0.6, mag * 4)})`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }

      /* Particles */
      for (const p of parts) {
        const px = PX + p.x * CW;
        const py = PY + (1 - p.y) * CH;
        const loopHue = (p.loop * 40 + 200) % 360;
        const alpha = Math.min(1, (400 - p.age) / 200);
        ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${loopHue},85%,70%,${alpha * 0.9})`;
        ctx.fill();
      }

      /* Cavity box */
      /* Lid (top — moving) */
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(PX + CW, PY); ctx.stroke();
      /* Walls */
      ctx.strokeStyle = `${BLUE}60`; ctx.lineWidth = 2;
      ctx.strokeRect(PX, PY, CW, CH);

      /* Lid arrow */
      ctx.font = `8px ${mono}`; ctx.fillStyle = GOLD;
      ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText(`← LID  U = ${LID.toFixed(1)} m/s  →`, PX + CW/2, PY - 4);
      /* Re label */
      ctx.fillStyle = TEAL; ctx.textAlign = "left";
      ctx.fillText(`Re = ${RE.toFixed(0)}  ν = ${nu.toFixed(4)}`, PX, PY - 4);

      /* Recursive loop arrows at corners */
      const drawCornerLoop = (cx2: number, cy2: number, dir: number, col: string) => {
        ctx.beginPath();
        ctx.arc(cx2, cy2, 14, 0, Math.PI * 1.75, dir > 0);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
        /* Arrowhead */
        const endAngle = dir > 0 ? Math.PI * 1.75 : Math.PI * 0.25;
        const ax = cx2 + 14 * Math.cos(endAngle);
        const ay = cy2 + 14 * Math.sin(endAngle);
        ctx.beginPath(); ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
      };
      drawCornerLoop(PX + 22, PY + 22, 1, `${VIO}80`);
      drawCornerLoop(PX + CW - 22, PY + 22, -1, `${VIO}80`);
      drawCornerLoop(PX + 22, PY + CH - 22, -1, `${AMB}60`);
      drawCornerLoop(PX + CW - 22, PY + CH - 22, 1, `${AMB}60`);

      /* Loop counter */
      const loops = parts.reduce((a, p) => a + p.loop, 0);
      ctx.font = `9px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${VIO}80`;
      ctx.fillText(`∮ loops = ${loops}  ·  ψ ∈ [${psiMin.toFixed(3)}, ${psiMax.toFixed(3)}]`,
        PX + CW, PY + CH + 16);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={640} height={430}
      style={{ width:"100%", maxWidth:640, borderRadius:12,
        border:`1px solid ${TEAL}18`, background:BG,
        boxShadow:"0 4px 60px rgba(0,0,0,0.85)" }} />
  );
}

/* ══════════════════════════════════════════════════════
   PACKET SWITCHING FILAMENT NETWORK
══════════════════════════════════════════════════════ */
interface PNode { id: number; x: number; y: number; label: string; col: string; buf: number }
interface Packet { id: number; src: number; dst: number; route: number[]; hop: number; progress: number; col: string; size: number }

function PacketCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* Network topology */
    const nodes: PNode[] = [
      { id:0,  x:W*0.5,  y:H*0.08, label:"GATEWAY",  col:GOLD,  buf:0 },
      { id:1,  x:W*0.2,  y:H*0.22, label:"ROUTER-A",  col:TEAL,  buf:0 },
      { id:2,  x:W*0.8,  y:H*0.22, label:"ROUTER-B",  col:TEAL,  buf:0 },
      { id:3,  x:W*0.1,  y:H*0.45, label:"SWITCH-1",  col:BLUE,  buf:0 },
      { id:4,  x:W*0.38, y:H*0.42, label:"SWITCH-2",  col:BLUE,  buf:0 },
      { id:5,  x:W*0.62, y:H*0.42, label:"SWITCH-3",  col:BLUE,  buf:0 },
      { id:6,  x:W*0.9,  y:H*0.45, label:"SWITCH-4",  col:BLUE,  buf:0 },
      { id:7,  x:W*0.15, y:H*0.68, label:"HOST-A",    col:VIO,   buf:0 },
      { id:8,  x:W*0.38, y:H*0.72, label:"HOST-B",    col:VIO,   buf:0 },
      { id:9,  x:W*0.62, y:H*0.72, label:"HOST-C",    col:VIO,   buf:0 },
      { id:10, x:W*0.85, y:H*0.68, label:"HOST-D",    col:VIO,   buf:0 },
      { id:11, x:W*0.5,  y:H*0.88, label:"SUBSTRATE", col:ROSE,  buf:0 },
    ];
    const edges: [number,number][] = [
      [0,1],[0,2],[1,2],[1,3],[1,4],[2,5],[2,6],
      [3,4],[5,6],[3,7],[4,7],[4,8],[5,9],[6,9],[6,10],
      [7,11],[8,11],[9,11],[10,11],[4,5],[8,9],
    ];

    /* Adjacency for Dijkstra */
    const adj: Map<number, number[]> = new Map();
    for (const [a, b] of edges) {
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a)!.push(b);
      adj.get(b)!.push(a);
    }

    /* BFS shortest path */
    function bfs(src: number, dst: number): number[] {
      const prev = new Map<number, number>();
      const queue = [src];
      prev.set(src, -1);
      while (queue.length) {
        const cur = queue.shift()!;
        if (cur === dst) break;
        for (const nb of (adj.get(cur) ?? [])) {
          if (!prev.has(nb)) { prev.set(nb, cur); queue.push(nb); }
        }
      }
      if (!prev.has(dst)) return [src];
      const path: number[] = [];
      let cur = dst;
      while (cur !== -1) { path.unshift(cur); cur = prev.get(cur)!; }
      return path;
    }

    const pkts: Packet[] = [];
    const cols = [TEAL, GOLD, VIO, AMB, ROSE, BLUE, GRN];
    let pktId = 0;
    let t = 0;
    const totalDelivered = { count: 0 };

    const spawn = () => {
      const src = Math.floor(Math.random() * nodes.length);
      let dst = src;
      while (dst === src) dst = Math.floor(Math.random() * nodes.length);
      const route = bfs(src, dst);
      pkts.push({
        id: pktId++, src, dst, route, hop: 0, progress: 0,
        col: cols[pktId % cols.length],
        size: 4 + Math.floor(Math.random() * 8),
      });
    };

    /* Edge activity map */
    const edgeActivity = new Map<string, number>();
    for (const [a, b] of edges) edgeActivity.set(`${Math.min(a,b)}_${Math.max(a,b)}`, 0);

    const draw = () => {
      t++;
      ctx.fillStyle = `${BG}d8`; ctx.fillRect(0, 0, W, H);

      /* Spawn packets */
      if (t % 28 === 0 && pkts.length < 22) spawn();

      /* Advance packets */
      for (const pkt of pkts) {
        pkt.progress += 0.022;
        /* Mark edge active */
        if (pkt.hop < pkt.route.length - 1) {
          const a = Math.min(pkt.route[pkt.hop], pkt.route[pkt.hop + 1]);
          const b = Math.max(pkt.route[pkt.hop], pkt.route[pkt.hop + 1]);
          const key = `${a}_${b}`;
          edgeActivity.set(key, (edgeActivity.get(key) ?? 0) + 0.3);
          nodes[pkt.route[pkt.hop]].buf = Math.min(8, nodes[pkt.route[pkt.hop]].buf + 0.05);
        }
        if (pkt.progress >= 1) { pkt.hop++; pkt.progress = 0; }
        if (pkt.hop >= pkt.route.length - 1) {
          totalDelivered.count++;
          const idx = pkts.indexOf(pkt);
          pkts.splice(idx, 1);
        }
      }

      /* Decay edge activity */
      for (const key of edgeActivity.keys()) {
        edgeActivity.set(key, (edgeActivity.get(key) ?? 0) * 0.93);
      }
      for (const nd of nodes) nd.buf *= 0.96;

      /* Draw edges */
      for (const [a, b] of edges) {
        const na = nodes[a], nb = nodes[b];
        const key = `${Math.min(a,b)}_${Math.max(a,b)}`;
        const act = edgeActivity.get(key) ?? 0;
        /* Filament glow */
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(46,240,216,${0.08 + act * 0.5})`;
        ctx.lineWidth = 0.8 + act * 2.5; ctx.stroke();
        /* Substrate filament core */
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(20,60,80,0.4)`;
        ctx.lineWidth = 0.4; ctx.stroke();
      }

      /* Draw packets */
      for (const pkt of pkts) {
        if (pkt.hop >= pkt.route.length - 1) continue;
        const na = nodes[pkt.route[pkt.hop]];
        const nb = nodes[pkt.route[pkt.hop + 1]];
        const px = na.x + (nb.x - na.x) * pkt.progress;
        const py = na.y + (nb.y - na.y) * pkt.progress;
        /* Glow halo */
        const g = ctx.createRadialGradient(px, py, 0, px, py, 14);
        g.addColorStop(0, `${pkt.col}60`);
        g.addColorStop(1, `${pkt.col}00`);
        ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        /* Packet body */
        ctx.beginPath();
        ctx.rect(px - pkt.size/2, py - 3, pkt.size, 6);
        ctx.fillStyle = pkt.col; ctx.fill();
        ctx.strokeStyle = "#fff8"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      /* Draw nodes */
      for (const nd of nodes) {
        /* Buffer glow */
        if (nd.buf > 0.1) {
          const bg2 = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, 28);
          bg2.addColorStop(0, `${nd.col}${Math.round(nd.buf * 50).toString(16).padStart(2,"0")}`);
          bg2.addColorStop(1, `${nd.col}00`);
          ctx.beginPath(); ctx.arc(nd.x, nd.y, 28, 0, Math.PI * 2);
          ctx.fillStyle = bg2; ctx.fill();
        }
        /* Node circle */
        const ng = ctx.createRadialGradient(nd.x-2, nd.y-2, 0, nd.x, nd.y, 12);
        ng.addColorStop(0, "#fff");
        ng.addColorStop(0.4, nd.col);
        ng.addColorStop(1, `${nd.col}80`);
        ctx.beginPath(); ctx.arc(nd.x, nd.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();
        /* Label */
        ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = nd.col;
        ctx.fillText(nd.label, nd.x, nd.y + 14);
        /* Buffer bar */
        if (nd.buf > 0.1) {
          ctx.fillStyle = `${nd.col}60`;
          ctx.fillRect(nd.x - 8, nd.y + 22, nd.buf * 16, 2);
        }
      }

      /* Stats */
      ctx.font = `9px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}70`;
      ctx.fillText(`PACKETS IN-FLIGHT: ${pkts.length}  ·  DELIVERED: ${totalDelivered.count}  ·  t = ${t}`, 8, 6);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={640} height={440}
      style={{ width:"100%", maxWidth:640, borderRadius:12,
        border:`1px solid ${VIO}18`, background:BG,
        boxShadow:"0 4px 60px rgba(0,0,0,0.8)" }} />
  );
}

/* ── Recursive map orbit canvas ────────────────────────── */
function RecursiveCanvas({ R }: { R: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const Rref   = useRef(R);
  useEffect(() => { Rref.current = R; }, [R]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    let t = 0;
    let x = 0.42;

    const histX: number[] = [];
    const orbitX: number[] = [];
    const orbitY: number[] = [];

    const draw = () => {
      t++;
      const Rv = Rref.current;
      /* Logistic map iteration */
      x = Rv * x * (1 - x);
      histX.push(x);
      if (histX.length > 400) histX.shift();

      /* Phase portrait points (xₙ vs xₙ₊₁) */
      if (histX.length > 1) {
        orbitX.push(histX[histX.length - 2]);
        orbitY.push(histX[histX.length - 1]);
        if (orbitX.length > 300) { orbitX.shift(); orbitY.shift(); }
      }

      ctx.fillStyle = `${BG}c8`; ctx.fillRect(0, 0, W, H);

      /* Left: time series */
      const leftW = W * 0.55, padL = 30, padT = 24;
      const serH = H - padT - 28;
      ctx.fillStyle = "#ffffff04"; ctx.fillRect(padL, padT, leftW - padL - 6, serH);
      ctx.strokeStyle = `${TEAL}18`; ctx.lineWidth = 0.5;
      ctx.strokeRect(padL, padT, leftW - padL - 6, serH);

      /* Grid lines */
      for (let v = 0; v <= 4; v++) {
        const gy = padT + (1 - v/4) * serH;
        ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(leftW - 6, gy);
        ctx.strokeStyle = `${TEAL}10`; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.font = `7px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${TEAL}40`;
        ctx.fillText((v/4).toFixed(2), padL - 3, gy);
      }

      /* Time series plot */
      ctx.beginPath();
      for (let k = 0; k < histX.length; k++) {
        const px = padL + (k / 400) * (leftW - padL - 6);
        const py = padT + (1 - histX[k]) * serH;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.stroke();

      /* Current point */
      const curX2 = padL + ((histX.length - 1) / 400) * (leftW - padL - 6);
      const curY2 = padT + (1 - x) * serH;
      ctx.beginPath(); ctx.arc(curX2, curY2, 4, 0, Math.PI * 2);
      ctx.fillStyle = GOLD; ctx.fill();

      /* Labels */
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}70`;
      ctx.fillText(`x(t)  ·  R = ${Rv.toFixed(3)}  ·  xₙ = ${x.toFixed(4)}`, (padL + leftW - 6) / 2, padT + serH + 4);

      /* Right: phase portrait xₙ vs xₙ₊₁ */
      const ox = leftW + 10, oy = padT, os = H - padT - 28;
      ctx.fillStyle = "#ffffff04"; ctx.fillRect(ox, oy, os, os);
      ctx.strokeStyle = `${VIO}18`; ctx.lineWidth = 0.5;
      ctx.strokeRect(ox, oy, os, os);

      /* Parabola reference f(x) = R·x·(1-x) */
      ctx.beginPath();
      for (let xi = 0; xi <= 100; xi++) {
        const xv = xi / 100;
        const yv = Rv * xv * (1 - xv);
        const px = ox + xv * os;
        const py = oy + (1 - yv) * os;
        if (xi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `${AMB}50`; ctx.lineWidth = 1.5; ctx.stroke();

      /* Diagonal x=y */
      ctx.beginPath(); ctx.moveTo(ox, oy + os); ctx.lineTo(ox + os, oy);
      ctx.strokeStyle = `${BLUE}20`; ctx.lineWidth = 0.7;
      ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);

      /* Orbit web */
      if (orbitX.length > 1) {
        ctx.beginPath();
        for (let k = 0; k < orbitX.length; k++) {
          const px = ox + orbitX[k] * os;
          const py = oy + (1 - orbitY[k]) * os;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `${VIO}40`; ctx.lineWidth = 1.2; ctx.stroke();
        /* Last point */
        const lx = ox + orbitX[orbitX.length-1] * os;
        const ly = oy + (1 - orbitY[orbitY.length-1]) * os;
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
        ctx.fillStyle = ROSE; ctx.fill();
      }

      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${VIO}70`;
      ctx.fillText("xₙ₊₁ vs xₙ  ·  orbit web  (AMBER = f(x) = R·x·(1-x))", ox + os/2, oy + os + 4);

      /* Fixed point indicator */
      const xStar = 1 - 1 / Rv;
      if (xStar > 0 && xStar < 1) {
        const fpx = ox + xStar * os;
        const fpy = oy + (1 - xStar) * os;
        ctx.beginPath(); ctx.arc(fpx, fpy, 5, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
        ctx.fillStyle = `${GOLD}80`;
        ctx.fillText(`x* = ${xStar.toFixed(3)}`, fpx + 4, fpy - 2);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={560} height={240}
      style={{ width:"100%", maxWidth:560, borderRadius:10,
        border:`1px solid ${AMB}18`, background:BG }} />
  );
}

/* ══════════════════════════════════════════════════════
   LASER SELECTIVE SOLDERING · NODE BUILDER
   Gantry laser heats solder pads through state machine:
   UNSOLDERED → HEATING → LIQUID → COOLING → SOLDERED
══════════════════════════════════════════════════════ */
function LaserSolderCanvas() {
  const ref   = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const [pwr,  setPwr]  = useState(1.0);
  const [auto, setAuto] = useState(true);
  const pwrRef  = useRef(1.0);
  const autoRef = useRef(true);
  useEffect(()=>{ pwrRef.current  = pwr;  }, [pwr]);
  useEffect(()=>{ autoRef.current = auto; }, [auto]);

  useEffect(()=>{
    const cv = ref.current; if(!cv) return;
    const W=900, H=500; cv.width=W; cv.height=H;
    const ctx = cv.getContext("2d")!;

    /* ── PCB layout ──────────────────────────────── */
    const BX=30, BY=100, BW=620, BH=370;
    const COLS=7, ROWS=5, NP=COLS*ROWS;
    const PAD_R=15;
    const T_ROOM=25, T_LIQ=183, T_SOL=175;

    const pads = Array.from({length:NP},(_,i)=>({
      id:i,
      x: BX + (i%COLS + 0.65) / COLS * BW,
      y: BY + (Math.floor(i/COLS) + 0.6) / ROWS * BH,
    }));

    /* deterministic trace map */
    const traces: {a:number;b:number}[] = [];
    const seed = (n:number) => (n*2654435761)%4294967296/4294967296;
    for(let r=0;r<ROWS;r++)
      for(let c=0;c<COLS-1;c++)
        if(seed(r*20+c) > 0.28) traces.push({a:r*COLS+c, b:r*COLS+c+1});
    for(let r=0;r<ROWS-1;r++)
      for(let c=0;c<COLS;c++)
        if(seed(100+r*7+c) > 0.45) traces.push({a:r*COLS+c, b:(r+1)*COLS+c});

    /* ── State arrays ────────────────────────────── */
    const temps   = new Float32Array(NP).fill(T_ROOM);
    // 0=UNSOLDERED 1=HEATING 2=LIQUID 3=COOLING 4=SOLDERED
    const states  = new Uint8Array(NP);
    const flow    = new Float32Array(NP); // solder flow 0→1

    /* ── Laser head state ────────────────────────── */
    let headX = BX + BW/2;
    let targetId = -1;
    let phase: "SEEK"|"MOVE"|"HEAT"|"DONE"|"COMPLETE" = "SEEK";
    let completedJoints = 0;
    let totalJoints = 0;

    /* ── Particles ───────────────────────────────── */
    type HP = {x:number;y:number;vx:number;vy:number;life:number;ml:number};
    const hps: HP[] = [];

    /* ── Helpers ─────────────────────────────────── */
    const findNext = () => {
      let best=-1, bestD=Infinity;
      for(const p of pads){
        if(states[p.id]!==0) continue;
        const d=Math.abs(p.x-headX);
        if(d<bestD){bestD=d;best=p.id;}
      }
      return best;
    };

    let t=0;
    const draw = ()=>{
      const P = pwrRef.current;
      const AUTO = autoRef.current;
      t++;

      /* ── State machine ───────────────────────── */
      if(AUTO){
        if(phase==="SEEK"||phase==="DONE"){
          targetId=findNext();
          phase = targetId>=0 ? "MOVE" : "COMPLETE";
        }
        if(phase==="MOVE"&&targetId>=0){
          const tx=pads[targetId].x;
          const dx=tx-headX;
          if(Math.abs(dx)<3){headX=tx; phase="HEAT"; states[targetId]=1;}
          else headX+=Math.sign(dx)*Math.min(4,Math.abs(dx));
        }
        if(phase==="HEAT"&&targetId>=0){
          const id=targetId;
          // Heat-up: dT = P * rate * (T_LIQ - T) + constant injection
          temps[id] = Math.min(T_LIQ+60, temps[id]+P*(0.018*(T_LIQ-temps[id]+5)+10));
          if(states[id]===1&&temps[id]>=T_LIQ) states[id]=2;
          if(states[id]===2){
            flow[id] = Math.min(1, flow[id]+0.015*P);
            if(t%3===0) hps.push({
              x:pads[id].x+(Math.random()-0.5)*24,
              y:pads[id].y+(Math.random()-0.5)*12,
              vx:(Math.random()-0.5)*1.2, vy:-1.5-Math.random()*2,
              life:40, ml:40,
            });
            if(flow[id]>=1){ states[id]=3; phase="DONE"; }
          }
        }
      }

      /* ── Cool all pads ───────────────────────── */
      for(let i=0;i<NP;i++){
        if(i===targetId&&phase==="HEAT") continue;
        if(temps[i]>T_ROOM) temps[i]=Math.max(T_ROOM, temps[i]-0.8);
        if(states[i]===3&&temps[i]<=T_SOL){
          states[i]=4; completedJoints++; totalJoints++;
        }
      }

      /* ── Particle update ─────────────────────── */
      for(let i=hps.length-1;i>=0;i--){
        const p=hps[i];
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life--;
        if(p.life<=0) hps.splice(i,1);
      }

      /* ════ DRAW ════════════════════════════════ */
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);

      /* PCB substrate */
      const pcbGrd=ctx.createLinearGradient(BX,BY,BX+BW,BY+BH);
      pcbGrd.addColorStop(0,"#0b1c0b"); pcbGrd.addColorStop(1,"#0e200e");
      ctx.fillStyle=pcbGrd; ctx.fillRect(BX,BY,BW,BH);
      ctx.strokeStyle="rgba(46,180,60,0.18)"; ctx.lineWidth=1;
      ctx.strokeRect(BX,BY,BW,BH);

      /* PCB grid */
      ctx.setLineDash([2,8]); ctx.strokeStyle="rgba(40,80,40,0.22)"; ctx.lineWidth=0.4;
      for(let gx=BX;gx<=BX+BW;gx+=22){
        ctx.beginPath();ctx.moveTo(gx,BY);ctx.lineTo(gx,BY+BH);ctx.stroke();
      }
      for(let gy=BY;gy<=BY+BH;gy+=22){
        ctx.beginPath();ctx.moveTo(BX,gy);ctx.lineTo(BX+BW,gy);ctx.stroke();
      }
      ctx.setLineDash([]);

      /* Silkscreen label */
      ctx.fillStyle="rgba(255,255,255,0.06)"; ctx.font="10px 'Space Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AETHER-PCB-35 REV.A",BX+8,BY+14);

      /* Traces */
      for(const tr of traces){
        const pa=pads[tr.a], pb=pads[tr.b];
        const bothDone = states[tr.a]===4&&states[tr.b]===4;
        const anyHot   = states[tr.a]>=1&&states[tr.a]<=3 || states[tr.b]>=1&&states[tr.b]<=3;
        ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
        if(bothDone){
          ctx.strokeStyle="rgba(201,168,76,0.55)";
          ctx.lineWidth=2; ctx.shadowColor=GOLD; ctx.shadowBlur=6;
        } else if(anyHot){
          ctx.strokeStyle="rgba(255,150,30,0.3)"; ctx.lineWidth=1.5; ctx.shadowBlur=0;
        } else {
          ctx.strokeStyle="rgba(120,140,120,0.12)"; ctx.lineWidth=1; ctx.shadowBlur=0;
        }
        ctx.stroke(); ctx.shadowBlur=0;
      }

      /* Heat bloom (per pad) */
      for(const p of pads){
        const temp=temps[p.id];
        if(temp>T_ROOM+15){
          const heat=(temp-T_ROOM)/(T_LIQ+60-T_ROOM);
          const br=PAD_R*(2+heat*3);
          const hg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,br);
          const al=Math.min(0.55, heat*0.65);
          hg.addColorStop(0,`rgba(255,110,10,${al})`);
          hg.addColorStop(0.5,`rgba(255,50,5,${al*0.5})`);
          hg.addColorStop(1,"transparent");
          ctx.fillStyle=hg; ctx.beginPath();ctx.arc(p.x,p.y,br,0,Math.PI*2);ctx.fill();
        }
      }

      /* Pads */
      for(const p of pads){
        const st=states[p.id], temp=temps[p.id];
        /* Colours */
        let padCol=GOLD;
        if(st===1) padCol=`hsl(${55-45*(temp-T_ROOM)/(T_LIQ-T_ROOM)},90%,55%)`;
        if(st===2) padCol="#d8d0c0"; // liquid silver
        if(st===3) padCol="#c0b8a8"; // cooling
        if(st===4) padCol="#b8b0a0"; // solidified

        /* Glow */
        if(st>=1&&st<=3){ctx.shadowColor=st===2?"#ffffff":AMB;ctx.shadowBlur=st===2?18:10;}

        /* Pad disc */
        ctx.fillStyle=padCol;
        ctx.beginPath(); ctx.arc(p.x,p.y,PAD_R,0,Math.PI*2); ctx.fill();

        /* Solder flow fill */
        if(st===2||st===3){
          ctx.fillStyle=`rgba(210,205,195,${flow[p.id]*0.95})`;
          ctx.beginPath();ctx.arc(p.x,p.y,PAD_R*0.9,0,Math.PI*2);ctx.fill();
          /* Ripple on liquid */
          if(st===2){
            const rr=PAD_R*0.6*(0.6+0.4*Math.sin(t*0.3+p.id));
            ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);
            ctx.strokeStyle=`rgba(255,255,255,0.25)`;ctx.lineWidth=1.5;ctx.stroke();
          }
        }

        ctx.shadowBlur=0;

        /* Ring */
        ctx.beginPath();ctx.arc(p.x,p.y,PAD_R,0,Math.PI*2);
        ctx.strokeStyle=st===4?"rgba(201,168,76,0.7)":"rgba(90,110,90,0.35)";
        ctx.lineWidth=1.5; ctx.stroke();
        /* Centre drill hole */
        ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
        ctx.fillStyle="#050d05"; ctx.fill();

        /* Temp readout above hot pads */
        if(temp>T_ROOM+30&&st<4){
          ctx.fillStyle=st===2?"rgba(255,255,200,0.9)":"rgba(255,180,80,0.7)";
          ctx.font="9px 'Space Mono',monospace"; ctx.textAlign="center";
          ctx.fillText(`${temp.toFixed(0)}°`,p.x,p.y-PAD_R-5);
        }
      }

      /* Heat particles */
      for(const p of hps){
        const a=p.life/p.ml;
        ctx.fillStyle=`rgba(255,160,30,${a*0.75})`;
        ctx.beginPath();ctx.arc(p.x,p.y,2.2*a,0,Math.PI*2);ctx.fill();
      }

      /* ── Gantry rail ─────────────────────────── */
      /* Rail beam */
      ctx.strokeStyle="rgba(100,130,160,0.35)"; ctx.lineWidth=6;
      ctx.beginPath();ctx.moveTo(BX-8,BY-30);ctx.lineTo(BX+BW+8,BY-30);ctx.stroke();
      /* Rail highlights */
      ctx.strokeStyle="rgba(180,210,240,0.2)"; ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(BX-8,BY-33);ctx.lineTo(BX+BW+8,BY-33);ctx.stroke();

      /* Laser head carriage */
      const HW=48, HH=36;
      const hLeft=headX-HW/2, hTop=BY-30-HH/2;
      ctx.fillStyle="#1a2a3a";
      ctx.beginPath();ctx.roundRect(hLeft,hTop,HW,HH,5);ctx.fill();
      ctx.strokeStyle="rgba(68,170,255,0.4)"; ctx.lineWidth=1.2;
      ctx.beginPath();ctx.roundRect(hLeft,hTop,HW,HH,5);ctx.stroke();
      /* Aperture glow */
      const apY=hTop+HH;
      const apGrd=ctx.createRadialGradient(headX,apY,0,headX,apY,10);
      apGrd.addColorStop(0,"rgba(255,80,20,0.9)"); apGrd.addColorStop(1,"transparent");
      ctx.fillStyle=apGrd; ctx.beginPath();ctx.arc(headX,apY,10,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="rgba(255,80,20,0.95)";
      ctx.beginPath();ctx.arc(headX,apY,3.5,0,Math.PI*2);ctx.fill();
      /* Head label */
      ctx.fillStyle="rgba(68,170,255,0.5)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("LASER",headX,hTop+12);ctx.fillText("HEAD",headX,hTop+22);

      /* Beam (HEAT phase) */
      if(phase==="HEAT"&&targetId>=0){
        const tp=pads[targetId];
        /* Outer glow beam */
        ctx.beginPath();ctx.moveTo(headX,apY);ctx.lineTo(tp.x,tp.y);
        ctx.strokeStyle=`rgba(255,60,10,${0.25+0.15*Math.sin(t*0.4)})`;
        ctx.lineWidth=8; ctx.shadowColor="#ff4400"; ctx.shadowBlur=20; ctx.stroke(); ctx.shadowBlur=0;
        /* Core beam */
        ctx.beginPath();ctx.moveTo(headX,apY);ctx.lineTo(tp.x,tp.y);
        ctx.strokeStyle=`rgba(255,200,50,${0.7+0.2*Math.sin(t*0.3)})`;
        ctx.lineWidth=2; ctx.shadowColor="#ffff00"; ctx.shadowBlur=8; ctx.stroke(); ctx.shadowBlur=0;
        /* Spot */
        const sr=5+2*Math.sin(t*0.35);
        ctx.beginPath();ctx.arc(tp.x,tp.y,sr,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,180,0.95)"; ctx.shadowColor="#fff"; ctx.shadowBlur=16;
        ctx.fill(); ctx.shadowBlur=0;
      } else if(phase==="MOVE"&&targetId>=0){
        /* Dim travel beam */
        const tp=pads[targetId];
        ctx.beginPath();ctx.moveTo(headX,apY);ctx.lineTo(tp.x,tp.y);
        ctx.strokeStyle="rgba(255,60,10,0.15)"; ctx.lineWidth=1.5; ctx.stroke();
      }

      /* ── HUD (right panel) ───────────────────── */
      const HX=BX+BW+16, HY=BY, HW2=W-HX-8, HH2=BH;
      ctx.fillStyle="rgba(1,4,12,0.85)"; ctx.fillRect(HX,HY,HW2,HH2);
      ctx.strokeStyle="rgba(46,240,216,0.15)"; ctx.lineWidth=1; ctx.strokeRect(HX,HY,HW2,HH2);

      /* HUD Header */
      ctx.fillStyle=TEAL; ctx.font="bold 12px 'Space Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("LASER SOLDER",HX+10,HY+20);
      ctx.fillStyle=DIM; ctx.font="9px 'Space Mono',monospace";
      ctx.fillText("NODE BUILDER",HX+10,HY+33);
      ctx.strokeStyle=`${TEAL}20`; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(HX+10,HY+40);ctx.lineTo(HX+HW2-10,HY+40);ctx.stroke();

      /* Status rows */
      const hRows:[string,string,string][]=[
        ["PHASE", phase,
          phase==="HEAT"?AMB:phase==="COMPLETE"?GRN:phase==="MOVE"?BLUE:TEAL],
        ["JOINTS",`${completedJoints}/${NP}`, GRN],
        ["POWER", `${(pwrRef.current*100).toFixed(0)}%`, AMB],
        ["TARGET",targetId>=0?`PAD-${String(targetId).padStart(2,"0")}`:"--",VIO],
        ["TEMP",  targetId>=0?`${temps[targetId].toFixed(0)}°C`:"--", ROSE],
        ["TRACES",`${traces.filter(tr=>states[tr.a]===4&&states[tr.b]===4).length}/${traces.length}`,GOLD],
      ];
      hRows.forEach(([lbl,val,col],i)=>{
        const ry=HY+50+i*40;
        ctx.fillStyle="rgba(255,255,255,0.04)"; ctx.fillRect(HX+10,ry,HW2-20,30);
        ctx.fillStyle=`${col}70`; ctx.font="8px 'Space Mono',monospace"; ctx.textAlign="left";
        ctx.fillText(lbl,HX+16,ry+11);
        ctx.fillStyle=col; ctx.font="bold 13px 'Space Mono',monospace";
        ctx.fillText(val,HX+16,ry+26);
      });

      /* Progress bar */
      const prog=completedJoints/NP;
      const barY2=HY+HH2-60, barW=HW2-20;
      ctx.fillStyle="rgba(46,240,216,0.08)"; ctx.fillRect(HX+10,barY2,barW,10);
      ctx.fillStyle=prog>=1?GRN:TEAL; ctx.shadowColor=TEAL; ctx.shadowBlur=5;
      ctx.fillRect(HX+10,barY2,barW*prog,10); ctx.shadowBlur=0;
      ctx.fillStyle=TEAL; ctx.font="9px 'Space Mono',monospace"; ctx.textAlign="left";
      ctx.fillText(`${(prog*100).toFixed(0)}% COMPLETE`,HX+10,barY2+24);
      if(prog>=1){
        ctx.fillStyle=GRN; ctx.font="bold 11px 'Space Mono',monospace";
        ctx.shadowColor=GRN; ctx.shadowBlur=10;
        ctx.fillText("✓ ALL JOINTS SOLDERED",HX+10,barY2+40);
        ctx.shadowBlur=0;
      }

      /* Temperature scale */
      const scaleX=HX+HW2-22, scaleY=HY+50, scaleH=210;
      ctx.strokeStyle="rgba(46,240,216,0.1)"; ctx.lineWidth=1;
      ctx.strokeRect(scaleX,scaleY,12,scaleH);
      for(let si=0;si<scaleH;si++){
        const frac=1-si/scaleH;
        const r=Math.floor(255*Math.min(1,frac*2));
        const g=Math.floor(255*Math.min(1,(1-frac)*2));
        ctx.fillStyle=`rgb(${r},${g},0)`;
        ctx.fillRect(scaleX,scaleY+si,12,1);
      }
      [25,183,250].forEach(tval=>{
        const sy=scaleY+scaleH-(tval-25)/(280-25)*scaleH;
        ctx.strokeStyle="rgba(255,255,255,0.3)"; ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(scaleX-4,sy);ctx.lineTo(scaleX+12,sy);ctx.stroke();
        ctx.fillStyle="rgba(255,255,255,0.4)"; ctx.font="8px 'Space Mono',monospace"; ctx.textAlign="right";
        ctx.fillText(`${tval}°`,scaleX-6,sy+3);
      });

      /* Page title bar */
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="10px 'Space Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("LASER SELECTIVE SOLDERING · NODE CONNECTOR · PCB ASSEMBLY AUTOMATION",BX,BY-46);

      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return (
    <div>
      <canvas ref={ref} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
      <div style={{display:"flex",gap:"2rem",flexWrap:"wrap",padding:"0.75rem 0 0",alignItems:"center"}}>
        <label style={{display:"flex",flexDirection:"column",gap:3,fontSize:"0.75rem",fontFamily:"'Space Mono',monospace",color:AMB,width:220}}>
          <span>Laser Power: {(pwr*100).toFixed(0)}%</span>
          <input type="range" min={0.3} max={2.5} step={0.1} value={pwr}
            onChange={e=>setPwr(+e.target.value)} style={{accentColor:AMB}}/>
        </label>
        <button
          onClick={()=>setAuto(m=>!m)}
          style={{fontFamily:"'Space Mono',monospace",fontSize:11,padding:"6px 14px",borderRadius:5,
            cursor:"pointer",border:`1px solid ${auto?GRN:DIM}50`,
            background:`${auto?GRN:DIM}12`,color:auto?GRN:DIM,letterSpacing:1}}>
          AUTO: {auto?"ON":"OFF"}
        </button>
      </div>
    </div>
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:22 }} />
    </div>
  );
}
function Sl({ label, val, min, max, step, col, fmt, onChange }: {
  label: string; val: number; min: number; max: number; step: number;
  col: string; fmt?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:9, color:col, marginBottom:3 }}>
        <span>{label}</span><span>{fmt ? fmt(val) : val.toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}

function CavityComputerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 240;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const modes=[
      { n:1, col:"#2ef0d8" },{ n:2, col:"#9966ff" },
      { n:3, col:"#c9a84c" },{ n:4, col:"#ff4477" },
    ];
    const photons: {x:number,y:number,vx:number,vy:number,col:string,life:number}[]=[];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      ctx.beginPath(); ctx.arc(cx,cy,90,0,Math.PI*2);
      ctx.strokeStyle="rgba(46,240,216,0.12)"; ctx.lineWidth=40; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,90,0,Math.PI*2);
      ctx.strokeStyle="rgba(46,240,216,0.08)"; ctx.lineWidth=1; ctx.stroke();
      modes.forEach((m,i)=>{
        const ang=t*0.02+i*(Math.PI/2);
        const r=70+10*Math.sin(t*0.05*m.n);
        const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2);
        ctx.fillStyle=m.col; ctx.shadowColor=m.col; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
        if(Math.random()<0.08) photons.push({ x, y, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3, col:m.col, life:40 });
      });
      for(let i=photons.length-1;i>=0;i--){
        const p=photons[i];
        p.x+=p.vx; p.y+=p.vy; p.life--;
        ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2);
        ctx.fillStyle=p.col+(Math.floor(p.life*6).toString(16).padStart(2,"0"));
        ctx.fill();
        if(p.life<=0) photons.splice(i,1);
      }
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,20+4*Math.sin(t*0.08));
      g.addColorStop(0,"#2ef0d8cc"); g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,20+4*Math.sin(t*0.08),0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CAVITY COMPUTER · OPTICAL CAVITY · CAVITY QED · PHOTON MODES · QUANTUM COMPUTING · AETHER",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function CavityComputerPage() {
  const [Re,        setRe]       = useState(400);
  const [lidSpeed,  setLidSpeed] = useState(1.0);
  const [showField, setShowField]= useState(true);
  const [mapR,      setMapR]     = useState(3.72);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(46,240,216,0.07)", border:"1px solid rgba(46,240,216,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:TEAL, textTransform:"uppercase", fontFamily:mono, marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)",
          borderLeft:`3px solid ${TEAL}`, borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Space Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Cavity Computer · Optical Cavity · Cavity QED · Photon Modes · Quantum Computing
          </h2>
          <p style={{ fontFamily:mono, fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Four photon modes (teal · violet · gold · rose) orbiting the optical cavity in a quantum-dot pattern,
            with spontaneous photon emission bursts radiating outward and a pulsing core — the live AETHER
            cavity QED quantum computing simulation.
          </p>
          <CavityComputerCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${TEAL}07, ${VIO}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:4, marginBottom:10 }}>
          AETHER · CAVITY COMPUTER · FLUID SUBSTRATE · RECURSIVE LOOP · PACKET SWITCHING
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(22px,4.5vw,48px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          ENCLOSED LOOP<span style={{ color:TEAL }}>·</span>RECURSIVE<span style={{ color:VIO }}>·</span>COMPUTATION
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:16 }}>
          Fluid-Filled Cavity · Space-Time Filament Substrate · Packet Switching · Navier-Stokes
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:740, margin:"0 auto", lineHeight:1.9 }}>
          A fluid-filled cavity is a computation. The vortex loops are recursive feedback cycles.
          The filaments of the space-time fabric are data buses routing information packets
          through possibility space. Navier-Stokes governs the fluid; Dijkstra routes the packets;
          the logistic map generates the recursive orbit. Three mathematical substrates, one coherent system.
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Section I: Cavity */}
        <SH n="I" title="Fluid-Filled Cavity · Navier-Stokes Simulation"
          sub="Lid-driven cavity: vorticity-stream function method · ∇²ψ = −ω · each particle = a computation token tracing recursive loops"
          col={TEAL} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <CavityCanvas Re={Re} lidSpeed={lidSpeed} showField={showField} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              COLOR = stream function ψ (blue=low, red=high)  ·  ARROWS = velocity field (u,v)  ·
              DOTS = computation tokens (colored by loop count)  ·  GOLD LINE = moving lid (drives the vortex)  ·
              CORNER LOOPS = recursive ∮ integration symbols  ·  BOTTOM = cumulative ∮ loops completed
            </div>
          </div>
          <div style={{ flex:"0 0 230px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${TEAL}07`, border:`1px solid ${TEAL}22`, borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:TEAL, letterSpacing:1, marginBottom:12 }}>
                CAVITY PARAMETERS
              </div>
              <Sl label="Re REYNOLDS NUMBER" val={Re} min={50} max={2000} step={50} col={TEAL}
                fmt={v => v.toFixed(0)} onChange={setRe} />
              <Sl label="U LID SPEED (m/s)" val={lidSpeed} min={0.1} max={3.0} step={0.1} col={GOLD}
                onChange={setLidSpeed} />
              <button onClick={() => setShowField(f => !f)}
                style={{ fontFamily:mono, fontSize:8, padding:"6px 10px", borderRadius:5,
                  cursor:"pointer", border:`1px solid ${showField ? BLUE : DIM}40`,
                  background:`${showField ? BLUE : DIM}10`, color: showField ? BLUE : DIM,
                  width:"100%", letterSpacing:1, marginTop:4 }}>
                {showField ? "HIDE VELOCITY FIELD" : "SHOW VELOCITY FIELD"}
              </button>
            </div>
            <div style={{ background:`${VIO}07`, border:`1px solid ${VIO}20`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:VIO, letterSpacing:1, marginBottom:8 }}>
                WHY CAVITY = COMPUTATION
              </div>
              {[
                ["Closed loop", "Fluid circulates in a closed path — the ∮ integral. No information escapes."],
                ["Recursive", "Each revolution of a particle IS one recursion: x₊₁ = T(x) where T is the Poincaré return map."],
                ["Re = complexity", "Low Re → stable fixed point. High Re → period-doubling bifurcations → chaos. Exactly like logistic map parameter R."],
                ["Turing complete", "The vorticity field ω(x,y,t) is a 2D partial differential equation — capable of universal computation."],
              ].map(([title, text]) => (
                <div key={title as string} style={{ marginBottom:10, borderBottom:`1px solid ${VIO}15`, paddingBottom:8 }}>
                  <div style={{ fontFamily:mono, fontSize:8, color:VIO, marginBottom:3 }}>{title}</div>
                  <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section II: Packet switching */}
        <SH n="II" title="Filament Packet Switching Network"
          sub="Space-time fabric as network substrate · BFS/Dijkstra routing · glowing filaments activate on packet transit"
          col={VIO} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <PacketCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              NODES = routing elements (GOLD=gateway, TEAL=router, BLUE=switch, VIO=host, ROSE=substrate)  ·
              FILAMENTS = space-time fabric connections (glow intensity = current traffic)  ·
              PACKETS = colored rectangles moving along shortest BFS path  ·
              BUFFER BAR = node queue depth  ·  TOP = live network stats
            </div>
          </div>
          <div style={{ flex:"0 0 230px", background:`${VIO}06`,
            border:`1px solid ${VIO}20`, borderRadius:10, padding:"16px 18px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:VIO, letterSpacing:1, marginBottom:12 }}>
              PACKET SWITCHING MATHEMATICS
            </div>
            {[
              { eq:"d(v) = min(d(u) + w(u,v))", desc:"Dijkstra relaxation — shortest path through filament topology" },
              { eq:"T = Σₖ |pₖ| / Σₖ τₖ", desc:"Throughput: total bytes delivered per unit time" },
              { eq:"L = Σ_hops × τ_hop", desc:"Latency: sum of per-hop transmission delays" },
              { eq:"B(n) = Σᵢ pᵢ / C", desc:"Bandwidth-delay product: bits in flight on a link" },
              { eq:"|Ψ_packet⟩ = Σₖ cₖ|route_k⟩", desc:"Quantum routing: packet exists in superposition of all paths until observed (measured at destination)" },
              { eq:"P(route_k) = |cₖ|²", desc:"Born rule: probability of packet selecting route k" },
            ].map(e => (
              <div key={e.eq} style={{ marginBottom:10, borderBottom:`1px solid ${VIO}12`, paddingBottom:8 }}>
                <div style={{ fontFamily:mono, fontSize:9, color:VIO, marginBottom:3 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section III: Recursive map */}
        <SH n="III" title="Recursive Computation Orbit"
          sub="Logistic map x(t+1) = R·x(t)·(1−x(t)) — the universal model of enclosed loop recursion"
          col={AMB} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 480px" }}>
            <RecursiveCanvas R={mapR} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              LEFT: x(t) time series (teal line)  ·  RIGHT: orbit web xₙ₊₁ vs xₙ (violet)  ·
              AMBER CURVE = parabola R·x·(1-x)  ·  BLUE DIAGONAL = identity x=y  ·
              GOLD CIRCLE = fixed point x* = 1 − 1/R  ·  ROSE DOT = current orbit position
            </div>
          </div>
          <div style={{ flex:"0 0 280px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${AMB}07`, border:`1px solid ${AMB}22`, borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:AMB, letterSpacing:1, marginBottom:10 }}>
                MAP PARAMETER R
              </div>
              <Sl label="R GROWTH RATE" val={mapR} min={1.0} max={4.0} step={0.005} col={AMB}
                onChange={setMapR} />
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.75, marginTop:8 }}>
                {mapR < 1   && "Extinction: xₙ → 0. No computation — state collapses."}
                {mapR >= 1 && mapR < 3 && `Fixed point: xₙ → x* = ${(1-1/mapR).toFixed(4)}. Stable recursion — cavity locks to single vortex.`}
                {mapR >= 3 && mapR < 3.449 && "Period-2 oscillation: two-cavity vortex pair. System alternates between two recursive states."}
                {mapR >= 3.449 && mapR < 3.544 && "Period-4: four-state recursion. Secondary corner vortices are born."}
                {mapR >= 3.544 && mapR < 3.568 && "Period-8 cascade: 8-cycle. Approaching chaos — like high-Re turbulence onset."}
                {mapR >= 3.568 && mapR < 3.83 && "Chaos: infinite-period recursion. Deterministic but unpredictable — turbulent cavity flow."}
                {mapR >= 3.83 && mapR < 4.0 && "Chaos with periodic windows. The cavity intermittently re-locks to a coherent vortex."}
                {mapR >= 4.0 && "Escape: |xₙ| diverges. Cavity flow blow-up — numerical instability or physical boundary loss."}
              </div>
            </div>
            <div style={{ background:`${ROSE}07`, border:`1px solid ${ROSE}20`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:ROSE, letterSpacing:1, marginBottom:8 }}>
                CAVITY ↔ LOGISTIC MAP ISOMORPHISM
              </div>
              <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.75 }}>
                The Poincaré return map of the lid-driven cavity
                IS a logistic-like map: each revolution of a fluid parcel
                maps its x-position xₙ to xₙ₊₁ = f(xₙ) at Re →∞.
                The bifurcation structure R=3 → period-doubling
                mirrors Re=1000 → periodic → Re=3000 → chaotic cavity flow.
                The universal Feigenbaum constant δ = 4.669... governs both.
              </div>
            </div>
          </div>
        </div>

        {/* Section IV: Full mathematics */}
        <SH n="IV" title="Mathematical Framework"
          sub="The three substrates: Navier-Stokes fluid · logistic recursion · packet graph · unified via information theory"
          col={BLUE} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { title:"NAVIER-STOKES · CAVITY", col:TEAL, eqs:[
              "∂u/∂t + (u·∇)u = −∇p + ν∇²u",
              "∇·u = 0  (incompressibility)",
              "ω = ∂v/∂x − ∂u/∂y  (vorticity)",
              "∇²ψ = −ω  (Poisson equation)",
              "u = ∂ψ/∂y,  v = −∂ψ/∂x",
              "Re = U·L/ν  (Reynolds number)",
            ], desc:"The fluid in the cavity is the computational substrate. Incompressibility = information conservation (no bits created or destroyed). The closed ψ contours ARE the recursive computation cycles. ν = viscosity = computational damping." },
            { title:"VORTICITY TRANSPORT", col:VIO, eqs:[
              "∂ω/∂t + u·∂ω/∂x + v·∂ω/∂y = ν∇²ω",
              "Jacobi solve: ψᵢⱼ = (ψᵢ₊₁ⱼ + ψᵢ₋₁ⱼ + ψᵢⱼ₊₁ + ψᵢⱼ₋₁ + h²ωᵢⱼ)/4",
              "Top BC: ω_top = −2ψ(N−1,j)/h² − 2U/h",
              "Wall BC: ω_wall = −2ψ_adjacent/h²",
              "∮ ω dA = Γ  (circulation = conserved)",
            ], desc:"Jacobi iteration solves ∇²ψ = −ω each frame — this IS the recursive computation. Each Jacobi sweep is one iteration of the solver, analogous to one pass through the logistic map. Convergence = reaching the fixed point x* = 1−1/R." },
            { title:"PACKET SWITCHING SUBSTRATE", col:BLUE, eqs:[
              "G = (V, E, w)  (weighted graph)",
              "d*(u,v) = min over paths P: Σₑ∈P w(e)",
              "Dijkstra: d(v) ← min(d(v), d(u)+w(u,v))",
              "TTL: each hop decrements counter",
              "Buffer: B(n) = queue of packets at node n",
              "Throughput: T = delivered / elapsed_time",
            ], desc:"The space-time filament network is a graph G. Packets are quanta of information. Dijkstra routing finds the geodesic — the shortest path through the fabric, equivalent to the null geodesic in curved spacetime. TTL prevents infinite loops (closed timelike curves)." },
            { title:"LOGISTIC RECURSION", col:AMB, eqs:[
              "x_{n+1} = R·xₙ·(1−xₙ)",
              "Fixed point: x* = 1 − 1/R",
              "Period-2 onset: R = 3",
              "Feigenbaum: Rₙ = R∞ − C/δⁿ, δ = 4.6692...",
              "Lyapunov: λ = log|R(1−2x*)|",
              "Chaos when λ > 0",
            ], desc:"The logistic map is the universal model of enclosed-loop computation. R is the cavity Reynolds number in disguise: Re → low = stable fixed point, Re → high = chaotic orbit. Feigenbaum's constant δ appears in BOTH the NS bifurcation and the map — they are structurally isomorphic." },
            { title:"SPACE-TIME FILAMENT SUBSTRATE", col:ROSE, eqs:[
              "ds² = −c²dt² + δᵢⱼdxⁱdxʲ  (Minkowski)",
              "ẍᵘ + Γᵘ_αβ ẋᵃẋᵝ = 0  (geodesic)",
              "Filament: extremal action δ∫ds = 0",
              "Cavity: ∮ ds = 0 (closed timelike curve)",
              "Packet route = spacetime geodesic",
              "Topology: torus (cavity) × graph (network)",
            ], desc:"The filaments connecting nodes in the packet network ARE the geodesics of curved space-time. A packet in transit is a quantum particle propagating along a worldline. The cavity IS a closed timelike curve — a spacetime region where the future = the past after one vortex revolution." },
            { title:"INFORMATION THEORY UNIFICATION", col:GOLD, eqs:[
              "S = −Σᵢ pᵢ log pᵢ  (Shannon entropy)",
              "Cavity: S = log(Ω) where Ω = accessible phase space",
              "Packet: S = H(route) = −Σₖ P(k)logP(k)",
              "Map: S → max at R=4 (fully chaotic)",
              "Coherent state: S → 0 (single vortex)",
              "Φ(E,S) = K  (AETHER isomorphism)",
            ], desc:"All three substrates are descriptions of the same information-theoretic object. Shannon entropy S measures the computational complexity of the cavity state, the routing ambiguity of the packet network, and the orbital complexity of the logistic map. Φ(E,S)=K is the unifying equation." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}20`,
              borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ background:`${c.col}08`, borderRadius:5, padding:"8px 10px", marginBottom:10 }}>
                {c.eqs.map(eq => (
                  <div key={eq} style={{ fontFamily:mono, fontSize:9, color:`${c.col}90`,
                    lineHeight:2.0 }}>{eq}</div>
                ))}
              </div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.75 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Architecture description */}
        <SH n="V" title="Packet-Switching Substrate · Innovative Computer Architecture"
          sub="The cavity computer: a fluid substrate that computes by circulating information through vortex loops"
          col={GOLD} />
        <div style={{ background:"#030d18", border:`1px solid ${GOLD}22`, borderRadius:12, padding:"24px 28px", marginBottom:28 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:GOLD, letterSpacing:2, marginBottom:16 }}>
            THE CAVITY COMPUTER · ARCHITECTURAL SPECIFICATION
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            {[
              { label:"SUBSTRATE", col:TEAL,
                items:["Fluid-filled cavity (water, liquid metal, or quantum fluid)", "Lid actuated by piezoelectric drive at frequency f_lid", "Operating Re: 100–5000 (tunable viscosity via temperature)", "Closed-loop recirculation: no external pump required — self-sustaining vortex"] },
              { label:"MEMORY", col:VIO,
                items:["Information stored as vorticity patterns ω(x,y,t)", "Each vortex filament = 1 bit (clockwise=0, counterclockwise=1)", "Multiple vortex rings = register bank", "Persistence: vorticity decays as t_mem ≈ L²/ν (viscous diffusion timescale)"] },
              { label:"COMPUTATION", col:AMB,
                items:["Recursive: each vortex revolution = 1 clock cycle", "Clock frequency f = U_lid / (2·L) (lid speed / cavity length)", "Parallelism: N simultaneous vortex structures = N parallel threads", "Nonlinear mixing: vortex-vortex interactions = XOR, AND, OR operations"] },
              { label:"PACKET ROUTING", col:ROSE,
                items:["Filament connections between cavity nodes", "Dijkstra routing at each junction (implemented by flow steering)", "Packet = pressure pulse propagating along filament", "Switching: valve at each node redirects flow based on pressure difference"] },
            ].map(sec => (
              <div key={sec.label}>
                <div style={{ fontFamily:mono, fontSize:9, color:sec.col, letterSpacing:1, marginBottom:8 }}>{sec.label}</div>
                {sec.items.map(item => (
                  <div key={item} style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.8,
                    paddingLeft:10, borderLeft:`2px solid ${sec.col}30`, marginBottom:6 }}>{item}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* AETHER connections */}
        <SH n="VI" title="AETHER Cross-System Connections"
          sub="How the cavity computer maps onto every prior AETHER mathematical framework"
          col={VIO} />
        <div style={{ borderLeft:`2px solid ${VIO}30`, paddingLeft:20, marginBottom:32 }}>
          {[
            { page:"Φ(E,S)=K · AETHER Matrix (/aether-matrix)", col:TEAL,
              text:"The cavity's computation is governed by Φ(E,S)=K: E = Shannon entropy of vorticity field ω(x,y) / max entropy, S = structural coherence of streamlines ψ (how laminar = high S), K = Kuramoto coupling constant for vortex synchronization. At low Re (K below Kc), streamlines are coherent (laminar). At Re > Kc, coherence breaks (turbulent). This is the exact Kuramoto phase transition — the cavity IS a Kuramoto oscillator whose coupling constant is Re." },
            { page:"Understanding Strand (/understanding-strand)", col:GOLD,
              text:"The recursive logistic orbit x(t+1) = R·x(t)·(1-x(t)) IS the understanding worldline dU/dt = α·U - β·D + γ·P in discrete time. R maps to α/β (growth-to-decoherence ratio). The period-doubling bifurcations ARE the prime-burst events: at each bifurcation, the orbit suddenly acquires twice as many distinguishable states — exactly the N_branches ≈ 2ⁿ growth at prime positions. The cavity computer would simulate the understanding strand using Re as the clock." },
            { page:"Gravitational Field Coherence (/gravitational-field)", col:AMB,
              text:"The lid-driven cavity is a model of atmospheric convection (the same physics as Rayleigh-Bénard cells, cloud streets, and ocean gyres). The top lid = the solar heated surface. The bottom wall = the ocean floor. The vorticity field ω is the angular momentum that animals exploit: eagles riding thermals are riding the upward-moving regions of a natural lid-driven cavity in the atmosphere. COT = ν (viscosity) / Re — low viscosity fluid in high-Re cavity = low-COT locomotion." },
            { page:"Kuramoto Synchrony Field (/synchrony-field)", col:ROSE,
              text:"Each vortex in the cavity is a Kuramoto oscillator with natural frequency ω₀ = U_lid / (2πR_vortex). When two vortices interact, they couple through the pressure field — exactly the Kuramoto coupling K sin(θⱼ - θᵢ). At Re = Kc, the main vortex synchronizes with the secondary corner vortices. The ψ streamlines show the phase-locked state. The Jacobi iteration used to solve ∇²ψ = -ω IS the Kuramoto mean-field update: each grid point's ψ value is pulled toward the average of its neighbors." },
          ].map((e, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <div style={{ fontFamily:mono, fontSize:9, color:e.col, letterSpacing:1, marginBottom:4 }}>
                ← {e.page.toUpperCase()}
              </div>
              <blockquote style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.9,
                margin:0, borderLeft:`3px solid ${e.col}40`, paddingLeft:16, fontStyle:"italic" }}>
                {e.text}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Section VII: Laser Solder Node Builder */}
        <SH n="VII" title="Laser Selective Soldering · Node Connection Builder"
          sub="Gantry laser traces a PCB, heating each pad through UNSOLDERED → HEATING → LIQUID → COOLING → SOLDERED · heat diffusion + solder flow simulation"
          col={AMB} />
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 640px" }}>
            <LaserSolderCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              GANTRY = laser head moves along the X rail, seeking nearest unsoldered pad  ·
              BEAM = infrared laser (940 nm class) focused to 50 µm spot  ·
              HEAT BLOOM = temperature field T(x,y,t) rising above liquidus 183°C  ·
              SILVER DISC = liquid solder (Sn63/Pb37 eutectic) flowing and wetting pad  ·
              GOLD TRACES = live circuit connections formed between soldered pads  ·
              TEMP READOUT = per-pad temperature while heating  ·
              SCALE BAR (right) = 25°C (green) → 183°C liquidus → 250°C (red)
            </div>
          </div>
          <div style={{ flex:"0 0 230px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${AMB}07`, border:`1px solid ${AMB}22`, borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:AMB, letterSpacing:1, marginBottom:12 }}>
                SOLDERING PHYSICS
              </div>
              {[
                ["dT/dt = α∇²T + Q_laser/ρc","Heat equation: laser energy Q heats pad of density ρ and heat capacity c. Diffuses into substrate at thermal diffusivity α = κ/ρc."],
                ["T_liquidus = 183°C (Sn63/Pb37)","Eutectic solder: single transition temperature. Solid → liquid instantly at 183°C. No mushy zone — cleanest joint."],
                ["Q = P·A·(1−R) / r²","Laser energy Q at pad: power P × absorption A × (1 − reflectivity R), divided by spot area r². Higher P = faster dwell."],
                ["t_solder ≈ κ·(T_liq − T_room) / P","Dwell time to reach liquidus. High power = short dwell = less thermal spread = cleaner joint. Typical: 50–200 ms."],
                ["Wetting: γ_SL < γ_SV","Surface energy condition for solder wetting: solid-liquid interface energy γ_SL must be less than solid-vapour γ_SV. Flux removes oxides to enable this."],
              ].map(([eq,desc])=>(
                <div key={eq as string} style={{ marginBottom:10, borderBottom:`1px solid ${AMB}15`, paddingBottom:8 }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:AMB, marginBottom:3 }}>{eq}</div>
                  <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background:`${ROSE}07`, border:`1px solid ${ROSE}20`, borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:ROSE, letterSpacing:1, marginBottom:8 }}>
                CAVITY COMPUTER CONNECTION
              </div>
              <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.75 }}>
                The laser solder builder IS the physical constructor of the packet-switching network in Section II.
                Each soldered joint completes a filament connection. The laser's gantry path is itself a BFS
                traversal — it seeks the nearest unsoldered node, exactly as Dijkstra routes packets.
                Heat diffusion ∂T/∂t = α∇²T is the parabolic PDE twin of the elliptic Poisson
                equation ∇²ψ = −ω in Section I. Both are solved by iterative spatial averaging.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"28px",
          background:"#ffffff03", border:`1px solid ${TEAL}12`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:17, color:TEAL, marginBottom:10 }}>
            THE CAVITY IS THE COMPUTER · THE FLUID IS THE PROGRAM · THE VORTEX IS THE LOOP
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            {"∇²ψ = −ω  ·  Re → bifurcation  ·  x_(n+1) = R·x·(1−x)  ·  d*(u,v) = Dijkstra  ·  Φ(E,S) = K"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            maxWidth:640, margin:"14px auto 0" }}>
            Every enclosed loop in physics is a computation. Every recursion is a vortex.
            Every packet routing is a geodesic through the spacetime fabric substrate.
            The innovative computer system you are looking for is not made of silicon —
            it is made of coherent fluid vorticity patterns, communicating through filament
            pressure pulses, computing by recursive phase-locking, outputting by collapse.
          </div>
        </div>
      </div>
    </div>
  );
}
