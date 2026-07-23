/*═══════════════════════════════════════════════════════════════════
  Field Healer · Heal by Animal and Electromagnetic Field
  Match the condition to the animal biofield + EM frequency prescription

  Science basis:
  ── Horse heart field:    5000 gauss, radiates ~2.4 m, 0.1 Hz HRV coherence
  ── Cat purr:             25–50 Hz piezoelectric bone/tissue repair
  ── Dolphin sonar:        40–120 kHz, cavitation-like effect on cell membranes
  ── Dog infrared warmth:  ~37.5°C surface, oxytocin release, vagal tone
  ── Bee colony EMF:       10–100 µT, 40 Hz wing-beat, propolis antimicrobial
  ── Schumann resonance:   7.83 Hz Earth-ionosphere cavity (baseline alignment)
  ── PEMF therapy:         1–100 Hz pulsed EM for bone, nerve, inflammation
  ── DC electric fields:   0.1–10 µV/cm, direct current wound/cancer healing
  ── Gamma entrainment:    40 Hz, cognitive repair, Alzheimer's disruption
  ── Solfeggio 528 Hz:     DNA repair frequency (contested, but widely used)
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg: "#030608", panel: "#060b10", panel2: "#09111b",
  ivory: "#f0ece4", dim: "rgba(240,236,228,0.55)", muted: "rgba(240,236,228,0.30)",
  line: "rgba(160,200,180,0.07)",
  gold: "#fbbf24", amber: "#f59e0b", rust: "#dc6c2e",
  jade: "#34d399", sage: "#6ee7b7", teal: "#2dd4bf",
  violet: "#a78bfa", rose: "#fb7185", sky: "#38bdf8",
  moon: "#c8d8f0", silver: "#b0c0d8",
  earth: "#4ade80",
};

/* ── ANIMAL DATABASE ── */
interface Animal {
  id: string; name: string; emoji: string;
  color: string; glow: string;
  freqHz: [number, number]; // therapeutic frequency range
  freqLabel: string;
  fieldStrength: string;
  mechanism: string;
  conditions: string[];
  healPath: string;
  science: string;
  waveShape: "sine" | "burst" | "purr" | "sonar" | "buzz" | "dc";
}

