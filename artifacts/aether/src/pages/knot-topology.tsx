import { useEffect, useRef } from "react";
import imgTaitPlate from "@assets/HGxT-BZXEAA4c3U_1777222187177.jpeg";

const B = {
  bg: "#f4ecdc", panel: "#fbf6ea", ink: "#2a2218",
  text: "rgba(42,34,24,0.78)", muted: "rgba(42,34,24,0.5)",
  border: "rgba(120,90,50,0.22)",
  brown: "#5a3e1f", amber: "#a87a32", olive: "#6b6f3a", terracotta: "#c2674a",
};

const FACTS = [
  { label: "Crossing number", value: "10",
    note: "The plate enumerates knots whose minimum number of crossings in any planar diagram is exactly ten. Tait's labels (the small numbers and Greek letters) are the historical naming scheme that predates the modern Rolfsen / Hoste-Thistlethwaite tables." },
  { label: "Total knots", value: "165 prime knots at 10 crossings",
    note: "The full enumeration was completed in the late 19th century by Tait, Little, and Kirkman; the count of 165 prime 10-crossing knots is now the textbook number, though the original tables contained the famous Perko pair duplicate, corrected only in 1974." },
  { label: "Method", value: "Hand-drawn alternating-knot enumeration",
    note: "Tait worked with alternating projections and used what is now called the Tait conjectures (proved in the 1980s using the Jones polynomial) to detect equivalent diagrams." },
  { label: "Modern descendants", value: "Knot polynomials · Khovanov homology · CGLE defect knots",
    note: "Modern knot theory replaces the visual table with algebraic invariants — Alexander, Jones, HOMFLY, Khovanov. AETHER's interest is the use of knot invariants to label persistent topological structures in field equations like the Complex Ginzburg–Landau lattice." },
];

const AETHER_HOOKS = [
  { title: "Defect lines in the CGLE lattice",
    body: "When the Complex Ginzburg–Landau equation supports stable phase-singularity lines that close on themselves, the resulting curves carry knot invariants. The Tait plate is, in spirit, a vocabulary table for those structures." },
  { title: "Vortex knots in fluids",
    body: "Knotted vortex tubes have been produced in real water-tank experiments (Kleckner & Irvine, Nature Physics 2013). The trefoil and the simpler 10-crossing knots in the plate become physical objects in those experiments." },
  { title: "Field-line topology in plasmas",
    body: "Magnetic-field-line knottedness controls magnetic helicity, a conserved quantity in ideal MHD. The Tait taxonomy is one way to label which configurations a plasma can hold." },
];

function TrefoilKnotCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 300;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function trefoil(t: number, rot: number): [number, number] {
      const x = Math.sin(t) + 2 * Math.sin(2 * t);
      const y = Math.cos(t) - 2 * Math.cos(2 * t);
      const c = Math.cos(rot), s = Math.sin(rot);
      return [x * c - y * s, x * s + y * c];
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f4ecdc"; ctx.fillRect(0, 0, W, H);
      const rot = tRef.current * 0.008;
      const cx = W / 2, cy = H / 2;
      const scale = 46;
      const KNOTS = [
        { offsetX: -240, color: "#5a3e1f", name: "Trefoil 3₁" },
        { offsetX: 0, color: "#a87a32", name: "Figure-8 4₁" },
        { offsetX: 240, color: "#6b6f3a", name: "Cinquefoil 5₁" },
      ];
      KNOTS.forEach((k, ki) => {
        const twists = ki + 1;
        const pts: [number, number][] = [];
        for (let i = 0; i <= 500; i++) {
          const t = (i / 500) * Math.PI * 2;
          const factor = 1 + 0.28 * ki;
          const x = Math.sin(t + rot) + 2 * Math.sin((twists + 1) * t + rot * 0.7);
          const y = Math.cos(t) - 2 * Math.cos((twists + 1) * t);
          pts.push([cx + k.offsetX + x * scale / factor, cy + y * scale / factor]);
        }
        const grad = ctx.createLinearGradient(cx + k.offsetX - scale * 3, 0, cx + k.offsetX + scale * 3, 0);
        grad.addColorStop(0, k.color + "aa");
        grad.addColorStop(0.5, k.color);
        grad.addColorStop(1, k.color + "aa");
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
        ctx.closePath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = k.color + "99";
        ctx.font = "9px 'Space Mono', monospace";
        ctx.fillText(k.name, cx + k.offsetX - 32, cy + scale + 24);
      });
      ctx.fillStyle = "rgba(42,34,24,0.45)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("KNOT TOPOLOGY · TAIT ENUMERATION · PARAMETRIC CURVES", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function KnotCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const trefoil=(u:number,scale:number)=>{
      const x=scale*(Math.sin(u)+2*Math.sin(2*u));
      const y=scale*(Math.cos(u)-2*Math.cos(2*u));
      return {x:cx+x,y:cy+y};
    };
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      const steps=200;
      const scale=45+10*Math.sin(t*0.01);
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const u=(i/steps)*Math.PI*2+t*0.008;
        const p=trefoil(u,scale);
        i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);
      }
      ctx.closePath();
      const gr=ctx.createLinearGradient(cx-scale,cy,cx+scale,cy);
      gr.addColorStop(0,"#9966ff88"); gr.addColorStop(0.5,"#2ef0d888"); gr.addColorStop(1,"#c9a84c88");
      ctx.strokeStyle=gr; ctx.lineWidth=2; ctx.stroke();
      const dot=trefoil(t*0.008,scale);
      ctx.beginPath(); ctx.arc(dot.x,dot.y,5,0,Math.PI*2); ctx.fillStyle="#2ef0d8"; ctx.fill();
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("KNOT TOPOLOGY · TREFOIL · INVARIANTS · LINKING NUMBER · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function KnotTopologyView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>KNOT TOPOLOGY · TREFOIL · INVARIANTS · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Animated trefoil knot with gradient stroke — the live AETHER knot topology simulation.</p></div>
          <KnotCanvas />
        </div>
      </div>
      <style>{`@keyframes kt-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.kt-fade{animation:kt-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.kt-fade{animation:none}}`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">
        <header className="kt-fade space-y-3" data-testid="kt-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.terracotta }}>
            Topology · Tait's Tenfold Knottiness · Modern Descendants
          </div>
          <h1 className="text-[32px] leading-tight" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>
            The shapes a string can hold.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Plate IX from Peter Guthrie Tait's 1880s knot atlas: every prime knot at ten crossings, drawn by
            hand. AETHER's interest is not antiquarian — it is that the same enumeration shows up today as the
            label set for closed defect lines in the Complex Ginzburg–Landau lattice, knotted vortex tubes in
            water, and the topology of magnetic field lines in plasmas.
          </p>
        </header>

        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(168,122,50,0.12)", border:"1px solid rgba(168,122,50,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.amber, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.amber}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              Knot Topology · Trefoil · Figure-8 · Cinquefoil
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
              Three parametric knots animated as closed curves, rotating in the plane. Left: Trefoil 3₁.
              Center: Figure-8 4₁. Right: Cinquefoil 5₁. These are the simplest prime knots — the same
              topology that appears in CGLE defect lines, knotted vortex tubes, and magnetic field lines.
            </p>
            <TrefoilKnotCanvas />
          </div>
        </div>

        <section className="kt-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="kt-section-plate">
          <SectionHead num="01" label="The plate · Tenfold Knottiness, Plate IX." accent={B.amber} />
          <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#fff" }}>
            <img src={imgTaitPlate} loading="lazy" decoding="async" className="block w-full h-auto"
                 alt="Plate IX from Peter Guthrie Tait's knot atlas, titled TENFOLD KNOTTINESS. A dense grid of small hand-drawn knot diagrams numbered 47 through 123, each labelled with letter prefixes (B, C, D, H, K, L, M, R, S, V, W, etc.) and Greek letter suffixes, all rendered as black-line over-and-under crossings on cream paper. A colophon at lower left reads 'P. Tait del.' and a note at lower right reads 'To follow Plate VIII'." />
            <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                        style={{ color: B.muted, background: B.panel }}>
              Tait, Plate IX · Tenfold Knottiness · 10-crossing prime knot enumeration
            </figcaption>
          </figure>
        </section>

        <section className="kt-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="kt-section-facts">
          <SectionHead num="02" label="What the plate actually is." accent={B.olive} />
          <div className="grid gap-3 md:grid-cols-2">
            {FACTS.map(f => (
              <article key={f.label} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: B.terracotta }}>{f.label}</div>
                <div className="text-[18px] mt-1" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{f.value}</div>
                <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: B.text }}>{f.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kt-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="kt-section-aether">
          <SectionHead num="03" label="Where the table reappears in AETHER." accent={B.terracotta} />
          <div className="grid gap-3 md:grid-cols-3">
            {AETHER_HOOKS.map(a => (
              <article key={a.title} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[14px]" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{a.title}</h3>
                <p className="text-[12px] leading-relaxed mt-2" style={{ color: B.text }}>{a.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}
