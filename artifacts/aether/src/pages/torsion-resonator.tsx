import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#020408";
const PANEL  = "rgba(3,6,14,0.97)";
const BORDER = "#0a0f20";
const GOLD   = "#c9a84c";
const GOLD2  = "#f0d06a";
const CYAN   = "#2ef0d8";
const VIOLET = "#9966ff";
const INDIGO = "#6680ff";
const GREEN  = "#44ee88";
const LIME   = "#b0f040";
const DIM    = "#203860";
const TEXT   = "#b0c0d8";
const MUTED  = "#2a4060";
const EMBER  = "#ff8833";
const ROSE   = "#ff55aa";
const TEAL   = "#1fd4c8";
const AMBER  = "#e8c020";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

type CanvasTab = "spin" | "photorefractive" | "cavity";

/* ══════════ SPIN-TIME CANVAS ══════════ */
function SpinCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.008;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.85;

      // ── Time axis (vertical spine) ──
      ctx!.save(); ctx!.setLineDash([4, 6]);
      ctx!.strokeStyle = VIOLET + "40"; ctx!.lineWidth = 1;
      ctx!.beginPath(); ctx!.moveTo(cx, H * 0.04); ctx!.lineTo(cx, cy);
      ctx!.stroke(); ctx!.setLineDash([]); ctx!.restore();

      // ── Label axes ──
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = VIOLET + "70";
      ctx!.fillText("TIME ↑", cx, H*0.06);
      ctx!.fillStyle = CYAN + "70"; ctx!.textAlign = "left";
      ctx!.fillText("OUTWARD →", cx + 10, cy + 14);

      // ── Horizontal time planes (past snapshots) ──
      const planes = 7;
      for (let p = 0; p < planes; p++) {
        const py = cy - (p / planes) * H * 0.82;
        const rp = 30 + (p / planes) * W * 0.32;
        ctx!.beginPath();
        ctx!.ellipse(cx, py, rp, rp * 0.22, 0, 0, Math.PI * 2);
        const alpha = 0.04 + 0.04 * (p / planes);
        ctx!.strokeStyle = `rgba(153,102,255,${alpha})`;
        ctx!.lineWidth = 0.8; ctx!.stroke();
      }

      // ── Torsion helix (upward + outward) ──
      const steps = 280;
      const ωθ = 4.5 + Math.sin(T * 0.15) * 0.3; // angular frequency
      const rMax = W * 0.38;
      const r0   = 14;

      ctx!.beginPath();
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const θ = frac * ωθ * Math.PI + T * 0.6; // rotation angle
        const radius = r0 + frac * rMax;
        const x = cx + radius * Math.cos(θ);
        const yOff = frac * H * 0.8;
        const y = cy - yOff;
        const perspY = radius * Math.sin(θ) * 0.18; // 3D perspective tilt
        const yFinal = y + perspY;

        if (i === 0) ctx!.moveTo(x, yFinal);
        else ctx!.lineTo(x, yFinal);
      }
      // Gradient stroke
      const grad = ctx!.createLinearGradient(cx, cy, cx, cy - H * 0.8);
      grad.addColorStop(0, VIOLET + "cc");
      grad.addColorStop(0.4, CYAN + "cc");
      grad.addColorStop(0.75, GREEN + "aa");
      grad.addColorStop(1, LIME + "66");
      ctx!.strokeStyle = grad; ctx!.lineWidth = 2; ctx!.stroke();

      // ── Glow dots at helix nodes (resonance antinodes) ──
      const nodeCount = 8;
      for (let n = 1; n <= nodeCount; n++) {
        const frac = n / (nodeCount + 1);
        const θ = frac * ωθ * Math.PI + T * 0.6;
        const radius = r0 + frac * rMax;
        const x = cx + radius * Math.cos(θ);
        const y = cy - frac * H * 0.8 + radius * Math.sin(θ) * 0.18;
        const pulse = 0.7 + 0.3 * Math.sin(T * 3 + n * 1.1);
        const c = n < 3 ? VIOLET : n < 6 ? CYAN : GREEN;
        ctx!.beginPath(); ctx!.arc(x, y, 5 * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = c + "35"; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = c; ctx!.fill();
      }

      // ── Maser beams (horizontal, narrow, from sides) ──
      const beamYs = [0.25, 0.45, 0.62];
      beamYs.forEach((by, bi) => {
        const beamY = cy - by * H * 0.8;
        const phasedX = (T * 0.4 + bi * 1.8) % 1;
        // Left beam
        ctx!.beginPath();
        ctx!.moveTo(0, beamY);
        ctx!.lineTo(cx - 10, beamY);
        ctx!.strokeStyle = `rgba(46,240,216,${0.12 + 0.06*Math.sin(T*2+bi)})`;
        ctx!.lineWidth = 1.5; ctx!.stroke();
        // Right beam
        ctx!.beginPath();
        ctx!.moveTo(cx + 10, beamY);
        ctx!.lineTo(W, beamY);
        ctx!.strokeStyle = `rgba(153,102,255,${0.12 + 0.06*Math.sin(T*2+bi+1)})`;
        ctx!.lineWidth = 1.5; ctx!.stroke();
        // Pulse traveling along beam
        const px = phasedX * cx;
        ctx!.beginPath(); ctx!.arc(px, beamY, 2.5, 0, Math.PI*2);
        ctx!.fillStyle = CYAN + "cc"; ctx!.fill();
        const px2 = cx + phasedX * cx;
        ctx!.beginPath(); ctx!.arc(px2, beamY, 2.5, 0, Math.PI*2);
        ctx!.fillStyle = VIOLET + "cc"; ctx!.fill();
        // MASER label
        ctx!.font = `6px ${mono}`; ctx!.fillStyle = CYAN + "60";
        ctx!.textAlign = "left"; ctx!.fillText(`MASER ${bi+1}`, 4, beamY - 3);
      });

      // ── Resonator cavity boundary ──
      const cavW = W * 0.88, cavH = H * 0.75;
      const cavX = (W - cavW) / 2, cavY = cy - H * 0.77;
      ctx!.save(); ctx!.setLineDash([5, 8]);
      ctx!.strokeStyle = AMBER + "25"; ctx!.lineWidth = 1;
      ctx!.strokeRect(cavX, cavY, cavW, cavH);
      ctx!.setLineDash([]); ctx!.restore();
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = AMBER + "55";
      ctx!.textAlign = "right";
      ctx!.fillText("HIGH-Q RESONANT CAVITY", W - 8, cavY + 12);

      // ── Spin label ──
      ctx!.font = `bold 8px ${serif}`; ctx!.fillStyle = GOLD + "88";
      ctx!.textAlign = "left";
      ctx!.fillText(`ω = ${(4.2 + Math.sin(T*0.2)*0.3).toFixed(3)} rad·s⁻¹`, 8, H - 12);
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = VIOLET + "66";
      ctx!.fillText(`L = I·ω   r = r₀ + k·t   θ = ω·t`, 8, H - 26);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:260 }} />;
}

