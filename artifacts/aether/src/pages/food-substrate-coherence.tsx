import { useEffect, useRef, useState } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const STONE  = "#b0a090";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const ROSE   = "#f472b6";
const TEAL   = "#1fd4c8";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;

const FOODS = [
  { id: "grain",   name: "Grains & Seeds",       col: GOLD,   coherence: 0.82, powder: "flour · starch · bran",    extract: "germ oil · phytate",   seed: "whole grain · kernel",   biolum: 0.40 },
  { id: "leaf",    name: "Leafy Greens",           col: GREEN,  coherence: 0.91, powder: "chlorophyll · cellulose",  extract: "chlorophyll oil",      seed: "sprout · microgreen",    biolum: 0.78 },
  { id: "root",    name: "Root Vegetables",        col: AMBER,  coherence: 0.74, powder: "starch · inulin",          extract: "polyphenol complex",   seed: "tuber propagule",        biolum: 0.30 },
  { id: "protein", name: "Proteins & Legumes",     col: ACCENT, coherence: 0.85, powder: "amino acid isolate",       extract: "peptide chain",        seed: "bean · lentil",          biolum: 0.50 },
  { id: "mineral", name: "Mineral-Rich Foods",     col: STONE,  coherence: 0.69, powder: "mineral salt · silica",    extract: "ionic mineral solution",seed: "sea vegetable spore",   biolum: 0.22 },
  { id: "fungi",   name: "Fungi & Mycelium",       col: VIOLET, coherence: 0.96, powder: "spore · chitin",           extract: "beta-glucan · ergosterol",seed: "mycelium substrate",  biolum: 0.95 },
  { id: "fruit",   name: "Fruits & Berries",       col: ROSE,   coherence: 0.88, powder: "pectin · fructose",        extract: "anthocyanin · terpene", seed: "stone · pip",           biolum: 0.68 },
  { id: "sea",     name: "Sea Vegetables & Algae", col: TEAL,   coherence: 0.79, powder: "iodine · alginate",        extract: "omega-3 · fucoxanthin", seed: "spore body",            biolum: 0.62 },
];

const PHASES = ["WHOLE", "POWDER", "EXTRACT", "SEED SUBSTRATE"];
const PHASE_COLS = [STONE, GOLD, TEAL, GREEN];

