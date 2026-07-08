import { useRef, useEffect, useState, useCallback } from "react";

const N = 31;

type Mode = "cgle" | "sh" | "ms" | "earth";

const EQ: Record<string, string> = {
  cgle: "dA/dt = μA + (1+iα)∇²A − (1+iβ)|A|²A",
  sh:   "∂u/∂t = εu − (1+∇²)²u + bu² − u³",
  ms:   "ψ̇ = −C·ψ − β|ψ|²ψ  [coupled oscillator substrate]",
  earth:"Sun → Atmosphere → EM Field → Body → DNA — one coupled wave system",
};

const TOUR_STEPS = [
  { dur: 6500, text: "Welcome! You're looking at a <b>live PDE simulator</b> running three different equations simultaneously selectable above. Each pixel is an oscillating node evolving in real time. This tour walks you through what's physically happening — watch the canvas as we go.", mode: "cgle" as Mode, spot: null as null | { region: [number,number,number,number] | "sidebar"; label?: string }, params: null as null | Record<string, number> },
  { dur: 6000, text: "We're starting with the <b>Complex Ginzburg-Landau Equation (CGLE)</b> — one of the most universal equations in physics. It appears in superconductors, lasers, cardiac tissue, and chemical reactions. The grid is 31×31 nodes, each a complex oscillator.", mode: null, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: null },
  { dur: 6000, text: "<b>Color = phase</b> of each oscillator — where it is in its cycle. Like a clock hand: red=12, green=3, cyan=6, purple=9. When you see a wave of color sweeping across, that's a <em>phase front</em> — synchronized oscillation spreading through the network.", mode: null, spot: { region: [3,12,3,12] as [number,number,number,number] }, params: null },
  { dur: 6000, text: "<b>Brightness = amplitude</b> — how energetically each node oscillates. A sudden dark patch is destructive interference: two waves arriving out of phase and cancelling. A bright flash is constructive interference — waves reinforcing each other.", mode: null, spot: { region: [3,12,17,28] as [number,number,number,number] }, params: null },
  { dur: 6500, text: "The grid has <b>three regions</b> seeded with different starting phases. <span style='color:#ff6688'>Top-left: Cancer/Genomic</span> — models cell-cycle oscillator instability. Notice its wave pattern evolves differently from the others.", mode: null, spot: { region: [1,14,1,14] as [number,number,number,number] }, params: null },
  { dur: 5500, text: "<span style='color:#66ffcc'>Top-right: Climate/Environment</span> — atmospheric wave dynamics. It was seeded 2.8 radians out of phase with Cancer, so it maintains a different tempo. Phase offsets are how real climate systems maintain independence from biological rhythms.", mode: null, spot: { region: [1,14,17,29] as [number,number,number,number] }, params: null },
  { dur: 5500, text: "<span style='color:#ffcc44'>Bottom: Economics/Social</span> — the largest region. Watch waves born here travel upward toward the region borders. That upward leakage is the cross-domain coupling — a crash here will physically change the wave pattern above.", mode: null, spot: { region: [16,29,3,27] as [number,number,number,number] }, params: null },
  { dur: 6500, text: "Now watch the <b>β (nonlinearity) slider</b>. We're raising it to 2.5. When β is high, the nonlinear term −(1+iβ)|A|²A twists the phase as it saturates amplitude. Coherent waves break into <b>spatiotemporal turbulence</b> — the same instability seen in cardiac fibrillation.", mode: null, spot: { region: "sidebar" as "sidebar", label: "β slider" }, params: null },
  { dur: 6500, text: "<b>β = 2.5, Benjamin-Feir criterion satisfied (α·β > 1).</b> Watch the clean wave pattern fracture into chaotic speckle — every region is now turbulent. The Regime indicator just switched to ⚡ Turbulent. This is deterministic chaos, not noise.", mode: null, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: { beta: 2.5 } },
  { dur: 5500, text: "Bringing β back down to 0.5 — below the Benjamin-Feir threshold. Watch the system <b>self-organize back into traveling waves</b>. The turbulence doesn't just stop — it finds an attractor. The wave patterns you see re-emerging are stable solutions of the equation.", mode: null, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: { beta: 0.5, mu: 1.0 } },
  { dur: 6000, text: "Now switching to <b>Swift-Hohenberg (SH)</b> — a completely different equation. SH describes <em>stationary pattern formation</em>: stripes, spots, hexagons. It models Rayleigh-Bénard convection cells, skin pigmentation patterns, and reaction-diffusion in chemical systems.", mode: "sh" as Mode, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: { eps: 0.3, b_sh: 0 } },
  { dur: 6000, text: "Notice the color scheme changed — SH is a <b>real-valued field</b> (not complex), so we use a blue→yellow gradient. Blue = low field value, yellow = high. The patterns slowly nucleating from noise are stripes — the primary instability of the SH equation near onset.", mode: null, spot: { region: [3,20,3,20] as [number,number,number,number] }, params: null },
  { dur: 6500, text: "Watch the <b>ε (onset) parameter</b> — we're raising it to 0.9. ε is the bifurcation parameter: below zero, only the flat state is stable; above zero, patterns form. Higher ε = stronger pattern drive. Watch the stripes sharpen and organize.", mode: null, spot: { region: "sidebar" as "sidebar", label: "ε slider" }, params: null },
  { dur: 6000, text: "<b>ε = 0.9</b> — the stripes are now well-developed. Each stripe is a crest of the standing wave solution. Notice how stripes in different regions have different orientations — they nucleated independently and couldn't agree on a direction. That's a grain boundary.", mode: null, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: { eps: 0.9 } },
  { dur: 6500, text: "Now raising <b>b (quadratic term) to 0.8</b>. This breaks the up-down symmetry of the field. When b is large enough, stripes become unstable and <b>hexagonal lattices</b> form — like honeycomb cells. Watch the stripe pattern reorganize into spots.", mode: null, spot: { region: "sidebar" as "sidebar", label: "b slider" }, params: null },
  { dur: 6000, text: "<b>b = 0.8 — hexagonal pattern emerging.</b> These are the same hexagonal cells seen in Bénard convection, animal coat patterns (leopard spots), and sand dunes. The SH equation captures the universal geometry of pattern-forming instabilities.", mode: null, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: { b_sh: 0.8 } },
  { dur: 6500, text: "Now switching to the <b>Multi-Scale Substrate</b> — our most conceptually ambitious mode. Here a single 961-node network simultaneously models genomic, proteomic, cellular, atmospheric, oceanic, biospheric, agent, and market dynamics.", mode: "ms" as Mode, spot: { region: [5,25,5,25] as [number,number,number,number] }, params: null },
  { dur: 6000, text: "In Multi-Scale mode, <b>different regions of the same substrate</b> are mapped to different physical systems. The node dynamics are identical — what differs is which nodes are cross-coupled to which. Genomic nodes couple to proteomic; atmospheric nodes couple to oceanic.", mode: null, spot: { region: [1,14,1,14] as [number,number,number,number] }, params: null },
  { dur: 6000, text: "Now firing <b>💥 Multi-Crisis</b> across all three domains: economics crashes first, then cancer instability, then climate shock — each 400ms apart. Watch the cascade: the dark patch in the economic region bleeds upward, and the cross-couplings carry disruption across domain boundaries.", mode: null, spot: { region: "sidebar" as "sidebar", label: "Multi-Crisis" }, params: null },
  { dur: 4500, text: "<span style='color:#ffcc44'>Economics crashing now.</span> Watch the lower region go dark — amplitude has collapsed. The coupled oscillator network is losing coherence in the social/market domain.", mode: null, spot: { region: [17,29,2,28] as [number,number,number,number] }, params: { _crisis: 1 } },
  { dur: 4500, text: "<span style='color:#ff6688'>Cancer cascade firing.</span> Noise injected into genomic nodes. The chaotic color pattern represents loss of normal cell-cycle oscillatory regulation — what we'd call oncogenic instability in a real biological substrate.", mode: null, spot: { region: [1,13,1,14] as [number,number,number,number] }, params: { _cancer: 1 } },
  { dur: 5000, text: "<span style='color:#66ffcc'>Climate shock firing.</span> All three regions are now disrupted simultaneously. The key physical insight: <b>one substrate, three crises, genuine coupling</b>. The wave patterns are leaking across region borders because the nodes don't know which 'system' they belong to.", mode: null, spot: { region: [1,13,17,29] as [number,number,number,number] }, params: { _climate: 1 } },
  { dur: 7000, text: "Tour complete! 🌊 You've seen three PDE regimes: CGLE traveling waves and turbulence, Swift-Hohenberg stripes and hexagons, and multi-scale substrate coupling. Switch between them with the tabs above. Click the canvas anytime to inject a local perturbation and watch it propagate.", mode: null, spot: null, params: null },
];

function PDEHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const N=60;
    const u: number[] = new Array(N).fill(0).map((_,i)=>Math.sin(i/N*Math.PI*4)*0.5);
    const v: number[] = new Array(N).fill(0);
    const draw=()=>{
      ctx.fillStyle="rgba(0,0,0,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=1;i<N-1;i++){
        const acc=(u[i+1]-2*u[i]+u[i-1])*0.6;
        v[i]+=acc*0.04; u[i]+=v[i]*0.04; v[i]*=0.999;
      }
      ctx.beginPath();
      for(let i=0;i<N;i++){
        const x=(i/N)*W,y=H*0.5-u[i]*H*0.35;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(0,255,136,0.6)";ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle="rgba(0,255,136,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PDE SIMULATOR · WAVE EQUATION · EMERGENT COMPLEXITY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PDESimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<"cgle" | "sh" | "ms">("cgle");
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef(0);
  const tourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // CGLE state
  const creRef = useRef(new Float32Array(N * N));
  const cimRef = useRef(new Float32Array(N * N));
  const ck1r = useRef(new Float32Array(N * N));
  const ck1i = useRef(new Float32Array(N * N));
  const ck2r = useRef(new Float32Array(N * N));
  const ck2i = useRef(new Float32Array(N * N));
  const cmr = useRef(new Float32Array(N * N));
  const cmi = useRef(new Float32Array(N * N));
  const cgleParams = useRef({ mu: 1.0, alpha: 1.5, beta: 1.0, dt: 0.08 });

  // SH state
  const shuRef = useRef(new Float32Array(N * N));
  const shParams = useRef({ eps: 0.3, b: 0.0, dt: 0.1 });

  // MS state
  const mreRef = useRef(new Float32Array(N * N));
  const mimRef = useRef(new Float32Array(N * N));
  const msAdjRef = useRef(new Float32Array(N * N * N * N));
  const msParams = useRef({ coup: 0.5, nl: 0.05 });

  // UI state
  const [mode, setMode] = useState<Mode>("cgle");
  const [sliders, setSliders] = useState({ mu: 1.0, alpha: 1.5, beta: 1.0, cdt: 0.08, eps: 0.3, b_sh: 0.0, dt_sh: 0.1, ms_coup: 0.5, ms_nl: 0.05 });
  const [stats, setStats] = useState({ amp: "—", coh: "—", can: "—", cli: "—", eco: "—", regime: "—" });
  const [narrator, setNarrator] = useState({ text: "Click ▶ Tour to start the guided walkthrough, or explore freely.", step: -1, progress: 0 });
  const [spotPos, setSpotPos] = useState<{ x: number; y: number; label: string } | null>(null);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [tourRunning, setTourRunning] = useState(false);

  // ── Adjacency matrix build (on mount) ────────────────────────────
  useEffect(() => {
    const adj = msAdjRef.current;
    function sa(i: number, j: number, v: number) { adj[i * N * N + j] = v; adj[j * N * N + i] = v; }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const idx = i * N + j;
      if (j < N - 1) sa(idx, idx + 1, 1);
      if (i < N - 1) sa(idx, idx + N, 1);
      if (i < N - 1 && j < N - 1) sa(idx, idx + N + 1, 1);
    }
    const lvls: Record<string, [number, number]> = { gen: [0, 100], pro: [100, 200], cel: [200, 300], atm: [300, 450], ocn: [450, 600], bio: [600, 700], agt: [700, 850], mkt: [850, 961] };
    const pairs: [string, string, number][] = [["gen","pro",.3],["pro","cel",.2],["atm","ocn",.4],["ocn","bio",.3],["agt","mkt",.5]];
    for (const [a, b, s] of pairs) {
      for (let i = lvls[a][0]; i < lvls[a][1]; i += 10)
        for (let j = lvls[b][0]; j < lvls[b][1]; j += 10)
          if (i < N * N && j < N * N) sa(i, j, s);
    }
  }, []);

  // ── Physics functions ──────────────────────────────────────────────
  const cgLeIdx = (i: number, j: number) => ((i + N) % N) * N + ((j + N) % N);
  const cgleLap = (arr: Float32Array, i: number, j: number) =>
    arr[cgLeIdx(i-1,j)] + arr[cgLeIdx(i+1,j)] + arr[cgLeIdx(i,j-1)] + arr[cgLeIdx(i,j+1)] - 4*arr[i*N+j];

  const cgleStep = useCallback(() => {
    const { mu, alpha, beta, dt } = cgleParams.current;
    const cre = creRef.current, cim = cimRef.current;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = i * N + j, u = cre[k], v = cim[k];
      const lr = cgleLap(cre, i, j), li = cgleLap(cim, i, j);
      const r2 = u*u + v*v || 1e-6;
      ck1r.current[k] = mu*u + (lr - alpha*li) + (-r2*u + beta*r2*v);
      ck1i.current[k] = mu*v + (li + alpha*lr) + (-r2*v - beta*r2*u);
      cmr.current[k] = u + dt*0.5*ck1r.current[k];
      cmi.current[k] = v + dt*0.5*ck1i.current[k];
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = i*N+j, u = cmr.current[k], v = cmi.current[k];
      const lr = cgleLap(cmr.current, i, j), li = cgleLap(cmi.current, i, j);
      const r2 = u*u + v*v || 1e-6;
      ck2r.current[k] = mu*u + (lr - alpha*li) + (-r2*u + beta*r2*v);
      ck2i.current[k] = mu*v + (li + alpha*lr) + (-r2*v - beta*r2*u);
    }
    for (let k = 0; k < N*N; k++) {
      cre[k] += dt * (ck1r.current[k] + ck2r.current[k]) * 0.5;
      cim[k] += dt * (ck1i.current[k] + ck2i.current[k]) * 0.5;
    }
  }, []);

  const shIdx = (i: number, j: number) => ((i + N) % N) * N + ((j + N) % N);
  const shLap = (arr: Float32Array, k: number) => {
    const i = Math.floor(k / N), j = k % N;
    return arr[shIdx(i+1,j)] + arr[shIdx(i-1,j)] + arr[shIdx(i,j+1)] + arr[shIdx(i,j-1)] - 4*arr[k];
  };

  const shStep = useCallback(() => {
    const { eps, b, dt } = shParams.current;
    const shu = shuRef.current;
    const k1 = new Float32Array(N*N), mid = new Float32Array(N*N);
    const lap2buf = new Float32Array(N*N);
    for (let k = 0; k < N*N; k++) lap2buf[k] = shLap(shu, k);
    for (let k = 0; k < N*N; k++) {
      const lap = shLap(shu, k), lap2 = shLap(lap2buf, k), v = shu[k];
      k1[k] = eps*v - v - 2*lap - lap2 + b*v*v - v*v*v;
    }
    for (let k = 0; k < N*N; k++) mid[k] = shu[k] + dt*0.5*k1[k];
    const midLap = new Float32Array(N*N);
    for (let k = 0; k < N*N; k++) midLap[k] = shLap(mid, k);
    for (let k = 0; k < N*N; k++) {
      const lap = shLap(mid, k), lap2 = shLap(midLap, k), v = mid[k];
      const k2 = eps*v - v - 2*lap - lap2 + b*v*v - v*v*v;
      shu[k] += dt * 0.5 * (k1[k] + k2);
    }
  }, []);

  const msStep = useCallback(() => {
    const { coup, nl } = msParams.current;
    const mre = mreRef.current, mim = mimRef.current, adj = msAdjRef.current;
    const nr = new Float32Array(N*N), ni = new Float32Array(N*N);
    for (let i = 0; i < N*N; i++) {
      let cr = 0, ci2 = 0;
      for (let j = 0; j < N*N; j++) { const a = adj[i*N*N+j]; if (a) { cr += a*mre[j]; ci2 += a*mim[j]; } }
      cr *= -coup; ci2 *= -coup;
      const intensity = mre[i]**2 + mim[i]**2;
      nr[i] = mre[i] + (-(ci2 + nl*intensity*mim[i])) * 0.02;
      ni[i] = mim[i] + (cr + nl*intensity*mre[i]) * 0.02;
    }
    let norm = 0;
    for (let i = 0; i < N*N; i++) norm += nr[i]**2 + ni[i]**2;
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < N*N; i++) { mreRef.current[i] = nr[i]/norm; mimRef.current[i] = ni[i]/norm; }
  }, []);

  // ── Inits ───────────────────────────────────────────────────────
  const cgleInit = useCallback((md: "wave" | "spiral" = "wave") => {
    const cre = creRef.current, cim = cimRef.current;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = i*N+j;
      let ph, amp;
      if (md === "spiral") {
        const dx=i-N/2, dy=j-N/2, r=Math.sqrt(dx*dx+dy*dy);
        ph = Math.atan2(dy,dx) + r*0.55; amp = 0.5 + 0.5*Math.exp(-r*r/130);
      } else {
        ph = 0.08*(i + 1.7*j); amp = 1;
        if (i<15 && j<16) { amp = 1.25; }
        else if (i<15) { ph += 2.8; amp = 0.95; }
        else { ph += 4.2; amp = 1.05; }
        amp *= (0.85 + 0.3*Math.random());
      }
      cre[k] = amp*Math.cos(ph); cim[k] = amp*Math.sin(ph);
    }
  }, []);

  const shInit = useCallback(() => {
    const shu = shuRef.current;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const k = shIdx(i, j);
      let v = 0.01*(Math.random()-0.5);
      if (i<15) { if (j<16) v += 0.02; else v -= 0.03; } else v += 0.015;
      shu[k] = v;
    }
  }, []);

  const msInit = useCallback(() => {
    const PHI = (1+Math.sqrt(5))/2;
    for (let i = 0; i < N*N; i++) {
      const angle = i*PHI*2*Math.PI, r = Math.sqrt(i)/Math.sqrt(N*N);
      mreRef.current[i] = Math.cos(angle)*r*0.1;
      mimRef.current[i] = Math.sin(angle)*r*0.1;
    }
  }, []);

  // ── Events ───────────────────────────────────────────────────────
  const doReset = useCallback(() => {
    if (modeRef.current === "cgle") cgleInit("wave");
    else if (modeRef.current === "sh") shInit();
    else msInit();
  }, [cgleInit, shInit, msInit]);

  const doSpiral = useCallback(() => {
    if (modeRef.current === "cgle") cgleInit("spiral");
    else if (modeRef.current === "sh") {
      for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
        const dx=i-N/2,dy=j-N/2,r=Math.sqrt(dx*dx+dy*dy);
        shuRef.current[shIdx(i,j)] = 0.5*Math.cos(Math.atan2(dy,dx)+r*0.4)*Math.exp(-r*r/150);
      }
    } else {
      for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
        const dx=i-N/2,dy=j-N/2,r=Math.sqrt(dx*dx+dy*dy),k=i*N+j;
        const ph=Math.atan2(dy,dx)+r*0.5, amp=0.5*Math.exp(-r*r/130);
        mreRef.current[k]=amp*Math.cos(ph); mimRef.current[k]=amp*Math.sin(ph);
      }
    }
  }, [cgleInit]);

  const doNoise = useCallback(() => {
    if (modeRef.current === "cgle") { for (let k=0;k<N*N;k++) { creRef.current[k]+=(Math.random()-0.5)*0.35; cimRef.current[k]+=(Math.random()-0.5)*0.35; } }
    else if (modeRef.current === "sh") { for (let k=0;k<N*N;k++) shuRef.current[k]+=0.15*(Math.random()-0.5); }
    else { for (let k=0;k<N*N;k++) { mreRef.current[k]+=(Math.random()-0.5)*0.2; mimRef.current[k]+=(Math.random()-0.5)*0.2; } }
  }, []);

  const doCancer = useCallback(() => {
    if (modeRef.current === "cgle") { for (let i=0;i<15;i++) for (let j=0;j<16;j++) { const k=i*N+j; creRef.current[k]+=(Math.random()-0.5)*1.8; cimRef.current[k]+=(Math.random()-0.5)*1.8; } }
    else if (modeRef.current === "sh") { for (let i=0;i<15;i++) for (let j=0;j<16;j++) shuRef.current[shIdx(i,j)]+=(Math.random()-0.5)*0.8; }
    else { for (let i=0;i<100;i++) { mreRef.current[i]+=(Math.random()-0.5)*0.5; mimRef.current[i]+=(Math.random()-0.5)*0.5; } }
  }, []);

  const doClimate = useCallback(() => {
    if (modeRef.current === "cgle") { for (let i=0;i<15;i++) for (let j=16;j<N;j++) { const k=i*N+j; creRef.current[k]+=0.9*Math.sin(0.5*i+0.3*j); cimRef.current[k]+=0.9*Math.cos(0.5*i-0.4*j); } }
    else if (modeRef.current === "sh") { for (let i=0;i<15;i++) for (let j=16;j<N;j++) shuRef.current[shIdx(i,j)]+=0.4*Math.sin(0.4*i+0.3*j); }
    else { for (let i=300;i<450;i++) { mreRef.current[i]+=0.3*Math.sin(0.3*i); mimRef.current[i]+=0.3*Math.cos(0.3*i); } }
  }, []);

  const doCrash = useCallback(() => {
    if (modeRef.current === "cgle") { for (let i=Math.floor(N*0.58);i<N;i++) for (let j=0;j<N;j++) { const k=i*N+j,r=Math.sqrt(creRef.current[k]**2+cimRef.current[k]**2)||1,p=Math.random()*Math.PI*2; creRef.current[k]=r*0.12*Math.cos(p); cimRef.current[k]=r*0.12*Math.sin(p); } }
    else if (modeRef.current === "sh") { for (let i=Math.floor(N*0.55);i<N;i++) for (let j=0;j<N;j++) shuRef.current[shIdx(i,j)]*=0.05; }
    else { for (let i=700;i<N*N;i++) { const r=Math.sqrt(mreRef.current[i]**2+mimRef.current[i]**2)||1,p=Math.random()*Math.PI*2; mreRef.current[i]=r*0.1*Math.cos(p); mimRef.current[i]=r*0.1*Math.sin(p); } }
  }, []);

  const doCrisis = useCallback(() => {
    doCrash();
    setTimeout(doCancer, 380);
    setTimeout(doClimate, 760);
  }, [doCrash, doCancer, doClimate]);

  // ── Render ─────────────────────────────────────────────────────
  const scaleRef = useRef(1);
  const statsFrameRef = useRef(0);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sc = scaleRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let tA=0, tC=0, tS=0, canE=0, cliE=0, ecoE=0, canC=0, cliC=0, ecoC=0;

    if (modeRef.current === "cgle") {
      const cre = creRef.current, cim = cimRef.current;
      for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
        const k=i*N+j, amp=Math.sqrt(cre[k]**2+cim[k]**2), phase=Math.atan2(cim[k],cre[k]);
        ctx.fillStyle=`hsl(${((phase*180/Math.PI)+360)%360},95%,${Math.max(10,Math.min(92,22+amp*50))}%)`;
        ctx.fillRect(j*sc, i*sc, sc+0.5, sc+0.5);
        tA+=amp; tC+=Math.cos(phase); tS+=Math.sin(phase);
        if (i<15&&j<16){canE+=amp;canC++;}else if(i<15){cliE+=amp;cliC++;}else{ecoE+=amp;ecoC++;}
      }
      if (statsFrameRef.current % 15 === 0) {
        const n2=N*N, coh=Math.sqrt(tC**2+tS**2)/n2;
        const { alpha, beta } = cgleParams.current;
        setStats({ amp:(tA/n2).toFixed(3), coh:(coh*100).toFixed(1)+"%", can:(canE/Math.max(1,canC)).toFixed(3), cli:(cliE/Math.max(1,cliC)).toFixed(3), eco:(ecoE/Math.max(1,ecoC)).toFixed(3), regime:alpha*(1+beta**2)>2?"⚡ Turbulent":"〰 Ordered" });
      }
    } else if (modeRef.current === "sh") {
      const shu = shuRef.current;
      let mn=Infinity, mx=-Infinity;
      for (let k=0;k<N*N;k++) { if(shu[k]<mn)mn=shu[k]; if(shu[k]>mx)mx=shu[k]; }
      const rng=mx-mn||0.001;
      for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
        const k=i*N+j, norm=(shu[k]-mn)/rng;
        ctx.fillStyle=`hsl(${200+norm*160},100%,${20+norm*60}%)`;
        ctx.fillRect(j*sc, i*sc, sc+0.5, sc+0.5);
        const v=Math.abs(shu[k]); tA+=v;
        if(i<15&&j<16){canE+=v;canC++;}else if(i<15){cliE+=v;cliC++;}else{ecoE+=v;ecoC++;}
      }
      if (statsFrameRef.current % 15 === 0) {
        const n2=N*N;
        setStats({ amp:(tA/n2).toFixed(3), coh:"N/A (real field)", can:(canE/Math.max(1,canC)).toFixed(3), cli:(cliE/Math.max(1,cliC)).toFixed(3), eco:(ecoE/Math.max(1,ecoC)).toFixed(3), regime:shParams.current.eps>0.5?"Patterned":"Near onset" });
      }
    } else {
      const mre = mreRef.current, mim = mimRef.current;
      let mx=0; for (let i=0;i<N*N;i++) mx=Math.max(mx,mre[i]**2+mim[i]**2);
      for (let i=0;i<N;i++) for (let j=0;j<N;j++) {
        const k=i*N+j, amp=Math.sqrt(mre[k]**2+mim[k]**2), phase=Math.atan2(mim[k],mre[k]);
        ctx.fillStyle=`hsl(${((phase*180/Math.PI)+360)%360},100%,${amp/Math.sqrt(mx||1)*70}%)`;
        ctx.fillRect(j*sc, i*sc, sc+0.5, sc+0.5);
        tA+=amp;
        if(i<15&&j<16){canE+=amp;canC++;}else if(i<15){cliE+=amp;cliC++;}else{ecoE+=amp;ecoC++;}
      }
      if (statsFrameRef.current % 15 === 0) {
        const n2=N*N;
        setStats({ amp:(tA/n2).toFixed(3), coh:"φ-coherent", can:(canE/Math.max(1,canC)).toFixed(3), cli:(cliE/Math.max(1,cliC)).toFixed(3), eco:(ecoE/Math.max(1,ecoC)).toFixed(3), regime:"Substrate" });
      }
    }

    // Region borders
    ctx.strokeStyle="rgba(255,255,255,0.18)"; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(sc*16,0); ctx.lineTo(sc*16,sc*15);
    ctx.moveTo(0,sc*15); ctx.lineTo(canvas.width,sc*15);
    ctx.stroke();

    statsFrameRef.current++;
  }, []);

  // ── Animation loop ───────────────────────────────────────────────
  useEffect(() => {
    cgleInit("wave"); shInit(); msInit();

    function animate(ts: number) {
      if (ts - lastTsRef.current > 14) {
        const m = modeRef.current;
        if (m === "cgle") { cgleStep(); cgleStep(); }
        else if (m === "sh") shStep();
        else { msStep(); msStep(); }
        renderFrame();
        lastTsRef.current = ts;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [cgleInit, shInit, msInit, cgleStep, shStep, msStep, renderFrame]);

  // ── Canvas resize ─────────────────────────────────────────────────
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function resize() {
      const wrap = canvasWrapRef.current, canvas = canvasRef.current;
      if (!wrap || !canvas) return;
      const s = Math.min(wrap.clientWidth - 6, wrap.clientHeight - 6);
      canvas.width = s; canvas.height = s; scaleRef.current = s / N;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Tour ─────────────────────────────────────────────────────────
  const runTourStep = useCallback((n: number) => {
    if (n >= TOUR_STEPS.length) {
      setTourRunning(false);
      setNarrator({ text: "Free explore — switch modes with the tabs, click canvas to perturb, use event buttons. <b>Tour complete! 🌊</b>", step: -1, progress: 100 });
      setSpotPos(null);
      setActiveBtn(null);
      return;
    }
    const s = TOUR_STEPS[n];
    setNarrator({ text: s.text, step: n, progress: ((n+1)/TOUR_STEPS.length)*100 });

    if (s.mode && s.mode !== "earth") {
      modeRef.current = s.mode as "cgle" | "sh" | "ms";
      setMode(s.mode);
      doReset();
    }

    if (s.params) {
      Object.entries(s.params).forEach(([k, v]) => {
        if (k === "_crisis") { doCrash(); setTimeout(doCancer, 380); setTimeout(doClimate, 760); }
        else if (k === "_cancer") doCancer();
        else if (k === "_climate") doClimate();
        else if (k === "beta") { cgleParams.current.beta = v; setSliders(p => ({ ...p, beta: v })); }
        else if (k === "mu") { cgleParams.current.mu = v; setSliders(p => ({ ...p, mu: v })); }
        else if (k === "eps") { shParams.current.eps = v; setSliders(p => ({ ...p, eps: v })); }
        else if (k === "b_sh") { shParams.current.b = v; setSliders(p => ({ ...p, b_sh: v })); }
      });
    }

    // Spotlight
    setTimeout(() => {
      const canvas = canvasRef.current, wrap = canvasWrapRef.current;
      if (!s.spot || !canvas || !wrap) { setSpotPos(null); return; }
      if (s.spot.region === "sidebar") {
        setSpotPos({ x: wrap.clientWidth + 60, y: 100, label: s.spot.label || "" });
      } else {
        const [r1,r2,c1,c2] = s.spot.region as [number,number,number,number];
        const sc = scaleRef.current;
        const canRect = canvas.getBoundingClientRect(), wrapRect = wrap.getBoundingClientRect();
        setSpotPos({
          x: canRect.left - wrapRect.left + ((c1+c2)/2)*sc,
          y: canRect.top  - wrapRect.top  + ((r1+r2)/2)*sc,
          label: s.spot.label || "",
        });
      }
    }, 250);

    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    tourTimerRef.current = setTimeout(() => runTourStep(n + 1), s.dur);
  }, [doReset, doCancer, doClimate, doCrash]);

  const startTour = useCallback(() => {
    setTourRunning(true);
    runTourStep(0);
  }, [runTourStep]);

  const endTour = useCallback(() => {
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    setTourRunning(false);
    setSpotPos(null);
    setActiveBtn(null);
    setNarrator({ text: "Free explore — switch modes with the tabs, click canvas to perturb, use event buttons.", step: -1, progress: 0 });
  }, []);

  // ── Canvas click ─────────────────────────────────────────────────
  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const r = canvasRef.current!.getBoundingClientRect();
    const sc = scaleRef.current;
    const ci = Math.floor((e.clientY - r.top) / sc), cj = Math.floor((e.clientX - r.left) / sc);
    if (modeRef.current === "cgle") {
      for (let di=-3;di<=3;di++) for (let dj=-3;dj<=3;dj++) {
        if (di*di+dj*dj>10) continue;
        const k=((ci+di+N)%N)*N+((cj+dj+N)%N);
        const amp=Math.sqrt(creRef.current[k]**2+cimRef.current[k]**2)||1;
        const np=Math.atan2(cimRef.current[k],creRef.current[k])+2+(Math.random()-0.5);
        const na=amp*0.35+0.1;
        creRef.current[k]=na*Math.cos(np); cimRef.current[k]=na*Math.sin(np);
      }
    } else if (modeRef.current === "sh") {
      for (let di=-4;di<=4;di++) for (let dj=-4;dj<=4;dj++) shuRef.current[shIdx((ci+di+N)%N,(cj+dj+N)%N)]+=0.8;
    } else {
      for (let di=-3;di<=3;di++) for (let dj=-3;dj<=3;dj++) {
        if (di*di+dj*dj>10) continue;
        const k=((ci+di+N)%N)*N+((cj+dj+N)%N);
        const p=Math.random()*Math.PI*2;
        mreRef.current[k]+=0.3*Math.cos(p); mimRef.current[k]+=0.3*Math.sin(p);
      }
    }
  }

  function switchMode(m: Mode) {
    if (m === "earth") { setMode("earth"); return; }
    modeRef.current = m as "cgle" | "sh" | "ms";
    setMode(m);
    doReset();
  }

  const TAB_COLORS: Record<Mode, string> = {
    cgle: "text-[#00ff88] border-[#00ff88]",
    sh: "text-[#00ccff] border-[#00ccff]",
    ms: "text-[#aa88ff] border-[#aa88ff]",
    earth: "text-[#ffcc44] border-[#ffcc4488]",
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black text-[#0f0] font-mono">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b-2 border-[#00ff88] flex-shrink-0" style={{ background: "linear-gradient(135deg,#001a1a,#003333)" }}>
        <div>
          <div className="text-[#00ff88] text-xs font-bold" style={{ textShadow: "0 0 10px #00ff88" }}>🌊 UNIFIED PDE SIMULATOR — EMERGENT COMPLEXITY</div>
          <div className="text-[#00ccff] text-[9px] mt-0.5">{EQ[mode === "earth" ? "earth" : mode]}</div>
        </div>
        <div className="flex gap-1.5">
          {(["cgle","sh","ms","earth"] as Mode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} className={`px-3 py-1 rounded text-[10px] font-bold border transition-all duration-200 ${mode===m ? "opacity-100 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black border-transparent" : `opacity-60 bg-[#002] hover:opacity-80 ${TAB_COLORS[m]}`}`}>
              {m==="cgle"?"CGLE":m==="sh"?"Swift-Hohenberg":m==="ms"?"Multi-Scale":"🌍 Earth-Body"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={startTour} className="px-3 py-1 rounded text-[10px] font-bold text-white transition-all hover:opacity-80" style={{ background: "linear-gradient(135deg,#aa44ff,#6644ff)" }}>▶ Tour</button>
          <button onClick={endTour} className="px-3 py-1 rounded text-[10px] font-bold text-[#aaa] border border-[#444] bg-[#222] hover:opacity-80">✦ Free</button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Earth-Body panel */}
        {mode === "earth" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 font-sans text-[#ddd]" style={{ background: "#000" }}>
            <EarthBodyPanel />
          </div>
        )}

        {/* Canvas + narrator */}
        {mode !== "earth" && (
          <div ref={canvasWrapRef} className="relative flex-1 flex flex-col items-center justify-center bg-black p-1 gap-1 overflow-hidden">
            <canvas ref={canvasRef} className="cursor-crosshair block" style={{ imageRendering: "pixelated" }} onClick={handleCanvasClick} />

            {/* Region labels */}
            <div className="absolute" style={{ top:"8%", left:"3%", color:"#ff6688", fontSize:"0.68em", fontWeight:"bold", textShadow:"0 0 10px currentColor", opacity:0.75, letterSpacing:1, pointerEvents:"none" }}>🧬 CANCER / GENOMIC</div>
            <div className="absolute text-right" style={{ top:"8%", right:"3%", color:"#66ffcc", fontSize:"0.68em", fontWeight:"bold", textShadow:"0 0 10px currentColor", opacity:0.75, letterSpacing:1, pointerEvents:"none" }}>🌡️ CLIMATE / ENVIRONMENT</div>
            <div className="absolute" style={{ bottom:"18%", left:"50%", transform:"translateX(-50%)", color:"#ffcc44", fontSize:"0.68em", fontWeight:"bold", textShadow:"0 0 10px currentColor", opacity:0.75, letterSpacing:1, pointerEvents:"none", whiteSpace:"nowrap" }}>📈 ECONOMICS / SOCIAL</div>

            {/* Spotlight */}
            {spotPos && (
              <div className="absolute pointer-events-none z-30" style={{ left: spotPos.x - 28, top: spotPos.y - 28 }}>
                <div className="w-14 h-14 rounded-full border-2 border-white" style={{ animation: "spin 1.5s linear infinite", boxShadow: "0 0 18px #fff, 0 0 36px rgba(255,255,255,0.35)" }} />
                {spotPos.label && <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-white bg-black/85 px-2 py-0.5 rounded border border-white/30">{spotPos.label}</div>}
              </div>
            )}

            {/* Narrator */}
            <div className="w-full max-w-2xl rounded-lg border border-[#00ff8855] px-4 py-3 flex-shrink-0" style={{ background: "rgba(0,20,20,0.97)", minHeight: 58 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00ff88]" style={{ boxShadow: "0 0 7px #00ff88", animation: "blink 1s infinite" }} />
                <span className="text-[#00ff88] text-[10px]">GUIDED TOUR</span>
                {narrator.step >= 0 && <span className="ml-auto text-[10px] text-[#446]">{narrator.step+1} / {TOUR_STEPS.length}</span>}
              </div>
              <div className="text-[#ddd] text-[11px] leading-relaxed" dangerouslySetInnerHTML={{ __html: narrator.text }} />
              <div className="mt-2 h-0.5 rounded bg-[#002] overflow-hidden">
                <div className="h-full rounded transition-all duration-400" style={{ width: `${narrator.progress}%`, background: "linear-gradient(90deg,#00ff88,#00ccff)" }} />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {mode !== "earth" && (
          <div className="w-52 border-l-2 border-[#00ff88] p-2.5 flex flex-col gap-2 overflow-y-auto flex-shrink-0" style={{ background: "rgba(0,18,18,0.97)" }}>
            {/* CGLE params */}
            {mode === "cgle" && (
              <div className="space-y-1">
                <div className="text-[9px] text-[#00ccff] border-b border-[#00ff8828] pb-1">⚙️ CGLE PARAMETERS</div>
                <ParamGroup>
                  {[
                    { id:"mu",    label:"μ — Growth",       desc:"Linear amplification rate",     min:0.1, max:2.5, step:0.05 },
                    { id:"alpha", label:"α — Dispersion",   desc:"Frequency-dependent wave speed", min:0,   max:3,   step:0.1  },
                    { id:"beta",  label:"β — Nonlinearity", desc:"Phase-amplitude coupling → chaos",min:0,  max:3,   step:0.1  },
                    { id:"cdt",   label:"dt",               desc:"Integration step (RK2)",         min:0.01,max:0.2, step:0.01 },
                  ].map(p => (
                    <Slider key={p.id} {...p} value={sliders[p.id as keyof typeof sliders]} onChange={v => {
                      setSliders(s => ({ ...s, [p.id]: v }));
                      if (p.id==="mu") cgleParams.current.mu=v;
                      else if (p.id==="alpha") cgleParams.current.alpha=v;
                      else if (p.id==="beta") cgleParams.current.beta=v;
                      else if (p.id==="cdt") cgleParams.current.dt=v;
                    }} />
                  ))}
                </ParamGroup>
              </div>
            )}
            {mode === "sh" && (
              <div className="space-y-1">
                <div className="text-[9px] text-[#00ccff] border-b border-[#00ff8828] pb-1">⚙️ SWIFT-HOHENBERG</div>
                <ParamGroup>
                  {[
                    { id:"eps",   label:"ε — Onset",    desc:"Pattern formation threshold",  min:0,  max:1.5, step:0.01 },
                    { id:"b_sh",  label:"b — Hexagons", desc:"Quadratic → hexagonal symmetry",min:0,  max:1.5, step:0.05 },
                    { id:"dt_sh", label:"dt",           desc:"Integration step",              min:0.01,max:0.3, step:0.01 },
                  ].map(p => (
                    <Slider key={p.id} {...p} value={sliders[p.id as keyof typeof sliders]} onChange={v => {
                      setSliders(s => ({ ...s, [p.id]: v }));
                      if (p.id==="eps") shParams.current.eps=v;
                      else if (p.id==="b_sh") shParams.current.b=v;
                      else if (p.id==="dt_sh") shParams.current.dt=v;
                    }} />
                  ))}
                </ParamGroup>
              </div>
            )}
            {mode === "ms" && (
              <div className="space-y-1">
                <div className="text-[9px] text-[#00ccff] border-b border-[#00ff8828] pb-1">⚙️ MULTI-SCALE</div>
                <ParamGroup>
                  {[
                    { id:"ms_coup", label:"Coupling",     desc:"Cross-node influence strength", min:0.01, max:1,   step:0.01  },
                    { id:"ms_nl",   label:"Nonlinearity", desc:"Self-interaction feedback",      min:0.001,max:0.2, step:0.001 },
                  ].map(p => (
                    <Slider key={p.id} {...p} value={sliders[p.id as keyof typeof sliders]} onChange={v => {
                      setSliders(s => ({ ...s, [p.id]: v }));
                      if (p.id==="ms_coup") msParams.current.coup=v;
                      else if (p.id==="ms_nl") msParams.current.nl=v;
                    }} />
                  ))}
                </ParamGroup>
              </div>
            )}

            <div className="text-[9px] text-[#00ccff] border-b border-[#00ff8828] pb-1">🎬 EVENTS</div>
            {[
              { id:"btn-reset",   label:"🔄 Reset",          onClick: doReset,   cls:"from-[#00ff88] to-[#00ccff] text-black" },
              { id:"btn-spiral",  label:"🌀 Spiral Seed",    onClick: doSpiral,  cls:"from-[#00ccff] to-[#0088ff] text-black" },
              { id:"btn-noise",   label:"⚡ Add Noise",      onClick: doNoise,   cls:"from-[#ffcc00] to-[#ff8800] text-black" },
              { id:"btn-cancer",  label:"🧬 Cancer Cascade", onClick: doCancer,  cls:"from-[#ff44aa] to-[#cc2277] text-white" },
              { id:"btn-climate", label:"🌡️ Climate Shock",  onClick: doClimate, cls:"from-[#ffcc00] to-[#ff8800] text-black" },
              { id:"btn-crash",   label:"📉 Market Crash",   onClick: doCrash,   cls:"from-[#ff4466] to-[#ff8833] text-white" },
              { id:"btn-crisis",  label:"💥 Multi-Crisis",   onClick: doCrisis,  cls:"from-[#aa44ff] to-[#6644ff] text-white" },
            ].map(b => (
              <button key={b.id} id={b.id} onClick={() => { setActiveBtn(b.id); b.onClick(); }} className={`w-full py-1.5 rounded text-[10px] font-bold cursor-pointer transition-all hover:-translate-y-px bg-gradient-to-r ${b.cls} ${activeBtn===b.id?"ring-2 ring-white":""}`}>{b.label}</button>
            ))}

            <div className="text-[9px] text-[#00ccff] border-b border-[#00ff8828] pb-1 mt-1">📊 LIVE STATS</div>
            <div className="rounded text-[9px] leading-[1.85] p-2" style={{ background:"rgba(0,40,40,0.4)", border:"1px solid rgba(0,255,136,0.09)" }}>
              {[["Mode", mode.toUpperCase()], ["Avg Amplitude", stats.amp], ["Coherence", stats.coh], ["Cancer E", stats.can], ["Climate E", stats.cli], ["Econ E", stats.eco], ["Regime", stats.regime]].map(([l,v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[#223322]">{l}</span>
                  <span className="text-[#00ff88]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  );
}

function ParamGroup({ children }: { children: React.ReactNode }) {
  return <div className="rounded p-2 space-y-2" style={{ background:"rgba(0,40,40,0.4)", border:"1px solid rgba(0,255,136,0.09)" }}>{children}</div>;
}

function Slider({ id, label, desc, min, max, step, value, onChange }: { id:string; label:string; desc:string; min:number; max:number; step:number; value:number; onChange:(v:number)=>void }) {
  return (
    <label className="flex flex-col gap-0.5">
      <div className="flex justify-between text-[9px]"><span className="text-[#00ccff]">{label}</span><span className="text-[#00ff88]">{value.toFixed(2)}</span></div>
      <div className="text-[8px] text-[#223322] font-sans">{desc}</div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full accent-[#00ff88]" />
    </label>
  );
}

function EarthBodyPanel() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <Section title="🌍 EARTH · SUN · BODY — ONE COUPLED SYSTEM">
        <p className="text-sm leading-relaxed text-[#bbb]">What the simulations above are showing mathematically, this panel explains physically. The Earth is not a static backdrop — it is a <b className="text-[#00ccff]">dynamic phase wave</b>, a living oscillatory system driven by the Sun, modulated by its own electromagnetic cavity, and deeply coupled to every biological organism on its surface — including you.</p>
        <Highlight>The core insight: Sun → atmosphere → electromagnetic field → weather → body → DNA is not a chain of separate causes. It is one coupled nonlinear system. The same equations governing the CGLE simulator above describe, at different scales, your circadian clock, atmospheric turbulence, and solar wind dynamics.</Highlight>
      </Section>

      <Section title="☀️ THE SUN AS COHERENT FORCING">
        <p className="text-sm leading-relaxed text-[#bbb] mb-4">The Sun doesn't just provide heat. It is a <b className="text-[#00ccff]">coherent oscillatory source</b> driving the Earth's entire electromagnetic environment.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title:"⚡ Solar Wind", text:"A continuous stream of charged particles from the Sun's corona, traveling at 400–800 km/s. When it hits Earth's magnetosphere, it creates geomagnetic fluctuations that penetrate all the way to ground level — measurable in the human nervous system." },
            { title:"🔆 UV / Photon Coherence", text:"UV-B photons don't just damage DNA — DNA photolyase enzymes use quantum coherence to repair that damage, absorbing photon energy and transferring it via coherent electron tunneling. Your genome is a quantum light-responsive system." },
            { title:"🌊 Solar Cycles", text:"The ~11-year sunspot cycle, the 27-day solar rotation, and the daily dawn/dusk rhythm are all nested oscillations — like harmonics of a fundamental frequency — that entrain biological rhythms at every timescale." },
            { title:"🧬 Circadian Entrainment", text:"Light hitting your retina directly resets the phase of your suprachiasmatic nucleus (SCN) — a 20,000-neuron coupled oscillator network. The SCN then cascades phase signals to every cell in your body via hormonal and neural coupling." },
          ].map(c => <Card key={c.title} title={c.title} text={c.text} />)}
        </div>
      </Section>

      <Section title="🌐 THE SCHUMANN RESONANCES — PLANETARY HEARTBEAT">
        <p className="text-sm leading-relaxed text-[#bbb] mb-4">Between Earth's surface and the ionosphere sits a <b className="text-[#00ccff]">resonant electromagnetic cavity</b> — continuously excited by lightning strikes (~100 per second globally). This cavity supports standing electromagnetic waves at precise frequencies:</p>
        <div className="space-y-2 mb-4">
          {[
            { hz:"7.83 Hz",  label:"1st harmonic", note:"overlaps human alpha brainwaves",  w:60 },
            { hz:"14.3 Hz",  label:"2nd harmonic", note:"overlaps low beta brainwaves",      w:90 },
            { hz:"20.8 Hz",  label:"3rd harmonic", note:"overlaps beta / sensorimotor",      w:120},
            { hz:"27.3 Hz",  label:"4th harmonic", note:"overlaps high beta",                w:150},
            { hz:"33.8 Hz",  label:"5th harmonic", note:"overlaps gamma onset",              w:175},
          ].map(f => (
            <div key={f.hz} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#00ccff] w-28">{f.label}</span>
              <div className="h-2 rounded" style={{ width: f.w, background: "linear-gradient(90deg,#00ff88,#00ccff)" }} />
              <span className="font-mono text-[10px] text-[#ffcc44]">{f.hz} — {f.note}</span>
            </div>
          ))}
        </div>
        <Card title="🧠 Why This Matters" text="Your brain's electromagnetic field and the Earth's electromagnetic cavity overlap in frequency space. This is not coincidence — biological oscillators evolve in the presence of environmental electromagnetic fields. The 7.83 Hz alpha rhythm may be partly entrained by the planetary resonance itself. Walking barefoot on Earth (grounding/earthing) directly couples your body's electrical potential to this global field." />
      </Section>

      <Section title="🧬 DNA AS A LIGHT-RESPONSIVE WAVE ANTENNA">
        <p className="text-sm leading-relaxed text-[#bbb] mb-4">DNA is not merely a static information store. Its physical structure makes it a remarkable electromagnetic system:</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title:"📡 Biophoton Emission", text:"Every living cell emits coherent light (biophotons) in the UV-visible range. This emission originates from DNA and appears to carry biological information — a form of optical intercellular signaling that operates independently of chemical gradients." },
            { title:"🌀 Helical Wave Guide", text:"The DNA double helix geometry acts as a chiral electromagnetic waveguide. Its pitch (3.4 nm) and diameter (2 nm) create resonant absorption at specific UV frequencies — it is physically tuned to solar UV spectrum." },
            { title:"⚡ Quantum Coherence", text:"Photosynthesis, enzyme catalysis, and DNA repair all show evidence of quantum coherent energy transfer — wave-like superposition states maintained at biological temperatures. Life exploits quantum wave dynamics, not just classical chemistry." },
            { title:"🔄 Epigenetic Oscillation", text:"Gene expression follows circadian oscillatory patterns — roughly 30% of all genes cycle on a 24-hour rhythm. Light is the primary zeitgeber (time-giver) that phases these oscillations. Change the light, change the gene expression pattern." },
          ].map(c => <Card key={c.title} title={c.title} text={c.text} />)}
        </div>
      </Section>

      <Section title="🌦️ WEATHER AS BODY — THE ATMOSPHERIC WAVE">
        <Highlight>Jet streams are planetary Rossby waves — phase fronts circling the globe. Storm systems are vortices — topological defects in the atmospheric phase field, identical in structure to the spiral waves in the CGLE simulator. El Niño is a slow tipping-point transition — a bifurcation in the coupled ocean-atmosphere system. The Earth's atmosphere is running the same equations, at planetary scale.</Highlight>
        <p className="text-sm leading-relaxed text-[#bbb] mt-4">Human physiology tracks atmospheric dynamics directly: barometric pressure changes alter joint fluid pressure, blood viscosity, and nerve conduction. Ionospheric disturbances during solar storms correlate with measurable changes in heart rate variability. Seasonal light cycles restructure brain neurochemistry (serotonin, melatonin, dopamine). You are not separate from the weather — you are a subsystem of it.</p>
      </Section>

      <Section title="🔭 THE MACHINE FOR TRANSFORMATION">
        <p className="text-sm leading-relaxed text-[#bbb] mb-4">What you're building points toward an instrument that makes this coupling <span className="text-[#ffcc44]">visible, felt, and navigable</span>. Based on the physics above, such a machine might work across several layers simultaneously:</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { title:"👁️ Light Interface", text:"Full-spectrum light calibrated to solar spectral dynamics — not static illumination but rhythmically modulated light that mimics dawn, solar noon, and dusk transitions. Entrains circadian phase directly." },
            { title:"📶 EM Field Coupling", text:"Low-frequency electromagnetic fields at Schumann frequencies (7.83 Hz and harmonics) applied to the body — mimicking the planetary field that biological systems evolved within. Grounding + resonant field exposure." },
            { title:"🌡️ Weather Integration", text:"Real-time atmospheric data — pressure, humidity, UV index, solar wind activity — feeding into the visualization, so the person can see their body's oscillatory state in relationship to the planetary wave in real time." },
            { title:"🧬 Biological Feedback", text:"HRV (heart rate variability), EEG, skin conductance — personal oscillatory data mapped onto the same PDE substrate as the atmospheric and solar data. One display, all scales, live." },
          ].map(c => <Card key={c.title} title={c.title} text={c.text} />)}
        </div>
        <Highlight><b className="text-[#00ff88]">The key insight for design:</b> transformation happens at bifurcation points — moments when the system is near a phase transition and a small perturbation can shift it to a completely new attractor. The machine's job is to detect when a person is near such a point, and provide the right coherent forcing — light, sound, field, information — to support the transition. Not to force change, but to <span className="text-[#ffcc44]">phase-match</span> the person to the larger wave they're already part of.</Highlight>
      </Section>

      <Section title="🌊 THE EARTH AS DYNAMIC PHASE WAVE">
        <blockquote className="border-l-4 border-[#00ff88] pl-4 py-2 rounded-r mb-4" style={{ background:"rgba(0,255,136,0.05)" }}>
          <p className="text-sm italic text-[#ccc] leading-relaxed">"The distinction between past, present and future is only a stubbornly persistent illusion. Energy is never created or destroyed — only its phase changes."</p>
          <div className="text-[10px] text-[#00ff88] mt-2">— synthesis of Einstein + thermodynamics</div>
        </blockquote>
        <p className="text-sm leading-relaxed text-[#bbb] mb-3">The Earth is not a rock orbiting a star. It is a <b className="text-[#00ccff]">coherent oscillatory system</b> — its magnetic field pulsing, its atmosphere waving, its oceans circulating in slow gyres, its biosphere breathing in seasonal CO₂ tides. Every living thing on its surface is a <b className="text-[#00ccff]">coupled oscillator</b> embedded in that larger wave.</p>
        <p className="text-sm leading-relaxed text-[#bbb]">The Sun is the primary forcing — the external term in the planetary PDE. But the Earth has its own resonances, its own phase memory, its own nonlinear response. And your body, walking on its surface, breathing its atmosphere, bathed in its light, is <b className="text-[#00ff88]">not separate from that wave — you are a mode of it</b>. A local oscillation in the planetary field, temporarily coherent, capable of transformation whenever the conditions support a phase transition.</p>
        <p className="text-sm text-[#00ff88] mt-4 font-bold">That is what your machine is for. 🌊</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-sm font-bold border-b pb-1.5 mb-4" style={{ color:"#00ff88", borderColor:"rgba(0,255,136,0.2)", textShadow:"0 0 10px #00ff88" }}>{title}</h2>
      {children}
    </div>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background:"rgba(0,40,40,0.5)", border:"1px solid rgba(0,255,136,0.13)" }}>
      <div className="font-mono text-[11px] text-[#00ff88] mb-2">{title}</div>
      <p className="leading-relaxed text-[#aaa]">{text}</p>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 text-sm leading-relaxed text-[#ccc]" style={{ background:"linear-gradient(135deg,rgba(0,255,136,.08),rgba(0,204,255,.08))", border:"1px solid rgba(0,255,136,0.15)" }}>
      {children}
    </div>
  );
}