/* ══════════ PHOTOREFRACTIVE CANVAS ══════════ */
function PhotoCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.01;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const padL = 56, padR = 20, padT = 16, padB = 36;
      const pW = W - padL - padR, pH = H - padT - padB;
      const ox = padL, oy = padT + pH;

      // Grid
      ctx!.strokeStyle = MUTED + "40"; ctx!.lineWidth = 0.5;
      for (let g = 0; g <= 5; g++) {
        const gx = ox + (g/5)*pW;
        ctx!.beginPath(); ctx!.moveTo(gx, padT); ctx!.lineTo(gx, oy); ctx!.stroke();
      }
      for (let g = 0; g <= 4; g++) {
        const gy = padT + (g/4)*pH;
        ctx!.beginPath(); ctx!.moveTo(ox, gy); ctx!.lineTo(ox+pW, gy); ctx!.stroke();
      }

      // Axes
      ctx!.strokeStyle = DIM + "cc"; ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.moveTo(ox, padT); ctx!.lineTo(ox, oy+16); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(ox-10, oy); ctx!.lineTo(ox+pW, oy); ctx!.stroke();
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = TEXT + "88";
      ctx!.fillText("Δn", ox - 4, padT + 6);
      ctx!.textAlign = "center"; ctx!.fillText("Intensity I (W/cm²)", ox + pW/2, oy + 28);
      // Y axis labels
      ["Δn_sat", "0.75·Δn_sat", "0.5·Δn_sat", "0.25·Δn_sat"].forEach((l,i) => {
        const y = padT + (i/3.0)*pH;
        ctx!.textAlign = "right"; ctx!.font = `6px ${mono}`;
        ctx!.fillStyle = CYAN + "70"; ctx!.fillText(l, ox-4, y+3);
      });

      // Kerr curve: Δn = Δn_sat · I / (I + Is)
      // Normalized: n(x) = x / (x + 0.3) where x goes 0 → 1
      ctx!.beginPath();
      for (let px = 0; px <= pW; px++) {
        const xN = px / pW;
        const Is = 0.28; // saturation intensity (normalized)
        const n = xN / (xN + Is);
        const y = oy - n * pH;
        if (px === 0) ctx!.moveTo(ox + px, y);
        else ctx!.lineTo(ox + px, y);
      }
      const kGrad = ctx!.createLinearGradient(ox, 0, ox+pW, 0);
      kGrad.addColorStop(0, CYAN + "cc");
      kGrad.addColorStop(0.4, GREEN + "cc");
      kGrad.addColorStop(0.75, AMBER + "bb");
      kGrad.addColorStop(1, ROSE + "99");
      ctx!.strokeStyle = kGrad; ctx!.lineWidth = 2.5; ctx!.stroke();

      // Kerr-linear approximation (low I regime)
      ctx!.beginPath();
      const kEnd = pW * 0.28;
      ctx!.moveTo(ox, oy);
      ctx!.lineTo(ox + kEnd, oy - (kEnd/pW)/(0.28)*pH*0.5);
      ctx!.strokeStyle = CYAN + "55"; ctx!.lineWidth = 1; ctx!.setLineDash([4,5]);
      ctx!.stroke(); ctx!.setLineDash([]);

      // Damage threshold vertical
      const dmgX = ox + pW * 0.82;
      ctx!.beginPath(); ctx!.moveTo(dmgX, padT); ctx!.lineTo(dmgX, oy);
      ctx!.strokeStyle = ROSE + "70"; ctx!.lineWidth = 1; ctx!.setLineDash([3,5]);
      ctx!.stroke(); ctx!.setLineDash([]);
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = ROSE + "cc"; ctx!.textAlign = "center";
      ctx!.fillText("I_damage", dmgX, padT + 9);

      // Two-photon onset
      const tpaX = ox + pW * 0.62;
      ctx!.beginPath(); ctx!.moveTo(tpaX, padT); ctx!.lineTo(tpaX, oy);
      ctx!.strokeStyle = AMBER + "55"; ctx!.lineWidth = 1; ctx!.setLineDash([2,6]);
      ctx!.stroke(); ctx!.setLineDash([]);
      ctx!.font = `6px ${mono}`; ctx!.fillStyle = AMBER + "99"; ctx!.textAlign = "center";
      ctx!.fillText("2PA onset", tpaX, padT + 9);

      // Probe pulse (animated)
      const probeX = ox + ((Math.sin(T * 0.5) + 1) / 2) * pW;
      const probeIs = 0.28, xN = (probeX-ox)/pW;
      const probeN = xN / (xN + probeIs);
      const probeY = oy - probeN * pH;
      ctx!.beginPath(); ctx!.arc(probeX, probeY, 5, 0, Math.PI*2);
      ctx!.fillStyle = GREEN + "50"; ctx!.fill();
      ctx!.beginPath(); ctx!.arc(probeX, probeY, 2.5, 0, Math.PI*2);
      ctx!.fillStyle = GREEN; ctx!.fill();
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = GREEN + "cc"; ctx!.textAlign = "left";
      ctx!.fillText(`Δn = ${(probeN * 1).toFixed(3)}·Δn_sat`, probeX + 7, probeY - 3);

      // Region labels
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center";
      ctx!.fillStyle = CYAN + "80";
      ctx!.fillText("Kerr linear\nΔn = n₂·I", ox + pW*0.13, oy - pH*0.65);
      ctx!.fillStyle = GREEN + "70";
      ctx!.fillText("Saturation\nregime", ox + pW*0.42, oy - pH*0.9);
      ctx!.fillStyle = AMBER + "80";
      ctx!.fillText("2PA", ox + pW*0.73, oy - pH*0.92);
      ctx!.fillStyle = ROSE + "80";
      ctx!.fillText("DAMAGE", ox + pW*0.91, oy - pH*0.7);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:230 }} />;
}