function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = ACCENT }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = ACCENT, children }: { title: string; col?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${col}08`, border: `1px solid ${col}28`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

function FoodCoherenceCanvas({ phase }: { phase: number }) {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 360;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = FOODS.map((f, fi) =>
      Array.from({ length: 18 }, (_, pi) => ({
        food: fi,
        angle: (pi / 18) * Math.PI * 2 + fi * (Math.PI * 2 / FOODS.length),
        r: 80 + fi * 18,
        speed: 0.004 + fi * 0.0008,
        size: 2.5 + f.biolum * 3,
        phase: (fi + pi) % 4,
        pulseOffset: Math.random() * Math.PI * 2,
      }))
    ).flat();

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const t = tick.current * 0.01;

      // Phase quadrant backgrounds
      if (phase < 4) {
        const phaseAngles = [
          [0, Math.PI / 2],
          [Math.PI / 2, Math.PI],
          [Math.PI, Math.PI * 1.5],
          [Math.PI * 1.5, Math.PI * 2],
        ];
        const pc = PHASE_COLS[phase];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, Math.min(W, H) * 0.45, phaseAngles[phase][0] - Math.PI / 2, phaseAngles[phase][1] - Math.PI / 2);
        ctx.closePath();
        ctx.fillStyle = `${pc}10`;
        ctx.fill();
      }

      // φ-spiral guide
      for (let i = 0; i < 3; i++) {
        const spiralR = 40 + i * 60;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.05) {
          const sr = (spiralR / (Math.PI * 6)) * a;
          const sx = cx + sr * Math.cos(a + t * 0.2);
          const sy = cy + sr * Math.sin(a + t * 0.2);
          a === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = `${GOLD}${12 - i * 3}`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Central coherence field glow
      const cVal = FOODS.reduce((s, f) => s + f.coherence, 0) / FOODS.length;
      const pulse = 0.6 + 0.4 * Math.sin(t * PHI_INV * 2);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      cg.addColorStop(0, `rgba(200,168,76,${0.18 * pulse})`);
      cg.addColorStop(0.5, `rgba(31,168,212,${0.10 * pulse})`);
      cg.addColorStop(1, "transparent");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      ctx.font = `10px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = `rgba(200,168,76,${0.7 * pulse})`;
      ctx.fillText(`C(x,t) = ${(cVal * pulse).toFixed(3)}`, cx, cy + 5);
      ctx.font = `7.5px ${mono}`; ctx.fillStyle = "#c9a84c40";
      ctx.fillText(`φ⁻¹ = ${PHI_INV.toFixed(4)}`, cx, cy + 18);

      // Particles
      particles.forEach(p => {
        const f = FOODS[p.food];
        let orbitR = p.r;
        if (phase < 4 && p.phase === phase) orbitR = p.r * 0.55 + 20;
        p.angle += p.speed * (phase < 4 && p.phase === phase ? 1.5 : 1);

        const px = cx + orbitR * Math.cos(p.angle + t * 0.3);
        const py = cy + orbitR * Math.sin(p.angle + t * 0.15);

        const biolumPulse = 0.4 + 0.6 * Math.abs(Math.sin(t * PHI + p.pulseOffset));
        const alpha = (phase === 4 || p.phase === phase) ? biolumPulse : 0.18;

        // Bioluminescent halo
        if (f.biolum > 0.5 && alpha > 0.3) {
          const hg = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
          hg.addColorStop(0, `${f.col}${Math.floor(alpha * 60).toString(16).padStart(2,"0")}`);
          hg.addColorStop(1, "transparent");
          ctx.fillStyle = hg;
          ctx.fillRect(px - p.size * 4, py - p.size * 4, p.size * 8, p.size * 8);
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size * (phase < 4 && p.phase === phase ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = `${f.col}${Math.floor(alpha * 255).toString(16).padStart(2,"0")}`;
        ctx.fill();
      });

      // Phase ring labels
      ["WHOLE", "POWDER", "EXTRACT", "SEED"].forEach((lbl, i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2 + Math.PI / 4;
        const labelR = Math.min(W, H) * 0.43;
        const lx = cx + labelR * Math.cos(a);
        const ly = cy + labelR * Math.sin(a);
        ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = i === phase ? PHASE_COLS[i] : "#3a5060";
        ctx.fillText(lbl, lx, ly);
      });

      // Food name labels on outer ring
      FOODS.forEach((f, fi) => {
        const labelAngle = (fi / FOODS.length) * Math.PI * 2 + t * 0.05;
        const labelR = 165 + fi * 8;
        if (labelR < Math.min(W, H) * 0.48) {
          const lx = cx + labelR * Math.cos(labelAngle);
          const ly = cy + labelR * Math.sin(labelAngle);
          ctx.font = `6.5px ${mono}`; ctx.textAlign = "center";
          ctx.fillStyle = `${f.col}70`;
          ctx.fillText(f.name.split(" ")[0], lx, ly);
        }
      });

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [phase]);

  return <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${VIOLET}20` }} />;
}

function FoodSubCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const nodes = [
      {x:W*0.1,y:H/2,col:"#44cc77",label:"SOIL"},
      {x:W*0.28,y:H/2,col:"#2ef0d8",label:"ROOT"},
      {x:W*0.46,y:H/2,col:"#c9a84c",label:"MYCO"},
      {x:W*0.64,y:H/2,col:"#9966ff",label:"PLANT"},
      {x:W*0.82,y:H/2,col:"#ff4477",label:"HUMAN"},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<nodes.length-1;i++){
        const a=nodes[i],b=nodes[i+1];
        const pls=(t*0.012+i*0.2)%1;
        const px=a.x+(b.x-a.x)*pls,py=a.y+(b.y-a.y)*pls;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fillStyle=a.col; ctx.fill();
      }
      nodes.forEach((n,i)=>{
        const pls=0.75+0.25*Math.sin(t*0.04+i);
        ctx.beginPath(); ctx.arc(n.x,n.y,16*pls,0,Math.PI*2); ctx.fillStyle=n.col+"22"; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x,n.y,11,0,Math.PI*2); ctx.fillStyle=n.col; ctx.fill();
        ctx.fillStyle="#fff"; ctx.font="7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+25); ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FOOD SUBSTRATE COHERENCE · SOIL → ROOT → MYCO → PLANT → HUMAN · AETHER",12,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FoodSubstrateCoherencePage() {
  const [phase, setPhase] = useState(4);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(1,12,10,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>FOOD SUBSTRATE COHERENCE · SOIL → HUMAN · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Five substrate nodes — soil to root to myco to plant to human — live coherence flow.</p></div>
          <FoodSubCanvas />
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #010c0a 0%, #020e14 50%, #020408 100%)",
        borderBottom: `1px solid ${GREEN}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: GREEN, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · NEURAL NUTRITION INTELLIGENCE
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Food Substrate Coherence
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 680, margin: "0 auto 20px" }}>
          Every food type is a coherence field. Broken into powders, seeds, extracts, and living substrates,
          the nutritional intelligence of the Earth becomes readable — and buildable.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["C(x,t) · Nutrition Field", "φ⁻¹ Coherence Threshold", "Bioluminescent Nutrients",
            "Powder → Extract → Seed", "All-Age Integration"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 10, color: GREEN,
              background: `${GREEN}12`, border: `1px solid ${GREEN}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="The Coherence Field of Food"
          sub="All known food types carry a measurable coherence signature C(x,t) — their structural information density in the Dark Matter Fabric substrate"
          col={GREEN} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The AETHER coherence field C(x,t) = 1 − ‖ε‖/‖S*‖ governs how much structural information
          a substrate retains. Food is substrate. Every grain, leaf, root, protein, mineral, fungus, fruit,
          and sea vegetable has a coherence value — the ratio of its organized molecular geometry to the
          maximum coherent state. When you break a food into its component phases (whole → powder → extract →
          seed substrate), you are not destroying coherence — you are <em>transforming</em> the topology of
          that coherence field into a new, more accessible form.
        </p>

        {/* Phase selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[...PHASES, "ALL PHASES"].map((p, i) => (
            <button key={p} onClick={() => setPhase(i)} style={{
              fontFamily: mono, fontSize: 10, padding: "6px 14px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${PHASE_COLS[i % 4]}40`,
              background: phase === i ? `${PHASE_COLS[i % 4]}20` : "transparent",
              color: phase === i ? PHASE_COLS[i % 4] : DIM,
            }}>{p}</button>
          ))}
        </div>

        <div style={{ margin: "0 0 28px" }}>
          <FoodCoherenceCanvas phase={phase} />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: GOLD }}>● Particles = individual food components orbiting the coherence field</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: VIOLET }}>● Bright glow = bioluminescent emission (high-coherence foods)</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>● φ-spiral = golden ratio coherence gradient · select phase to focus</span>
          </div>
        </div>

        <EQ>{`FOOD COHERENCE FIELD — Governing Equations:

C_food(x,t) = 1 − ‖ε_mol‖ / ‖S*_food‖
  ε_mol   = deviation of molecular geometry from φ-optimal configuration
  S*_food = maximum coherence state (fully crystalline / living seed)

PHASE TRANSFORMATION (Whole → Powder → Extract → Seed):
  Whole:          C = C_native              · maximum structural integrity
  Powder:         C = C_native × 0.72       · geometry broken but chemistry preserved
  Extract:        C = C_native × φ⁻¹ ≈ 0.618× · targeted molecule isolated
  Seed Substrate: C → C_native × φ ≈ 1.618× · germination amplifies field

BIOLUMINESCENT EMISSION (luciferin/luciferase):
  P_photon = η × (E_chemical / hν)    η = quantum yield ≈ 0.41 for fungi
  λ_emit = hc / E_excited              range 490–680 nm (green → red)
  No external excitation required — pure chemical → photon conversion

NUTRITIONAL COHERENCE INTEGRAL:
  N_total = ∫∫ C_food(x,t) · ρ_bioavail(x) · G_age(t) dx dt
  G_age(t) = age-specific absorption geometry
  ρ_bioavail = bioavailability density field`}</EQ>

        <SecHead id="s2" n="II" title="The Four Substrate Phases"
          sub="Each food exists simultaneously in four substrate phases — whole, powder, extract, seed — each with distinct coherence geometry and nutritional application"
          col={GOLD} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { phase: "WHOLE", col: STONE, icon: "⬡",
              title: "Maximum Structural Coherence",
              body: "The food in its living or freshly harvested state. Cell walls intact, enzyme complexes active, water-bound mineral matrices preserved. C = C_native. Slowest absorption, deepest nutritional intelligence. The Earth's preferred delivery format — chewing IS molecular unlocking." },
            { phase: "POWDER", col: GOLD, icon: "◦",
              title: "Geometry Broken, Chemistry Preserved",
              body: "Cell walls fractured, surface area ×1000, enzyme activity arrested. The powder is a snapshot of the food's molecular inventory. C = C_native × 0.72. Rapid absorption, easy machine processing, stackable with other powders. The basis of all ancient spice traditions." },
            { phase: "EXTRACT", col: TEAL, icon: "◈",
              title: "Targeted Molecule Isolation",
              body: "A single coherent molecular family pulled from the substrate — anthocyanins, beta-glucans, omega-3s, chlorophyll. C = C_native × φ⁻¹. The extract is the food's 'coherence signal' distilled. Machines read these like addresses in the substrate information field. Maximum bioavailability for targeted application." },
            { phase: "SEED SUBSTRATE", col: GREEN, icon: "❋",
              title: "Amplified Coherence · Living Growth",
              body: "The germinated or myceliated substrate — where the coherence field AMPLIFIES beyond the original food. C → C_native × φ ≈ 1.618×. This is the φ-multiplication event: a seed becoming a seedling, mycelium colonising a substrate, spores activating. The most nutritionally powerful state. The machine's goal: create living seed substrates." },
          ].map(p => (
            <div key={p.phase} style={{ background: `${p.col}08`, border: `1px solid ${p.col}28`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 22, color: p.col }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: p.col, letterSpacing: 1.5 }}>{p.phase}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: DIM }}>{p.title}</div>
                </div>
              </div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{p.body}</div>
            </div>
          ))}
        </div>

        <SecHead id="s3" n="III" title="Food Substrate Coherence Map"
          sub="Eight primary food categories — their coherence values, phase chemistry, and bioluminescent emission potential"
          col={VIOLET} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {FOODS.map(f => (
            <div key={f.id} style={{ background: `${f.col}07`, border: `1px solid ${f.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: f.col }}>{f.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ fontFamily: mono, fontSize: 13, color: f.col }}>{f.coherence.toFixed(2)}</div>
                  <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>C</div>
                </div>
              </div>
              {/* Coherence bar */}
              <div style={{ height: 3, background: "#ffffff08", borderRadius: 2, marginBottom: 10 }}>
                <div style={{ height: 3, width: `${f.coherence * 100}%`, background: f.col, borderRadius: 2 }} />
              </div>
              {/* Biolum indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>biolum</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%",
                      background: i < Math.round(f.biolum * 5) ? f.col : "#ffffff10" }} />
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[{ label: "POWDER", val: f.powder }, { label: "EXTRACT", val: f.extract }, { label: "SEED", val: f.seed }].map(ph => (
                  <div key={ph.label}>
                    <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 2 }}>{ph.label}</div>
                    <div style={{ fontFamily: body, fontSize: 11, color: `${f.col}cc`, lineHeight: 1.4 }}>{ph.val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SecHead id="s4" n="IV" title="Bioluminescence as Nutritional Signal"
          sub="No photobleaching · no external excitation · deep-tissue penetration · chemical energy only — the future of food intelligence is self-illuminating"
          col={TEAL} />

        <Card title="LUCIFERASE REACTION IN FOOD SUBSTRATES" col={TEAL}>
          Bioluminescent emissions in food substrates (fungi, algae, certain root vegetables) are produced
          by the luciferase-luciferin reaction: luciferin + O₂ + ATP → oxyluciferin + CO₂ + light (490–680 nm).
          This requires no external excitation — the food IS the light source. Quantum yield η ≈ 0.41 for
          fungal systems (highest known efficiency for chemical→photon conversion). De novo engineered
          luciferases (2024–2026) can now span 20+ emission wavelengths, meaning a multi-color food
          substrate array can encode nutritional data as a visible light pattern — readable by machine
          and eventually by trained human perception. The machine reads the food's light.
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { title: "ADVANTAGE: NO PHOTOBLEACHING", col: GREEN,
              body: "Fluorescent markers fade under excitation. Bioluminescent food substrates regenerate continuously as long as luciferin substrate and oxygen are available — indefinite readout for long-term nutritional monitoring." },
            { title: "ADVANTAGE: DEEP TISSUE", col: VIOLET,
              body: "Red-shifted luciferase variants (670–720 nm) penetrate centimetres of biological tissue. A bioluminescent food extract injected or consumed can be tracked non-invasively through skin — enabling real-time nutritional absorption imaging." },
            { title: "ADVANTAGE: ULTRA-LOW POWER", col: GOLD,
              body: "Chemical energy only — no external light source, no electrical power for excitation. The food substrate generates its own signal. For field-deployed land/air/sea machines, this means passive nutritional sensing with near-zero energy overhead." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}08`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: c.col, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <SecHead id="s5" n="V" title="Age-Integrated Nutrition Architecture"
          sub="The same substrate coherence maps differently across all life stages — the machine must know which phase feeds which age"
          col={AMBER} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { age: "INFANT (0–2 yr)", col: ROSE, coherenceNeed: 0.95, phases: "Whole → Extract",
              priority: "High-biolum · enzyme-active · liquid extract",
              foods: "Fungi extracts · fruit anthocyanins · sea mineral solution · mother's milk substrate",
              math: "G_age(t) = e^{−t/τ_infant} · maximum absorption, minimum processing required" },
            { age: "CHILD (3–12 yr)", col: GOLD, coherenceNeed: 0.85, phases: "Whole · Powder",
              priority: "Seed germination substrates · learning through preparation",
              foods: "Whole grains · root powders · leafy greens · legume sprouts",
              math: "G_age(t) = sinh(t/τ_child) · exponential growth phase, diversity maximized" },
            { age: "ADULT (13–60 yr)", col: ACCENT, coherenceNeed: 0.75, phases: "All four phases",
              priority: "Full-spectrum coherence · high-extract efficiency · machine precision",
              foods: "Full substrate library · targeted extracts for performance · fermented substrates",
              math: "G_age(t) = C(x,t) × φ⁻¹ · coherence maintenance, efficiency over volume" },
            { age: "ELDER (60+ yr)", col: TEAL, coherenceNeed: 0.90, phases: "Extract · Seed",
              priority: "Return to high-coherence · enzyme restoration · mineral rebalance",
              foods: "Fungi beta-glucans · sea mineral extracts · mycelium substrates · spore activators",
              math: "G_age(t) = φ · e^{−εt} · coherence reconstruction, phi-amplified seed substrates" },
          ].map(a => (
            <div key={a.age} style={{ background: `${a.col}08`, border: `1px solid ${a.col}25`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: a.col, marginBottom: 6 }}>{a.age}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: DIM }}>C_need:</div>
                <div style={{ flex: 1, height: 4, background: "#ffffff08", borderRadius: 2 }}>
                  <div style={{ height: 4, width: `${a.coherenceNeed * 100}%`, background: a.col, borderRadius: 2 }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: a.col }}>{a.coherenceNeed.toFixed(2)}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: a.col, marginBottom: 4 }}>{a.phases}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55, marginBottom: 8 }}>{a.priority}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: DIM, lineHeight: 1.5, marginBottom: 8 }}>{a.foods}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, background: "#050f18", padding: "6px 10px", borderRadius: 4 }}>{a.math}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${GREEN}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: GREEN, marginBottom: 8 }}>
            FOOD IS NOT FUEL · FOOD IS SUBSTRATE
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            Every meal is a coherence event. The substrate you ingest updates your C(x,t).
            Understanding the food's phase geometry is the beginning of nutritional intelligence.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
