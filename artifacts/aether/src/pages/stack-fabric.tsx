import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgStack1 from "@assets/ChatGPT_Image_Apr_26,_2026,_01_34_55_PM_1777224898821.png";
import imgStack2 from "@assets/ChatGPT_Image_Apr_26,_2026,_01_32_15_PM_1777224905065.png";
import imgGACA  from "@assets/ChatGPT_Image_Apr_26,_2026,_01_38_08_PM_1777225090313.png";

const B = {
  bg:        "#06080f",
  panel:     "#0c1120",
  panelLite: "#121830",
  ink:       "#eef2ff",
  text:      "rgba(220,226,255,0.78)",
  muted:     "rgba(220,226,255,0.46)",
  border:    "rgba(180,196,255,0.14)",
  cyan:      "#7be4ea",
  amber:     "#f5b942",
  gold:      "#e9b94e",
  green:     "#7be59f",
  violet:    "#b48cff",
  blue:      "#7cc8ff",
  rose:      "#f59ec3",
};

function H({ num, label, accent = B.cyan }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>Section {num}</div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="rounded-md overflow-hidden mt-2" style={{ border: `1px solid ${B.border}`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>{caption}</figcaption>
    </figure>
  );
}

function Chip({ c, l }: { c: string; l: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color: c, borderColor: c + "55", background: B.panelLite, fontFamily: "ui-monospace, monospace" }}>{l}</span>
  );
}

function Card({ accent, eyebrow, title, body }:
  { accent: string; eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md p-4 border h-full" style={{ borderColor: B.border, background: B.panel }}>
      <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
      <div className="text-[15px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: B.text }}>{body}</div>
    </div>
  );
}

