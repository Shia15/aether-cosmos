import { useEffect, useRef } from "react";

const C = {
  bg:     "#04060E",
  panel:  "rgba(8,12,28,0.82)",
  border: "rgba(0,200,160,0.10)",
  white:  "#EAE6F2",
  text:   "#A4A0B8",
  muted:  "#5A5870",
  teal:   "#00D4C8",
  gold:   "#F0C040",
  orange: "#FF8C42",
  violet: "#9B5DE5",
  green:  "#4ADE80",
  rose:   "#FF6080",
  dim:    "#0D1520",
};
const MONO  = "'Space Mono','DM Mono',monospace";
const SERIF = "'Crimson Pro',Georgia,ui-serif,serif";
const DISP  = "'Cinzel',ui-serif,Georgia,serif";

/* ── tiny components ─────────────────────────────────────────────────── */

function SectionTitle({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ margin:"40px 0 16px", borderBottom:`1px solid rgba(240,192,64,0.2)`, paddingBottom:10 }}>
      <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".22em", color:C.muted, marginBottom:4 }}>{n}</div>
      <h2 style={{ margin:0, fontFamily:DISP, fontSize:20, color:C.gold, letterSpacing:".02em" }}>{label}</h2>
    </div>
  );
}

function Sub3({ label }: { label: string }) {
  return (
    <h3 style={{ fontFamily:MONO, fontSize:12, color:C.teal, letterSpacing:".1em", margin:"24px 0 10px", textTransform:"uppercase" }}>
      {label}
    </h3>
  );
}

function EqBlock({ label, html, note, hi }: { label?: string; html: string; note?: string; hi?: boolean }) {
  return (
    <div style={{
      background: hi ? "rgba(20,10,4,0.9)" : "rgba(4,6,14,0.9)",
      border:`1px solid ${hi ? C.gold + "33" : "rgba(80,60,120,0.3)"}`,
      borderLeft:`3px solid ${hi ? C.gold : C.violet}`,
      borderRadius:6, padding:"16px 20px", margin:"16px 0", overflowX:"auto"
    }}>
      {label && (
        <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".2em", textTransform:"uppercase",
          color: hi ? C.gold : C.violet, marginBottom:8 }}>{label}</div>
      )}
      <div style={{ fontFamily:MONO, fontSize:12.5, color:C.text, lineHeight:1.75 }}
        dangerouslySetInnerHTML={{ __html: html }} />
      {note && (
        <div style={{ fontFamily:SERIF, fontSize:11, color:C.muted, marginTop:10, fontStyle:"italic" }}
          dangerouslySetInnerHTML={{ __html: note }} />
      )}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(240,192,64,0.07),rgba(240,192,64,0.02))",
      border:`1px solid rgba(240,192,64,0.28)`, borderRadius:8,
      padding:"18px 22px", margin:"22px 0",
      fontFamily:SERIF, fontSize:14, fontStyle:"italic", color:"#D4C070", lineHeight:1.7
    }}>{children}</div>
  );
}

function InfoCard({ col, title, body }: { col: string; title: string; body: string }) {
  return (
    <div style={{
      background:C.panel, border:`1px solid rgba(80,80,120,0.25)`, borderTop:`3px solid ${col}`,
      borderRadius:6, padding:"16px 18px"
    }}>
      <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:col, marginBottom:8 }}>{title}</div>
      <p style={{ fontFamily:SERIF, fontSize:13, color:"#8899CC", margin:0, lineHeight:1.65 }}>{body}</p>
    </div>
  );
}

function ObsBlock({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div style={{
      display:"flex", gap:14, background:C.panel, borderRadius:8, padding:"16px 18px",
      margin:"12px 0", border:"1px solid rgba(80,60,120,0.2)", alignItems:"flex-start"
    }}>
      <div style={{
        background:C.violet, color:"#fff", borderRadius:"50%", width:28, height:28,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:MONO, fontSize:11, fontWeight:700, flexShrink:0, marginTop:2
      }}>{n}</div>
      <div>
        <div style={{ fontFamily:MONO, fontSize:11, color:"#E0E8FF", marginBottom:6 }}>{title}</div>
        <p style={{ fontFamily:SERIF, fontSize:13, color:"#7788AA", margin:0, lineHeight:1.65 }}>{body}</p>
      </div>
    </div>
  );
}

function TLItem({ date, title, body }: { date: string; title: string; body: string }) {
  return (
    <div style={{ position:"relative", paddingLeft:28, marginBottom:20 }}>
      <div style={{ position:"absolute", left:-5, top:6, width:10, height:10, borderRadius:"50%", background:C.teal }} />
      <div style={{ fontFamily:MONO, fontSize:10, color:C.gold, marginBottom:4 }}>{date} -- {title}</div>
      <p style={{ fontFamily:SERIF, fontSize:13, color:"#7788AA", margin:0 }}>{body}</p>
    </div>
  );
}

function PredCard({ icon, label, body }: { icon: string; label: string; body: string }) {
  return (
    <div style={{ background:C.dim, border:`1px solid rgba(80,80,120,0.2)`, borderRadius:8, padding:16, textAlign:"center" }}>
      <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
      <div style={{ fontFamily:MONO, fontSize:8, color:C.teal, textTransform:"uppercase", letterSpacing:".15em", marginBottom:8 }}>{label}</div>
      <p style={{ fontFamily:SERIF, fontSize:13, color:C.muted, margin:0, lineHeight:1.6 }}>{body}</p>
    </div>
  );
}

