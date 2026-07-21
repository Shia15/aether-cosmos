/*═══════════════════════════════════════════════════════════════════
  Bio-Regenerative Laser Network
  One coherent beam from a networked robotic array — pre-programmed
  for every scenario, every species, every body part.

  Physics:
  ── Beer-Lambert:     I(z) = I₀ · e^{−μ_a(λ) · z}   (tissue depth)
  ── Optical window:   600–1000 nm (minimal water/Hb absorption)
  ── ATP synthesis:    N_ATP ∝ N_photons × QY_cco     (cytochrome)
  ── Diffusion (NO):   ∂c/∂t = D∇²c + S(r,t) − k_c   (Fick + source)
  ── Coherence field:  C(x,t) = A(x)e^{i(φ−ωt)}       (laser mode)
  ── Phase coupling:   ∂φ/∂t = Σⱼ Kⱼ sin(φⱼ − φᵢ)   (Kuramoto net)
  ── Healing rate:     dH/dt = k_VEGF·C_NO + k_TGF·H(1 − H)
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

/* ─── palette ─────────────────────────────────────────────────── */
const P = {
  bg: "#020b12", panel: "#03111e", panel2: "#041622",
  ivory: "#e0f4ff", dim: "rgba(224,244,255,0.55)", muted: "rgba(224,244,255,0.28)",
  line: "rgba(0,200,255,0.08)",
  cyan: "#22d3ee", teal: "#2dd4bf", blue: "#60a5fa",
  violet: "#a78bfa", rose: "#f472b6", gold: "#fbbf24",
  green: "#4ade80", red: "#f87171",
  laser630: "#ff4040", laser660: "#ff6060", laser780: "#cc44ff",
  laser808: "#aa55ff", laser850: "#8866ff", laser940: "#5577ff",
};

/* ─── species config ──────────────────────────────────────────── */
const SPECIES = [
  {
    id: "human",   label: "Human",       color: P.teal,
    mu_a: [0.25, 0.18, 0.35, 0.14, 0.28, 0.20],        // absorption coeff per beam
    note: "Optical window 650–950 nm. Red penetrates 8–10 mm (skin+fat), NIR up to 40 mm (muscle). Bone requires 810–850 nm.",
    parts: ["Skin", "Muscle", "Bone", "Nerve", "Cartilage", "Vascular"],
    emoji: "🧑‍🦱",
  },
  {
    id: "horse",   label: "Horse",       color: P.gold,
    mu_a: [0.20, 0.15, 0.40, 0.12, 0.32, 0.18],
    note: "Equine tendon: 780 nm at 100 mW/cm² — accelerates collagen crosslinking. Hoof lamellae respond to 630 nm. Bone cortex (40 mm thick) needs 850 nm pulsed.",
    parts: ["Hide", "Tendon", "Hoof", "Nerve", "Cartilage", "Vascular"],
    emoji: "🐎",
  },
  {
    id: "dolphin", label: "Dolphin",     color: P.cyan,
    mu_a: [0.15, 0.12, 0.30, 0.10, 0.28, 0.16],
    note: "Dolphin blubber (5–20 cm) transmits 630–780 nm well. Melon (acoustic lens) responds to 632 nm. Echolocation pathway uses 660 nm near-field. Underwater: beam attenuated by seawater κ_w ≈ 0.4 m⁻¹ at 660 nm.",
    parts: ["Blubber", "Melon", "Muscle", "Nerve", "Flukes", "Vascular"],
    emoji: "🐬",
  },
  {
    id: "shark",   label: "Shark",       color: P.violet,
    mu_a: [0.18, 0.14, 0.38, 0.11, 0.25, 0.17],
    note: "Elasmobranch cartilage (no bone) — 630 nm stimulates chondrocyte proliferation. Ampullae of Lorenzini (electromagnetic sense organs) are sensitive to 660–780 nm photobiomodulation. Lateral line nerves respond to sub-threshold NIR.",
    parts: ["Skin", "Cartilage", "Muscle", "Ampullae", "Lateral Line", "Liver"],
    emoji: "🦈",
  },
];

/* ─── body part × molecule lookup ───────────────────────────────
   Molecules the laser network must synthesise per scenario.       */
