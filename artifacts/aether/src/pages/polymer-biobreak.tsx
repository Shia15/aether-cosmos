import { useEffect, useRef, useState } from "react";

const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const DIM  = "#3a5060";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── Polymer chain break simulation ─────────────── */
function PolymerBreakCanvas({ polymer }: { polymer: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const pRef = useRef(polymer);
  pRef.current = polymer;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 300;
    const W = cv.width, H = cv.height;
    let t = 0;

    const POLYMERS: Record<string, { col: string; repeat: string; enzyme: string; monomer: string; bond: string; organism: string; rxn: string }> = {
      PET:  { col:TEAL, repeat:"–[O-C₆H₄-C(=O)-O-CH₂CH₂]–", enzyme:"PETase / MHETase", monomer:"TPA + EG", bond:"Ester C–O", organism:"Ideonella sakaiensis 201-F6", rxn:"(C₁₀H₈O₄)ₙ + nH₂O → nC₈H₆O₄ + nC₂H₆O₂" },
      PE:   { col:BLUE, repeat:"–[CH₂–CH₂]–", enzyme:"Laccase + alkane monooxygenase", monomer:"Fatty acids / aldehydes", bond:"C–C backbone", organism:"Pseudomonas aeruginosa / Bacillus cereus", rxn:"(CH₂–CH₂)ₙ + O₂ → terminal oxidation → RCOOH" },
      PS:   { col:AMB,  repeat:"–[CH₂–CH(C₆H₅)]–", enzyme:"Styrene monooxygenase (StyAB)", monomer:"Styrene + benzaldehyde", bond:"C–C vinyl", organism:"Pseudomonas putida CA-3", rxn:"PS → styrene → phenylacetic acid → TCA cycle" },
      PUR:  { col:VIO,  repeat:"–[NH–CO–O–R]–", enzyme:"Esterase / urease", monomer:"Polyol + diisocyanate fragments", bond:"Urethane N–C=O", organism:"Pestalotiopsis microspora (anaerobic)", rxn:"–NHCOO– + H₂O → –NH₂ + CO₂ + HO–R" },
      NYLON:{ col:ROSE, repeat:"–[NH-(CH₂)₅–CO]–", enzyme:"Nylonase (6-AHase)", monomer:"6-aminohexanoic acid", bond:"Amide C–N", organism:"Flavobacterium sp. K172", rxn:"Nylon-6 → 6-AHA cyclic → 6-AHA linear → metabolised" },
    };

    type Bond  = { x: number; y: number; broken: boolean; breakT: number };
    type Mono  = { x: number; y: number; vx: number; vy: number; col: string; r: number; life: number; label: string };
    type Enzyme = { x: number; y: number; target: number; col: string };

    const N_UNITS = 16;
    const unitW = (W - 120) / N_UNITS;
    const chainY = H * 0.42;
    const bonds: Bond[] = Array.from({ length: N_UNITS - 1 }, (_, i) => ({
      x: 60 + (i + 1) * unitW, y: chainY, broken: false, breakT: 0,
    }));
    const monomers: Mono[] = [];
    const enzymes: Enzyme[] = [];
    let nextEnzyme = 60;

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const p = POLYMERS[pRef.current] ?? POLYMERS.PET;

      // polymer chain background gradient
      const chainGrd = ctx.createLinearGradient(60, 0, W - 60, 0);
      chainGrd.addColorStop(0, p.col + "08"); chainGrd.addColorStop(0.5, p.col + "18"); chainGrd.addColorStop(1, p.col + "08");
      ctx.fillStyle = chainGrd; ctx.fillRect(40, chainY - 28, W - 80, 56); 

      // draw intact chain segments
      for (let i = 0; i < N_UNITS; i++) {
        const ux = 60 + i * unitW;
        const intact = i === 0 || !bonds[i - 1]?.broken;
        if (!bonds[i]?.broken && intact) {
          ctx.strokeStyle = p.col + "cc"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(ux, chainY); ctx.lineTo(ux + unitW * 0.85, chainY); ctx.stroke();
        }
        // repeat unit box
        const unitAlpha = bonds[i]?.broken ? 0.15 : 0.7;
        ctx.fillStyle = p.col + Math.round(unitAlpha * 30).toString(16).padStart(2, "0");
        ctx.strokeStyle = p.col + Math.round(unitAlpha * 160).toString(16).padStart(2, "0");
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(ux + 2, chainY - 14, unitW - 8, 28, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.col + Math.round(unitAlpha * 200).toString(16).padStart(2, "0");
        ctx.font = `6px ${MN}`; ctx.textAlign = "center";
        ctx.fillText("n", ux + (unitW - 8) / 2 + 2, chainY + 4);
      }

      // bond sites
      bonds.forEach((b, i) => {
        if (b.broken) return;
        const pulse = 0.5 + 0.3 * Math.sin(t * 0.05 + i * 0.7);
        ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(pulse * 60).toString(16).padStart(2, "0");
        ctx.strokeStyle = p.col + "88"; ctx.lineWidth = 1.2;
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.col + "66"; ctx.font = `5.5px ${MN}`; ctx.textAlign = "center";
        ctx.fillText(p.bond.split(" ")[0], b.x, chainY + 22);
      });

      // enzymes
      if (t > nextEnzyme) {
        const unbroken = bonds.filter(b => !b.broken);
        if (unbroken.length > 0) {
          const target = Math.floor(Math.random() * unbroken.length);
          const tb = unbroken[target];
          enzymes.push({ x: tb.x, y: chainY - 80 - Math.random() * 30, target: bonds.indexOf(tb), col: GRN });
        }
        nextEnzyme = t + 50 + Math.floor(Math.random() * 80);
      }
      enzymes.forEach((en, ei) => {
        const tb = bonds[en.target];
        if (!tb || tb.broken) { enzymes.splice(ei, 1); return; }
        const dx = tb.x - en.x, dy = tb.y - en.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 6) {
          // break the bond
          tb.broken = true; tb.breakT = t;
          // release monomers
          for (let m = 0; m < 2; m++) {
            monomers.push({ x: tb.x + (Math.random() - 0.5) * 20, y: chainY, vx: (Math.random() - 0.5) * 2, vy: -1.5 - Math.random() * 1.5, col: p.col, r: 3 + Math.random() * 2, life: 160 + Math.floor(Math.random() * 80), label: p.monomer.split(" + ")[m % 2] ?? p.monomer });
          }
          enzymes.splice(ei, 1);
        } else {
          en.x += (dx / dist) * 1.8; en.y += (dy / dist) * 1.8;
        }
        // draw enzyme
        const er = 10 + 2 * Math.sin(t * 0.08 + ei);
        const eg = ctx.createRadialGradient(en.x, en.y, 0, en.x, en.y, er);
        eg.addColorStop(0, GRN + "55"); eg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(en.x, en.y, er, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();
        ctx.beginPath(); ctx.arc(en.x, en.y, 5, 0, Math.PI * 2); ctx.fillStyle = GRN + "cc"; ctx.fill();
        ctx.fillStyle = GRN; ctx.font = `6px ${MN}`; ctx.textAlign = "center";
        ctx.fillText("E", en.x, en.y + 2);
        // trail
        ctx.strokeStyle = GRN + "22"; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(en.x, en.y); ctx.lineTo(tb.x, tb.y); ctx.stroke(); ctx.setLineDash([]);
      });

      // monomers floating up
      monomers.forEach((m, mi) => {
        m.x += m.vx; m.y += m.vy * 0.6; m.vy *= 0.99; m.life--;
        const alpha = Math.min(1, m.life / 50);
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.col + Math.round(alpha * 120).toString(16).padStart(2, "0"); ctx.fill();
        ctx.strokeStyle = m.col + Math.round(alpha * 200).toString(16).padStart(2, "0"); ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = m.col + Math.round(alpha * 180).toString(16).padStart(2, "0");
        ctx.font = `6px ${MN}`; ctx.textAlign = "center";
        ctx.fillText(m.label, m.x, m.y - m.r - 4);
        if (m.life <= 0) monomers.splice(mi, 1);
      });

      // broken bond flash
      bonds.forEach(b => {
        if (!b.broken) return;
        const age = t - b.breakT;
        if (age > 60) return;
        const alpha = Math.max(0, 1 - age / 60) * 0.8;
        ctx.fillStyle = ROSE + Math.round(alpha * 150).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.moveTo(b.x - 8, chainY - 10); ctx.lineTo(b.x + 8, chainY - 10);
        ctx.lineTo(b.x, chainY + 12); ctx.closePath(); ctx.fill();
      });

      // info bar
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, H - 60, W, 60);
      ctx.fillStyle = p.col; ctx.font = `8px ${OR}`; ctx.textAlign = "left";
      ctx.fillText(`${pRef.current} — ${p.repeat}`, 12, H - 44);
      ctx.fillStyle = GRN + "cc"; ctx.font = `7px ${MN}`;
      ctx.fillText(`Enzyme: ${p.enzyme}  |  Monomer: ${p.monomer}  |  Organism: ${p.organism}`, 12, H - 30);
      ctx.fillStyle = DIM; ctx.font = `6.5px ${MN}`;
      ctx.fillText(p.rxn, 12, H - 14);
      const brokenCount = bonds.filter(b => b.broken).length;
      ctx.fillStyle = TEAL; ctx.font = `7px ${MN}`; ctx.textAlign = "right";
      ctx.fillText(`Bonds cleaved: ${brokenCount} / ${bonds.length}  |  Completion: ${Math.round(brokenCount / bonds.length * 100)}%`, W - 12, H - 14);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [polymer]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ── Microbe plastic biodegradation colony ──────── */
function MicrobeEatCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 300;
    const W = cv.width, H = cv.height;
    let t = 0;

    // plastic substrate grid
    const COLS = 64, ROWS = 20;
    const cellW = (W * 0.62) / COLS, cellH = (H * 0.72) / ROWS;
    const subX = 10, subY = H * 0.12;
    const cells: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(1));

    type Microbe = { x: number; y: number; col: string; r: number; speed: number; dir: number; enzyme: number; label: string; eaten: number };
    const SPECIES = [
      { col:GRN,  label:"I. sakaiensis", enzyme:"PETase" },
      { col:TEAL, label:"P. putida",     enzyme:"StyAB" },
      { col:AMB,  label:"B. cereus",     enzyme:"Laccase" },
      { col:VIO,  label:"P. microspora", enzyme:"Esterase" },
      { col:ROSE, label:"T. molitor gut",enzyme:"Mixed" },
    ];
    const microbes: Microbe[] = Array.from({ length: 18 }, (_, i) => ({
      x: subX + Math.random() * W * 0.6,
      y: subY + Math.random() * H * 0.7,
      col: SPECIES[i % SPECIES.length].col,
      label: SPECIES[i % SPECIES.length].label,
      r: 5 + Math.random() * 4,
      speed: 0.4 + Math.random() * 0.6,
      dir: Math.random() * Math.PI * 2,
      enzyme: 0,
      eaten: 0,
    }));

    let totalEaten = 0;

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      // plastic substrate
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (cells[row][col] <= 0) continue;
          const integrity = cells[row][col];
          const cx = subX + col * cellW, cy = subY + row * cellH;
          ctx.fillStyle = `rgba(80,140,180,${0.08 + integrity * 0.18})`;
          ctx.fillRect(cx, cy, cellW - 0.5, cellH - 0.5);
          if (integrity < 0.5) {
            ctx.fillStyle = `rgba(80,140,180,${integrity * 0.3})`;
            ctx.fillRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
          }
        }
      }
      // substrate label
      ctx.fillStyle = BLUE + "33"; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
      ctx.fillText("PLASTIC SUBSTRATE (PET / PE / PS mix)", subX + 4, subY - 5);

      // microbes
      microbes.forEach(mb => {
        // wander toward intact cells
        const ci = Math.floor((mb.x - subX) / cellW);
        const ri = Math.floor((mb.y - subY) / cellH);
        if (ci >= 0 && ci < COLS && ri >= 0 && ri < ROWS && cells[ri][ci] > 0) {
          cells[ri][ci] = Math.max(0, cells[ri][ci] - 0.003);
          if (cells[ri][ci] <= 0) { totalEaten++; mb.eaten++; }
          mb.enzyme = Math.min(1, mb.enzyme + 0.04);
        } else {
          mb.enzyme = Math.max(0, mb.enzyme - 0.02);
          mb.dir += (Math.random() - 0.5) * 0.8;
        }
        // find food
        let nearX = -1, nearY = -1, nearDist = 9999;
        for (let r2 = Math.max(0, ri - 3); r2 < Math.min(ROWS, ri + 3); r2++) {
          for (let c2 = Math.max(0, ci - 3); c2 < Math.min(COLS, ci + 3); c2++) {
            if (cells[r2][c2] > 0) {
              const tx = subX + c2 * cellW + cellW / 2;
              const ty = subY + r2 * cellH + cellH / 2;
              const d = Math.sqrt((mb.x - tx) ** 2 + (mb.y - ty) ** 2);
              if (d < nearDist) { nearDist = d; nearX = tx; nearY = ty; }
            }
          }
        }
        if (nearX > 0) {
          const dx = nearX - mb.x, dy = nearY - mb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          mb.x += (dx / dist) * mb.speed;
          mb.y += (dy / dist) * mb.speed;
        } else {
          mb.x += Math.cos(mb.dir) * mb.speed;
          mb.y += Math.sin(mb.dir) * mb.speed;
          mb.dir += (Math.random() - 0.5) * 0.3;
        }
        mb.x = Math.max(subX, Math.min(subX + W * 0.62, mb.x));
        mb.y = Math.max(subY, Math.min(subY + H * 0.72, mb.y));

        // enzyme cloud
        if (mb.enzyme > 0.3) {
          const eg = ctx.createRadialGradient(mb.x, mb.y, 0, mb.x, mb.y, mb.r * 4 * mb.enzyme);
          eg.addColorStop(0, mb.col + "44"); eg.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(mb.x, mb.y, mb.r * 4 * mb.enzyme, 0, Math.PI * 2);
          ctx.fillStyle = eg; ctx.fill();
        }
        // cell body
        ctx.beginPath(); ctx.ellipse(mb.x, mb.y, mb.r, mb.r * 0.65, mb.dir, 0, Math.PI * 2);
        ctx.fillStyle = mb.col + "cc"; ctx.fill();
        ctx.strokeStyle = mb.col; ctx.lineWidth = 1; ctx.stroke();
        // flagellum
        ctx.strokeStyle = mb.col + "55"; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mb.x + Math.cos(mb.dir + Math.PI) * mb.r, mb.y + Math.sin(mb.dir + Math.PI) * mb.r);
        for (let s = 0; s < 8; s++) {
          const sx = mb.x + Math.cos(mb.dir + Math.PI) * (mb.r + s * 2.5);
          const sy = mb.y + Math.sin(mb.dir + Math.PI) * (mb.r + s * 2.5) + Math.sin(t * 0.15 + s + mb.r) * 3;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      });

      // side panel
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(W * 0.65, 0, W * 0.35, H);
      ctx.strokeStyle = GRN + "22"; ctx.lineWidth = 1; ctx.strokeRect(W * 0.65, 0, W * 0.35, H);
      ctx.fillStyle = GRN; ctx.font = `8px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("DEGRADATION STATUS", W * 0.65 + 12, 20);
      const totalCells = ROWS * COLS;
      const eaten = totalCells - cells.flat().filter(c => c > 0).length;
      const pct = (eaten / totalCells * 100).toFixed(1);
      ctx.fillStyle = TEAL; ctx.font = `18px ${OR}`; ctx.textAlign = "center";
      ctx.fillText(`${pct}%`, W * 0.65 + W * 0.175, 55);
      ctx.fillStyle = DIM; ctx.font = `7px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("substrate consumed", W * 0.65 + W * 0.175, 68);
      const rows2 = [
        ["Colony size", `${microbes.length} organisms`],
        ["Avg speed", `${(microbes.reduce((a,b)=>a+b.speed,0)/microbes.length*100).toFixed(0)} µm/min`],
        ["Enzymes active", `${microbes.filter(m=>m.enzyme>0.3).length}`],
        ["Bonds cleaved", `${(eaten * 840).toLocaleString()}`],
        ["Products CO₂", `${(eaten * 0.044).toFixed(2)} µg`],
        ["Products H₂O", `${(eaten * 0.018).toFixed(2)} µg`],
        ["TPA released", `${(eaten * 0.166).toFixed(3)} µg`],
        ["EG released", `${(eaten * 0.062).toFixed(3)} µg`],
      ];
      rows2.forEach(([k, v], i) => {
        ctx.fillStyle = GRN + "77"; ctx.font = `6.5px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(k, W * 0.65 + 12, 88 + i * 18);
        ctx.fillStyle = "rgba(200,220,240,0.8)";
        ctx.fillText(v, W * 0.65 + 100, 88 + i * 18);
      });
      const speciesList = [
        { col:GRN,  l:"I. sakaiensis — PETase" },
        { col:TEAL, l:"P. putida CA-3 — StyAB" },
        { col:AMB,  l:"B. cereus — Laccase" },
        { col:VIO,  l:"P. microspora — Esterase" },
        { col:ROSE, l:"T. molitor gut — Mixed" },
      ];
      ctx.fillStyle = DIM; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
      ctx.fillText("SPECIES", W * 0.65 + 12, 240);
      speciesList.forEach(({ col, l }, i) => {
        ctx.fillStyle = col; ctx.font = `6.5px ${MN}`;
        ctx.fillText("●", W * 0.65 + 12, 255 + i * 12);
        ctx.fillStyle = col + "cc";
        ctx.fillText(l, W * 0.65 + 24, 255 + i * 12);
      });
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ── Bio-refinery pathway: fossil fuel → drug ─── */
function BioRefineryCanvas({ pathway }: { pathway: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const pRef = useRef(pathway);
  pRef.current = pathway;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 280;
    const W = cv.width, H = cv.height;
    let t = 0;

    const PATHWAYS: Record<string, { col: string; feedstock: string; organism: string; steps: { label: string; mol: string; enzyme: string }[]; drug: string; class: string; why: string }> = {
      aspirin: {
        col: TEAL, feedstock: "Benzene (petroleum)", organism: "E. coli K-12 + P450",
        drug: "Salicylate / Aspirin", class: "NSAID · anti-inflammatory",
        why: "Petroleum benzene ring → biological hydroxylation routes salicylate without toxic intermediates",
        steps: [
          { label:"Benzene",    mol:"C₆H₆",         enzyme:"feedstock" },
          { label:"Catechol",   mol:"C₆H₄(OH)₂",    enzyme:"Benzene hydroxylase (bmoA)" },
          { label:"Salicylate", mol:"C₇H₆O₃",        enzyme:"Catechol 1,2-dioxygenase" },
          { label:"Aspirin",    mol:"C₉H₈O₄",        enzyme:"Acetyl transferase (chemical)" },
        ],
      },
      opioid: {
        col: ROSE, feedstock: "Naphtha / morphine precursor", organism: "Yeast S. cerevisiae (engineered)",
        drug: "Hydrocodone / Oxycodone", class: "Opioid analgesic",
        why: "23-gene pathway from Papaver somniferum introduced into yeast; petroleum-derived tyrosine precursors feed the cascade",
        steps: [
          { label:"Tyrosine",    mol:"C₉H₁₁NO₃",   enzyme:"petroleum-derived feed" },
          { label:"L-DOPA",      mol:"C₉H₁₁NO₄",   enzyme:"Tyrosine hydroxylase" },
          { label:"Reticuline",  mol:"C₂₁H₂₅NO₄",  enzyme:"Norcoclaurine synthase" },
          { label:"Thebaine",    mol:"C₁₉H₂₁NO₃",  enzyme:"CYP80B1/CYP719A1" },
          { label:"Hydrocodone", mol:"C₁₈H₂₁NO₃",  enzyme:"CYP3A4 / morphine demethylase" },
        ],
      },
      antibiotic: {
        col: GRN, feedstock: "Toluene (petroleum)", organism: "Pseudomonas putida KT2440",
        drug: "Muconic acid → adipic acid → β-lactam precursor", class: "Antibiotic intermediate",
        why: "P. putida evolved to detoxify toluene. Engineered to stop at muconate — feedstock for semi-synthetic penicillin chassis",
        steps: [
          { label:"Toluene",    mol:"C₇H₈",          enzyme:"feedstock" },
          { label:"Benzaldehyde",mol:"C₇H₆O",        enzyme:"Toluene monooxygenase (TOM)" },
          { label:"Benzoate",   mol:"C₇H₆O₂",        enzyme:"Benzaldehyde dehydrogenase" },
          { label:"Catechol",   mol:"C₆H₄(OH)₂",     enzyme:"Benzoate 1,2-dioxygenase" },
          { label:"Muconate",   mol:"C₆H₆O₄",         enzyme:"Catechol 1,2-dioxygenase" },
          { label:"Adipate",    mol:"C₆H₁₀O₄",        enzyme:"Enoate reductase (engineered)" },
        ],
      },
      statin: {
        col: GOLD, feedstock: "Acetyl-CoA (from petroleum methanol)", organism: "S. cerevisiae / E. coli",
        drug: "Lovastatin / Simvastatin", class: "Statin · cholesterol-lowering",
        why: "Mevalonate pathway in yeast converts petroleum-derived acetate to the lovastatin polyketide scaffold via LovB/LovC PKS",
        steps: [
          { label:"Acetate",      mol:"CH₃COOH",       enzyme:"petroleum methanol → acetyl-CoA" },
          { label:"Mevalonate",   mol:"C₆H₁₂O₄",       enzyme:"HMGR (HMG-CoA reductase)" },
          { label:"Farnesyl-PP",  mol:"C₁₅H₂₅O₇P₂",   enzyme:"FPP synthase" },
          { label:"Lovastatin",   mol:"C₂₄H₃₆O₅",      enzyme:"LovB/LovC (PKS, 20 domains)" },
          { label:"Simvastatin",  mol:"C₂₅H₃₈O₅",      enzyme:"LovD acyltransferase" },
        ],
      },
    };

    type Molecule = { x: number; y: number; vx: number; vy: number; col: string; r: number; life: number; label: string };
    const molecules: Molecule[] = [];

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const pw = PATHWAYS[pRef.current] ?? PATHWAYS.aspirin;
      const steps = pw.steps;
      const stepW = (W * 0.84) / steps.length;
      const midY = H * 0.42;

      // bioreactor backdrop
      const brX = W * 0.3, brY = midY - 60, brW = W * 0.38, brH = 120;
      ctx.fillStyle = pw.col + "08"; ctx.strokeStyle = pw.col + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(brX, brY, brW, brH, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = pw.col + "44"; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
      ctx.fillText(`BIOREACTOR · ${pw.organism}`, brX + brW / 2, brY + 16);

      // step nodes
      steps.forEach((s, i) => {
        const nx = 40 + (i + 0.5) * stepW;
        const isLast = i === steps.length - 1;
        const isFirst = i === 0;
        const pulseFactor = 1 + 0.07 * Math.sin(t * 0.05 + i * 0.8);
        const nodeR = (isFirst || isLast ? 20 : 16) * pulseFactor;
        const ng = ctx.createRadialGradient(nx, midY, 0, nx, midY, nodeR * 1.5);
        ng.addColorStop(0, pw.col + (isFirst ? "55" : isLast ? "88" : "33"));
        ng.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(nx, midY, nodeR * 1.5, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill();
        ctx.beginPath(); ctx.arc(nx, midY, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = isLast ? pw.col + "33" : "rgba(0,0,0,0.5)";
        ctx.strokeStyle = isLast ? pw.col : pw.col + "88";
        ctx.lineWidth = isLast ? 2 : 1; ctx.fill(); ctx.stroke();
        ctx.fillStyle = pw.col; ctx.font = `${isFirst || isLast ? 8.5 : 7.5}px ${OR}`; ctx.textAlign = "center";
        ctx.fillText(s.label, nx, midY - 4);
        ctx.fillStyle = pw.col + "88"; ctx.font = `6px ${MN}`;
        ctx.fillText(s.mol, nx, midY + 7);
        // enzyme label below
        if (!isFirst) {
          ctx.fillStyle = GRN + "aa"; ctx.font = `6px ${MN}`; ctx.textAlign = "center";
          ctx.fillText(s.enzyme, nx, midY + 30);
        }
        if (i < steps.length - 1) {
          // animated arrow
          const nx2 = 40 + (i + 1.5) * stepW;
          const arrowY = midY;
          const progress = ((t * 0.03 + i * 0.5) % 1);
          const ax = nx + nodeR + (nx2 - nodeR - nx - nodeR) * progress;
          const arrowAlpha = 0.5 + 0.3 * Math.sin(t * 0.05 + i);
          ctx.strokeStyle = pw.col + Math.round(arrowAlpha * 180).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 0.5;
          ctx.beginPath(); ctx.moveTo(nx + nodeR, arrowY); ctx.lineTo(nx2 - nodeR, arrowY); ctx.stroke();
          ctx.setLineDash([]);
          // moving molecule dot
          ctx.beginPath(); ctx.arc(ax, arrowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = pw.col + "cc"; ctx.fill();
        }
        // release product particles at last node
        if (isLast && Math.random() < 0.15) {
          molecules.push({ x: nx + (Math.random() - 0.5) * 20, y: midY, vx: (Math.random() - 0.5) * 1.5, vy: -1 - Math.random() * 1.2, col: pw.col, r: 2 + Math.random() * 2, life: 100, label: s.label });
        }
      });

      // floating product molecules
      molecules.forEach((m, mi) => {
        m.x += m.vx; m.y += m.vy; m.vx *= 0.99; m.life--;
        const alpha = m.life / 80;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.col + Math.round(alpha * 100).toString(16).padStart(2, "0"); ctx.fill();
        ctx.strokeStyle = m.col + Math.round(alpha * 200).toString(16).padStart(2, "0"); ctx.lineWidth = 0.8; ctx.stroke();
        if (m.life <= 0) molecules.splice(mi, 1);
      });

      // petroleum input arrow (left)
      ctx.fillStyle = AMB; ctx.font = `7.5px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("⛽ PETROLEUM", 40 + stepW * 0.5, H * 0.12);
      ctx.fillStyle = AMB + "88"; ctx.font = `6px ${MN}`;
      ctx.fillText(pw.feedstock, 40 + stepW * 0.5, H * 0.18);
      ctx.strokeStyle = AMB + "44"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(40 + stepW * 0.5, H * 0.21); ctx.lineTo(40 + stepW * 0.5, midY - 22); ctx.stroke();
      ctx.setLineDash([]);

      // drug output (right)
      ctx.fillStyle = pw.col; ctx.font = `7.5px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("💊 " + pw.drug, 40 + (steps.length - 0.5) * stepW, H * 0.75);
      ctx.fillStyle = pw.col + "88"; ctx.font = `6px ${MN}`;
      ctx.fillText(pw.class, 40 + (steps.length - 0.5) * stepW, H * 0.82);

      // why box
      ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(0, H - 50, W, 50);
      ctx.strokeStyle = pw.col + "22"; ctx.lineWidth = 1; ctx.strokeRect(0, H - 50, W, 50);
      ctx.fillStyle = pw.col + "99"; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
      ctx.fillText(`Why ${pRef.current}: ${pw.why}`, 12, H - 28);
      ctx.fillStyle = GRN + "77"; ctx.font = `6.5px ${MN}`;
      ctx.fillText(`Organism: ${pw.organism}`, 12, H - 12);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [pathway]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ── Main Page ─────────────────────────────────── */
export default function PolymerBiobreakPage() {
  const [polymer, setPolymer] = useState("PET");
  const [pathway, setPathway] = useState("aspirin");

  const card = (col = TEAL): React.CSSProperties => ({
    background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily:MN, fontSize:7.5, letterSpacing:"0.18em", color:DIM,
    textTransform:"uppercase", marginBottom:10, paddingBottom:4,
    borderBottom:"1px solid rgba(46,240,216,0.08)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({ fontFamily:OR, fontSize:11, color:col, letterSpacing:1, margin:"0 0 8px" });
  const body: React.CSSProperties = { fontSize:11.5, color:"rgba(200,215,232,0.72)", lineHeight:1.72 };

  const POLYMERS = ["PET","PE","PS","PUR","NYLON"];
  const PATHWAYS = [
    { id:"aspirin",    col:TEAL, label:"Benzene → Aspirin (NSAID)" },
    { id:"opioid",     col:ROSE, label:"Naphtha tyrosine → Hydrocodone" },
    { id:"antibiotic", col:GRN,  label:"Toluene → β-lactam precursor" },
    { id:"statin",     col:GOLD, label:"Acetate → Lovastatin (statin)" },
  ];

  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4", fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"inline-block", border:`1px solid ${GRN}55`, padding:"3px 10px", fontSize:9, letterSpacing:"0.2em", color:`${GRN}cc`, fontFamily:MN, marginBottom:8 }}>
            POLYMER DEPOLYMERISATION · ENZYMATIC CHAIN SCISSION · PLASTIC-EATING MICROBES · BIO-REFINERY · FOSSIL FUEL → PHARMACEUTICAL
          </div>
          <h1 style={{ fontFamily:OR, fontSize:20, fontWeight:900, letterSpacing:2, color:GRN, textShadow:`0 0 24px ${GRN}44`, margin:"4px 0 6px" }}>
            Polymer to Monomer · Microbes Breaking Plastic · Fossil Fuel Drugs
          </h1>
          <p style={{ ...body, maxWidth:860, margin:0 }}>
            Three live simulations: (1) enzyme-driven polymer chain scission — pick a plastic and watch PETase, laccases, and esterases cleave bonds one by one; (2) a live microbial colony eating through a plastic substrate in real time; (3) the engineered bacteria bio-refinery converting petroleum feedstocks into aspirin, opioids, antibiotics, and statins.
          </p>
        </div>

        {/* polymer chain break */}
        <div style={{ ...card(TEAL), marginBottom:14 }}>
          <div style={secLabel}>Polymer depolymerisation · enzymatic bond cleavage · PET PETase · PE laccase · PS styrene monooxygenase · PUR esterase · Nylon nylonase · chain scission kinetics</div>
          <h2 style={h2(TEAL)}>Polymer → Monomer · Enzymatic Chain Scission</h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {POLYMERS.map(p => (
              <button key={p} type="button" onClick={() => setPolymer(p)}
                style={{ fontFamily:MN, fontSize:8, padding:"5px 14px", borderRadius:3, cursor:"pointer",
                  background: polymer === p ? TEAL + "22" : "transparent",
                  border: `1px solid ${TEAL}${polymer === p ? "cc" : "33"}`,
                  color: TEAL + (polymer === p ? "" : "77") }}>
                {p}
              </button>
            ))}
          </div>
          <PolymerBreakCanvas polymer={polymer} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:TEAL, t:"PET · PETase from Ideonella sakaiensis", b:"In 2016, Yoshida et al. discovered Ideonella sakaiensis 201-F6 growing on PET bottles in a Japanese recycling facility. It secretes PETase (a cutinase-type esterase) that hydrolyses the ester bond between terephthalic acid and ethylene glycol units. At 30°C it degrades thin PET films in weeks. The engineered FAST-PETase variant (2022) works at 50°C and degrades post-consumer PET in 24 hours." },
              { col:BLUE, t:"PE · The Hard Case — No Ester to Attack", b:"Polyethylene is all C–C bonds — far more stable than PET esters. Degradation requires oxidative initiation: UV or laccase generates carbonyl groups (C=O), enabling subsequent attack by alkane monooxygenases and hydratases. Pseudomonas aeruginosa and Bacillus cereus have been shown to colonise and slowly degrade PE surfaces. Rate is 0.01–0.25% mass loss per month — far slower than PET. Engineering focus: introducing ester linkages via copolymerisation." },
              { col:AMB,  t:"PS / PUR / Nylon · Specialist Degraders", b:"Polystyrene: styrene monooxygenase (StyAB) in Pseudomonas putida converts styrene to styrene oxide, then to phenylacetaldehyde, entering TCA. Polyurethane: Pestalotiopsis microspora secretes an esterase that works in anaerobic conditions — remarkable as most fungal oxidases require O₂. Nylon-6: the nylonase of Flavobacterium K172 (found in a nylon factory drain) evolved in living memory — 1970s — a remarkable case of rapid enzyme evolution." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* microbe colony */}
        <div style={{ ...card(GRN), marginBottom:14 }}>
          <div style={secLabel}>Live microbial colony · plastic substrate biodegradation · Ideonella sakaiensis · Pseudomonas putida · Bacillus cereus · Pestalotiopsis microspora · Tenebrio molitor gut · enzyme cloud · chemotaxis</div>
          <h2 style={h2(GRN)}>Live Microbial Colony · Eating Through Plastic in Real Time</h2>
          <MicrobeEatCanvas />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:GRN,  t:"Chemotaxis Toward Plastic", b:"Bacteria don't randomly wander — they sense chemical gradients from partial hydrolysis products (terephthalic acid, ethylene glycol, styrene fragments). This chemotactic attraction causes colonies to aggregate at the plastic surface. The enzyme cloud radiating from each cell creates a micro-environment of locally elevated substrate concentration, enabling cooperative degradation even when individual enzyme kinetics are slow." },
              { col:TEAL, t:"Mealworm Gut — The Fastest Known PE Degrader", b:"Tenebrio molitor larvae (mealworms) can survive on polystyrene foam alone. Their gut microbiome — dominated by Exiguobacterium sp. strain YT2 — degrades PS at ~0.13 mg/larva/day. The larval gut provides anaerobic conditions, mechanical grinding, and bile-salt surfactants that dramatically increase surface area. This is currently the fastest known biological PE/PS degradation rate in any natural system." },
              { col:AMB,  t:"Products & Circular Economy", b:"Ideal enzymatic depolymerisation of PET produces two pure monomers: terephthalic acid (TPA) and ethylene glycol (EG). Both can be repolymerised into virgin-quality PET — a true circular loop. Carbios (France) achieved 97% monomer recovery from post-consumer PET waste using thermophilic cutinase, enabling 100% recycled PET bottles. This is superior to mechanical recycling, which degrades polymer chain length each cycle." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* bio-refinery */}
        <div style={{ ...card(AMB), marginBottom:14 }}>
          <div style={secLabel}>Engineered bacteria · fossil fuel feedstock → pharmaceutical · benzene → aspirin · toluene → antibiotic · naphtha → opioid · acetate → statin · P450 enzymes · synthetic biology metabolic engineering</div>
          <h2 style={h2(AMB)}>Petroleum → Drug · Engineered Bacteria Bio-Refinery</h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {PATHWAYS.map(p => (
              <button key={p.id} type="button" onClick={() => setPathway(p.id)}
                style={{ fontFamily:MN, fontSize:8, padding:"5px 14px", borderRadius:3, cursor:"pointer",
                  background: pathway === p.id ? p.col + "22" : "transparent",
                  border: `1px solid ${p.col}${pathway === p.id ? "cc" : "33"}`,
                  color: p.col + (pathway === p.id ? "" : "77") }}>
                {p.label}
              </button>
            ))}
          </div>
          <BioRefineryCanvas pathway={pathway} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:TEAL, t:"Why Petroleum as Feedstock?", b:"The carbon skeletons in fossil fuels — aromatic rings (benzene, toluene, naphthalene), linear alkanes (C5–C18), branched alkanes — are identical in structure to building blocks in pharmaceutical molecules. The challenge has always been selectivity: chemical synthesis of these intermediates requires harsh conditions (high temp/pressure, toxic solvents, metal catalysts) and produces toxic waste. Engineered bacteria achieve the same transformations at ambient temperature, in water, with high selectivity and minimal waste." },
              { col:AMB,  t:"P450 Cytochrome Enzymes — The Key Tool", b:"Cytochrome P450 monooxygenases are nature's universal hydroxylases — they insert an oxygen atom into C–H bonds with extraordinary selectivity. Petroleum aromatics have many C–H bonds; P450s can hydroxylate specific positions to produce pharmaceutical precursors. E. coli naturally lacks P450s, but metabolic engineers routinely introduce P450 genes from Streptomyces (antibiotic producers), Papaver (opioid pathway), or human liver (drug metabolism), creating de novo biosynthesis routes from cheap petroleum substrates." },
              { col:ROSE, t:"Opioid Biosynthesis — The 23-Gene Yeast", b:"In 2015, Galanie et al. (Stanford) introduced a 23-gene pathway from Papaver somniferum (opium poppy) into Saccharomyces cerevisiae, achieving complete biosynthesis of hydrocodone from simple glucose. The breakthrough: petroleum-derived tyrosine (produced by E. coli fermentation of glucose derived from petroleum methanol) feeds the pathway. The same yeast now produces the core benzylisoquinoline scaffold from which most clinical opioids derive. Yield: ~6 µg/L (2015) → >1 mg/L with optimization (2022)." },
              { col:GRN,  t:"P. putida KT2440 — The Aromatic Chassis", b:"Pseudomonas putida KT2440 naturally metabolises toluene, benzene, styrene, and naphthalene — petroleum derivatives typically toxic to E. coli. Its extraordinary solvent tolerance makes it ideal for high-concentration aromatic feedstock bioconversion. Engineers have rewired its native catechol/muconate pathways to produce adipic acid (nylon), cis,cis-muconate, vanillin (flavour/pharma), and p-hydroxybenzoate (pharmaceutical precursor) — all from toluene. It has become the preferred chassis for petroleum-to-chemical biotransformation." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
          {[
            { col:GRN,  t:"The Living Refinery vs The Dead One", b:"A petroleum refinery converts crude oil to products through heat and pressure — a brute-force phase diagram walk. A microbial bio-refinery does the same transformation through enzyme catalysis at 37°C — reading chemical structure, selecting reaction sites, stopping at precisely the intermediate you want. Life is a precision refinery that runs on sunlight and has been optimising its pathways for 3.8 billion years. We are now learning to reprogram it." },
            { col:TEAL, t:"Depolymerisation as Structural Reset", b:"AETHER's crystallisation model describes coherence as emergent structure — the pattern that forms when information organises itself into stable configurations. Polymers are crystallised structure: covalent bonds encoded into repeating geometry. Enzymatic depolymerisation is a coherence reset — returning the substrate to a lower-energy monomer state. The microbes don't destroy the information in the polymer — they recover it. Circular economy is coherence recovery." },
            { col:AMB,  t:"Carbon as the Universal Substrate", b:"Carbon's tetravalent bonding geometry — four equal bonds in three dimensions — allows infinite structural variation from a small alphabet. Petroleum's hydrocarbons are collapsed solar energy in carbon skeleton form. Pharmaceutical molecules are information-dense carbon architectures. The bacterial bio-refinery is the conversion process: carbon skeleton + enzymatic information = specific pharmacological function. The fossil fuel is not the end product. It is the raw vocabulary." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"10px 14px" }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:10.5, color:"rgba(200,215,232,0.65)", lineHeight:1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:10, borderTop:"1px solid rgba(68,204,119,0.08)", fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          POLYMER DEPOLYMERISATION · PETase · ENZYMATIC CHAIN SCISSION · IDEONELLA SAKAIENSIS · PSEUDOMONAS PUTIDA · BACILLUS CEREUS · PESTALOTIOPSIS · TENEBRIO MOLITOR · CHEMOTAXIS · ENZYME KINETICS · BIO-REFINERY · P450 HYDROXYLASE · BENZENE → ASPIRIN · TOLUENE → ADIPATE · OPIOID PATHWAY · LOVASTATIN PKS · AETHER CARBON COHERENCE
        </div>
      </div>
    </div>
  );
}
