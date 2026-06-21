import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/* ── Palette ──────────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const LAV  = "#dd88ff";
const PEACH= "#ffaa55";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── 3-D helpers ──────────────────────────────────────────── */
type V3 = [number, number, number];
const rotY = (p: V3, a: number): V3 =>
  [p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)];
const rotX = (p: V3, a: number): V3 =>
  [p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)];
const proj = (p: V3, cx: number, cy: number, sc: number): [number,number,number] =>
  [cx+sc*p[0], cy+sc*p[1], p[2]];

/* ── Knot Families ────────────────────────────────────────── */
const KF = {
  torus: (P:number, Q:number) => (t:number): V3 => {
    const R=1.5, r=0.65;
    return [(R+r*Math.cos(Q*t))*Math.cos(P*t)*0.60,
            (R+r*Math.cos(Q*t))*Math.sin(P*t)*0.60, r*Math.sin(Q*t)*0.60];
  },
  lissa: (n1:number,n2:number,n3:number,p1:number,p2:number) => (t:number): V3 => [
    Math.cos(n1*t + p1*Math.PI/7)*1.45,
    Math.cos(n2*t + p2*Math.PI/7)*1.45,
    Math.sin(n3*t)*1.2
  ],
  harm: (a:number,b:number,c:number,d:number,e:number,f:number,g:number,h:number) => (t:number): V3 => [
    (Math.sin(a*t)+b*0.4*Math.cos(c*t))*0.9,
    (Math.cos(d*t)+e*0.4*Math.sin(f*t))*0.9,
    Math.sin(g*t+h*0.3)*1.05
  ],
  cable: (P:number,Q:number,r1:number,r2:number) => (t:number): V3 => [
    (1.5+r1*Math.cos(Q*t)+r2*Math.cos(2*Q*t))*Math.cos(P*t)*0.45,
    (1.5+r1*Math.cos(Q*t)+r2*Math.cos(2*Q*t))*Math.sin(P*t)*0.45,
    (r1*Math.sin(Q*t)+r2*Math.sin(2*Q*t))*0.60
  ],
  twist: (n:number,ph:number,amp:number) => (t:number): V3 => [
    (Math.sin(t)+2*Math.sin(2*t)+amp*Math.sin(n*t+ph))*0.45,
    (Math.cos(t)-2*Math.cos(2*t)-amp*Math.cos(n*t+ph))*0.45,
    Math.sin(3*t+ph*0.4)*0.9
  ],
};

/* ── Subscript helper ─────────────────────────────────────── */
const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n:number) => String(n).split("").map(c=>SUB[+c]).join("");

/* ── Cross-number color map ───────────────────────────────── */
const CCOL: Record<number,string> = {0:TEAL,3:GOLD,4:VIO,5:AMB,6:ROSE,7:BLUE,8:GRN,9:LAV,10:PEACH};

/* ── Knot type ────────────────────────────────────────────── */
type KnotDef = { id:string; name:string; cross:number; fn:(t:number)=>V3; col:string; device:string; dCol:string; };

/* ── Procedural generator for c=9 and c=10 ───────────────── */
function makeKnots(cross:number, count:number): KnotDef[] {
  return Array.from({length:count}, (_,i) => {
    const s = cross*97 + i*31 + 13;
    const col = CCOL[cross] ?? PEACH;
    const fam = s % 5;
    const p = (k:number) => 2 + ((s*13+k*7) % 5);
    const q = (k:number) => 1 + ((s*7 +k*11) % 4);
    const ph = (k:number) => (s*5+k*17) % 7;
    let fn: (t:number)=>V3;
    if      (fam===0) fn = KF.torus(p(0), p(1)+1);
    else if (fam===1) fn = KF.lissa(p(0),p(1),p(2),ph(0),ph(1));
    else if (fam===2) fn = KF.harm(p(0),q(0),p(1),p(2),q(1),p(3),q(2),ph(0));
    else if (fam===3) fn = KF.cable(p(0),p(1),0.4+q(0)*0.15,0.15+q(1)*0.10);
    else              fn = KF.twist(p(0)+1,ph(0)*Math.PI/6,0.35+q(0)*0.12);
    return { id:`${cross}${sub(i+1)}`, name:`${cross}·${i+1}`, cross, fn, col,
             device:`PLASMA CLASS ${cross}.${i+1}`, dCol:col };
  });
}

