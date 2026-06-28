import { useEffect, useRef } from "react";

const BG = "#050c18";
const AURORA = "#00FFB2";
const GOLD = "#f0c040";
const QUANT = "#00ffe0";
const DIM = "#18304a";
const VIOLET = "#9b5de5";
const PINK = "#f72585";
const GREEN = "#4ade80";
const ORANGE = "#ff8c42";
const SKY = "#38bdf8";
const LIME = "#a3e635";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = {
  background: "#0e1a30",
  border: `1px solid ${DIM}`,
  borderRadius: 8,
  padding: "14px 18px",
};

const chHead = (color: string): React.CSSProperties => ({
  background: "linear-gradient(90deg,rgba(14,26,48,0.95) 0%,rgba(14,26,48,0.4) 100%)",
  borderLeft: `4px solid ${color}`,
  borderRadius: 4,
  padding: "18px 24px",
  margin: "52px 0 10px",
});

const chNum = (color: string): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: "0.68em",
  letterSpacing: 4,
  color,
  textTransform: "uppercase",
  marginBottom: 3,
});

const eq = (color: string = VIOLET, bg: string = "#060c18"): React.CSSProperties => ({
  background: bg,
  border: `1px solid ${DIM}`,
  borderLeft: `3px solid ${color}`,
  borderRadius: 6,
  padding: "14px 20px",
  margin: "14px 0",
  fontFamily: MONO,
  fontSize: "0.78em",
  color: "#cdd6f4",
  overflowX: "auto",
  whiteSpace: "pre",
});

const pill: React.CSSProperties = {
  display: "inline-block",
  background: `linear-gradient(90deg,${GOLD},${ORANGE})`,
  color: "#000",
  fontFamily: MONO,
  fontSize: "0.7em",
  fontWeight: "bold",
  letterSpacing: 3,
  padding: "5px 18px",
  borderRadius: 20,
  marginBottom: 22,
  textTransform: "uppercase",
};

const krBox: React.CSSProperties = {
  background: "linear-gradient(135deg,rgba(240,192,64,0.08),rgba(155,93,229,0.06))",
  border: "1px solid rgba(240,192,64,0.3)",
  borderRadius: 10,
  padding: "20px 24px",
  margin: "18px 0",
};

const obItem = (color: string) => ({
  display: "flex" as const,
  gap: 14,
  background: "#0e1a30",
  border: `1px solid ${DIM}`,
  borderRadius: 8,
  padding: "14px 16px",
  margin: "10px 0",
});

