import { useState, useRef, useEffect } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG    = "#020810";
const GOLD  = "#f2c354";
const TEAL  = "#2dd4bf";
const CYAN  = "#38bdf8";
const VIO   = "#a78bfa";
const ROSE  = "#f87171";
const AMB   = "#fb923c";
const GRN   = "#4ade80";
const PURP  = "#c084fc";
const TERA  = "#c4905a";  // terra-cotta · primordial / LUCA
const SLATE = "#475569";
const WHITE = "#e2e8f0";
const MUTED = "#64748b";
const MONO  = "'DM Mono', monospace";
const TAU   = 2 * Math.PI;

type Phase   = "G0" | "G1" | "S" | "G2" | "M" | "fission" | "budding";
type OrgKind = "luca" | "ecoli" | "yeast" | "somatic" | "stem" | "cancer";

const PHASE_COL: Record<Phase, string> = {
  G0: SLATE, G1: TEAL, S: GOLD, G2: VIO, M: ROSE, fission: AMB, budding: GRN,
};
const PHASE_LABEL: Record<Phase, string> = {
  G0: "G₀ Quiescent", G1: "G₁ Growth", S: "S Phase · Replication",
  G2: "G₂ Preparation", M: "M Mitosis", fission: "Binary Fission", budding: "Budding",
};

// ── Organism specifications ───────────────────────────────────────────────────
interface OrgSpec {
  name: string; fullName: string; color: string;
  cycleS: number; chromCount: string; genomeSize: string; geneCount: string;
  phases: Phase[];
  phaseFrac: number[];
  aetherC: number; checkpointGate: boolean;
  enzymes: string[]; paths: string[]; desc: string;
  geneNames: string[]; geneCols: string[];
}

const ORGS: Record<OrgKind, OrgSpec> = {
  luca: {
    name: "LUCA", fullName: "Last Universal Common Ancestor · Proto-Cell",
    color: TERA, cycleS: 120, chromCount: "1 (circular ~600 kb)", genomeSize: "~600 kb", geneCount: "~355 (all essential)",
    phases: ["G1", "S", "fission"], phaseFrac: [0.50, 0.30, 0.20],
    aetherC: 0.94, checkpointGate: false,
    geneNames: ["16S rRNA", "atpA", "polA", "recA", "GroEL", "GAPDH"],
    geneCols:  [TERA, GOLD, CYAN, GRN, VIO, AMB],
    enzymes: ["RNA Polymerase (proto-RNAP · ancestral to all life)", "Ribosome 70S (fully universal · least evolved structure)", "ATP Synthase / proto-ATPase (chemiosmosis · 3.8 Gya)", "DNA Pol I (proto-replicase · error rate ~10⁻⁷/base)", "RecA (primordial recombinase · genome repair)", "GroEL/GroES (chaperonin · protein folding · universal)"],
    paths: ["Wood-Ljungdahl (CO₂ + H₂ → acetyl-CoA · most ancestral)", "Proto-glycolysis (GAPDH · reverse TCA elements)", "Chemiosmosis (H⁺ gradient across membrane → ATP)", "Thioester chemistry (proto-metabolism without enzymes)"],
    desc: "The last node all extant life descends from — estimated 3.8–4.0 Gya. Every one of its ~355 genes is lethal-if-deleted; zero non-essential genes exist. No introns, no organelles, no nucleus, no cytoskeleton. Division is proto-binary fission: proto-FtsZ constricts the cell, but far more slowly than modern bacteria. Lives near alkaline hydrothermal vents (serpentinisation), runs on H₂/CO₂ chemistry, and uses an ancient lipid membrane whose composition is still debated (archaeal ether vs. bacterial ester lipids). This is the maximally evolutionarily constrained cell — everything that can be removed already was, by 4 billion years of selection.",
  },
  ecoli: {
    name: "E. coli", fullName: "Escherichia coli K-12",
    color: AMB, cycleS: 28, chromCount: "1 (circular)", genomeSize: "4.6 Mb", geneCount: "4,316",
    phases: ["S", "fission"], phaseFrac: [0.40, 0.60],
    aetherC: 0.72, checkpointGate: false,
    geneNames: ["oriC", "dnaA", "lacZ", "trpA", "rpoB", "ftsZ"],
    geneCols:  [CYAN, GRN, GOLD, ROSE, VIO, AMB],
    enzymes: ["DNA Pol III (main replicase)", "Topoisomerase II · GyrA (supercoil relief)", "FtsZ (Z-ring · division trigger)", "RecA (SOS repair · homologous recomb.)"],
    paths: ["Glycolysis → Pyruvate", "TCA cycle", "Oxidative phosphorylation", "Pentose phosphate pathway"],
    desc: "Binary fission — fastest common bacterium (~20 min real-time). No membrane-bound nucleus; circular chromosome replicated bidirectionally from oriC by two replication forks moving at ~1,000 bp/s. FtsZ GTPase polymerises into the Z-ring at mid-cell, constricts, and pinches the cell into two identical daughters. No G1 or G2 phases. No checkpoint gating.",
  },
  yeast: {
    name: "S. cerevisiae", fullName: "Saccharomyces cerevisiae (baker's yeast)",
    color: GRN, cycleS: 45, chromCount: "16 (linear)", genomeSize: "12 Mb", geneCount: "~6,000",
    phases: ["G1", "S", "G2", "budding"], phaseFrac: [0.30, 0.25, 0.20, 0.25],
    aetherC: 0.78, checkpointGate: true,
    geneNames: ["CDC28", "CDC20", "SIC1", "CLN1", "ADE2", "URA3"],
    geneCols:  [TEAL, GRN, GOLD, VIO, ROSE, CYAN],
    enzymes: ["Cdc28/Cdk1 (master kinase · drives all transitions)", "Cdc20 / APC-C (anaphase-promoting complex)", "Sic1 (CDK inhibitor · START gate)", "Clb2/Clb5 (B-type cyclins)"],
    paths: ["Fermentation (glucose → ethanol + CO₂)", "Gluconeogenesis", "Ergosterol pathway (membrane)", "Fatty acid synthesis"],
    desc: "Asymmetric budding — the bud grows as an outgrowth of the mother cell, which retains its identity and full complement of organelles. START commitment point in G1 (equivalent to Restriction Point in mammals) is gated by Cdc28/Sic1 balance. Model organism for cell-cycle research — nearly every mammalian CDK has a yeast homolog.",
  },
  somatic: {
    name: "Human somatic", fullName: "Homo sapiens — Somatic Cell",
    color: CYAN, cycleS: 72, chromCount: "46 (diploid)", genomeSize: "3.2 Gb", geneCount: "~20,000",
    phases: ["G1", "S", "G2", "M"], phaseFrac: [0.40, 0.30, 0.15, 0.15],
    aetherC: 0.83, checkpointGate: true,
    geneNames: ["TP53", "BRCA1", "MYC", "CDK4", "RB1", "PCNA"],
    geneCols:  [ROSE, GRN, GOLD, TEAL, VIO, CYAN],
    enzymes: ["DNA Pol δ/ε (replication)", "CDK1/Cyclin-B (G2→M trigger)", "Condensin I/II (chromosome compaction)", "Separase (cohesin cleavage · anaphase)", "Polo-like kinase 1 (PLK1 · centrosome)"],
    paths: ["Oxidative phosphorylation (primary ATP source)", "Pentose phosphate (NADPH / nucleotides)", "Serine–one-carbon (folate cycle)", "Fatty acid oxidation"],
    desc: "Full eukaryotic mitosis — 46 chromosomes condensed, aligned at metaphase plate, pulled to poles by spindle microtubules, encapsulated in daughter nuclei. Three checkpoints: G1/S Restriction Point (Rb/E2F), G2/M (CDK1/Cyclin-B activation), Spindle Assembly Checkpoint (SAC · Mad2/BubR1). Coherence gate C ≥ 0.65 required to cross G1/S.",
  },
  stem: {
    name: "Stem cell", fullName: "Human Pluripotent Stem Cell (hPSC)",
    color: PURP, cycleS: 55, chromCount: "46 (diploid)", genomeSize: "3.2 Gb", geneCount: "~20,000",
    phases: ["G0", "G1", "S", "G2", "M"], phaseFrac: [0.10, 0.25, 0.38, 0.15, 0.12],
    aetherC: 0.90, checkpointGate: true,
    geneNames: ["OCT4", "SOX2", "NANOG", "KLF4", "cMYC", "LIN28"],
    geneCols:  [PURP, GRN, GOLD, TEAL, ROSE, CYAN],
    enzymes: ["Oct4/Sox2/Nanog (pluripotency TF triad)", "LIF-STAT3 (self-renewal signalling)", "CDK2/Cyclin-E (abbreviated G1)", "DNMT3A/B (de novo methylation · differentiation)"],
    paths: ["Glycolysis (Warburg-like · fast ATP)", "OXPHOS switch (on differentiation)", "Acetyl-CoA metabolism (epigenetic fuel)", "One-carbon / folate (nucleotide synthesis)"],
    desc: "Asymmetric division: one daughter self-renews (maintains pluripotency), one begins differentiation. Very short G1 (Myc-driven CDK2 keeps Rb hyperphosphorylated). Large S-phase fraction = high replication coherence. Can enter G0 reversible quiescence (contact-inhibited). Yamanaka factors (Oct4+Sox2+Klf4+Myc) can reprogram somatic cells back to this state — coherence reset.",
  },
  cancer: {
    name: "Cancer cell", fullName: "Oncogenic Cell (HeLa-like)",
    color: ROSE, cycleS: 35, chromCount: "60–90 (aneuploid)", genomeSize: "Aneuploid", geneCount: "~20k + amplifications",
    phases: ["G1", "S", "G2", "M"], phaseFrac: [0.20, 0.40, 0.20, 0.20],
    aetherC: 0.42, checkpointGate: false,
    geneNames: ["KRAS*", "TP53*", "MYC*", "PTEN*", "EGFR*", "BCL2"],
    geneCols:  [ROSE, AMB, GOLD, VIO, GRN, TEAL],
    enzymes: ["Mutant Ras (constitutively active GTPase)", "Inactive p53 (guardian silenced)", "Amplified Myc (transcription · metabolism)", "CDK4/6 (Rb bypass — no Restriction Point)", "Survivin (apoptosis block · IAP family)"],
    paths: ["Warburg effect (aerobic glycolysis → lactate)", "Glutaminolysis (carbon + nitrogen source)", "De novo lipid synthesis (membrane expansion)", "Serine pathway (nucleotide synthesis · rapid S phase)"],
    desc: "Checkpoint-deficient uncontrolled division. TP53 mutation removes G1/S and G2/M brakes. Mutant KRAS locks growth signalling permanently ON. Contact inhibition lost — cells pile into multilayer colonies. Telomerase reactivated → unlimited replication. Chromosomal instability causes segregation errors → aneuploidy. AETHER coherence field disrupted: C = 0.42 — well below the 0.65 LPE threshold — yet division continues because checkpoint gate is absent.",
  },
};