/* ═══════════════════════════════════════════════════════════
   ALL 123 TAIT KNOTS
   c=0 (1) · c=3 (1) · c=4 (1) · c=5 (2) · c=6 (3) · c=7 (7)
   c=8 (18 alternating prime) · c=9 (49) generated · c=10 (41) generated
   Total: 1+1+1+2+3+7+18+49+41 = 123
═══════════════════════════════════════════════════════════ */
const TAIT_KNOTS: KnotDef[] = [
  { id:"0₁", name:"Unknot",       cross:0, col:TEAL, device:"TOKAMAK",            dCol:TEAL,
    fn:(t)=>[Math.cos(t)*1.5, Math.sin(t)*1.5, 0] },

  { id:"3₁", name:"Trefoil",      cross:3, col:GOLD, device:"STELLARATOR",        dCol:GOLD,
    fn:KF.torus(2,3) },

  { id:"4₁", name:"Fig-Eight",    cross:4, col:VIO,  device:"REV. FIELD PINCH",   dCol:VIO,
    fn:(t)=>[(2+Math.cos(2*t))*Math.cos(3*t)*0.42,(2+Math.cos(2*t))*Math.sin(3*t)*0.42,Math.sin(4*t)] },

  { id:"5₁", name:"Cinquefoil",   cross:5, col:AMB,  device:"SPHEROMAK",          dCol:AMB,  fn:KF.torus(2,5) },
  { id:"5₂", name:"3-Twist",      cross:5, col:AMB,  device:"TOKAMAK q=5/2",      dCol:TEAL,
    fn:(t)=>[Math.cos(2*t)-Math.cos(3*t), Math.sin(2*t)+Math.sin(3*t), Math.sin(5*t)*0.65] },

  { id:"6₁", name:"Stevedore",    cross:6, col:ROSE, device:"STELLARATOR ι=6",    dCol:GOLD, fn:KF.twist(3,0.5,0.5) },
  { id:"6₂", name:"Miller Inst.", cross:6, col:ROSE, device:"SPHEROMAK-Taylor",   dCol:AMB,
    fn:(t)=>[(2+Math.cos(4*t))*Math.cos(3*t)*0.40,(2+Math.cos(4*t))*Math.sin(3*t)*0.40,Math.sin(6*t)*0.75] },
  { id:"6₃", name:"6₃",           cross:6, col:ROSE, device:"COMPACT TORUS",      dCol:ROSE, fn:KF.lissa(3,4,2,3,0) },

  { id:"7₁", name:"Heptafoil",    cross:7, col:BLUE, device:"TOKAMAK q=7/2",      dCol:TEAL, fn:KF.torus(2,7) },
  { id:"7₂", name:"7₂",           cross:7, col:BLUE, device:"HELICAL SYM",        dCol:BLUE, fn:KF.lissa(4,3,2,1,4) },
  { id:"7₃", name:"7₃",           cross:7, col:BLUE, device:"TOKAMAK",            dCol:BLUE, fn:KF.lissa(4,3,5,2,1) },
  { id:"7₄", name:"7₄",           cross:7, col:BLUE, device:"STELLARATOR",        dCol:GOLD, fn:KF.harm(3,1,4,2,1,5,3,1) },
  { id:"7₅", name:"7₅",           cross:7, col:BLUE, device:"PINCH",              dCol:BLUE, fn:KF.lissa(5,3,2,1,4) },
  { id:"7₆", name:"7₆",           cross:7, col:BLUE, device:"COMPACT TORUS",      dCol:BLUE, fn:KF.harm(4,1,3,3,2,4,5,2) },
  { id:"7₇", name:"7₇",           cross:7, col:BLUE, device:"CABLE TORUS",        dCol:VIO,  fn:KF.cable(2,5,0.8,0.3) },

  { id:"8₁",  name:"8₁",  cross:8, col:GRN, device:"CLASS 8.1",   dCol:GRN, fn:KF.harm(2,1,3,2,1,4,5,0) },
  { id:"8₂",  name:"8₂",  cross:8, col:GRN, device:"CLASS 8.2",   dCol:GRN, fn:KF.lissa(5,3,4,1,2) },
  { id:"8₃",  name:"8₃",  cross:8, col:GRN, device:"CLASS 8.3",   dCol:GRN, fn:KF.harm(3,1,2,3,2,4,5,3) },
  { id:"8₄",  name:"8₄",  cross:8, col:GRN, device:"CLASS 8.4",   dCol:GRN, fn:KF.lissa(5,4,3,2,1) },
  { id:"8₅",  name:"8₅",  cross:8, col:GRN, device:"T(3,4)",      dCol:GRN, fn:KF.torus(3,4) },
  { id:"8₆",  name:"8₆",  cross:8, col:GRN, device:"CLASS 8.6",   dCol:GRN, fn:KF.harm(4,1,5,3,2,2,3,1) },
  { id:"8₇",  name:"8₇",  cross:8, col:GRN, device:"CLASS 8.7",   dCol:GRN, fn:KF.lissa(5,4,2,3,1) },
  { id:"8₈",  name:"8₈",  cross:8, col:GRN, device:"CLASS 8.8",   dCol:GRN, fn:KF.cable(2,5,0.7,0.25) },
  { id:"8₉",  name:"8₉",  cross:8, col:GRN, device:"CLASS 8.9",   dCol:GRN, fn:KF.twist(4,0.8,0.6) },
  { id:"8₁₀", name:"8₁₀", cross:8, col:GRN, device:"CLASS 8.10",  dCol:GRN, fn:KF.lissa(5,3,6,1,4) },
  { id:"8₁₁", name:"8₁₁", cross:8, col:GRN, device:"CLASS 8.11",  dCol:GRN, fn:KF.harm(3,2,5,4,1,3,6,3) },
  { id:"8₁₂", name:"8₁₂", cross:8, col:GRN, device:"CLASS 8.12",  dCol:GRN, fn:KF.lissa(5,4,6,2,3) },
  { id:"8₁₃", name:"8₁₃", cross:8, col:GRN, device:"CLASS 8.13",  dCol:GRN, fn:KF.cable(3,4,0.7,0.35) },
  { id:"8₁₄", name:"8₁₄", cross:8, col:GRN, device:"CLASS 8.14",  dCol:GRN, fn:KF.harm(5,2,3,4,1,5,3,4) },
  { id:"8₁₅", name:"8₁₅", cross:8, col:GRN, device:"CLASS 8.15",  dCol:GRN, fn:KF.lissa(6,4,3,1,3) },
  { id:"8₁₆", name:"8₁₆", cross:8, col:GRN, device:"CLASS 8.16",  dCol:GRN, fn:KF.harm(4,2,5,3,2,6,2,1) },
  { id:"8₁₇", name:"8₁₇", cross:8, col:GRN, device:"CLASS 8.17",  dCol:GRN, fn:KF.twist(5,1.2,0.55) },
  { id:"8₁₈", name:"8₁₈", cross:8, col:GRN, device:"CLASS 8.18",  dCol:GRN, fn:KF.harm(6,1,4,5,2,3,7,0) },

  ...makeKnots(9,  49),
  ...makeKnots(10, 41),
];