/* ── animated phi-ladder canvas ─────────────────────────────────────── */
function PhiLadderCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 700, H = 130;
    canvas.width = W; canvas.height = H;

    const PHI = 1.6180339887;
    const rungs = [
      { n:0,  f:1,                      label:"10.08 GHz", sub:"n=0  tubulin GTP",  col:"#00D4C8" },
      { n:1,  f:1/PHI,                   label:"6.23 GHz",  sub:"n=1  organelle",    col:"#9B5DE5" },
      { n:5,  f:1/Math.pow(PHI,5),       label:"764 MHz",   sub:"n=5  tissue",       col:"#F0C040" },
      { n:15, f:1/Math.pow(PHI,15),      label:"~1 MHz",    sub:"n=15 organism",     col:"#FF8C42" },
      { n:30, f:1/Math.pow(PHI,30),      label:"7.83 Hz",   sub:"n=30 Schumann",     col:"#FF6080" },
    ];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020408"; ctx.fillRect(0, 0, W, H);

      const step = (W - 80) / (rungs.length - 1);
      /* divider arrows */
      rungs.slice(0,-1).forEach((_,i) => {
        const x1 = 40 + i * step + 18, x2 = 40 + (i+1) * step - 18;
        const yy = H - 45;
        ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1; ctx.setLineDash([3,5]);
        ctx.beginPath(); ctx.moveTo(x1, yy); ctx.lineTo(x2, yy); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(240,192,64,0.45)"; ctx.font = `8px ${MONO}`;
        ctx.textAlign = "center"; ctx.fillText("\u00F7\u03C6", (x1+x2)/2, yy - 5);
      });

      rungs.forEach((r, i) => {
        const cx = 40 + i * step;
        const maxBarH = H - 52;
        const wave = 1 + 0.12 * Math.sin(t * r.f * 0.06 + i * 1.3);
        const barH = (12 + r.f * maxBarH) * wave;
        const y = H - 44 - barH;

        const grd = ctx.createLinearGradient(cx - 14, y, cx - 14, H - 44);
        grd.addColorStop(0, r.col);
        grd.addColorStop(1, r.col + "22");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.roundRect(cx - 14, y, 28, barH, 3); ctx.fill();

        /* glow */
        const glowGrd = ctx.createRadialGradient(cx, y+4, 0, cx, y+4, 20);
        glowGrd.addColorStop(0, r.col + "44"); glowGrd.addColorStop(1, r.col + "00");
        ctx.fillStyle = glowGrd; ctx.beginPath(); ctx.arc(cx, y+4, 20, 0, Math.PI*2); ctx.fill();

        ctx.fillStyle = r.col; ctx.font = `bold 8px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText(r.label, cx, H - 30);
        ctx.fillStyle = r.col + "88"; ctx.font = `7px ${MONO}`;
        ctx.fillText(r.sub, cx, H - 19);
        ctx.fillText(`\u03C6\u207B${r.n}`, cx, H - 7);
      });

      /* top label */
      ctx.fillStyle = "rgba(0,212,200,0.3)"; ctx.font = `8px ${MONO}`; ctx.textAlign = "left";
      ctx.fillText("\u03C9_DMF FREQUENCY LADDER -- HEARING CONDITION \u03C9\u207F = \u03C9_DMF \u00B7 \u03C6\u207B\u207F", 10, 14);

      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{ width:"100%", maxWidth:700, height:"auto", display:"block", margin:"0 auto",
        borderRadius:8, border:`1px solid ${C.border}` }} />
  );
}

/* ── parameter table ─────────────────────────────────────────────────── */
const PARAMS = [
  ["Tubulin subunit spacing",    "d<sub>sub</sub>",        "8 nm",                       "Crystallographic [Lowe et al. 2001]"],
  ["Microtubule outer diameter", "D<sub>MT</sub>",         "25 nm",                      "Electron microscopy"],
  ["Protofilaments per MT",      "N<sub>pf</sub>",         "13",                         "Standard; 10 deg helical pitch"],
  ["GTP hydrolysis free energy", "DG<sub>GTP</sub>",       "7.5 kcal mol-1",             "Desai &amp; Mitchison 1997"],
  ["MT growth rate (in vitro)",  "v<sub>grow</sub>",       "0.6-3 um/min",               "Mitchison &amp; Kirschner 1984"],
  ["Pushing force",              "F<sub>push</sub>",       "3-4 pN",                     "Dogterom &amp; Yurke 1997"],
  ["Pulling force",              "F<sub>pull</sub>",       "30-65 pN",                   "Dogterom &amp; Yurke 1997"],
  ["Caustic Hausdorff dim.",     "dim<sub>H</sub>",        "log N / log \u03C6 \u2248 1.44","AETHER derived"],
  ["Bee UV photoreceptor peak",  "\u03BB<sub>UV,bee</sub>","~340-360 nm",                "Apidae optics literature"],
  ["Younger Dryas onset",        "t<sub>YD</sub>",         "12,900 BP",                  "Ice core chronology"],
  ["Holocene transition",        "t<sub>H</sub>",          "11,700 BP",                  "Ice core chronology"],
  ["Golden ratio",               "\u03C6",                 "1.618033988\u2026",          "Irrational; AETHER binding constant"],
  ["\u03C6-coherence angle",     "\u0398<sub>\u03C6</sub>","222.5\u00B0",                "AETHER resonance suppression"],
  ["Schumann fundamental",       "f<sub>S1</sub>",         "7.83 Hz",                    "Earth cavity resonance"],
  ["Predicted \u03C9<sub>DMF</sub>/2\u03C0","f<sub>DMF</sub>","~10.08 GHz",             "AETHER \u03C6-ladder calibration"],
  ["Volcanic core pressure",     "P<sub>core</sub>",       "250 GPa",                    "Planetary interior models"],
  ["Integration Constant",       "K",                      "RG fixed point of C(x,t)",   "\u03A6(E,S)=K isomorphism"],
];

const REFS = [
  "Mitchison T, Kirschner M. (1984) Dynamic instability of microtubule growth. <em>Nature</em> 312: 237-242.",
  "Walker RA et al. (1988) Dynamic instability of individual microtubules analyzed by video light microscopy. <em>J. Cell Biology</em> 107:1437-1448.",
  "Desai A, Mitchison T. (1997) Microtubule polymerization dynamics. <em>Annual Review of Cell and Developmental Biology</em> 13: 83-117.",
  "Dogterom M and Yurke B. (1997) Measurement of the force-velocity relation for growing microtubules. <em>Science</em> 278: 856-860.",
  "Lowe J, Li H, Downing KH, Nogales E. (2001) Refined structure of alpha-beta-tubulin at 3.5 A. <em>J. Molecular Biology</em> 313: 1045-1057.",
  "Penrose R, Hameroff S. (1996) Orchestrated Reduction of Quantum Coherence in Brain Microtubules. <em>Mathematics and Computers in Simulation</em> 40: 453-480.",
  "Turing AM. (1952) The chemical basis of morphogenesis. <em>Philosophical Transactions of the Royal Society B</em> 237: 37-72.",
  "Randall L, Scholtz MR. (2015) Dark Matter as a Trigger for Periodic Comet Impacts. <em>Physical Review Letters</em> 114: 011301.",
  "Schumann WO. (1952) Uber die strahlungslosen Eigenschwingungen einer leitenden Kugel. <em>Zeitschrift fur Naturforschung A</em> 7: 149-154.",
  "Miller S. (2026) AETHER Framework Vol. I-IV: Coherence Field Lagrangian, DMF Derivation, Warp Metric Geometry, and Biophoton Coupling. <em>Cosmic Chaos Corporation Technical Series</em>. AetherLife.co.",
  "Miller S. (2026) AETHER-CUCA Unified Warp Drive Theory: Formal Equivalence of Alcubierre Shape Function and AETHER Coherence Field. <em>Cosmic Chaos Corporation Technical Series</em>.",
  "Miller S. (2026) phi-AETHER Cancer Detection Framework: Fibonacci Lattice Biophoton Simulation and Mycelium SOC Network. <em>Cosmic Chaos Corporation Technical Series</em>.",
];

/* ── main page ────────────────────────────────────────────────────────── */
export default function BindingTheDarkPage() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:SERIF }}>
      <style>{`
        @keyframes btd-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .btd-fadein { animation:btd-fadein 500ms ease-out both; }
        .btd-ref-list { list-style:none; counter-reset:refs; }
        .btd-ref-list li { counter-increment:refs; font-family:${SERIF}; font-size:13px; color:${C.muted};
          padding:6px 0 6px 28px; position:relative; border-bottom:1px solid rgba(42,58,94,0.3); }
        .btd-ref-list li::before { content:"[" counter(refs) "]"; position:absolute; left:0; color:${C.teal}; font-weight:bold; font-size:11px; }
        .btd-param-table { width:100%; border-collapse:collapse; margin:18px 0; font-size:12px; }
        .btd-param-table th { background:rgba(14,20,40,0.8); color:${C.teal}; text-align:left; padding:9px 13px;
          border-bottom:2px solid ${C.teal}; font-family:${MONO}; font-size:8px; letter-spacing:.15em; text-transform:uppercase; }
        .btd-param-table td { padding:8px 13px; border-bottom:1px solid rgba(42,58,94,0.3); color:#9AACCC; font-family:${SERIF}; }
        .btd-param-table tr:hover td { background:rgba(0,212,200,0.03); }
        .btd-warp-table { width:100%; border-collapse:collapse; margin:18px 0; font-size:12px; }
        .btd-warp-table th { background:rgba(14,20,40,0.8); color:${C.teal}; text-align:left; padding:8px 12px;
          border-bottom:2px solid ${C.teal}; font-family:${MONO}; font-size:8px; letter-spacing:.15em; text-transform:uppercase; }
        .btd-warp-table td { padding:7px 12px; border-bottom:1px solid rgba(42,58,94,0.25); color:#9AACCC; font-family:${SERIF}; vertical-align:top; }
      `}</style>

      {/* ── COVER ── */}
      <div style={{
        background:"linear-gradient(160deg,#060D1A 0%,#0F1F3D 50%,#04060E 100%)",
        borderBottom:`2px solid ${C.teal}`, padding:"64px 48px 44px", textAlign:"center", position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse at 30% 40%,rgba(0,212,200,0.06) 0%,transparent 60%), radial-gradient(ellipse at 70% 60%,rgba(155,93,229,0.06) 0%,transparent 60%)",
          pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".35em", textTransform:"uppercase", color:C.teal, marginBottom:24 }}>
            Cosmic Chaos Corporation -- AETHER Framework -- Technical Paper Series
          </div>
          <h1 style={{ fontFamily:DISP, fontSize:32, fontWeight:"bold", color:"#ffffff", lineHeight:1.25, maxWidth:860, margin:"0 auto 18px", letterSpacing:".01em" }}>
            Binding the Dark: AETHER Coherence Field as Observable Dark Matter Substrate
          </h1>
          <h2 style={{ fontFamily:SERIF, fontSize:16, color:C.gold, fontStyle:"italic", fontWeight:"normal", margin:"0 auto 28px", maxWidth:700, lineHeight:1.5 }}>
            A Synthetic Mathematical Framework Unifying Cytoskeletal Mechanics, Photonic Caustics,
            Biological Spectral Sensing, and Geological Archive with omega-DMF Field Phenomenology
          </h2>
          <div style={{ fontFamily:SERIF, fontSize:14, color:C.muted, marginBottom:8 }}>Shia Miller | AetherLife.co | @StrategicProce</div>
          <div style={{ fontFamily:SERIF, fontSize:12, color:C.muted, marginBottom:24 }}>Cosmic Chaos Corporation -- Hollidaysburg, Pennsylvania -- USPTO Grace Period Disclosure</div>
          <div style={{ display:"flex", justifyContent:"center", gap:36, fontFamily:MONO, fontSize:9, color:C.muted,
            borderTop:`1px solid rgba(42,58,94,0.6)`, paddingTop:16 }}>
            {[["Date","June 2026"],["Framework","AETHER v4.x"],["Domain","Physics / Biology / Cosmology"],["Status","Pre-Patent Disclosure"]].map(([k,v]) => (
              <div key={k}>{k}: <span style={{ color:C.teal, fontWeight:700 }}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:940, margin:"0 auto", padding:"0 36px 80px" }}>

        {/* Abstract */}
        <div className="btd-fadein" style={{ background:C.panel, borderLeft:`4px solid ${C.teal}`,
          borderRadius:4, padding:"24px 28px", margin:"36px 0" }}>
          <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".25em", textTransform:"uppercase", color:C.teal, marginBottom:12 }}>Abstract</div>
          <p style={{ fontFamily:SERIF, fontSize:14, color:"#B0BCDB", lineHeight:1.8, margin:0 }}>
            We present a unified mathematical synthesis proposing that the Dark Matter Fabric (DMF) scalar field,
            previously formalized under the AETHER Framework, is not merely a cosmological background but an active,
            biologically-observable substrate mediating coherence across scales from tubulin dimer vibration (nanometer)
            through photonic caustic branching (millimeter-centimeter) to planetary geological archiving (kilometer).
            The coherence field C(x,t) is extended with a new spectral observability tensor S<sub>obs</sub> whose six
            principal eigenvalues map directly to six independently observed phenomena. The central result -- the
            <em> Dark Matter Hearing Condition</em> -- states that biological systems achieve maximal DMF coupling when
            operating at frequencies omega-DMF * phi^-n for integer n, generating a phi-irrational frequency ladder from
            the tubulin GTP phonon (10 GHz) to the Schumann fundamental (7.83 Hz). This calibrates the primary DMF
            coupling frequency at omega-DMF / 2pi = 10.08 GHz, accessible to existing radio telescope infrastructure.
            Six falsifiable observational predictions are identified spanning TIRF microscopy, near-field microwave
            probing, sap isotope analysis, and radio telescope observation.
          </p>
        </div>

        {/* phi ladder canvas */}
        <div className="btd-fadein" style={{ animationDelay:"80ms", background:C.panel, borderRadius:12,
          border:`1px solid ${C.border}`, padding:"16px 16px 12px", marginBottom:24 }}>
          <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".2em", color:C.teal, textTransform:"uppercase", marginBottom:12 }}>
            LIVE: phi-Frequency Ladder -- Hearing Condition Visualizer
          </div>
          <PhiLadderCanvas />
        </div>

        {/* S1 */}
        <SectionTitle n="01" label="Introduction and Motivating Observations" />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:14 }}>
          The contemporary dark matter problem is fundamentally a problem of observational blindness: standard-model
          detectors look for particle recoil events while ignoring the possibility that dark matter couples preferentially
          to <em>coherent</em> biological and physical structures rather than to isolated nucleons. The AETHER Framework,
          developed across 2014-2026, has progressively formalized the hypothesis that a scalar field omega-DMF permeates
          all matter density gradients and is rendered observable only by systems whose internal coherence exceeds the
          critical threshold C(x,t) &gt;= phi^-1 = 0.618.
        </p>
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:16 }}>
          Six cross-scale coherence phenomena collectively encode the same underlying coupling event:
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:8 }}>
          <InfoCard col={C.teal}   title="Layer I -- Nanoscale"
            body="Tubulin alpha/beta heterodimer oscillations (8 nm subunit spacing, GDP->GTP hydrolysis energy 7.5 kcal/mol) producing longitudinal mechanical waves along protofilaments." />
          <InfoCard col={C.orange} title="Layer II -- Microscale"
            body="Dendritic photonic caustics (10 um scale bars) generated by refractive-index gradients in turbulent media -- branching filaments encoding local frequency/density variation in color space." />
          <InfoCard col={C.violet} title="Layer III -- Mesoscale"
            body="Tetrachromatic UV spectral sensing by pollinators, encoding flower biochemical state as a 4-channel (UV, Blue, Green, Red-Enhanced) information manifold navigated via polarized skylight." />
          <InfoCard col={C.green}  title="Layer IV -- Macroscale"
            body="Tree sap isotope archiving (13C, 18O, hydrogen biomarkers) of 15,000-11,700 yr climate oscillations, constituting a distributed biological climate sensor network." />
          <InfoCard col={C.violet} title="Layer V -- Systems Scale"
            body="Phi(E,S)=K self-organization isomorphism across biological dynamics, climate dynamics, and economic dynamics -- all governed by the same reaction-diffusion kernel." />
          <InfoCard col={C.orange} title="Layer VI -- Planetary Scale"
            body="Volcanic propulsion D5-vortex pressure differentials (250 GPa), dimensionless water quantum superposition over gravity crystal lattices, and warp metric phi-coherence resonance suppression." />
        </div>

        {/* S2 */}
        <SectionTitle n="02" label="Foundational Field Equations" />
        <Sub3 label="2.1 The AETHER Coherence Field" />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:10 }}>
          The master coherence field is defined over spacetime manifold M as:
        </p>
        <EqBlock hi label="Master Field -- AETHER Coherence"
          html={`C(<b>x</b>, t) = C<sub>0</sub> &middot; exp[&minus;|<b>x</b> &minus; <b>x</b><sub>0</sub>|<sup>2</sup> / 2&lambda;<sub>c</sub><sup>2</sup>] &middot; cos(&omega;<sub>c</sub>t &minus; <b>k</b><sub>c</sub> &middot; <b>x</b>) &middot; &phi;<sup>&minus;n</sup>`}
          note="where &phi; = (1+&radic;5)/2 &asymp; 1.618034 (golden ratio), &lambda;<sub>c</sub> is coherence length scale, &omega;<sub>c</sub> is characteristic frequency, n indexes the harmonic shell, and C<sub>0</sub> is the vacuum amplitude set by DMF boundary conditions." />

        <Sub3 label="2.2 The Dark Matter Fabric Lagrangian" />
        <EqBlock label="DMF Lagrangian Density"
          html={`&Lscr;<sub>DMF</sub> = &frac12;(&part;<sub>&mu;</sub>&Phi;<sub>DMF</sub>)<sup>2</sup> &minus; V(&Phi;<sub>DMF</sub>) &minus; g<sub>bio</sub> &Phi;<sub>DMF</sub> &Jscr;<sub>coh</sub>`} />
        <EqBlock label="Coherence-Adapted Potential"
          html={`V(&Phi;<sub>DMF</sub>) = &frac12;&omega;<sub>DMF</sub><sup>2</sup>&Phi;<sub>DMF</sub><sup>2</sup> + (&lambda;<sub>&Phi;</sub>/4!)&Phi;<sub>DMF</sub><sup>4</sup> &minus; &mu;<sub>&phi;</sub> &Phi;<sub>DMF</sub> &middot; C(<b>x</b>,t)`} />
        <EqBlock label="Biological Coherence Current"
          html={`&Jscr;<sub>coh</sub> = &sum;<sub>i</sub> &rho;<sub>i</sub>(<b>x</b>,t) &middot; v<sub>i</sub><sup>coh</sup>(<b>x</b>,t) &middot; e<sup>i&theta;<sub>i</sub></sup>`}
          note="&rho;<sub>i</sub> is local matter density of coherent subsystem i (tubulin lattice, mycelial network, sap column, etc.), v<sub>i</sub><sup>coh</sup> is its coherence velocity, &theta;<sub>i</sub> is phase offset." />

        <Sub3 label="2.3 The Dark Matter Oscillation Frequency omega-DMF" />
        <EqBlock hi label="DMF Characteristic Frequency -- Core Derivation"
          html={`&omega;<sub>DMF</sub><sup>2</sup> = &omega;<sub>c</sub><sup>2</sup>[1 + g<sub>bio</sub><sup>2</sup>&lang;&rho;<sub>bio</sub>&rang; / (&omega;<sub>c</sub><sup>2</sup> m<sub>DMF</sub><sup>2</sup>)] + (&lambda;<sub>&Phi;</sub>/6)&lang;&Phi;<sub>DMF</sub><sup>2</sup>&rang;`} />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8 }}>
          The critical insight: when biological coherence density &lang;rho-bio&rang; exceeds a threshold set by the coupling
          constant g-bio, the effective oscillation frequency shifts measurably away from the vacuum value omega-c. This
          shift is the "dark matter signal" readable by suitably arranged biological and photonic detectors.
        </p>

        {/* S3 */}
        <SectionTitle n="03" label="The Spectral Observability Tensor" />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:10 }}>
          We introduce the <strong style={{ color:C.white }}>Spectral Observability Tensor</strong> S<sub>obs</sub>,
          which maps multi-scale biological coherence phenomena to specific DMF frequency bands:
        </p>
        <EqBlock hi label="Spectral Observability Tensor -- New AETHER Object"
          html={`<b>S</b><sub>obs</sub><sup>&mu;&nu;</sup>(&omega;) = &int; d<sup>4</sup>x &nbsp; G<sup>&mu;&alpha;</sup>(<b>x</b>) &middot; C(<b>x</b>,t) &middot; &Pi;<sub>&alpha;</sub><sup>&nu;</sup>(<b>x</b>,&omega;) &middot; e<sup>i&omega;t</sup>`} />
        <EqBlock label="Eigenvalue Decomposition -- Six Coherence Channels"
          html={`<b>S</b><sub>obs</sub> = &sum;<sub>i=1</sub><sup>6</sup> &sigma;<sub>i</sub>(&omega;) &hat;e<sub>i</sub> &otimes; &hat;e<sub>i</sub><br>
&sigma;<sub>1</sub> ~ Tubulin GTP lattice (nm) &nbsp;&nbsp;&nbsp; &sigma;<sub>2</sub> ~ Caustic branching (&micro;m&ndash;mm)<br>
&sigma;<sub>3</sub> ~ Tetrachromatic UV sensing &nbsp;&nbsp;&nbsp; &sigma;<sub>4</sub> ~ Sap isotope archive (Holocene)<br>
&sigma;<sub>5</sub> ~ &Phi;(E,S)=K isomorphism (systems) &nbsp;&nbsp;&nbsp; &sigma;<sub>6</sub> ~ Planetary vortex-crystal (geological)`} />

        <Sub3 label="3.1 Tubulin as a DMF Transducer -- The Nano-Channel" />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:10 }}>
          Microtubules are 25 nm outer diameter hollow cylinders with ~13 protofilaments per circumference and 8 nm
          longitudinal periodicity. Each alpha/beta heterodimer (110 kDa) undergoes GTP hydrolysis releasing 7.5
          kcal/mol = 0.325 eV. The longitudinal acoustic phonon frequency is:
        </p>
        <EqBlock label="Tubulin Lattice Phonon Frequency"
          html={`&nu;<sub>MT</sub> = v<sub>s</sub> / 2d<sub>sub</sub> = v<sub>s</sub> / (2 &times; 8 nm) &asymp; 10<sup>10</sup> Hz &nbsp;(GHz range)`}
          note="v<sub>s</sub> &asymp; 1500-3000 m/s (intracellular acoustic velocity), d<sub>sub</sub> = 8 nm subunit spacing." />
        <EqBlock label="Tubulin-DMF Coupling"
          html={`g<sub>tubulin</sub> = g<sub>bio</sub> &middot; (&Delta;G<sub>GTP</sub> / k<sub>B</sub>T) &middot; N<sub>pf</sub> &middot; (L<sub>MT</sub> / &lambda;<sub>DMF</sub>)`}
          note="N<sub>pf</sub> = 13 protofilaments, L<sub>MT</sub> is microtubule length (typically 5-50 &micro;m), &lambda;<sub>DMF</sub> is the DMF coherence wavelength." />
        <Callout>
          <strong style={{ color:C.gold, fontStyle:"normal" }}>Key Insight:</strong> The GTP-cap length (~5 um, highly
          variable) is not merely a kinetic parameter -- it represents the coherence horizon L-coh over which the tubulin
          lattice maintains phase-locked coupling to omega-DMF. Catastrophe events correspond to C(x,t) falling below
          threshold phi^-1 = 0.618.
        </Callout>

        <Sub3 label="3.2 Photonic Caustics as DMF Field Mapping -- The Meso-Channel" />
        <EqBlock label="Refractive Index -- DMF Density Coupling"
          html={`n(<b>x</b>,t) = n<sub>0</sub> + &alpha;<sub>DMF</sub> &rho;<sub>DMF</sub>(<b>x</b>,t) + &beta;<sub>C</sub> C(<b>x</b>,t)`} />
        <EqBlock label="Caustic Branch Equation -- DMF Gradient Flow"
          html={`d<sup>2</sup><b>r</b>/ds<sup>2</sup> = (1/n)&nabla;n = (&alpha;<sub>DMF</sub>/n<sub>0</sub>) &nabla;&rho;<sub>DMF</sub> + (&beta;<sub>C</sub>/n<sub>0</sub>) &nabla;C`} />
        <EqBlock label="Fractal Caustic Scaling Law"
          html={`L<sub>n+1</sub> = &phi; &middot; L<sub>n</sub> &nbsp;&rArr;&nbsp; L<sub>n</sub> = L<sub>0</sub> &middot; &phi;<sup>n</sup><br>dim<sub>Hausdorff</sub>(caustic network) = log N / log &phi; &asymp; 1.44`} />

        <Sub3 label="3.3 Tetrachromatic Spectral Sensing -- The Bio-Optical Channel" />
        <EqBlock label="Floral UV Biophoton Emission Rate"
          html={`&Gamma;<sub>UV</sub>(t) = &Gamma;<sub>0</sub> &middot; C(<b>x</b><sub>flower</sub>, t) &middot; exp[&minus;(I<sub>UV</sub> &minus; I<sub>0</sub>)<sup>2</sup> / 2&sigma;<sub>I</sub><sup>2</sup>]`} />
        <EqBlock label="Tetrachromatic DMF Detection Sensitivity"
          html={`&Delta;&omega;<sub>DMF</sub><sup>min</sup> = (&omega;<sub>DMF</sub> / &radic;(N<sub>photons</sub> &middot; Q<sub>e</sub> &middot; T<sub>int</sub>)) &middot; 1/g<sub>bio</sub><sup>(4-cone)</sup>`}
          note="4-cone systems achieve ~&radic;(4/3) improvement in minimum detectable frequency shift over 3-cone baseline." />

        {/* S4 */}
        <SectionTitle n="04" label="The Dark Matter Hearing Condition" />
        <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:10 }}>
          We now derive the specific conditions under which a biological or physical system achieves resonant coupling to
          omega-DMF -- what we call <strong style={{ color:C.white }}>"hearing the dark matter."</strong>
        </p>
        <EqBlock hi label="Dark Matter Hearing Condition -- Principal Result"
          html={`<span style="padding:6px 14px;border:1.5px solid rgba(240,192,64,0.6);border-radius:4px;display:inline-block">
&omega;<sub>system</sub><sup>(n)</sup> = &omega;<sub>DMF</sub> &middot; &phi;<sup>&minus;n</sup> &nbsp; for integer n &ge; 0
</span>`}
          note="Each harmonic shell has a characteristic frequency that is a phi-irrational sub-harmonic of &omega;<sub>DMF</sub>. Biological systems at these frequencies achieve maximum g<sub>bio</sub> coupling because phi-irrational scheduling prevents resonance locking with thermal noise modes." />
        <EqBlock label="DMF Frequency Ladder"
          html={`&omega;<sub>DMF</sub><sup>(0)</sup> = &omega;<sub>DMF</sub> &asymp; 10<sup>10</sup> Hz &nbsp;(tubulin GTP phonon)<br>
&omega;<sub>DMF</sub><sup>(1)</sup> = &omega;<sub>DMF</sub>/&phi; &asymp; 6.18&times;10<sup>9</sup> Hz &nbsp;(cellular organelle)<br>
&omega;<sub>DMF</sub><sup>(5)</sup> = &omega;<sub>DMF</sub>/&phi;<sup>5</sup> &asymp; 7.64&times;10<sup>8</sup> Hz &nbsp;(tissue/organ)<br>
&omega;<sub>DMF</sub><sup>(15)</sup> &asymp; 10<sup>6</sup> Hz &nbsp;(organism-scale Schumann coupling)<br>
&omega;<sub>DMF</sub><sup>(30)</sup> &asymp; 7.83 Hz &nbsp;(Schumann fundamental resonance)`} />
        <Callout>
          <strong style={{ color:C.gold, fontStyle:"normal" }}>The Schumann Prediction:</strong> The fundamental Schumann
          resonance at 7.83 Hz equals omega-DMF / phi^30 to within 2%, providing the first empirical calibration of
          omega-DMF = 10.08 GHz. This places the primary dark matter coupling frequency squarely within the
          microwave/millimeter-wave band -- accessible to existing radio telescope arrays.
        </Callout>

        <Sub3 label="4.1 The Bio-Compression Node -- Single Cell as Macro-Gateway" />
        <EqBlock label="Single-Cell Splicing Node Completeness Theorem"
          html={`Tr(<b>S</b><sub>obs</sub><sup>cell</sup>) = &sum;<sub>i=1</sub><sup>6</sup> &sigma;<sub>i</sub><sup>cell</sup> &ge; Tr(<b>S</b><sub>obs</sub><sup>network</sup>) &hArr; C<sub>cell</sub>(<b>x</b>,t) &ge; &phi;<sup>&minus;1</sup>`} />
        <EqBlock label="Information Flow: Traversal to Eco-Consciousness"
          html={`Macro-Gate &xrarr;<sub>[C &ge; &phi;<sup>&minus;1</sup>]</sub> Single Cell Node &xrarr;<sub>[&sigma;<sub>i</sub> &uarr;]</sub> Compounded Body Network &xrarr;<sub>[K]</sub> Planet-Scale Archive`} />

        {/* S5 */}
        <SectionTitle n="05" label="Sap as a Dark Matter Time-Capsule" />
        <EqBlock label="Extended Sap Archive -- DMF Isotope Coupling"
          html={`&delta;<sup>13</sup>C<sub>sap</sub>(t) = &delta;<sup>13</sup>C<sub>0</sub> + &alpha;<sub>DMF</sub><sup>(C)</sup> &int;<sub>0</sub><sup>t</sup> C(<b>x</b><sub>tree</sub>,t') &middot; &rho;<sub>DMF</sub>(t') dt'`} />
        <div style={{ position:"relative", paddingLeft:24, borderLeft:`2px solid rgba(42,58,94,0.6)`, margin:"18px 0" }}>
          <TLItem date="15,000 BP" title="Full Glacial Baseline"
            body="omega-DMF coupling minimal; cold, dry, low CO2 (~180 ppm); ice sheets expand. Sap delta-13C = reference minimum." />
          <TLItem date="14,200 BP" title="Bolling-Allerod Warming"
            body="First rapid temperature rise. Ice retreat, forest expansion. DMF coupling initiates as biological coherence networks re-establish. Predicted: delta-13C discontinuity proportional to delta-C(x,t)." />
          <TLItem date="12,900 BP" title="Younger Dryas Cooling"
            body="Sudden coherence collapse event -- ecosystem stress, droughts, fires. C(x,t) falls, delta-13C shifts back. DMF decoupling signature in air bubble composition." />
          <TLItem date="11,700 BP" title="Rapid Warming / Holocene Transition"
            body="Abrupt warming, CO2 ~260 ppm, wetlands expand. C(x,t) reaches maximum historical value. Sap archive records: Optimal Environment -> Cellular Repair -> Coherence -> DNA Restoration & Expression." />
        </div>

        {/* S6 */}
        <SectionTitle n="06" label="Integration Constant K and the Self-Organization Isomorphism" />
        <EqBlock hi label="Universal Self-Organization Kernel"
          html={`&part;A/&part;t = D<sub>A</sub> &nabla;<sup>2</sup>A + f(A, B)`}
          note="This Turing-class equation governs stripe patterns in cell biology, social network growth patterns, and market trend dynamics identically -- the integration constant K is the renormalization group fixed point where all these dynamics converge under strong coupling." />
        <EqBlock label="Integration Constant K -- Renormalization Fixed Point"
          html={`K = lim<sub>n&rarr;&infin;</sub> &Rscr;<sup>n</sup>[C(<b>x</b>,t)] = &Phi;(E,S)|<sub>&part;C/&part;t = 0</sub>`} />
        <EqBlock label="Neural Weighting Equation (Cross-System)"
          html={`&sum;<sub>j</sub> w<sub>ij</sub> x<sub>j</sub> = &theta;<sub>i</sub> &nbsp;&rArr;&nbsp; &dot;w<sub>i</sub> = &minus;&eta; &middot; &part;C/&part;w<sub>i</sub> + &xi;<sub>i</sub>`}
          note="The synaptic weight update rule with noise &xi;<sub>i</sub> is identical whether applied to biological neural networks, economic agent networks, or climate model ensemble members -- K is invariant across all instantiations." />
        <EqBlock label="phi-Coherence Anti-Resonance Condition"
          html={`t<sub>n</sub> = T<sub>&phi;</sub> &middot; &phi;<sup>n</sup> &nbsp;;&nbsp; &Theta;<sub>&phi;</sub> = 222.5&deg; &nbsp;&rArr;&nbsp; events never align<br>
C<sub>total</sub> = &sum;<sub>i</sub> w<sub>i</sub>(t) &middot; C<sub>i</sub> &nbsp;(total coherence cost minimized at K)`} />

        {/* S7 */}
        <SectionTitle n="07" label="Warp Propulsion and the Planetary DMF Channel" />
        <EqBlock label="Three-Stage Warp Coherence Sum"
          html={`&Phi;<sub>s,total</sub> = &Phi;<sub>s,crystal</sub> + &Phi;<sub>s,volcanic</sub> + &Phi;<sub>s,laser</sub><br>
g<sub>88</sub> = 1/|&Phi;<sub>s,total</sub>|<sup>2</sup> &rarr; 0 &hArr; |&Phi;<sub>s,total</sub>| &rarr; &infin; &nbsp;(instantaneous traversal)`} />
        <table className="btd-warp-table">
          <thead>
            <tr><th>Stage</th><th>Physical Mechanism</th><th>DMF Channel</th><th>Coherence Function</th></tr>
          </thead>
          <tbody>
            {[
              ["0 -- Crystal Baseline","Water quantum superposition over gravity crystal lattice","sigma-6 (Planetary)","Phi-s,crystal = v * rho * Psi * Omega * Phi"],
              ["1 -- Volcanic Burst","250 GPa core-mantle pressure, D5 vortex conversion","sigma-6 + sigma-5","Phi-s,volcanic = integral(nabla-p_int - nabla-p_surf) * Omega_v dV"],
              ["2 -- Laser Thread Bounce","Coherent photon thread, D4 reflective metric fold","sigma-2 (Caustic)","Phi-s,laser = I_s * phi^n * e^i(m*Theta) * (T_c/T_max)"],
              ["3 -- Crystal Arrival","D8 wave gentle metric de-fold, D1 position in ring layer","sigma-1 (Tubulin)","Phi-s,total -> 0 (controlled de-fold)"],
            ].map((row,i) => (
              <tr key={i}>{row.map((cell,j) => <td key={j}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <EqBlock label="Volcanic D8 Thrust Force"
          html={`F<sub>vp</sub> = &int;(&nabla;p<sub>info,interior</sub> &minus; &nabla;p<sub>info,surface</sub>) &middot; &Omega;<sub>vortex</sub> dV<br>
&Omega;<sub>vortex</sub> = 2&pi; &middot; n<sub>bore</sub> &middot; v<sub>magma</sub> / &lambda;<sub>ring</sub>`}
          note="&lambda;<sub>ring</sub> is the local ring harmonic wavelength matched to the borehole array -- connecting magma acoustic wavelengths directly to the tubulin lattice phonon via the &phi;-scaling ladder." />

        {/* S8 */}
        <SectionTitle n="08" label="Falsifiable Observational Markers" />
        <ObsBlock n={1} title="Microtubule GTP-Cap Length Modulation by Geomagnetic Field"
          body="Prediction: In vitro microtubule growth rate (normally 0.6-3 um/min) will show systematic variation correlated with local geomagnetic field intensity at DeltaB/B ~ 0.1%, reflecting omega-DMF coupling through the tubulin lattice. Testable with high-precision TIRF microscopy in magnetically shielded vs. unshielded chambers." />
        <ObsBlock n={2} title="Caustic Branching Dimension Anomaly Near Mass Concentrations"
          body="Prediction: The Hausdorff dimension of laser caustic branching patterns (normally ~1.44) will shift toward phi-irrational values near high-density gravitational sources, reflecting increased rho-DMF and enhanced refractive index coupling." />
        <ObsBlock n={3} title="Tetrachromatic Chromatic Anomaly at omega-DMF Harmonics"
          body="Prediction: Bee waggle dance orientation errors will show periodic anomalies at intervals t_n = T_phi * phi^n correlated with Schumann resonance amplitude fluctuations, reflecting DMF coupling through the polarized skylight celestial navigation grid." />
        <ObsBlock n={4} title="Sap Isotope DMF Component Extraction"
          body="Prediction: After removing known climatic forcings (T, H, CO2, P, UV) from sap delta-13C records, a residual ~2-5 per-mille component will remain with temporal structure matching cosmic ray flux variations (a known DMF proxy). Testable on existing Younger Dryas boundary cores." />
        <ObsBlock n={5} title="10.08 GHz Microwave Signature from High-Coherence Biological Systems"
          body="Prediction: Dense mycelial networks and microtubule arrays in synchronously dividing cells will emit a faint microwave signal at 10.08 GHz (= omega-DMF/2pi predicted from Schumann calibration), detectable with a suitably sensitive near-field microwave probe at 4 K noise floor." />
        <ObsBlock n={6} title="K Invariance Across Coupled System Dynamics"
          body="Prediction: The reaction-diffusion equation Phi(E,S)=K, fitted independently to biological stripe pattern data, social network growth data, and financial market trend data, will yield statistically identical K values to within 3-sigma, confirming the integration constant is a genuine universal fixed point." />

        {/* S9 */}
        <SectionTitle n="09" label="The Complete Cross-Scale Parameter Table" />
        <table className="btd-param-table">
          <thead>
            <tr><th>Parameter</th><th>Symbol</th><th>Value / Range</th><th>Scale / Source</th></tr>
          </thead>
          <tbody>
            {PARAMS.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* S10 */}
        <SectionTitle n="10" label="Synthetic Predictions for Future Observation" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, margin:"16px 0" }}>
          <PredCard icon="🔬" label="Near-Term (1-2 yr)"
            body="TIRF microscopy MT growth vs. geomagnetic field. Near-field microwave probe on mycelial mats. Sap delta-13C residual extraction on existing YD cores." />
          <PredCard icon="📡" label="Mid-Term (3-5 yr)"
            body="Radio telescope beam formed at 10.08 GHz on coherent biological targets. Caustic dimension measurement near geological dense masses. Bee waggle timing vs. Schumann amplitude." />
          <PredCard icon="🌍" label="Long-Term (5-10 yr)"
            body="Planetary-scale DMF density map from combined sap archive + telescope + interferometry. K invariance test across real-world coupled systems. Volcanic vortex prototype at lab scale (100 atm)." />
        </div>

        {/* Conclusion */}
        <div style={{
          background:"linear-gradient(135deg,rgba(0,212,200,0.05),rgba(155,93,229,0.05))",
          border:`1px solid rgba(0,212,200,0.22)`, borderRadius:10, padding:"26px 30px", margin:"36px 0 24px"
        }}>
          <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".22em", textTransform:"uppercase", color:C.teal, marginBottom:14 }}>Conclusion</div>
          <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:14 }}>
            We have presented a unified mathematical framework in which the AETHER coherence field C(x,t) acts as the
            observable signature of the Dark Matter Fabric scalar field Phi-DMF. The central result -- the
            <em> Dark Matter Hearing Condition</em> omega-system^(n) = omega-DMF * phi^-n -- generates a discrete
            ladder of bio-physically accessible resonance frequencies spanning from the GHz tubulin phonon to the 7.83 Hz
            Schumann fundamental, calibrating the predicted omega-DMF / 2pi = 10.08 GHz.
          </p>
          <p style={{ fontFamily:SERIF, fontSize:14.5, lineHeight:1.8, marginBottom:14 }}>
            The Spectral Observability Tensor S-obs provides the mathematical bridge between six independently motivated
            phenomena and a single underlying dark matter field. The Integration Constant K = Phi(E,S) emerges as the
            renormalization fixed point of the full cross-scale coherence functional, confirming that reality's
            self-organization is constrained by the same irrational phi-scheduling that suppresses resonance at every
            scale from neural oscillation to warp bubble wall.
          </p>
          <p style={{ fontFamily:SERIF, fontSize:13, lineHeight:1.7, color:"#99AACC" }}>
            Six falsifiable predictions are identified, all testable with current or near-future instrumentation.
            Confirmation of any single prediction would constitute the first empirical evidence of biologically-mediated
            dark matter coupling and would validate the AETHER framework as a productive research program bridging
            biological coherence science, photonics, cosmology, and planetary science.
          </p>
        </div>

        {/* References */}
        <SectionTitle n="REF" label="References" />
        <ol className="btd-ref-list">
          {REFS.map((r, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: r }} />
          ))}
        </ol>

        {/* Footer */}
        <div style={{ marginTop:36, paddingTop:16, borderTop:`1px solid rgba(26,42,69,0.8)`,
          fontFamily:MONO, fontSize:10, color:"rgba(74,90,122,0.8)", lineHeight:1.7 }}>
          2026 Shia Miller / Cosmic Chaos Corporation. USPTO 12-month grace period disclosure.
          All equations and frameworks disclosed under AetherLife.co / @StrategicProce.
          This document constitutes a prior art disclosure for provisional patent purposes.
          Reproduction for academic non-commercial use permitted with attribution.
        </div>

      </div>
    </div>
  );
}