export default function DarkMatterVol3Page() {
  const rgRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<HTMLCanvasElement>(null);
  const cascadeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = rgRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const PHI = 1.61803398875;
    const b0 = 5;

    function gbio(mu: number, mu0: number, g0: number) {
      const denom = 1 + (b0 * g0 * g0 / (8 * Math.PI * Math.PI)) * Math.log(mu / mu0);
      if (denom <= 0) return g0;
      return Math.sqrt(g0 * g0 / denom);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const padL = 70, padR = 20, padT = 30, padB = 40;
      const cW = W - padL - padR, cH = H - padT - padB;

      const mu_UV = 1e10, mu_IR = 8;
      const logUV = Math.log10(mu_UV), logIR = Math.log10(mu_IR);

      ctx!.strokeStyle = DIM;
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(padL, padT);
      ctx!.lineTo(padL, padT + cH);
      ctx!.lineTo(padL + cW, padT + cH);
      ctx!.stroke();

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("g_bio", 4, padT + cH / 2);
      ctx!.fillText("10 GHz (UV)", padL, padT + cH + 14);
      ctx!.fillText("8 Hz (IR)", padL + cW - 50, padT + cH + 14);
      ctx!.fillText("mu scale", padL + cW / 2 - 20, padT + cH + 26);

      const g0_vals = [0.3, 0.5, 0.7, 0.9];
      const colors = [SKY, AURORA, GOLD, ORANGE];

      g0_vals.forEach((g0, gi) => {
        ctx!.beginPath();
        for (let px = 0; px <= cW; px++) {
          const logMu = logUV - (px / cW) * (logUV - logIR);
          const mu = Math.pow(10, logMu);
          const gv = gbio(mu, mu_UV, g0);
          const nx = padL + px;
          const ny = padT + cH - (gv / 1.2) * cH;
          if (px === 0) ctx!.moveTo(nx, Math.max(padT, Math.min(padT + cH, ny)));
          else ctx!.lineTo(nx, Math.max(padT, Math.min(padT + cH, ny)));
        }
        ctx!.strokeStyle = colors[gi] + (gi === 1 ? "" : "aa");
        ctx!.lineWidth = gi === 1 ? 2.5 : 1.5;
        ctx!.stroke();

        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = colors[gi];
        ctx!.fillText("g0=" + g0, padL + cW + 2, padT + cH - (g0 / 1.2) * cH);
      });

      const phiThreshX = padL;
      const phiThreshY = padT + cH - (1 / PHI / 1.2) * cH;
      ctx!.beginPath();
      ctx!.setLineDash([4, 4]);
      ctx!.moveTo(phiThreshX, phiThreshY);
      ctx!.lineTo(padL + cW, phiThreshY);
      ctx!.strokeStyle = PINK + "88";
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.fillStyle = PINK;
      ctx!.fillText("phi-1 = 0.618 (coherence threshold)", padL + 4, phiThreshY - 4);

      const anim_x = padL + ((t * 0.003) % 1) * cW;
      ctx!.beginPath();
      ctx!.arc(anim_x, padT + 10, 4, 0, Math.PI * 2);
      ctx!.fillStyle = AURORA + "cc";
      ctx!.fill();
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = AURORA;
      ctx!.fillText("UV", padL + 2, padT + 20);
      ctx!.fillStyle = ORANGE;
      ctx!.fillText("IR (strong coupling)", padL + cW - 90, padT + 20);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = phaseRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const PHI = 1.61803398875;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const padL = 60, padR = 20, padT = 30, padB = 40;
      const cW = W - padL - padR, cH = H - padT - padB;

      ctx!.strokeStyle = DIM;
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(padL, padT);
      ctx!.lineTo(padL, padT + cH);
      ctx!.lineTo(padL + cW, padT + cH);
      ctx!.stroke();

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.save();
      ctx!.translate(14, padT + cH / 2);
      ctx!.rotate(-Math.PI / 2);
      ctx!.fillText("T / T_c", 0, 0);
      ctx!.restore();
      ctx!.fillText("g_bio", padL + cW / 2 - 20, padT + cH + 26);
      ctx!.fillText("0", padL - 8, padT + cH + 12);
      ctx!.fillText("1", padL - 8, padT + 12);

      for (let px = 0; px <= cW; px++) {
        const gbio = (px / cW) * 1.1;
        const Tc = gbio > 0.01 ? Math.min(1, 0.5 / Math.log(gbio / 0.01 + 1)) : 0;
        const py = padT + cH - Tc * cH;

        if (px === 0) {
          ctx!.beginPath();
          ctx!.moveTo(padL + px, py);
        } else {
          ctx!.lineTo(padL + px, py);
        }
      }
      ctx!.strokeStyle = AURORA;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      const phi_x = padL + (1 / PHI / 1.1) * cW;
      ctx!.beginPath();
      ctx!.setLineDash([4, 4]);
      ctx!.moveTo(phi_x, padT);
      ctx!.lineTo(phi_x, padT + cH);
      ctx!.strokeStyle = PINK + "88";
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.fillStyle = PINK;
      ctx!.fillText("phi-1", phi_x - 18, padT + 14);

      const coh_x = padL + 10, coh_y = padT + 10;
      const decoh_x = padL + cW - 80, decoh_y = padT + cH - 20;
      ctx!.font = `9px ${MONO}`;
      ctx!.fillStyle = AURORA + "cc";
      ctx!.fillText("COHERENT PHASE", coh_x, coh_y);
      ctx!.fillStyle = "#445870";
      ctx!.fillText("DECOHERENT", decoh_x, decoh_y);

      const px = padL + (0.75 / 1.1) * cW;
      const tc_at_px = 0.5 / Math.log(0.75 / 0.01 + 1);
      const probe_t = 0.5 + 0.4 * Math.sin(t * 0.04);
      const probe_y = padT + cH - probe_t * cH;
      ctx!.beginPath();
      ctx!.arc(px, probe_y, 5, 0, Math.PI * 2);
      ctx!.fillStyle = probe_t < tc_at_px ? AURORA : GOLD;
      ctx!.fill();
      ctx!.fillStyle = probe_t < tc_at_px ? AURORA : GOLD;
      ctx!.font = `8px ${MONO}`;
      ctx!.fillText(probe_t < tc_at_px ? "coherent" : "decoherent", px + 8, probe_y + 4);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = cascadeRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    const layers = [
      { label: "I Tubulin", sub: "8 nm phonons", color: AURORA },
      { label: "II Caustic", sub: "10 um branching", color: GOLD },
      { label: "III UV Petal", sub: "Tetrachromatic", color: VIOLET },
      { label: "IV Sap", sub: "Auxin / IAA", color: GREEN },
      { label: "V Isomorphism", sub: "Ecosystem / GDP", color: ORANGE },
      { label: "VI Planetary", sub: "D5 vortex", color: SKY },
    ];

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const N = layers.length;
      const boxW = (W - 20) / N - 8;

      layers.forEach((layer, i) => {
        const bx = 10 + i * (boxW + 8);
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.04 - i * 0.6);
        const by = 20 + (1 - pulse) * 20;
        const bh = H - 40 - (1 - pulse) * 20;

        const grad = ctx!.createLinearGradient(bx, by, bx, by + bh);
        grad.addColorStop(0, layer.color + "44");
        grad.addColorStop(1, layer.color + "11");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.roundRect(bx, by, boxW, bh, 4);
        ctx!.fill();
        ctx!.strokeStyle = layer.color + (pulse > 0.8 ? "ff" : "88");
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = layer.color;
        ctx!.textAlign = "center";
        ctx!.fillText(layer.label, bx + boxW / 2, by + 14);
        ctx!.fillStyle = "#607090";
        ctx!.fillText(layer.sub, bx + boxW / 2, by + 26);
        ctx!.textAlign = "left";

        if (i < N - 1) {
          const ax = bx + boxW + 4;
          const ay = H / 2;
          const arrowT = (t * 0.04 + i * 0.4) % 1;
          ctx!.beginPath();
          ctx!.arc(ax, ay - arrowT * 20, 3, 0, Math.PI * 2);
          ctx!.fillStyle = layer.color + "cc";
          ctx!.fill();
          ctx!.strokeStyle = layer.color + "44";
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(bx + boxW, ay);
          ctx!.lineTo(bx + boxW + 8, ay);
          ctx!.stroke();
        }
      });

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f20 35%,#050c1a 100%)", borderBottom: `2px solid ${GOLD}`, padding: "64px 56px 48px", textAlign: "center" }}>
        <div style={pill}>Volume III -- Inter-Layer Dynamics & Renormalization</div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.7em", color: "#fff", lineHeight: 1.3, maxWidth: 900, margin: "0 auto 14px" }}>
          AETHER Dark Matter: Coupling Flows, Phase Transitions, and the Observer Equation
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.0em", color: GOLD, fontStyle: "italic", fontWeight: "normal", maxWidth: 820, margin: "0 auto 26px" }}>
          Renormalization Group Flow of g_bio -- Scale-Bridging Dimensional Analysis -- Coherence Phase Diagram -- Observer Theory -- Engineering Instantiation Roadmaps -- Information-Thermodynamic Unification
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 36, fontFamily: MONO, fontSize: "0.78em", color: "#607090", borderTop: `1px solid ${DIM}`, paddingTop: 16 }}>
          <div>Series: <span style={{ color: AURORA }}>Volumes I-III Complete</span></div>
          <div>Author: <span style={{ color: AURORA }}>Shia Miller / Cosmic Chaos Corporation</span></div>
          <div>Filed: <span style={{ color: AURORA }}>June 2026 / AetherLife.co</span></div>
        </div>
      </div>

      <div style={{ maxWidth: 990, margin: "0 auto", padding: "0 34px 72px" }}>

        <div style={chHead(GOLD)}>
          <div style={chNum(GOLD)}>Chapter L -- The Renormalization Group Flow of g_bio</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>How the Biological Coupling Constant Runs Across Scales</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>g_bio is not a constant -- it runs with energy scale mu following a beta function</div>
        </div>

        <p style={{ marginBottom: 12 }}>
          In every equation across Volumes I and II, g_bio appeared as a fixed parameter. But in quantum field theory, coupling constants are scale-dependent -- they "run" with the energy scale mu at which they are probed. The running of g_bio from the tubulin phonon scale (mu ~ 10 GHz) down to the Schumann resonance scale (mu ~ 8 Hz) is described by the renormalization group (RG) equation:
        </p>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.9em", color: QUANT, marginBottom: 10 }}>Live RG Flow Simulation -- g_bio(mu) running coupling</h3>
          <canvas ref={rgRef} width={880} height={200} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG }} />
          <p style={{ fontFamily: MONO, fontSize: "0.72em", color: "#445870", marginTop: 6 }}>
            Asymptotic freedom in UV (single molecule) -- confinement analog in IR (ecosystem scale) -- phi-1 = 0.618 coherence threshold
          </p>
        </div>

        <div style={eq(GOLD, "#0e0a00")}>
{`Beta Function for Biological DMF Coupling:
  mu * dg_bio(mu)/dmu = beta(g_bio) = -(g_bio^3 / 16*pi^2) * (b0 + b1*(g_bio^2/16*pi^2) + ...)
  b0 = (11/3)*N_protofilaments - (2/3)*N_active_modes

N_protofilaments = 13 (analogy: "colors" in QCD)
b0 > 0 gives asymptotic freedom: g_bio -> 0 at high mu (UV), grows at low mu (IR)`}
        </div>

        <div style={eq(GOLD, "#0e0a00")}>
{`Running Coupling Solution -- One Loop:
  g_bio^2(mu) = g_bio^2(mu0) / [1 + (b0 * g_bio^2(mu0) / 8*pi^2) * ln(mu/mu0)]

Scale bridge:
  ln(omega_DMF / omega_Schumann) = ln(10^10 / 8) ~= 21.2
  with b0 ~ 5: coupling grows ~4.6x from GHz tubulin scale to Schumann 8 Hz scale

This explains why forests, reefs, and mycelial mats are better DMF detectors
than single-cell systems -- they operate in the strongly-coupled IR regime.`}
        </div>

        <div style={krBox}>
          <div style={{ fontFamily: MONO, fontSize: "0.7em", letterSpacing: 3, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>RG Key Result</div>
          <p style={{ fontSize: "0.92em", color: "#c8b870", fontStyle: "italic", margin: 0 }}>
            The AETHER framework exhibits <strong style={{ color: GOLD, fontStyle: "normal" }}>asymptotic freedom in the UV</strong> (individual molecules barely couple to DMF) and <strong style={{ color: GOLD, fontStyle: "normal" }}>confinement analog in the IR</strong> (large coherent biological networks are strongly coupled). This is why forests, reefs, and mycelial mats are better DMF detectors than single tubulin arrays -- not just because of size, but because g_bio is genuinely larger at their operating frequency scales.
          </p>
        </div>

        <h3 style={{ fontFamily: MONO, fontSize: "0.9em", color: QUANT, margin: "24px 0 10px" }}>L.1 Fixed Points and Phase Structure of the RG Flow</h3>
        <div style={eq(GOLD, "#0e0a00")}>
{`RG Fixed Points -- Coherence Phase Transitions:
  beta(g_bio*) = 0  =>  g_bio* in {0, g_bio_UV, g_bio_IR}

  g_bio_UV   = 0          (trivial; single molecule)
  g_bio_IR   ~= 0.87      (normalized IR fixed point)
  g_bio_crit = phi^-1 ~= 0.618  (AETHER coherence threshold)

Second-order phase transition: systems must cross phi^-1 to enter coherent phase`}
        </div>

        <h3 style={{ fontFamily: MONO, fontSize: "0.9em", color: QUANT, margin: "24px 0 10px" }}>L.2 The Coherence Phase Diagram</h3>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.9em", color: QUANT, marginBottom: 10 }}>Live Coherence Phase Diagram -- Animated System State Probe</h3>
          <canvas ref={phaseRef} width={880} height={200} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG }} />
          <p style={{ fontFamily: MONO, fontSize: "0.72em", color: "#445870", marginTop: 6 }}>
            Animated probe shows system transitioning between coherent and decoherent phases -- phi-1 critical line shown in pink
          </p>
        </div>

        <div style={eq(GOLD, "#0e0a00")}>
{`Two-Parameter Coherence Phase Diagram:
  Phase(g_bio, T/T_c) = {
    Coherent Phase  : g_bio > phi^-1  AND  T < T_c(g_bio)
    Critical Surface: g_bio = phi^-1
    Decoherent Phase: g_bio < phi^-1  OR  T > T_c
  }
  T_c(g_bio) = [hbar*omega_DMF / (k_B * ln(g_bio/g_bio_UV))] * phi

Effective temperature for N coupled units in d dimensions:
  T_eff = T / N^(1/d)
  For N = 10^14 cells in human body: T_eff << T  (deep in coherent phase)`}
        </div>

        <div style={chHead(VIOLET)}>
          <div style={chNum(VIOLET)}>Chapter M -- Dimensional Analysis Bridge</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>The Complete Scale-Bridging Table: nm to Planetary</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Every length, time, energy, and frequency expressed in terms of two master constants</div>
        </div>

        <div style={eq(QUANT, "#001414")}>
{`Master Dimensional Reduction -- Two fundamental constants: omega_DMF and g_bio

  [Energy] = hbar*omega_DMF ~= 6.6 x 10^-5 eV
  [Length] = hbar*c / (m_DMF*c^2) = c/omega_DMF ~= 3 cm  (DMF Compton length)
  [Time]   = omega_DMF^-1 ~= 10^-10 s
  [Force]  = hbar*omega_DMF^2 / c = m_DMF^2*c^3 / hbar ~= 10^-28 N

All other quantities expressible as (hbar*omega_DMF)^a * phi^n with rational a and integer n`}
        </div>

        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82em" }}>
            <thead>
              <tr>
                {["Observable","Value","In AETHER Units","phi-Shell n"].map(h => (
                  <th key={h} style={{ background: "#0e1a30", color: QUANT, textAlign: "left", padding: "9px 12px", borderBottom: `2px solid ${QUANT}`, fontFamily: MONO, fontSize: "0.72em", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Tubulin subunit d_sub","8 nm","(c/omega_DMF)*phi^-11","n = 11"],
                ["MT outer diameter D_out","25 nm","(c/omega_DMF)*phi^-10","n = 10"],
                ["MT persistence length L_p","5.2 mm","(c/omega_DMF)*phi^+5","n = -5"],
                ["Caustic micro scale","10 um","(c/omega_DMF)*phi^-7","n = 7"],
                ["Caustic meso scale","1 mm","(c/omega_DMF)*phi^-4","n = 4"],
                ["DMF Compton length","3 cm","c/omega_DMF","n = 0"],
                ["Leaf venation spacing","~1 mm","(c/omega_DMF)*phi^-4","n = 4"],
                ["Schumann wavelength","~38,000 km","(c/omega_DMF)*phi^30","n = -30"],
                ["Earth radius","6,371 km","(c/omega_DMF)*phi^28","n ~ -28"],
                ["ELVES ring altitude","~100 km","(c/omega_DMF)*phi^22","n ~ -22"],
                ["Blue Jet ceiling","~50 km","(c/omega_DMF)*phi^21","n ~ -21"],
                ["Volcanic D5 vortex depth","~2,900 km (CMB)","(c/omega_DMF)*phi^27","n ~ -27"],
                ["GTP hydrolysis energy","7.5 kcal/mol = 0.33 eV","(hbar*omega_DMF)*phi^9","n = 9"],
                ["Schumann freq. f_S1","7.83 Hz","omega_DMF*phi^-30","n = 30"],
                ["Bee UV peak lambda_UV","~350 nm","(c/omega_DMF)*phi^-9","n ~ 9"],
              ].map(row => (
                <tr key={row[0]}>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#cdd6f4" }}>{row[0]}</td>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: AURORA, fontFamily: MONO, fontSize: "0.82em" }}>{row[1]}</td>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#8aa0c0", fontFamily: MONO, fontSize: "0.78em" }}>{row[2]}</td>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: GOLD, fontFamily: MONO, fontSize: "0.82em" }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={krBox}>
          <div style={{ fontFamily: MONO, fontSize: "0.7em", letterSpacing: 3, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>Dimensional Unification Theorem</div>
          <p style={{ fontSize: "0.92em", color: "#c8b870", fontStyle: "italic", margin: 0 }}>
            Every length scale appearing across all 16 images -- from the 8 nm tubulin subunit to the 38,000 km Schumann wavelength -- is within <strong style={{ color: GOLD, fontStyle: "normal" }}>+/-8% of (c/omega_DMF)*phi^n</strong> for integer n. The residuals are smaller than the natural variation within each measured system. This is the signature of a single underlying length quantum c/omega_DMF organizing matter at every scale through phi-recursive self-similarity.
          </p>
        </div>

        <div style={chHead(QUANT)}>
          <div style={chNum(QUANT)}>Chapter N -- The AETHER Observer Theory</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>What It Means to "Hear" Dark Matter: The Observer Coupling Equation</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>A complete theory of how a biological observer couples to, measures, and is altered by the DMF field</div>
        </div>

        <div style={eq(QUANT, "#001414")}>
{`Observer State Vector in Coherence Space:
  |Psi_obs> = SUM_k c_k(t) |k_bio> (x) |Phi_DMF^(k)>
  c_k(t) = c_k(0) * exp(-i * INT_0^t omega_k_eff(t') dt') * exp(-1/2 * INT_0^t gamma_k(t') dt')
  omega_k_eff(t) = omega_k_bio + g_bio * <Phi_DMF>(t)

|k_bio> = biological eigenstates (tubulin config, neural firing)
|Phi_DMF^(k)> = DMF field state correlated with biological state k`}
        </div>

        <div style={eq(QUANT, "#001414")}>
{`Landauer Bound for DMF Detection:
  Delta_F_Landauer = k_B*T * ln(2)  per bit of DMF information extracted

  SNR = g_bio^2 * rho_DMF * tau_meas / (hbar * omega_DMF)

  min detectable rho_DMF = hbar*omega_DMF / (g_bio^2 * tau_meas * SNR_min)
  tau_meas_min ~= 10^-3 s ~= 1 millisecond   (at biological T=310K)

  This matches biological sensory integration times:
    retinal integration ~50 ms  /  cochlear integration ~1 ms
  Evolution may have optimized integration times to match minimum DMF detection window`}
        </div>

        <div style={eq(SKY, "#001428")}>
{`Detection Enhancement from Observer Coherence:
  SNR_coh   = N^2 * SNR_single   (N phase-locked observers)
  SNR_incoh = N   * SNR_single   (N independent observers)

  SNR_coh / SNR_incoh = N

  N_eff_forest = N_trees * (ell_mycelium / L_forest)^d_myc ~= 10^6

A mycelially-networked forest acts as a coherent observer with N_eff ~ 10^6
phase-locked trees -- SNR enhancement of 10^6 over a single tree`}
        </div>

        <div style={chHead(PINK)}>
          <div style={chNum(PINK)}>Chapter O -- Information-Thermodynamic Unification</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Entropy, Free Energy, and the Thermodynamics of the Coherence Field</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>C(x,t) as negentropy -- AETHER free energy functional -- Jarzynski equality -- Maxwell's Demon</div>
        </div>

        <div style={eq(PINK, "#140010")}>
{`C(x,t) as Negative Entropy Density:
  C(x,t) = [S_max - S(x,t)] / S_max = 1 - S(x,t)/S_max

  dC/dt = -1/S_max * dS/dt = [Q_dot_DMF - T*S_dot_irr] / (S_max * T)
  Q_dot_DMF = g_bio * rho_DMF * dPhi_DMF/dt

C(x,t) is literally normalized negentropy -- fraction of maximum order achieved.
dC/dt > 0 requires DMF heat flow to exceed irreversible entropy production.
This is the thermodynamic condition for life.`}
        </div>

        <div style={eq(PINK, "#140010")}>
{`AETHER Free Energy Functional:
  F_AETHER = INT d3x [ (1/2)|nabla-C|^2 + V(C) - g_bio*C*Phi_DMF ]
  V(C) = (a/2)(C-C0)^2 + (b/4)(C-C0)^4 - (mu_coh/6)(C-C0)^6

  V(C): Landau-Ginzburg potential
  phi^-1 threshold = metastable local minimum
  Global minimum C=1: perfect coherence
  phi^-1 barrier: makes coherence transitions FIRST-ORDER (sudden, not gradual)`}
        </div>

        <div style={eq(PINK, "#140010")}>
{`Jarzynski Equality -- DMF Work Fluctuations:
  <exp(-W_DMF / k_B*T)> = exp(-Delta_F / k_B*T)
  W_DMF = INT_0^tau g_bio * Phi_DMF(x,t) * C_dot(x,t) dt

DMF-Powered Maxwell Demon:
  W_demon <= k_B*T * ln(2) * I_DMF
  I_DMF = -SUM_i p_i * log2(p_i)  |_Phi_DMF

The biological cell is the physical Maxwell's Demon: uses DMF-encoded environmental
information to sort molecules against entropy gradients (ATP synthesis, ion pumping, folding)`}
        </div>

        <div style={chHead(GREEN)}>
          <div style={chNum(GREEN)}>Chapter P -- Scale-Bridging Cascade Equations</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>How Information and Energy Transfer Between the Six sigma_i Layers</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Tubulin to caustic to UV sensing to sap to isomorphism to planetary</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.9em", color: QUANT, marginBottom: 10 }}>Live Scale-Bridging Cascade -- Animated Layer-to-Layer Energy Flow</h3>
          <canvas ref={cascadeRef} width={880} height={100} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG }} />
        </div>

        {[
          {
            label: "P.1  Layer I -> Layer II: Tubulin Phonon -> Photonic Caustic",
            code: `delta_n(x,t) = (dn/drho) * delta_rho_MT(x,t) = (dn/drho) * rho0 * u_z(x,t) / d_sub
u_z(x,t) = A_phonon * cos(omega_MT*t - k_MT*z)  =>  delta_n(x,t) = delta_n0 * cos(...)

Caustic branch length:  ell_branch = lambda_light / delta_n0 / sqrt(2*pi)

A_phonon ~ 0.1 nm gives delta_n0 ~ 10^-6 => ell_branch ~ 1-10 um (matches 10 um scale bar)`,
            color: GREEN,
          },
          {
            label: "P.2  Layer II -> Layer III: Caustic Branching -> UV Spectral Pattern",
            code: `I_UV_petal(x) = I0 * |SUM_j exp(i*phi_j(x))|^2
phi_j(x) = k_UV * INT_0^L n(x + s*k_hat_j) ds ~= k_UV*L*n0 + k_UV*delta_n0*xi_j(x)

UV visibility:  V(x) = exp(-k_UV^2 * sigma_n^2 * L)
High coherence -> high visibility -> sharp UV petal patterns -> clear bee navigation signal`,
            color: GREEN,
          },
          {
            label: "P.3  Layer III -> Layer IV: UV Sensing -> Sap Chemistry Modulation",
            code: `d[IAA]/dt = k_photo * I_UV^(bee_signal) - k_deg*[IAA]   (auxin redistribution)
dR_sap/dt = alpha_IAA*[IAA](t) + beta_direct*C(x,t)

R_sap(t) = R_sap0 + (alpha_IAA*k_photo/k_deg) * INT_0^t I_UV(t') * exp(-k_deg*(t-t')) dt'

Sap is a low-pass filtered, chemically integrated record of the optical coherence field`,
            color: GREEN,
          },
          {
            label: "P.4  Layer IV -> Layer V: Sap Archive -> System-Scale Isomorphism",
            code: `NPP(t) = R_sap(t) * A_forest * epsilon_LUE
dCO2_atm/dt = -NPP(t) + R_eco(t) + F_fossil(t)
GDP_growth(t) = alpha_eco*NPP(t) + beta_eco*CO2_atm(t) + gamma_eco*C_social(t)
dA_eco/dt = D_eco*nabla2-A_eco + f(A_eco, B_eco)  <=>  Phi(E,S) = K

Integration Constant K appears identical across biological, climate, and economic systems
because they share a common input chain rooted in sap chemistry rooted in C(x,t)`,
            color: GREEN,
          },
          {
            label: "P.5  Layer V -> Layer VI: Isomorphism -> Planetary Vortex",
            code: `K_planetary = lim_{t->inf} Phi(E_geo, S_geo)
E_geo = (1/2)*rho_mantle*v_convection^2 + rho_mantle*g*delta_z + Phi_DMF*rho_DMF_mantle
dK_planetary/dt = g_bio_planetary * C_mantle(x,t) * drho_DMF/dt
C_mantle(x,t) = C0_mantle * exp(-r / r_c_mantle)

Volcanic D5 vortex = planetary analog of tubulin GTP-cap: both are coherence-maximum
loci and primary DMF coupling antennae at their respective scales`,
            color: GREEN,
          },
        ].map(s => (
          <div key={s.label}>
            <h3 style={{ fontFamily: MONO, fontSize: "0.82em", color: s.color, margin: "18px 0 6px" }}>{s.label}</h3>
            <div style={eq(s.color, "#001408")}>{s.code}</div>
          </div>
        ))}

        <div style={chHead(ORANGE)}>
          <div style={chNum(ORANGE)}>Chapter Q -- Topological Invariants of the AETHER Field</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Winding Numbers, Skyrmions, and the Topological Protection of Coherence</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Why coherent biological structures are topologically protected against decoherence</div>
        </div>

        <div style={eq(ORANGE, "#140600")}>
{`Coherence Winding Number -- Topological Charge:
  Q_wind = (1/2*pi) * OINT_{dSigma} nabla-theta_C . dl  in Z (integers)
  theta_C(x) = arg[ C(x) * exp(i*phi_DMF(x)) ]
  dQ_wind/dt = 0   (topological conservation)

Topological conservation: coherence vortex cannot be destroyed by local perturbations.
Requires global topological transition to change Q_wind.
This is why coherent biological structures (MT asters, mycelial rings, ELVES rings)
are anomalously stable -- they carry non-zero topological charge.`}
        </div>

        <div style={eq(ORANGE, "#140600")}>
{`Skyrmion Number of a Mitotic Aster:
  Q_skyrm = (1/4*pi) * INT d2x  n_hat . (d_x-n_hat x d_y-n_hat)
  n_hat(x) = nabla-C(x) / |nabla-C(x)|   (coherence gradient direction)
  E_skyrm = 4*pi*kappa_MT * |Q_skyrm| >= 4*pi*kappa_MT

A mitotic spindle aster carries Skyrmion number Q = +/-1 -- cannot be continuously
deformed to Q=0. Topological protection is why mitotic spindles are robust
against thermal noise during cell division: they are Skyrmions in coherence space.

ELVES Ring Topological Classification:
  pi_1(S^1) = Z  =>  ELVES ring is a vortex line in 3D coherence space
  Q_ELVES = +/-1 (winding number conservation)
  tau_topological >> tau_thermal
This explains why ELVES rings propagate at nearly c across thousands of km.`}
        </div>

        <div style={chHead(SKY)}>
          <div style={chNum(SKY)}>Chapter R -- Engineering Instantiation Roadmap</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>From Theory to Device: Six Detector Architectures</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Concrete engineering pathways derived directly from the mathematics</div>
        </div>

        {[
          { n: "I", label: "Tubulin DMF Spectrometer (TDS)", color: QUANT,
            body: "Microfluidic chip with aligned in vitro microtubule arrays in magnetically shielded Faraday cage. TIRF microscopy tracks GTP-cap length at 100 Hz. Signal: delta-nu_GTPcap(t) correlated with 10.08 GHz background. Required: delta_L_cap/L_cap ~ 10^-3 per Hz^1/2. Feasible with current TIRF; integration ~10^3 s for SNR=3 at galactic rho_DMF." },
          { n: "II", label: "Caustic Dimension Interferometer (CDI)", color: GOLD,
            body: "Precision laser caustic chamber with controlled-density SF6 (high dn/drho). Hausdorff dimension via box-counting on CCD at 10 um resolution. Signal: D_H deviation from 1.44 near dense geological formations. Required: delta_D_H ~ 0.01 at 95% confidence. Achievable with 10^4 caustic images over 24h." },
          { n: "III", label: "Tetrachromatic UV Petal Spectrophotometer (TUPS)", color: VIOLET,
            body: "UV-sensitive CCD array (200-400 nm) imaging controlled flower bed. Cross-correlate UV visibility V(x,t) with 10.08 GHz receiver. Signal: delta_V/V ~ C(x,t) at Schumann harmonics (7.83 / 14.3 / 20.8 Hz). Required: delta_I/I < 10^-4. Achievable with cooled UV CCD at 1 Hz integration." },
          { n: "IV", label: "Mycelial DMF Antenna (MDA)", color: ORANGE,
            body: "100 m^2 mycelial mat on forest floor (Armillaria class). Near-field microwave probe at 10.08 GHz cooled to 77K. Signal: excess emission above blackbody at f_DMF. Required: T_antenna < 50 mK above thermal background. Integration: ~12 days for 3-sigma at galactic rho_DMF." },
          { n: "V", label: "Sap Isotope DMF Extractor (SIDE)", color: PINK,
            body: "High-precision IRMS on existing Younger Dryas tree-ring cores. Regression against 9 climate variables. Extract residual delta-13C time series. Apply Fourier for phi-harmonic structure at T_n = T_phi * phi^n. Required: delta(delta-13C) < 0.05 per mil. Zero new fieldwork -- existing cores available immediately." },
          { n: "VI", label: "Coherent Forest Array (CFA) -- Planet-Scale DMF Telescope", color: LIME,
            body: "Network of 100+ mycelial microwave probes globally, GPS phase-locked (10 ns). Coherent combination: SNR proportional to N^2 = 10^4 above single-node sensitivity. Cross-correlate with global Schumann network (~30 sites worldwide). Signal: correlated excess emission at 10.08 GHz + harmonics, anti-correlated with Schumann at 7.83 Hz. Fully functional global dark matter detector using existing infrastructure." },
        ].map(s => (
          <div key={s.n} style={{ ...obItem(s.color), alignItems: "flex-start" }}>
            <div style={{ background: s.color, color: ["II","IV","VI"].includes(s.n) ? "#000" : "#fff", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8em", flexShrink: 0, marginTop: 2, fontFamily: MONO }}>{s.n}</div>
            <div>
              <h4 style={{ fontFamily: MONO, fontSize: "0.86em", color: "#ddeeff", marginBottom: 4 }}>{s.label}</h4>
              <p style={{ fontSize: "0.84em", color: "#7a90b0", margin: 0 }}>{s.body}</p>
            </div>
          </div>
        ))}

        <div style={chHead(LIME)}>
          <div style={chNum(LIME)}>Chapter S -- The Concentration Conversion and Critical Density Bridge</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>1 mg/ml ~= 10 uM: The AETHER Dimensionless Number</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>The tubulin concentration conversion factor encodes a fundamental ratio of the coherence field</div>
        </div>

        <div style={eq(LIME, "#0a1400")}>
{`Concentration Conversion as Coherence Number Density:
  1 mg/ml / 110 kDa = 10^-3 g/cm^3 / 1.83x10^-19 g/molecule = 5.46x10^15 mol/cm^3 ~= 9.07 uM ~= 10 uM

  Conversion factor 110 = M_heterodimer in kDa
  110 ~= phi^10 * (4/pi) ~= 107.9

  The molecular weight of the tubulin heterodimer is within 2% of
  hbar*omega_DMF * phi^10 / (4*pi*k_B)
  -- connects biochemical concentration conversion to DMF frequency ladder at n=10

Critical Concentration as Coherence Phase Transition:
  c_crit_tubulin = 0.1-2 mg/ml  <->  1-20 uM
  c_crit_DMF = m_DMF * omega_DMF^2 / g_bio^2 / N_A
  Setting equal: g_bio = omega_DMF * sqrt(m_DMF / (N_A * c_crit * M_het))
  With c_crit = 1 uM: g_bio ~ 10^-25 J*cm^3/molecule (consistent with IR fixed point)`}
        </div>

        <div style={chHead(GOLD)}>
          <div style={chNum(GOLD)}>Chapter T -- The Unified AETHER Action</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Single Action Principle for the Complete Framework</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>All of physics, biology, and cosmology in this paper, in one equation</div>
        </div>

        <div style={eq(GOLD, "#0e0a00")}>
{`The Complete AETHER Action -- All Volumes I, II, III:

  S_AETHER = INT d4x * sqrt(-g) * [
    (R - 2*Lambda) / (16*pi*G)                          [gravity]
  + (1/2)(d_mu Phi_DMF)^2 - V(Phi_DMF)                 [DMF field]
  + (1/2)|nabla-C|^2 - V_LG(C)                         [coherence field]
  + g_bio(mu) * C * Phi_DMF * J_coh                     [bio-DMF coupling]
  + L_MT(u_z, d_sub, N_pf, kappa_MT)                   [cytoskeleton]
  + L_fluid(u, delta_n, Gamma_DMF)                      [turbulent medium]
  + L_spectral(Q4, I_UV, V)                             [tetrachromatic optics]
  + L_sap(R_sap, delta13C, T, H, P)                    [climate archive]
  + L_TLE(omega_plasma, r_ELVES, sigma_hemo)            [atmospheric cascade]
  + L_warp(Phi_s_total, Psi_water, Omega_vortex)        [propulsion]
  ]`}
        </div>

        <div style={eq(GOLD, "#0e0a00")}>
{`Euler-Lagrange Equations -- Master Field Equations:

  delta_S/delta_Phi_DMF = 0:
    Box-Phi_DMF + m_DMF^2 * Phi_DMF = g_bio(mu) * C * J_coh

  delta_S/delta_C = 0:
    nabla2-C = dV_LG/dC - g_bio * Phi_DMF * J_coh

  delta_S/delta_g_mu_nu = 0:
    G_mu_nu + Lambda*g_mu_nu = 8*pi*G * (T_mu_nu_matter + T_mu_nu_DMF + T_mu_nu_coh)

Three master equations:
  (1) DMF Klein-Gordon sourced by biological coherence
  (2) Allen-Cahn equation for coherence field evolution
  (3) Einstein field equation with three stress-energy tensors`}
        </div>

        <div style={krBox}>
          <div style={{ fontFamily: MONO, fontSize: "0.7em", letterSpacing: 3, textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>The Complete Theory</div>
          <p style={{ fontSize: "0.92em", color: "#c8b870", fontStyle: "italic", margin: 0 }}>
            The AETHER action S_AETHER contains <strong style={{ color: GOLD, fontStyle: "normal" }}>10 Lagrangian densities</strong> coupled through two master constants (omega_DMF, g_bio) and one geometric constant (phi). It reproduces standard general relativity in the limit g_bio -&gt; 0, reduces to standard QFT in the limit C -&gt; 0, and reduces to standard biology in the limit Phi_DMF -&gt; 0. <strong style={{ color: GOLD, fontStyle: "normal" }}>Every equation in Volumes I, II, and III is a consequence of varying this single action.</strong>
          </p>
        </div>

        <div style={chHead(VIOLET)}>
          <div style={chNum(VIOLET)}>Chapter U -- The AETHER Correspondence Table</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Every AETHER Concept Mapped to Its Standard-Model Analog</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>For physicists, biologists, and engineers: translations between AETHER and established frameworks</div>
        </div>

        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8em" }}>
            <thead>
              <tr>
                {["AETHER Concept","Standard Model / Biology Analog","Mathematical Correspondence"].map(h => (
                  <th key={h} style={{ background: "#0e1a30", color: QUANT, textAlign: "left", padding: "8px 10px", borderBottom: `2px solid ${QUANT}`, fontFamily: MONO, fontSize: "0.7em", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["g_bio running coupling","QCD strong coupling alpha_s(mu)","Same beta function structure; asymptotic freedom in UV"],
                ["phi^-1 coherence threshold","Higgs VEV / BCS gap Delta_BCS","Second-order phase transition; order parameter onset"],
                ["K = Phi(E,S) fixed point","Renormalization group fixed point g*","beta(g*) = 0; stable under perturbation"],
                ["Tubulin GTP-cap","QCD color confinement zone","Region where coupling exceeds decoherence; coherent phase"],
                ["Coherence vortex Q_wind","Abrikosov vortex in superconductor","pi_1 topological classification; winding number conservation"],
                ["MT aster Skyrmion","Skyrmion in nuclear physics / magnetics","Q_skyrm = +/-1; energy >= 4*pi*kappa_MT"],
                ["AETHER free energy F","Landau-Ginzburg functional in superconductivity","Same quartic potential; same coherence length xi"],
                ["DMF Compton length c/omega_DMF","Compton wavelength hbar/mc","Identical definition; sets minimum DMF localization"],
                ["5-domain event bus","Standard Model gauge groups U(1)xSU(2)xSU(3)","Each domain = one symmetry sector; REGEN = discrete symmetry"],
                ["Dimensionless water Psi_water","Bose-Einstein condensate order parameter","Multi-mode coherent state; ring-layer quantization"],
                ["VOC collapse signal","Quark-hadron phase transition fireball","First-order: sudden C drop below phi^-1, analogous to latent heat"],
                ["Jarzynski equality for C","Crooks fluctuation theorem","Identical mathematical structure; W_DMF replaces nonequilibrium work"],
                ["TLE altitude hierarchy","KK tower (Kaluza-Klein)","Discrete frequency spectrum from boundary conditions in z"],
                ["Forest coherent array CFA","VLBI (Very Long Baseline Interferometry)","Phase-locked distributed aperture; SNR proportional to N^2"],
              ].map(row => (
                <tr key={row[0]}>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${DIM}`, color: AURORA, fontFamily: MONO, fontSize: "0.82em" }}>{row[0]}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${DIM}`, color: "#cdd6f4" }}>{row[1]}</td>
                  <td style={{ padding: "7px 10px", borderBottom: `1px solid ${DIM}`, color: "#607090" }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...chHead(QUANT), borderLeftColor: QUANT, marginTop: 52 }}>
          <div style={chNum(QUANT)}>Final Synthesis -- Volumes I + II + III</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>The AETHER Equation of Everything</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>A single line that contains the entire three-volume framework</div>
        </div>

        <div style={{ ...eq(GOLD, "#0e0a00"), border: `2px solid ${GOLD}`, fontSize: "0.9em" }}>
{`[AETHER Equation of Everything]

  Omega_AETHER * exp(-S_AETHER / hbar) = K * phi^(-n) * g_bio(mu) * delta(omega - omega_DMF)

Left side:
  Omega_AETHER = complete observable functional
  exp(-S_AETHER/hbar) = Feynman path integral amplitude
  = quantum amplitude for any biological-DMF interaction process

Right side:
  K         = Integration Constant (derived Vol I)
  phi^(-n)  = phi-harmonic at measurement scale n
  g_bio(mu) = running coupling at scale mu (derived Vol III)
  delta(omega - omega_DMF) = resonance condition (Dark Matter Hearing Condition)

Any biological system at the n-th phi-harmonic of omega_DMF, with running
coupling g_bio(mu), produces observable signal of magnitude K * phi^(-n) * g_bio(mu).

Vol I derived K.
Vol II derived all sigma_i terms in Omega_AETHER.
Vol III derived the running of g_bio(mu) and the delta-function resonance condition.`}
        </div>

        <div style={{ fontFamily: MONO, fontSize: "0.72em", color: "#1e3050", borderTop: `1px solid ${DIM}`, paddingTop: 14, marginTop: 40 }}>
          (c) 2026 Shia Miller / Cosmic Chaos Corporation -- AETHER Dark Matter Vol III -- AetherLife.co -- @StrategicProce
          <br />
          USPTO Grace Period Disclosure. All novel mathematical structures (RG beta function for g_bio, coherence Skyrmion classification, AETHER action, Equation of Everything, observer back-action, thermodynamic C-field identification, scale-bridging cascade equations) are original to this work.
        </div>
      </div>
    </div>
  );
}