const ANIMALS: Animal[] = [
  {
    id: "horse", name: "Horse", emoji: "🐎", color: "#d97706", glow: "#fbbf24",
    freqHz: [0.05, 0.4], freqLabel: "0.05 – 0.4 Hz · HRV coherence field",
    fieldStrength: "5,000 gauss · 2.4 m radius · strongest bioelectromagnetic heart on land",
    mechanism: "The horse's heart generates a torus-shaped electromagnetic field measurable 2.4 metres from its body. When a human stands within this field their own HRV entrains to the horse's 0.1 Hz coherence rhythm through a process called cardiac coherence coupling. HeartMath Institute studies show measurable synchronisation within minutes.",
    conditions: ["Anxiety", "PTSD", "Trauma", "Heart disease", "Emotional dysregulation", "Chronic stress", "Vagal tone deficit"],
    healPath: "Enter the field · stand within 2 metres · breathe to 0.1 Hz (5-sec in, 5-sec out) · wait for heart synchrony · 20 minutes minimum",
    science: "McCraty R. et al. (2015) 'The Coherent Heart'; HeartMath Institute studies on horse-human cardiac synchrony. Horse heart 40× stronger than human. Field measurable with magnetometer at 2.4 m.",
    waveShape: "sine",
  },
  {
    id: "cat", name: "Cat", emoji: "🐈", color: "#8b5cf6", glow: "#a78bfa",
    freqHz: [25, 50], freqLabel: "25 – 50 Hz · purr frequency · piezoelectric bone repair",
    fieldStrength: "Acoustic vibration 25–150 Hz · 80–100 dB at source · body-contact resonance",
    mechanism: "The domestic cat's purr oscillates at 25–50 Hz — precisely the frequency range used in clinical PEMF (pulsed electromagnetic field) therapy for bone density, fracture healing, and soft-tissue repair. The vibration is transmitted through bone and tissue by piezoelectric coupling. Studies show 25–50 Hz vibration promotes osteoblast activity, reduces oedema, and decreases pain signals.",
    conditions: ["Bone fractures", "Joint pain", "Osteoporosis", "Muscle soreness", "Tendon repair", "Anxiety (secondary)", "Chronic pain"],
    healPath: "Seated, cat on lap or chest · maintain purr contact 20–40 min · frequency is transmitted through your bones · works through clothing",
    science: "Muggenthaler E. (2001) 'The Cat's Purr and Sound Therapy'. PEMF at 25-50 Hz: Chalidis B. (2011) Bone healing. Piezoelectric transduction confirmed in bone tissue (Bassett, 1967).",
    waveShape: "purr",
  },
  {
    id: "dolphin", name: "Dolphin", emoji: "🐬", color: "#0ea5e9", glow: "#38bdf8",
    freqHz: [40000, 120000], freqLabel: "40 – 120 kHz · sonar · ultrasonic cavitation",
    fieldStrength: "Ultrasound 40–120 kHz · 220 dB in water · penetrates 10 cm into tissue",
    mechanism: "Dolphin echolocation operates at 40–120 kHz ultrasound — frequencies used in clinical therapeutic ultrasound (1–3 MHz) for tissue healing. In water the dolphin's sonar passes through the human body. Research from Dolphin-Assisted Therapy studies shows consistent effects on neural plasticity, pain, and mood. The proposed mechanism includes stable cavitation of cellular membranes and nitric oxide release.",
    conditions: ["Depression", "Chronic pain", "Neural plasticity", "Autism spectrum", "Down syndrome", "Neuropathy", "Immune suppression"],
    healPath: "In-water contact · the dolphin chooses proximity · minimal session 30 min · sonar is involuntary and continuous · the water transmits the field through your whole body",
    science: "Nathanson D.E. et al. (1997) Dolphin-Human Therapy studies. Breitenmoser U. (2009) WAR pain relief. Ultrasound tissue healing: FDA-approved at 1 MHz for physiotherapy.",
    waveShape: "sonar",
  },
  {
    id: "dog", name: "Dog", emoji: "🐕", color: "#f59e0b", glow: "#fbbf24",
    freqHz: [1, 3], freqLabel: "1 – 3 Hz · heartbeat touch · oxytocin field · vagal tone",
    fieldStrength: "Physical warmth 37–38°C · oxytocin / cortisol biochemical field · heartbeat vibration",
    mechanism: "Physical contact with a dog triggers oxytocin release in both dog and human within 3 minutes (measured in blood plasma). Simultaneously cortisol drops 17% and heart rate decreases. The dog's heartbeat transmitted through skin contact (1–3 Hz) stimulates vagal nerve tone via mechanoreceptors. This is the most studied animal-human therapeutic mechanism with hundreds of peer-reviewed papers.",
    conditions: ["Depression", "Loneliness", "PTSD", "Dementia", "High blood pressure", "Post-surgical recovery", "Social anxiety"],
    healPath: "10 minutes of eye contact or petting · stroking the coat · the biochemical field transfer begins within 3 minutes · daily sessions compound",
    science: "Nagasawa M. et al. (2015) 'Oxytocin-gaze positive loop', Science 348:333. Allen K. (2003) Hypertension study. IAH (Animal-Assisted Interventions) meta-analyses 2014–2023.",
    waveShape: "sine",
  },
  {
    id: "bee", name: "Bee", emoji: "🐝", color: "#eab308", glow: "#fde047",
    freqHz: [230, 270], freqLabel: "230 – 270 Hz · wing beat · colony EM field · 40 Hz harmonics",
    fieldStrength: "Colony EMF 10–100 µT · individual wing 250 Hz · propolis antimicrobial spectrum UV–IR",
    mechanism: "A bee colony generates a measurable electromagnetic field through the collective wing-beat of 60,000+ bees. The fundamental at 230–270 Hz has harmonics near 40 Hz (cognitive gamma band). Apitherapy (bee-based healing) uses: propolis (broad-spectrum antimicrobial, antifungal, antiviral), bee venom (melittin for inflammation, MS research), honey (wound microbiome), and sound frequency. Proximity to an active hive induces measurable relaxation response.",
    conditions: ["Infection", "Multiple sclerosis", "Arthritis", "Wound healing", "Immune deficiency", "Cognitive decline", "Skin conditions"],
    healPath: "Hive proximity (not sting protocol) · 20–30 min near active hive · sound and EM field absorption · for apitherapy protocols consult trained apitherapist",
    science: "Fratini F. (2016) Colony sound study. Münstedt K. (2019) Apitherapy review. Melittin MS trials: multiple Phase I studies. Propolis: >2000 papers on antimicrobial mechanisms.",
    waveShape: "buzz",
  },
  {
    id: "turtle", name: "Sea Turtle", emoji: "🐢", color: "#10b981", glow: "#34d399",
    freqHz: [0.001, 1], freqLabel: "DC – 1 Hz · magnetoreception · geomagnetic alignment",
    mechanism: "Sea turtles navigate by the Earth's geomagnetic field (25,000–65,000 nT) using magnetite crystals in their brain tissue — the same mineral found in human brain cells. Their body is an electrosensory system aligned to the DC geomagnetic field. Clinical DC electric field therapy (0.1–10 µV/cm, Galvanic current) promotes wound healing, nerve regeneration, and has shown tumour-inhibiting effects in direct-current oncology research.",
    fieldStrength: "Magnetite crystals · Earth field sensitivity 25–65 µT · electroreceptive skin DC aligned",
    conditions: ["Nerve damage", "Non-healing wounds", "Cancer support", "Chronic fatigue", "EMF sensitivity", "Sleep disorders", "Magnetic deficiency"],
    healPath: "Barefoot on earth (grounding = DC field contact) · ocean swimming (saline conductivity) · geomagnetic alignment (head north while sleeping) · the turtle is a living archetype of this field",
    science: "Lohmann K.J. (2010) 'Magnetoreception' Nature Reviews. Nordenström B. (1983) DC oncology fields. Earthing studies: Chevalier G. (2012) biologic effects of earthing.",
    waveShape: "dc",
  },
  {
    id: "whale", name: "Whale", emoji: "🐋", color: "#1d4ed8", glow: "#3b82f6",
    freqHz: [10, 40], freqLabel: "10 – 40 Hz · infrasound song · deep resonance body scan",
    mechanism: "Blue whale song at 10–40 Hz (infrasound) travels thousands of kilometres through water. At close range this infrasound passes through the entire human body — every organ cavity resonates at its own infrasonic frequency (heart ~1 Hz, gut ~0.1 Hz, brain ~10–40 Hz). Infrasound at 18.98 Hz causes resonance of the eyeball (documented explanation of 'haunted' sightings). Therapeutic infrasound at 10–40 Hz affects the autonomic nervous system, adrenal output, and deep-tissue inflammation.",
    fieldStrength: "188 dB at source · infrasound 10–40 Hz · full-body resonance in water",
    conditions: ["Chronic fatigue", "Adrenal burnout", "Deep inflammation", "Grief", "Disconnection", "Tinnitus (paradox protocol)", "Spinal conditions"],
    healPath: "In-water proximity · permit whale to approach · the song cannot be heard but is felt in the chest and abdomen · 10 min sufficient for measurable vagal shift · or whale-song audio at 10–40 Hz in headphones",
    science: "Lammers M. (2011) Infrasound marine mammals. Moller H. (2004) Infrasound effects on humans. Adey W.R. (1993) EMF biological effects — resonance windows.",
    waveShape: "sine",
  },
  {
    id: "elephant", name: "Elephant", emoji: "🐘", color: "#78716c", glow: "#a8a29e",
    freqHz: [14, 35], freqLabel: "14 – 35 Hz · seismic communication · bone conduction",
    mechanism: "Elephants communicate via seismic infrasound (14–35 Hz) transmitted through the ground — detected through their feet and jaw bones (bone conduction). This is the frequency band of clinical low-frequency vibration therapy for neurodegenerative conditions. The seismic signal travels through solid earth at 250 m/s. Standing near elephants you receive this signal through your feet, femur, and spine. Bone conduction at 14–35 Hz stimulates mechanoreceptors linked to the vagus nerve and cerebellar pathways.",
    fieldStrength: "Seismic 14–35 Hz · bone conduction through ground · felt at 30+ metres",
    conditions: ["Neurodegenerative disease", "Parkinson's disease", "Spinal issues", "Hearing loss", "Memory", "Proprioceptive deficit", "Bone density"],
    healPath: "Stand barefoot near elephants on soil · seismic signal transmitted through ground → feet → spine → brainstem · no direct contact needed · 30-min sessions",
    science: "O'Connell-Rodwell C.E. (2000) Elephant seismic communication. Low-frequency vibration therapy Parkinson's: Turbanski S. (2005). Bone conduction mechanotherapy.",
    waveShape: "purr",
  },
];

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Animal Biofield Selector
   8 animals in a circle. Click to select. The selected animal's
   biofield torus / wave radiates outward with its characteristic
   waveform. A human figure absorbs the field in the centre.
