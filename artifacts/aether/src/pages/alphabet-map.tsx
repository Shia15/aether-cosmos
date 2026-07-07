import { useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG   = "#020c18";
const GOLD = "#f2c354";
const CYAN = "#38bdf8";
const GREEN= "#4ade80";
const ROSE = "#f87171";
const VIO  = "#c084fc";
const AMB  = "#fb923c";
const TEAL = "#2dd4bf";
const MUT  = "#94a3b8";
const WHT  = "#e2e8f0";
const BRD  = "rgba(242,195,84,0.14)";
const MONO = "'DM Mono',monospace";
const SERIF= "'Georgia',serif";

// ── Type ──────────────────────────────────────────────────────────────────────
interface IPA   { p: string; ex: string }
interface Form  { s: string; n: string }
interface Cross { s: string; n: string; l: string }
interface Sym   { s: string; m: string }

interface LetterDNA {
  upper:      string;
  lower:      string;
  ascii:      number;
  numerology: number;
  origin:     string;
  math:       Form[];
  crossScript:Cross[];
  diacritics: string[];
  symbols:    Sym[];
  ipa:        IPA[];
}

// ── Data ──────────────────────────────────────────────────────────────────────
const DNA: Record<string, LetterDNA> = {
  A: { upper:"A", lower:"a", ascii:65, numerology:1,
    origin:"Phoenician Aleph 𐤀 (ox head) → Greek Alpha Α → Latin A. The first, the breath, the beginning — every alphabet on Earth traces to this ancient ox.",
    math:[ {s:"𝐀",n:"Bold"},{s:"𝐴",n:"Italic"},{s:"𝑨",n:"Bold Italic"},{s:"𝒜",n:"Script"},{s:"𝔄",n:"Fraktur"},{s:"𝔸",n:"Double-Struck"},{s:"𝖠",n:"Sans-Serif"},{s:"𝙰",n:"Monospace"} ],
    crossScript:[ {s:"Α",n:"Greek Alpha — same origin, same sound",l:"Greek"},{s:"А",n:"Cyrillic A — identical form and sound",l:"Russian"},{s:"א",n:"Aleph — silent ox-head, 1st Hebrew letter",l:"Hebrew"},{s:"∀",n:"For All — universal quantifier ∀x; rotated A",l:"Math"},{s:"∧",n:"Logical AND — wedge shape of A without crossbar",l:"Math"},{s:"Λ",n:"Lambda — inverted V; no crossbar",l:"Greek"} ],
    diacritics:["Á","À","Â","Ä","Ã","Å","Ā","Ă","Ą","Ǎ","Ȁ","Ȃ","Ḁ","Ạ","Ả","Ấ","Ầ","Ẩ","Ẫ","Ậ","Ắ","Ặ"],
    symbols:[ {s:"@",m:"At sign — scribal shorthand for Latin 'ad' (at/to)"},{s:"æ",m:"Ash ligature a+e — Old English and Scandinavian"},{s:"Å",m:"Angstrom Å = 10⁻¹⁰ m — Swedish A with ring"},{s:"α",m:"Greek alpha — fine-structure constant α≈1/137"},{s:"ɑ",m:"IPA script-a — open back unrounded vowel"} ],
    ipa:[ {p:"/æ/",ex:"c·a·t (short A)"},{p:"/eɪ/",ex:"m·a·ke (name A)"},{p:"/ɑ/",ex:"f·a·ther (broad A)"},{p:"/ə/",ex:"·a·bout (schwa)"} ] },

  B: { upper:"B", lower:"b", ascii:66, numerology:2,
    origin:"Phoenician Beth 𐤁 (house) → Greek Beta Β → Latin B. The house, the enclosure — two rooms stacked, two humps.",
    math:[ {s:"𝐁",n:"Bold"},{s:"𝐵",n:"Italic"},{s:"𝑩",n:"Bold Italic"},{s:"ℬ",n:"Script"},{s:"𝔅",n:"Fraktur"},{s:"𝔹",n:"Double-Struck"},{s:"𝖡",n:"Sans-Serif"} ],
    crossScript:[ {s:"Β",n:"Greek Beta — same origin; /b/ sound",l:"Greek"},{s:"β",n:"Greek beta — speed ratio v/c in physics",l:"Greek"},{s:"В",n:"Cyrillic Ve — looks like B but sounds like V",l:"Russian"},{s:"ב",n:"Beth — house; 2nd Hebrew letter",l:"Hebrew"},{s:"⊆",n:"Subset-of — curved like B rotated",l:"Math"} ],
    diacritics:["Ḃ","Ḅ","Ḇ"],
    symbols:[ {s:"β",m:"Greek beta — CGLE coefficient, Lorentz ratio"},{s:"♭",m:"Musical flat — lowers pitch by semitone; looks like b"},{s:"ß",m:"Eszett — German ss ligature, looks like β"},{s:"ƀ",m:"B with stroke — phonetic bilabial fricative"},{s:"6",m:"Digit 6 — mirror reflection of b in some scripts"} ],
    ipa:[ {p:"/b/",ex:"·b·ig (voiced bilabial stop)"} ] },

  C: { upper:"C", lower:"c", ascii:67, numerology:3,
    origin:"Phoenician Gimel 𐤂 (camel) → early Greek Gamma Γ → Latin C (softened). The crescent, the container, the cup holding sound.",
    math:[ {s:"𝐂",n:"Bold"},{s:"𝐶",n:"Italic"},{s:"𝑪",n:"Bold Italic"},{s:"𝒞",n:"Script"},{s:"ℭ",n:"Fraktur"},{s:"ℂ",n:"Complex numbers ℂ"},{s:"𝖢",n:"Sans-Serif"} ],
    crossScript:[ {s:"Γ",n:"Greek Gamma — C's ancestor before it curved",l:"Greek"},{s:"С",n:"Cyrillic Es — same shape, /s/ sound",l:"Russian"},{s:"ג",n:"Gimel — camel; 3rd Hebrew letter",l:"Hebrew"},{s:"⊂",n:"Proper subset ⊂ — C shape is containment",l:"Math"},{s:"∁",n:"Complement ∁ — rotated C",l:"Math"} ],
    diacritics:["Ç","Ć","Č","Ĉ","Ċ","Ḉ"],
    symbols:[ {s:"ℂ",m:"Complex numbers — field ℂ with i=√-1"},{s:"©",m:"Copyright — C in circle"},{s:"¢",m:"Cent — c with stroke"},{s:"Ç",m:"Cedilla — /s/ sound before a,o,u in French"},{s:"c",m:"Speed of light c = 2.998×10⁸ m/s"} ],
    ipa:[ {p:"/k/",ex:"·c·at (hard C)"},{p:"/s/",ex:"·c·ity (soft C before e/i/y)"},{p:"/tʃ/",ex:"·ch·eck (digraph)"} ] },

  D: { upper:"D", lower:"d", ascii:68, numerology:4,
    origin:"Phoenician Dalet 𐤃 (door/fish) → Greek Delta Δ → Latin D (rotated). The door, the threshold, the entry into meaning.",
    math:[ {s:"𝐃",n:"Bold"},{s:"𝐷",n:"Italic"},{s:"𝑫",n:"Bold Italic"},{s:"𝒟",n:"Script"},{s:"𝔇",n:"Fraktur"},{s:"𝔻",n:"Double-Struck"} ],
    crossScript:[ {s:"Δ",n:"Greek Delta — triangle form of D",l:"Greek"},{s:"δ",n:"Greek delta — perturbation/variation",l:"Greek"},{s:"Д",n:"Cyrillic De — looks like Greek Δ",l:"Russian"},{s:"ד",n:"Dalet — door; 4th Hebrew letter",l:"Hebrew"},{s:"∂",n:"Partial derivative — stylised d",l:"Math"} ],
    diacritics:["Ď","Ḋ","Ḍ","Ḏ","Ḑ","Ḓ"],
    symbols:[ {s:"∂",m:"Partial derivative ∂f/∂x — italic d"},{s:"ð",m:"Eth — voiced dental fricative; Old English /ð/"},{s:"Ð",m:"Eth uppercase — Icelandic and Old English"},{s:"d",m:"Total differential — exact differential df"},{s:"𝕕",m:"Double-struck d — exterior derivative in geometry"} ],
    ipa:[ {p:"/d/",ex:"·d·og (voiced alveolar stop)"},{p:"/dʒ/",ex:"e·dge (palatal affricate)"} ] },

  E: { upper:"E", lower:"e", ascii:69, numerology:5,
    origin:"Phoenician He 𐤄 (window/breath) → Greek Epsilon Ε → Latin E. The breath, the opening — most common letter in English.",
    math:[ {s:"𝐄",n:"Bold"},{s:"𝐸",n:"Italic"},{s:"𝑬",n:"Bold Italic"},{s:"𝓔",n:"Script"},{s:"𝔈",n:"Fraktur"},{s:"𝔼",n:"Double-Struck"} ],
    crossScript:[ {s:"Ε",n:"Greek Epsilon — same form, same sound /e/",l:"Greek"},{s:"ε",n:"Greek epsilon — error, permittivity, small qty",l:"Greek"},{s:"Е",n:"Cyrillic Ye — same shape /ye/ sound",l:"Russian"},{s:"ה",n:"He — window; 5th Hebrew letter",l:"Hebrew"},{s:"∃",n:"There Exists — backwards E; existential quantifier",l:"Math"} ],
    diacritics:["É","È","Ê","Ë","Ē","Ĕ","Ě","Ę","Ė","Ḕ","Ḗ","Ḙ","Ḛ","Ḝ","Ẹ","Ẻ","Ẽ","Ế","Ề","Ể","Ễ","Ệ"],
    symbols:[ {s:"ε",m:"Permittivity ε₀=8.85×10⁻¹² F/m; AETHER error"},{s:"ℯ",m:"Euler's number e=2.71828… base of ln"},{s:"€",m:"Euro — double-barred E"},{s:"∃",m:"Existential quantifier — there exists"},{s:"ℰ",m:"Electric field script-E"} ],
    ipa:[ {p:"/ɛ/",ex:"b·e·d (short E)"},{p:"/iː/",ex:"m·e·(long E)"},{p:"/ə/",ex:"th·e· (schwa)"},{p:"/eɪ/",ex:"th·ey (diphthong)"} ] },

  F: { upper:"F", lower:"f", ascii:70, numerology:6,
    origin:"Phoenician Waw 𐤅 (hook/peg) → early Greek Digamma Ϝ → Latin F. The hook sound, now marking force, fields, functions.",
    math:[ {s:"𝐅",n:"Bold"},{s:"𝐹",n:"Italic"},{s:"𝑭",n:"Bold Italic"},{s:"ℱ",n:"Script"},{s:"𝔉",n:"Fraktur"},{s:"𝔽",n:"Double-Struck"} ],
    crossScript:[ {s:"Ϝ",n:"Greek Digamma — archaic F, /w/ sound",l:"Greek"},{s:"Φ",n:"Greek Phi — similar vertical axis",l:"Greek"},{s:"Ф",n:"Cyrillic Ef — F sound",l:"Russian"},{s:"ו",n:"Vav — hook/peg; 6th Hebrew letter",l:"Hebrew"},{s:"∫",n:"Integral — elongated f from Leibniz notation",l:"Math"} ],
    diacritics:["Ḟ"],
    symbols:[ {s:"∫",m:"Integral sign — elongated f (Leibniz)"},{s:"ℱ",m:"Laplace transform script-F"},{s:"ƒ",m:"Function — florin sign, also f-hole in violin"},{s:"F",m:"Force vector F=ma; also Faraday constant"},{s:"ℱ",m:"Fourier transform operator"} ],
    ipa:[ {p:"/f/",ex:"·f·ish (voiceless labiodental fricative)"} ] },

  G: { upper:"G", lower:"g", ascii:71, numerology:7,
    origin:"Phoenician Gimel 𐤂 (camel) → Greek Gamma Γ → Latin G (C with bar added by Romans ca. 312 BCE). Gravity, growth, the golden mean.",
    math:[ {s:"𝐆",n:"Bold"},{s:"𝐺",n:"Italic"},{s:"𝑮",n:"Bold Italic"},{s:"𝒢",n:"Script"},{s:"𝔊",n:"Fraktur"},{s:"𝔾",n:"Double-Struck"} ],
    crossScript:[ {s:"Γ",n:"Greek Gamma — direct ancestor of G",l:"Greek"},{s:"γ",n:"Greek gamma — Lorentz factor; Barbero-Immirzi",l:"Greek"},{s:"Г",n:"Cyrillic Ghe — Γ-shape, /g/ sound",l:"Russian"},{s:"ג",n:"Gimel — camel; root of both C and G",l:"Hebrew"},{s:"⊞",n:"Gridded square — G-like containment grid",l:"Symbol"} ],
    diacritics:["Ĝ","Ğ","Ġ","Ģ","Ḡ"],
    symbols:[ {s:"G",m:"Newton's constant G=6.674×10⁻¹¹ N·m²/kg²"},{s:"γ",m:"Barbero-Immirzi γ=0.2375; Lorentz γ=1/√(1-β²)"},{s:"g",m:"Gravitational acceleration g=9.81 m/s²"},{s:"ℊ",m:"Script-g — metric tensor determinant"},{s:"Ĝ",m:"G-hat — Einstein tensor Ĝ in some notations"} ],
    ipa:[ {p:"/ɡ/",ex:"·g·o (hard G)"},{p:"/dʒ/",ex:"·g·em (soft G before e/i/y)"} ] },

  H: { upper:"H", lower:"h", ascii:72, numerology:8,
    origin:"Phoenician Heth 𐤇 (fence/courtyard) → Greek Eta Η / Heta → Latin H. The fence, the barrier, the breath between sounds.",
    math:[ {s:"𝐇",n:"Bold"},{s:"𝐻",n:"Italic"},{s:"𝑯",n:"Bold Italic"},{s:"ℋ",n:"Hamiltonian script"},{s:"ℌ",n:"Fraktur"},{s:"ℍ",n:"Quaternions ℍ"} ],
    crossScript:[ {s:"Η",n:"Greek Eta — same shape; /eː/ (long e)",l:"Greek"},{s:"η",n:"Greek eta — efficiency, Minkowski metric",l:"Greek"},{s:"Н",n:"Cyrillic En — H-shape but /n/ sound",l:"Russian"},{s:"ח",n:"Heth — fence; 8th Hebrew letter",l:"Hebrew"},{s:"ℏ",n:"h-bar ℏ=h/2π — reduced Planck constant",l:"Math"} ],
    diacritics:["Ĥ","Ḣ","Ḥ","Ḧ","Ḩ","Ḫ","H̱"],
    symbols:[ {s:"ℏ",m:"Reduced Planck constant ℏ=h/2π=1.055×10⁻³⁴ J·s"},{s:"ℋ",m:"Hamiltonian operator in quantum mechanics"},{s:"ℍ",m:"Quaternions ℍ — 4D number system"},{s:"H",m:"Hubble parameter H(a); magnetic field H"},{s:"ħ",m:"Planck units — ħ=1 natural units"} ],
    ipa:[ {p:"/h/",ex:"·h·at (glottal fricative)"},{p:"silent",ex:"w·h·at (in some dialects)"} ] },

  I: { upper:"I", lower:"i", ascii:73, numerology:9,
    origin:"Phoenician Yod 𐤉 (hand/arm) → Greek Iota Ι → Latin I. The smallest letter, the self — I, the imaginary unit, the identity.",
    math:[ {s:"𝐈",n:"Bold"},{s:"𝐼",n:"Italic"},{s:"𝑰",n:"Bold Italic"},{s:"𝒾",n:"Script"},{s:"𝔦",n:"Fraktur"},{s:"𝕀",n:"Double-Struck"} ],
    crossScript:[ {s:"Ι",n:"Greek Iota — same origin, same form",l:"Greek"},{s:"ι",n:"Greek iota — unit imaginary",l:"Greek"},{s:"І",n:"Cyrillic I — looks like I, /i/ sound",l:"Russian"},{s:"י",n:"Yod — hand; smallest Hebrew letter; 10th",l:"Hebrew"},{s:"1",n:"Digit 1 — typographically identical in many fonts",l:"Number"} ],
    diacritics:["Í","Ì","Î","Ï","Ĩ","Ī","Ĭ","Į","İ","Ȉ","Ȋ","Ḭ","Ḯ","Ỉ","Ị"],
    symbols:[ {s:"i",m:"Imaginary unit i=√(-1) — foundation of complex numbers"},{s:"ℹ",m:"Information symbol ℹ"},{s:"ı",m:"Dotless i — Turkish and mathematical contexts"},{s:"1",m:"Number 1 — I=1 in Roman numerals"},{s:"‼",m:"Double exclamation — pair of I-like marks"} ],
    ipa:[ {p:"/ɪ/",ex:"s·i·t (short I)"},{p:"/aɪ/",ex:"k·i·te (long I diphthong)"} ] },

  J: { upper:"J", lower:"j", ascii:74, numerology:10,
    origin:"Youngest letter in English — a variant of I/Y, added ~1524 CE to distinguish consonantal /dʒ/ from vowel /i/. J is the hook, the descender.",
    math:[ {s:"𝐉",n:"Bold"},{s:"𝐽",n:"Italic"},{s:"𝑱",n:"Bold Italic"},{s:"𝒥",n:"Script"},{s:"𝔍",n:"Fraktur"},{s:"𝕁",n:"Double-Struck"} ],
    crossScript:[ {s:"Й",n:"Cyrillic Short I — J-like sound /j/",l:"Russian"},{s:"ʝ",n:"IPA palatal fricative — /ʝ/ as in Spanish yo",l:"IPA"},{s:"j",m:"Current density J vector; also engineering √-1",l:"Math"},{s:"ℑ",n:"Imaginary part ℑ(z) — fraktur I, sometimes J",l:"Math"} ],
    diacritics:["Ĵ","Ɉ"],
    symbols:[ {s:"J",m:"Joule — SI unit of energy"},{s:"j",m:"Engineering imaginary unit j=√(-1) (EE notation)"},{s:"J",m:"Current density vector J in Maxwell's equations"},{s:"ℑ",m:"Imaginary part of complex number ℑ(z)"} ],
    ipa:[ {p:"/dʒ/",ex:"·j·ump (palato-alveolar affricate)"},{p:"/j/",ex:"·y·es in German; loanwords"} ] },

  K: { upper:"K", lower:"k", ascii:75, numerology:11,
    origin:"Phoenician Kaph 𐤊 (palm of hand) → Greek Kappa Κ → Latin K. The palm, the grasping — k sounds that stop, strike, grasp.",
    math:[ {s:"𝐊",n:"Bold"},{s:"𝐾",n:"Italic"},{s:"𝑲",n:"Bold Italic"},{s:"𝒦",n:"Script"},{s:"𝔎",n:"Fraktur"},{s:"𝕂",n:"Double-Struck"} ],
    crossScript:[ {s:"Κ",n:"Greek Kappa — same origin, same /k/ sound",l:"Greek"},{s:"κ",n:"Greek kappa — AETHER coherence decay constant",l:"Greek"},{s:"К",n:"Cyrillic Ka — identical to Latin K",l:"Russian"},{s:"כ",n:"Kaph — palm of hand; 11th Hebrew letter",l:"Hebrew"},{s:"⊗",n:"Tensor product ⊗ — K-like cross-product",l:"Math"} ],
    diacritics:["Ķ","Ǩ","Ḱ","Ḳ","Ḵ"],
    symbols:[ {s:"κ",m:"Thermal conductivity κ; AETHER decay constant"},{s:"K",m:"Kelvin — absolute temperature scale"},{s:"K",m:"Kuramoto coupling constant K in AETHER"},{s:"k",m:"Boltzmann constant k_B=1.38×10⁻²³ J/K"},{s:"K",m:"Kaon — strange quark/antiquark meson"} ],
    ipa:[ {p:"/k/",ex:"·k·ite (voiceless velar stop)"} ] },

  L: { upper:"L", lower:"l", ascii:76, numerology:12,
    origin:"Phoenician Lamedh 𐤋 (ox goad) → Greek Lambda Λ → Latin L (rotated). The staff, the guide stick — L-shape of an elbow, a right angle.",
    math:[ {s:"𝐋",n:"Bold"},{s:"𝐿",n:"Italic"},{s:"𝑳",n:"Bold Italic"},{s:"ℒ",n:"Laplace"},{s:"𝔏",n:"Fraktur"},{s:"𝕃",n:"Double-Struck"} ],
    crossScript:[ {s:"Λ",n:"Greek Lambda — V-shape; L rotated 180°",l:"Greek"},{s:"λ",n:"Greek lambda — wavelength, cosmological Λ",l:"Greek"},{s:"Л",n:"Cyrillic El — same /l/ sound",l:"Russian"},{s:"ל",n:"Lamedh — ox goad; 12th Hebrew letter",l:"Hebrew"},{s:"⊥",n:"Perpendicular — L-shape rotated 90°",l:"Math"} ],
    diacritics:["Ĺ","Ļ","Ľ","Ŀ","Ł","Ḷ","Ḹ","Ḻ","Ḽ"],
    symbols:[ {s:"λ",m:"Wavelength λ=c/ν; cosmological constant Λ"},{s:"ℒ",m:"Lagrangian density; Laplace transform"},{s:"L",m:"Angular momentum L=r×p; inductance L"},{s:"Ł",m:"L-stroke — Polish letter /w/"},{s:"ℓ",m:"Planck length ℓ_P = √(ℏG/c³)"} ],
    ipa:[ {p:"/l/",ex:"·l·eg (lateral approximant)"},{p:"/ɫ/",ex:"fil·l (dark L, velarised)"} ] },

  M: { upper:"M", lower:"m", ascii:77, numerology:13,
    origin:"Phoenician Mem 𐤌 (water waves) → Greek Mu Μ → Latin M. The ocean waves, the rolling water — M mirrors waves on a horizon.",
    math:[ {s:"𝐌",n:"Bold"},{s:"𝑀",n:"Italic"},{s:"𝑴",n:"Bold Italic"},{s:"ℳ",n:"Script"},{s:"𝔐",n:"Fraktur"},{s:"𝕄",n:"Double-Struck"} ],
    crossScript:[ {s:"Μ",n:"Greek Mu — same origin, same /m/ sound",l:"Greek"},{s:"μ",n:"Greek mu — magnetic permeability μ₀; mean",l:"Greek"},{s:"М",n:"Cyrillic Em — same form and sound",l:"Russian"},{s:"מ",n:"Mem — water; 13th Hebrew letter",l:"Hebrew"},{s:"Ш",n:"Cyrillic Sha — M-upside-down shape",l:"Russian"} ],
    diacritics:["Ḿ","Ṁ","Ṃ"],
    symbols:[ {s:"μ",m:"Magnetic permeability μ₀; chemical potential μ"},{s:"M",m:"Molar mass M; mass M; magnetisation M"},{s:"m",m:"Metre SI unit; mass m in E=mc²"},{s:"ℳ",m:"Script-M for Laplace/Mellin transforms"},{s:"Ω",m:"Ohm (M-like Cyrillic structure)"} ],
    ipa:[ {p:"/m/",ex:"·m·an (bilabial nasal)"} ] },

  N: { upper:"N", lower:"n", ascii:78, numerology:14,
    origin:"Phoenician Nun 𐤍 (fish/serpent) → Greek Nu Ν → Latin N. The snake, the fluid winding — N encodes number, nature, node.",
    math:[ {s:"𝐍",n:"Bold"},{s:"𝑁",n:"Italic"},{s:"𝑵",n:"Bold Italic"},{s:"𝒩",n:"Script"},{s:"𝔑",n:"Fraktur"},{s:"ℕ",n:"Natural numbers ℕ"} ],
    crossScript:[ {s:"Ν",n:"Greek Nu — same origin; /n/ sound",l:"Greek"},{s:"ν",n:"Greek nu — frequency ν=c/λ; neutrino",l:"Greek"},{s:"Н",n:"Cyrillic En — same /n/ sound; H-shape",l:"Russian"},{s:"נ",n:"Nun — fish; 14th Hebrew letter",l:"Hebrew"},{s:"η",n:"Eta — frequency-adjacent in physics notation",l:"Greek"} ],
    diacritics:["Ń","Ñ","Ņ","Ň","Ǹ","Ṅ","Ṇ","Ṉ","Ṋ"],
    symbols:[ {s:"ℕ",m:"Natural numbers ℕ = {0,1,2,3,…}"},{s:"ν",m:"Frequency ν=c/λ; kinematic viscosity ν"},{s:"N",m:"Newton — SI unit of force N=kg·m/s²"},{s:"N",m:"Number of oscillators N in Kuramoto model"},{s:"∩",m:"Intersection — n-shape; also AETHER curvature ∩"} ],
    ipa:[ {p:"/n/",ex:"·n·o (alveolar nasal)"},{p:"/ŋ/",ex:"si·ng (velar nasal)"} ] },

  O: { upper:"O", lower:"o", ascii:79, numerology:15,
    origin:"Phoenician Ayin 𐤏 (eye) → Greek Omicron Ο → Latin O. The eye, the circle, the zero — O is the oldest circular symbol in writing.",
    math:[ {s:"𝐎",n:"Bold"},{s:"𝑂",n:"Italic"},{s:"𝑶",n:"Bold Italic"},{s:"𝒪",n:"Big-O notation"},{s:"𝔒",n:"Fraktur"},{s:"𝕆",n:"Octonions 𝕆"} ],
    crossScript:[ {s:"Ο",n:"Greek Omicron — same origin, same circle form",l:"Greek"},{s:"ω",n:"Omega lowercase — angular frequency",l:"Greek"},{s:"О",n:"Cyrillic O — identical form and sound",l:"Russian"},{s:"ع",n:"Ayin — eye; ancestor of O in Arabic",l:"Hebrew"},{s:"∘",n:"Function composition ∘ — small circle",l:"Math"} ],
    diacritics:["Ó","Ò","Ô","Ö","Õ","Ø","Ō","Ŏ","Ő","Ȍ","Ȏ","Ṍ","Ṏ","Ṑ","Ṓ","Ọ","Ỏ","Ố","Ồ","Ổ","Ỗ","Ộ"],
    symbols:[ {s:"Ø",m:"Empty set ∅; Danish/Norwegian O-slash"},{s:"∅",m:"Empty set — O with diagonal stroke"},{s:"∘",m:"Function composition f∘g; Hadamard product"},{s:"⊙",m:"Circled dot — Sun symbol; XNOR gate"},{s:"0",m:"Zero — O-shape; distinct from letter O in code"} ],
    ipa:[ {p:"/ɒ/",ex:"h·o·t (British short O)"},{p:"/oʊ/",ex:"g·o· (American long O)"},{p:"/ʌ/",ex:"s·o·n (some dialects)"} ] },

  P: { upper:"P", lower:"p", ascii:80, numerology:16,
    origin:"Phoenician Pe 𐤐 (mouth) → Greek Pi Π / Rho Ρ → Latin P. The mouth, the speaker — P powers pressure, probability, momentum.",
    math:[ {s:"𝐏",n:"Bold"},{s:"𝑃",n:"Italic"},{s:"𝑷",n:"Bold Italic"},{s:"𝒫",n:"Script"},{s:"𝔓",n:"Fraktur"},{s:"ℙ",n:"Primes ℙ"} ],
    crossScript:[ {s:"Π",n:"Greek Pi — product ∏; P rotated",l:"Greek"},{s:"π",n:"Greek pi — 3.14159… circle constant",l:"Greek"},{s:"Р",n:"Cyrillic Er — P-shape but /r/ sound",l:"Russian"},{s:"פ",n:"Pe — mouth; 17th Hebrew letter",l:"Hebrew"},{s:"ρ",n:"Greek rho — density ρ=m/V",l:"Greek"} ],
    diacritics:["Ṕ","Ṗ"],
    symbols:[ {s:"π",m:"Pi = 3.14159…; pion π⁺π⁻π⁰ (strong force)"},{s:"ℙ",m:"Set of primes ℙ; probability space"},{s:"P",m:"Momentum P=mv; pressure P; power P"},{s:"∏",m:"Product operator Π — capital pi"},{s:"¶",m:"Pilcrow (paragraph mark) — P with double stem"} ],
    ipa:[ {p:"/p/",ex:"·p·in (voiceless bilabial stop)"} ] },

  Q: { upper:"Q", lower:"q", ascii:81, numerology:17,
    origin:"Phoenician Qoph 𐤒 (back of head) → Greek Koppa Ϙ (obsolete) → Latin Q. The circle with a tail — Q is the rarest letter, almost always needs U.",
    math:[ {s:"𝐐",n:"Bold"},{s:"𝑄",n:"Italic"},{s:"𝑸",n:"Bold Italic"},{s:"𝒬",n:"Script"},{s:"𝔔",n:"Fraktur"},{s:"ℚ",n:"Rationals ℚ"} ],
    crossScript:[ {s:"Ϙ",n:"Greek Koppa — archaic Q, dropped from Greek",l:"Greek"},{s:"q",n:"Lowercase q — mirror of p",l:"Form"},{s:"ℚ",n:"Rational numbers ℚ = {p/q | p,q ∈ ℤ}",l:"Math"} ],
    diacritics:["Q̃"],
    symbols:[ {s:"ℚ",m:"Rational numbers — fractions p/q"},{s:"Q",m:"Electric charge Q; quality factor Q=ω/Δω"},{s:"q",m:"Quark label; generalised coordinate q"},{s:"Q",m:"Heat transfer Q in thermodynamics"},{s:"ℏ",m:"(Q-like circle with tail form in some scripts)"} ],
    ipa:[ {p:"/kw/",ex:"·qu·een (almost always with u)"},{p:"/k/",ex:"·q·at (in loanwords)"} ] },

  R: { upper:"R", lower:"r", ascii:82, numerology:18,
    origin:"Phoenician Resh 𐤓 (head) → Greek Rho Ρ → Latin R (added a leg to distinguish from P). The head, the radius, the real — R for reality.",
    math:[ {s:"𝐑",n:"Bold"},{s:"𝑅",n:"Italic"},{s:"𝑹",n:"Bold Italic"},{s:"ℛ",n:"Script"},{s:"ℜ",n:"Fraktur (real part)"},{s:"ℝ",n:"Real numbers ℝ"} ],
    crossScript:[ {s:"Ρ",n:"Greek Rho — looks exactly like P; sounds like R",l:"Greek"},{s:"ρ",n:"Greek rho — density ρ; Ricci scalar",l:"Greek"},{s:"Р",n:"Cyrillic Er — P-shape but R-sound",l:"Russian"},{s:"ר",n:"Resh — head; 20th Hebrew letter",l:"Hebrew"},{s:"ℜ",n:"Real part ℜ(z) of complex number",l:"Math"} ],
    diacritics:["Ŕ","Ŗ","Ř","Ȑ","Ȓ","Ṙ","Ṛ","Ṝ","Ṟ"],
    symbols:[ {s:"ℝ",m:"Real number line ℝ — all continuous quantities"},{s:"ℜ",m:"Real part of complex number ℜ(z)"},{s:"R",m:"Ricci scalar R; Rydberg constant R_∞"},{s:"r",m:"Radius r; radial coordinate in polar"},{s:"ℛ",m:"Script-R for resistance; Ritz spectral series"} ],
    ipa:[ {p:"/ɹ/",ex:"·r·ed (American approximant)"},{p:"/r/",ex:"·r·ojo (Spanish trill)"} ] },

  S: { upper:"S", lower:"s", ascii:83, numerology:19,
    origin:"Phoenician Shin 𐤔 (tooth/sun) → Greek Sigma Σ / Sigma σ → Latin S. The serpent, the tooth, the spiral — S encodes entropy, spin, the sun.",
    math:[ {s:"𝐒",n:"Bold"},{s:"𝑆",n:"Italic"},{s:"𝑺",n:"Bold Italic"},{s:"𝒮",n:"Script"},{s:"𝔖",n:"Fraktur"},{s:"𝕊",n:"Sphere 𝕊"} ],
    crossScript:[ {s:"Σ",n:"Greek Sigma uppercase — sum operator Σ",l:"Greek"},{s:"σ",n:"Greek sigma — standard deviation; Pauli matrices",l:"Greek"},{s:"С",n:"Cyrillic Es — C-shape but S-sound",l:"Russian"},{s:"ש",n:"Shin — tooth/sun; 21st Hebrew letter",l:"Hebrew"},{s:"ς",n:"Greek sigma final — used at word end",l:"Greek"} ],
    diacritics:["Ś","Ŝ","Š","Ş","Ṡ","Ṣ","Ṥ","Ṧ","Ṩ"],
    symbols:[ {s:"Σ",m:"Summation Σᵢ; stress tensor Σ_μν"},{s:"σ",m:"Standard deviation; Pauli matrices σ_x,y,z"},{s:"$",m:"Dollar sign — S with stroke"},{s:"§",m:"Section sign — double S ligature"},{s:"∫",m:"Integral — S for summa (Leibniz)"} ],
    ipa:[ {p:"/s/",ex:"·s·un (voiceless alveolar fricative)"},{p:"/z/",ex:"i·s· (voiced in between vowels)"},{p:"/ʃ/",ex:"·sh·oe (digraph)"} ] },

  T: { upper:"T", lower:"t", ascii:84, numerology:20,
    origin:"Phoenician Taw 𐤕 (mark/cross) → Greek Tau Τ → Latin T. The mark, the cross, the T-junction — T is the sign of a covenant and a tensor.",
    math:[ {s:"𝐓",n:"Bold"},{s:"𝑇",n:"Italic"},{s:"𝑻",n:"Bold Italic"},{s:"𝒯",n:"Script"},{s:"𝔗",n:"Fraktur"},{s:"𝕋",n:"Torus 𝕋"} ],
    crossScript:[ {s:"Τ",n:"Greek Tau — same origin, same /t/ sound",l:"Greek"},{s:"τ",n:"Greek tau — coherence time τ_c; shear stress",l:"Greek"},{s:"Т",n:"Cyrillic Te — same form and sound as T",l:"Russian"},{s:"ת",n:"Taw — mark/cross; last Hebrew letter",l:"Hebrew"},{s:"†",n:"Dagger/cross — T with crossbar",l:"Symbol"} ],
    diacritics:["Ţ","Ť","T̈","Ṫ","Ṭ","Ṯ","Ṱ"],
    symbols:[ {s:"τ",m:"Coherence time τ_c~1/Δω; proper time; tau lepton"},{s:"†",m:"Dagger — conjugate transpose A† in quantum"},{s:"T",m:"Stress-energy tensor T_μν; temperature T"},{s:"⊤",m:"True / top element in lattice theory"},{s:"×",m:"Cross product × — T-intersection of axes"} ],
    ipa:[ {p:"/t/",ex:"·t·op (voiceless alveolar stop)"},{p:"/tʃ/",ex:"na·ture (affricate in some contexts)"} ] },

  U: { upper:"U", lower:"u", ascii:85, numerology:21,
    origin:"Latin V was originally both U and V; U was separated as a distinct vowel letter in the Middle Ages. The hollow cup, the vessel.",
    math:[ {s:"𝐔",n:"Bold"},{s:"𝑈",n:"Italic"},{s:"𝑼",n:"Bold Italic"},{s:"𝒰",n:"Script"},{s:"𝔘",n:"Fraktur"},{s:"𝕌",n:"Double-Struck"} ],
    crossScript:[ {s:"Υ",n:"Greek Upsilon — sounds like U; ancestor of Y too",l:"Greek"},{s:"υ",n:"Greek upsilon — upsilon meson (bottom quark)",l:"Greek"},{s:"У",n:"Cyrillic U — same /u/ sound",l:"Russian"},{s:"∪",n:"Union — U-shape is set union ∪",l:"Math"} ],
    diacritics:["Ú","Ù","Û","Ü","Ũ","Ū","Ŭ","Ů","Ű","Ų","Ȕ","Ȗ","Ṳ","Ṵ","Ṷ","Ṹ","Ṻ","Ụ","Ủ","Ứ","Ừ","Ử"],
    symbols:[ {s:"∪",m:"Set union A∪B — U-shape"},{s:"U",m:"Potential energy U; internal energy U"},{s:"u",m:"Flow velocity U in density fields; up quark u"},{s:"∩",m:"Intersection — inverted U"},{s:"⊎",m:"Disjoint union — U with plus sign"} ],
    ipa:[ {p:"/ʊ/",ex:"p·u·t (short U)"},{p:"/uː/",ex:"m·oo·n (long U)"},{p:"/ʌ/",ex:"c·u·p (unstressed U)"} ] },

  V: { upper:"V", lower:"v", ascii:86, numerology:22,
    origin:"Latin V was originally used for both U and V; the pointed V-form distinguished the consonant. The vector, the velocity — V points.",
    math:[ {s:"𝐕",n:"Bold"},{s:"𝑉",n:"Italic"},{s:"𝑽",n:"Bold Italic"},{s:"𝒱",n:"Script"},{s:"𝔙",n:"Fraktur"},{s:"𝕍",n:"Double-Struck"} ],
    crossScript:[ {s:"Ν",n:"Greek Nu — V-like shape; /n/ sound",l:"Greek"},{s:"В",n:"Cyrillic Ve — B-shape but V-sound",l:"Russian"},{s:"∨",n:"Logical OR — V-shape",l:"Math"},{s:"✓",n:"Checkmark — V-shape indicating correct",l:"Symbol"} ],
    diacritics:["Ṽ","Ṿ"],
    symbols:[ {s:"∨",m:"Logical OR (disjunction) — V-shape"},{s:"V",m:"Voltage V=IR; volume V; vanadium"},{s:"v",m:"Velocity v; specific volume v"},{s:"√",m:"Square root — V with overbar"},{s:"✓",m:"Check mark — visual V confirmation"} ],
    ipa:[ {p:"/v/",ex:"·v·an (voiced labiodental fricative)"} ] },

  W: { upper:"W", lower:"w", ascii:87, numerology:23,
    origin:"Medieval addition — 'double-U' (VV or UU). Germanic /w/ sound required a new letter. W is the double wave, double energy density.",
    math:[ {s:"𝐖",n:"Bold"},{s:"𝑊",n:"Italic"},{s:"𝑾",n:"Bold Italic"},{s:"𝒲",n:"Script"},{s:"𝔚",n:"Fraktur"},{s:"𝕎",n:"Double-Struck"} ],
    crossScript:[ {s:"Ω",n:"Greek Omega lowercase ω / uppercase Ω — W-like",l:"Greek"},{s:"ω",n:"Angular frequency ω=2πν — double-u shaped",l:"Greek"},{s:"Ш",n:"Cyrillic Sha — W/M shape, /sh/ sound",l:"Russian"},{s:"ω",n:"Omega meson — W/ω notation overlap",l:"Physics"} ],
    diacritics:["Ŵ","Ẁ","Ẃ","Ẅ","Ẇ","Ẉ"],
    symbols:[ {s:"ω",m:"Angular frequency ω=2πν; Omega baryon"},{s:"W",m:"W-boson — weak force carrier; Watt"},{s:"w",m:"Energy density w; weight w"},{s:"∞",m:"Infinity — two W-loops joined"},{s:"Ω",m:"Ohm Ω; cosmic density Ω_m+Ω_Λ+Ω_r"} ],
    ipa:[ {p:"/w/",ex:"·w·et (voiced labial-velar approximant)"} ] },

  X: { upper:"X", lower:"x", ascii:88, numerology:24,
    origin:"Phoenician Samekh 𐤎 (support/fish) → Greek Chi Χ / Xi Ξ → Latin X. The unknown, the cross, the multiplication sign — X marks everything.",
    math:[ {s:"𝐗",n:"Bold"},{s:"𝑋",n:"Italic"},{s:"𝑿",n:"Bold Italic"},{s:"𝒳",n:"Script"},{s:"𝔛",n:"Fraktur"},{s:"𝕏",n:"Double-Struck"} ],
    crossScript:[ {s:"Χ",n:"Greek Chi — same shape; chi-squared χ²",l:"Greek"},{s:"χ",n:"Greek chi — susceptibility; chirality",l:"Greek"},{s:"Х",n:"Cyrillic Kha — same shape, /kh/ sound",l:"Russian"},{s:"×",n:"Multiplication × — X-shape",l:"Math"},{s:"⊗",n:"Tensor product ⊗ — X inside circle",l:"Math"} ],
    diacritics:["Ẋ","Ẍ"],
    symbols:[ {s:"×",m:"Multiplication; cross product A×B"},{s:"χ",m:"Chi-squared χ²; magnetic susceptibility χ"},{s:"⊗",m:"Tensor product ⊗ — field coupling operator"},{s:"✗",m:"X-mark — error or negation"},{s:"10",m:"Roman numeral X = 10"} ],
    ipa:[ {p:"/ks/",ex:"bo·x (voiceless velar + sibilant)"},{p:"/z/",ex:"·x·ylophone (voiced)"},{p:"/ɡz/",ex:"e·x·act (between vowels)"} ] },

  Y: { upper:"Y", lower:"y", ascii:89, numerology:25,
    origin:"Greek Upsilon Υ was borrowed by Romans as Y for Greek loanwords. The fork, the branch-point — Y is the question of two paths, the split.",
    math:[ {s:"𝐘",n:"Bold"},{s:"𝑌",n:"Italic"},{s:"𝒀",n:"Bold Italic"},{s:"𝒴",n:"Script"},{s:"𝔜",n:"Fraktur"},{s:"𝕐",n:"Double-Struck"} ],
    crossScript:[ {s:"Υ",n:"Greek Upsilon — Y's parent; /y/ and /u/ sounds",l:"Greek"},{s:"υ",n:"Upsilon meson — bottom quark bound state",l:"Physics"},{s:"Ψ",n:"Greek Psi Ψ — Y-fork with extra branch",l:"Greek"},{s:"Ч",n:"Cyrillic Che — Y-like; /ch/ sound",l:"Russian"},{s:"ψ",n:"Wavefunction ψ — Y descended from same root",l:"Physics"} ],
    diacritics:["Ý","Ÿ","Ŷ","Ȳ","Ẏ","Y̊","Ỳ","Ỵ","Ỷ","Ỹ"],
    symbols:[ {s:"ψ",m:"Quantum wavefunction ψ; Kuramoto order ψ_K"},{s:"Υ",m:"Upsilon meson Υ (b-quark bound state)"},{s:"Y",m:"Yukawa coupling Y_ij; admittance Y=1/Z"},{s:"¥",m:"Yen — Y with double stroke"},{s:"γ",m:"Gamma ray γ; Lorentz factor (Y-like in some fonts)"} ],
    ipa:[ {p:"/j/",ex:"·y·es (palatal approximant)"},{p:"/aɪ/",ex:"m·y (long I)"},{p:"/ɪ/",ex:"happ·y (short I at word end)"} ] },

  Z: { upper:"Z", lower:"z", ascii:90, numerology:26,
    origin:"Greek Zeta Ζ → Latin Z (rarely used, placed last). The lightning bolt, the endpoint — Z encodes impedance, the integers, the final.",
    math:[ {s:"𝐙",n:"Bold"},{s:"𝑍",n:"Italic"},{s:"𝒁",n:"Bold Italic"},{s:"𝒵",n:"Script"},{s:"ℨ",n:"Fraktur"},{s:"ℤ",n:"Integers ℤ"} ],
    crossScript:[ {s:"Ζ",n:"Greek Zeta — same origin, same /z/ sound",l:"Greek"},{s:"ζ",n:"Greek zeta — Riemann ζ(s); damping ratio",l:"Greek"},{s:"З",n:"Cyrillic Ze — same shape and sound",l:"Russian"},{s:"ז",n:"Zayin — weapon; 7th Hebrew letter",l:"Hebrew"},{s:"2",m:"Digit 2 — Z-like diagonal stroke",l:"Number"} ],
    diacritics:["Ź","Ż","Ž","Ẑ","Ẓ","Ẕ"],
    symbols:[ {s:"ℤ",m:"Integers ℤ = {…−2,−1,0,1,2,…}"},{s:"ζ",m:"Riemann ζ(s); damping ratio ζ<1 underdamped"},{s:"Z",m:"Impedance Z=R+iX; atomic number Z"},{s:"Z",m:"Partition function Z=Σe^(−E/kT)"},{s:"2",m:"2 in many fonts mirrors Z-diagonal"} ],
    ipa:[ {p:"/z/",ex:"·z·oo (voiced alveolar fricative)"} ] },
};

const LETTERS_ORDER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ── Component ─────────────────────────────────────────────────────────────────
export default function AlphabetMapPage() {
  const [sel, setSel] = useState("A");
  const d = DNA[sel];
  const bin = d.ascii.toString(2).padStart(8,"0");

  const sectionCol: Record<string, string> = {
    math: CYAN, cross: GOLD, diacritics: GREEN, symbols: ROSE, ipa: VIO, code: AMB,
  };

  return (
    <div style={{ minHeight:"100vh", background:BG, color:WHT, fontFamily:MONO, fontSize:11 }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ padding:"20px 24px 0", borderBottom:`1px solid ${BRD}`, position:"sticky", top:0, background:"rgba(2,8,20,0.97)", backdropFilter:"blur(10px)", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:20, marginBottom:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:8, letterSpacing:"0.26em", color:`${GOLD}60`, marginBottom:4 }}>AMERICAN ALPHABET · LETTER DNA MAP</div>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:"0.12em", color:WHT }}>Every Form of Every Letter</div>
            <div style={{ fontSize:9, color:MUT, fontFamily:SERIF, marginTop:4 }}>Select a letter to reveal its complete universe — math variants, cross-script cognates, diacritics, derived symbols, phonetics, and code identity.</div>
          </div>
        </div>

        {/* A–Z selector */}
        <div style={{ display:"flex", gap:3, flexWrap:"wrap", paddingBottom:10 }}>
          {LETTERS_ORDER.map(L => (
            <button key={L} onClick={() => setSel(L)}
              style={{ width:28, height:28, borderRadius:5, cursor:"pointer", fontFamily:MONO, fontSize:11, fontWeight:700, border:`1px solid ${sel===L ? GOLD : "rgba(255,255,255,0.1)"}`, background: sel===L ? `${GOLD}20` : "transparent", color: sel===L ? GOLD : MUT, transition:"all 0.12s" }}>
              {L}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px 24px", maxWidth:980, margin:"0 auto" }}>

        {/* ── Hero letter ───────────────────────────────────────────────────── */}
        <div style={{ display:"flex", gap:24, marginBottom:24, alignItems:"flex-start", flexWrap:"wrap" }}>
          <div style={{ textAlign:"center", width:140, flexShrink:0 }}>
            <div style={{ fontSize:96, lineHeight:1, fontWeight:900, color:GOLD, textShadow:`0 0 40px ${GOLD}50`, letterSpacing:"-0.02em" }}>{d.upper}</div>
            <div style={{ fontSize:72, lineHeight:1, fontWeight:300, color:`${GOLD}70`, marginTop:-4 }}>{d.lower}</div>
            <div style={{ fontSize:8, color:GOLD, letterSpacing:"0.14em", marginTop:10, opacity:0.6 }}>#{d.numerology} · ASCII {d.ascii}/{d.ascii+32}</div>
          </div>
          <div style={{ flex:1, minWidth:240 }}>
            <div style={{ fontSize:8, color:`${GOLD}60`, letterSpacing:"0.14em", marginBottom:8 }}>ORIGIN · ETYMOLOGY</div>
            <div style={{ fontSize:10, color:WHT, fontFamily:SERIF, lineHeight:1.8, marginBottom:14, opacity:0.9 }}>{d.origin}</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[
                { label:"Binary",   val:bin, col:GREEN },
                { label:"Decimal",  val:String(d.ascii), col:CYAN },
                { label:"Hex",      val:"0x"+d.ascii.toString(16).toUpperCase(), col:AMB },
                { label:"Numeral",  val:String(d.numerology), col:VIO },
                { label:"Lower",    val:String(d.ascii+32), col:ROSE },
              ].map(({ label, val, col }) => (
                <div key={label} style={{ textAlign:"center", padding:"5px 10px", borderRadius:6, border:`1px solid ${col}25`, background:`${col}08` }}>
                  <div style={{ fontSize:11, fontWeight:700, color:col }}>{val}</div>
                  <div style={{ fontSize:6.5, color:`${col}60`, letterSpacing:"0.1em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Math forms ────────────────────────────────────────────────────── */}
        <Section title="MATH TYPOGRAPHY VARIANTS" col={sectionCol.math} sub="Unicode mathematical block — same letter in different typographic traditions">
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {d.math.map((f, i) => (
              <div key={i} style={{ textAlign:"center", padding:"10px 14px", borderRadius:8, border:`1px solid ${CYAN}20`, background:`${CYAN}06`, minWidth:70 }}>
                <div style={{ fontSize:28, color:CYAN, lineHeight:1.2 }}>{f.s}</div>
                <div style={{ fontSize:7, color:`${CYAN}70`, marginTop:5, letterSpacing:"0.1em" }}>{f.n}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Cross-script ──────────────────────────────────────────────────── */}
        <Section title="CROSS-SCRIPT COGNATES" col={sectionCol.cross} sub="Symbols in other writing systems that share origin, form, or sound with this letter">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
            {d.crossScript.map((c, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 12px", borderRadius:8, border:`1px solid ${GOLD}18`, background:`${GOLD}06` }}>
                <div style={{ fontSize:26, color:GOLD, minWidth:32, textAlign:"center" }}>{c.s}</div>
                <div>
                  <div style={{ fontSize:9.5, color:WHT, lineHeight:1.5 }}>{c.n}</div>
                  <div style={{ fontSize:7, color:`${GOLD}60`, letterSpacing:"0.1em", marginTop:2 }}>{c.l.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Diacritics ────────────────────────────────────────────────────── */}
        <Section title="DIACRITIC FAMILY" col={sectionCol.diacritics} sub="Every accented, modified, and combined form of this letter across the world's Latin-based alphabets">
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <div style={{ textAlign:"center", padding:"6px 10px", borderRadius:6, border:`1px solid ${GREEN}35`, background:`${GREEN}10` }}>
              <div style={{ fontSize:20, color:GREEN }}>{d.upper}</div>
              <div style={{ fontSize:6, color:`${GREEN}60` }}>base</div>
            </div>
            <div style={{ textAlign:"center", padding:"6px 10px", borderRadius:6, border:`1px solid ${GREEN}25`, background:`${GREEN}07` }}>
              <div style={{ fontSize:20, color:`${GREEN}90` }}>{d.lower}</div>
              <div style={{ fontSize:6, color:`${GREEN}60` }}>lower</div>
            </div>
            {d.diacritics.map((c, i) => (
              <div key={i} style={{ textAlign:"center", padding:"6px 10px", borderRadius:6, border:`1px solid ${GREEN}20`, background:`${GREEN}05`, minWidth:32 }}>
                <div style={{ fontSize:20, color:`${GREEN}80` }}>{c}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:8, color:`${GREEN}50`, marginTop:8 }}>{d.diacritics.length} diacritic variants · {d.diacritics.length + 2} total forms including base</div>
        </Section>

        {/* ── Derived symbols ───────────────────────────────────────────────── */}
        <Section title="DERIVED SYMBOLS" col={sectionCol.symbols} sub="Mathematical, scientific, and cultural symbols that originated from or share form with this letter">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>
            {d.symbols.map((sym, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 12px", borderRadius:8, border:`1px solid ${ROSE}18`, background:`${ROSE}05` }}>
                <div style={{ fontSize:24, color:ROSE, minWidth:30, textAlign:"center" }}>{sym.s}</div>
                <div style={{ fontSize:9, color:MUT, fontFamily:SERIF, lineHeight:1.55 }}>{sym.m}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── IPA Phonetics ─────────────────────────────────────────────────── */}
        <Section title="PHONETIC SOUNDS (IPA)" col={sectionCol.ipa} sub="Every sound this letter represents in English, transcribed in International Phonetic Alphabet">
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {d.ipa.map((p, i) => (
              <div key={i} style={{ padding:"10px 16px", borderRadius:8, border:`1px solid ${VIO}25`, background:`${VIO}08` }}>
                <div style={{ fontSize:18, fontWeight:700, color:VIO, fontFamily:SERIF, marginBottom:4 }}>{p.p}</div>
                <div style={{ fontSize:9, color:MUT, fontFamily:SERIF }}>{p.ex}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Full binary display ───────────────────────────────────────────── */}
        <Section title="CODE ANATOMY" col={sectionCol.code} sub="How this letter is stored, transmitted, and identified in digital systems">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
            {[
              { label:"Uppercase char", val:d.upper,                   col:GOLD, desc:"The letter itself" },
              { label:"Lowercase char", val:d.lower,                   col:GOLD, desc:"Lowercase form" },
              { label:"ASCII upper",    val:String(d.ascii),           col:AMB,  desc:"Dec code (A=65)" },
              { label:"ASCII lower",    val:String(d.ascii+32),        col:AMB,  desc:"Dec code (a=97)" },
              { label:"Hex upper",      val:"0x"+d.ascii.toString(16).toUpperCase(), col:CYAN, desc:"Hex representation" },
              { label:"Unicode upper",  val:"U+00"+d.ascii.toString(16).toUpperCase(), col:TEAL, desc:"Unicode code point" },
              { label:"Binary upper",   val:bin,                       col:GREEN, desc:"8-bit binary" },
              { label:"Numerology",     val:String(d.numerology),      col:VIO,  desc:"Positional value (A=1)" },
            ].map(({ label, val, col, desc }) => (
              <div key={label} style={{ padding:"8px 12px", borderRadius:8, border:`1px solid ${col}20`, background:`${col}07` }}>
                <div style={{ fontSize:9, fontWeight:700, color:col }}>{val}</div>
                <div style={{ fontSize:7, color:`${col}70`, letterSpacing:"0.1em", marginTop:3 }}>{label}</div>
                <div style={{ fontSize:7.5, color:MUT, fontFamily:SERIF, marginTop:3 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, col, sub, children }: { title:string; col:string; sub:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
        <div style={{ width:3, height:18, borderRadius:2, background:col, flexShrink:0 }} />
        <div style={{ fontSize:8, fontWeight:700, color:col, letterSpacing:"0.18em" }}>{title}</div>
      </div>
      <div style={{ fontSize:8, color:MUT, fontFamily:SERIF, marginBottom:10, lineHeight:1.5 }}>{sub}</div>
      {children}
    </div>
  );
}