// ── Cell data (mutable, held in ref) ─────────────────────────────────────────
interface Cell {
  id: number; row: number; col: number;
  phase: Phase; phaseT: number;
  coherence: number; age: number;
  arrested: boolean; org: OrgKind;
  genomePct: number;   // 0..1 DNA replication progress in S phase
  divAnim: number;     // 0..1 division animation (–1 = inactive)
  selected: boolean;
}

let _nextId = 0;
function makeCell(row: number, col: number, org: OrgKind, phase: Phase = "G1"): Cell {
  return { id: _nextId++, row, col, phase, phaseT: Math.random() * 0.5, coherence: 0.45 + Math.random() * 0.3, age: 0, arrested: false, org, genomePct: 0, divAnim: -1, selected: false };
}

// ── Hex grid positions ────────────────────────────────────────────────────────
const GRID_ROWS = 9, GRID_COLS = 11;

function hexXY(row: number, col: number, cellR: number, offX: number, offY: number) {
  const w = cellR * 2.3, h = cellR * 2.0;
  return {
    x: offX + col * w + (row % 2 === 0 ? 0 : w / 2),
    y: offY + row * h * 0.875,
  };
}

// adjacent hex neighbors
function hexNeighbors(row: number, col: number): [number, number][] {
  const even = row % 2 === 0;
  return [
    [row - 1, even ? col - 1 : col], [row - 1, even ? col : col + 1],
    [row, col - 1], [row, col + 1],
    [row + 1, even ? col - 1 : col], [row + 1, even ? col : col + 1],
  ].filter(([r, c]) => r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) as [number, number][];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NodeLatticePage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const orgRef     = useRef<OrgKind>("ecoli");
  const speedRef   = useRef(1.0);
  const gfRef      = useRef(0.5);    // growth factor 0..1
  const stressRef  = useRef(0.0);    // stress 0..1
  const cellsRef   = useRef<Cell[]>([]);
  const occupiedRef = useRef<Map<string, number>>(new Map()); // "row,col" -> cell id
  const rafRef     = useRef(0);
  const selRef     = useRef<Cell | null>(null);

  const [selCell, setSelCell] = useState<Cell | null>(null);
  const [stats, setStats]     = useState({ total: 0, byPhase: {} as Record<string, number>, avgC: 0 });
  const [orgKind, setOrgKind] = useState<OrgKind>("ecoli");
  const [infoTab, setInfoTab] = useState<"cycle" | "org" | "aether" | "evolution">("cycle");

  // speed/gf/stress slider refs
  const speedSlRef = useRef<HTMLInputElement>(null);
  const gfSlRef    = useRef<HTMLInputElement>(null);
  const stressSlRef = useRef<HTMLInputElement>(null);

  function key(r: number, c: number) { return `${r},${c}`; }

  function initCells() {
    _nextId = 0;
    const cells: Cell[] = [];
    const occ = new Map<string, number>();
    const org = orgRef.current;
    const spec = ORGS[org];
    // seed 20 cells roughly centred
    const seeds: [number, number][] = [];
    for (let r = 2; r < GRID_ROWS - 2; r++) {
      for (let c = 2; c < GRID_COLS - 2; c++) {
        seeds.push([r, c]);
      }
    }
    // shuffle
    for (let i = seeds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
    }
    const count = Math.min(22, seeds.length);
    const phases = spec.phases;
    for (let i = 0; i < count; i++) {
      const [r, c] = seeds[i];
      const ph = phases[Math.floor(Math.random() * phases.length)];
      const cell = makeCell(r, c, org, ph as Phase);
      occ.set(key(r, c), cell.id);
      cells.push(cell);
    }
    cellsRef.current = cells;
    occupiedRef.current = occ;
    selRef.current = null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, CELL_R = 26, offX = 0, offY = 0;

    function resize() {
      const pr = window.devicePixelRatio || 1;
      const w  = canvas.parentElement?.clientWidth  || 900;
      const h  = canvas.parentElement?.clientHeight || 700;
      canvas.width  = w * pr;
      canvas.height = h * pr;
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
      W = w; H = h;
      // fit hex grid
      const gridW = GRID_COLS * CELL_R * 2.3 + CELL_R;
      const gridH = GRID_ROWS * CELL_R * 2.0 * 0.875 + CELL_R;
      CELL_R = Math.min(28, Math.floor(Math.min(W / (GRID_COLS * 2.5), H / (GRID_ROWS * 2.0))));
      offX = (W - GRID_COLS * CELL_R * 2.3) / 2;
      offY = (H - GRID_ROWS * CELL_R * 1.75) / 2;
      void gridW; void gridH;
    }

    resize();
    window.addEventListener("resize", resize);
    initCells();

    let lastT = 0;

    function advanceCell(cell: Cell, dtSec: number) {
      const spec = ORGS[cell.org];
      const speed = (speedRef.current ?? 1) * (1 + gfRef.current * 0.8);
      const stress = stressRef.current ?? 0;
      cell.age += dtSec;

      // advance coherence based on phase
      if (cell.phase === "G1" || cell.phase === "G0") {
        cell.coherence += dtSec * speed * 0.12 * (1 - stress * 0.8);
      } else if (cell.phase === "S") {
        cell.coherence += dtSec * speed * 0.08;
      } else if (cell.phase === "G2") {
        cell.coherence = Math.min(1.0, cell.coherence + dtSec * speed * 0.18);
      } else if (cell.phase === "M" || cell.phase === "fission" || cell.phase === "budding") {
        cell.coherence -= dtSec * speed * 0.25;
      }
      cell.coherence = Math.max(0.2, Math.min(1.0, cell.coherence));
      // cancer cap
      if (cell.org === "cancer") cell.coherence = Math.min(0.55, cell.coherence);

      // how long this phase lasts
      const phaseIdx = spec.phases.indexOf(cell.phase);
      if (phaseIdx < 0) return;
      const frac = spec.phaseFrac[phaseIdx];
      const phaseDur = spec.cycleS * frac;
      const advance = (dtSec * speed) / phaseDur;

      // checkpoint gates
      if (cell.phase === "G2" && spec.checkpointGate && cell.coherence < 0.65) {
        cell.arrested = true;
        return;
      }
      cell.arrested = false;

      // S-phase genome replication
      if (cell.phase === "S") {
        cell.genomePct = Math.min(1, cell.phaseT);
      }

      cell.phaseT += advance;

      if (cell.phaseT >= 1.0) {
        cell.phaseT = 0;
        // transition
        const nextIdx = (phaseIdx + 1) % spec.phases.length;
        const nextPhase = spec.phases[nextIdx];

        // division events
        if (cell.phase === "fission" || cell.phase === "budding" || cell.phase === "M") {
          cell.divAnim = 0;  // trigger division animation
        } else {
          cell.phase = nextPhase as Phase;
          if (nextPhase === "G1" || nextPhase === "G0") {
            cell.genomePct = 0;
            cell.coherence = 0.38;
          }
        }
      }
    }

    function completeDivision(cell: Cell) {
      const spec = ORGS[cell.org];
      const phaseIdx = spec.phases.indexOf(cell.phase);
      if (phaseIdx < 0) return;
      const nextIdx = (phaseIdx + 1) % spec.phases.length;

      // find adjacent empty slot
      const nbrs = hexNeighbors(cell.row, cell.col);
      const empty = nbrs.filter(([r, c]) => !occupiedRef.current.has(key(r, c)));

      if (empty.length > 0 && cellsRef.current.length < 55) {
        const [dr, dc] = empty[Math.floor(Math.random() * empty.length)];
        const daughter = makeCell(dr, dc, cell.org, spec.phases[0] as Phase);
        daughter.coherence = 0.38;
        occupiedRef.current.set(key(dr, dc), daughter.id);
        cellsRef.current.push(daughter);
      }

      // reset parent
      cell.phase = spec.phases[nextIdx] as Phase;
      cell.phaseT = 0;
      cell.genomePct = 0;
      cell.divAnim = -1;
      cell.coherence = 0.40;
    }

    // ── Draw functions ─────────────────────────────────────────────────────────
    function drawCell(cell: Cell, t: number) {
      const { x, y } = hexXY(cell.row, cell.col, CELL_R, offX, offY);
      const isDividing = cell.divAnim >= 0;
      const da = isDividing ? cell.divAnim : 0;

      // glow
      const glowR = CELL_R * (2.2 + cell.coherence * 1.4);
      const pcol = PHASE_COL[cell.phase];
      const grd = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      grd.addColorStop(0, pcol + Math.round(cell.coherence * 90 + 20).toString(16).padStart(2, "0"));
      grd.addColorStop(1, pcol + "00");
      ctx.fillStyle = grd;
      ctx.beginPath();
      if (!isDividing) {
        ctx.arc(x, y, glowR, 0, TAU);
      } else {
        // two glows separating
        const sep = da * CELL_R * 1.2;
        ctx.arc(x - sep * 0.5, y, glowR * 0.7, 0, TAU);
        ctx.arc(x + sep * 0.5, y, glowR * 0.7, 0, TAU);
      }
      ctx.fill();

      if (isDividing) {
        // draw two daughter circles merging from one
        const r1 = CELL_R * (0.6 + da * 0.4);
        const sep = da * CELL_R * 1.5;
        for (const sx of [-1, 1]) {
          const cx2 = x + sx * sep * 0.5;
          ctx.beginPath(); ctx.arc(cx2, y, r1, 0, TAU);
          ctx.fillStyle = pcol + "cc"; ctx.fill();
          ctx.strokeStyle = pcol; ctx.lineWidth = 1.5; ctx.stroke();
        }
        return;
      }

      // cell body
      ctx.beginPath(); ctx.arc(x, y, CELL_R, 0, TAU);
      const bodyGrd = ctx.createRadialGradient(x - CELL_R * 0.3, y - CELL_R * 0.3, 0, x, y, CELL_R);
      bodyGrd.addColorStop(0, pcol + "55");
      bodyGrd.addColorStop(1, pcol + "18");
      ctx.fillStyle = bodyGrd; ctx.fill();
      ctx.strokeStyle = cell.selected ? "#ffffff" : (pcol + "bb");
      ctx.lineWidth = cell.selected ? 2.5 : 1.5;
      ctx.stroke();

      // phase progress arc
      ctx.beginPath();
      ctx.arc(x, y, CELL_R - 3, -Math.PI / 2, -Math.PI / 2 + TAU * cell.phaseT);
      ctx.strokeStyle = pcol; ctx.lineWidth = 2.5; ctx.stroke();

      // arrested indicator
      if (cell.arrested) {
        ctx.beginPath(); ctx.arc(x, y, CELL_R + 5, 0, TAU);
        ctx.strokeStyle = ROSE + "66"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.stroke();
        ctx.setLineDash([]);
      }

      // gene ring
      const spec = ORGS[cell.org];
      const gR = CELL_R * 0.52;
      const geneCount = spec.geneNames.length;
      for (let g = 0; g < geneCount; g++) {
        const startA = (g / geneCount) * TAU - Math.PI / 2;
        const endA   = ((g + 0.78) / geneCount) * TAU - Math.PI / 2;
        const gcol   = spec.geneCols[g];
        // template strand
        ctx.beginPath();
        ctx.arc(x, y, gR, startA, endA);
        ctx.strokeStyle = gcol + (cell.phase === "S" ? "55" : "aa");
        ctx.lineWidth = 2.5; ctx.stroke();
        // new strand in S phase
        if (cell.phase === "S" || cell.phase === "G2") {
          const repPct = cell.phase === "G2" ? 1 : cell.genomePct;
          const repEndA = startA + (endA - startA) * repPct;
          if (repEndA > startA) {
            ctx.beginPath(); ctx.arc(x, y, gR - 4, startA, repEndA);
            ctx.strokeStyle = gcol + "ff"; ctx.lineWidth = 2; ctx.stroke();
          }
        }
      }

      // nucleus dot (eukaryotes)
      if (cell.org !== "ecoli") {
        ctx.beginPath(); ctx.arc(x, y, CELL_R * 0.22, 0, TAU);
        ctx.fillStyle = pcol + "40"; ctx.fill();
        ctx.strokeStyle = pcol + "80"; ctx.lineWidth = 1; ctx.stroke();
      }

      // M-phase: chromosomes at poles
      if (cell.phase === "M") {
        const ang = cell.phaseT * TAU;
        for (let s = -1; s <= 1; s += 2) {
          const cx2 = x + s * CELL_R * 0.35 * Math.sin(ang);
          const cy2 = y - s * CELL_R * 0.30;
          ctx.beginPath(); ctx.arc(cx2, cy2, 3.5, 0, TAU);
          ctx.fillStyle = ROSE + "cc"; ctx.fill();
        }
        // spindle
        ctx.beginPath();
        ctx.moveTo(x - CELL_R * 0.7, y);
        ctx.lineTo(x + CELL_R * 0.7, y);
        ctx.strokeStyle = ROSE + "44"; ctx.lineWidth = 1; ctx.stroke();
      }

      // coherence label
      if (cell.selected) {
        ctx.font = `bold 9px ${MONO}`;
        ctx.fillStyle = WHITE;
        ctx.textAlign = "center";
        ctx.fillText(`C=${cell.coherence.toFixed(2)}`, x, y + CELL_R + 14);
        ctx.textAlign = "start";
      }

      // phase short label
      const phaseSym: Record<Phase, string> = { G0:"G₀", G1:"G₁", S:"S", G2:"G₂", M:"M", fission:"F", budding:"B" };
      ctx.font = `bold 9px ${MONO}`;
      ctx.fillStyle = pcol;
      ctx.textAlign = "center";
      ctx.fillText(phaseSym[cell.phase], x, y + 3.5);
      ctx.textAlign = "start";
    }

    function draw(t: number) {
      const dtSec = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      ctx.clearRect(0, 0, W, H);
      // background
      const bgGrd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
      bgGrd.addColorStop(0, "#030c20"); bgGrd.addColorStop(1, BG);
      ctx.fillStyle = bgGrd; ctx.fillRect(0, 0, W, H);

      // subtle hex grid
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const { x, y } = hexXY(r, c, CELL_R, offX, offY);
          ctx.beginPath(); ctx.arc(x, y, CELL_R - 1, 0, TAU);
          ctx.strokeStyle = "rgba(100,140,200,0.05)"; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      // edges between adjacent occupied cells
      const cells = cellsRef.current;
      const occ = occupiedRef.current;
      for (const cell of cells) {
        const nbrs = hexNeighbors(cell.row, cell.col);
        for (const [nr, nc] of nbrs) {
          if (nr < cell.row || (nr === cell.row && nc < cell.col)) continue;
          if (!occ.has(key(nr, nc))) continue;
          const { x: x1, y: y1 } = hexXY(cell.row, cell.col, CELL_R, offX, offY);
          const { x: x2, y: y2 } = hexXY(nr, nc, CELL_R, offX, offY);
          const strength = (cell.coherence + 0.4) / 2;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(100,180,255,${strength * 0.12})`; ctx.lineWidth = 1; ctx.stroke();
        }
      }

      // advance & draw cells
      const toFinalizeDivision: Cell[] = [];
      for (const cell of cells) {
        advanceCell(cell, dtSec);
        if (cell.divAnim >= 0) {
          cell.divAnim += dtSec * (speedRef.current ?? 1) * 1.2;
          if (cell.divAnim >= 1.0) toFinalizeDivision.push(cell);
        }
      }
      for (const cell of toFinalizeDivision) completeDivision(cell);
      for (const cell of cells) drawCell(cell, t);

      // stats update (every ~30 frames)
      if (Math.floor(t / 500) !== Math.floor((t - dtSec * 1000) / 500)) {
        const byPhase: Record<string, number> = {};
        let sumC = 0;
        for (const cell of cells) {
          byPhase[cell.phase] = (byPhase[cell.phase] ?? 0) + 1;
          sumC += cell.coherence;
        }
        setStats({ total: cells.length, byPhase, avgC: cells.length ? sumC / cells.length : 0 });
        if (selRef.current) setSelCell({ ...selRef.current });
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      let best: Cell | null = null, bestD = Infinity;
      for (const cell of cellsRef.current) {
        const { x, y } = hexXY(cell.row, cell.col, CELL_R, offX, offY);
        const d = (x - mx) ** 2 + (y - my) ** 2;
        if (d < bestD) { bestD = d; best = cell; }
      }
      for (const c of cellsRef.current) c.selected = false;
      if (best && bestD < (CELL_R * 2) ** 2) {
        best.selected = true;
        selRef.current = best;
        setSelCell({ ...best });
      } else {
        selRef.current = null;
        setSelCell(null);
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function handleOrg(o: OrgKind) {
    orgRef.current = o;
    setOrgKind(o);
    initCells();
    selRef.current = null;
    setSelCell(null);
  }

  function forceDivide() {
    const cell = selRef.current ?? cellsRef.current[0];
    if (!cell) return;
    cell.phase = "S"; cell.phaseT = 0; cell.coherence = 0.72; cell.arrested = false;
  }

  function reset() { initCells(); selRef.current = null; setSelCell(null); }

  const spec = ORGS[orgKind];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: BG, fontFamily: "'Inter', sans-serif", color: WHITE }}>

      {/* ── CANVAS ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

        {/* floating top label */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(100,180,255,0.45)", textTransform: "uppercase", textAlign: "center" }}>
            Cell Division · Gene Replication · AETHER Node Lattice
          </div>
        </div>

        {/* floating stats bar */}
        <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 16, background: "rgba(2,8,16,0.82)", border: "1px solid rgba(100,180,255,0.12)", borderRadius: 8, padding: "6px 18px", fontSize: 10 }}>
          <span style={{ color: MUTED }}>cells</span>
          <span style={{ color: CYAN, fontFamily: MONO }}>{stats.total}</span>
          {Object.entries(stats.byPhase).map(([ph, n]) => (
            <span key={ph} style={{ color: PHASE_COL[ph as Phase] ?? WHITE, fontFamily: MONO }}>{ph}:{n}</span>
          ))}
          <span style={{ color: MUTED }}>|</span>
          <span style={{ color: MUTED }}>avg C̄</span>
          <span style={{ color: spec.color, fontFamily: MONO }}>{stats.avgC.toFixed(2)}</span>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div style={{ width: 320, flexShrink: 0, background: "rgba(2,6,14,0.97)", borderLeft: "1px solid rgba(100,180,255,0.10)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* organism selector */}
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(100,180,255,0.08)" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.2em", color: MUTED, marginBottom: 8 }}>ORGANISM</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(Object.keys(ORGS) as OrgKind[]).map(o => (
              <button key={o} onClick={() => handleOrg(o)}
                style={{ fontSize: 9, padding: "4px 9px", borderRadius: 5, border: `1px solid ${o === orgKind ? ORGS[o].color : "rgba(100,180,255,0.15)"}`, background: o === orgKind ? ORGS[o].color + "22" : "transparent", color: o === orgKind ? ORGS[o].color : MUTED, cursor: "pointer", fontFamily: MONO }}>
                {ORGS[o].name}
              </button>
            ))}
          </div>
        </div>

        {/* sliders + buttons */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(100,180,255,0.08)" }}>
          {[
            { label: "Sim speed", ref: speedSlRef, min: 0.2, max: 5, step: 0.1, def: 1.0, onChange: (v: number) => { speedRef.current = v; } },
            { label: "Growth factor", ref: gfSlRef,  min: 0, max: 1, step: 0.05, def: 0.5, onChange: (v: number) => { gfRef.current = v; } },
            { label: "Stress / arrest", ref: stressSlRef, min: 0, max: 1, step: 0.05, def: 0.0, onChange: (v: number) => { stressRef.current = v; } },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: MUTED }}>{s.label}</span>
              <input ref={s.ref} type="range" min={s.min} max={s.max} step={s.step} defaultValue={s.def}
                onChange={e => s.onChange(parseFloat(e.target.value))}
                style={{ width: 110, accentColor: spec.color }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={forceDivide} style={{ flex: 1, padding: "6px 0", fontSize: 9, fontFamily: MONO, borderRadius: 5, border: `1px solid ${GOLD}`, background: GOLD + "18", color: GOLD, cursor: "pointer" }}>
              ⚡ FORCE DIVIDE
            </button>
            <button onClick={reset} style={{ flex: 1, padding: "6px 0", fontSize: 9, fontFamily: MONO, borderRadius: 5, border: `1px solid ${MUTED}`, background: "transparent", color: MUTED, cursor: "pointer" }}>
              ↺ RESET
            </button>
          </div>
          <div style={{ fontSize: 8, color: SLATE, marginTop: 4 }}>Click a cell to select · Force Divide pushes it into S phase</div>
        </div>

        {/* info tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(100,180,255,0.08)" }}>
          {([["cycle","CYCLE"],["org","ORGANISM"],["aether","AETHER"],["evolution","EVOLUTION"]] as [typeof infoTab, string][]).map(([t, l]) => (
            <button key={t} onClick={() => setInfoTab(t)}
              style={{ flex: 1, padding: "7px 0", fontSize: 8, letterSpacing: "0.15em", background: "transparent", border: "none", borderBottom: infoTab === t ? `2px solid ${spec.color}` : "2px solid transparent", color: infoTab === t ? spec.color : MUTED, cursor: "pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>

          {infoTab === "cycle" && (
            <div>
              {/* selected cell */}
              {selCell ? (
                <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${PHASE_COL[selCell.phase]}44`, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                  <div style={{ fontSize: 8, color: PHASE_COL[selCell.phase], letterSpacing: "0.15em", marginBottom: 6 }}>SELECTED CELL #{selCell.id}</div>
                  {[
                    { l: "Phase", v: PHASE_LABEL[selCell.phase], c: PHASE_COL[selCell.phase] },
                    { l: "Phase progress", v: (selCell.phaseT * 100).toFixed(0) + "%", c: WHITE },
                    { l: "Coherence C", v: selCell.coherence.toFixed(3), c: selCell.coherence >= 0.65 ? GRN : ROSE },
                    { l: "LPE gate", v: selCell.coherence >= 0.65 ? "OPEN ≥ 0.65" : "CLOSED < 0.65", c: selCell.coherence >= 0.65 ? GRN : ROSE },
                    { l: "DNA replicated", v: selCell.phase === "S" ? (selCell.genomePct * 100).toFixed(0) + "%" : selCell.phase === "G2" || selCell.phase === "M" ? "100%" : "0%", c: GOLD },
                    { l: "Arrested", v: selCell.arrested ? "YES — checkpoint hold" : "No", c: selCell.arrested ? ROSE : MUTED },
                    { l: "Cell age", v: selCell.age.toFixed(1) + "s sim", c: MUTED },
                  ].map(({ l, v, c }) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: MUTED }}>{l}</span>
                      <span style={{ fontSize: 9, color: c, fontFamily: MONO }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 9, color: MUTED, marginBottom: 12 }}>Click a cell to inspect it</div>
              )}

              {/* phase legend */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", marginBottom: 8 }}>PHASE LEGEND</div>
              {spec.phases.map((ph, i) => (
                <div key={ph} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: PHASE_COL[ph as Phase], flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 9, color: PHASE_COL[ph as Phase], fontWeight: 600 }}>{PHASE_LABEL[ph as Phase]} · {(spec.phaseFrac[i] * 100).toFixed(0)}% of cycle</div>
                    <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.5 }}>{
                      ph === "G0" ? "Reversible quiescence. Cell exits cycle. Re-enters on mitogenic signal." :
                      ph === "G1" ? "Cell grows in mass. Organelles duplicated. Restriction Point: Rb/E2F gate." :
                      ph === "S"  ? "DNA synthesis — genome fully replicated. Two complete copies made." :
                      ph === "G2" ? "Growth check. CDK1/Cyclin-B rises. G2/M checkpoint: DNA integrity scan." :
                      ph === "M"  ? "Chromosomes condense → align → separate → new nuclei form → cytokinesis." :
                      ph === "fission" ? "Z-ring constricts at mid-cell. Two identical daughters produced." :
                      "Bud emerges from mother surface. Grows to full size. Separates." }</div>
                  </div>
                </div>
              ))}

              {/* checkpoints */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "12px 0 8px" }}>CHECKPOINTS</div>
              {spec.checkpointGate ? [
                { name: "G1/S Restriction Point", gate: "Rb/E2F · CDK4-CycD", col: TEAL },
                { name: "G2/M CDK1 Gate", gate: "CDK1/Cyclin-B activation · C ≥ 0.65", col: VIO },
                { name: "Spindle Assembly (M)", gate: "Mad2/BubR1 · all kinetochores attached", col: ROSE },
              ].map(cp => (
                <div key={cp.name} style={{ borderLeft: `2px solid ${cp.col}`, paddingLeft: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: cp.col }}>{cp.name}</div>
                  <div style={{ fontSize: 9, color: MUTED }}>{cp.gate}</div>
                </div>
              )) : (
                <div style={{ fontSize: 9, color: ROSE }}>No checkpoint gating in {spec.name}. Division proceeds unconditionally.</div>
              )}
            </div>
          )}

          {infoTab === "org" && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: spec.color, fontWeight: 700, marginBottom: 2 }}>{spec.fullName}</div>
                <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.65 }}>{spec.desc}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                {[
                  { l: "Genome", v: spec.genomeSize },
                  { l: "Genes", v: spec.geneCount },
                  { l: "Chromosomes", v: spec.chromCount },
                  { l: "Cycle time", v: spec.cycleS + "s sim" },
                ].map(({ l, v }) => (
                  <div key={l} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 8, color: MUTED }}>{l}</div>
                    <div style={{ fontSize: 10, color: WHITE, fontFamily: MONO }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", marginBottom: 6 }}>KEY GENES (visualised as gene ring)</div>
              {spec.geneNames.map((g, i) => (
                <div key={g} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: spec.geneCols[i], flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: spec.geneCols[i], fontFamily: MONO }}>{g}</span>
                </div>
              ))}

              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "10px 0 6px" }}>KEY ENZYMES</div>
              {spec.enzymes.map(e => (
                <div key={e} style={{ fontSize: 9, color: WHITE, lineHeight: 1.6, marginBottom: 4, paddingLeft: 8, borderLeft: `2px solid ${spec.color}44` }}>{e}</div>
              ))}

              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "10px 0 6px" }}>METABOLIC PATHWAYS</div>
              {spec.paths.map(p => (
                <div key={p} style={{ fontSize: 9, color: MUTED, lineHeight: 1.6, marginBottom: 3 }}>· {p}</div>
              ))}
            </div>
          )}

          {infoTab === "aether" && (
            <div>
              <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.65, marginBottom: 12 }}>
                AETHER maps cell division as a <span style={{ color: GOLD }}>crystallisation event</span> — the same C(x,t) field that governs atomic lattice lock governs the G2→M commitment. The coherence threshold C ≥ 0.65 is the Liquid-Phase Emergence (LPE) gate.
              </div>

              {/* organism coherence profile */}
              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${spec.color}33`, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                <div style={{ fontSize: 8, color: spec.color, letterSpacing: "0.15em", marginBottom: 8 }}>AETHER COHERENCE PROFILE</div>
                {[
                  { l: "Base coherence C̄", v: spec.aetherC.toFixed(3), c: spec.aetherC >= 0.65 ? GRN : ROSE },
                  { l: "LPE gate threshold", v: "0.650", c: GOLD },
                  { l: "Gate status", v: spec.aetherC >= 0.65 ? "OPEN" : "BYPASSED (cancer)", c: spec.aetherC >= 0.65 ? GRN : ROSE },
                  { l: "Live avg C̄", v: stats.avgC.toFixed(3), c: WHITE },
                  { l: "Checkpoint gating", v: spec.checkpointGate ? "Active" : "Absent — oncogenic", c: spec.checkpointGate ? GRN : ROSE },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: MUTED }}>{l}</span>
                    <span style={{ fontSize: 9, color: c, fontFamily: MONO }}>{v}</span>
                  </div>
                ))}
                {/* C bar */}
                <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, margin: "8px 0 2px" }}>
                  <div style={{ height: "100%", width: (spec.aetherC * 100) + "%", background: spec.color, borderRadius: 2 }} />
                </div>
                <div style={{ height: 4, position: "relative", marginBottom: 4 }}>
                  <div style={{ position: "absolute", left: "65%", top: -14, width: 1, height: 18, background: GOLD + "99" }} />
                </div>
              </div>

              {/* AETHER phase mapping */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", marginBottom: 8 }}>CRYSTALLISATION MAPPING</div>
              {[
                { phase: "G0/G1", aether: "SCATTERED", col: SLATE, eq: "C(x,t) low · Δω high · disordered atoms", body: "Cell in dispersed state — equivalent to disordered carbon before nucleation. Signal molecules (growth factors, mitogens) are the nucleation seeds." },
                { phase: "S phase", aether: "NUCLEATION", col: GOLD, eq: "C rising · genome doubling · coherence forming", body: "DNA replication is the nucleation event — the cell commits to producing a complete second copy. Two replication forks from each origin (oriC or ARS) form the coherence scaffold." },
                { phase: "G2", aether: "LATTICE ORDERING", col: VIO, eq: "C → 1 · CDK1/Cyclin-B peak", body: "The cell verifies genome integrity and assembles the mitotic spindle. C rises toward the LPE threshold 0.65 — below this, the G2/M checkpoint holds." },
                { phase: "M / Fission", aether: "CRYSTAL LOCK", col: ROSE, eq: "C → 1 → division event → C drops to 0.40", body: "Division is crystallisation: the parent's coherent field bifurcates into two daughter fields. C collapses to 0.40 immediately after — the daughters must grow their own coherence from scratch." },
              ].map(({ phase, aether, col, eq, body }) => (
                <div key={phase} style={{ borderLeft: `2px solid ${col}`, paddingLeft: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 9, color: col, fontWeight: 600 }}>{phase}</span>
                    <span style={{ fontSize: 8, color: col + "88", fontFamily: MONO }}>{aether}</span>
                  </div>
                  <div style={{ fontSize: 8, color: GOLD, fontFamily: MONO, marginBottom: 3 }}>{eq}</div>
                  <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.55 }}>{body}</div>
                </div>
              ))}

              {/* key equations */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "10px 0 8px" }}>KEY EQUATIONS</div>
              {[
                { label: "Coherence field",   eq: "C(x,t) = A(x)·e^{i(φ−ωt)}" },
                { label: "LPE threshold",     eq: "C ≥ 0.65 → M phase entry" },
                { label: "Division rate",     eq: "dN/dt = μ_max · N · C / (K_c + C)" },
                { label: "Monod growth",      eq: "μ = μ_max · [S] / (K_s + [S])" },
                { label: "Contact inhibit.",  eq: "dN/dt → 0  when  N_adj = max" },
                { label: "Cancer (no gate)",  eq: "C < 0.65 but division proceeds" },
              ].map(({ label, eq }) => (
                <div key={label} style={{ marginBottom: 5 }}>
                  <div style={{ fontSize: 8, color: MUTED }}>{label}</div>
                  <div style={{ fontSize: 9, color: GOLD, fontFamily: MONO }}>{eq}</div>
                </div>
              ))}
            </div>
          )}

          {infoTab === "evolution" && (
            <div>
              {/* intro */}
              <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.65, marginBottom: 12 }}>
                A <span style={{ color: TERA }}>naturally constrained cell</span> is one where evolution has had the most time to eliminate every non-essential gene. LUCA is the deepest node — its genome is the irreducible core that all life shares. Below that core lies only chemistry.
              </div>

              {/* stability equations */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", marginBottom: 8 }}>STABILITY EQUATIONS</div>
              {[
                { label: "Gibbs free energy (spontaneity)", eq: "ΔG = ΔH − T·ΔS < 0", note: "All biochemical reactions must satisfy this to proceed. Cell metabolism = continuous ΔG < 0 chain." },
                { label: "Eigen error threshold", eq: "q^L > q_min = e^{−μ·L}", note: "Replication fidelity q per base, genome length L. Below threshold: genome melts — information destroyed. LUCA is at the threshold. Modern DNA pol proofreading raised q, allowing larger genomes." },
                { label: "Replication survival fraction", eq: "Φ = q^L  (LUCA: 0.94)", note: "q = 0.9999999 (10⁻⁷ error/base), L = 600,000. E. coli: q ≈ 1−10⁻¹⁰, L = 4.6M → Φ ≈ 0.9995." },
                { label: "Monod growth (nutrient-limited)", eq: "μ = μ_max · [S] / (K_s + [S])", note: "LUCA lived at hydrothermal vent — [S] = dissolved H₂/CO₂. K_s high → slow growth, stable equilibrium with vent flux." },
                { label: "Fitness landscape (Fisher)", eq: "dW̄/dt = Var(w) / W̄", note: "Rate of fitness increase equals variance in fitness. LUCA had very low variance — maximum constraint means minimum evolvability." },
                { label: "Membrane electrochemical potential", eq: "ΔμH⁺ = F·ΔΨ − RT·ln([H⁺]out/[H⁺]in)", note: "The proton motive force driving ATP synthase. The vent provided a natural H⁺ gradient before any membrane evolved — first 'free' energy source for life." },
              ].map(({ label, eq, note }) => (
                <div key={label} style={{ marginBottom: 10, borderLeft: `2px solid ${TERA}55`, paddingLeft: 8 }}>
                  <div style={{ fontSize: 8, color: TERA }}>{label}</div>
                  <div style={{ fontSize: 10, color: GOLD, fontFamily: MONO, margin: "2px 0" }}>{eq}</div>
                  <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.5 }}>{note}</div>
                </div>
              ))}

              {/* bottom-up construction */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "12px 0 8px" }}>BOTTOM-UP CONSTRUCTION</div>
              {[
                { level: "1 · Pure chemistry", col: "#4b5563", items: ["H₂O, CO₂, NH₃, H₂S, HCN (Miller-Urey)", "Amino acids, nucleobases via UV + heat", "Mineral surfaces (FeS, pyrite) as catalysts", "No information, no membrane, no selection"] },
                { level: "2 · Polymer world", col: "#6b7280", items: ["Short peptides form spontaneously in hot/dry cycles", "RNA oligomers — 2'–5' and 3'–5' linkages", "No faithful copying yet — random sequence space", "Thioester bonds as proto-high-energy phosphate"] },
                { level: "3 · RNA World", col: AMB, items: ["Ribozymes: RNA acts as both information AND catalyst", "Self-replicating RNA emerges (~4.2 Gya estimate)", "Error rate ~10⁻² — limits genome to ~100 bases (Eigen)", "Peptidyl transferase (ribosome core) still RNA today"] },
                { level: "4 · LUCA · Proto-cell", col: TERA, items: ["DNA takes over information storage (more stable)", "Proteins take over catalysis (more versatile)", "Lipid membrane encloses the system", "~355 essential genes · chemiosmosis · ribosomes"] },
                { level: "5 · Prokaryote crown", col: AMB, items: ["~4,000 genes in E. coli — 3,600 non-essential added", "Metabolic diversification (photosynthesis, nitrogen fixing)", "Horizontal gene transfer drives rapid innovation", "Fast division (~20 min) — relaxed constraint"] },
                { level: "6 · Eukaryote", col: CYAN, items: ["Endosymbiosis: mitochondrion = engulfed α-proteobacterium", "Nucleus separates transcription from translation", "~20,000 genes · complex gene regulation", "Mitosis required for accurate 46-chromosome segregation"] },
              ].map(({ level, col, items }) => (
                <div key={level} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: col, fontWeight: 700, marginBottom: 4 }}>{level}</div>
                  {items.map(it => (
                    <div key={it} style={{ fontSize: 9, color: MUTED, lineHeight: 1.5, paddingLeft: 8 }}>· {it}</div>
                  ))}
                </div>
              ))}

              {/* evolutionary chasms */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "12px 0 8px" }}>EVOLUTIONARY CHASMS</div>
              <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.6, marginBottom: 8 }}>A chasm is a transition so improbable it happened only once in 4 billion years of life on Earth. Each one is an AETHER crystallisation event at the evolutionary scale — a phase transition in information complexity.</div>
              {[
                { name: "Chemistry → RNA World", age: "~4.2–4.0 Gya", difficulty: "Unknown — possibly the hardest", col: "#6b7280", desc: "Spontaneous polymerisation of RNA with catalytic activity. No known path from chemistry to a self-replicating molecule. May have required mineral templating (montmorillonite clay, FeS scaffolds at alkaline vents)." },
                { name: "RNA World → LUCA (DNA/protein)", age: "~4.0–3.8 Gya", difficulty: "Happened once · no repeats", col: TERA, desc: "Genetic code origin: 64 codons → 20 amino acids. This code is nearly universal (only minor variations in mitochondria). Once fixed, the code became locked — any change breaks all existing proteins simultaneously. Maximum evolutionary constraint." },
                { name: "LUCA → Crown Prokaryotes", age: "~3.8–3.0 Gya", difficulty: "Multiple events (Bacteria/Archaea split)", col: AMB, desc: "Domain divergence: Bacteria and Archaea differ in membrane lipid chemistry (ester vs. ether), yet share the same DNA, ribosomes, ATP synthase — all inherited from LUCA. Metabolic explosion: photosynthesis, nitrogen fixation, sulfur reduction." },
                { name: "Prokaryote → Eukaryote", age: "~2.0–1.8 Gya", difficulty: "Happened once (endosymbiosis)", col: CYAN, desc: "An archaeal host engulfed an alpha-proteobacterium — instead of digesting it, they formed a permanent partnership. The bacterium became the mitochondrion. This gave eukaryotes 10,000× more energy per gene, enabling genome expansion. The nucleus then allowed complex gene regulation." },
              ].map(({ name, age, difficulty, col, desc }) => (
                <div key={name} style={{ marginBottom: 12, borderLeft: `3px solid ${col}`, paddingLeft: 10 }}>
                  <div style={{ fontSize: 10, color: col, fontWeight: 700, marginBottom: 2 }}>{name}</div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 3 }}>
                    <span style={{ fontSize: 8, color: MUTED }}>{age}</span>
                    <span style={{ fontSize: 8, color: col + "88" }}>{difficulty}</span>
                  </div>
                  <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}

              {/* LUCA vs E. coli comparison */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "12px 0 8px" }}>LUCA vs. E. COLI — PROKARYOTE CHASM</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
                  <thead>
                    <tr>
                      {["Property", "LUCA", "E. coli"].map(h => (
                        <th key={h} style={{ padding: "4px 6px", borderBottom: `1px solid rgba(100,180,255,0.12)`, color: MUTED, fontWeight: 400, textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Genes", "~355 (all essential)", "4,316 (~1,000 essential)"],
                      ["Genome size", "~600 kb", "4.6 Mb (7.7× larger)"],
                      ["Non-essential genes", "0%", "~77%"],
                      ["Division time", "~120s sim / hours real", "~28s sim / 20 min real"],
                      ["Error rate", "~10⁻⁷/base", "~10⁻¹⁰/base (proofreading)"],
                      ["Survival Φ (q^L)", "~0.94", "~0.9995"],
                      ["Energy source", "H₂/CO₂ (vent gradient)", "Glycolysis / OXPHOS"],
                      ["Membrane lipids", "Debated (proto-ether?)", "Ester-linked fatty acids"],
                      ["Gene transfer", "Vertical only (proto)", "HGT 15% of genome"],
                      ["Evolutionary constraint", "MAXIMUM (all lethal)", "Moderate (77% flexible)"],
                      ["AETHER coherence C̄", "0.94 (tightest system)", "0.72 (diversified)"],
                    ].map(([prop, luca, ecoli]) => (
                      <tr key={prop}>
                        <td style={{ padding: "3px 6px", color: MUTED, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{prop}</td>
                        <td style={{ padding: "3px 6px", color: TERA, fontFamily: MONO, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{luca}</td>
                        <td style={{ padding: "3px 6px", color: AMB, fontFamily: MONO, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{ecoli}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AETHER framing */}
              <div style={{ fontSize: 8, color: MUTED, letterSpacing: "0.15em", margin: "14px 0 8px" }}>AETHER READING</div>
              {[
                { h: "LUCA = Maximum crystallisation", b: "LUCA has the highest coherence C = 0.94 because it is maximally ordered — every gene locked in, nothing redundant. This is the fully crystallised state of biology. Any mutation is a crack in the crystal; natural selection immediately repairs it." },
                { h: "Evolution = controlled decoherence", b: "From LUCA to E. coli, the genome expanded 7.7× — but most new genes are non-essential. Coherence per gene dropped from 1.0 (all essential) to ~0.23 (23% essential). Evolvability requires some disorder (C < 1.0) to sample new sequence space." },
                { h: "Chasms = phase transitions", b: "Each evolutionary chasm is a first-order phase transition in information space: the system crosses an energy barrier into a new attractor basin. RNA→DNA was a phase transition in information storage medium. Endosymbiosis was a phase transition in energy architecture. Both happened exactly once." },
              ].map(({ h, b }) => (
                <div key={h} style={{ marginBottom: 10, background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, color: TERA, fontWeight: 600, marginBottom: 3 }}>{h}</div>
                  <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.6 }}>{b}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