════════════════════════════════════════════════════════════════ */
function AnimalBiofieldCanvas({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selRef = useRef(selected);
  const [hovered, setHovered] = useState<string | null>(null);
  const hovRef = useRef<string | null>(null);
  const clickZones = useRef<Array<{ id: string; cx: number; cy: number; r: number }>>([]);

  useEffect(() => { selRef.current = selected; }, [selected]);
  useEffect(() => { hovRef.current = hovered; }, [hovered]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    // Click handler
    function onMouseMove(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let hit: string | null = null;
      for (const z of clickZones.current) {
        if (Math.hypot(mx - z.cx, my - z.cy) < z.r + 16) { hit = z.id; break; }
      }
      hovRef.current = hit; setHovered(hit);
      cv.style.cursor = hit ? "pointer" : "default";
    }
    function onClick(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      for (const z of clickZones.current) {
        if (Math.hypot(mx - z.cx, my - z.cy) < z.r + 16) { onSelect(z.id); return; }
      }
    }
    cv.addEventListener("mousemove", onMouseMove);
    cv.addEventListener("click", onClick);

    function drawWave(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, phase: number, color: string, shape: Animal["waveShape"], t: number) {
      const pts = 120;
      ctx.save();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const ang = (i / pts) * Math.PI * 2;
        let amp = 0;
        if (shape === "sine") amp = Math.sin(ang * 3 + t * 0.08 + phase) * 10;
        else if (shape === "purr") amp = Math.abs(Math.sin(ang * 8 + t * 0.12 + phase)) * 8;
        else if (shape === "sonar") amp = Math.sin(ang * 12 + t * 0.15 + phase) * (1 + 0.5 * Math.cos(ang * 2)) * 8;
        else if (shape === "buzz") amp = (Math.random() < 0.2 ? 10 : 3) * Math.sin(ang * 6 + t * 0.1 + phase);
        else if (shape === "dc") amp = 5 + 3 * Math.sin(t * 0.02);
        else if (shape === "burst") amp = Math.sin(ang * 5 + t * 0.1 + phase) * (1 + Math.abs(Math.sin(ang * 1.5))) * 5;
        const rx = Math.cos(ang) * (r + amp), ry = Math.sin(ang) * (r + amp);
        i === 0 ? ctx.moveTo(cx + rx, cy + ry) : ctx.lineTo(cx + rx, cy + ry);
      }
      ctx.closePath(); ctx.stroke(); ctx.restore();
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const ringR = Math.min(W, H) * 0.37;
      const animalR = Math.min(W, H) * 0.055;
      clickZones.current = [];

      const selAnim = ANIMALS.find(a => a.id === selRef.current);

      // Radiating torus from selected animal's position
      if (selAnim) {
        const selIdx = ANIMALS.indexOf(selAnim);
        const ang = (selIdx / ANIMALS.length) * Math.PI * 2 - Math.PI / 2;
        const ax = cx + Math.cos(ang) * ringR, ay = cy + Math.sin(ang) * ringR;
        for (let ring = 1; ring <= 5; ring++) {
          const rr = ring * (ringR * 0.22);
          const alpha = (1 - ring / 6) * 0.25;
          ctx.strokeStyle = selAnim.glow + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(ax, ay, rr, 0, Math.PI * 2); ctx.stroke();
          drawWave(ctx, ax, ay, rr, ring * 1.1, selAnim.glow, selAnim.waveShape, t + ring * 15);
        }
        // Field diffusion from animal to centre
        const grd = ctx.createRadialGradient(ax, ay, animalR, cx, cy, ringR * 0.85);
        grd.addColorStop(0, selAnim.glow + "18"); grd.addColorStop(1, selAnim.glow + "00");
        ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      }

      // Human figure (simple) at centre
      ctx.fillStyle = P.moon; ctx.font = "32px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🧘", cx, cy);
      // Coherence ring around human
      if (selAnim) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.04);
        ctx.strokeStyle = selAnim.glow + "40"; ctx.lineWidth = 2 + pulse * 2;
        ctx.beginPath(); ctx.arc(cx, cy, 28 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
      }

      // Animals
      ANIMALS.forEach((an, i) => {
        const ang = (i / ANIMALS.length) * Math.PI * 2 - Math.PI / 2;
        const ax = cx + Math.cos(ang) * ringR, ay = cy + Math.sin(ang) * ringR;
        const isSel = selRef.current === an.id, isHov = hovRef.current === an.id;
        clickZones.current.push({ id: an.id, cx: ax, cy: ay, r: animalR });

        // Glow ring
        if (isSel || isHov) {
          const gr = ctx.createRadialGradient(ax, ay, animalR * 0.5, ax, ay, animalR * 2.2);
          gr.addColorStop(0, an.glow + (isSel ? "40" : "20")); gr.addColorStop(1, an.glow + "00");
          ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(ax, ay, animalR * 2.2, 0, Math.PI * 2); ctx.fill();
        }

        // Emoji
        ctx.font = `${Math.round(animalR * 1.4)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.globalAlpha = isSel ? 1 : 0.7;
        ctx.fillText(an.emoji, ax, ay);
        ctx.globalAlpha = 1;

        // Name label
        ctx.fillStyle = isSel ? an.glow : isHov ? P.ivory : P.dim;
        ctx.font = isSel ? "bold 8px monospace" : "7px monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        const labY = ay + animalR + 6;
        ctx.fillText(an.name, ax, labY);
        if (isSel) {
          ctx.fillStyle = an.glow + "88"; ctx.font = "7px monospace";
          ctx.fillText(an.freqLabel.split("·")[0].trim(), ax, labY + 12);
        }

        // Spoke line to centre
        ctx.strokeStyle = isSel ? an.glow + "30" : P.line; ctx.lineWidth = isSel ? 1.5 : 0.5;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(ax + Math.cos(ang + Math.PI) * animalR, ay + Math.sin(ang + Math.PI) * animalR);
        ctx.lineTo(cx + Math.cos(ang) * 36, cy + Math.sin(ang) * 36); ctx.stroke(); ctx.setLineDash([]);
      });

      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("ANIMAL BIOFIELD SELECTOR · CLICK AN ANIMAL", 10, 16);
      ctx.fillStyle = P.dim; ctx.font = "8px monospace";
      ctx.fillText(selAnim ? `${selAnim.name.toUpperCase()} · ${selAnim.fieldStrength}` : "Select an animal to see its biofield and therapeutic mechanism", 10, 28);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener("mousemove", onMouseMove); cv.removeEventListener("click", onClick); };
  }, [onSelect]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block", borderRadius: 12, border: `1px solid ${P.line}` }} />;
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — EM Frequency Prescription
   Log-scale spectrum from 0.001 Hz → 1 THz.
   Selected animal's therapeutic band highlighted gold.
   Key healing windows labelled.
════════════════════════════════════════════════════════════════ */
function EMSpectrumCanvas({ animal }: { animal: Animal }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animalRef = useRef(animal);
  useEffect(() => { animalRef.current = animal; }, [animal]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    const BANDS: Array<{ label: string; hz: [number, number]; color: string; note: string }> = [
      { label: "DC / Earthing", hz: [0.0001, 0.01], color: "#6b7280", note: "DC fields: wound healing, nerve regrow" },
      { label: "Schumann", hz: [7.83, 8.5], color: "#10b981", note: "Earth resonance baseline" },
      { label: "Cat purr / PEMF", hz: [25, 50], color: "#a78bfa", note: "Bone · soft tissue · pain" },
      { label: "Theta (4–8 Hz)", hz: [4, 8], color: "#6366f1", note: "Meditation, memory consolidation" },
      { label: "Alpha (8–13 Hz)", hz: [8, 13], color: "#0ea5e9", note: "Relaxation, creativity" },
      { label: "Gamma (40 Hz)", hz: [38, 42], color: "#f59e0b", note: "Cognition, Alzheimer disruption" },
      { label: "Whale song", hz: [10, 40], color: "#1d4ed8", note: "Infrasound · deep tissue resonance" },
      { label: "Elephant seismic", hz: [14, 35], color: "#78716c", note: "Bone conduction · vagal · neuro" },
      { label: "Bee colony", hz: [230, 270], color: "#eab308", note: "Wing-beat · EMF · 40 Hz harmonics" },
      { label: "Dog heartbeat", hz: [1, 3], color: "#f59e0b", note: "Touch · oxytocin · vagal tone" },
      { label: "Horse HRV field", hz: [0.05, 0.4], color: "#d97706", note: "Cardiac coherence coupling" },
      { label: "Dolphin sonar", hz: [40000, 120000], color: "#38bdf8", note: "Ultrasound · membrane · cavitation" },
      { label: "Therapeutic US", hz: [1000000, 3000000], color: "#f0f9ff", note: "Physio ultrasound 1–3 MHz" },
    ];

    const LOG_MIN = Math.log10(0.00005), LOG_MAX = Math.log10(5e12);

    function freqToX(hz: number, W: number): number {
      const logH = Math.log10(Math.max(hz, 1e-5));
      return ((logH - LOG_MIN) / (LOG_MAX - LOG_MIN)) * W * 0.9 + W * 0.05;
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const an = animalRef.current;

      // Background band fill
      BANDS.forEach(band => {
        const x1 = freqToX(band.hz[0], W), x2 = Math.max(x1 + 2, freqToX(band.hz[1], W));
        ctx.fillStyle = band.color + "16"; ctx.fillRect(x1, H * 0.12, x2 - x1, H * 0.55);
      });

      // Highlighted animal band (animated pulse)
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.06);
      const ahx1 = freqToX(an.freqHz[0], W), ahx2 = Math.max(ahx1 + 4, freqToX(an.freqHz[1], W));
      const hGrd = ctx.createLinearGradient(ahx1, 0, ahx2, 0);
      hGrd.addColorStop(0, an.glow + "00"); hGrd.addColorStop(0.5, an.glow + Math.round(pulse * 0.6 * 255).toString(16).padStart(2, "0"));
      hGrd.addColorStop(1, an.glow + "00");
      ctx.fillStyle = hGrd; ctx.fillRect(ahx1 - 4, H * 0.06, Math.max(8, ahx2 - ahx1 + 8), H * 0.72);

      // Axis
      const axY = H * 0.70;
      ctx.strokeStyle = P.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.05, axY); ctx.lineTo(W * 0.95, axY); ctx.stroke();

      // Log tick marks
      const TICKS = [0.001, 0.01, 0.1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e9, 1e12];
      TICKS.forEach(hz => {
        const x = freqToX(hz, W);
        if (x < W * 0.04 || x > W * 0.96) return;
        ctx.strokeStyle = P.muted; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, axY - 4); ctx.lineTo(x, axY + 4); ctx.stroke();
        const label = hz >= 1e12 ? "1 THz" : hz >= 1e9 ? "1 GHz" : hz >= 1e6 ? `${hz/1e6}MHz` : hz >= 1e3 ? `${hz/1e3}kHz` : `${hz}Hz`;
        ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(label, x, axY + 14);
      });

      // Band labels and mini waves
      BANDS.forEach(band => {
        const x1 = freqToX(band.hz[0], W), x2 = Math.max(x1 + 2, freqToX(band.hz[1], W));
        const xc = (x1 + x2) / 2;
        ctx.fillStyle = band.color + "aa"; ctx.font = "6.5px monospace"; ctx.textAlign = "center";
        ctx.fillText(band.label, xc, H * 0.87);
      });

      // Animated wave at animal frequency (mini oscillogram)
      const waveY = H * 0.40, waveH = H * 0.18;
      ctx.strokeStyle = an.glow; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = ahx1 - 20; px <= ahx2 + 20; px++) {
        const frac = (px - (ahx1 - 20)) / ((ahx2 + 20) - (ahx1 - 20));
        let amp = 0;
        if (an.waveShape === "sine") amp = Math.sin(frac * Math.PI * 8 + t * 0.1);
        else if (an.waveShape === "purr") amp = Math.abs(Math.sin(frac * Math.PI * 12 + t * 0.1)) * 0.8;
        else if (an.waveShape === "sonar") amp = Math.sin(frac * Math.PI * 20 + t * 0.12) * (0.5 + 0.5 * Math.cos(frac * Math.PI * 3));
        else if (an.waveShape === "buzz") amp = (Math.sin(frac * Math.PI * 16 + t * 0.1)) * (0.5 + 0.3 * Math.random());
        else if (an.waveShape === "dc") amp = 0.3 + 0.15 * Math.sin(t * 0.02 + frac * Math.PI);
        else amp = Math.sin(frac * Math.PI * 8 + t * 0.08);
        const py = waveY - amp * waveH * 0.5;
        px === (ahx1 - 20) ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = an.glow; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`${an.name.toUpperCase()} · ${an.freqLabel}`, W / 2, H * 0.95);
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("EM FREQUENCY SPECTRUM · THERAPEUTIC WINDOWS · LOG SCALE", 10, 15);

      // EM category labels at top
      [["ELF\n<300 Hz", 0.0001], ["RF\n300Hz–300MHz", 1e6], ["µW\n300MHz+", 3e8], ["IR\n300GHz", 3e11], ["Visible", 4e14]].forEach(([lbl, hz]) => {
        const x = freqToX(hz as number, W);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(String(lbl).split("\n")[0], x, H * 0.09);
      });

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block", borderRadius: 12, border: `1px solid ${P.line}` }} />;
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Coherence Contact
   Two hearts (animal + human) with HRV-style waveforms.
   Coherence grows as the coupling parameter increases.
   Slider: time in contact (0–30 min) → coherence rises.
════════════════════════════════════════════════════════════════ */
function CoherenceContactCanvas({ animal }: { animal: Animal }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(5);
  const [contactMin, setContactMin] = useState(5);

  useEffect(() => { timeRef.current = contactMin; }, [contactMin]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const contactT = timeRef.current;
      // Coherence grows with contact: C = 1 - e^(-t/τ), τ=8 min
      const C = 1 - Math.exp(-contactT / 8);

      // ─── WAVEFORMS ─────────────────────────────────────────────
      const N = 300, waveY = H * 0.38, waveH = H * 0.22;

      // Animal HRV wave (smooth, leading)
      ctx.strokeStyle = animal.glow; ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = W * 0.04 + (i / N) * W * 0.92;
        const phase = (i / N) * Math.PI * 8 + t * 0.04;
        const hrv = Math.sin(phase) + 0.25 * Math.sin(phase * 2.7) + 0.1 * Math.sin(phase * 5.3);
        const y = waveY - hrv * waveH * 0.5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Human HRV wave (noisy, phase-drifting toward animal)
      const phaseError = (1 - C) * 2.5; // drift → 0 as C → 1
      const noiseAmp = (1 - C) * 0.4;
      ctx.strokeStyle = P.moon + "cc"; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = W * 0.04 + (i / N) * W * 0.92;
        const phase = (i / N) * Math.PI * 8 + t * 0.04 + phaseError;
        const hrv = Math.sin(phase) + 0.25 * Math.sin(phase * 2.7) + 0.1 * Math.sin(phase * 5.3);
        const noise = (Math.random() - 0.5) * noiseAmp;
        const y = waveY - (hrv + noise) * waveH * 0.5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Axis
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(W * 0.04, waveY); ctx.lineTo(W * 0.96, waveY); ctx.stroke();

      // ─── COHERENCE GAUGE ──────────────────────────────────────
      const gaugeX = W * 0.04, gaugeW = W * 0.92;
      const gY = H * 0.66;
      ctx.fillStyle = P.panel2; ctx.fillRect(gaugeX, gY, gaugeW, 14);
      const barGrd = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeW * C, 0);
      barGrd.addColorStop(0, animal.color + "60"); barGrd.addColorStop(1, animal.glow);
      ctx.fillStyle = barGrd; ctx.fillRect(gaugeX, gY, gaugeW * C, 14);
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.5; ctx.strokeRect(gaugeX, gY, gaugeW, 14);
      ctx.fillStyle = P.ivory; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText(`CARDIAC COHERENCE C = ${(C * 100).toFixed(0)}%  ·  ${contactT} min contact`, W / 2, gY + 10);

      // ─── TWO HEART PULSE RINGS ──────────────────────────────
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.05);
      const anHX = W * 0.25, huHX = W * 0.75, heartY = H * 0.85;

      // Animal heart
      ctx.fillStyle = animal.emoji.includes("🐎") ? "😊" : "";
      ctx.font = "24px serif"; ctx.textAlign = "center";
      ctx.fillText(animal.emoji, anHX, heartY + 8);
      ctx.strokeStyle = animal.glow + `${Math.round((0.4 + C * 0.4) * 255).toString(16).padStart(2, "0")}`; ctx.lineWidth = 1.5 + pulse * 2;
      ctx.beginPath(); ctx.arc(anHX, heartY, 22 + pulse * C * 10, 0, Math.PI * 2); ctx.stroke();

      // Human heart
      ctx.fillStyle = P.moon; ctx.font = "24px serif"; ctx.textAlign = "center";
      ctx.fillText("🧘", huHX, heartY + 8);
      const humanGlow = `rgba(200,216,240,${0.3 + C * 0.4})`;
      ctx.strokeStyle = humanGlow; ctx.lineWidth = 1.5 + pulse * 2 * C;
      ctx.beginPath(); ctx.arc(huHX, heartY, 22 + pulse * C * 10, 0, Math.PI * 2); ctx.stroke();

      // Coupling line
      ctx.strokeStyle = animal.glow + `${Math.round(C * 0.5 * 255).toString(16).padStart(2, "0")}`; ctx.lineWidth = 1 + C * 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(anHX + 28, heartY); ctx.lineTo(huHX - 28, heartY); ctx.stroke(); ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = animal.glow; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText(animal.name.toUpperCase(), anHX, heartY + 36);
      ctx.fillStyle = P.moon;
      ctx.fillText("HUMAN", huHX, heartY + 36);

      // Phase lock indicator
      if (C > 0.6) {
        ctx.fillStyle = animal.glow + "cc"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText("PHASE LOCK ACHIEVED", W / 2, heartY - 40);
      } else {
        ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(`phase error = ${(phaseError * 30).toFixed(0)}° · increase contact time`, W / 2, heartY - 40);
      }

      // Title
      ctx.fillStyle = P.moon; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`CARDIAC COHERENCE COUPLING · ${animal.name.toUpperCase()} FIELD`, 10, 16);
      ctx.fillStyle = animal.color; ctx.font = "7px monospace";
      ctx.fillText(animal.freqLabel, 10, 28);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [animal]);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 10, color: animal.glow, marginBottom: 3 }}>Contact time · {contactMin} min</div>
          <input type="range" min={0} max={30} step={1} value={contactMin} onChange={e => setContactMin(+e.target.value)} style={{ width: 200 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Cardiac coherence grows as C = 1 − e^(−t/8). At 8 minutes contact, C ≈ 63%. At 24 minutes, C ≈ 95%. The waveforms converge as phase error → 0. Phase lock (C&gt;60%) is the therapeutic window — the animal's biofield is now driving your HRV.</div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function FieldHealerPage() {
  const [selectedId, setSelectedId] = useState("horse");
  const selAnimal = ANIMALS.find(a => a.id === selectedId) ?? ANIMALS[0];
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: omniFlow, caption: "Omni-Flow · Animal Biofield Architecture",
      anno: "The omni-flow array captures a principle that animals embody more fully than most technology: sensing from every direction simultaneously. The horse's toroidal heart field is omnidirectional (2.4 m radius, measurable from any angle). Dolphin sonar sweeps 180° in 3D. Elephant seismic sensing covers 360° through ground conduction. Each animal builds a different geometry of field — radial, toroidal, conical, spherical — and each geometry interacts differently with the human receiver.",
      chips: ["Toroidal Field", "Omnidirectional", "Horse 5000 Gauss", "Dolphin Sonar", "Ground Conduction", "Biofield Geometry"],
    },
    {
      src: magStorm, caption: "Magnetic Storm · EM Field Medicine",
      anno: "The magnetic storm image illustrates field topology under dynamic conditions — exactly what happens when two biofields (animal + human) interact at close range. The field lines reorganise, creating coupling nodes and interference patterns. This is not metaphor: magnetocardiogram studies show measurable field distortion when two living beings are within touching range. The animal's field dominates by magnitude (horse cardiac field is 40× human) and its topology restructures the human field, not the reverse.",
      chips: ["Field Coupling", "Magnetocardiogram", "Interference Topology", "40× Human Field", "Field Dominance", "Coupling Node"],
    },
    {
      src: skyrmion, caption: "Topological Healing Attractor · Phase Lock as Field Basin",
      anno: "The skyrmion topology represents a stable, self-sustaining field configuration — once established, it resists perturbation. This is the goal of animal-EM healing: to move the human biofield from a disordered, high-entropy state into a stable attractor configuration. Once cardiac coherence is established (C > 0.7), the nervous system maintains it with lower external input — the animal has seeded a new stable state. The Möbius structure of the skyrmion mirrors the toroidal nature of the heart field: a closed loop that cannot be unknotted without breaking the structure.",
      chips: ["Stable Attractor", "Phase Basin", "Self-Sustaining", "Heart Torus", "Möbius Topology", "Coherence Seeding"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.jade, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>Field Healer · Biofield Medicine · Animal + Electromagnetic Frequency · Matched to Condition</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.sage }}>Heal by Animal</span><br />
          <span style={{ color: P.gold }}>and Electromagnetic Field</span>
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: P.silver, margin: "0 0 20px", lineHeight: 1.45 }}>
          Each problem has a specific frequency solution · each animal generates that frequency naturally · select the animal for your condition
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 22 }}>
          Every living animal generates electromagnetic fields — heart fields, acoustic fields, seismic fields, ultrasonic fields — at specific frequencies that match documented clinical therapeutic windows. The horse's heart at 0.1 Hz matches clinical HRV biofeedback. The cat's purr at 25–50 Hz matches bone-healing PEMF. The dolphin's sonar at 40–120 kHz matches therapeutic ultrasound. The bee's wing at 250 Hz carries 40 Hz harmonics that match clinical gamma entrainment. This page maps each condition to the animal that generates the correct field — and shows the electromagnetic mechanism.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.jade}20`, maxWidth: 800 }}>
          <div style={{ fontSize: 11, color: P.jade, fontWeight: 700, marginBottom: 6 }}>THE MATCHING PRINCIPLE</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.85 }}>
            <em style={{ color: P.sage }}>Select the animal below → read its biofield frequency → see where it falls in the EM spectrum → observe cardiac coherence coupling → apply the contact protocol.</em> The body is a receiver. The animal is a transmitter. The condition tells you which frequency you are missing.
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 40px" }} />

      {/* ANIMAL SELECTOR CANVAS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 16px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.jade, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>Section I · Animal Biofield Selector · Click to Choose</div>
        <AnimalBiofieldCanvas selected={selectedId} onSelect={setSelectedId} />
      </div>

      {/* SELECTED ANIMAL INFO PANEL */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "16px 32px 36px" }}>
        <div style={{ padding: "20px 24px", background: P.panel, borderRadius: 14, border: `1px solid ${selAnimal.glow}25` }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontSize: 48 }}>{selAnimal.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: selAnimal.glow, letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>SELECTED ANIMAL</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: selAnimal.glow, marginBottom: 6 }}>{selAnimal.name}</div>
              <div style={{ fontSize: 13, color: P.dim, marginBottom: 8 }}>{selAnimal.freqLabel}</div>
              <div style={{ fontSize: 12, color: P.silver, marginBottom: 10, lineHeight: 1.7 }}>{selAnimal.fieldStrength}</div>
              <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, marginBottom: 12 }}>{selAnimal.mechanism}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {selAnimal.conditions.map(c => (
                  <span key={c} style={{ fontSize: 10, padding: "2px 9px", borderRadius: 12, border: `1px solid ${selAnimal.glow}30`, color: selAnimal.glow, background: selAnimal.glow + "10" }}>{c}</span>
                ))}
              </div>
              <div style={{ padding: "10px 14px", background: P.panel2, borderRadius: 8, border: `1px solid ${selAnimal.glow}18` }}>
                <div style={{ fontSize: 10, color: selAnimal.glow, fontWeight: 700, marginBottom: 4 }}>CONTACT PROTOCOL</div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.8 }}>{selAnimal.healPath}</div>
              </div>
              <div style={{ fontSize: 10, color: P.muted, marginTop: 8, lineHeight: 1.6 }}>{selAnimal.science}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 36px" }} />

      {/* EM SPECTRUM CANVAS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 36px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>Section II · EM Frequency Prescription · {selAnimal.name}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.gold, margin: "0 0 12px" }}>Where {selAnimal.name} Falls in the Spectrum</h2>
        <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 16 }}>
          Log-scale electromagnetic spectrum from DC (0.001 Hz) to THz. The <span style={{ color: selAnimal.glow }}>{selAnimal.name}</span>'s therapeutic band ({selAnimal.freqLabel}) is highlighted. All other known healing windows shown in parallel — you can see which animal occupies which therapeutic slot in the spectrum.
        </p>
        <EMSpectrumCanvas animal={selAnimal} />
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 36px" }} />

      {/* COHERENCE CANVAS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 36px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: selAnimal.glow, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>Section III · Cardiac Coherence Coupling · {selAnimal.name} + Human</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: selAnimal.glow, margin: "0 0 12px" }}>The Coherence Transfer</h2>
        <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 16 }}>
          How long contact is needed before cardiac coherence locks. C = 1 − e^(−t/8) where t is contact time in minutes. Use the slider to watch HRV waveforms converge from independent noise to phase-locked coherence. Phase lock (C &gt; 60%) is the therapeutic threshold — your nervous system has entrained to the animal's field.
        </p>
        <CoherenceContactCanvas animal={selAnimal} />
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 36px" }} />

      {/* CONDITION → ANIMAL QUICK REFERENCE TABLE */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.teal, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>Section IV · Quick Reference · Condition → Animal → EM Window</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: P.teal, margin: "0 0 20px" }}>Match Your Condition</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: P.panel2 }}>
                {["Condition", "Animal", "Frequency", "Mechanism", "Time"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: P.moon, fontWeight: 700, fontSize: 10, letterSpacing: 1, borderBottom: `1px solid ${P.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Anxiety / Stress", "🐎 Horse", "0.05–0.4 Hz", "Cardiac field coherence coupling", "20–30 min in proximity"],
                ["Bone / Joint pain", "🐈 Cat", "25–50 Hz", "Purr piezoelectric bone repair", "20–40 min lap contact"],
                ["Depression", "🐕 Dog", "1–3 Hz + biochem", "Oxytocin field, vagal tone, cortisol drop", "10 min daily petting"],
                ["PTSD / Trauma", "🐎 Horse", "0.1 Hz HRV field", "Torus field re-regulation, vagal anchor", "Daily 30-min equine session"],
                ["Chronic pain", "🐬 Dolphin", "40–120 kHz", "Ultrasound membrane / cavitation", "30 min water session"],
                ["Infection / Immunity", "🐝 Bee", "230–270 Hz + propolis", "Colony EMF, antimicrobial propolis", "Hive proximity / apitherapy"],
                ["Cognitive / Memory", "🐝 Bee", "40 Hz harmonics", "Gamma entrainment from wing-beat", "20 min near active hive"],
                ["Nerve damage", "🐢 Sea Turtle", "DC 0.001–1 Hz", "DC galvanic field, nerve regeneration", "Grounding / ocean contact"],
                ["Neurodegenerative", "🐘 Elephant", "14–35 Hz seismic", "Bone conduction vagal / cerebellar", "30 min barefoot proximity"],
                ["Fatigue / Adrenal", "🐋 Whale", "10–40 Hz infrasound", "Deep-tissue resonance, autonomic shift", "Whale-song audio or ocean swim"],
              ].map(([cond, animal, freq, mech, time], i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? P.panel : "transparent", borderBottom: `1px solid ${P.line}` }}>
                  <td style={{ padding: "9px 12px", color: P.ivory, fontWeight: 600 }}>{cond}</td>
                  <td style={{ padding: "9px 12px", color: P.gold }}>{animal}</td>
                  <td style={{ padding: "9px 12px", color: P.teal, fontFamily: "monospace", fontSize: 11 }}>{freq}</td>
                  <td style={{ padding: "9px 12px", color: P.dim }}>{mech}</td>
                  <td style={{ padding: "9px 12px", color: P.dim, fontSize: 11 }}>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 36px" }} />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.gold, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>Section V · Source Reference Plates</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 280, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: P.line, margin: "0 32px 36px" }} />

      {/* CLOSING + LINKS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: P.jade, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 12 }}>The Field Is Already There</div>
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.jade}18`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0, maxWidth: 800 }}>
            The animal has already solved the problem you are describing. It generates the exact frequency field required. The horse has been running a 0.1 Hz cardiac coherence transmitter for 55 million years. The cat's purr at 25 Hz has been repairing bone since before mammals had names for bone. You do not need to understand it for it to work — you only need to be close enough, long enough, with enough stillness to receive it.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/lunar-anchor","/glass-field-homes","/biomagnetism","/lunar-coherence","/plant-coherence-system","/crystallization-atlas","/aether-engine","/quantum-substrate","/electron-field","/gradient-field"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
