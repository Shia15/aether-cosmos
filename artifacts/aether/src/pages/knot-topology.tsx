import imgTaitPlate from "@assets/HGxT-BZXEAA4c3U_1777222187177.jpeg";

const B = {
  bg: "#f4ecdc", panel: "#fbf6ea", ink: "#2a2218",
  text: "rgba(42,34,24,0.78)", muted: "rgba(42,34,24,0.5)",
  border: "rgba(120,90,50,0.22)",
  brown: "#5a3e1f", amber: "#a87a32", olive: "#6b6f3a", terracotta: "#c2674a",
};

const FACTS = [
  { label: "Crossing number", value: "10",
    note: "The plate enumerates knots whose minimum number of crossings in any planar diagram is exactly ten. Tait's labels (the small numbers and Greek letters) are the historical naming scheme that predates the modern Rolfsen / Hoste-Thistlethwaite tables." },
  { label: "Total knots", value: "165 prime knots at 10 crossings",
    note: "The full enumeration was completed in the late 19th century by Tait, Little, and Kirkman; the count of 165 prime 10-crossing knots is now the textbook number, though the original tables contained the famous Perko pair duplicate, corrected only in 1974." },
  { label: "Method", value: "Hand-drawn alternating-knot enumeration",
    note: "Tait worked with alternating projections and used what is now called the Tait conjectures (proved in the 1980s using the Jones polynomial) to detect equivalent diagrams." },
  { label: "Modern descendants", value: "Knot polynomials · Khovanov homology · CGLE defect knots",
    note: "Modern knot theory replaces the visual table with algebraic invariants — Alexander, Jones, HOMFLY, Khovanov. AETHER's interest is the use of knot invariants to label persistent topological structures in field equations like the Complex Ginzburg–Landau lattice." },
];

const AETHER_HOOKS = [
  { title: "Defect lines in the CGLE lattice",
    body: "When the Complex Ginzburg–Landau equation supports stable phase-singularity lines that close on themselves, the resulting curves carry knot invariants. The Tait plate is, in spirit, a vocabulary table for those structures." },
  { title: "Vortex knots in fluids",
    body: "Knotted vortex tubes have been produced in real water-tank experiments (Kleckner & Irvine, Nature Physics 2013). The trefoil and the simpler 10-crossing knots in the plate become physical objects in those experiments." },
  { title: "Field-line topology in plasmas",
    body: "Magnetic-field-line knottedness controls magnetic helicity, a conserved quantity in ideal MHD. The Tait taxonomy is one way to label which configurations a plasma can hold." },
];

export default function KnotTopologyView() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes kt-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.kt-fade{animation:kt-fade .55s ease-out both}@media(prefers-reduced-motion:reduce){.kt-fade{animation:none}}`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">
        <header className="kt-fade space-y-3" data-testid="kt-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.terracotta }}>
            Topology · Tait's Tenfold Knottiness · Modern Descendants
          </div>
          <h1 className="text-[32px] leading-tight" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>
            The shapes a string can hold.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Plate IX from Peter Guthrie Tait's 1880s knot atlas: every prime knot at ten crossings, drawn by
            hand. AETHER's interest is not antiquarian — it is that the same enumeration shows up today as the
            label set for closed defect lines in the Complex Ginzburg–Landau lattice, knotted vortex tubes in
            water, and the topology of magnetic field lines in plasmas.
          </p>
        </header>

        <section className="kt-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="kt-section-plate">
          <SectionHead num="01" label="The plate · Tenfold Knottiness, Plate IX." accent={B.amber} />
          <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${B.border}`, background: "#fff" }}>
            <img src={imgTaitPlate} loading="lazy" decoding="async" className="block w-full h-auto"
                 alt="Plate IX from Peter Guthrie Tait's knot atlas, titled TENFOLD KNOTTINESS. A dense grid of small hand-drawn knot diagrams numbered 47 through 123, each labelled with letter prefixes (B, C, D, H, K, L, M, R, S, V, W, etc.) and Greek letter suffixes, all rendered as black-line over-and-under crossings on cream paper. A colophon at lower left reads 'P. Tait del.' and a note at lower right reads 'To follow Plate VIII'." />
            <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                        style={{ color: B.muted, background: B.panel }}>
              Tait, Plate IX · Tenfold Knottiness · 10-crossing prime knot enumeration
            </figcaption>
          </figure>
        </section>

        <section className="kt-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="kt-section-facts">
          <SectionHead num="02" label="What the plate actually is." accent={B.olive} />
          <div className="grid gap-3 md:grid-cols-2">
            {FACTS.map(f => (
              <article key={f.label} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: B.terracotta }}>{f.label}</div>
                <div className="text-[18px] mt-1" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{f.value}</div>
                <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: B.text }}>{f.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="kt-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="kt-section-aether">
          <SectionHead num="03" label="Where the table reappears in AETHER." accent={B.terracotta} />
          <div className="grid gap-3 md:grid-cols-3">
            {AETHER_HOOKS.map(a => (
              <article key={a.title} className="rounded-md p-4" style={{ background: B.panel, border: `1px solid ${B.border}` }}>
                <h3 className="text-[14px]" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{a.title}</h3>
                <p className="text-[12px] leading-relaxed mt-2" style={{ color: B.text }}>{a.body}</p>
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
      <h2 className="text-[22px] mt-1" style={{ color: B.brown, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}