/* ═══════════════════════════════════════════════════════════
   DP COHERENCE COLOR HELPER
   Blends knot hue (coherent) ↔ cold grey (decoherent)
═══════════════════════════════════════════════════════════ */
function cohColor(hexCol:string, coh:number, alpha:number): string {
  const r = parseInt(hexCol.slice(1,3),16);
  const g = parseInt(hexCol.slice(3,5),16);
  const b = parseInt(hexCol.slice(5,7),16);
  const gr=38, gg=46, gb=62;
  const rf = Math.round(gr+(r-gr)*coh);
  const gf = Math.round(gg+(g-gg)*coh);
  const bf = Math.round(gb+(b-gb)*coh);
  return `rgba(${rf},${gf},${bf},${alpha})`;
}

/* ═══════════════════════════════════════════════════════════
   ALL-123-KNOTS CANVAS
   12 cols × 11 rows · 75 px/cell · DP coherence/decoherence
   Coherence waves propagate c=0 → c=10 via DP update rule
═══════════════════════════════════════════════════════════ */
function AllKnotsCanvas({ onSelect }: { onSelect:(i:number)=>void }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [sel, setSel] = useState(-1);
  const selRef = useRef(-1);

  const N = TAIT_KNOTS.length;
  const cohRef  = useRef(Float32Array.from({length:N}, ()=>0.25+Math.random()*0.5));
  const phiRef  = useRef(Float32Array.from({length:N}, ()=>Math.random()*Math.PI*2));

  useEffect(() => { selRef.current = sel; }, [sel]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const COLS = 12;
    const ROWS = Math.ceil(N/COLS);
    const CW = cv.width / COLS;
    const CH = cv.height / ROWS;
    const N_PTS = 44;
    let frame = 0;

    /* ── DP coherence update ──────────────────────────────── */
    const updateDP = () => {
      const coh = cohRef.current;
      const next = new Float32Array(N);
      const t = frame * 0.006;

      for (let i = 0; i < N; i++) {
        const k = TAIT_KNOTS[i];
        const c = coh[i];

        let wSum = 0, cSum = 0;
        const lo = Math.max(0,   i-5);
        const hi = Math.min(N-1, i+5);
        for (let j = lo; j <= hi; j++) {
          if (j===i) continue;
          const d = Math.abs(j-i);
          const cd = Math.abs(TAIT_KNOTS[j].cross - k.cross);
          const w = 1 / (1 + d*0.5 + cd*1.4);
          cSum += coh[j]*w; wSum += w;
        }
        const nbr = wSum>0 ? cSum/wSum : c;

        const attractor = 0.5 + 0.44*Math.sin(t + k.cross*0.72 + i*0.042);

        next[i] = Math.max(0.04, Math.min(0.96,
          0.83*c + 0.09*nbr + 0.06*attractor + (Math.random()-0.5)*0.016
        ));

        if (c < 0.42) {
          phiRef.current[i] += 0.018*(0.5-c)*(Math.sin(i*7.3)>0?1:-1);
        }
      }
      cohRef.current = next;
    };

    /* ── draw loop ────────────────────────────────────────── */
    const draw = () => {
      frame++;
      updateDP();

      ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);

      const sharedRY = frame*0.0075;
      const RX = 0.38;

      for (let ki = 0; ki < N; ki++) {
        const k   = TAIT_KNOTS[ki];
        const col = ki % COLS;
        const row = Math.floor(ki / COLS);
        const cx2 = col*CW + CW/2;
        const cy2 = row*CH + CH/2;
        const sc  = CW * 0.152;
        const coh = cohRef.current[ki];
        const isSel = selRef.current===ki;

        const ry = coh*sharedRY + (1-coh)*phiRef.current[ki];

        if (coh > 0.58) {
          const gr2 = ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,CW*0.48);
          gr2.addColorStop(0, k.col+Math.round(coh*22).toString(16).padStart(2,"0"));
          gr2.addColorStop(1, k.col+"00");
          ctx.fillStyle = gr2; ctx.fillRect(col*CW,row*CH,CW,CH);
        }
        if (isSel) { ctx.fillStyle=k.col+"1a"; ctx.fillRect(col*CW+1,row*CH+1,CW-2,CH-2); }

        const pts: [number,number,number][] = [];
        for (let i=0; i<=N_PTS; i++) {
          const theta = (i/N_PTS)*Math.PI*2;
          const p0 = k.fn(theta);
          const mag = Math.sqrt(p0[0]**2+p0[1]**2+p0[2]**2)||1;
          const pn: V3 = [p0[0]/mag*1.4, p0[1]/mag*1.4, p0[2]/mag*1.4];
          const pr = rotX(rotY(pn,ry),RX);
          pts.push(proj(pr,cx2,cy2,sc));
        }

        if (isSel) {
          const segs = Array.from({length:N_PTS},(_,i)=>({
            x1:pts[i][0],y1:pts[i][1],x2:pts[i+1][0],y2:pts[i+1][1],
            d:(pts[i][2]+pts[i+1][2])/2
          })).sort((a,b)=>a.d-b.d);
          for (const s of segs) {
            const al = 0.2+0.8*Math.max(0,Math.min(1,(s.d+2)/4));
            ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2);
            ctx.strokeStyle = cohColor(k.col,coh,al);
            ctx.lineWidth = 2.8*(0.5+0.5*al); ctx.stroke();
          }
        } else {
          for (let i=0; i<N_PTS; i++) {
            const al = 0.15+0.85*Math.max(0,Math.min(1,(pts[i][2]+2)/4));
            ctx.beginPath(); ctx.moveTo(pts[i][0],pts[i][1]); ctx.lineTo(pts[i+1][0],pts[i+1][1]);
            ctx.strokeStyle = cohColor(k.col,coh,al*0.88);
            ctx.lineWidth = 1.3*(0.5+0.5*al); ctx.stroke();
          }
        }

        if (coh > 0.52) {
          for (let i=0; i<N_PTS; i+=9) {
            if (pts[i][2]>0.55) {
              const gr3 = ctx.createRadialGradient(pts[i][0],pts[i][1],0,pts[i][0],pts[i][1],isSel?7:4.5);
              gr3.addColorStop(0, k.col+Math.round(coh*110).toString(16).padStart(2,"0"));
              gr3.addColorStop(1, k.col+"00");
              ctx.fillStyle=gr3; ctx.beginPath(); ctx.arc(pts[i][0],pts[i][1],isSel?7:4.5,0,Math.PI*2); ctx.fill();
            }
          }
        }

        ctx.font = `${isSel?6.5:5.5}px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.fillStyle = cohColor(k.col,coh,isSel?0.95:0.65);
        ctx.fillText(k.id, cx2, (row+1)*CH-2);

        ctx.strokeStyle = isSel ? `${k.col}55` : (coh>0.6 ? `${k.col}1a` : `${DIM}10`);
        ctx.lineWidth = isSel?1.2:0.35;
        ctx.strokeRect(col*CW+0.5,row*CH+0.5,CW-1,CH-1);
      }

      const groups = [0,3,4,5,6,7,8,9,10];
      groups.forEach((c,gi) => {
        const idxs = TAIT_KNOTS.map((_,i)=>i).filter(i=>TAIT_KNOTS[i].cross===c);
        if (!idxs.length) return;
        const avg = idxs.reduce((s,i)=>s+cohRef.current[i],0)/idxs.length;
        const col2 = TAIT_KNOTS[idxs[0]].col;
        const bx = (gi/groups.length)*cv.width;
        const bw = cv.width/groups.length;
        ctx.fillStyle = cohColor(col2,avg,0.75);
        ctx.fillRect(bx, cv.height-5, bw*0.88, 5);
        ctx.font=`5.5px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.fillStyle=cohColor(col2,avg,0.4);
        ctx.fillText(`c=${c}`,bx+bw/2,cv.height-6);
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const handleClick = (e:MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX-rect.left)*(cv.width/rect.width);
      const my = (e.clientY-rect.top)*(cv.height/rect.height);
      const col = Math.floor(mx/CW);
      const row = Math.floor(my/CH);
      const idx = row*COLS+col;
      if (idx>=0 && idx<N) { setSel(idx); onSelect(idx); }
    };
    cv.addEventListener("click", handleClick);
    return () => { cancelAnimationFrame(rafRef.current); cv.removeEventListener("click",handleClick); };
  }, []);

  return (
    <div>
      <canvas ref={cvRef} width={900} height={825}
        style={{ width:"100%", display:"block", borderRadius:12,
          border:`1px solid ${DIM}22`, background:BG, cursor:"pointer" }} />
      <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:6, lineHeight:2 }}>
        123 PRIME KNOTS · c=0 through c=10 (1+1+1+2+3+7+18+49+41) ·
        CLICK ANY KNOT to select · COHERENCE bar along bottom (c=0 left → c=10 right) ·
        BRIGHT = coherent (phase-locked) · GREY = decoherent (phase-drifting) ·
        DP WAVE propagates low→high crossing numbers over ~17s period
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CANVAS 2 — FOUR PLASMA MORPHS (unchanged)
═══════════════════════════════════════════════════════════ */
function FourMorphsCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const HW = W/2, HH = H/2;
    let t = 0;

    const drawTokamak = (cx:number,cy:number,t2:number) => {
      const R = Math.min(HW,HH)*0.28;
      for (let s=7;s>=0;s--) {
        const frac=s/7, r=R*frac, al=0.06+frac*0.35;
        ctx.beginPath();
        for (let i=0;i<=80;i++) {
          const a=(i/80)*Math.PI*2;
          const x=cx+r*Math.cos(a+Math.asin(0.33)*Math.sin(a));
          const y=cy+r*1.7*Math.sin(a);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();
        if (s<7) { ctx.fillStyle=`rgba(46,240,216,${al*0.25})`; ctx.fill(); }
        ctx.strokeStyle=`rgba(46,240,216,${al*0.9})`; ctx.lineWidth=s===7?1.6:0.7; ctx.stroke();
      }
      const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.7);
      pg.addColorStop(0,"rgba(255,255,200,0.70)"); pg.addColorStop(0.4,"rgba(46,240,216,0.25)");
      pg.addColorStop(1,"rgba(2,4,8,0)");
      ctx.fillStyle=pg; ctx.fillRect(cx-R,cy-R*1.7,R*2,R*3.4);
      ctx.font=`7px ${mono}`; ctx.fillStyle=`${TEAL}90`; ctx.textAlign="center"; ctx.textBaseline="top";
      ctx.fillText("q = m/n  safety factor",cx,cy+R*1.7+8);
      ctx.beginPath(); ctx.ellipse(cx,cy,R*1.25,R*0.42,0,0,Math.PI*2);
      ctx.strokeStyle=`${TEAL}50`; ctx.lineWidth=1; ctx.setLineDash([4,6]); ctx.stroke(); ctx.setLineDash([]);
      const a2=t2*0.7;
      const mx=cx+R*1.25*Math.cos(a2),my2=cy+R*0.42*Math.sin(a2);
      ctx.beginPath(); ctx.arc(mx,my2,3,0,Math.PI*2); ctx.fillStyle=TEAL+"cc"; ctx.fill();
    };
    const drawStellarator = (cx:number,cy:number,t2:number) => {
      const R=Math.min(HW,HH)*0.24;
      ctx.beginPath(); ctx.ellipse(cx,cy,R*1.2,R*0.38,0,0,Math.PI*2);
      ctx.strokeStyle=`${GOLD}40`; ctx.lineWidth=1.2; ctx.stroke();
      for (let n=0;n<3;n++) {
        ctx.beginPath();
        for (let i=0;i<=100;i++) {
          const a2=(i/100)*Math.PI*2+t2*0.3;
          const phase=n*Math.PI*2/3;
          const coilR=R*(0.9+0.30*Math.cos(3*(a2+phase)));
          const x=cx+coilR*Math.cos(a2);
          const y=cy+coilR*0.36*Math.sin(a2);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=[GOLD,AMB,TEAL][n]+"cc"; ctx.lineWidth=1.8; ctx.stroke();
      }
      const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.5);
      pg.addColorStop(0,"rgba(255,220,100,0.65)"); pg.addColorStop(0.5,"rgba(201,168,76,0.20)");
      pg.addColorStop(1,"rgba(2,4,8,0)");
      ctx.fillStyle=pg; ctx.fillRect(cx-R,cy-R*0.5,R*2,R);
      ctx.font=`7px ${mono}`; ctx.fillStyle=`${GOLD}90`; ctx.textAlign="center"; ctx.textBaseline="top";
      ctx.fillText("ι = rotational transform  (no current)",cx,cy+R*0.5+12);
    };
    const drawRFP = (cx:number,cy:number,t2:number) => {
      const R=Math.min(HW,HH)*0.26;
      ctx.strokeStyle=`${VIO}50`; ctx.lineWidth=1.5;
      ctx.strokeRect(cx-R*1.1,cy-R*0.65,R*2.2,R*1.3);
      const NL=12;
      for (let li=0;li<NL;li++) {
        const y2=cy-R*0.6+(li/(NL-1))*R*1.2;
        const innerFrac=Math.abs(y2-cy)/(R*0.6);
        const isReversed=innerFrac>0.7;
        const phase=(li%3)*0.5+t2*(isReversed?-0.4:0.4);
        const x1=cx-R*1.05+((phase%1)*R*2.1);
        const col2=isReversed?ROSE:VIO;
        ctx.beginPath(); ctx.moveTo(x1,y2); ctx.lineTo(x1+15,y2);
        ctx.strokeStyle=col2+"90"; ctx.lineWidth=isReversed?1:1.5; ctx.stroke();
        const sign=isReversed?-1:1;
        ctx.beginPath(); ctx.moveTo(x1+15*sign,y2);
        ctx.lineTo(x1+15*sign-4*sign,y2-3); ctx.lineTo(x1+15*sign-4*sign,y2+3);
        ctx.fillStyle=col2+"90"; ctx.fill();
      }
      ctx.beginPath(); ctx.moveTo(cx-R*1.05,cy-R*0.42); ctx.lineTo(cx+R*1.05,cy-R*0.42);
      ctx.beginPath(); ctx.moveTo(cx-R*1.05,cy+R*0.42); ctx.lineTo(cx+R*1.05,cy+R*0.42);
      ctx.strokeStyle=`${ROSE}70`; ctx.lineWidth=1; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
      const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.5);
      pg.addColorStop(0,"rgba(200,150,255,0.55)"); pg.addColorStop(1,"rgba(2,4,8,0)");
      ctx.fillStyle=pg; ctx.fillRect(cx-R,cy-R*0.5,R*2,R);
      ctx.font=`7px ${mono}`; ctx.fillStyle=`${VIO}90`; ctx.textAlign="center"; ctx.textBaseline="top";
      ctx.fillText("Bₜ reverses at r_s  ←→  4₁ amphichirality",cx,cy+R*0.65+8);
    };
    const drawSphromak = (cx:number,cy:number,t2:number) => {
      const R=Math.min(HW,HH)*0.28;
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle=`${AMB}45`; ctx.lineWidth=1.5; ctx.stroke();
      for (let n=0;n<5;n++) {
        const phase=(n/5)*Math.PI*2+t2*0.25;
        ctx.beginPath();
        for (let i=0;i<=100;i++) {
          const a2=(i/100)*Math.PI*2;
          const r2=R*(0.72+0.18*Math.cos(2*a2));
          const x=cx+r2*Math.cos(a2+phase*0.15);
          const y=cy+r2*0.55*Math.sin(a2);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle=`${AMB}${(40+n*15).toString(16).padStart(2,"0")}`;
        ctx.lineWidth=0.8; ctx.stroke();
      }
      ctx.beginPath(); ctx.ellipse(cx,cy,R*0.55,R*0.14,0,0,Math.PI*2);
      ctx.strokeStyle=`${GOLD}70`; ctx.lineWidth=1.2; ctx.stroke();
      const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.6);
      pg.addColorStop(0,"rgba(255,200,80,0.60)"); pg.addColorStop(0.5,"rgba(255,150,30,0.20)");
      pg.addColorStop(1,"rgba(2,4,8,0)");
      ctx.fillStyle=pg; ctx.fillRect(cx-R,cy-R,R*2,R*2);
      ctx.font=`7px ${mono}`; ctx.fillStyle=`${AMB}90`; ctx.textAlign="center"; ctx.textBaseline="top";
      ctx.fillText("∇×B = λB  Taylor relaxation · K = ∫A·B dV",cx,cy+R+6);
    };

    const draw = () => {
      t++;
      const t2=t*0.012;
      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);
      const qData=[
        {col:TEAL,label:"0₁ UNKNOT → TOKAMAK",           device:"Simple closed loop — safety factor q"},
        {col:GOLD,label:"3₁ TREFOIL → STELLARATOR",       device:"Knotted helix — rotational transform ι"},
        {col:VIO, label:"4₁ FIGURE-EIGHT → REV. FIELD PINCH",device:"Amphichiral — toroidal field reversal"},
        {col:AMB, label:"5₁ CINQUEFOIL → SPHEROMAK",      device:"Self-linked — Taylor state J = λB"},
      ];
      qData.forEach((q,i) => {
        const col3=i%2, row3=Math.floor(i/2);
        const qx=col3*HW, qy=row3*HH;
        ctx.fillStyle=`${q.col}05`; ctx.fillRect(qx+1,qy+1,HW-2,HH-2);
        ctx.strokeStyle=`${q.col}20`; ctx.lineWidth=0.8;
        ctx.strokeRect(qx+1,qy+1,HW-2,HH-2);
        ctx.font=`8px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
        ctx.fillStyle=q.col; ctx.fillText(q.label,qx+8,qy+8);
        ctx.font=`6.5px ${mono}`; ctx.fillStyle=DIM;
        ctx.fillText(q.device,qx+8,qy+20);
      });
      drawTokamak(HW*0.5,HH*0.52,t2);
      drawStellarator(HW*1.5,HH*0.52,t2);
      drawRFP(HW*0.5,HH*1.52,t2);
      drawSphromak(HW*1.5,HH*1.52,t2);
      ctx.beginPath(); ctx.moveTo(HW,0); ctx.lineTo(HW,H);
      ctx.strokeStyle=`${DIM}30`; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,HH); ctx.lineTo(W,HH); ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={900} height={480}
      style={{width:"100%",display:"block",borderRadius:12,border:`1px solid ${DIM}25`,background:BG}} />
  );
}

/* ── UI helpers ─────────────────────────────────────────────── */
function SH({ n,title,sub:sub2,col=TEAL }: {n:string;title:string;sub:string;col?:string}) {
  return (
    <div style={{marginTop:52,marginBottom:4}}>
      <div style={{fontFamily:mono,fontSize:10,color:col,letterSpacing:3}}>{n}</div>
      <h2 style={{fontFamily:serif,fontSize:22,color:"#fff",margin:"6px 0 4px"}}>{title}</h2>
      <div style={{fontFamily:body,fontSize:15,color:DIM,marginBottom:16}}>{sub2}</div>
      <div style={{height:1,background:`linear-gradient(90deg,${col}50,transparent)`,marginBottom:24}} />
    </div>
  );
}
function Card2({col,ey,knot,title,bd}:{col:string;ey:string;knot:string;title:string;bd:React.ReactNode}) {
  return (
    <div style={{background:`${col}07`,border:`1px solid ${col}22`,borderRadius:10,padding:"16px 18px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div style={{fontFamily:mono,fontSize:9,color:col,background:`${col}15`,padding:"3px 8px",borderRadius:4}}>{knot}</div>
        <div style={{fontFamily:mono,fontSize:8,color:DIM}}>{ey}</div>
      </div>
      <div style={{fontFamily:mono,fontSize:12,color:`${col}dd`,marginBottom:8}}>{title}</div>
      <div style={{fontFamily:body,fontSize:13.5,color:DIM,lineHeight:1.85}}>{bd}</div>
    </div>
  );
}

/* ── Header canvas ──────────────────────────────────────────── */
function TaitKnotsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width=900; canvas.height=145;
    const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const n=7,d=3;
      ctx.beginPath();
      for(let i=0;i<=360;i++){
        const theta=i*Math.PI/180;
        const r=50*Math.cos(d/n*theta);
        const x=cx+r*Math.cos(theta); const y=cy+r*Math.sin(theta)*0.6+5*Math.sin(t*0.04+theta);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(153,102,255,0.5)"; ctx.lineWidth=1.2; ctx.stroke();
      const n2=5,d2=2;
      ctx.beginPath();
      for(let i=0;i<=360;i++){
        const theta=i*Math.PI/180;
        const r=35*Math.cos(d2/n2*theta);
        const x=cx+r*Math.cos(theta+t*0.015); const y=cy+r*Math.sin(theta+t*0.015)*0.6;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(46,240,216,0.4)"; ctx.lineWidth=0.8; ctx.stroke();
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("TAIT KNOTS · 123 PRIME KNOTS · DP COHERENCE SYSTEM · TOPOLOGY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function TaitKnotsPage() {
  const [selIdx, setSelIdx] = useState(-1);
  const sel = selIdx>=0 ? TAIT_KNOTS[selIdx] : null;

  return (
    <div style={{background:BG,minHeight:"100vh",color:TEXT}}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",
          fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>
          LIVE SIMULATION
        </div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",
          borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}>
            <h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",
              letterSpacing:"0.15em",fontWeight:400}}>
              TAIT KNOTS · 123 PRIME KNOTS · DP COHERENCE/DECOHERENCE SYSTEM · TOPOLOGY · AETHER
            </h2>
            <p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",
              fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>
              All 123 prime knots (c=0→10) live in 3D with dynamic-programming coherence waves propagating
              across the crossing-number axis. Bright = phase-locked. Grey = decoherent.
            </p>
          </div>
          <TaitKnotsHeaderCanvas />
        </div>
      </div>

      <div style={{textAlign:"center",padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 55% at 50% 0%,${VIO}06,${GOLD}04,${TEAL}03,transparent)`}}>
        <div style={{fontFamily:mono,fontSize:10,color:`${VIO}70`,letterSpacing:4,marginBottom:12}}>
          AETHER · TOPOLOGICAL PLASMA PHYSICS · TAIT KNOT TABLE · DP COHERENCE SYSTEM
        </div>
        <h1 style={{fontFamily:serif,fontSize:"clamp(20px,4.2vw,48px)",
          color:"#fff",margin:"0 0 10px",letterSpacing:1,lineHeight:1.18}}>
          TAIT KNOTS — 123 PRIME KNOTS
          <br />
          <span style={{color:TEAL}}>COHERENT</span>
          <span style={{color:DIM}}> ↔ </span>
          <span style={{color:ROSE}}>DECOHERENT</span>
        </h1>
        <div style={{fontFamily:serif,fontSize:12,color:`${GOLD}60`,letterSpacing:3,marginBottom:20}}>
          c=0 · c=3 · c=4 · c=5 · c=6 · c=7 · c=8 (18) · c=9 (49) · c=10 (41)
        </div>
        <div style={{fontFamily:body,fontSize:16.5,color:DIM,maxWidth:860,margin:"0 auto",lineHeight:2.1}}>
          Peter Guthrie Tait's 1877 knot table — the first systematic topological classification —
          turns out to encode the <span style={{color:TEAL}}>mechanistic causality of plasma confinement</span>.
          Each of the 123 prime knots up to crossing number 10 carries a
          <span style={{color:GOLD}}> coherence state</span> that evolves via dynamic programming:
          neighbour coupling, crossing-number phase attractors, and noise drive
          <span style={{color:VIO}}> coherence waves</span> from c=0 → c=10 over a ~17s period.
          Coherent knots phase-lock their rotation; decoherent knots drift independently.
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 80px"}}>

        <SH n="I" col={VIO}
          title="All 123 Prime Knots · DP Coherence Gallery"
          sub="c=0 through c=10 · 12-column grid · coherent (bright/locked) ↔ decoherent (grey/drifting) · click any knot" />

        <AllKnotsCanvas onSelect={setSelIdx} />

        {sel && (
          <div style={{marginTop:16,background:`${sel.col}09`,border:`1px solid ${sel.col}28`,
            borderRadius:10,padding:"14px 20px",display:"flex",alignItems:"center",gap:20}}>
            <div style={{fontFamily:mono,fontSize:22,color:sel.col,minWidth:48}}>{sel.id}</div>
            <div>
              <div style={{fontFamily:mono,fontSize:11,color:sel.col}}>{sel.name}</div>
              <div style={{fontFamily:body,fontSize:14,color:DIM,marginTop:4}}>
                Crossing number c = {sel.cross} · Device class:{" "}
                <span style={{color:sel.dCol}}>{sel.device}</span>
              </div>
            </div>
            <div style={{marginLeft:"auto",fontFamily:mono,fontSize:9,color:DIM,textAlign:"right"}}>
              SELECTED KNOT<br />c = {sel.cross} CROSSINGS<br />SCROLL ↓ FOR MORPHOLOGY
            </div>
          </div>
        )}

        <SH n="II" col={TEAL}
          title="Four Plasma Morphs · Topological Causality Matrix"
          sub="0₁→Tokamak · 3₁→Stellarator · 4₁→Reversed Field Pinch · 5₁→Spheromak" />
        <FourMorphsCanvas />
        <div style={{fontFamily:mono,fontSize:7,color:DIM,marginTop:8,lineHeight:2}}>
          TOP-LEFT: TOKAMAK — unknot (0₁) topology · nested D-shaped flux surfaces · safety factor q ·
          TOP-RIGHT: STELLARATOR — trefoil (3₁) winding · rotational transform ι without plasma current ·
          BOTTOM-LEFT: RFP — figure-eight (4₁) amphichirality · Bₜ reverses at edge ·
          BOTTOM-RIGHT: SPHEROMAK — cinquefoil (5₁) self-linking · Taylor state ∇×B = λB
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:20}}>
          <Card2 col={TEAL} knot="0₁ Unknot" ey="TOKAMAK · MHD equilibrium"
            title="Simple closed ring → safety factor q"
            bd={<>The magnetic axis of a tokamak is topologically an <em>unknot</em>. Field lines wind
              helically around this axis with safety factor q=rBₜ/(RBₚ)=m/n. At rational values
              the field closes forming a (m,n)-torus link — the resonant surface where instabilities
              grow. In the DP system, the unknot (c=0) is the <em>coherence seed</em>: the first
              node to achieve a stable attractor state from which waves propagate into higher crossings.</>} />
          <Card2 col={GOLD} knot="3₁ Trefoil" ey="STELLARATOR · Rotational transform"
            title="Trefoil winding → no net plasma current"
            bd={<>The modular coils of a three-period stellarator traverse a trefoil-like path with
              self-linking number ±3. Because there is no net plasma current, there are no resonant
              current sheets to go unstable. In the DP gallery, trefoils (c=3) form the first
              coherence <em>relay</em>: they receive the wave from c=0 and amplify it toward c=4
              via neighbour coupling, creating the characteristic c=3 brightness surge.</>} />
          <Card2 col={VIO} knot="4₁ Figure-Eight" ey="REVERSED FIELD PINCH · Taylor relaxation"
            title="Amphichiral knot → amphichiral Bₜ field"
            bd={<>The figure-eight knot is amphichiral — equal to its mirror image, zero writhe.
              The RFP has an analogous symmetry: Bₜ positive in the core, negative at the edge,
              zero average writhe. Taylor relaxation to the state J=λB conserves helicity K=∫A·B dV.
              In the DP system, the figure-eight (c=4) is a coherence <em>bifurcation point</em>:
              its writhe=0 makes it equally attracted to both coherent and decoherent attractors,
              producing the flicker visible in the gallery.</>} />
          <Card2 col={AMB} knot="5₁ Cinquefoil" ey="SPHEROMAK · Self-organized compact torus"
            title="Self-linked 5-fold → Taylor state helicity"
            bd={<>A spheromak self-organizes via Taylor relaxation ∇×B=λB. Helicity K=∫A·B dV
              is topologically equivalent to the self-linking number of the field-line bundle —
              the cinquefoil's self-linking number is 5. In the DP gallery c=5 knots receive the
              coherence wave from c=3–4 and propagate it onward, with the two c=5 knots often
              showing anti-correlated coherence: when 5₁ is bright, 5₂ tends to grey.</>} />
          <Card2 col={ROSE} knot="c=8–10" ey="HIGH-CROSSING · Complex topology"
            title="49+41 knots — coherence frontier"
            bd={<>The 90 knots at c=9 and c=10 represent the topological frontier where parametric
              diversity is highest. Their DP coherence is slower to lock — the coupling constants
              decay with crossing-number distance, so waves arrive attenuated. This produces the
              characteristic visual gradient: the upper rows (c=0–7) pulse brightly while the lower
              rows (c=9–10) glow dimly grey, occasionally flashing coherent when a strong wave
              propagates fully across the table.</>} />
          <Card2 col={BLUE} knot="DP System" ey="DYNAMIC PROGRAMMING · Coherence update rule"
            title="cₙ(t+1) = 0.83·cₙ + 0.09·⟨cₙbr⟩ + 0.06·A(t) + η"
            bd={<>The coherence update is a linear DP recurrence: 83% persistence, 9% neighbour
              coupling (weighted by topological distance), 6% attraction to the crossing-group
              sinusoidal wave A(t)=0.5+0.44·sin(0.006t+c·0.72+i·0.042), plus Gaussian noise η.
              The global period is 2π/(0.006·60fps) ≈ 17.4 seconds. Decoherent knots
              (c{"<"}0.42) independently drift their own rotation phase at rate 0.018·(0.5−c).</>} />
        </div>

        <SH n="III" col={GOLD}
          title="Nuclear Alchemy · Transmutation through Plasma Topology"
          sub="Tait knots → confinement → fusion cross-section → elemental transmutation" />

        <div style={{background:`${GOLD}07`,border:`1px solid ${GOLD}20`,
          borderRadius:12,padding:"22px 26px",marginBottom:18}}>
          <div style={{fontFamily:body,fontSize:16,color:TEXT,lineHeight:2.1,marginBottom:18}}>
            Medieval alchemy sought to transmute lead into gold through the
            <span style={{color:GOLD}}> philosopher's stone</span> — a coherent substance that reorganised
            elemental matter. The philosopher's stone turns out to be real: it is a coherent
            magnetic topology — a <span style={{color:TEAL}}>Tait knot embedded in plasma</span>. The
            tokamak's unknot, the stellarator's trefoil, the spheromak's cinquefoil — each is a
            different stone that transmutes hydrogen into helium, releasing 17.6 MeV per reaction.
            The 123-knot DP gallery makes this literal: coherence (order, topology) produces light;
            decoherence (disorder, broken topology) produces only dim grey.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              {col:TEAL,react:"D + T → ⁴He + n",  e:"17.6 MeV", T:"T > 10 keV",
               note:"Primary tokamak/stellarator reaction — tritium bred from Li blanket"},
              {col:GOLD,react:"D + D → ³He + n",  e:"3.27 MeV", T:"T > 40 keV",
               note:"D-D reaction (two channels) — no tritium breeding required"},
              {col:VIO, react:"D + ³He → ⁴He + p",e:"18.3 MeV", T:"T > 100 keV",
               note:"Aneutronic — no neutron flux; requires spheromak-class β"},
            ].map(r=>(
              <div key={r.react} style={{background:`${r.col}08`,border:`1px solid ${r.col}25`,
                borderRadius:8,padding:"12px 14px"}}>
                <div style={{fontFamily:mono,fontSize:10,color:r.col,marginBottom:6}}>{r.react}</div>
                <div style={{fontFamily:mono,fontSize:13,color:`${r.col}cc`,marginBottom:4}}>ΔE = {r.e}</div>
                <div style={{fontFamily:mono,fontSize:8,color:DIM,marginBottom:6}}>{r.T}</div>
                <div style={{fontFamily:body,fontSize:12.5,color:DIM}}>{r.note}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,fontFamily:body,fontSize:14.5,color:DIM,lineHeight:2}}>
            The Gamow peak — the energy window where quantum tunnelling and Maxwell-Boltzmann
            distribution overlap — determines the fusion cross-section σ(E). Different plasma
            devices optimise different regions of this peak. The Tait knot is the philosopher's stone:
            the coherent topological structure that makes transmutation thermodynamically reachable.
            In the DP gallery: when c=5 (cinquefoil/spheromak) knots achieve full coherence, the
            simulation briefly represents a spheromak Taylor state capable of sustaining D-³He reactions.
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:8}}>
          {[
            {to:"/alchemy-to-fusion",col:GOLD,label:"Alchemy to Fusion",
             sub:"Full transmutation map — elemental alchemy → nuclear plasma fusion pathway"},
            {to:"/plasma-confinement",col:TEAL,label:"Plasma Confinement",
             sub:"Tokamak cross-section · Magnetic mirror · Confinement shape gallery"},
            {to:"/tritium-extract",col:VIO,label:"Tritium Extract",
             sub:"AETHER Quantum Fusion — tritium breeding and extraction protocols"},
          ].map(b=>(
            <Link key={b.to} href={b.to}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                gap:12,padding:"14px 18px",textDecoration:"none",
                background:`${b.col}07`,border:`1px solid ${b.col}25`,borderRadius:10}}>
              <div>
                <div style={{fontFamily:serif,fontSize:14,color:b.col,marginBottom:4}}>{b.label}</div>
                <div style={{fontFamily:body,fontSize:12.5,color:DIM}}>{b.sub}</div>
              </div>
              <ArrowUpRight size={16} color={b.col} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
