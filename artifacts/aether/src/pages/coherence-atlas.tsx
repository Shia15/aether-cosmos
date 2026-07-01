import { Link } from "wouter";

/* ── knot topology ─────────────────────────────────────── */
import kTrefoil from "@assets/Gemini_Generated_Image_bp8s3tbp8s3tbp8s_1782919933853.png";
import kFigureEight from "@assets/ChatGPT_Image_Jun_29,_2026,_07_31_16_AM_1782919933841.png";
import kCinquefoil from "@assets/ChatGPT_Image_Jun_29,_2026,_07_06_40_AM_1782919933853.png";
import kStevedore from "@assets/ChatGPT_Image_Jun_28,_2026,_02_36_39_PM_1782919933851.png";
import kStevedoreSim from "@assets/ChatGPT_Image_Jun_28,_2026,_08_58_11_PM_1782919933852.png";

/* ── bio-photonic emitters ─────────────────────────────── */
import ePhiOvertone from "@assets/ChatGPT_Image_Jun_30,_2026,_11_10_19_AM_1782920506186.png";
import eCarmineIR from "@assets/ChatGPT_Image_Jun_30,_2026,_11_13_30_AM_1782920506187.png";
import ePhantomIR from "@assets/ChatGPT_Image_Jun_30,_2026,_11_33_02_AM_1782920506188.png";
import eCoralSWIR from "@assets/f2d30afa-9b9d-4fff-bc30-52d2d2799891_1782920506190.png";
import eCoherenceNode from "@assets/ChatGPT_Image_Jun_28,_2026,_02_14_27_PM_1782919933849.png";
import eSubstrateDark from "@assets/ChatGPT_Image_Jun_28,_2026,_02_17_55_PM_1782919933849.png";
import eCerulean from "@assets/ChatGPT_Image_Jun_28,_2026,_02_19_47_PM_1782919933850.png";
import eBodyPhoton from "@assets/image_(31)_1782920506189.jpg";

/* ── tunnel transport ──────────────────────────────────── */
import tAirNanotube from "@assets/ChatGPT_Image_Jun_28,_2026,_01_03_43_PM_1782919933847.png";
import tLivingAir from "@assets/ChatGPT_Image_Jun_28,_2026,_01_06_29_PM_1782919933847.png";
import tSpectrumTunnel from "@assets/ChatGPT_Image_Jun_28,_2026,_01_10_58_PM_1782919933848.png";

/* ── coherence field ───────────────────────────────────── */
import cWoodFrog from "@assets/ChatGPT_Image_Jun_28,_2026,_02_38_24_PM_1782919933851.png";
import cLightMedia from "@assets/ChatGPT_Image_Jun_28,_2026,_02_44_54_PM_1782919933852.png";

/* ── regulation & cosmos ───────────────────────────────── */
import rNcRNA from "@assets/Gemini_Generated_Image_73me5d73me5d73me_1782919987489.png";
import rQuarks from "@assets/Gemini_Generated_Image_rq3dtzrq3dtzrq3d_(1)_1782919987489.png";
import rMeristem from "@assets/Gemini_Generated_Image_jb7g0ajb7g0ajb7g_1782919987490.png";
import rRootHair from "@assets/Gemini_Generated_Image_sjnv2isjnv2isjnv_1782919987490.png";

const V = {
  bg: "#05060C", aurora: "#00FFB2", gold: "#C8A030", blue: "#4488FF",
  vio: "#9966FF", amb: "#FF9933", rose: "#FF6699", plasma: "#FF4477",
  green: "#44CC77", dim: "#3A5060", ink: "#B8CCE8", fire: "#FF6622",
};
const MONO = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP = "'Cinzel',serif";

type Item = { src: string; t: string; d: string };
type Link2 = { href: string; label: string };
type Cluster = { n: string; title: string; col: string; blurb: string; related: Link2[]; items: Item[] };