/* ══════════ CAVITY MODE CANVAS ══════════ */
function CavityCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const cavL = W * 0.08, cavR = W * 0.92;
      const midY = H / 2;
      const cavH = H * 0.38;

      // Cavity walls (mirrors)
      [cavL, cavR].forEach(cx => {
        ctx!.fillStyle = INDIGO + "60";
        ctx!.fillRect(cx - 5, midY - cavH, 10, cavH * 2);
        ctx!.strokeStyle = INDIGO; ctx!.lineWidth = 1.5;
        ctx!.strokeRect(cx - 5, midY - cavH, 10, cavH * 2);
        // Mirror label
        ctx!.font = `7px ${mono}`; ctx!.fillStyle = INDIGO + "cc";
        ctx!.textAlign = "center";
        ctx!.fillText(cx < W/2 ? "M₁" : "M₂", cx, midY - cavH - 6);
      });

      // Isotope resonance lines
      const isotopes = [
        { symbol:"¹³³Cs", color:GOLD,   mode:3, label:"9.193 GHz" },
        { symbol:"⁸⁷Rb",  color:CYAN,   mode:5, label:"6.835 GHz" },
        { symbol:"²H",    color:VIOLET, mode:7, label:"327 MHz" },
        { symbol:"³He",   color:GREEN,  mode:9, label:"8.665 GHz" },
      ];

      // Standing wave modes
      const modeCount = 4;
      const spacing = cavH * 0.4;
      isotopes.forEach((iso, mi) => {
        const lineY = midY - spacing * 1.5 + mi * spacing;
        const λModes = iso.mode;
        const cavWidth = cavR - cavL;

        // Standing wave (superposition of two counter-propagating waves)
        ctx!.beginPath();
        const pts = 200;
        for (let i = 0; i <= pts; i++) {
          const x = cavL + (i/pts) * cavWidth;
          const phase1 = (i/pts) * λModes * Math.PI + T * 1.5;
          const phase2 = (i/pts) * λModes * Math.PI - T * 1.5;
          const standing = Math.sin(phase1) + Math.sin(phase2);
          const y = lineY + standing * cavH * 0.065;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = iso.color + "cc"; ctx!.lineWidth = 1.5; ctx!.stroke();

        // Antinode dots
        for (let n = 0; n <= λModes; n++) {
          const ax = cavL + (n / λModes) * cavWidth;
          const pulse = 0.6 + 0.4 * Math.abs(Math.sin(T * 1.5));
          ctx!.beginPath(); ctx!.arc(ax, lineY, 3.5 * pulse, 0, Math.PI*2);
          ctx!.fillStyle = iso.color + "30"; ctx!.fill();
          ctx!.beginPath(); ctx!.arc(ax, lineY, 1.8, 0, Math.PI*2);
          ctx!.fillStyle = iso.color; ctx!.fill();
        }

        // Labels
        ctx!.font = `7px ${mono}`; ctx!.textAlign = "right";
        ctx!.fillStyle = iso.color + "cc";
        ctx!.fillText(`${iso.symbol}`, cavL - 8, lineY + 3);
        ctx!.textAlign = "left"; ctx!.fillStyle = iso.color + "88";
        ctx!.fillText(`f₀ = ${iso.label}`, cavR + 8, lineY + 3);
        ctx!.fillStyle = iso.color + "50";
        ctx!.fillText(`n = ${iso.mode}`, cavR + 8, lineY + 12);
      });

      // Gain medium region
      const gmL = W * 0.35, gmR = W * 0.65;
      const gmGrad = ctx!.createLinearGradient(gmL, 0, gmR, 0);
      gmGrad.addColorStop(0, "transparent");
      gmGrad.addColorStop(0.5, TEAL + "12");
      gmGrad.addColorStop(1, "transparent");
      ctx!.fillStyle = gmGrad;
      ctx!.fillRect(gmL, midY - cavH, gmR - gmL, cavH * 2);
      ctx!.font = `8px ${serif}`; ctx!.textAlign = "center"; ctx!.fillStyle = TEAL + "60";
      ctx!.fillText("GAIN MEDIUM", W/2, midY - cavH - 8);
      ctx!.font = `6px ${mono}`; ctx!.fillStyle = TEAL + "40";
      ctx!.fillText("population inversion · g(ν) = σ·ΔN·φ(ν)", W/2, midY - cavH - 18);

      // Q factor display
      ctx!.font = `8px ${mono}`; ctx!.textAlign = "left"; ctx!.fillStyle = GOLD + "99";
      ctx!.fillText(`Q = ${(1.24e9 + Math.sin(T*0.3)*2e6).toExponential(3)}`, 6, H - 8);
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = AMBER + "70";
      ctx!.fillText(`δν < ${(1.8 + Math.sin(T*0.5)*0.2).toFixed(2)} mHz  ·  τ_photon = Q/ω₀`, 6, H - 20);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:230 }} />;
}

