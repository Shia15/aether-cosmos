import { useEffect, useRef, useState, useCallback } from "react";

// ── Palette ─────────────────────────────────────────────────────────────────
const BG   = "#06070a";
const GOLD = "#f5c84c";

const CHAIN_PALETTES = [
  ["#60c4f7","#4899d4","#2e6fa8"],   // icy blue
  ["#a78bfa","#7c3aed","#c4b5fd"],   // violet
  ["#f5c84c","#e6a817","#fde68a"],   // gold
  ["#34d399","#059669","#6ee7b7"],   // emerald
  ["#fb923c","#ea580c","#fdba74"],   // amber
  ["#f472b6","#db2777","#fbcfe8"],   // rose
  ["#22d3ee","#0891b2","#a5f3fc"],   // cyan
  ["#a3e635","#65a30d","#d9f99d"],   // lime
];

// ── Types ────────────────────────────────────────────────────────────────────
type Vec3 = [number, number, number];

type SSType = "helix" | "sheet" | "coil";

interface Residue { pos: Vec3; ss: SSType; }
interface DrawCall {
  z: number;
  fn: (ctx: CanvasRenderingContext2D, proj: (v: Vec3) => [number, number]) => void;
}

// ── Math helpers ─────────────────────────────────────────────────────────────
const dot   = (a: Vec3, b: Vec3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross  = (a: Vec3, b: Vec3): Vec3 => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm   = (v: Vec3): Vec3 => { const l = Math.sqrt(dot(v,v))||1; return [v[0]/l,v[1]/l,v[2]/l]; };
const add    = (a: Vec3, b: Vec3): Vec3 => [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub    = (a: Vec3, b: Vec3): Vec3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const scale  = (v: Vec3, s: number): Vec3 => [v[0]*s,v[1]*s,v[2]*s];
const lerp3  = (a: Vec3, b: Vec3, t: number): Vec3 => add(scale(a,1-t),scale(b,t));

function rotX(v: Vec3, a: number): Vec3 {
  const c=Math.cos(a),s=Math.sin(a);
  return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c];
}
function rotY(v: Vec3, a: number): Vec3 {
  const c=Math.cos(a),s=Math.sin(a);
  return [v[0]*c+v[2]*s, v[1], -v[0]*s+v[2]*c];
}
function rotZ(v: Vec3, a: number): Vec3 {
  const c=Math.cos(a),s=Math.sin(a);
  return [v[0]*c-v[1]*s, v[0]*s+v[1]*c, v[2]];
}

// ── Protein generation ───────────────────────────────────────────────────────
function mulberry32(seed: number) {
  return () => { seed|=0; seed=seed+0x6d2b79f5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/2**32; };
}

function buildChain(seed: number, startPos: Vec3, startDir: Vec3): Residue[] {
  const rng = mulberry32(seed);
  const residues: Residue[] = [];

  // Generate SS assignment plan: alternating helices, sheets, coils
  const plan: { ss: SSType; len: number }[] = [];
  const totalRes = 60 + Math.floor(rng() * 60);
  let remaining = totalRes;
  // start with short coil
  plan.push({ ss: "coil", len: 3+Math.floor(rng()*4) });
  remaining -= plan[0].len;

  while (remaining > 5) {
    const r = rng();
    if (r < 0.4) {
      const len = 8+Math.floor(rng()*10);
      plan.push({ ss: "helix", len: Math.min(len, remaining-3) });
    } else if (r < 0.65) {
      const len = 4+Math.floor(rng()*6);
      plan.push({ ss: "sheet", len: Math.min(len, remaining-3) });
    } else {
      const len = 3+Math.floor(rng()*7);
      plan.push({ ss: "coil", len: Math.min(len, remaining-2) });
    }
    remaining -= plan[plan.length-1].len;
  }
  if (remaining > 0) plan.push({ ss: "coil", len: remaining });

  let pos: Vec3 = [...startPos];
  let dir: Vec3 = norm(startDir);

  for (const seg of plan) {
    if (seg.ss === "helix") {
      // Alpha helix: ~3.6 res/turn, rise 1.5 Å, radius 2.3 Å
      const RISE = 1.6;
      const RADIUS = 2.4;
      const TURN = (2*Math.PI) / 3.6;
      // perpendicular to dir
      const up: Vec3 = Math.abs(dir[1]) < 0.9 ? [0,1,0] : [1,0,0];
      const perp = norm(cross(dir, up));
      const perp2 = cross(dir, perp);
      let phase = rng()*Math.PI*2;
      for (let i=0; i<seg.len; i++) {
        const helixPos: Vec3 = add(add(pos, scale(perp, RADIUS*Math.cos(phase))), scale(perp2, RADIUS*Math.sin(phase)));
        residues.push({ pos: helixPos, ss: "helix" });
        pos = add(pos, scale(dir, RISE));
        phase += TURN;
      }
      // slight random bend of axis
      const bend = (rng()-0.5)*0.4;
      const roll = (rng()-0.5)*0.4;
      dir = norm(add(dir, add(scale(perp,bend*0.5), scale(perp2,roll*0.5))));
    } else if (seg.ss === "sheet") {
      // Beta strand: extended, 3.5 Å/res with alternating pleating
      const RISE = 3.5;
      const PLEAT = 0.6;
      const up: Vec3 = Math.abs(dir[1]) < 0.9 ? [0,1,0] : [1,0,0];
      const perp = norm(cross(dir, up));
      for (let i=0; i<seg.len; i++) {
        const pleat = perp.map((v,k) => v*(PLEAT*(i%2===0?1:-1))) as Vec3;
        residues.push({ pos: add(pos, pleat), ss: "sheet" });
        pos = add(pos, scale(dir, RISE));
      }
      // slight random turn after strand
      const bend2 = (rng()-0.5)*0.6;
      const up2: Vec3 = Math.abs(dir[1]) < 0.9 ? [0,1,0] : [1,0,0];
      const perp2 = norm(cross(dir, up2));
      dir = norm(add(dir, scale(perp2, bend2)));
    } else {
      // Coil: random walk with persistence
      const RISE = 3.0;
      for (let i=0; i<seg.len; i++) {
        residues.push({ pos: [...pos], ss: "coil" });
        // random curvature
        const theta = (rng()-0.5)*1.2;
        const phi   = (rng()-0.5)*1.2;
        const up3: Vec3 = Math.abs(dir[1]) < 0.9 ? [0,1,0] : [1,0,0];
        const perp3 = norm(cross(dir, up3));
        const perp4 = cross(dir, perp3);
        dir = norm(add(dir, add(scale(perp3, theta*0.4), scale(perp4, phi*0.4))));
        pos = add(pos, scale(dir, RISE));
      }
    }
  }

  return residues;
}

// ── Rendering helpers ─────────────────────────────────────────────────────────
function centroid(residues: Residue[][]): Vec3 {
  let sum: Vec3 = [0,0,0];
  let n = 0;
  for (const chain of residues) for (const r of chain) { sum = add(sum, r.pos); n++; }
  return n ? scale(sum, 1/n) : [0,0,0];
}

function catmullRomPts(pts: Vec3[], t: number): Vec3[] {
  const out: Vec3[] = [];
  for (let i=0; i<pts.length-1; i++) {
    const p0 = pts[Math.max(0,i-1)];
    const p1 = pts[i];
    const p2 = pts[Math.min(pts.length-1,i+1)];
    const p3 = pts[Math.min(pts.length-1,i+2)];
    const steps = 6;
    for (let s=0; s<steps; s++) {
      const u = s/steps;
      const u2=u*u,u3=u2*u;
      const c0=(-u3+2*u2-u)*0.5;
      const c1=(3*u3-5*u2+2)*0.5;
      const c2=(-3*u3+4*u2+u)*0.5;
      const c3=(u3-u2)*0.5;
      out.push([p0[0]*c0+p1[0]*c1+p2[0]*c2+p3[0]*c3,
                p0[1]*c0+p1[1]*c1+p2[1]*c2+p3[1]*c3,
                p0[2]*c0+p1[2]*c1+p2[2]*c2+p3[2]*c3]);
    }
  }
  out.push(pts[pts.length-1]);
  return out;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RFDiffusionPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const rotYRef     = useRef(0);
  const rotXRef     = useRef(0.15);
  const rotZRef     = useRef(0.02);
  const dragging    = useRef(false);
  const lastMouse   = useRef([0,0]);

  const chainsRef   = useRef<Residue[][]>([]);
  const [chainCount, setChainCount] = useState(6);
  const [speed, setSpeed]           = useState(0.3);
  const [style, setStyle]           = useState<"ribbon"|"tube"|"mixed">("ribbon");
  const [helixGlow, setHelixGlow]   = useState(true);
  const [diffuseBg, setDiffuseBg]   = useState(true);
  const [seed, setSeed]             = useState(42);

  // ── Generate chains ──────────────────────────────────────────────────────
  const generateChains = useCallback((count: number, s: number) => {
    const rng = mulberry32(s * 7919 + 1);
    const chains: Residue[][] = [];
    for (let c=0; c<count; c++) {
      const angle = (c / count) * Math.PI * 2 + rng()*0.5;
      const radius = 15 + rng()*20;
      const startPos: Vec3 = [Math.cos(angle)*radius, (rng()-0.5)*25, Math.sin(angle)*radius];
      const startDir: Vec3 = norm([Math.cos(angle+Math.PI/2+rng()*0.4), (rng()-0.5)*0.6, Math.sin(angle+Math.PI/2+rng()*0.4)]);
      chains.push(buildChain(s*1000+c*137, startPos, startDir));
    }
    // center
    const ctr = centroid(chains);
    for (const chain of chains) for (const r of chain) r.pos = sub(r.pos, ctr);
    return chains;
  }, []);

  useEffect(() => {
    chainsRef.current = generateChains(chainCount, seed);
  }, [chainCount, seed, generateChains]);

  // ── Draw loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let last = 0;
    const draw = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;

      rotYRef.current += speed * dt * 0.3;

      const W = canvas.width, H = canvas.height;
      const cx = W/2, cy = H/2;
      const SCALE = Math.min(W, H) * 0.012;

      // Projection
      const ry = rotYRef.current;
      const rx = rotXRef.current;
      const rz = rotZRef.current;
      const proj = (v: Vec3): [number, number] => {
        let p = rotX(v, rx);
        p = rotY(p, ry);
        p = rotZ(p, rz);
        const fov = 200;
        const zd = p[2] + 80;
        const pf = fov / zd;
        return [cx + p[0] * SCALE * pf, cy - p[1] * SCALE * pf];
      };

      // Background
      ctx.clearRect(0,0,W,H);
      const bgGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.7);
      bgGrad.addColorStop(0,"#0c0e15");
      bgGrad.addColorStop(1,"#06070a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0,0,W,H);

      // Diffusion field particles
      if (diffuseBg) {
        const rng2 = mulberry32(seed * 13 + Math.floor(ts/200));
        ctx.save();
        for (let i=0; i<120; i++) {
          const px = rng2()*W;
          const py = rng2()*H;
          const r  = 0.5 + rng2()*2;
          const a  = 0.04 + rng2()*0.1;
          const hue= [200,270,190,50][Math.floor(rng2()*4)];
          ctx.beginPath();
          ctx.arc(px,py,r,0,Math.PI*2);
          ctx.fillStyle = `hsla(${hue},70%,70%,${a})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // Build draw calls
      const draws: DrawCall[] = [];
      const chains = chainsRef.current;

      chains.forEach((chain, ci) => {
        const pal = CHAIN_PALETTES[ci % CHAIN_PALETTES.length];

        // Group into SS segments
        let segStart = 0;
        while (segStart < chain.length) {
          const ss = chain[segStart].ss;
          let segEnd = segStart+1;
          while (segEnd < chain.length && chain[segEnd].ss === ss) segEnd++;
          const seg = chain.slice(segStart, segEnd);

          if (ss === "helix" && seg.length >= 4) {
            // Alpha helix ribbon
            const helixPts = catmullRomPts(seg.map(r=>r.pos), 0.5);
            const avgZ = helixPts.reduce((s,p)=>s+p[2],0)/helixPts.length;
            draws.push({ z: avgZ, fn: (ctx2, prj) => {
              // Ribbon width
              const pts2d = helixPts.map(prj);
              // Draw glow if enabled
              if (helixGlow) {
                ctx2.save();
                ctx2.shadowColor = pal[0];
                ctx2.shadowBlur  = 12;
                ctx2.strokeStyle = pal[0];
                ctx2.lineWidth   = 4;
                ctx2.globalAlpha = 0.35;
                ctx2.beginPath();
                pts2d.forEach(([x,y],i)=>i===0?ctx2.moveTo(x,y):ctx2.lineTo(x,y));
                ctx2.stroke();
                ctx2.restore();
              }
              // Main ribbon body
              ctx2.save();
              ctx2.strokeStyle = pal[0];
              ctx2.lineWidth   = style === "tube" ? 6 : 9;
              ctx2.lineCap     = "round";
              ctx2.lineJoin    = "round";
              ctx2.globalAlpha = 0.9;
              ctx2.beginPath();
              pts2d.forEach(([x,y],i)=>i===0?ctx2.moveTo(x,y):ctx2.lineTo(x,y));
              ctx2.stroke();
              // Highlight stripe (ribbon sheen)
              if (style === "ribbon" || style === "mixed") {
                ctx2.strokeStyle = pal[2];
                ctx2.lineWidth   = 2.5;
                ctx2.globalAlpha = 0.55;
                ctx2.beginPath();
                pts2d.forEach(([x,y],i)=>i===0?ctx2.moveTo(x,y):ctx2.lineTo(x,y));
                ctx2.stroke();
              }
              ctx2.restore();
              // Coil ticks (show helix winding)
              if (style !== "tube") {
                ctx2.save();
                ctx2.strokeStyle = pal[1];
                ctx2.lineWidth   = 1.5;
                ctx2.globalAlpha = 0.5;
                for (let k=0; k<helixPts.length-3; k+=3) {
                  const a2d = prj(helixPts[k]);
                  const b2d = prj(helixPts[k+2]);
                  // perpendicular tick
                  const dx = b2d[1]-a2d[1], dy = -(b2d[0]-a2d[0]);
                  const dl = Math.sqrt(dx*dx+dy*dy)||1;
                  const tx = dx/dl*5, ty = dy/dl*5;
                  ctx2.beginPath();
                  ctx2.moveTo(a2d[0]-tx,a2d[1]-ty);
                  ctx2.lineTo(a2d[0]+tx,a2d[1]+ty);
                  ctx2.stroke();
                }
                ctx2.restore();
              }
            }});

          } else if (ss === "sheet" && seg.length >= 3) {
            // Beta sheet: flat ribbon with arrow tip
            const sheetPts = catmullRomPts(seg.map(r=>r.pos), 0.5);
            const avgZ = sheetPts.reduce((s,p)=>s+p[2],0)/sheetPts.length;
            draws.push({ z: avgZ, fn: (ctx2, prj) => {
              const pts2d = sheetPts.map(prj);
              ctx2.save();
              // Build ribbon polygon (wide flat)
              const HALF = style === "tube" ? 5 : 12;
              const ARROWLEN = Math.min(5, Math.floor(pts2d.length * 0.25));
              const bodyPts = pts2d.slice(0, pts2d.length - ARROWLEN);
              const arrowPts = pts2d.slice(pts2d.length - ARROWLEN);
              if (bodyPts.length >= 2) {
                ctx2.beginPath();
                // top edge
                bodyPts.forEach(([x,y],i) => {
                  const nx = i<bodyPts.length-1 ? bodyPts[i+1][0]-x : 0;
                  const ny = i<bodyPts.length-1 ? bodyPts[i+1][1]-y : 0;
                  const nl = Math.sqrt(nx*nx+ny*ny)||1;
                  const px2 = -ny/nl*HALF, py2 = nx/nl*HALF;
                  i===0 ? ctx2.moveTo(x+px2,y+py2) : ctx2.lineTo(x+px2,y+py2);
                });
                // arrow body top → tip
                const tip = arrowPts[arrowPts.length-1];
                const arrowBase = arrowPts[0];
                const abd = [arrowBase[0]-bodyPts[bodyPts.length-1][0], arrowBase[1]-bodyPts[bodyPts.length-1][1]];
                const abl = Math.sqrt(abd[0]*abd[0]+abd[1]*abd[1])||1;
                const abn = [-abd[1]/abl, abd[0]/abl];
                // wide part of arrow
                ctx2.lineTo(arrowBase[0]+abn[0]*HALF*1.8, arrowBase[1]+abn[1]*HALF*1.8);
                ctx2.lineTo(tip[0], tip[1]);
                ctx2.lineTo(arrowBase[0]-abn[0]*HALF*1.8, arrowBase[1]-abn[1]*HALF*1.8);
                // bottom edge (reversed)
                for (let i=bodyPts.length-1; i>=0; i--) {
                  const [x,y] = bodyPts[i];
                  const nx = i>0 ? x-bodyPts[i-1][0] : 0;
                  const ny = i>0 ? y-bodyPts[i-1][1] : 0;
                  const nl = Math.sqrt(nx*nx+ny*ny)||1;
                  const px2 = -ny/nl*HALF, py2 = nx/nl*HALF;
                  ctx2.lineTo(x-px2, y-py2);
                }
                ctx2.closePath();
                // Fill with gradient
                const grd = ctx2.createLinearGradient(
                  bodyPts[0][0],bodyPts[0][1],
                  bodyPts[bodyPts.length-1][0],bodyPts[bodyPts.length-1][1]);
                grd.addColorStop(0, pal[2]+"cc");
                grd.addColorStop(1, pal[0]+"cc");
                ctx2.fillStyle   = grd;
                ctx2.globalAlpha = 0.88;
                ctx2.fill();
                ctx2.strokeStyle = pal[0];
                ctx2.lineWidth   = 1.5;
                ctx2.globalAlpha = 0.7;
                ctx2.stroke();
              }
              ctx2.restore();
            }});

          } else {
            // Coil: thin bezier tube
            const coilPts = catmullRomPts(seg.map(r=>r.pos), 0.5);
            const avgZ = coilPts.reduce((s,p)=>s+p[2],0)/coilPts.length;
            draws.push({ z: avgZ, fn: (ctx2, prj) => {
              const pts2d = coilPts.map(prj);
              ctx2.save();
              ctx2.strokeStyle = pal[1];
              ctx2.lineWidth   = 2;
              ctx2.lineCap     = "round";
              ctx2.lineJoin    = "round";
              ctx2.globalAlpha = 0.6;
              ctx2.setLineDash([4,4]);
              ctx2.beginPath();
              pts2d.forEach(([x,y],i)=>i===0?ctx2.moveTo(x,y):ctx2.lineTo(x,y));
              ctx2.stroke();
              ctx2.setLineDash([]);
              ctx2.restore();
            }});
          }

          // N/C terminus spheres
          if (segStart === 0) {
            const nPos = chain[0].pos;
            draws.push({ z: nPos[2], fn: (ctx2, prj) => {
              const [x,y] = prj(nPos);
              ctx2.save();
              ctx2.beginPath();
              ctx2.arc(x,y,6,0,Math.PI*2);
              ctx2.fillStyle = "#60f060";
              ctx2.globalAlpha = 0.9;
              ctx2.fill();
              ctx2.font = "bold 9px 'DM Mono',monospace";
              ctx2.fillStyle = "#fff";
              ctx2.globalAlpha = 0.8;
              ctx2.fillText("N",x-4,y+3);
              ctx2.restore();
            }});
          }
          if (segEnd === chain.length) {
            const cPos = chain[chain.length-1].pos;
            draws.push({ z: cPos[2], fn: (ctx2, prj) => {
              const [x,y] = prj(cPos);
              ctx2.save();
              ctx2.beginPath();
              ctx2.arc(x,y,6,0,Math.PI*2);
              ctx2.fillStyle = "#f06060";
              ctx2.globalAlpha = 0.9;
              ctx2.fill();
              ctx2.font = "bold 9px 'DM Mono',monospace";
              ctx2.fillStyle = "#fff";
              ctx2.globalAlpha = 0.8;
              ctx2.fillText("C",x-4,y+3);
              ctx2.restore();
            }});
          }

          segStart = segEnd;
        }

        // Cα dots every 10 residues
        chain.forEach((r,i) => {
          if (i%10!==0) return;
          draws.push({ z: r.pos[2], fn: (ctx2, prj) => {
            const [x,y] = prj(r.pos);
            ctx2.save();
            ctx2.beginPath();
            ctx2.arc(x,y,3,0,Math.PI*2);
            ctx2.fillStyle = pal[0];
            ctx2.globalAlpha = 0.7;
            ctx2.fill();
            ctx2.restore();
          }});
        });
      });

      // Sort painter's order: back → front
      draws.sort((a,b) => {
        let az=a.z, bz=b.z;
        let av = rotY([0,0,az] as Vec3, rotYRef.current);
        let bv = rotY([0,0,bz] as Vec3, rotYRef.current);
        return bv[2]-av[2];
      });
      draws.forEach(d => d.fn(ctx, proj));

      // Overlay: bottom legend
      ctx.save();
      ctx.font = "10px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(245,200,76,0.4)";
      ctx.fillText("RFdiffusion · Protein Structure · α-helix · β-sheet · loop", 16, H-14);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [speed, style, helixGlow, diffuseBg, seed, chainCount]);

  // ── Mouse drag to rotate ─────────────────────────────────────────────────
  const onMouseDown = (e: MouseEvent) => { dragging.current=true; lastMouse.current=[e.clientX,e.clientY]; };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current[0];
    const dy = e.clientY - lastMouse.current[1];
    rotYRef.current += dx * 0.01;
    rotXRef.current += dy * 0.01;
    lastMouse.current = [e.clientX, e.clientY];
  };
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = (e: TouchEvent) => { lastMouse.current=[e.touches[0].clientX,e.touches[0].clientY]; };
  const onTouchMove  = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - lastMouse.current[0];
    const dy = e.touches[0].clientY - lastMouse.current[1];
    rotYRef.current += dx * 0.01;
    rotXRef.current += dy * 0.01;
    lastMouse.current = [e.touches[0].clientX, e.touches[0].clientY];
  };

  const saveImage = () => {
    const c = canvasRef.current!;
    const a = document.createElement("a");
    a.download = "rf-diffusion-protein.png";
    a.href = c.toDataURL("image/png");
    a.click();
  };

  const C = { bg: BG, gold: GOLD, card: "#0d1117", border: "#1f2937", text: "#e2e8f0", text2: "#94a3b8", text3: "#4b5563", teal: "#22d3ee" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Raleway',sans-serif", color: C.text }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: 4 }}>
            AETHER · Structural Biology Engine
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>
            RFdiffusion · Protein Structure Visualiser
          </h1>
          <div style={{ fontSize: 11, color: C.text2, marginTop: 4 }}>
            Generative α-helix · β-sheet · loop rendering · drag to rotate · export PNG background
          </div>
        </div>
        <button onClick={saveImage}
          style={{ padding: "8px 18px", background: C.gold, color: "#000", fontFamily: "'DM Mono',monospace", fontSize: 11, border: "none", cursor: "pointer", letterSpacing: "0.1em", fontWeight: 700 }}>
          ↓ EXPORT PNG
        </button>
      </div>

      {/* Canvas — the protein background */}
      <div style={{ position: "relative", height: "calc(100vh - 220px)", minHeight: 480, cursor: "grab" }}>
        <canvas ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
        />
      </div>

      {/* Controls */}
      <div style={{ background: "#0a0c12", borderTop: `1px solid ${C.border}`, padding: "14px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>

          {/* Rotation speed */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text2, fontFamily: "'DM Mono',monospace" }}>
            ROTATION
            <input type="range" min={0} max={2} step={0.05} value={speed}
              onChange={e => setSpeed(+e.currentTarget.value)}
              style={{ width: 90, accentColor: C.gold }} />
            <span style={{ color: C.gold, width: 28 }}>{speed.toFixed(1)}×</span>
          </label>

          {/* Chain count */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text2, fontFamily: "'DM Mono',monospace" }}>
            CHAINS
            <input type="range" min={1} max={8} step={1} value={chainCount}
              onChange={e => setChainCount(+e.currentTarget.value)}
              style={{ width: 70, accentColor: C.gold }} />
            <span style={{ color: C.gold, width: 16 }}>{chainCount}</span>
          </label>

          {/* Render style */}
          <div style={{ display: "flex", gap: 4, fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
            {(["ribbon","tube","mixed"] as const).map(s => (
              <button key={s} onClick={() => setStyle(s)}
                style={{ padding: "4px 10px", border: `1px solid ${style===s?C.gold:C.border}`, background: style===s?"#1a1408":"transparent", color: style===s?C.gold:C.text2, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s}
              </button>
            ))}
          </div>

          {/* Toggles */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.text2, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
            <input type="checkbox" checked={helixGlow} onChange={e => setHelixGlow(e.currentTarget.checked)} style={{ accentColor: C.gold }} />
            HELIX GLOW
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.text2, cursor: "pointer", fontFamily: "'DM Mono',monospace" }}>
            <input type="checkbox" checked={diffuseBg} onChange={e => setDiffuseBg(e.currentTarget.checked)} style={{ accentColor: C.gold }} />
            DIFFUSION FIELD
          </label>

          {/* Seed */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text2, fontFamily: "'DM Mono',monospace" }}>
            SEED
            <input type="number" value={seed} min={1} max={9999}
              onChange={e => setSeed(+e.currentTarget.value)}
              style={{ width: 60, background: "#0d1117", border: `1px solid ${C.border}`, color: C.text, padding: "3px 6px", fontSize: 11, fontFamily: "'DM Mono',monospace" }} />
            <button onClick={() => setSeed(Math.floor(Math.random()*9999)+1)}
              style={{ padding: "3px 8px", border: `1px solid ${C.border}`, background: "transparent", color: C.text2, cursor: "pointer", fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
              RNG
            </button>
          </label>

          <div style={{ marginLeft: "auto", fontSize: 10, color: C.text3 }}>drag · scroll · export</div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          {[
            { color: "#60c4f7", label: "α-helix (coiled ribbon, ½-turn ticks)" },
            { color: "#e2e8f0", label: "β-sheet (flat ribbon + arrow)" },
            { color: "#94a3b8", label: "loop / coil (dashed tube)" },
            { color: "#60f060", label: "N-terminus" },
            { color: "#f06060", label: "C-terminus" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.text3 }}>
              <div style={{ width: 10, height: 10, background: color, borderRadius: 2 }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {[
          { t: "RFdiffusion", b: "David Baker lab (UW) 2023. Diffusion-based generative model for de novo protein backbone design — trained on 57,000 PDB structures, generates designable backbones via noise-→structure denoising trajectory." },
          { t: "α-Helix", b: "3.6 residues/turn, 1.5 Å rise/res, 2.3 Å backbone radius. Stabilised by i→i+4 H-bonds. Rendered here as coiled thick ribbon with half-turn tick marks showing winding handedness." },
          { t: "β-Sheet", b: "Extended conformation: 3.5 Å/res rise. Parallel or anti-parallel strands form H-bond network. Rendered as flat arrow ribbons; arrowhead points C-terminus direction per strand." },
          { t: "AETHER Mapping", b: "Each secondary structure element maps to a coherence shell — helices carry high angular momentum (S-shell), sheets form ordered lattice nodes (L-shell), coils are transition coils (N-shell)." },
        ].map(({ t, b }) => (
          <div key={t} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.gold, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>{t}</div>
            <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{b}</div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      <div style={{ padding: "12px 24px 32px", borderTop: `1px solid ${C.border}` }}>
        <a href="/liquid-print" style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Mono',monospace", textDecoration: "none" }}>
          ← Liquid Print · Bio-Hybrid
        </a>
        <span style={{ color: C.text3, margin: "0 12px" }}>·</span>
        <a href="/" style={{ fontSize: 11, color: C.text3, fontFamily: "'DM Mono',monospace", textDecoration: "none" }}>
          HOME
        </a>
      </div>
    </div>
  );
}
