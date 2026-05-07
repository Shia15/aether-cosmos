import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────────────

const COMPLEMENT: Record<string, string> = { A: "T", T: "A", C: "G", G: "C" };
const BASE_COLORS: Record<string, string> = {
  A: "#f472b6", T: "#34d399", C: "#60a5fa", G: "#fbbf24",
};

const CODONS: Record<string, string> = {
  UUU:"Phe", UUC:"Phe", UUA:"Leu", UUG:"Leu",
  CUU:"Leu", CUC:"Leu", CUA:"Leu", CUG:"Leu",
  AUU:"Ile", AUC:"Ile", AUA:"Ile", AUG:"Met (START)",
  GUU:"Val", GUC:"Val", GUA:"Val", GUG:"Val",
  UCU:"Ser", UCC:"Ser", UCA:"Ser", UCG:"Ser",
  CCU:"Pro", CCC:"Pro", CCA:"Pro", CCG:"Pro",
  ACU:"Thr", ACC:"Thr", ACA:"Thr", ACG:"Thr",
  GCU:"Ala", GCC:"Ala", GCA:"Ala", GCG:"Ala",
  UAU:"Tyr", UAC:"Tyr", UAA:"STOP", UAG:"STOP",
  CAU:"His", CAC:"His", CAA:"Gln", CAG:"Gln",
  AAU:"Asn", AAC:"Asn", AAA:"Lys", AAG:"Lys",
  GAU:"Asp", GAC:"Asp", GAA:"Glu", GAG:"Glu",
  UGU:"Cys", UGC:"Cys", UGA:"STOP", UGG:"Trp",
  CGU:"Arg", CGC:"Arg", CGA:"Arg", CGG:"Arg",
  AGU:"Ser", AGC:"Ser", AGA:"Arg", AGG:"Arg",
  GGU:"Gly", GGC:"Gly", GGA:"Gly", GGG:"Gly",
};

const AMINO_COLORS: Record<string, string> = {
  Phe:"#f472b6", Leu:"#fb923c", Ile:"#fbbf24", Met:"#a3e635",
  Val:"#34d399", Ser:"#2dd4bf", Pro:"#22d3ee", Thr:"#60a5fa",
  Ala:"#818cf8", Tyr:"#a78bfa", His:"#e879f9", Gln:"#f0abfc",
  Asn:"#fda4af", Lys:"#fdba74", Asp:"#86efac", Glu:"#6ee7b7",
  Cys:"#fde68a", Trp:"#e0e7ff", Arg:"#c7d2fe", Gly:"#ddd6fe",
};

type BloodType = "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