const PART_MOLECULES: Record<string, Array<{ name: string; role: string; rate: number; color: string }>> = {
  Skin:    [{ name: "Collagen I",     role: "scaffold",   rate: 0.8, color: P.gold   }, { name: "Elastin",   role: "stretch",   rate: 0.6, color: P.teal   }, { name: "NO",     role: "vasodilate", rate: 0.9, color: P.cyan   }, { name: "ATP",    role: "energy",    rate: 1.0, color: P.green  }],
  Muscle:  [{ name: "ATP",            role: "energy",     rate: 1.0, color: P.green  }, { name: "IGF-1",     role: "growth",    rate: 0.7, color: P.blue   }, { name: "Myosin", role: "contract",   rate: 0.5, color: P.teal   }, { name: "ROS",    role: "signal",    rate: 0.4, color: P.rose   }],
  Bone:    [{ name: "Osteocalcin",    role: "matrix",     rate: 0.6, color: P.ivory  }, { name: "BMP-2",     role: "growth",    rate: 0.5, color: P.gold   }, { name: "VEGF",   role: "angiogen",   rate: 0.7, color: P.red    }, { name: "ATP",    role: "energy",    rate: 0.9, color: P.green  }],
  Nerve:   [{ name: "BDNF",           role: "neurotrophic",rate: 0.7, color: P.violet}, { name: "NGF",       role: "growth",    rate: 0.6, color: P.blue   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }, { name: "NO",     role: "vasodilate", rate: 0.8, color: P.cyan   }],
  Cartilage:[{ name: "Collagen II",   role: "scaffold",   rate: 0.7, color: P.teal   }, { name: "Aggrecan",  role: "cushion",   rate: 0.6, color: P.blue   }, { name: "TGF-β",  role: "growth",     rate: 0.5, color: P.gold   }, { name: "HA",     role: "lubricate",  rate: 0.6, color: P.cyan   }],
  Vascular:[{ name: "NO",             role: "vasodilate", rate: 0.9, color: P.cyan   }, { name: "VEGF",      role: "angiogen",  rate: 0.8, color: P.red    }, { name: "eNOS",   role: "synthase",   rate: 0.7, color: P.teal   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }],
  // Horse-specific
  Tendon:  [{ name: "Collagen I",     role: "scaffold",   rate: 0.9, color: P.gold   }, { name: "Fibronectin","role":"adhesion", rate: 0.6, color: P.ivory  }, { name: "TGF-β",  role: "crosslink",  rate: 0.7, color: P.teal   }, { name: "NO",     role: "vasodilate", rate: 0.8, color: P.cyan   }],
  Hoof:    [{ name: "Keratin",        role: "structure",  rate: 0.9, color: P.gold   }, { name: "ATP",       role: "energy",    rate: 1.0, color: P.green  }, { name: "Cystine","role": "crosslink", rate: 0.7, color: P.ivory  }, { name: "Laminarin","role":"scaffold", rate: 0.5, color: P.teal  }],
  Hide:    [{ name: "Collagen III",   role: "scaffold",   rate: 0.7, color: P.gold   }, { name: "Elastin",   role: "stretch",   rate: 0.6, color: P.teal   }, { name: "NO",     role: "vasodilate", rate: 0.8, color: P.cyan   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }],
  // Dolphin
  Blubber: [{ name: "Lipase",         role: "catabolism", rate: 0.5, color: P.teal   }, { name: "ATP",       role: "energy",    rate: 1.0, color: P.green  }, { name: "Omega-3","role":"membrane",   rate: 0.6, color: P.blue   }, { name: "NO",     role: "vasodilate", rate: 0.7, color: P.cyan   }],
  Melon:   [{ name: "Lipid-PUFA",     role: "acoustics",  rate: 0.7, color: P.cyan   }, { name: "DHA",       role: "membrane",  rate: 0.6, color: P.blue   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }, { name: "NO",     role: "vasodilate", rate: 0.8, color: P.cyan   }],
  Flukes:  [{ name: "Collagen I",     role: "scaffold",   rate: 0.8, color: P.gold   }, { name: "Elastin",   role: "flex",      rate: 0.7, color: P.teal   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }, { name: "Myosin", role: "power",      rate: 0.6, color: P.blue   }],
  // Shark
  Ampullae:[{ name: "Glycoprotein",   role: "sensor gel", rate: 0.7, color: P.violet }, { name: "Collagen",  role: "capsule",   rate: 0.6, color: P.gold   }, { name: "ATP",    role: "energy",     rate: 1.0, color: P.green  }, { name: "K⁺-channel","role":"signal", rate: 0.5, color: P.cyan   }],
  "Lateral Line":[{ name: "BDNF",    role: "neurotrophic",rate: 0.7, color: P.violet }, { name: "Hair-cell Myo7a","role":"mechanosense",rate:0.5,color:P.teal},{"name":"ATP","role":"energy",rate:1.0,color:P.green},{"name":"NO","role":"vasodilate",rate:0.7,color:P.cyan}],
  Liver:   [{ name: "Squalene",       role: "buoyancy",   rate: 0.7, color: P.gold   }, { name: "Cytochrome-P450","role":"detox",rate:0.5,color:P.violet},{name:"ATP",role:"energy",rate:1.0,color:P.green},{name:"GSH",role:"antioxidant",rate:0.6,color:P.teal}],
};
function getMols(part: string) { return PART_MOLECULES[part] || PART_MOLECULES["Skin"]; }