const CLUSTERS: Cluster[] = [
  {
    n: "01", title: "KNOT TOPOLOGY", col: V.rose,
    blurb: "The crossing number is the gate. From the trefoil up to the Stevedore, each knot fixes a coherence field over its projection -- proven invariants deciding which crystallisation pathways stay open.",
    related: [{ href: "/nutritional-dna-key", label: "Nutritional Rainbow DNA Key" }],
    items: [
      { src: kTrefoil, t: "Trefoil 3_1", d: "The simplest non-trivial knot -- three crossings, three phase singularities -- modelling collagen helix topology." },
      { src: kFigureEight, t: "Figure-Eight 4_1", d: "The amphichiral 4_1 knot in DNA supercoiling and RNA pseudoknots; coherence climbs to 0.84." },
      { src: kCinquefoil, t: "Cinquefoil 5_1", d: "Torus knot T(2,5), winding number 2 -- pentagonal symmetry of viral capsids and guanine arrays." },
      { src: kStevedore, t: "Stevedore 6_1", d: "The topology gate: Alexander and Jones polynomials, determinant 9, hyperbolic volume 3.16." },
      { src: kStevedoreSim, t: "Stevedore Field Sim", d: "Live coherence field over the 6_1 knot -- mean amplitude, phase singularities and hex-cell mesh." },
    ],
  },
  {
    n: "02", title: "BIO-PHOTONIC EMITTERS", col: V.plasma,
    blurb: "Coherence-gated luciferase channels, one per emission window. The living wall reports its own field state as light -- from visible sea-milk to telecom-band SWIR.",
    related: [{ href: "/soi-building", label: "SOI Building -- Emitters" }],
    items: [
      { src: ePhiOvertone, t: "Phi-Squared Overtone 1377nm", d: "phi-squared-Luc tuned to a torsion-helix to toroid harmonic -- the golden ratio folded into emission." },
      { src: eCarmineIR, t: "Carmine-IR 690nm", d: "BphS1-NLuc bacteriophytochrome on biliverdin -- longest-lived channel, imaging through the photosynthesis zone." },
      { src: ePhantomIR, t: "Phantom-IR 760nm", d: "OplIR luciferase with a furimazine-IR analog -- clean phantom imaging that clears GFP/RFP/BFP background." },
      { src: eCoralSWIR, t: "CoralLuc-SWIR 1550nm", d: "Coral-luciferase hybrid rendered as living reef -- injects bio-signal into telecom C-band fibre." },
      { src: eCoherenceNode, t: "Coherence-Node 940nm", d: "Synthetic photoprobe whose yield spikes when C(x,t) crosses phi-inverse -- the tissue glows at equilibrium." },
      { src: eSubstrateDark, t: "Substrate-Dark 1550nm", d: "Deep-SWIR coral-luciferase hybrid at the telecom C-band -- signal injected straight into photonic fibre." },
      { src: eCerulean, t: "Cerulean 476nm", d: "Symbiodinium dinoflagellate -- the original AETHER sea-milk emitter and brightest channel." },
      { src: eBodyPhoton, t: "Human Body Photon Emission", d: "Skin radiates as a blackbody: P = pi A T^4, about 41.1x10^21 photons per second -- the living baseline." },
    ],
  },
  {
    n: "03", title: "TUNNEL TRANSPORT", col: V.blue,
    blurb: "Air-pressure propulsion made habitable. Pressurize, launch and glide through a living resonant tube where water becomes a dimensional interface.",
    related: [
      { href: "/air-nanotube", label: "Air Nanotube Transport" },
      { href: "/resonant-tunnel", label: "Living Resonant Tunnel" },
    ],
    items: [
      { src: tAirNanotube, t: "Air Nanotube System", d: "Pressurize / launch / glide with linear, branched, mesh and vertical-stack tube topologies and airlock nodes." },
      { src: tLivingAir, t: "Living Resonant Air Nanotube", d: "Biophilic habitat modules blended with air-pressure propulsion and bio-mechanistic mini-robots." },
      { src: tSpectrumTunnel, t: "Living Resonant Spectrum Tunnel", d: "Water as dimensional interface: sense, interpret, harmonize, adapt -- vortex rings and field emitters." },
    ],
  },
  {
    n: "04", title: "COHERENCE FIELD", col: V.aurora,
    blurb: "One field carried through every medium. The amplitude A(x) survives freezing skin and splits at each optical boundary -- always summing to one.",
    related: [{ href: "/electron-field", label: "Unbreakable Electron Field" }],
    items: [
      { src: cWoodFrog, t: "Wood Frog Skin Field", d: "Guanine nanocrystals in a Bouligand helix form a gyroid skin whose field collapses as 70% of its water freezes." },
      { src: cLightMedia, t: "Light Across Media", d: "T + R + A = 1 for silica, skin, chlorophyll, aluminium, retina and water -- the law each medium uses to split light." },
    ],
  },
  {
    n: "05", title: "REGULATION & COSMOS", col: V.gold,
    blurb: "The same coherence logic read at two scales -- regulatory dark matter in the genome and colour charge in the quark sea, with living roots as the bridge.",
    related: [
      { href: "/regulatory-depth", label: "Regulatory Depth" },
      { href: "/circular-farm", label: "Circular AI Farm" },
    ],
    items: [
      { src: rNcRNA, t: "Regulatory Dark Matter ncRNA", d: "98% non-coding: miRNA, lncRNA, alternative splicing and the epigenome as writable memory." },
      { src: rQuarks, t: "Quarks: Colour Charge", d: "Six flavours, colour confinement, asymptotic freedom -- colour neutrality read as coherence." },
      { src: rMeristem, t: "Root Apical Meristem", d: "Quiescent centre and zonation with auxin/cytokinin gradients driving tip elongation." },
      { src: rRootHair, t: "Root Hair Uptake", d: "Up to 70x surface-area gain with a tip Ca2+ gradient and apoplastic vs symplastic uptake." },
    ],
  },
];