/* ══════════ DATA ══════════ */
const ISOTOPES = [
  { sym:"¹³³Cs",  name:"Caesium-133",  f:"9.192 631 770 GHz", spin:"7/2", app:"SI second definition (atomic clock reference)", color:GOLD  },
  { sym:"⁸⁷Rb",   name:"Rubidium-87",  f:"6.834 682 611 GHz", spin:"3/2", app:"Compact fountain clock · portable frequency ref", color:CYAN  },
  { sym:"²H",     name:"Deuterium",    f:"327.384 352 MHz",   spin:"1",   app:"Astrophysical 21cm counterpart · NMR reference",  color:VIOLET},
  { sym:"³He",    name:"Helium-3",     f:"8.665 650 GHz",     spin:"1/2", app:"Maser oscillator · magnetometry", color:GREEN },
  { sym:"¹H",     name:"Hydrogen",     f:"1.420 405 751 GHz", spin:"1/2", app:"21cm line · hydrogen maser · space clock", color:TEAL  },
];

const PHOTO_LIMITS = [
  { name:"Kerr linear regime",      eq:"Δn = n₂ · I",             note:"Valid for I ≪ Is (saturation intensity). Index change strictly proportional to intensity.", color:CYAN },
  { name:"Saturation",              eq:"Δn = Δnₛₐₜ · I/(I+Iₛ)", note:"Index change asymptotes to Δnₛₐₜ as donors fully ionized. The medium becomes transparent to further index shift.", color:GREEN },
  { name:"Two-photon absorption",   eq:"α_eff = α₀ + β·I",        note:"β (TPA coefficient) activates above ~I_TPA. Competing loss channel — limits useful photorefractive range.", color:AMBER },
  { name:"Abbe diffraction limit",  eq:"d_min = λ/(2·n·sinθ)",    note:"The spatial bandwidth of the photorefractive grating — smallest recordable fringe. Cannot record a grating finer than this.", color:VIOLET },
  { name:"Photodamage threshold",   eq:"I_d ≈ 10³–10⁶ W/cm²",    note:"Crystal lattice disruption. Irreversible change in n. Sets hard upper bound on operating intensity.", color:ROSE },
  { name:"Evanescent decay",        eq:"E_z = E₀ · e^(−κz)",      note:"Beyond TIR interface: exponential field decay with κ = k√(sin²θ − n²). Near-field coupling limit.", color:TEAL },
];