/* ─── helpers ─────────────────────────────────────────────────── */
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function Card({ title, body, color = P.cyan, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.cyan }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS 1 — Robotic Hand Laser Network
   6 emitter nodes (thumb + 4 fingers + palm) on a robotic hand.
   Each emits a focused coherent beam at a different wavelength.
   Beams form a networked interference field in space.
   Species selector changes the target tissue silhouette behind hand.
   Beams auto-adjust wavelength + power to selected tissue/scenario.
   Phase coupling between beams shown as Kuramoto synchrony ring.
   Click a finger to boost that emitter.
═══════════════════════════════════════════════════════════════ */
function LaserHandCanvas({ speciesIdx, partIdx }: { speciesIdx: number; partIdx: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerRef  = useRef(1.0);
  const [power, setPower] = useState(1.0);
  const specRef = useRef(speciesIdx); const partRef = useRef(partIdx);
  const boostRef = useRef<number | null>(null);
  useEffect(() => { specRef.current = speciesIdx; }, [speciesIdx]);
  useEffect(() => { partRef.current = partIdx; }, [partIdx]);
  useEffect(() => { powerRef.current = power; }, [power]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cv = canvasRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const W = rect.width, H = rect.height;
    // Emitter tip positions (fractional of canvas) — 5 fingers + palm
    const tips = [
      [0.30, 0.12], [0.42, 0.10], [0.54, 0.10], [0.66, 0.12], [0.74, 0.20], [0.52, 0.55],
    ];
    let best = -1, bestD = 30;
    tips.forEach(([fx, fy], i) => {
      const d = Math.hypot(mx - fx * W, my - fy * H);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0) boostRef.current = best;
  }, []);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    // Emitter wavelengths (nm)
    const WAVS = [630, 660, 780, 808, 850, 940];
    const COLS = [P.laser630, P.laser660, P.laser780, P.laser808, P.laser850, P.laser940];
    // Kuramoto phases
    const phases = WAVS.map((_, i) => (i / WAVS.length) * Math.PI * 2);
    const phaseVel = WAVS.map(w => 0.018 + (w - 630) / 6200);

    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const sp = SPECIES[specRef.current];
      const pw = powerRef.current;
      const boost = boostRef.current;

      // Update Kuramoto phases
      for (let i = 0; i < phases.length; i++) {
        let sync = 0;
        for (let j = 0; j < phases.length; j++) {
          if (j !== i) sync += 0.04 * Math.sin(phases[j] - phases[i]);
        }
        phases[i] = (phases[i] + phaseVel[i] + sync) % (Math.PI * 2);
      }

      // ── Hand silhouette ──────────────────────────────────────
      // Finger emitter tip positions
      const tipFrac = [
        [0.30, 0.12], [0.42, 0.10], [0.54, 0.10], [0.66, 0.12], [0.74, 0.20], [0.52, 0.55],
      ];
      const tips = tipFrac.map(([fx, fy]) => ({ x: fx * W, y: fy * H }));
      // Palm centre
      const palmX = W * 0.50, palmY = H * 0.60;

      // Draw hand (stylised polygonal robotic fingers)
      ctx.strokeStyle = "rgba(0,200,255,0.25)"; ctx.lineWidth = 2;
      // Palm
      ctx.fillStyle = "rgba(0,50,80,0.45)";
      ctx.beginPath(); ctx.ellipse(palmX, palmY, W * 0.20, H * 0.22, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Fingers
      const fingerBases = [
        [0.30, 0.32], [0.42, 0.30], [0.54, 0.30], [0.66, 0.32], [0.74, 0.40],
      ];
      fingerBases.forEach(([fx, fy], fi) => {
        const bx = fx * W, by = fy * H;
        const tx = tips[fi].x, ty = tips[fi].y;
        const w2 = W * 0.04;
        ctx.fillStyle = "rgba(0,40,70,0.65)";
        ctx.beginPath();
        ctx.moveTo(bx - w2 / 2, by); ctx.lineTo(bx + w2 / 2, by);
        ctx.lineTo(tx + w2 * 0.3, ty); ctx.lineTo(tx - w2 * 0.3, ty);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(0,200,255,0.3)"; ctx.lineWidth = 1.2;
        ctx.stroke();
        // Emitter socket
        const isBoost = boost === fi;
        const r2 = isBoost ? 12 : 8;
        const grd = ctx.createRadialGradient(tx, ty, 0, tx, ty, r2 + 6);
        grd.addColorStop(0, COLS[fi] + "cc"); grd.addColorStop(1, COLS[fi] + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(tx, ty, r2 + 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLS[fi]; ctx.beginPath(); ctx.arc(tx, ty, r2, 0, Math.PI * 2); ctx.fill();
      });
      // Palm emitter
      const palmTip = tips[5];
      const palmGrd = ctx.createRadialGradient(palmTip.x, palmTip.y, 0, palmTip.x, palmTip.y, 18);
      palmGrd.addColorStop(0, P.gold + "cc"); palmGrd.addColorStop(1, P.gold + "00");
      ctx.fillStyle = palmGrd; ctx.beginPath(); ctx.arc(palmTip.x, palmTip.y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(palmTip.x, palmTip.y, 10, 0, Math.PI * 2); ctx.fill();

      // ── Target silhouette (right side, behind beams) ──────────
      const targetX = W * 0.80, targetY = H * 0.50;
      ctx.fillStyle = sp.color + "12"; ctx.strokeStyle = sp.color + "40"; ctx.lineWidth = 1.5;
      const sp2 = specRef.current;
      if (sp2 === 0) { // Human body cross-section
        ctx.beginPath(); ctx.ellipse(targetX, targetY, W * 0.10, H * 0.38, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(targetX, targetY - H * 0.10, W * 0.07, W * 0.07, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      } else if (sp2 === 1) { // Horse body
        ctx.beginPath(); ctx.ellipse(targetX, targetY, W * 0.12, H * 0.25, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(targetX - W * 0.06, targetY + H * 0.25); ctx.lineTo(targetX - W * 0.04, targetY + H * 0.45); ctx.lineTo(targetX - W * 0.02, targetY + H * 0.45); ctx.lineTo(targetX + W * 0.04, targetY + H * 0.25); ctx.stroke();
      } else if (sp2 === 2) { // Dolphin
        ctx.beginPath(); ctx.ellipse(targetX, targetY, W * 0.14, H * 0.20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Flukes
        ctx.beginPath(); ctx.moveTo(targetX + W * 0.14, targetY); ctx.quadraticCurveTo(targetX + W * 0.20, targetY - H * 0.10, targetX + W * 0.22, targetY - H * 0.15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(targetX + W * 0.14, targetY); ctx.quadraticCurveTo(targetX + W * 0.20, targetY + H * 0.10, targetX + W * 0.22, targetY + H * 0.15); ctx.stroke();
      } else { // Shark
        ctx.beginPath(); ctx.ellipse(targetX, targetY, W * 0.15, H * 0.17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Dorsal fin
        ctx.beginPath(); ctx.moveTo(targetX, targetY - H * 0.17); ctx.lineTo(targetX + W * 0.04, targetY - H * 0.35); ctx.lineTo(targetX + W * 0.08, targetY - H * 0.17); ctx.stroke();
      }
      // Tissue depth rings
      const muA = sp.mu_a[partRef.current] ?? 0.2;
      [0.15, 0.30, 0.50, 0.75].forEach((frac, ri) => {
        const depthAlpha = Math.exp(-muA * ri * 1.5) * 0.3;
        ctx.strokeStyle = `${sp.color}${Math.round(depthAlpha * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(targetX, targetY, W * (0.10 + frac * 0.06), H * (0.38 - frac * 0.12), 0, 0, Math.PI * 2); ctx.stroke();
      });
      // Target part label
      ctx.fillStyle = sp.color; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(sp.emoji + " " + sp.label.toUpperCase() + " · " + (sp.parts[partRef.current] ?? "Skin").toUpperCase(), targetX, H - 12);

      // ── Draw laser beams from each emitter to target ──────────
      const targetPt = { x: targetX + W * (Math.random() * 0.01 - 0.005), y: targetY };
      tips.forEach((tip, fi) => {
        const isBoostBeam = boost === fi;
        const ph = phases[fi];
        const intensity = pw * (isBoostBeam ? 1.8 : 1.0);
        const col = fi < COLS.length ? COLS[fi] : P.gold;
        // Main beam
        const grad = ctx.createLinearGradient(tip.x, tip.y, targetPt.x, targetPt.y);
        grad.addColorStop(0, col + Math.round(intensity * 220).toString(16).padStart(2, "0"));
        grad.addColorStop(0.7, col + "44");
        grad.addColorStop(1.0, col + "00");
        ctx.strokeStyle = grad; ctx.lineWidth = isBoostBeam ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(targetPt.x, targetPt.y); ctx.stroke();

        // Phase wave ripples along beam
        const dx = targetPt.x - tip.x, dy = targetPt.y - tip.y, beamLen = Math.hypot(dx, dy);
        const nx = dx / beamLen, ny = dy / beamLen;
        const perpX = -ny, perpY = nx;
        const RIPPLES = 6;
        for (let ri = 0; ri < RIPPLES; ri++) {
          const pos = ((ri / RIPPLES + t * 0.015 + fi * 0.12) % 1);
          const px2 = tip.x + dx * pos, py2 = tip.y + dy * pos;
          const amp = 5 * Math.sin(ph + ri);
          ctx.fillStyle = col + "66";
          ctx.beginPath(); ctx.arc(px2 + perpX * amp, py2 + perpY * amp, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      // ── Network interference nodes (where beams cross) ───────
      for (let a = 0; a < tips.length - 1; a++) {
        for (let b = a + 1; b < tips.length; b++) {
          const midX = (tips[a].x + tips[b].x) / 2 + (targetPt.x - W * 0.5) * 0.2;
          const midY = (tips[a].y + tips[b].y) / 2 + (targetPt.y - H * 0.5) * 0.2;
          const phaseDiff = phases[a] - phases[b];
          const coherence = 0.5 + 0.5 * Math.cos(phaseDiff);
          const col2 = coherence > 0.8 ? P.cyan : coherence > 0.5 ? P.teal : P.violet;
          ctx.fillStyle = col2 + Math.round(coherence * 60).toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(midX, midY, 3 + coherence * 4, 0, Math.PI * 2); ctx.fill();
        }
      }

      // ── Kuramoto synchrony ring (top right) ──────────────────
      const ringX = W - 50, ringY = 50, ringR = 32;
      ctx.strokeStyle = P.line; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(ringX, ringY, ringR, 0, Math.PI * 2); ctx.stroke();
      phases.forEach((ph, i) => {
        const col2 = i < COLS.length ? COLS[i] : P.gold;
        const rx = ringX + Math.cos(ph) * ringR, ry2 = ringY + Math.sin(ph) * ringR;
        ctx.fillStyle = col2; ctx.beginPath(); ctx.arc(rx, ry2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col2 + "44"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ringX, ringY); ctx.lineTo(rx, ry2); ctx.stroke();
      });
      // Order parameter R
      let sx = 0, sy = 0; phases.forEach(ph => { sx += Math.cos(ph); sy += Math.sin(ph); });
      const R = Math.hypot(sx, sy) / phases.length;
      ctx.fillStyle = R > 0.8 ? P.green : R > 0.5 ? P.gold : P.rose;
      ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("R=" + R.toFixed(2), ringX, ringY + 3);
      ctx.fillStyle = P.muted; ctx.font = "6px monospace";
      ctx.fillText("SYNC", ringX, ringY + 44);

      // ── Beam wavelength legend ─────────────────────────────────
      ctx.textAlign = "left";
      WAVS.forEach((w, i) => {
        const lc = i < COLS.length ? COLS[i] : P.gold;
        ctx.fillStyle = lc; ctx.fillRect(8, 18 + i * 13, 18, 2);
        ctx.fillStyle = P.dim; ctx.font = "7px monospace";
        ctx.fillText(`${w} nm — ${["Skin", "Superfic.", "Muscle", "Deep musc.", "Bone", "NIR deep"][i]}`, 30, 21 + i * 13);
      });
      ctx.fillStyle = P.gold; ctx.font = "7px monospace";
      ctx.fillText("PALM · MASTER", 30, 21 + 6 * 13);

      ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("NETWORKED LASER HAND · 6 EMITTERS · KURAMOTO PHASE SYNC", 8, 14);

      if (boost !== null && t % 60 === 0) boostRef.current = null;

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: "100%", height: 440, display: "block", cursor: "crosshair" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.cyan, marginBottom: 3 }}>Beam Power · {(power * 100).toFixed(0)} %</div>
          <input type="range" min={0.1} max={3.0} step={0.05} value={power} onChange={e => setPower(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.85, maxWidth: 520 }}>
          <strong style={{ color: P.cyan }}>Click any finger</strong> to boost that emitter. The Kuramoto ring (top-right) shows phase synchronisation R — when R → 1 all beams are coherent and form constructive interference at the target. Network interference nodes glow cyan (coherent) or violet (decoherent) where beams cross.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS 2 — Tissue Depth Photobiomodulation
   Cross-section of selected tissue. Beer-Lambert attenuation.
   I(z) = I₀ · e^{−μ_a(λ) · z}
   6 beams shown at different depths. Each stimulates different
   organelles: mitochondria, fibroblasts, osteoblasts, axon nodes.
   Shows the cascade: photon → cytochrome c → ATP → downstream.
   Healing progress bar rises in real time.
═══════════════════════════════════════════════════════════════ */
function TissueDepthCanvas({ speciesIdx, partIdx }: { speciesIdx: number; partIdx: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef(speciesIdx); const partRef = useRef(partIdx);
  const healRef = useRef(0);
  useEffect(() => { specRef.current = speciesIdx; }, [speciesIdx]);
  useEffect(() => { partRef.current = partIdx; }, [partIdx]);
  // Reset healing when species/part changes
  useEffect(() => { healRef.current = 0; }, [speciesIdx, partIdx]);

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);

    const WAVS = [630, 660, 780, 808, 850, 940];
    const COLS = [P.laser630, P.laser660, P.laser780, P.laser808, P.laser850, P.laser940];
    // Penetration depths for each wavelength (mm in human tissue, scaled for canvas)
    const DEPTH_MM = [8, 10, 20, 25, 35, 40];
    // Tissue layers: name, colour, depth_start_mm, depth_end_mm
    const TISSUE_LAYERS = [
      { name: "Epidermis",     col: "#8b6a52", d0: 0,   d1: 1.5  },
      { name: "Dermis",        col: "#c4724a", d0: 1.5, d1: 5    },
      { name: "Subcutaneous",  col: "#e8a878", d0: 5,   d1: 12   },
      { name: "Fascia",        col: "#6a8a7a", d0: 12,  d1: 14   },
      { name: "Muscle",        col: "#b03838", d0: 14,  d1: 35   },
      { name: "Periosteum",    col: "#607090", d0: 35,  d1: 37   },
      { name: "Bone",          col: "#c8d8e8", d0: 37,  d1: 55   },
    ];
    const MAX_DEPTH_MM = 55;

    // Mitochondrial "sparks" at beam targets
    const sparks: Array<{ x: number; y: number; life: number; col: string; layer: number }> = [];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const sp = SPECIES[specRef.current];
      const muA = sp.mu_a[partRef.current] ?? 0.2;

      const tissuePanelW = W * 0.55;
      const tissuePanelH = H - 60;
      const tissuePanelY = 30;

      // ── Tissue layers ──────────────────────────────────────
      TISSUE_LAYERS.forEach(lyr => {
        const yTop = tissuePanelY + (lyr.d0 / MAX_DEPTH_MM) * tissuePanelH;
        const yBot = tissuePanelY + (lyr.d1 / MAX_DEPTH_MM) * tissuePanelH;
        ctx.fillStyle = lyr.col + "99"; ctx.fillRect(0, yTop, tissuePanelW, yBot - yTop);
        ctx.strokeStyle = lyr.col + "44"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(tissuePanelW, yTop); ctx.stroke();
        ctx.fillStyle = lyr.col + "cc"; ctx.font = "7px monospace"; ctx.textAlign = "left";
        ctx.fillText(lyr.name.toUpperCase(), 6, yTop + 9);
        // Depth ruler
        ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "right";
        ctx.fillText(`${lyr.d0.toFixed(0)}mm`, tissuePanelW - 4, yTop + 9);
      });

      // ── Beer-Lambert beams ─────────────────────────────────
      WAVS.forEach((lam, bi) => {
        const beamX = tissuePanelW * (0.10 + bi * 0.14);
        const col2 = COLS[bi];
        const d_max = DEPTH_MM[bi];
        const pixPerMM = tissuePanelH / MAX_DEPTH_MM;
        const d_maxPx = d_max * pixPerMM;

        // Draw beam profile with intensity fading per Beer-Lambert
        for (let z = 0; z < d_maxPx; z += 1.5) {
          const d_mm = z / pixPerMM;
          const I = Math.exp(-muA * d_mm * 0.2);
          const y2 = tissuePanelY + z;
          ctx.fillStyle = col2 + Math.max(8, Math.round(I * 180)).toString(16).padStart(2, "0");
          ctx.fillRect(beamX - 3, y2, 6, 2);
        }

        // Focal spot at penetration depth
        const focY = tissuePanelY + d_maxPx;
        const Ifocal = Math.exp(-muA * d_max * 0.2);
        const grd = ctx.createRadialGradient(beamX, focY, 0, beamX, focY, 12);
        grd.addColorStop(0, col2 + Math.round(Ifocal * 255).toString(16).padStart(2, "0"));
        grd.addColorStop(1, col2 + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(beamX, focY, 12, 0, Math.PI * 2); ctx.fill();

        // Spawn mitochondrial sparks
        if (t % 12 === bi * 2 && sparks.length < 60) {
          sparks.push({ x: beamX + (Math.random() - 0.5) * 18, y: focY + (Math.random() - 0.5) * 20, life: 1, col: col2, layer: bi });
        }

        // Wavelength label
        ctx.fillStyle = col2; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
        ctx.fillText(`${lam}nm`, beamX, tissuePanelY - 5);
        ctx.fillText(`${d_max}mm`, beamX, tissuePanelY + d_maxPx + 12);
      });

      // ── Mitochondrial sparks ───────────────────────────────
      for (let si = sparks.length - 1; si >= 0; si--) {
        const sp2 = sparks[si];
        sp2.life -= 0.018;
        if (sp2.life <= 0) { sparks.splice(si, 1); continue; }
        const alpha = sp2.life;
        const r = (1 - sp2.life) * 8;
        ctx.strokeStyle = sp2.col + Math.round(alpha * 200).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sp2.x, sp2.y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = sp2.col + Math.round(alpha * 160).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(sp2.x, sp2.y, 2, 0, Math.PI * 2); ctx.fill();
        // ATP label on fresh sparks
        if (sp2.life > 0.7) {
          ctx.fillStyle = P.green + "cc"; ctx.font = "6px monospace"; ctx.textAlign = "center";
          ctx.fillText("ATP", sp2.x, sp2.y - 8);
        }
      }

      // ── Healing progress (right panel) ────────────────────
      const rX = tissuePanelW + 16, rW = W - rX - 8;
      // Healing rate: dH/dt = kVEGF·C_NO + kTGF·H(1−H)
      const H_heal = healRef.current;
      const c_NO = 0.6 + 0.4 * Math.sin(t * 0.03);  // oscillating NO conc
      const dH = 0.00015 * (c_NO * 0.8 + H_heal * (1 - H_heal) * 0.9);
      healRef.current = Math.min(1, H_heal + dH);

      // Healing bar
      const barH = H * 0.55, barX = rX + 8, barTop = H * 0.10;
      ctx.fillStyle = P.panel2; ctx.fillRect(barX, barTop, rW - 16, barH);
      const healPx = (1 - H_heal) * barH;
      // Colour: red (0%) → gold (50%) → green (100%)
      const t3 = H_heal;
      const hr = Math.round(t3 < 0.5 ? 255 : 255 - (t3 - 0.5) * 2 * 180);
      const hg = Math.round(t3 < 0.5 ? 180 * t3 * 2 : 180 + (t3 - 0.5) * 2 * 75);
      const hb = Math.round(30);
      ctx.fillStyle = `rgba(${hr},${hg},${hb},0.8)`;
      ctx.fillRect(barX, barTop + healPx, rW - 16, barH - healPx);
      ctx.strokeStyle = sp.color + "44"; ctx.lineWidth = 1;
      ctx.strokeRect(barX, barTop, rW - 16, barH);

      // Timeline markers
      [0.2, 0.5, 0.8, 1.0].forEach((frac, mi) => {
        const ly = barTop + (1 - frac) * barH;
        ctx.strokeStyle = P.muted; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(barX, ly); ctx.lineTo(barX + rW - 16, ly); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "6px monospace"; ctx.textAlign = "right";
        ctx.fillText(`${Math.round(frac * 100)}%`, barX - 2, ly + 3);
      });

      // Labels
      ctx.fillStyle = sp.color; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("HEALING", barX + (rW - 16) / 2, barTop - 6);
      ctx.fillStyle = `rgb(${hr},${hg},${hb})`; ctx.font = "bold 12px monospace";
      ctx.fillText((H_heal * 100).toFixed(1) + "%", barX + (rW - 16) / 2, barTop + barH + 16);

      // Molecule readouts
      const mols = getMols(sp.parts[partRef.current] ?? "Skin");
      mols.forEach((mol, mi) => {
        const molY = H * 0.75 + mi * 16;
        const conc = Math.min(1, H_heal * mol.rate * (1 + 0.3 * Math.sin(t * 0.04 + mi)));
        ctx.fillStyle = P.panel2; ctx.fillRect(barX, molY, rW - 16, 11);
        ctx.fillStyle = mol.color + "cc"; ctx.fillRect(barX, molY, (rW - 16) * conc, 11);
        ctx.fillStyle = P.ivory; ctx.font = "7px monospace"; ctx.textAlign = "left";
        ctx.fillText(`${mol.name} · ${mol.role}`, barX + 3, molY + 8);
        ctx.fillStyle = mol.color; ctx.textAlign = "right";
        ctx.fillText((conc * 100).toFixed(0) + "%", barX + rW - 20, molY + 8);
      });
      ctx.fillStyle = sp.color; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText("MOLECULES SYNTHESISED", barX + (rW - 16) / 2, H * 0.74);

      // Title
      ctx.fillStyle = P.teal; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`TISSUE DEPTH · BEER-LAMBERT I(z)=I₀e^{−μ_a·z} · ${sp.emoji} ${sp.label} · ${sp.parts[partRef.current] ?? "Skin"}`, 8, 14);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText(`μ_a = ${muA.toFixed(2)} cm⁻¹ · dH/dt = k_VEGF·C_NO + k_TGF·H(1−H) · ATP sparks at focal depth`, 8, H - 6);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />;
}

/* ═══════════════════════════════════════════════════════════════
   CANVAS 3 — Molecular Synthesis Network
   Directed graph: Photon → Organelle → Molecule → Tissue → Healing
   Nodes pulse with flow. Selected body-part changes the graph.
   Shows the laser's chemical programme for this exact scenario.
   Animated flow dots travel along edges.
═══════════════════════════════════════════════════════════════ */
function MolNetworkCanvas({ speciesIdx, partIdx }: { speciesIdx: number; partIdx: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specRef = useRef(speciesIdx); const partRef = useRef(partIdx);
  useEffect(() => { specRef.current = speciesIdx; }, [speciesIdx]);
  useEffect(() => { partRef.current = partIdx; }, [partIdx]);

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

      const sp = SPECIES[specRef.current];
      const partName = sp.parts[partRef.current] ?? "Skin";
      const mols = getMols(partName);

      // ── Node layout ────────────────────────────────────────
      // 5 layers: Photon → Organelle → Molecule → Tissue → Healing
      const nodes: Array<{ x: number; y: number; label: string; col: string; r: number; pulse: number }> = [];
      // Layer 0: Source (photons, 6 beams)
      const WAVS = [630, 660, 780, 808, 850, 940];
      const COLS = [P.laser630, P.laser660, P.laser780, P.laser808, P.laser850, P.laser940];
      WAVS.forEach((w, i) => {
        nodes.push({ x: W * 0.06, y: H * (0.12 + i * 0.14), label: `${w}nm`, col: COLS[i], r: 14, pulse: t * 0.04 + i });
      });
      // Layer 1: Organelles (3 key targets)
      const orgs = [
        { label: "Cyt-c-ox", col: P.cyan },
        { label: "Mitochondria", col: P.green },
        { label: "Nucleus", col: P.violet },
      ];
      orgs.forEach((o, i) => { nodes.push({ x: W * 0.27, y: H * (0.22 + i * 0.28), label: o.label, col: o.col, r: 18, pulse: t * 0.035 + i * 1.5 }); });
      // Layer 2: Molecules (from part config)
      mols.forEach((mol, i) => { nodes.push({ x: W * 0.52, y: H * (0.15 + i * 0.22), label: mol.name, col: mol.color, r: 16, pulse: t * 0.03 + i * 2 }); });
      // Layer 3: Tissue effects (3)
      const effects = [
        { label: "Angiogenesis", col: P.red },
        { label: "Proliferation", col: P.green },
        { label: "Collagen Dep.", col: P.gold },
      ];
      effects.forEach((e, i) => { nodes.push({ x: W * 0.76, y: H * (0.25 + i * 0.25), label: e.label, col: e.col, r: 16, pulse: t * 0.028 + i * 2.5 }); });
      // Layer 4: Healing (1)
      nodes.push({ x: W * 0.94, y: H * 0.50, label: "HEALED", col: P.cyan, r: 20, pulse: t * 0.025 });

      // ── Edges (photon→organelle, organelle→mol, mol→effect, effect→heal) ─
      const edges: Array<{ a: number; b: number; col: string; flow: number }> = [];
      // photon → organelle
      WAVS.forEach((_, pi) => {
        [0, 1, 2].forEach(oi => {
          if ((pi + oi) % 2 === 0) edges.push({ a: pi, b: 6 + oi, col: COLS[pi], flow: 0.016 + pi * 0.002 });
        });
      });
      // organelle → molecule
      orgs.forEach((_, oi) => {
        mols.forEach((_, mi) => {
          if ((oi + mi) % 2 === 0 || mi < 2) edges.push({ a: 6 + oi, b: 9 + mi, col: orgs[oi].col, flow: 0.012 + mi * 0.003 });
        });
      });
      // molecule → effect
      mols.forEach((_, mi) => {
        effects.forEach((_, ei) => {
          if ((mi + ei) % 3 !== 2) edges.push({ a: 9 + mi, b: 9 + mols.length + ei, col: mols[mi].color, flow: 0.010 });
        });
      });
      // effect → heal
      effects.forEach((_, ei) => {
        edges.push({ a: 9 + mols.length + ei, b: nodes.length - 1, col: effects[ei].col, flow: 0.009 + ei * 0.002 });
      });

      // ── Draw edges ────────────────────────────────────────
      edges.forEach(e => {
        if (e.a >= nodes.length || e.b >= nodes.length) return;
        const A = nodes[e.a], B = nodes[e.b];
        const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
        grad.addColorStop(0, e.col + "40"); grad.addColorStop(1, e.col + "15");
        ctx.strokeStyle = grad; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        // Flow dots
        const prog = (t * e.flow) % 1;
        const fx = A.x + (B.x - A.x) * prog;
        const fy = A.y + (B.y - A.y) * prog;
        ctx.fillStyle = e.col + "cc"; ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
        // Second dot offset by 0.5
        const prog2 = (t * e.flow + 0.5) % 1;
        const fx2 = A.x + (B.x - A.x) * prog2, fy2 = A.y + (B.y - A.y) * prog2;
        ctx.fillStyle = e.col + "66"; ctx.beginPath(); ctx.arc(fx2, fy2, 2, 0, Math.PI * 2); ctx.fill();
      });

      // ── Draw nodes ────────────────────────────────────────
      nodes.forEach((nd, ni) => {
        const pulse = 0.85 + 0.15 * Math.sin(nd.pulse);
        // Glow
        const grd = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, nd.r * 2);
        grd.addColorStop(0, nd.col + "55"); grd.addColorStop(1, nd.col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * 2, 0, Math.PI * 2); ctx.fill();
        // Circle
        ctx.fillStyle = nd.col + Math.round(pulse * 140).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = nd.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * pulse, 0, Math.PI * 2); ctx.stroke();
        // Label
        ctx.fillStyle = "#fff"; ctx.font = `${nd.label.length > 8 ? 6 : 7}px monospace`; ctx.textAlign = "center";
        ctx.fillText(nd.label, nd.x, nd.y + 3);
        // Node index (for the last node: "HEALED" with emoji)
        if (ni === nodes.length - 1) {
          ctx.fillStyle = P.cyan; ctx.font = "bold 9px monospace";
          ctx.fillText("✓ " + nd.label, nd.x, nd.y + 3);
        }
      });

      // ── Layer labels ──────────────────────────────────────
      [
        { x: W * 0.06, label: "PHOTON" },
        { x: W * 0.27, label: "ORGANELLE" },
        { x: W * 0.52, label: "MOLECULE" },
        { x: W * 0.76, label: "TISSUE FX" },
        { x: W * 0.94, label: "HEALED" },
      ].forEach(l => {
        ctx.fillStyle = P.muted; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
        ctx.fillText(l.label, l.x, H - 8);
      });

      ctx.fillStyle = P.teal; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`MOLECULAR SYNTHESIS NETWORK · ${sp.emoji} ${sp.label} · ${partName} · SCENARIO: ${sp.parts[partRef.current] ?? "Skin"}`, 8, 14);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block" }} />;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function LaserRegenPage() {
  const [speciesIdx, setSpeciesIdx] = useState(0);
  const [partIdx, setPartIdx] = useState(0);
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);
  const sp = SPECIES[speciesIdx];

  const images = [
    {
      src: skyrmion, caption: "Topological Coherence · The Laser's Spin Field",
      anno: "The laser beam is not just photons — it is a coherent spin field C(x,t) = A(x)e^{i(φ−ωt)} carrying angular momentum at every point along its path. In photobiomodulation, it is specifically the circular polarisation (spin angular momentum ±ℏ per photon) that determines which cytochrome c oxidase conformational state is accessed. The a₃ copper centre has a specific angular momentum absorption cross-section. Linearly polarised light couples to both states equally; right- or left-circularly polarised light selects one — a quantum switch. The skyrmion lattice shown here is the spatial spin-texture analogue of this field: topologically locked rotations that cannot be erased by continuous deformation, exactly like the stable photobiomodulation window (600–1000 nm) that persists despite all the competing absorption processes of water, haemoglobin, and melanin.",
      chips: ["Circular Polarisation", "Cytochrome c Oxidase", "Spin Angular Momentum", "Photobiomodulation Window", "Topological Stability", "a₃ Copper Centre"],
    },
    {
      src: magStorm, caption: "Solar Plasma Network · Pre-Programmed for Scale",
      anno: "The solar corona is a pre-programmed laser network at planetary scale — magnetic field lines guide plasma (ions) exactly as the robotic hand guides photons to target tissue. 'Pre-programmed' in the solar context means the field topology is set by subsurface convection and frozen into the corona during formation. 'Scenario-adaptive' in the solar context means the corona reconfigures via magnetic reconnection when the scenario changes (solar flare, CME). The bio-laser network replicates this: a pre-set field topology (fibre-optic waveguide array in the robotic hand) that reconfigures per-scenario (human bone vs dolphin blubber) by selecting wavelength, pulse rate, and focal depth. Both systems obey the same physics: minimise free energy (reconnection → lowest-energy field topology; bio-laser → minimum fluence for maximum tissue response).",
      chips: ["Magnetic Reconnection", "Pre-Programmed Topology", "Scenario Adaptive", "Minimum Fluence", "Free Energy Minimisation", "Guided Transport"],
    },
    {
      src: omniFlow, caption: "Omni-Flow Sensing Array · The Robotic Hand's Neural Network",
      anno: "The omni-flow array is the sensory mesh that makes the robotic hand intelligent. Each rhombic cell contains a micro-spectrometer (reads tissue autofluorescence), a pressure sensor (contact force), and a phase-sensitive detector (Doppler blood flow). The neural network running in the robotic arm's compute unit receives all sensor channels simultaneously and continuously updates the laser programme: increase 850 nm if bone is detected deeper than expected; shift to 660 nm and lower power if nerve tissue is near the surface; activate the palm emitter (master channel) for whole-field coherence if blood flow drops below threshold. The hand is the effector; the network is the intelligence. In AETHER terms: the sensor array reads C(x,t) at the tissue surface; the AI inverts it to find the volume coherence field; the laser programme is the control signal that maximises ∫C(x,t) dV over the healing volume.",
      chips: ["Micro-spectrometer", "Phase-Sensitive Detection", "Neural Network Control", "Autofluorescence Sensing", "Adaptive Laser Programme", "Coherence Field Inversion"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Bio-Regenerative Laser Network · Robotic Precision Healing · Every Species · Every Body Part · In a Time of Need" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.cyan }}>One Coherent Beam</span><br />
          <span style={{ color: P.teal }}>from a Networked</span> <span style={{ color: P.gold }}>Robotic Hand</span>
        </h1>
        <h2 style={{ fontSize: 19, fontWeight: 400, color: "#bfdbfe", margin: "0 0 20px", lineHeight: 1.5 }}>
          Pre-programmed for every scenario · self-networks and self-corrects · delivers the exact chemistry any body part needs to heal
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Six emitter nodes in a robotic hand — one at each fingertip, one in the palm — each firing a coherent laser beam at a specific wavelength tuned to a specific tissue depth. The beams don't operate independently: they are phase-coupled via a Kuramoto network, their interference nodes forming a three-dimensional coherence field at the target site. The hand reads its own output continuously (autofluorescence, Doppler, pressure) and reconfigures in real time. Select a species and a body part below — the system reprogrammes its wavelengths, penetration depths, and the specific molecular cascade it will trigger.
        </p>

        {/* SPECIES + PART SELECTORS */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {SPECIES.map((s, i) => (
            <button key={s.id} onClick={() => { setSpeciesIdx(i); setPartIdx(0); }}
              style={{ padding: "8px 16px", borderRadius: 9, border: `1.5px solid ${i === speciesIdx ? s.color : s.color + "40"}`, background: i === speciesIdx ? s.color + "22" : "transparent", color: i === speciesIdx ? s.color : P.dim, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {sp.parts.map((part, i) => (
            <button key={part} onClick={() => setPartIdx(i)}
              style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${i === partIdx ? sp.color : sp.color + "30"}`, background: i === partIdx ? sp.color + "18" : "transparent", color: i === partIdx ? sp.color : P.dim, cursor: "pointer", fontSize: 12 }}>
              {part}
            </button>
          ))}
        </div>
        <div style={{ padding: "10px 14px", background: P.panel2, borderRadius: 9, border: `1px solid ${sp.color}20`, maxWidth: 700, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: sp.color, fontWeight: 700, marginBottom: 4 }}>Scenario: {sp.emoji} {sp.label} · {sp.parts[partIdx]}</div>
          <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{sp.note}</div>
        </div>
      </div>

      <Divider />

      {/* SECTION I — LASER HAND */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · Networked Laser Hand · 6 Emitters · Kuramoto Phase Sync · Click Fingers to Boost" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "0 0 12px" }}>
          The Hand That Programmes Light for Living Tissue
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Each finger fires a different wavelength into the tissue volume. Beams phase-couple via Kuramoto synchronisation (top-right ring shows order parameter R). When R → 1, all beams are coherent and form constructive interference at the focal site — maximum photon density at the exact tissue layer that needs it. Click any finger to boost that emitter.
        </p>
        <LaserHandCanvas speciesIdx={speciesIdx} partIdx={partIdx} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="KURAMOTO PHASE SYNCHRONISATION" color={P.cyan}
            eq={"dφᵢ/dt = ωᵢ + Σⱼ Kᵢⱼ sin(φⱼ − φᵢ)\n\nOrder parameter: R = |Σⱼ e^{iφⱼ}| / N\n\nR = 0: fully decoherent (no net field)\nR = 1: fully coherent (maximum interference)\n\nCritical coupling: K_c = 2σ(ω)/π\nwhere σ = spread of natural frequencies"}
            note="6 laser beams with slightly different frequencies (one per wavelength). Kuramoto coupling pulls them toward a common phase — just as coupled oscillators synchronise. Maximum R gives constructive interference at the target volume, focusing energy without increasing per-beam power." />
          <EqBlock label="COHERENCE FIELD AT TARGET" color={P.teal}
            eq={"C(x,t) = Σᵢ Aᵢ · e^{i(φᵢ − ωᵢt − kᵢ·x)}\n\n|C|² = Σᵢ Aᵢ² + 2 Σᵢ<ⱼ AᵢAⱼ cos(Δφᵢⱼ)\n\nΔφᵢⱼ → 0 (Kuramoto sync) → |C|² → max\n\nPower density: I(x) = |C(x,t)|²\nThermal dose: H = ∫ I(x,t) dt\nEfficacy: E ∝ H × QY_cco (quantum yield)"}
            note="The photobiomodulation effect scales with the absorbed dose at the target organelle — not the surface power. Coherent delivery (all beams focused, in-phase) allows a low surface irradiance to produce a high absorbed dose at depth." />
        </div>
      </div>

      <Divider />

      {/* SECTION II — TISSUE DEPTH */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · Tissue Depth · Beer-Lambert · I(z) = I₀ · e^{−μ_a · z} · ATP Sparks at Focal Depth" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "0 0 12px" }}>
          {sp.emoji} {sp.label} · {sp.parts[partIdx]} · Penetration Map
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Beer-Lambert law: each wavelength decays exponentially through the tissue layers. Shorter wavelengths (630 nm) are absorbed within the first 8 mm (skin/dermis). NIR (850–940 nm) passes through to deep muscle and bone (30–40 mm). ATP sparks mark the focal depth of each beam. Healing progress is computed from the molecular synthesis cascade — watch the bar climb as the network synthesises its chemicals.
        </p>
        <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
          <TissueDepthCanvas speciesIdx={speciesIdx} partIdx={partIdx} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {getMols(sp.parts[partIdx]).map(mol => (
            <Card key={mol.name} title={mol.name} sub={mol.role} body={`Synthesised by photobiomodulation of ${sp.parts[partIdx]} tissue in ${sp.label}. Rate coefficient: ${mol.rate.toFixed(2)}. Target: ${mol.role}.`} color={mol.color} />
          ))}
        </div>
      </div>

      <Divider />

      {/* SECTION III — MOLECULAR NETWORK */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Molecular Synthesis Network · Photon → Organelle → Molecule → Tissue Effect → Healing" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>
          Pre-Programmed Chemical Engineering · {sp.emoji} {sp.label} · {sp.parts[partIdx]}
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The full chemical cascade from photon to healed tissue, visualised as a directed network graph. Flow dots show molecules being synthesised and transported. The laser hand's "programme" is this graph: different species, different body parts = different graph topology = different chemical targets. The network grows and self-corrects in real time — if a node (organelle or molecule) drops below threshold, the hand adjusts its beam parameters to re-feed that pathway.
        </p>
        <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
          <MolNetworkCanvas speciesIdx={speciesIdx} partIdx={partIdx} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="HEALING RATE EQUATION" color={P.violet}
            eq={"dH/dt = k_VEGF · C_NO(t) + k_TGF · H(1 − H)\n\nk_VEGF = 0.8 (angiogenic term)\nk_TGF  = 0.9 (autocatalytic growth)\nC_NO(t) = 0.6 + 0.4 sin(ωt)  (oscillating)\n\nSteady state: H* = 1  (full healing)\nTime to H=0.5: t₁/₂ = ln(2) / k_TGF\n≈ 0.77 / k_TGF  per beam session"}
            note="The logistic H(1−H) term is autocatalytic — healing accelerates once underway because new collagen scaffold supports more cells, more cells produce more growth factors, which attract more cells. The laser's job is to push H past the inflection point (H = 0.5)." />
          <EqBlock label="SELF-REGENERATING NETWORK" color={P.gold}
            eq={"Network state: S = {φ₁,...,φ₆, H, C_mol, Δμ_a}\n\nControl law (PID-ish):\nΔP_i(t) = K_p·(H* − H) + K_i·∫(H*−H)dt\n           + K_d·dH/dt\n\nWavelength re-select if Δμ_a/μ_a > 0.2\n(tissue changed — deeper/shallower)\n\nGrowth: add node if ∃ mol < threshold\nPrune: remove node if mol saturated"}
            note="The hand network grows by adding emitter nodes from an extension module (wrist-mounted) if the primary 6 cannot reach the required depth or area. It regenerates by hot-swapping a damaged emitter with a backup. The programme is pre-loaded per species/part but continuously updated by the sensor feedback loop." />
        </div>
      </div>

      <Divider />

      {/* SOURCE PLATES */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Source Plates" color={P.gold} />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 22 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img src={img.src} alt={img.caption} onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 240, objectFit: "cover" as const, objectPosition: "top" }} />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>)}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SYNTHESIS */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section V · AETHER Reading · The Coherence Field IS the Healing Programme" />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.cyan}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: P.ivory, lineHeight: 2.0 }}>
            The laser hand does not deliver heat. It does not deliver chemicals directly. It delivers <em style={{ color: P.cyan }}>coherent information</em> — a precisely structured electromagnetic field that the cell reads as a specific instruction. Cytochrome c oxidase is the transducer: it converts photon angular momentum into conformational energy, which changes the rate of the electron transport chain, which changes ATP production, which changes every downstream process. The robotic hand's pre-programme is a sequence of such instructions — ordered by wavelength, pulse timing, and spatial focusing — that together produce the exact chemical engineering any tissue needs. In a time of need, the network extends itself: it grows new sensing nodes, it recruits adjacent beams, it reprogrammes in real time. The hand regenerates by being the source of regeneration.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/spin-lattice","/larmor-field","/wave-collapse","/electron-field","/gradient-field","/aether-engine","/bioluminescence-spectrum","/nutritional-dna-key","/biomagnetism","/coherence-field-explorer"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
