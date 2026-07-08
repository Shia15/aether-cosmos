import { useEffect, useRef } from "react";
import imgProducts from "@assets/870b94f0-ef64-47ba-b130-d8c26ac96ff3_1777221871725.png";
import imgTokenSystem from "@assets/5f816d5c-e98d-4498-93e4-a3be9087c8d3_1777221875021.png";
import imgRobotSmall from "@assets/ChatGPT_Image_Apr_26,_2026,_12_54_37_PM_1777222481541.png";
import imgRobotMedium from "@assets/ChatGPT_Image_Apr_26,_2026,_12_54_46_PM_1777222488120.png";
import imgRobotLarge from "@assets/ChatGPT_Image_Apr_26,_2026,_12_54_53_PM_1777222497388.png";

const B = {
  bg: "#0a0c16", panel: "#11141f", ink: "#eaf0ff",
  text: "rgba(220,228,250,0.78)", muted: "rgba(220,228,250,0.45)",
  border: "rgba(150,180,230,0.14)",
  rose: "#f59ec3", iridescent: "#b48cff", green: "#7be59f", amber: "#f0a23a",
};

const PRODUCT_TILES = [
  { tile: "Drone · planetary scan", reading: "Aerial sensor mesh wrapped in a constellation overlay — the pitch is real-time field telemetry into AETHER's lattice." },
  { tile: "Cyborg · embodied agent", reading: "Humanoid surface for an AETHER agent. The render is a UX prop, not a robotics spec." },
  { tile: "Holographic AR / device pair", reading: "Phone × laptop with shared holographic UI — the 'token' visual layer of the concept stack." },
  { tile: "Smart house", reading: "Domestic sensor net feeding the same coherence pipeline used elsewhere on the site." },
  { tile: "Security sentinel", reading: "Stationary turret-style sensor rig — situational awareness as a service." },
  { tile: "Holographic woman", reading: "Generative human-form interface. AETHER persona visualization." },
  { tile: "Brain · neural braid", reading: "Toroidal neural visualization — companion to /neuroplasticity and /cerebral-organoids." },
  { tile: "Resonance canopy", reading: "Volumetric particle field rendered as a planetary coherence shell." },
  { tile: "Dashboard panels", reading: "Multi-screen control surface — the operator's view on the resonance stack." },
];

const ROBOT_SCALES = [
  { label: "Small bot · 0.2 m hover", img: imgRobotSmall, accent: B.rose,
    specs: ["τ ≈ 0.07 N·m  (small servo)", "P ≈ 22 W hover", "7.4 Wh ≈ 20 min flight", "0.24 m locker height"],
    alt: "Iridescent rose-pink iris-door glass locker on the left, with a small humanoid quad-rotor robot inside on a charging dock with handprint scanner. On the right, the same small robot hovering with quad rotors and servo claw grippers, labelled 0.2 m. Spec strip below shows joint torque 0.07 N·m, hover power 22 W, battery life 7.4 Wh ≈ 20 minutes, locker height 0.24 m, and a Power-vs-Mass-for-Hovering chart titled 'Keep Small for Efficiency'." },
  { label: "Medium bot · 0.5 m hover", img: imgRobotMedium, accent: B.iridescent,
    specs: ["τ ≈ 1.4 N·m  (2 g arm, I ≈ 0.042 kg·m²)", "P ≈ 87 W hover (m = 2 kg, A = 0.4 m²)", "13.5 V · 5000 mAh ≈ 67.5 Wh", "Max flight ≈ 7 min · swap packs", "0.6 m locker height"],
    alt: "Iridescent purple-violet glass locker on the left, 0.6 m tall, with iris-style doors. On the right, a medium humanoid quad-rotor robot in flight with masked-buzz-noise rotors and ducted fans. Spec strip below shows joint torque 1.4 N·m, flight efficiency 87 W hover, battery 13.5 V · 5000 mAh, ≈ 67.5 Wh, max flight ≈ 7 min, scale comparison vs a 6 ft human, and a Power-vs-Mass chart marking 87 W." },
  { label: "Large bot · 1.1 m hover", img: imgRobotLarge, accent: B.green,
    specs: ["τ ≈ 5 N·m  (4 kg arm, I ≈ 0.167 kg·m²)", "P ≈ 160 W hover (m = 5 kg, A = 0.55 m²)", "21.6 V · 10 000 mAh ≈ 216 Wh", "Max flight ≈ 7 min · 2 packs", "1.2 m locker height"],
    alt: "Iridescent emerald-green glass locker on the left, 1.2 m tall, with iris-style doors and an 800 W boost charge label. On the right, a large humanoid quad-rotor robot in flight with bioenchanical hard-noise actuator rotors. Spec strip below shows joint torque 5 N·m, flight efficiency 160 W hover, battery 21.6 V · 10 000 mAh, ≈ 216 Wh, scale comparison vs a 6 ft human, and a Power-vs-Mass chart marking 160 W." },
];

function ConceptSystemsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const concepts=[
      { label:"TOKENS", col:"#2ef0d8", x:W*0.15, y:H*0.5 },
      { label:"PRODUCTS", col:"#9966ff", x:W*0.32, y:H*0.35 },
      { label:"ROBOTS", col:"#c9a84c", x:W*0.5, y:H*0.5 },
      { label:"SYSTEMS", col:"#44aaff", x:W*0.68, y:H*0.65 },
      { label:"NETWORK", col:"#44cc77", x:W*0.85, y:H*0.5 },
    ];
    const links=[[0,1],[1,2],[2,3],[3,4],[0,4],[1,3]];
    const flows: {i:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.2)"; ctx.fillRect(0,0,W,H);
      tick++;
      if(tick%18===0&&flows.length<10) flows.push({ i:Math.floor(Math.random()*links.length), t:0 });
      links.forEach(([a,b])=>{
        ctx.beginPath(); ctx.moveTo(concepts[a].x,concepts[a].y); ctx.lineTo(concepts[b].x,concepts[b].y);
        ctx.strokeStyle="rgba(46,240,216,0.07)"; ctx.lineWidth=1; ctx.stroke();
      });
      for(let i=flows.length-1;i>=0;i--){
        const f=flows[i]; f.t+=0.028;
        const [a,b]=links[f.i];
        const x=concepts[a].x+(concepts[b].x-concepts[a].x)*f.t;
        const y=concepts[a].y+(concepts[b].y-concepts[a].y)*f.t;
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=concepts[a].col; ctx.shadowColor=concepts[a].col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(f.t>=1) flows.splice(i,1);
      }
      concepts.forEach(c=>{
        ctx.beginPath(); ctx.arc(c.x,c.y,12,0,Math.PI*2);
        ctx.fillStyle=c.col; ctx.shadowColor=c.col; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=c.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(c.label,c.x,c.y+22);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CONCEPT SYSTEMS · TOKENS · PRODUCTS · ROBOTS · SYSTEMS · NETWORK · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function ConceptSystemsView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes cs-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.cs-fade{animation:cs-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.cs-fade{animation:none}}`}</style>
      <div className="max-w-6xl mx-auto px-7 py-10 space-y-12">
        <header className="cs-fade space-y-3" data-testid="cs-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.iridescent }}>
            Concept Systems · ROOTEX × AETHER · Token System · Iridescent Lockers
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>
            Concept hardware · the visual brief.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            A small showroom of conceptual hardware that surrounds the AETHER core: a nine-tile product field
            (drones, cyborg agents, holographic devices, smart-home, sensors, persona, neural stack), the AETHER
            Token System reference dashboard, and three sizing studies of the iridescent-locker quad-rotor robot
            (small / medium / large). These are concept renders held as visual targets, not deployed products.
          </p>
        </header>

        {/* SECTION 01 — Product field */}
        <section className="cs-fade space-y-5" style={{ animationDelay: "120ms" }} data-testid="cs-section-products">
          <SectionHead num="01" label="ROOTEX × AETHER · the product field." accent={B.iridescent} />
          <ImgFig src={imgProducts} caption="Conceptual products utilizing ROOTEX × AETHER systems · 9-tile board"
            alt="A 3×3 board of conceptual hardware renders on a deep-navy starfield. Tiles include a quad-rotor drone over a planetary constellation map, a humanoid cyborg agent in cobalt-blue, a holographic phone-and-laptop pair, a smart house with floating UI panels, a stationary security sensor turret, a glowing humanoid woman silhouette wired into a control panel array, a brain rendered as a luminous toroidal braid, a planetary resonance canopy of orange-and-blue particles, and a multi-screen control dashboard. Caption strip across the bottom: CONCEPTUAL PRODUCTS UTILIZING ROOTEX × AETHER SYSTEMS." />
          <div className="grid gap-3 md:grid-cols-3">
            {PRODUCT_TILES.map(p => (
              <article key={p.tile} className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[12.5px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{p.tile}</h3>
                <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: B.text }}>{p.reading}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 02 — Token System */}
        <section className="cs-fade space-y-5" style={{ animationDelay: "200ms" }} data-testid="cs-section-tokens">
          <SectionHead num="02" label="AETHER Token System · the symbol shelf." accent={B.amber} />
          <ImgFig src={imgTokenSystem} caption="AETHER Token System · symbolic elements · navigation threads · DevToken index"
            alt="Wide composite render. Left: a luminous green-and-blue toroidal data visualization above a sedan car with a glowing orange resonance ring beneath it. Centre: a car interior view through the windshield, with a heads-up display of constellation nodes and a glowing central warp-tunnel point. Right: a dark UI dashboard titled 'AETHER Icon Token System' with sections System Core, Symbolic Elements, Navigation + Threads, Symbolic Movements, Element States, Navigation + Threads, and DevToken Index, each holding rows of small glowing icon swatches in violet, amber, and teal." />
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["System Core", "Module-level icons (Engine, Pipeline, Lattice). Same vocabulary the sidebar already uses."],
              ["Symbolic Elements", "Fire, water, geometry, orbit — the iconographic primitives the manifesto cards draw from."],
              ["Navigation + Threads", "Routing affordances: Angel Hours, frequency tags, bridge tiles."],
              ["Symbolic Movements", "Verbs: emerge, settle, fold, ringdown — the AETHER Motion Doctrine vocabulary."],
              ["Element States", "Status badges: idle, activated, ringdown, baseline — wired into the motion-doctrine page."],
              ["DevToken Index", "Engineering-side handles for the same symbols (engine-core-engine, flow-* identifiers)."],
            ].map(([t, d]) => (
              <article key={t} className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[12.5px]" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{t}</h3>
                <p className="text-[11.5px] leading-relaxed mt-1" style={{ color: B.text }}>{d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 03 — Iridescent Locker robots */}
        <section className="cs-fade space-y-5" style={{ animationDelay: "280ms" }} data-testid="cs-section-robots">
          <SectionHead num="03" label="Iridescent locker · prototype flying robots · scale study." accent={B.rose} />
          <p className="text-[13px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Three concept renders of the same iridescent-glass-locker / quad-rotor robot pairing at different
            scales. The renders carry hover-power and battery-life numbers as a sketch — read them as a
            sizing study, not a published spec sheet. The figure of merit visible in all three is the
            Power-vs-Mass curve: hover power scales roughly with mass^1.5, so keeping the platform small is
            what buys flight time.
          </p>
          <div className="space-y-6">
            {ROBOT_SCALES.map(r => (
              <article key={r.label} className="rounded-md overflow-hidden" style={{ border: `1px solid ${r.accent}44`, background: B.panel }}>
                <ImgFig src={r.img} caption={r.label} alt={r.alt} />
                <div className="px-5 py-4">
                  <div className="text-[10.5px] uppercase tracking-[0.22em] mb-2" style={{ color: r.accent }}>{r.label}</div>
                  <ul className="grid gap-1 md:grid-cols-2">
                    {r.specs.map(s => (
                      <li key={s} className="text-[12px] flex gap-2" style={{ color: B.text, fontFamily: "ui-monospace, monospace" }}>
                        <span style={{ color: r.accent }}>·</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
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
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, caption, alt }: { src: string; caption: string; alt: string }) {
  return (
    <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} loading="lazy" decoding="async" className="block w-full h-auto" alt={alt} />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}