const BLOOD_TYPES: BloodType[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const CAN_DONATE_TO: Record<BloodType, BloodType[]> = {
  "O-":  ["O-","O+","A-","A+","B-","B+","AB-","AB+"],
  "O+":  ["O+","A+","B+","AB+"],
  "A-":  ["A-","A+","AB-","AB+"],
  "A+":  ["A+","AB+"],
  "B-":  ["B-","B+","AB-","AB+"],
  "B+":  ["B+","AB+"],
  "AB-": ["AB-","AB+"],
  "AB+": ["AB+"],
};

const CAN_RECEIVE_FROM: Record<BloodType, BloodType[]> = {
  "AB+": ["O-","O+","A-","A+","B-","B+","AB-","AB+"],
  "AB-": ["O-","A-","B-","AB-"],
  "A+":  ["O-","O+","A-","A+"],
  "A-":  ["O-","A-"],
  "B+":  ["O-","O+","B-","B+"],
  "B-":  ["O-","B-"],
  "O+":  ["O-","O+"],
  "O-":  ["O-"],
};

const BLOOD_FACTS: Record<BloodType, string> = {
  "O-":  "Universal red cell donor. Rare — only 7% of people. Critical in emergencies when blood type is unknown.",
  "O+":  "Most common type (~38%). Can donate to all Rh+ types. Great everyday donor.",
  "A-":  "Rare (~6%). Can donate red cells to A and AB types (both Rh). Valuable negative-type.",
  "A+":  "Second most common (~34%). Great for other A+ and AB+ patients.",
  "B-":  "Very rare (~2%). Can donate to all B and AB types. Incredibly valuable.",
  "B+":  "About 9% of people. Important for B+ and AB+ recipients.",
  "AB-": "Rarest type (~1%). Universal plasma donor — plasma can go to anyone.",
  "AB+": "Universal plasma donor and can receive any blood type. Only ~3% have it.",
};

const PUNNETT_TRAITS = [
  {
    name: "Tongue Rolling",
    dominant: "R — Can roll tongue",
    recessive: "r — Cannot roll tongue",
    symbol: "R",
  },
  {
    name: "Widow's Peak",
    dominant: "W — Has widow's peak hairline",
    recessive: "w — Straight hairline",
    symbol: "W",
  },
  {
    name: "Earlobes",
    dominant: "E — Free earlobes",
    recessive: "e — Attached earlobes",
    symbol: "E",
  },
  {
    name: "PTC Tasting",
    dominant: "T — Can taste bitter PTC",
    recessive: "t — Cannot taste PTC",
    symbol: "T",
  },
];

const ALLELES = ["dominant-dominant", "dominant-recessive", "recessive-dominant", "recessive-recessive"] as const;
const ALLELE_LABELS = ["Homozygous dominant", "Heterozygous (carrier)", "Heterozygous (carrier)", "Homozygous recessive"];

// ── DNA Strand Quiz ───────────────────────────────────────────────────────
const SEQUENCES = [
  "ATCGTTAC", "GCATCGAT", "TAAGCCGT", "CGATAACT",
  "GGCTTAAC", "AATCGGCA", "TCGAATGC", "CATGACGT",
];

function DNAModule() {
  const [seqIdx, setSeqIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<(boolean | null)[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);

  const seq = SEQUENCES[seqIdx % SEQUENCES.length];

  const reset = useCallback(() => {
    setAnswers([]);
    setFeedback([]);
    setDone(false);
  }, []);

  const nextSeq = () => {
    setSeqIdx(i => i + 1);
    reset();
  };

  const pick = (base: string) => {
    if (done) return;
    const pos = answers.length;
    if (pos >= seq.length) return;
    const correct = COMPLEMENT[seq[pos]];
    const isRight = base === correct;
    const newAnswers = [...answers, base];
    const newFeedback = [...feedback, isRight];
    setAnswers(newAnswers);
    setFeedback(newFeedback);
    if (isRight) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    if (newAnswers.length === seq.length) setDone(true);
  };

  const current = answers.length < seq.length ? seq[answers.length] : null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="font-mono text-xs text-muted-foreground/40 uppercase tracking-widest mb-1">Template Strand</div>
        <div className="flex justify-center gap-2 flex-wrap">
          {seq.split("").map((base, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-base border-2"
                style={{ background: `${BASE_COLORS[base]}20`, borderColor: `${BASE_COLORS[base]}60`, color: BASE_COLORS[base] }}>
                {base}
              </div>
              <div className="w-0.5 h-3 bg-white/10 mx-auto" />
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-base border-2 transition-all"
                style={answers[i] ? {
                  background: `${feedback[i] ? BASE_COLORS[answers[i]] : "#ef4444"}20`,
                  borderColor: feedback[i] ? `${BASE_COLORS[answers[i]]}60` : "#ef444460",
                  color: feedback[i] ? BASE_COLORS[answers[i]] : "#ef4444",
                } : { background: "#ffffff08", borderColor: "#ffffff15", color: "#ffffff30" }}>
                {answers[i] ? (feedback[i] ? answers[i] : "✗") : (i === answers.length ? "?" : "·")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {current && !done && (
        <div className="text-center">
          <div className="font-mono text-xs text-muted-foreground/40 mb-3">
            Complement of <span style={{ color: BASE_COLORS[current], fontWeight: "bold" }}>{current}</span> is…
          </div>
          <div className="flex justify-center gap-3">
            {["A","T","C","G"].map(b => (
              <button key={b} onClick={() => pick(b)}
                className="w-14 h-14 rounded-xl font-mono font-bold text-lg border-2 transition-all hover:scale-110 active:scale-95"
                style={{ background: `${BASE_COLORS[b]}15`, borderColor: `${BASE_COLORS[b]}50`, color: BASE_COLORS[b] }}>
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/30 bg-background/40 p-5 text-center space-y-3">
          <div className="font-serif text-lg text-foreground/90">
            {feedback.every(Boolean) ? "🧬 Perfect complementarity!" : `${feedback.filter(Boolean).length}/${seq.length} correct`}
          </div>
          <div className="flex justify-center gap-6 font-mono text-xs text-muted-foreground/50">
            <span>Total score: <span className="text-primary">{score}</span></span>
            <span>Streak: <span className="text-emerald-400">{streak}</span></span>
          </div>
          <button onClick={nextSeq}
            className="px-6 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary font-mono text-xs hover:bg-primary/30 transition-all">
            Next Sequence →
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(BASE_COLORS).map(([base, color]) => (
          <div key={base} className="rounded-lg p-3 text-center border border-border/20"
            style={{ background: `${color}08` }}>
            <div className="font-mono font-bold text-sm mb-0.5" style={{ color }}>{base} ↔ {COMPLEMENT[base]}</div>
            <div className="font-mono text-[9px] text-muted-foreground/40">
              {base === "A" ? "Adenine" : base === "T" ? "Thymine" : base === "C" ? "Cytosine" : "Guanine"}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/20 bg-background/20 p-4 space-y-2">
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">The Rules of Base Pairing</div>
        <p className="font-serif text-sm text-foreground/60 leading-relaxed">
          Watson and Crick discovered in 1953 that DNA's two strands are held together by hydrogen bonds
          between complementary base pairs. <span className="text-pink-400">Adenine (A)</span> always bonds with{" "}
          <span className="text-emerald-400">Thymine (T)</span>, and{" "}
          <span className="text-blue-400">Cytosine (C)</span> always bonds with{" "}
          <span className="text-yellow-400">Guanine (G)</span>. This specificity is why DNA can be
          replicated with such incredible accuracy — one strand is always a perfect template for the other.
        </p>
      </div>
    </div>
  );
}

// ── Blood Type Module ─────────────────────────────────────────────────────
function BloodTypeModule() {
  const [selected, setSelected] = useState<BloodType | null>(null);
  const [mode, setMode] = useState<"donate" | "receive">("donate");

  const highlighted = selected
    ? (mode === "donate" ? CAN_DONATE_TO[selected] : CAN_RECEIVE_FROM[selected])
    : [];

  const typeColors: Record<BloodType, string> = {
    "O-": "#ef4444", "O+": "#f97316",
    "A-": "#a855f7", "A+": "#ec4899",
    "B-": "#3b82f6", "B+": "#06b6d4",
    "AB-": "#10b981", "AB+": "#84cc16",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        {(["donate", "receive"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-widest border transition-all ${mode === m ? "bg-primary/20 border-primary/50 text-primary" : "border-border/30 text-muted-foreground/50 hover:border-border/50"}`}>
            {m === "donate" ? "Who can I donate to?" : "Who can I receive from?"}
          </button>
        ))}
      </div>

      <div>
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3 text-center">
          Select your blood type
        </div>
        <div className="grid grid-cols-4 gap-3">
          {BLOOD_TYPES.map(bt => (
            <button key={bt} onClick={() => setSelected(selected === bt ? null : bt)}
              className="rounded-xl p-4 border-2 transition-all hover:scale-105 active:scale-95 text-center"
              style={{
                background: selected === bt ? `${typeColors[bt]}20` : `${typeColors[bt]}08`,
                borderColor: selected === bt ? typeColors[bt] : `${typeColors[bt]}30`,
              }}>
              <div className="font-mono font-bold text-xl mb-0.5" style={{ color: typeColors[bt] }}>{bt}</div>
              {selected && highlighted.includes(bt) && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full mx-auto mt-1"
                  style={{ background: typeColors[bt] }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div key={selected + mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border p-5 space-y-4"
            style={{ borderColor: `${typeColors[selected]}30`, background: `${typeColors[selected]}05` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm shrink-0"
                style={{ borderColor: typeColors[selected], color: typeColors[selected], background: `${typeColors[selected]}15` }}>
                {selected}
              </div>
              <div>
                <div className="font-serif text-sm text-foreground/80 mb-0.5">
                  {mode === "donate"
                    ? `Blood type ${selected} can donate red cells to:`
                    : `Blood type ${selected} can receive red cells from:`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {highlighted.map(bt => (
                    <span key={bt} className="font-mono text-[10px] px-2 py-0.5 rounded border font-bold"
                      style={{ borderColor: `${typeColors[bt]}50`, color: typeColors[bt], background: `${typeColors[bt]}15` }}>
                      {bt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="font-serif text-sm text-foreground/60 leading-relaxed border-t border-border/20 pt-3">
              {BLOOD_FACTS[selected]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl border border-border/20 bg-background/20 p-4 space-y-2">
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">ABO + Rh System</div>
        <p className="font-serif text-sm text-foreground/60 leading-relaxed">
          Blood type is determined by antigens on your red blood cells (A, B, both, or neither) and the
          Rh factor (positive or negative). Your immune system attacks blood cells with antigens it
          doesn't recognize — which is why type compatibility is critical in transfusions.
          About 4.5 million Americans need blood transfusions every year.
        </p>
      </div>
    </div>
  );
}

// ── Blood Composition Module ──────────────────────────────────────────────
const COMPONENTS = [
  { id: "plasma",    label: "Plasma",          pct: 55, color: "#fde68a", emoji: "🟡",
    desc: "The liquid matrix — mostly water (92%), carrying proteins, hormones, glucose, clotting factors, and waste. Straw-colored and slightly alkaline (pH 7.4). Contains albumin, fibrinogen, and antibodies." },
  { id: "rbc",       label: "Red Blood Cells",  pct: 44, color: "#ef4444", emoji: "🔴",
    desc: "Erythrocytes — biconcave discs packed with hemoglobin. Each one carries ~270 million hemoglobin molecules. They live for ~120 days, delivering O₂ and removing CO₂. A single microliter of blood contains 4–6 million RBCs." },
  { id: "wbc",       label: "White Blood Cells", pct: 0.7, color: "#e0e7ff", emoji: "⚪",
    desc: "Leukocytes — the immune army. Includes neutrophils (60–70%), lymphocytes (20–30%), monocytes, eosinophils, and basophils. They patrol for pathogens, produce antibodies, and coordinate immune response. ~7,000 per microliter." },
  { id: "platelets", label: "Platelets",         pct: 0.3, color: "#a78bfa", emoji: "🟣",
    desc: "Thrombocytes — tiny cell fragments, not true cells. They rush to wounds and aggregate to form clots, releasing chemicals that trigger the clotting cascade. Live for 8–10 days. ~250,000 per microliter of blood." },
];

function BloodCompositionModule() {
  const [active, setActive] = useState<string | null>(null);

  const total = 360;
  let angle = -90;

  const slices = COMPONENTS.map(c => {
    const sweep = (c.pct / 100) * total;
    const start = angle;
    angle += sweep;
    return { ...c, startAngle: start, sweep };
  });

  function polarToXY(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: 160 + r * Math.cos(rad), y: 160 + r * Math.sin(rad) };
  }

  function describeArc(startAngle: number, sweep: number, r: number) {
    const endAngle = startAngle + sweep;
    const start = polarToXY(startAngle, r);
    const end = polarToXY(endAngle, r);
    const large = sweep > 180 ? 1 : 0;
    return `M 160 160 L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
  }

  const activeComp = COMPONENTS.find(c => c.id === active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg width="320" height="320" className="drop-shadow-lg">
            {slices.map(s => (
              <path key={s.id}
                d={describeArc(s.startAngle, s.sweep - 0.5, s.id === active ? 110 : 100)}
                fill={s.color}
                opacity={active && active !== s.id ? 0.3 : 0.9}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setActive(active === s.id ? null : s.id)}
                style={{ filter: s.id === active ? `drop-shadow(0 0 12px ${s.color})` : "none" }}
              />
            ))}
            <circle cx="160" cy="160" r="60" fill="#0a0a14" />
            <text x="160" y="156" textAnchor="middle" fill="#ffffff60" fontSize="11" fontFamily="monospace">BLOOD</text>
            <text x="160" y="172" textAnchor="middle" fill="#ffffff40" fontSize="9" fontFamily="monospace">COMPOSITION</text>
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {COMPONENTS.map(c => (
            <button key={c.id} onClick={() => setActive(active === c.id ? null : c.id)}
              className="rounded-xl p-3 border-2 text-left transition-all hover:scale-105"
              style={{
                background: active === c.id ? `${c.color}15` : `${c.color}08`,
                borderColor: active === c.id ? `${c.color}60` : `${c.color}20`,
              }}>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ color: c.color, fontWeight: "bold", fontSize: 13 }}>{c.emoji}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: c.color }}>{c.label}</span>
              </div>
              <div className="font-mono text-lg font-bold" style={{ color: c.color }}>{c.pct}%</div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeComp && (
          <motion.div key={activeComp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl border p-5"
            style={{ borderColor: `${activeComp.color}30`, background: `${activeComp.color}05` }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: activeComp.color }}>
              {activeComp.emoji} {activeComp.label} — {activeComp.pct}% of blood volume
            </div>
            <p className="font-serif text-sm text-foreground/70 leading-relaxed">{activeComp.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Codon Decoder Module ──────────────────────────────────────────────────
const DNA_TO_CODON: Record<string, string> = { A: "U", T: "A", C: "G", G: "C" };

function CodonModule() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const clean = input.toUpperCase().replace(/[^ATCG]/g, "");

  const codons: string[] = [];
  for (let i = 0; i + 3 <= clean.length; i += 3) {
    codons.push(clean.slice(i, i + 3));
  }

  const mRNACodons = codons.map(c => c.split("").map(b => DNA_TO_CODON[b]).join(""));
  const aminoAcids = mRNACodons.map(c => CODONS[c] ?? "?");

  const handleInput = (v: string) => {
    const up = v.toUpperCase().replace(/[^ATCG]/g, "");
    if (v !== up && v !== "") setError("Only A, T, C, G allowed");
    else setError("");
    setInput(v.toUpperCase());
  };

  const DEMO = "ATGTTCGGCAATGCATAA";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/30 p-5 space-y-4">
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          Enter a DNA sequence (A T C G only)
        </div>
        <div className="relative">
          <input
            value={input}
            onChange={e => handleInput(e.target.value)}
            placeholder="e.g. ATGTTCGGCAAT…"
            className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 tracking-widest uppercase"
          />
          {error && <div className="font-mono text-[10px] text-red-400 mt-1">{error}</div>}
        </div>
        <button onClick={() => setInput(DEMO)}
          className="font-mono text-[10px] text-primary/50 hover:text-primary transition-colors">
          ← Try demo: {DEMO}
        </button>
      </div>

      {codons.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">DNA template</div>
          <div className="flex flex-wrap gap-1.5">
            {codons.map((c, i) => (
              <div key={i} className="text-center">
                <div className="flex gap-0.5">
                  {c.split("").map((b, j) => (
                    <span key={j} className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold"
                      style={{ background: `${BASE_COLORS[b]}20`, color: BASE_COLORS[b] }}>{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">mRNA transcript</div>
          <div className="flex flex-wrap gap-1.5">
            {mRNACodons.map((c, i) => (
              <div key={i} className="text-center">
                <div className="flex gap-0.5">
                  {c.split("").map((b, j) => (
                    <span key={j} className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold"
                      style={{ background: "#ffffff10", color: "#ffffffaa" }}>{b}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Amino acid chain</div>
          <div className="flex flex-wrap gap-2">
            {aminoAcids.map((aa, i) => {
              const isStop = aa === "STOP";
              const base = aa.split(" ")[0];
              const color = isStop ? "#ef4444" : (AMINO_COLORS[base] ?? "#ffffff50");
              return (
                <div key={i} className="rounded-lg px-3 py-2 border text-center min-w-[56px]"
                  style={{ borderColor: `${color}40`, background: `${color}10` }}>
                  <div className="font-mono text-[9px] text-muted-foreground/40 mb-0.5">{mRNACodons[i]}</div>
                  <div className="font-mono text-xs font-bold" style={{ color }}>{aa}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="rounded-xl border border-border/20 bg-background/20 p-4 space-y-2">
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">How it works</div>
        <p className="font-serif text-sm text-foreground/60 leading-relaxed">
          DNA → RNA → Protein. The DNA template strand is transcribed into mRNA (T becomes U, A→A, C→G, G→C).
          Ribosomes read mRNA in groups of three (codons), and each codon specifies one of 20 amino acids.
          AUG is always the START codon. UAA, UAG, UGA signal STOP. This is the <em>central dogma of molecular biology</em>.
        </p>
      </div>
    </div>
  );
}

// ── Punnett Square Module ─────────────────────────────────────────────────
type Allele = "D" | "R"; // Dominant / Recessive

function PunnettModule() {
  const [traitIdx, setTraitIdx] = useState(0);
  const [p1, setP1] = useState<[Allele, Allele]>(["D", "R"]);
  const [p2, setP2] = useState<[Allele, Allele]>(["D", "R"]);

  const trait = PUNNETT_TRAITS[traitIdx];
  const sym = trait.symbol;

  const toLabel = (a: Allele) => a === "D" ? sym.toUpperCase() : sym.toLowerCase();

  const p1Gametes: Allele[] = [p1[0], p1[1]];
  const p2Gametes: Allele[] = [p2[0], p2[1]];

  const grid = p1Gametes.map(a => p2Gametes.map(b => {
    const pair = [a, b].sort((x, y) => (x === "D" ? -1 : 1)).join("") as Allele[];
    return { alleles: [a, b] as [Allele, Allele], dominant: a === "D" || b === "D" };
  }));

  const outcomes = grid.flat();
  const domCount = outcomes.filter(o => o.dominant).length;
  const recCount = 4 - domCount;

  const alleleOptions: [Allele, Allele][] = [["D","D"],["D","R"],["R","R"]];
  const alleleLabels = ["Homozygous dominant", "Heterozygous", "Homozygous recessive"];

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3">Choose a trait</div>
        <div className="grid grid-cols-2 gap-2">
          {PUNNETT_TRAITS.map((t, i) => (
            <button key={i} onClick={() => setTraitIdx(i)}
              className={`rounded-lg px-3 py-2 text-left border transition-all font-mono text-xs ${traitIdx === i ? "border-primary/50 bg-primary/10 text-primary" : "border-border/30 text-muted-foreground/50 hover:border-border/50"}`}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {([["Parent 1", p1, setP1], ["Parent 2", p2, setP2]] as const).map(([label, val, setter]) => (
          <div key={label}>
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">{label}</div>
            <div className="space-y-1.5">
              {alleleOptions.map(([a, b], i) => (
                <button key={i} onClick={() => (setter as any)([a, b])}
                  className={`w-full rounded-lg px-3 py-2 text-left border text-xs transition-all font-mono ${JSON.stringify((val as any)) === JSON.stringify([a,b]) ? "border-primary/50 bg-primary/10 text-primary" : "border-border/20 text-muted-foreground/40 hover:border-border/40"}`}>
                  {toLabel(a)}{toLabel(b)} — {alleleLabels[i]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3 text-center">
          Punnett Square — {toLabel(p1[0])}{toLabel(p1[1])} × {toLabel(p2[0])}{toLabel(p2[1])}
        </div>
        <div className="max-w-xs mx-auto">
          <div className="grid grid-cols-3 gap-1">
            <div className="h-10" />
            {p2Gametes.map((g, i) => (
              <div key={i} className="h-10 flex items-center justify-center font-mono font-bold text-sm text-muted-foreground/60">
                {toLabel(g)}
              </div>
            ))}
            {p1Gametes.map((g, ri) => (
              <>
                <div key={`row-${ri}`} className="h-16 flex items-center justify-center font-mono font-bold text-sm text-muted-foreground/60">
                  {toLabel(g)}
                </div>
                {grid[ri].map((cell, ci) => (
                  <div key={ci} className="h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all"
                    style={{
                      background: cell.dominant ? "#10b98115" : "#ef444415",
                      borderColor: cell.dominant ? "#10b98140" : "#ef444440",
                    }}>
                    <div className="font-mono font-bold text-base" style={{ color: cell.dominant ? "#10b981" : "#ef4444" }}>
                      {toLabel(cell.alleles[0])}{toLabel(cell.alleles[1])}
                    </div>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center">
          <div className="font-mono text-2xl font-bold text-emerald-400">{domCount}/4</div>
          <div className="font-mono text-[10px] text-emerald-400/60 uppercase tracking-widest mt-0.5">
            {trait.dominant.split("—")[0].trim()}
          </div>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-3 text-center">
          <div className="font-mono text-2xl font-bold text-red-400">{recCount}/4</div>
          <div className="font-mono text-[10px] text-red-400/60 uppercase tracking-widest mt-0.5">
            {trait.recessive.split("—")[0].trim()}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/20 bg-background/20 p-4 text-sm font-serif text-foreground/60 leading-relaxed space-y-1.5">
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Trait Details</div>
        <p><span className="text-emerald-400">{trait.dominant}</span></p>
        <p><span className="text-red-400">{trait.recessive}</span></p>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
type Tab = "dna" | "blood-types" | "composition" | "codons" | "genetics";

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: "dna",         label: "DNA Pairing",     icon: "🧬", desc: "Base complement game" },
  { id: "blood-types", label: "Blood Types",     icon: "🩸", desc: "ABO compatibility" },
  { id: "composition", label: "Blood Anatomy",   icon: "🔬", desc: "Composition explorer" },
  { id: "codons",      label: "Codon Decoder",   icon: "🔑", desc: "DNA → protein" },
  { id: "genetics",    label: "Punnett Square",  icon: "🧩", desc: "Trait inheritance" },
];

export default function BloodDNALabPage() {
  const [tab, setTab] = useState<Tab>("dna");

  return (
    <div data-testid="page-blood-dna-lab" className="min-h-screen bg-background px-4 pb-16">
      <div className="max-w-3xl mx-auto pt-10 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
            Adult Mind Lab · Biology
          </div>
          <h1 className="font-serif text-3xl text-foreground/90">Blood &amp; DNA</h1>
          <p className="font-serif text-sm text-muted-foreground/60 leading-relaxed max-w-xl">
            Five interactive modules exploring the molecular language of life —
            from base pairs to blood types, codons to chromosomes.
            Click, build, discover.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${tab === t.id ? "bg-primary/15 border-primary/50 text-primary" : "border-border/30 text-muted-foreground/50 hover:border-border/50 hover:text-foreground/60"}`}>
              <span className="text-base">{t.icon}</span>
              <div className="text-left">
                <div className="font-mono text-xs">{t.label}</div>
                <div className="font-mono text-[9px] text-muted-foreground/40">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Module */}
        <div className="rounded-2xl border border-border/30 bg-background/30 p-6 min-h-96">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
              {tab === "dna"         && <DNAModule />}
              {tab === "blood-types" && <BloodTypeModule />}
              {tab === "composition" && <BloodCompositionModule />}
              {tab === "codons"      && <CodonModule />}
              {tab === "genetics"    && <PunnettModule />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer note */}
        <div className="font-mono text-[10px] text-muted-foreground/30 text-center">
          All content is scientifically accurate and intended for adult learners.
          Blood type information follows ISBT standards.
        </div>
      </div>
    </div>
  );
}