function SectionHead({ n, title, col }: { n: string; title: string; col: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
      <div style={{ fontFamily: DISP, fontSize: "1.1rem", color: col, letterSpacing: "0.18em" }}>{n}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${col}55,transparent)` }} />
      <div style={{ fontFamily: MONO, fontSize: 9, color: col, letterSpacing: "0.16em" }}>{title}</div>
    </div>
  );
}

export default function CoherenceAtlas() {
  const total = CLUSTERS.reduce((s, c) => s + c.items.length, 0);
  return (
    <div style={{ background: V.bg, minHeight: "100vh", padding: "32px 24px 60px",
      color: V.ink, maxWidth: 1180, margin: "0 auto" }}>

      {/* Masthead */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, color: V.aurora, letterSpacing: "0.3em", marginBottom: 10 }}>
          AETHER -- UNIFIED VISUAL INDEX
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "2.4rem", margin: 0, letterSpacing: "0.06em",
          background: `linear-gradient(90deg,${V.rose},${V.gold},${V.aurora},${V.blue})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          COHERENCE ATLAS
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1rem", color: "rgba(184,204,232,0.72)",
          lineHeight: 1.55, marginTop: 14, maxWidth: 780 }}>
          Every recent thread, gathered in one place. {total} infographics across five clusters --
          knot topology, bio-photonic emitters, tunnel transport, the coherence field, and the
          bridge between genomic regulation and the quark sea. Each plate links back to the page
          where its mechanism is worked out in full. Click any image to open it full-size.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {CLUSTERS.map((c) => (
            <span key={c.n} style={{ fontFamily: MONO, fontSize: 8, color: c.col,
              letterSpacing: "0.1em", border: `1px solid ${c.col}44`, borderRadius: 4,
              padding: "4px 9px", background: `${c.col}0C` }}>
              {c.title} -- {c.items.length}
            </span>
          ))}
        </div>
      </div>

      {/* Clusters */}
      {CLUSTERS.map((c) => (
        <div key={c.n} style={{ marginBottom: 40 }}>
          <SectionHead n={c.n} title={c.title} col={c.col} />
          <div style={{ fontFamily: SERIF, fontSize: "0.9rem", color: "rgba(184,204,232,0.68)",
            lineHeight: 1.55, marginBottom: 12, maxWidth: 780 }}>
            {c.blurb}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {c.related.map((r) => (
              <Link key={r.href} href={r.href} style={{ textDecoration: "none" }}>
                <span style={{ fontFamily: MONO, fontSize: 8, color: c.col, letterSpacing: "0.1em",
                  border: `1px solid ${c.col}55`, borderRadius: 4, padding: "5px 10px",
                  background: `${c.col}10`, display: "inline-block" }}>
                  READ -&gt; {r.label}
                </span>
              </Link>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {c.items.map((it) => (
              <figure key={it.t} style={{ margin: 0, borderRadius: 8, overflow: "hidden",
                border: `1px solid ${c.col}30`, background: `${c.col}07` }}>
                <a href={it.src} target="_blank" rel="noopener noreferrer" style={{ display: "block", lineHeight: 0 }}>
                  <img src={it.src} alt={it.t} loading="lazy" style={{ width: "100%", display: "block" }} />
                </a>
                <figcaption style={{ padding: "11px 13px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, color: c.col, letterSpacing: "0.12em", marginBottom: 5 }}>
                    {it.t.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.64)", lineHeight: 1.42 }}>
                    {it.d}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${V.dim}44`, paddingTop: 24, display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Link href="/" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- GRAPH MAP -- BACK TO AETHER
        </Link>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Coherence Atlas -- {total} plates -- five clusters</div>
          <div>One field, read many ways -- the net is there</div>
        </div>
      </div>
    </div>
  );
}
