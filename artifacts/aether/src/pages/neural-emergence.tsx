import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Brain, Activity } from "lucide-react";

const N_SENSORY = 4;
const N_H1 = 6;
const N_H2 = 6;
const N_MOTOR = 4;

const LAYER_COLORS = ["#06b6d4", "#8b5cf6", "#a855f7", "#22c55e"];
const MOTOR_LABELS = ["FL", "FR", "HL", "HR"];

function initWeights(from: number, to: number) {
  return Array.from({ length: from }, () =>
    Array.from({ length: to }, () => 0.12 + Math.random() * 0.3)
  );
}

function hexRGB(hex: string) {
  const m = hex.replace("#", "").match(/../g)!;
  return m.map((h) => parseInt(h, 16)).join(",");
}

type Pulse = {
  layerFrom: number;
  fromIdx: number;
  layerTo: number;
  toIdx: number;
  progress: number;
  strength: number;
  color: string;
};

type NodeArr = { act: number; phase: number; fired: boolean }[];

export default function NeuralEmergencePage() {
  const netCanvasRef = useRef<HTMLCanvasElement>(null);
  const bodyCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(true);

  const timeRef = useRef(0);
  const nodesRef = useRef({
    sensory: Array.from({ length: N_SENSORY }, (_, i) => ({ act: 0, phase: i * Math.PI / 2, fired: false })) as NodeArr,
    h1:      Array.from({ length: N_H1 },      (_, i) => ({ act: 0, phase: i * 0.4,         fired: false })) as NodeArr,
    h2:      Array.from({ length: N_H2 },      (_, i) => ({ act: 0, phase: i * 0.3,         fired: false })) as NodeArr,
    motor:   Array.from({ length: N_MOTOR },   ()     => ({ act: 0, phase: 0,               fired: false })) as NodeArr,
  });
  const weightsRef = useRef({
    w01: initWeights(N_SENSORY, N_H1),
    w12: initWeights(N_H1, N_H2),
    w23: initWeights(N_H2, N_MOTOR),
  });
  const pulsesRef = useRef<Pulse[]>([]);
  const motorRef  = useRef([0, 0, 0, 0]);
  const genRef    = useRef(0);

  const [running, setRunning] = useState(true);
  const [stats, setStats] = useState({ gen: 0, coherence: 0, plasticity: 0 });

  const simulate = useCallback(() => {
    const dt = 0.016;
    timeRef.current += dt;
    const t = timeRef.current;

    const { sensory, h1, h2, motor } = nodesRef.current;
    const { w01, w12, w23 } = weightsRef.current;
    const pulses = pulsesRef.current;
    const SPEED = 0.02;
    const THR = 0.55;
    const LR = 0.0007;
    const DECAY = 0.91;

    sensory.forEach((n, i) => {
      n.act = 0.5 + 0.5 * Math.sin(t * (0.8 + i * 0.22) + n.phase);
      if (n.act > THR && !n.fired) {
        n.fired = true;
        h1.forEach((_, j) => {
          if (w01[i][j] > 0.08)
            pulses.push({ layerFrom: 0, fromIdx: i, layerTo: 1, toIdx: j, progress: 0, strength: n.act * w01[i][j], color: LAYER_COLORS[0] });
        });
      }
      if (n.act < 0.28) n.fired = false;
    });

    const fireLayer = (nodes: NodeArr, prev: NodeArr, next: NodeArr | null, wIn: number[][], wOut: number[][] | null, lIdx: number) => {
      nodes.forEach((n, i) => {
        n.act *= DECAY;
        if (n.act > THR && !n.fired) {
          n.fired = true;
          genRef.current++;
          prev.forEach((p, j) => {
            if (p.fired) {
              if (lIdx === 1) w01[j][i] = Math.min(1, w01[j][i] + LR);
              if (lIdx === 2) w12[j][i] = Math.min(1, w12[j][i] + LR);
            }
          });
          if (next && wOut) {
            next.forEach((_, k) => {
              if (wOut[i][k] > 0.08)
                pulses.push({ layerFrom: lIdx, fromIdx: i, layerTo: lIdx + 1, toIdx: k, progress: 0, strength: n.act * wOut[i][k], color: LAYER_COLORS[lIdx] });
            });
          }
        }
        if (n.act < 0.18) n.fired = false;
      });
    };

    fireLayer(h1, sensory, h2, w01, w12, 1);
    fireLayer(h2, h1, motor, w12, w23, 2);

    motor.forEach((n, i) => {
      n.act *= DECAY;
      if (n.act > THR && !n.fired) {
        n.fired = true;
        h2.forEach((p, j) => { if (p.fired) w23[j][i] = Math.min(1, w23[j][i] + LR * 1.6); });
      }
      if (n.act < 0.18) n.fired = false;
      motorRef.current[i] = n.act;
    });

    const alive: Pulse[] = [];
    pulses.forEach((p) => {
      p.progress += SPEED * (0.75 + p.strength * 0.45);
      if (p.progress >= 1.0) {
        if (p.layerTo === 1) h1[p.toIdx].act = Math.min(1, h1[p.toIdx].act + p.strength * 0.55);
        if (p.layerTo === 2) h2[p.toIdx].act = Math.min(1, h2[p.toIdx].act + p.strength * 0.55);
        if (p.layerTo === 3) motor[p.toIdx].act = Math.min(1, motor[p.toIdx].act + p.strength * 0.65);
      } else {
        alive.push(p);
      }
    });
    pulsesRef.current = alive.slice(-140);
  }, []);

  const drawNetwork = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04070d";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.022)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const LXS = [80, 256, 432, 608];
    const LSIZES = [N_SENSORY, N_H1, N_H2, N_MOTOR];
    const nodePos = (l: number, i: number) => {
      const n = LSIZES[l];
      const gap = Math.min(58, (H - 80) / Math.max(n - 1, 1));
      const total = gap * (n - 1);
      return { x: LXS[l], y: H / 2 - total / 2 + i * gap };
    };

    const { sensory, h1, h2, motor } = nodesRef.current;
    const { w01, w12, w23 } = weightsRef.current;
    const allNodes = [sensory, h1, h2, motor];
    const allW = [w01, w12, w23];

    for (let l = 0; l < 3; l++) {
      for (let i = 0; i < LSIZES[l]; i++) {
        for (let j = 0; j < LSIZES[l + 1]; j++) {
          const w = allW[l][i][j];
          const f = nodePos(l, i);
          const t2 = nodePos(l + 1, j);
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.strokeStyle = `rgba(${hexRGB(LAYER_COLORS[l])},${w * 0.3})`;
          ctx.lineWidth = w * 1.4;
          ctx.stroke();
        }
      }
    }

    pulsesRef.current.forEach((p) => {
      const f = nodePos(p.layerFrom, p.fromIdx);
      const t2 = nodePos(p.layerTo, p.toIdx);
      const x = f.x + (t2.x - f.x) * p.progress;
      const y = f.y + (t2.y - f.y) * p.progress;
      const r = 3.5 + p.strength * 3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.8);
      g.addColorStop(0, p.color + "ff");
      g.addColorStop(1, p.color + "00");
      ctx.beginPath(); ctx.arc(x, y, r * 2.8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
    });

    for (let l = 0; l < 4; l++) {
      allNodes[l].forEach((n, i) => {
        const pos = nodePos(l, i);
        const R = 9 + n.act * 5;
        if (n.act > 0.25) {
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, R * 3.5);
          glow.addColorStop(0, LAYER_COLORS[l] + "70"); glow.addColorStop(1, LAYER_COLORS[l] + "00");
          ctx.beginPath(); ctx.arc(pos.x, pos.y, R * 3.5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
        ctx.fillStyle = LAYER_COLORS[l] + (n.act > 0.5 ? "ee" : "44"); ctx.fill();
        ctx.strokeStyle = LAYER_COLORS[l]; ctx.lineWidth = 1.5; ctx.stroke();
        if (n.act > 0.12) {
          ctx.beginPath(); ctx.arc(pos.x, pos.y, R * n.act, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff28"; ctx.fill();
        }
      });
    }

    const LLABELS = ["SENSORY", "HIDDEN I", "HIDDEN II", "MOTOR"];
    const LSUBS =   ["4 inputs", "6 nodes", "6 nodes",   "4 outputs"];
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = LAYER_COLORS[l] + "aa";
      ctx.font = "bold 8.5px monospace"; ctx.textAlign = "center";
      ctx.fillText(LLABELS[l], LXS[l], 16);
      ctx.fillStyle = LAYER_COLORS[l] + "55";
      ctx.font = "7px monospace";
      ctx.fillText(LSUBS[l], LXS[l], 28);
    }

    MOTOR_LABELS.forEach((lbl, i) => {
      const pos = nodePos(3, i);
      ctx.fillStyle = "#22c55e80"; ctx.font = "7.5px monospace"; ctx.textAlign = "left";
      ctx.fillText(lbl, pos.x + 15, pos.y + 4);
    });
  }, []);

  const drawBody = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#04070d";
    ctx.fillRect(0, 0, W, H);

    const t = timeRef.current;
    const mo = motorRef.current;

    ctx.strokeStyle = "#0f2010";
    ctx.lineWidth = 1; ctx.setLineDash([4, 10]);
    ctx.beginPath(); ctx.moveTo(20, H - 58); ctx.lineTo(W - 20, H - 58); ctx.stroke();
    ctx.setLineDash([]);

    const bx = W / 2 + 10;
    const by = H / 2 - 5;
    const BW = 75;
    const BH = 26;
    const wT = t * 2.4;

    const drawLeg = (sx: number, sy: number, mAct: number, phase: number, col: string, isBack: boolean) => {
      const hipA = -0.25 + mAct * 0.65 + Math.sin(wT + phase) * (0.3 + mAct * 0.2);
      const kneeA = Math.max(0.08, 0.45 - mAct * 0.2 + Math.abs(Math.sin(wT + phase + 0.4)) * 0.28);
      const seg = isBack ? 30 : 33;
      const kx = sx + Math.sin(hipA) * seg;
      const ky = sy + Math.cos(hipA) * seg;
      const fx = kx + Math.sin(hipA + kneeA) * (seg - 4);
      const fy = ky + Math.cos(hipA + kneeA) * (seg - 4);
      ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(kx, ky); ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.beginPath(); ctx.arc(kx, ky, 4, 0, Math.PI * 2);
      ctx.fillStyle = col + "cc"; ctx.fill();
      const onGround = fy > H - 70;
      ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fillStyle = onGround ? "#22c55e" : "#334"; ctx.fill();
      if (mAct > 0.35) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
        g.addColorStop(0, col + "80"); g.addColorStop(1, col + "00");
        ctx.beginPath(); ctx.arc(sx, sy, 14, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
    };

    const phases = [0, Math.PI, Math.PI, 0];

    drawLeg(bx - BW * 0.42, by + BH * 0.35, mo[2], phases[2], "#8b5cf6", true);
    drawLeg(bx + BW * 0.42, by + BH * 0.35, mo[3], phases[3], "#8b5cf6", true);

    ctx.beginPath(); ctx.ellipse(bx, by, BW, BH, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0a1520"; ctx.fill();
    ctx.strokeStyle = "#18304a"; ctx.lineWidth = 2; ctx.stroke();

    ctx.strokeStyle = "#06b6d418"; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(bx - BW * 0.85 + i * 24, by - BH * 0.7);
      ctx.lineTo(bx - BW * 0.85 + i * 24, by + BH * 0.7);
      ctx.stroke();
    }

    [
      { x: bx - BW * 0.45, y: by, m: mo[0] },
      { x: bx + BW * 0.45, y: by, m: mo[1] },
    ].forEach((j) => {
      ctx.beginPath(); ctx.arc(j.x, j.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6,182,212,${0.25 + j.m * 0.75})`;
      ctx.fill();
      ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 1.5; ctx.stroke();
    });

    drawLeg(bx - BW * 0.6, by - 2, mo[0], phases[0], "#06b6d4", false);
    drawLeg(bx + BW * 0.6, by - 2, mo[1], phases[1], "#06b6d4", false);

    const hx = bx - BW - 12;
    const hy = by - 14;
    ctx.beginPath(); ctx.ellipse(hx, hy, 26, 20, -0.28, 0, Math.PI * 2);
    ctx.fillStyle = "#0a1520"; ctx.fill();
    ctx.strokeStyle = "#18304a"; ctx.lineWidth = 2; ctx.stroke();

    const eyeAct = (mo[0] + mo[1]) / 2;
    ctx.beginPath(); ctx.arc(hx - 7, hy - 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(6,182,212,${0.3 + eyeAct * 0.7})`; ctx.fill();
    ctx.beginPath(); ctx.arc(hx - 7, hy - 4, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();

    ctx.beginPath(); ctx.moveTo(hx - 21, hy + 2); ctx.lineTo(hx - 38, hy + 6);
    ctx.strokeStyle = "#18304a"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();

    ctx.beginPath(); ctx.moveTo(hx + 18, hy + 5); ctx.lineTo(bx - BW, by - 4);
    ctx.strokeStyle = "#18304a"; ctx.lineWidth = 8; ctx.stroke();

    const tailAct = (mo[2] + mo[3]) / 2;
    const wag = Math.sin(t * 4) * tailAct * 0.6;
    ctx.beginPath();
    ctx.moveTo(bx + BW, by - 4);
    ctx.quadraticCurveTo(bx + BW + 18, by - 18 + wag * 18, bx + BW + 38, by - 32 + wag * 28);
    ctx.strokeStyle = "#18304a"; ctx.lineWidth = 6; ctx.stroke();

    if (Math.max(...mo) > 0.45) {
      const a = Math.max(...mo) * 0.25;
      ctx.strokeStyle = `rgba(6,182,212,${a})`;
      ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
      ctx.beginPath(); ctx.moveTo(bx - 120, by - 20); ctx.lineTo(bx + 140, by + 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const barX = W - 56;
    MOTOR_LABELS.forEach((lbl, i) => {
      const barY = 22 + i * 42;
      const a = mo[i];
      ctx.fillStyle = "#0a1525"; ctx.fillRect(barX, barY, 42, 11);
      const g = ctx.createLinearGradient(barX, 0, barX + 42, 0);
      g.addColorStop(0, "#22c55e90"); g.addColorStop(1, "#06b6d490");
      ctx.fillStyle = g; ctx.fillRect(barX, barY, 42 * a, 11);
      ctx.strokeStyle = "#22c55e20"; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, 42, 11);
      ctx.fillStyle = "#22c55e70"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText(lbl, barX, barY - 2);
    });

    ctx.fillStyle = "#22c55e35"; ctx.font = "8px monospace"; ctx.textAlign = "center";
    ctx.fillText("DIGITAL BODY · JOINTS · HINGES · PHALANGES", bx, H - 10);
  }, []);

  useEffect(() => {
    const nc = netCanvasRef.current;
    const bc = bodyCanvasRef.current;
    if (!nc || !bc) return;
    const nCtx = nc.getContext("2d")!;
    const bCtx = bc.getContext("2d")!;
    let frame = 0;

    const loop = () => {
      if (runningRef.current) simulate();
      drawNetwork(nCtx, nc.width, nc.height);
      drawBody(bCtx, bc.width, bc.height);
      frame++;
      if (frame % 30 === 0) {
        const { w01, w12, w23 } = weightsRef.current;
        const flat = [...w01.flat(), ...w12.flat(), ...w23.flat()];
        const avg = flat.reduce((a, b) => a + b, 0) / flat.length;
        const mo = motorRef.current;
        const coh = ((mo[0] + mo[3]) / 2 + (mo[1] + mo[2]) / 2) * 50;
        setStats({ gen: genRef.current, coherence: Math.round(Math.min(100, coh)), plasticity: Math.round(avg * 100) });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [simulate, drawNetwork, drawBody]);

  const toggle = () => { runningRef.current = !runningRef.current; setRunning((r) => !r); };
  const reset = () => {
    timeRef.current = 0; genRef.current = 0;
    nodesRef.current = {
      sensory: Array.from({ length: N_SENSORY }, (_, i) => ({ act: 0, phase: i * Math.PI / 2, fired: false })),
      h1:      Array.from({ length: N_H1 },      (_, i) => ({ act: 0, phase: i * 0.4,         fired: false })),
      h2:      Array.from({ length: N_H2 },      (_, i) => ({ act: 0, phase: i * 0.3,         fired: false })),
      motor:   Array.from({ length: N_MOTOR },   ()     => ({ act: 0, phase: 0,               fired: false })),
    };
    weightsRef.current = { w01: initWeights(N_SENSORY, N_H1), w12: initWeights(N_H1, N_H2), w23: initWeights(N_H2, N_MOTOR) };
    pulsesRef.current = []; motorRef.current = [0, 0, 0, 0];
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <div className="font-mono text-xs text-cyan-400/50 uppercase tracking-[0.25em]">AETHER · Neural Emergence Layer</div>
        <h1 className="font-serif text-4xl text-foreground">Emergent Movement</h1>
        <h2 className="font-serif text-2xl text-cyan-400">&amp; Neural Signal Waves</h2>
        <p className="font-mono text-xs text-muted-foreground/60 max-w-3xl leading-relaxed mt-3">
          Natural movement emerges from patterns of neural activity spreading through networks of neurons. As signals
          travel through the brain, they form wave-like patterns of electrical activity across circuits and pathways.
          These waves propagate through neural connections until they reach motor neurons — which activate muscles or
          mechanical joints, producing coordinated physical movement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl overflow-hidden border border-cyan-500/20">
          <img src="/neural-emergence-1.jpeg" alt="Neural-to-Digital: Emergent Movement & Long-Term Neural Effects" className="w-full object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden border border-border/20">
          <img src="/neural-emergence-2.jpeg" alt="Neural-to-Digital Animal Interface" className="w-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Signal Wave Propagation", icon: "≋", color: "#06b6d4", text: "Neural signals travel as electrochemical waves through dendritic trees and axons. Wave-like patterns of electrical activity emerge across circuits — not point-to-point wires, but coherent field propagation through the network." },
          { title: "Synaptic Plasticity", icon: "⊛", color: "#8b5cf6", text: "Hebbian learning: neurons that fire together wire together. Connections strengthen, weaken, or reorganize as signals repeatedly travel through them. Actions become more efficient over time as the network self-optimizes its topology." },
          { title: "Emergent Coordination", icon: "◈", color: "#22c55e", text: "Coordinated movement emerges automatically — no central controller programs the gait. Feedback from successful movements reinforces the neural pathways responsible. The system discovers locomotion through iteration." },
        ].map((p) => (
          <div key={p.title} className="rounded-xl border p-5 space-y-3" style={{ borderColor: `${p.color}25`, background: `${p.color}06` }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold" style={{ color: p.color }}>{p.icon}</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: p.color }}>{p.title}</span>
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/55 leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1">Live Simulation</div>
            <h3 className="font-serif text-xl text-foreground">Neural-to-Digital Body Interface</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-5">
              {[{ label: "Pulses", val: stats.gen.toLocaleString() }, { label: "Coherence", val: `${stats.coherence}%` }, { label: "Plasticity", val: `${stats.plasticity}%` }].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-sm text-cyan-400 font-bold tabular-nums">{s.val}</div>
                  <div className="font-mono text-[8px] text-muted-foreground/35">{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border font-mono text-xs transition-colors"
              style={{ borderColor: running ? "#22c55e40" : "#06b6d440", background: running ? "#22c55e0e" : "#06b6d40e", color: running ? "#22c55e" : "#06b6d4" }}>
              {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {running ? "Pause" : "Resume"}
            </button>
            <button onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/20 font-mono text-xs text-muted-foreground/45 hover:text-muted-foreground/70 transition-colors">
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden border border-cyan-500/15" style={{ background: "#04070d" }}>
            <div className="px-4 py-2 border-b border-border/10 flex items-center gap-2">
              <Brain className="w-3 h-3 text-cyan-400/50" />
              <span className="font-mono text-[9px] text-cyan-400/50 uppercase tracking-widest">Neural Signal Network · 4-layer</span>
              <span className="ml-auto flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-mono text-[8px] text-cyan-400/35">LIVE</span>
              </span>
            </div>
            <canvas ref={netCanvasRef} width={720} height={360} className="w-full block" />
          </div>

          <div className="rounded-xl overflow-hidden border border-green-500/15" style={{ background: "#04070d" }}>
            <div className="px-4 py-2 border-b border-border/10 flex items-center gap-2">
              <Activity className="w-3 h-3 text-green-400/50" />
              <span className="font-mono text-[9px] text-green-400/50 uppercase tracking-widest">Digital Body · Motor Output</span>
              <span className="ml-auto flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[8px] text-green-400/35">LIVE</span>
              </span>
            </div>
            <canvas ref={bodyCanvasRef} width={720} height={360} className="w-full block" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { color: "#06b6d4", label: "Sensory Input",    sub: "4 oscillating sensors, sinusoidal" },
            { color: "#8b5cf6", label: "Hidden Layers",    sub: "6+6 integration nodes, RELU-like" },
            { color: "#22c55e", label: "Motor Output",     sub: "FL / FR / HL / HR leg control" },
            { color: "#f59e0b", label: "Hebbian Learning", sub: "Δw = LR · pre · post (co-firing)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: `${l.color}20`, background: `${l.color}05` }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
              <div>
                <div className="font-mono text-[9px] font-bold" style={{ color: l.color }}>{l.label}</div>
                <div className="font-mono text-[8px] text-muted-foreground/38">{l.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border/15 rounded-xl p-5">
        <div className="font-mono text-[9px] text-muted-foreground/38 uppercase tracking-widest mb-4">AETHER Layer Mapping — Neural Emergence</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { layer: "MNĒSIS",   color: "#06b6d4", role: "Signal Pattern Memory",    detail: "Stores successful wave patterns that produced stable locomotion. Pattern library grows with each Hebbian learning cycle, crystallizing effective gaits." },
            { layer: "INFERNIA", color: "#8b5cf6", role: "Hidden Layer Dynamics",    detail: "The two hidden layers are INFERNIA — integrating, interpolating, computing relationships between sensory input and motor intent across phases." },
            { layer: "ALETHEIA", color: "#f59e0b", role: "Coherence Validation",     detail: "Did the movement succeed? ALETHEIA validates output against stability criteria and gates Hebbian weight updates. Only coherent movements reinforce their paths." },
            { layer: "REVERIE",  color: "#22c55e", role: "Emergent Pattern Space",   detail: "Locomotion that was never explicitly programmed — it emerged. REVERIE is the crystallization space where unexpected, stable solutions appear from iteration." },
          ].map((l) => (
            <div key={l.layer} className="rounded-lg border p-4 space-y-2" style={{ borderColor: `${l.color}20`, background: `${l.color}04` }}>
              <div className="font-mono text-[9px] font-bold uppercase tracking-widest" style={{ color: l.color }}>{l.layer}</div>
              <div className="font-mono text-[8px] text-foreground/48 font-bold">{l.role}</div>
              <p className="font-mono text-[8px] text-muted-foreground/38 leading-relaxed">{l.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-cyan-500/12 rounded-xl p-6 space-y-3 text-center" style={{ background: "linear-gradient(135deg, #04070d, #09152a)" }}>
        <div className="font-mono text-[9px] text-cyan-400/40 uppercase tracking-widest">Future Directions</div>
        <p className="font-serif text-sm text-muted-foreground/55 italic max-w-2xl mx-auto leading-relaxed">
          If such models advance further, they may eventually help guide biological research into how synapses and neurons grow and strengthen. Understanding these signal dynamics could contribute to approaches for improving neural resilience, supporting long-term memory formation, and deepening our understanding of how life and behavior emerge from complex neural connections.
        </p>
        <div className="flex items-center justify-center gap-8 pt-2 flex-wrap">
          {["Neural Resilience", "Long-Term Memory Formation", "Synaptic Growth Modeling", "Emergent Behavior Research"].map((f) => (
            <div key={f} className="font-mono text-[8px] text-cyan-400/35 uppercase tracking-wider">{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