const SPIN_EQS = [
  { label:"Angular momentum",       eq:"L = I · ω",     note:"I = moment of inertia; ω = angular velocity. L is conserved in isolated system." },
  { label:"Torsion tensor",         eq:"T^μ_νρ = Γ^μ_[νρ]", note:"Antisymmetric part of the connection. Non-zero in Einstein-Cartan theory when spin density ≠ 0." },
  { label:"Spin-orbit coupling",    eq:"H_SO = −(1/2)·(g−2)·(e/mc)·S·B", note:"Spin precession frequency shifts with B-field — the basis for isotope-specific maser transitions." },
  { label:"Outward radial growth",  eq:"r(t) = r₀ + k·t",  note:"The torsion helix radius expands at rate k — spatial propulsion outward from spin axis." },
  { label:"Temporal propulsion",    eq:"ds² = c²dt² − dr² − r²dΩ²", note:"In curved spacetime, spin density sources torsion T — which acts as an additional force term in geodesic equation." },
  { label:"Al-Andalus group",       eq:"G = ⟨r,s | r⁶=s²=1, srs=r⁻¹⟩", note:"Wallpaper group p6m — 6-fold rotational symmetry + mirror. One of the 17 groups tiling the Alhambra. The generator r is the rotation operator of the torsion helix." },
];