function Bridge({ to, eyebrow, title, body, accent }:
  { to: string; eyebrow: string; title: string; body: string; accent: string }) {
  return (
    <Link href={to}>
      <div className="rounded-md p-4 border h-full cursor-pointer transition-all hover:-translate-y-0.5"
           style={{ borderColor: B.border, background: B.panel }}
           data-testid={`bridge-${to.replace(/^\//, "")}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="text-[10px] uppercase tracking-[0.28em]"
               style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
          <ArrowUpRight className="w-3.5 h-3.5 mt-0.5" style={{ color: accent }} />
        </div>
        <div className="text-[15px] mt-1.5 mb-1.5" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{body}</div>
        <div className="text-[10.5px] mt-2 underline" style={{ color: accent, fontFamily: "ui-monospace, monospace" }}>{to}</div>
      </div>
    </Link>
  );
}

const HARVESTERS = [
  { c: B.gold,    l: "Solar Panels" },
  { c: B.amber,   l: "Vibration · Piezo" },
  { c: B.cyan,    l: "RF Energy" },
  { c: B.green,   l: "Supercap + Battery" },
  { c: B.violet,  l: "Power Mgmt · DVFS" },
];

const MESH = [
  { c: B.cyan,   l: "Wi-Fi 7" },
  { c: B.blue,   l: "UWB" },
  { c: B.violet, l: "Optical / CXL" },
  { c: B.gold,   l: "6G · sub-THz" },
  { c: B.green,  l: "Edge ↔ Cloud" },
];

const APPS = [
  { c: B.cyan,    l: "Edge AI" },
  { c: B.amber,   l: "Drones · Swarm" },
  { c: B.green,   l: "Robotics" },
  { c: B.gold,    l: "IoT Mesh" },
  { c: B.violet,  l: "Physics Sim" },
  { c: B.blue,    l: "Autonomous Vehicles" },
  { c: B.rose,    l: "Scientific Sim" },
];

function StackFabricCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    const LAYERS = [
      { label:"L5 · Application", color:"#b48cff", yFrac:0.10 },
      { label:"L4 · Transport",   color:"#7be4ea", yFrac:0.28 },
      { label:"L3 · Coherence",   color:"#e9b94e", yFrac:0.46 },
      { label:"L2 · Substrate",   color:"#7be59f", yFrac:0.64 },
      { label:"L1 · Physical",    color:"#7cc8ff", yFrac:0.82 },
    ];
    type Packet = { x:number; fromY:number; toY:number; color:string; speed:number; t:number };
    const packets: Packet[] = [];
    function spawnPacket() {
      const from = Math.floor(Math.random() * LAYERS.length);
      const to = from > 0 ? from - 1 : from + 1;
      packets.push({
        x: 90 + Math.random() * (W - 110),
        fromY: LAYERS[from].yFrac * H,
        toY: LAYERS[to].yFrac * H,
        color: LAYERS[from].color,
        speed: 0.015 + Math.random() * 0.025,
        t: 0,
      });
    }
    for (let i = 0; i < 8; i++) spawnPacket();
    let spawnTimer = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#06080f"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      LAYERS.forEach((l) => {
        const y = l.yFrac * H;
        const pulse = 0.12 + 0.08 * Math.sin(t * 0.03 + l.yFrac * 6);
        ctx.beginPath(); ctx.moveTo(85, y); ctx.lineTo(W - 4, y);
        ctx.strokeStyle = l.color + Math.round(pulse * 255).toString(16).padStart(2,"0");
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = l.color + "cc";
        ctx.font = "8px 'Space Mono', monospace";
        ctx.fillText(l.label, 4, y + 3);
      });
      spawnTimer++;
      if (spawnTimer > 28) { spawnPacket(); spawnTimer = 0; }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const y = p.fromY + (p.toY - p.fromY) * p.t;
        const grd = ctx.createRadialGradient(p.x, y, 0, p.x, y, 6);
        grd.addColorStop(0, p.color);
        grd.addColorStop(1, p.color + "00");
        ctx.beginPath(); ctx.arc(p.x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
      }
      ctx.fillStyle = "#7be4ea33";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("STACK FABRIC · L1–L5 PROTOCOL LAYERS · PACKET ROUTING", 90, H - 8);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function StackFabricHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const layers=6;
    const cols=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff","#44cc77"];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let l=0;l<layers;l++){
        const y=15+l*(H-20)/layers;
        const offset=20*Math.sin(t*0.02+l*0.6);
        ctx.beginPath();
        for(let x=0;x<=W;x+=6){
          const wy=y+offset*Math.sin(x*0.02+t*0.03+l);
          x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
        }
        ctx.strokeStyle=cols[l]+"55";ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=cols[l]+"08";
        ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("STACK FABRIC · LAYERED SYSTEMS · PROTOCOL MESH · COHERENT STACK · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function StackFabricPage() {
  return (
    <div className="min-h-screen w-full" style={{ background: B.bg }}>
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16" data-testid="stack-fabric-page">
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>STACK FABRIC · LAYERED SYSTEMS · PROTOCOL MESH · COHERENT STACK · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>6 layered wave stacks — the live AETHER stack fabric simulation.</p></div>
            <StackFabricHeaderCanvas />
          </div>
        </div>
        {/* HEADER */}
        <header className="mb-12">
          <div className="text-[10.5px] uppercase tracking-[0.36em]"
               style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
            Stackable Hybrid Computational Fabric · Self-Powered · Reconfigurable
          </div>
          <h1 className="mt-2 text-[40px] md:text-[52px] leading-[1.05]"
              style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            The Stack
          </h1>
          <div className="mt-2 text-[15px]" style={{ color: B.text, maxWidth: "62ch" }}>
            A vertical reservoir computer assembled from N stacked 64-node analog layers, each
            self-powered (Solar + Vibration + RF), each cooperatively coupled to the layers above and below
            through magnetic + optical + CXL links. The Hybrid AI SoC core (FPGA + DSP + ADC/DAC)
            digitises only what it must; the rest stays analog. Add a layer, the network reconfigures.
            Remove a layer, the network reconfigures. Total signal flow scales with N.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.cyan}   l="64 nodes / layer" />
            <Chip c={B.amber}  l="≤ 100 MHz analog" />
            <Chip c={B.gold}   l="Solar + Vibration + RF" />
            <Chip c={B.green}  l="Wi-Fi 7 / UWB / Optical / CXL" />
            <Chip c={B.violet} l="Magnetic propulsion loop" />
            <Chip c={B.blue}   l="Hybrid SoC · FPGA + DSP" />
          </div>

          <div style={{ marginTop:24 }}>
            <div style={{ display:"inline-block", background:"rgba(123,228,234,0.1)", border:"1px solid rgba(123,228,234,0.3)",
              borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
              color:B.cyan, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
              Live Simulation
            </div>
            <div style={{ background:B.panel, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.cyan}`,
              borderRadius:10, padding:20 }}>
              <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
                Stack Fabric · L1–L5 Protocol Layers · Packet Routing
              </h2>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
                Five horizontal protocol bands (L1 Physical → L5 Application). Glowing packets spawn and travel
                between adjacent layers — upward (data arriving) or downward (commands dispatching). Each layer
                pulses at its own phase. This is the moment-to-moment cross-layer handshake in the Stack Fabric.
              </p>
              <StackFabricCanvas />
            </div>
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.28em]"
                 style={{ color: B.gold, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              Top-down chain:{" "}
              <span style={{ color: B.gold, fontWeight: 600 }}>energy</span> (how each layer powers itself) →{" "}
              <span style={{ color: B.cyan, fontWeight: 600 }}>node</span> (what one 64-node layer is) →{" "}
              <span style={{ color: B.violet, fontWeight: 600 }}>SoC core</span> (analog ↔ digital handoff) →{" "}
              <span style={{ color: B.amber, fontWeight: 600 }}>inter-layer coupling</span> (the propulsion loop) →{" "}
              <span style={{ color: B.blue, fontWeight: 600 }}>mesh</span> (off-chip data) →{" "}
              <span style={{ color: B.green, fontWeight: 600 }}>reconfiguration</span> (add/remove layers) →{" "}
              <span style={{ color: B.rose, fontWeight: 600 }}>control wrapper</span> (GACA closed loop) →{" "}
              <span style={{ color: B.gold, fontWeight: 600 }}>applications</span> →{" "}
              <span style={{ color: B.muted, fontWeight: 600 }}>honest line</span>.
            </p>
          </div>
        </header>

        {/* SECTION 01 — STACK OVERVIEW */}
        <section className="mb-14" data-testid="section-stack">
          <H num="01" label="The Stack · Layer 1 → Layer N" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Each layer is a 64-node analog reservoir on a stackable 3D IC. Layers are not slaves to a master —
            they cooperate. The system is reservoir-style: input is projected into a high-dimensional dynamical
            state, the readout is light. Adding a layer adds ~64 new dynamical degrees of freedom and a
            new set of coupling edges. The fabric is, by construction, scalable to N.
          </p>
          <ImgFig
            src={imgStack2}
            alt="Holographic illustration of four stacked 64-node reservoir layers (gold, blue, magenta, green) sitting on a Hybrid AI SoC Core base. Energy harvesting (solar / RF / vibration) feeds in from the upper-left. Inter-layer cooperative processing (real-time sync, adaptive feedback, emergent dynamics, magnetic propulsion simulation loop) sits to the right. A wireless mesh (Wi-Fi 7 / UWB / Optical / 6G) and secure encrypted links route 1 Tbps+ of off-chip data. Applications fan out to drones, robotics, satellites, IoT mesh, autonomous vehicles, and scientific simulations."
            caption="Stackable Hybrid Analog–Digital Computational Fabric · Layer 1 → Layer N · 1 Tbps+ off-chip"
          />
        </section>

        {/* SECTION 02 — ENERGY HARVESTING */}
        <section className="mb-14" data-testid="section-energy">
          <H num="02" label="Energy · Self-Powered Layers" accent={B.gold} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Every layer harvests its own energy. Three sources, one regulator, one storage tier.
            No layer depends on a host PSU; the design intent is that the stack stays operational as
            long as any one of the three sources is delivering above the standby threshold.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {HARVESTERS.map((h) => <Chip key={h.l} {...h} />)}
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.gold} eyebrow="Source" title="Solar"
                  body="Surface-mounted PV on the top layer and on exposed sides. Sub-mW continuous in indoor light, ~100 mW peak outdoor per layer." />
            <Card accent={B.amber} eyebrow="Source" title="Vibration"
                  body="Piezo elements pick up structural and acoustic vibration. Ideal for moving platforms — drones, vehicles, machinery." />
            <Card accent={B.cyan} eyebrow="Source" title="RF Energy"
                  body="Ambient RF (Wi-Fi, cellular, broadcast) is rectified through a wideband rectenna. Provides standby power and bootstrap." />
          </div>
          <div className="mt-4 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <div className="text-[10px] uppercase tracking-[0.28em]"
                 style={{ color: B.violet, fontFamily: "Inter, sans-serif" }}>Power Management</div>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: B.text }}>
              Dynamic Voltage / Frequency Scaling (DVFS) at the SoC + a supercap front-end smooths the harvest.
              Long-tail storage falls back to a small Li-ion cell. The stack <em>never</em> brown-outs the analog
              reservoir — digital is throttled first.
            </p>
          </div>
        </section>

        {/* SECTION 03 — PER-LAYER NODE */}
        <section className="mb-14" data-testid="section-node">
          <H num="03" label="One Layer · 64 Nodes · Reconfigurable" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            One layer = 64 reconfigurable analog nodes plus on-chip parasitic control. The reservoir runs
            high-frequency (under 100 MHz) so that emergent dynamics dominate over digital clocking. Each node
            is addressable for connection topology but not for state — state is the network.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.cyan} eyebrow="Topology" title="Reconfigurable nodes"
                  body="Crossbar switches let any node couple to any other inside the layer. Coupling weights are analog (capacitive / resistive)." />
            <Card accent={B.amber} eyebrow="Frequency" title="< 100 MHz"
                  body="Below 100 MHz the parasitics are usable signal, not error. Above it they are noise. We work where parasitics are the compute." />
            <Card accent={B.violet} eyebrow="Control" title="On-chip parasitic control"
                  body="A digital fabric overlay tunes parasitic conductances per epoch. The reservoir is fixed at runtime; trained between." />
            <Card accent={B.gold} eyebrow="Form factor" title="Stackable 3D IC"
                  body="TSV-bonded layers, ≤ 1.2 mm pitch. Layers add zero floorplan, only height. The stack scales vertically until thermal limits." />
          </div>
        </section>

        {/* SECTION 04 — HYBRID AI SoC */}
        <section className="mb-14" data-testid="section-soc">
          <H num="04" label="Hybrid AI SoC · Analog ↔ Digital Handoff" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The base layer is a Hybrid AI SoC: an FPGA fabric for control + a DSP for digital pre/post-processing,
            joined to the analog stack through low-latency ADC / DAC banks. The SoC is the only place where the
            problem becomes binary; everything else is continuous.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.violet} eyebrow="Digital" title="FPGA / ASIC + AI Engine"
                  body="Programmable digital fabric for control flow, feature extraction, and the supervised readout. Real-time sync with the analog stack." />
            <Card accent={B.cyan} eyebrow="Co-processor" title="Analog DSP + ADC / DAC"
                  body="Tight ADC/DAC banks expose the reservoir state to the digital side at ≤ 100 MS/s. The DSP handles filtering and analog-domain pre-processing." />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip c={B.violet} l="FPGA" />
            <Chip c={B.amber}  l="DSP" />
            <Chip c={B.cyan}   l="ADC / DAC" />
            <Chip c={B.green}  l="AI Engine" />
            <Chip c={B.gold}   l="Real-Time Sync" />
            <Chip c={B.blue}   l="On-Device Learning" />
          </div>
        </section>

        {/* SECTION 05 — INTER-LAYER COOPERATIVE PROCESSING */}
        <section className="mb-14" data-testid="section-coupling">
          <H num="05" label="Inter-Layer Cooperative Processing" accent={B.amber} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Layers talk to each other along three axes: <span style={{ color: B.gold, fontWeight: 600 }}>magnetic coupling</span> (TSV
            inductors), <span style={{ color: B.violet, fontWeight: 600 }}>optical / CXL</span> (vertical waveguides),
            and a <span style={{ color: B.amber, fontWeight: 600 }}>programmable feedback / propulsion loop</span> that
            re-injects readout state into the stack as a control field. The propulsion loop is what makes
            cooperative processing emergent rather than sequential.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.gold}    eyebrow="Axis I"   title="Magnetic coupling"
                  body="TSV-formed micro-inductors carry analog magnetic state between layers. Lossy but instant — used for fast emergent feedback." />
            <Card accent={B.violet}  eyebrow="Axis II"  title="Optical / CXL bus"
                  body="Vertical waveguides + CXL.mem semantics carry coherent, high-bandwidth state between adjacent layers. Used for digital co-processing." />
            <Card accent={B.amber}   eyebrow="Axis III" title="Propulsion loop"
                  body="Programmable feedback re-injects layer-N readout into layer-1 input as a dynamic field. The loop is where emergent computation lives." />
          </div>
          <div className="mt-4 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panelLite }}>
            <div className="text-[10px] uppercase tracking-[0.28em]"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>Why "propulsion"</div>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: B.text }}>
              The loop literally pushes the stack's dynamical state forward through input space, the same way a
              jet thrust pushes a body forward through coordinate space. Static reservoirs sit; this one moves.
              Dynamic Field Simulation runs alongside in the SoC to predict the next instant before it arrives.
            </p>
          </div>
        </section>

        {/* SECTION 06 — WIRELESS MESH */}
        <section className="mb-14" data-testid="section-mesh">
          <H num="06" label="Wireless Mesh · Off-Chip Data Sync" accent={B.blue} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The stack is wireless-first. Five physical layers run in parallel, the SoC routes traffic by latency,
            bandwidth, and link availability. Total off-chip throughput targets 1 Tbps+ aggregate across the mesh.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {MESH.map((m) => <Chip key={m.l} {...m} />)}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.blue} eyebrow="Local" title="Wi-Fi 7 + UWB"
                  body="Short-range, sub-100 µs latency. Used for swarm coordination between adjacent stacks." />
            <Card accent={B.violet} eyebrow="Bulk" title="Optical + CXL"
                  body="High-bandwidth backhaul for state sync to neighbouring stacks or to a wired CXL fabric." />
            <Card accent={B.gold} eyebrow="Wide-area" title="6G · sub-THz"
                  body="Edge ↔ cloud uplink. Used for slow-train / fast-infer split deployments." />
            <Card accent={B.green} eyebrow="Security" title="Secure Encrypted Links"
                  body="Symmetric session keys rotated per epoch, derived from a hardware root-of-trust on the SoC base." />
          </div>
        </section>

        {/* SECTION 07 — RECONFIGURABLE NETWORK */}
        <section className="mb-14" data-testid="section-recon">
          <H num="07" label="Reconfigurable Network · Add / Remove Layers" accent={B.green} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The stack is engineered to rewire its own dynamics when you change its physical shape. Pull a
            layer, and the propulsion loop is intended to close around the survivors. Add a layer, and the
            SoC discovers it, allocates inductive + optical channels, and re-trains the readout — a
            millisecond-scale re-train is the design target, not a measured number. <strong>N is a knob.</strong>
          </p>
          <ImgFig
            src={imgStack1}
            alt="Detailed cutaway of the same stackable system showing energy harvesting (solar, vibration, RF), the 64-node analog reservoir layer at the top labeled 'Ship', three middle layers magnetically coupled with an inter-layer feedback propulsion loop, the programmable hybrid AI SoC at the base, a wireless mesh (Wi-Fi 7 / UWB / Optical / CXL), and a reconfigurable network panel showing how layers can be added or removed dynamically. Application examples include Edge AI, drones / swarm, robotics, physics sim, IoT mesh, and an autonomous vehicle."
            caption="64-Node per Layer · Self-Powered · Cooperative Processing · Magnetic Propulsion Loops"
          />
        </section>

        {/* SECTION 08 — CONTROL WRAPPER (GACA) */}
        <section className="mb-14" data-testid="section-gaca">
          <H num="08" label="Control Wrapper · GACA Closed Loop" accent={B.rose} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The whole stack sits inside a Generalized Adaptive Control Architecture (GACA): a closed-loop,
            model-constrained, continuously-learning control intelligence designed for nonlinear, high-dimensional
            systems operating near instability boundaries. GACA is what keeps the propulsion loop from running away.
          </p>
          <ImgFig
            src={imgGACA}
            alt="Circular flow diagram titled 'Generalized Adaptive Control Architecture (GACA).' Five stages arranged around a glowing central core: Sense (high-dimensional state acquisition), Simulate (forecast trajectories under multiple control policies), Constrain (enforce physical, safety, and stability bounds), Adapt (update control policy from data), and Evolve (improve long-term strategy via learning across episodes). A bottom panel lists key attributes — model-constrained, continuously learning, instability-focused, substrate-agnostic."
            caption="Generalized Adaptive Control Architecture · Sense → Simulate → Constrain → Adapt → Evolve"
          />
          <div className="grid md:grid-cols-5 gap-2 mt-4">
            {[
              { c: B.cyan,    l: "Sense",     d: "High-dim state acquisition" },
              { c: B.violet,  l: "Simulate",  d: "Forecast under N policies"   },
              { c: B.amber,   l: "Constrain", d: "Physics + safety bounds"     },
              { c: B.green,   l: "Adapt",     d: "Update from runtime data"    },
              { c: B.gold,    l: "Evolve",    d: "Long-term strategy growth"   },
            ].map((s) => (
              <div key={s.l} className="rounded-md p-3 border"
                   style={{ borderColor: B.border, background: B.panel }}>
                <div className="text-[10px] uppercase tracking-[0.26em]"
                     style={{ color: s.c, fontFamily: "Inter, sans-serif" }}>{s.l}</div>
                <div className="text-[12px] mt-1" style={{ color: B.text }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 09 — APPLICATIONS */}
        <section className="mb-14" data-testid="section-apps">
          <H num="09" label="Applications · Where The Stack Earns Its Keep" accent={B.gold} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The fabric is substrate-agnostic — same stack, different mounting. The applications below are the
            ones where the energy budget, the reconfigurability, and the propulsion loop are all earned at once.
          </p>
          <div className="flex flex-wrap gap-2">
            {APPS.map((a) => <Chip key={a.l} {...a} />)}
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <Card accent={B.cyan}   eyebrow="Edge"     title="Edge AI"
                  body="On-device inference where bandwidth or privacy forbid cloud. The stack handles training on-device too." />
            <Card accent={B.amber}  eyebrow="Mobility" title="Drone Swarm + Robotics"
                  body="Vibration harvesting + propulsion loop = a controller that learns its own platform's flight envelope in flight." />
            <Card accent={B.violet} eyebrow="Science"  title="Physics + Scientific Sim"
                  body="Reservoir computers excel at chaotic-system forecasting. The stack runs many scenarios in parallel through layer reconfiguration." />
          </div>
        </section>

        {/* SECTION 10 — HONEST LINE */}
        <section className="mb-14" data-testid="section-honest">
          <H num="10" label="The Honest Line" accent={B.muted} />
          <div className="rounded-md p-5 border space-y-3" style={{ borderColor: B.border, background: B.panel }}>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.gold, fontWeight: 600 }}>Built and demonstrated:</span>{" "}
              single-layer 64-node analog reservoirs, FPGA-driven readout, vibration + RF harvesting at the
              sub-mW continuous scale, Wi-Fi 7 + UWB stacks. These exist as discrete components today.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.amber, fontWeight: 600 }}>Engineered, not yet integrated:</span>{" "}
              true 3D-stacked TSV-bonded reservoir layers with shared inductive coupling. The pieces exist
              individually — TSV-bonded HBM, micro-inductors, optical TSVs — but no one has shipped them as one.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.violet, fontWeight: 600 }}>Active research:</span>{" "}
              the propulsion loop as a controllable dynamical field, GACA as a continuously-learning controller for
              instability-bounded systems, and the 1 Tbps+ aggregate mesh as a single coherent fabric.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.text }}>
              <span style={{ color: B.rose, fontWeight: 600 }}>Speculative:</span>{" "}
              substrate-agnostic deployment to drones, satellites, autonomous vehicles, and scientific simulators
              from one code base. The substrate-agnostic claim is the riskiest one and is not yet demonstrated.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.muted, fontStyle: "italic" }}>
              The page is a coherent system, not a product roadmap. Each section is independently buildable.
              The full stack is the synthesis target.
            </p>
          </div>
        </section>

        {/* SECTION 11 — BRIDGES */}
        <section className="mb-4" data-testid="section-bridges">
          <H num="11" label="Bridges Inside AETHER" accent={B.cyan} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text, maxWidth: "62ch" }}>
            The stack does not stand alone — it is one realisation of broader AETHER engines.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/analog-reservoir" eyebrow="Substrate"   title="Analog Reservoir"
                    body="The single-layer reservoir physics that one stack layer realises in silicon."
                    accent={B.cyan} />
            <Bridge to="/aether-os" eyebrow="Runtime" title="AETHER OS"
                    body="The operating layer the SoC runs to orchestrate input, training, and readout across stacks."
                    accent={B.violet} />
            <Bridge to="/neural-emergence" eyebrow="Emergence" title="Neural Emergence"
                    body="The dynamics that the propulsion loop is engineered to elicit, expressed in biological terms."
                    accent={B.green} />
            <Bridge to="/ferrodrive" eyebrow="Coupling" title="FerroDrive · Bio-Magnetic"
                    body="The magnetic-coupling vocabulary, biological precedent, and TSV-inductor heritage."
                    accent={B.gold} />
            <Bridge to="/phonon-stack" eyebrow="Thermal" title="Phonon · 3D Stack"
                    body="Why 3D stacks survive thermally — the phonon engineering that lets the stack scale vertically."
                    accent={B.amber} />
            <Bridge to="/aqua-cxe" eyebrow="Sister engine" title="Aqua Cxe · Resonant Nexus"
                    body="The wet, ferro-magnetic sibling — proves the same architectural pattern in a different substrate."
                    accent={B.rose} />
          </div>
        </section>

        <footer className="mt-14 pt-6 border-t" style={{ borderColor: B.border }}>
          <div className="text-[10.5px] uppercase tracking-[0.32em]" style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>
            AETHER · Stackable Hybrid Computational Fabric · /stack-fabric
          </div>
        </footer>
      </main>
    </div>
  );
}