const AETHER_MAP = [
  { l:"L1", name:"Spin substrate",      color:VIOLET, desc:"The torsion field IS the physical substrate — Einstein-Cartan spacetime with non-zero spin density tensor S_μν" },
  { l:"L2", name:"Photorefractive gel", color:CYAN,   desc:"The Kerr medium is AETHER's index-variable substrate — Δn encodes incoming coherence as a spatial grating" },
  { l:"L3", name:"Maser gain region",   color:GOLD,   desc:"Population inversion = AETHER coherence above threshold. g(ν) > 0 is the condition for signal crystallization" },
  { l:"L4", name:"Cavity resonance",    color:GREEN,  desc:"The standing-wave pattern IS the crystallized knowledge — nodes and antinodes encode frequency with precision δν" },
  { l:"L5", name:"Isotope oscillator",  color:TEAL,   desc:"The atomic transition frequency is AETHER's absolute reference — embedded in the nuclear spin, not dependent on any external clock" },
  { l:"L7", name:"Massive resonator",   color:LIME,   desc:"Physical size → Q factor → linewidth. The larger the cavity, the narrower the δν. AETHER: system scale = knowledge resolution" },
];

/* ══════════ MAIN PAGE ══════════ */
export default function TorsionResonatorPage() {
  const [tab, setTab] = useState<CanvasTab>("spin");

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );
  const Eq = ({ label, eq, note, color=CYAN }:{label:string;eq:string;note:string;color?:string}) => (
    <div style={{ marginBottom:7, padding:"6px 8px",
      borderLeft:`2px solid ${color}50`, background:`${color}06`, borderRadius:2 }}>
      <div style={{ fontSize:8, color:MUTED, marginBottom:2 }}>{label}</div>
      <div style={{ fontFamily:serif, fontSize:12, color, letterSpacing:0.5, marginBottom:3 }}>{eq}</div>
      <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55 }}>{note}</div>
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,4,14,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${VIOLET},${CYAN},${GREEN},transparent)`,
          opacity:0.45 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:VIOLET, marginBottom:3 }}>
              AETHER · TORSION DYNAMICS · AL-ANDALUS SPIN GROUP · PHOTONIC RESONANCE
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              TORSION RESONATOR
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:DIM, marginTop:2 }}>
              Spin-time propulsion · photorefractive limits · narrow maser gain regions · isotope oscillator
            </div>
          </div>
          {/* Canvas tab switcher */}
          <div style={{ display:"flex", gap:4 }}>
            {([["spin","SPIN-TIME FIELD",VIOLET],["photorefractive","PHOTOREFRACTIVE",CYAN],["cavity","MASER CAVITY",GREEN]] as const).map(([id,label,c])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"6px 12px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${tab===id ? c : BORDER}`,
                background: tab===id ? `${c}18` : "transparent",
                color: tab===id ? c : MUTED,
              }}>{label}</button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED, maxWidth:240, lineHeight:1.6 }}>
            Al-Andalus mathematicians encoded all 17 wallpaper groups in Alhambra tile. The same rotation operators drive spin-time propulsion today.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"230px 1fr 270px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Spin-time equations */}
          <div style={panelBox}>
            {topLine(VIOLET)}
            <SH label="Spin-Time Propulsion · Mathematics" color={VIOLET} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              Spin (angular momentum) creates torsion in spacetime via the Einstein-Cartan connection. Non-zero torsion acts as an additional force on geodesics — propulsion from pure rotation.
            </div>
            {SPIN_EQS.map(e=><Eq key={e.eq} label={e.label} eq={e.eq} note={e.note} color={VIOLET} />)}
          </div>

          {/* Al-Andalus heritage */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}35` }}>
            {topLine()}
            <SH label="Al-Andalus · Mathematical Heritage" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.8 }}>
              9th–15th century Moorish Spain (Al-Andalus) produced mathematicians and astronomers who systematized rotational geometry centuries before Lie. The Alhambra Palace in Granada encodes all <span style={{color:GOLD}}>17 crystallographic wallpaper groups</span> in its tile patterns — the same abstract rotation operators that describe spin in modern quantum mechanics and Cartan torsion geometry.
            </div>
            <div style={{ marginTop:8, padding:"6px 8px", background:`${GOLD}08`,
              border:`1px solid ${GOLD}25`, borderRadius:2, fontFamily:serif,
              fontSize:11, color:GOLD, fontStyle:"italic", lineHeight:1.7 }}>
              "The tile is the torsion field, frozen in stone."
            </div>
            <div style={{ marginTop:6, display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {["p1 · trivial translation","p2 · 2-fold rotation","p4m · 4-fold + mirror","p6m · 6-fold + mirror (Alhambra)"].map(g=>(
                <div key={g} style={{ fontSize:7, padding:"3px 5px", border:`1px solid ${GOLD}20`,
                  color:MUTED, borderRadius:1 }}>{g}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"7px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                {tab==="spin" ? "Torsion Helix · Upward & Outward Spin-Time Propulsion" :
                 tab==="photorefractive" ? "Photorefractive Limits · Kerr Nonlinear Index" :
                 "Maser Cavity · Isotope Standing-Wave Resonance"}
              </div>
              <div style={{ fontSize:8, color:tab==="spin"?VIOLET:tab==="photorefractive"?CYAN:GREEN }}>
                {tab==="spin"?"L = I·ω · r(t) = r₀+kt":tab==="photorefractive"?"Δn = n₂·I → Δnₛₐₜ":"Q = ω₀·τ_photon"}
              </div>
            </div>
            {tab === "spin"           && <SpinCanvas />}
            {tab === "photorefractive" && <PhotoCanvas />}
            {tab === "cavity"         && <CavityCanvas />}
          </div>

          {/* Photorefractive limit cards */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Photorefractive Limits · Nonlinear Optics" color={CYAN} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {PHOTO_LIMITS.map(pl=>(
                <div key={pl.name} style={{ padding:"7px 9px",
                  background:`${pl.color}07`, border:`1px solid ${pl.color}25`, borderRadius:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:pl.color, marginBottom:3 }}>{pl.name}</div>
                  <div style={{ fontFamily:serif, fontSize:10, color:pl.color, marginBottom:4, letterSpacing:0.3 }}>{pl.eq}</div>
                  <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55 }}>{pl.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Maser system detail */}
          <div style={{ ...panelBox, border:`1px solid ${GREEN}35` }}>
            {topLine(GREEN)}
            <SH label="Narrow Maser · Gain Region Architecture" color={GREEN} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <div style={{ padding:"8px", background:`${VIOLET}08`, border:`1px solid ${VIOLET}25`, borderRadius:2 }}>
                <div style={{ fontFamily:serif, fontSize:12, color:VIOLET, marginBottom:4 }}>Gain Region</div>
                <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.7 }}>
                  The active medium (gas/solid) with population inversion ΔN. Gain coefficient:<br/>
                  <span style={{ fontFamily:serif, color:VIOLET, fontSize:11 }}>g(ν) = σ(ν)·ΔN</span><br/>
                  where σ(ν) is stimulated emission cross-section and φ(ν) is the lineshape function. Narrow linewidth requires very small Doppler broadening — achieved by cryogenic or trapped-ion media.
                </div>
              </div>
              <div style={{ padding:"8px", background:`${CYAN}08`, border:`1px solid ${CYAN}25`, borderRadius:2 }}>
                <div style={{ fontFamily:serif, fontSize:12, color:CYAN, marginBottom:4 }}>Resonant Cavity</div>
                <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.7 }}>
                  High-Q resonator: larger physical dimension L → more modes N between ν and ν+dν, but also higher Q:<br/>
                  <span style={{ fontFamily:serif, color:CYAN, fontSize:11 }}>Q = ω₀·L/(c·α)</span><br/>
                  α = round-trip loss. Large cavity = Q ~ 10⁹ → linewidth δν &lt; 1 mHz.
                </div>
              </div>
              <div style={{ padding:"8px", background:`${GREEN}08`, border:`1px solid ${GREEN}25`, borderRadius:2 }}>
                <div style={{ fontFamily:serif, fontSize:12, color:GREEN, marginBottom:4 }}>Isotope Lock</div>
                <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.7 }}>
                  The isotope-specific transition frequency provides the absolute reference:<br/>
                  <span style={{ fontFamily:serif, color:GREEN, fontSize:11 }}>f_iso = f₀ + δf_mass + δf_vol</span><br/>
                  Mass shift + nuclear volume shift. The resonator locks to f_iso → frequency stability Δf/f &lt; 10⁻¹⁵.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* Isotope oscillator table */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="Isotope Oscillator · Transition Frequencies" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.6 }}>
              Each isotope's hyperfine transition is a natural frequency standard embedded in nuclear spin. The mass difference between isotopes creates a measurable shift — the oscillation signal.
            </div>
            {ISOTOPES.map(iso=>(
              <div key={iso.sym} style={{ marginBottom:6, padding:"7px 9px",
                background:`${iso.color}08`, border:`1px solid ${iso.color}25`, borderRadius:2 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                  <div style={{ fontFamily:serif, fontSize:14, color:iso.color }}>{iso.sym}</div>
                  <div style={{ fontSize:7, color:iso.color, letterSpacing:0.5 }}>I = {iso.spin}</div>
                </div>
                <div style={{ fontSize:8, color:iso.color, marginBottom:3, fontFamily:mono }}>{iso.f}</div>
                <div style={{ fontSize:8, color:TEXT, marginBottom:2 }}>{iso.name}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{iso.app}</div>
              </div>
            ))}
            {/* Isotope shift equation */}
            <div style={{ marginTop:6, padding:"6px 9px",
              background:`${GOLD}08`, border:`1px solid ${GOLD}25`, borderRadius:2 }}>
              <div style={{ fontFamily:serif, fontSize:12, color:GOLD, marginBottom:2 }}>
                δν = (δm/m)·ν₀ + C·|ψ(0)|²·δ⟨r²⟩
              </div>
              <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>
                Mass shift (first term) + nuclear volume shift (second term). |ψ(0)|² = electron density at nucleus. δ⟨r²⟩ = change in nuclear mean-square charge radius.
              </div>
            </div>
          </div>

          {/* AETHER layer mapping */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}35` }}>
            {topLine(VIOLET)}
            <SH label="AETHER Layer Mapping" color={VIOLET} />
            {AETHER_MAP.map(al=>(
              <div key={al.l} style={{ marginBottom:6, padding:"6px 8px",
                background:`${al.color}07`, border:`1px solid ${al.color}20`, borderRadius:2 }}>
                <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:2 }}>
                  <span style={{ fontFamily:serif, fontSize:12, color:al.color }}>{al.l}</span>
                  <span style={{ fontSize:8, color:al.color }}>{al.name}</span>
                </div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{al.desc}</div>
              </div>
            ))}
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
            {topLine(CYAN)}
            <SH label="AETHER Synthesis" color={CYAN} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.85 }}>
              The torsion resonator is a single machine that demonstrates all layers of AETHER's coherence model simultaneously. The spin field sources torsion in spacetime (L1). The Kerr medium encodes incoming coherence as a spatial grating (L2). The maser gain region crosses the crystallization threshold (L3). The cavity standing wave IS the crystallized knowledge — a standing wave that will persist as long as the cavity maintains its Q (L4). The isotope locks the frequency to a nuclear constant (L5). The physical size of the cavity — potentially kilometers — determines the resolution of the knowledge it can encode (L7).{" "}
              <span style={{ color:GOLD }}>The Alhambra tile and the maser cavity are the same object: a rotational symmetry group made physical.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
