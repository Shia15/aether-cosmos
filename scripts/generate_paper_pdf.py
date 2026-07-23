#!/usr/bin/env python3
"""
Generate a formatted academic PDF of the AETHER Solar Physics paper.
Outputs: solar_physics_preprint.pdf
"""
import sys, re
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    KeepTogether, PageBreak, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── attempt to register a Unicode font; fall back to built-ins gracefully ──
UNICODE_FONT = "Helvetica"
UNICODE_FONT_BOLD = "Helvetica-Bold"
UNICODE_FONT_ITALIC = "Helvetica-Oblique"
SERIF = "Times-Roman"
SERIF_BOLD = "Times-Bold"
SERIF_ITALIC = "Times-Italic"

def safe(text):
    """Replace symbols that Latin-1 / built-in fonts can't handle."""
    replacements = {
        '\u0393': 'Gamma',  # Γ
        '\u03a9': 'Omega',  # Ω
        '\u03c1': 'rho',    # ρ
        '\u03a3': 'Sigma',  # Σ
        '\u03c8': 'psi',    # ψ
        '\u03ba': 'kappa',  # κ
        '\u03b1': 'alpha',  # α
        '\u03b2': 'beta',   # β
        '\u03b3': 'gamma',  # γ
        '\u03b4': 'delta',  # δ
        '\u03c4': 'tau',    # τ
        '\u03b7': 'eta',    # η
        '\u03bc': 'mu',     # μ
        '\u2011': '-',       # non-breaking hyphen
        '\u2012': '-',       # figure dash
        '\u2013': '-',       # en dash
        '\u2014': '--',      # em dash
        '\u00b1': '+/-',    # ±
        '\u00b2': '^2',     # ²
        '\u00b3': '^3',     # ³
        '\u2248': '~',      # ≈
        '\u2265': '>=',     # ≥
        '\u2264': '<=',     # ≤
        '\u221e': 'inf',    # ∞
        '\u2207': 'nabla',  # ∇
        '\u00b7': '*',      # ·
        '\u2192': '->',     # →
        '\u2190': '<-',     # ←
        '\u2194': '<->',    # ↔
        '\u00bd': '1/2',    # ½
        '\u00d7': 'x',      # ×
        '\u2260': '!=',     # ≠
        '\u2261': '=',      # ≡
        '\u00ae': '(R)',     # ®
        '\u2022': '*',      # •
        '\u2019': "'",       # right single quote
        '\u2018': "'",       # left single quote
        '\u201c': '"',       # left double quote
        '\u201d': '"',       # right double quote
        '\u2026': '...',     # ellipsis
        '\u00e9': 'e',      # é
        '\u00fc': 'u',      # ü
        '\u00e4': 'a',      # ä
        '\u0394': 'Delta',  # Δ
        '\u03c0': 'pi',     # π
        '\u03a6': 'Phi',    # Φ
        '\u2211': 'Sum',    # ∑
        '\u222b': 'Int',    # ∫
        '\u2202': 'd',      # ∂
        '\u00b0': 'deg',    # °
    }
    for orig, repl in replacements.items():
        text = text.replace(orig, repl)
    # Remove any remaining non-Latin-1 characters
    return text.encode('latin-1', errors='replace').decode('latin-1')

# ── styles ──
doc_styles = getSampleStyleSheet()

def make_styles():
    styles = {}
    base = dict(fontName=SERIF, leading=16, spaceAfter=8)

    styles['title'] = ParagraphStyle('title',
        fontName=SERIF_BOLD, fontSize=18, leading=24,
        alignment=TA_CENTER, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))

    styles['subtitle'] = ParagraphStyle('subtitle',
        fontName=SERIF_ITALIC, fontSize=13, leading=18,
        alignment=TA_CENTER, spaceAfter=4, textColor=colors.HexColor('#2d2d5e'))

    styles['author'] = ParagraphStyle('author',
        fontName=SERIF, fontSize=11, leading=16,
        alignment=TA_CENTER, spaceAfter=3)

    styles['affil'] = ParagraphStyle('affil',
        fontName=SERIF_ITALIC, fontSize=10, leading=14,
        alignment=TA_CENTER, spaceAfter=2, textColor=colors.HexColor('#555577'))

    styles['date'] = ParagraphStyle('date',
        fontName=SERIF, fontSize=10, leading=14,
        alignment=TA_CENTER, spaceAfter=0, textColor=colors.HexColor('#666688'))

    styles['section'] = ParagraphStyle('section',
        fontName=SERIF_BOLD, fontSize=13, leading=18,
        spaceBefore=18, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))

    styles['subsection'] = ParagraphStyle('subsection',
        fontName=SERIF_BOLD, fontSize=11, leading=16,
        spaceBefore=12, spaceAfter=4, textColor=colors.HexColor('#2d2d5e'))

    styles['body'] = ParagraphStyle('body',
        fontName=SERIF, fontSize=10.5, leading=16,
        alignment=TA_JUSTIFY, spaceAfter=8)

    styles['abstract_label'] = ParagraphStyle('abstract_label',
        fontName=SERIF_BOLD, fontSize=10, leading=14,
        alignment=TA_CENTER, spaceAfter=4, textColor=colors.HexColor('#1a1a2e'))

    styles['abstract'] = ParagraphStyle('abstract',
        fontName=SERIF_ITALIC, fontSize=10, leading=15,
        alignment=TA_JUSTIFY, leftIndent=36, rightIndent=36, spaceAfter=6)

    styles['keywords'] = ParagraphStyle('keywords',
        fontName=SERIF, fontSize=9.5, leading=14,
        alignment=TA_JUSTIFY, leftIndent=36, rightIndent=36, spaceAfter=12)

    styles['equation'] = ParagraphStyle('equation',
        fontName='Courier', fontSize=9.5, leading=14,
        leftIndent=48, rightIndent=48, spaceAfter=8,
        backColor=colors.HexColor('#f8f8f0'))

    styles['bullet'] = ParagraphStyle('bullet',
        fontName=SERIF, fontSize=10.5, leading=16,
        leftIndent=24, firstLineIndent=-12, spaceAfter=4,
        alignment=TA_JUSTIFY)

    styles['ref'] = ParagraphStyle('ref',
        fontName=SERIF, fontSize=9.5, leading=14,
        leftIndent=24, firstLineIndent=-24, spaceAfter=4)

    styles['note'] = ParagraphStyle('note',
        fontName=SERIF_ITALIC, fontSize=9, leading=13,
        textColor=colors.HexColor('#555555'), spaceAfter=6)

    styles['footer'] = ParagraphStyle('footer',
        fontName=SERIF_ITALIC, fontSize=8, leading=11,
        alignment=TA_CENTER, textColor=colors.HexColor('#888888'))

    return styles

def make_pdf(output_path):
    S = make_styles()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1.2*inch,
        rightMargin=1.2*inch,
        topMargin=1.1*inch,
        bottomMargin=1.1*inch,
        title="A Computational Cascade Model: Solar Luminosity to Epigenetic Coherence",
        author="Shia Miller",
        subject="Solar-biological coupling, thyroid coherence, epigenetic aging",
        creator="AETHER Framework / AetherLife.co",
    )

    story = []

    def p(text, style='body'):
        return Paragraph(safe(text), S[style])

    def sp(n=6):
        return Spacer(1, n)

    def hr(color='#ccccdd', thickness=0.5):
        return HRFlowable(width="100%", thickness=thickness,
                          color=colors.HexColor(color), spaceAfter=8, spaceBefore=4)

    # ═══════════════════════════════════════════════════════
    # TITLE PAGE
    # ═══════════════════════════════════════════════════════
    story += [
        sp(24),
        p("A Computational Cascade Model:", 'title'),
        p("Solar Luminosity to Epigenetic Coherence", 'title'),
        sp(6),
        p("With CUCA Formal Laws and Empirical Validation Framework", 'subtitle'),
        sp(18),
        hr('#aaaacc', 1.0),
        sp(10),
        p("Shia Miller", 'author'),
        p("AetherLife.co  ·  Cosmic Chaos Corporation\u2122", 'affil'),
        p("Hollidaysburg, Pennsylvania", 'affil'),
        sp(6),
        p("Preprint — June 2026  |  AETHER Framework v3.0  |  CUCA v4.1", 'date'),
        p("Correspondence: aetherlife.co  |  ORCID: 0009-0000-5537-1034", 'date'),
        sp(10),
        hr('#aaaacc', 1.0),
        sp(18),
    ]

    # ═══════════════════════════════════════════════════════
    # ABSTRACT
    # ═══════════════════════════════════════════════════════
    story += [
        p("Abstract", 'abstract_label'),
        p(
            "The AETHER Solar Physics Engine formalizes an 11-layer computational cascade "
            "linking solar electromagnetic activity to integrated biological disease risk. "
            "Beginning with the F10.7 solar flux index, the model propagates physical forcing "
            "through geomagnetic, oceanographic, endocrine, cellular, and systems-biology layers, "
            "terminating in a multiplicative coherence product Gamma*Omega*rho*Sigma that drives "
            "a nonlinear disease risk function Delta-R = (1 - Gamma*Omega*rho*Sigma)^1.8 * 100%. "
            "The four terminal biological axes -- neural coherence (Gamma), gut microbiome diversity "
            "(Omega), circadian rhythm amplitude (rho), and epigenetic clock integrity (Sigma) -- "
            "share a common upstream mediator: thyroid T3 availability, itself determined jointly "
            "by iodine supply (solar-geomagnetic-oceanographic origin) and selenium conversion "
            "efficiency (nutritional, solar-independent). The CUCA architectural framework governing "
            "the cascade is formalized through three named laws: the Reptilian Constraint "
            "(tau * B = const), the Universal Spacing Law (C(x,t) = f(d)), and the Cephalopod "
            "Edge Constraint (||E(t)|| increasing -> C(x,t) decreasing). Falsifiable predictions, "
            "empirical validation requirements, and an open research agenda are presented alongside "
            "an interactive simulation implementation.",
            'abstract'
        ),
        sp(4),
        p(
            "<b>Keywords:</b> solar-biological coupling, thyroid coherence, epigenetic aging, "
            "circadian rhythm, gut-brain axis, AETHER framework, CUCA architecture, coherence "
            "cascade, F10.7, iodine deficiency, selenium status, T3/rT3 ratio",
            'keywords'
        ),
        hr('#ccccdd'),
        sp(8),
        PageBreak(),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 1: INTRODUCTION
    # ═══════════════════════════════════════════════════════
    story += [
        p("1. Introduction", 'section'),
        p("1.1  The Disciplinary Gap", 'subsection'),
        p(
            "The relationship between solar electromagnetic activity and human biological health "
            "has been proposed across multiple independent research traditions -- from "
            "geomagnetic-psychiatric correlations (Persinger 1987) to solar cycle epidemiology "
            "(Halberg et al. 2000) to the iodine-oceanography literature (Delange 2002). "
            "What has been absent is a single mechanistic framework tracing the physical chain "
            "from stellar electromagnetic output to intracellular biology with explicit "
            "quantitative equations at each layer boundary."
        ),
        p(
            "Academic science has compartmentalized these observations across at least six "
            "disciplines that rarely communicate: solar physics, geophysics, physical "
            "oceanography, endocrinology, chronobiology, and epigenetics. The AETHER cascade "
            "is an explicit attempt to bridge these compartments with a single computational "
            "model -- not as a claim of final truth, but as a falsifiable working framework "
            "that can be progressively tested, refined, or falsified at each layer boundary."
        ),
        p("1.2  Central Thesis", 'subsection'),
        p(
            "Biological coherence -- defined operationally as the capacity of a living system "
            "to maintain high-fidelity signal processing across temporal and spatial scales -- "
            "is a measurable function of the solar electromagnetic environment, mediated through "
            "a specific cascade of physical and biochemical transduction steps. The cascade has "
            "a single critical bottleneck: thyroid T3 availability, which is co-determined by "
            "two partially independent variables:"
        ),
        p("   (1)  Iodine supply -- solar-geomagnetic-oceanographic origin, varying on 11-year solar cycle timescales.", 'bullet'),
        p("   (2)  Selenium status -- primarily nutritional, varying on dietary timescales, partially decoupled from solar forcing.", 'bullet'),
        sp(4),
        p(
            "This two-variable bottleneck structure produces a falsifiable prediction: populations "
            "with adequate selenium should show weaker solar-cycle-phase correlations with metabolic "
            "disease than selenium-deficient populations, because selenium adequacy 'clamps' the "
            "T3:rT3 ratio above the critical threshold regardless of iodine fluctuation."
        ),
        p("1.3  The CUCA Architectural Context", 'subsection'),
        p(
            "The AETHER cascade is a specific instantiation of the CUCA (Closed-Loop Universal "
            "Coherence Architecture) framework, which proposes that all stable biological systems "
            "are fundamentally feedback-stabilized coherence engines. CUCA formalizes three "
            "universal laws that govern the cascade's dynamics:"
        ),
        p("   *  <b>Reptilian Constraint:</b> tau * B = const -- the product of biological time constant (tau) and bandwidth (B) is conserved across evolutionary scales.", 'bullet'),
        p("   *  <b>Universal Spacing Law:</b> C(x,t) = f(d) -- coherence at any point is a function of spatial distance from the cascade source.", 'bullet'),
        p("   *  <b>Cephalopod Edge Constraint:</b> ||E(t)|| increasing implies C(x,t) decreasing -- environmental entropy degrades coherence; the relationship is nonlinear and threshold-gated.", 'bullet'),
        sp(8),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 2: PHYSICAL CASCADE
    # ═══════════════════════════════════════════════════════
    story += [
        p("2. The Physical Cascade (Layers 1-4)", 'section'),
        p("2.1  Layer 1: Solar Luminosity -- F10.7 Index", 'subsection'),
        p(
            "The solar F10.7 radio flux (10.7 cm wavelength, measured at Earth) is the standard "
            "operational proxy for solar activity, correlating r = 0.97 with sunspot number "
            "while being continuously measurable regardless of observing conditions. "
            "F10.7 ranges from ~65 sfu (solar minimum) to ~220+ sfu (solar maximum), a "
            "~3.4x variation. This variation propagates through all downstream layers."
        ),
        p("<b>Governing equation (Layer 1):</b>", 'note'),
        p("F10.7(t) = 65 + 155 * S * 1/2 * (1 - cos(2*pi*t / 11))     [sfu]", 'equation'),
        p(
            "where S in [0,1] is the solar activity parameter, t is time in years, and "
            "T_cycle = 11 years (Schwabe cycle). The solar forcing term uses a cosine "
            "to capture the observed bell-shaped solar maximum profile. "
            "Physical basis: F10.7 correlates with EUV (extreme ultraviolet) flux responsible "
            "for ionospheric heating and X-ray flux that drives geomagnetic preconditions."
        ),
        p("2.2  Layer 2: Solar Wind and Interplanetary Magnetic Field", 'subsection'),
        p(
            "The Parker spiral model predicts the IMF magnitude carried by the solar wind. "
            "Higher solar activity produces a denser, faster, more structured solar wind and "
            "a stronger IMF at 1 AU (e.g., ACE spacecraft data). The sqrt dependence reflects "
            "the sub-linear Parker spiral scaling. Solar wind speed v_sw ~ 400-800 km/s; "
            "dynamic pressure P_sw = (1/2)*rho*v^2 scales with B_sw during storm intervals."
        ),
        p("<b>Governing equation (Layer 2):</b>", 'note'),
        p("B_imf(t) = B_0 + k_imf * sqrt(F10.7(t) - 65)     [nT]", 'equation'),
        p(
            "Coronal mass ejections (CMEs) during solar maximum deliver 10^22-10^25 J "
            "into the magnetosphere over hours, driving geomagnetic effects that couple "
            "to atmospheric and oceanic circulation."
        ),
        p("2.3  Layer 3: Geomagnetic Activity -- Kp Index", 'subsection'),
        p(
            "The planetary Kp index (0-9 scale, 3-hour cadence) quantifies global geomagnetic "
            "disturbance driven by solar wind-magnetosphere coupling. Ring current injection, "
            "field-aligned currents, and auroral electrojet all contribute to the global Kp value."
        ),
        p("<b>Governing equation (Layer 3):</b>", 'note'),
        p("Kp(t) = Kp_0 * (B_imf(t) / B_0)^0.7                [0-9 scale]", 'equation'),
        p(
            "The sub-linear exponent (0.7) reflects saturation of magnetospheric response at "
            "high solar wind pressures. Critical coupling: atmospheric Joule heating from "
            "geomagnetic storms (proportional to Kp^2) deposits energy into the upper atmosphere, "
            "perturbing the polar vortex via stratosphere-troposphere interaction "
            "(Baldwin & Dunkerton 2001)."
        ),
        p(
            "<b>Note on speculation:</b> The stratospheric -> ocean upwelling coupling is the "
            "most speculative link in the cascade. The mechanism is physically plausible and "
            "multi-year correlations exist in proxy data, but a direct controlled study has "
            "not been conducted. This is flagged as a high-priority validation target.",
            'note'
        ),
        p("2.4  Layer 4: Ocean Upwelling", 'subsection'),
        p(
            "Thermohaline circulation and coastal upwelling systems bring cold, deep, "
            "iodine-rich water to the photic zone. These systems are wind-driven (Ekman "
            "transport) and respond to atmospheric circulation changes that, per Layer 3, "
            "couple to geomagnetic activity."
        ),
        p("<b>Governing equations (Layer 4):</b>", 'note'),
        p("psi(t) = psi_0 * (1 + k_up * delta_Kp(t))     [Sv, thermohaline component]", 'equation'),
        p("U_ek = -tau_w / (f * rho_w)                     [Ekman transport, m^2/s]", 'equation'),
        sp(8),
        PageBreak(),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 3: ENDOCRINE CASCADE
    # ═══════════════════════════════════════════════════════
    story += [
        p("3. The Endocrine Cascade (Layers 5-6)", 'section'),
        p("3.1  Layer 5: Marine Iodine -- Urinary Iodine Excretion (UIE)", 'subsection'),
        p(
            "Ocean upwelling brings dissolved inorganic iodide (I-) from the deep ocean to "
            "surface waters, where it is oxidized to IO3- and incorporated into marine aerosols "
            "by biological processes. Coastal populations receive a substantial fraction of "
            "their dietary iodine from seafood and marine aerosol deposition. "
            "Iodine status is measured operationally as urinary iodine excretion (UIE), "
            "a reliable proxy for recent intake (Delange 2002)."
        ),
        p("<b>Governing equation (Layer 5):</b>", 'note'),
        p("UIE(t) = UIE_0 * (1 + k_iod * (psi(t) - psi_0) / psi_0)     [microg/L]", 'equation'),
        p("3.2  Layer 6: Thyroid Hormone Axis -- T3 / Reverse T3 (rT3)", 'subsection'),
        p(
            "Iodine is the rate-limiting substrate for thyroid hormone synthesis. T4 "
            "(thyroxine) is produced in the thyroid gland and peripherally converted to "
            "the active form T3 (triiodothyronine) by selenoenzyme deiodinases (Type I: "
            "Berry et al. 1992; Type II). Selenium deficiency impairs this conversion, "
            "shunting T4 toward reverse T3 (rT3), which is biologically inactive and "
            "competitively blocks T3 receptors (Sinha et al. 2014)."
        ),
        p("<b>Governing equation (Layer 6):</b>", 'note'),
        p("T3_ratio(t) = T3(t) / rT3(t) = f(UIE(t), Se_status)", 'equation'),
        p("T3_eff(t) = T3_ratio(t) * Se_factor                 [normalized]", 'equation'),
        p(
            "The Se_factor captures the selenium-iodine interaction: at high selenium status, "
            "T3_eff is maintained above the critical threshold even during iodine-deficient "
            "periods (Weitzel & Iwen 2011). This is the mechanistic basis of the cascade's "
            "central falsifiable prediction."
        ),
        sp(8),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 4: CELLULAR ENERGETICS
    # ═══════════════════════════════════════════════════════
    story += [
        p("4. The Cellular Energetics Cascade (Layers 7-8)", 'section'),
        p("4.1  Layer 7: Mitochondrial ATP Production", 'subsection'),
        p(
            "Thyroid hormone (T3) is a primary regulator of mitochondrial biogenesis and "
            "oxidative phosphorylation efficiency. T3 upregulates expression of mitochondrial "
            "uncoupling proteins and cytochrome c oxidase subunits, directly setting the "
            "cellular ATP production rate (Weitzel & Iwen 2011)."
        ),
        p("<b>Governing equation (Layer 7):</b>", 'note'),
        p("ATP(t) = ATP_max * T3_eff(t) / (T3_eff(t) + K_T3)  [normalized]", 'equation'),
        p("4.2  Layer 8: Neural Coherence Gamma", 'subsection'),
        p(
            "Neural coherence (Gamma) is defined operationally as the spectral entropy of "
            "EEG gamma-band (30-80 Hz) activity, normalized to [0,1] where 1 = maximum "
            "coherence. ATP availability directly constrains Na+/K+ ATPase activity and "
            "therefore the magnitude of neural action potential gradients."
        ),
        p("<b>Governing equation (Layer 8):</b>", 'note'),
        p("Gamma(t) = Gamma_max * (ATP(t))^alpha_n              [0-1]", 'equation'),
        sp(8),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 5: EXTENDED BIOLOGICAL CASCADE
    # ═══════════════════════════════════════════════════════
    story += [
        p("5. The Extended Biological Cascade (Layers 9-11)", 'section'),
        p("5.1  Layer 9: Gut Microbiome Diversity Omega", 'subsection'),
        p(
            "Thyroid hormone status directly modulates gut microbiome composition and diversity "
            "(Farhangi et al. 2017). T3 regulates intestinal motility, bile acid metabolism, "
            "and tight junction integrity -- all of which shape the selective pressure on "
            "microbial communities. Microbiome diversity (Omega) is measured as Shannon "
            "entropy of 16S rRNA operational taxonomic unit counts."
        ),
        p("<b>Governing equation (Layer 9):</b>", 'note'),
        p("Omega(t) = Omega_0 * (1 + k_gut * (T3_eff(t) - T3_ref))  [0-1]", 'equation'),
        p(
            "The gut-brain axis (Donohoe et al. 2012) creates a bidirectional coupling: "
            "microbiome diversity affects short-chain fatty acid (SCFA) production, which "
            "feeds back to modulate neural coherence (Gamma) independently of the T3 pathway."
        ),
        p("5.2  Layer 10: Circadian Rhythm Amplitude rho", 'subsection'),
        p(
            "Circadian rhythm amplitude (rho) is quantified as the melatonin/cortisol "
            "amplitude ratio, normalized to [0,1]. T3 is a direct regulator of clock gene "
            "expression (BMAL1, CLOCK, PER1/2/3), and circadian disruption is independently "
            "associated with metabolic disease risk (Vetter et al. 2018)."
        ),
        p("<b>Governing equation (Layer 10):</b>", 'note'),
        p("rho(t) = rho_max * T3_eff(t) * exp(-k_cd * E_circadian)  [0-1]", 'equation'),
        p("5.3  Layer 11: Epigenetic Clock Integrity Sigma", 'subsection'),
        p(
            "Epigenetic clock integrity (Sigma) is measured via the Horvath methylation clock "
            "(Horvath 2013), which quantifies biological aging rate relative to chronological "
            "age. Sigma = 1.0 indicates biological age equals chronological age; "
            "Sigma < 1.0 indicates accelerated aging."
        ),
        p("<b>Governing equation (Layer 11):</b>", 'note'),
        p("dSigma/dt = -k_epi * (1 - Gamma*Omega*rho)           [per year]", 'equation'),
        sp(8),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 6: INTEGRATED DISEASE RISK
    # ═══════════════════════════════════════════════════════
    story += [
        p("6. Integrated Disease Risk Function", 'section'),
        p(
            "The four terminal biological coherence axes (Gamma, Omega, rho, Sigma) "
            "enter a multiplicative coherence product that drives the integrated disease "
            "risk function:"
        ),
        p("Delta-R(t) = (1 - Gamma(t) * Omega(t) * rho(t) * Sigma(t))^1.8 * 100%", 'equation'),
        p(
            "The exponent 1.8 captures the observed superlinear relationship between "
            "coherence loss and clinical disease risk: populations at ~80% coherence "
            "show approximately 2x the metabolic disease burden of populations at ~95% "
            "coherence, consistent with epidemiological data on solar cycle phase and "
            "myocardial infarction rates (Halberg et al. 2000)."
        ),
        p(
            "<b>Measurability:</b> Each of the four axes has a validated clinical proxy "
            "measurable in standard biobank data:"
        ),
        p("   *  Gamma: EEG spectral entropy (gamma band, 30-80 Hz)", 'bullet'),
        p("   *  Omega: 16S rRNA microbiome Shannon diversity index", 'bullet'),
        p("   *  rho: Melatonin/cortisol amplitude ratio (wrist actigraphy)", 'bullet'),
        p("   *  Sigma: Horvath DNA methylation clock (blood sample)", 'bullet'),
        sp(8),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTION 7: VALIDATION + LIMITATIONS
    # ═══════════════════════════════════════════════════════
    story += [
        p("7. Falsifiable Predictions and Validation Strategy", 'section'),
        p(
            "The AETHER cascade generates three tiers of falsifiable predictions, "
            "ordered from most to least testable with currently available data:"
        ),
        p("   <b>Tier 1 (Testable now):</b> T3:rT3 ratio should correlate with urinary iodine excretion in existing biobank datasets (NHANES, UK Biobank), with the correlation attenuated by selenium status.", 'bullet'),
        p("   <b>Tier 2 (Testable within 5 years):</b> Solar cycle phase (F10.7) should predict coastal population-level UIE variation with an ~2-3 year lag, detectable in WHO iodine surveillance data.", 'bullet'),
        p("   <b>Tier 3 (Requires new study design):</b> A prospective cohort measuring all four coherence proxies (Gamma, Omega, rho, Sigma) at solar minimum vs. solar maximum should show statistically significant differences in Delta-R in iodine-deficient coastal populations.", 'bullet'),
        sp(6),
        p("<b>Acknowledged Limitations:</b>", 'subsection'),
        p(
            "The stratospheric-to-ocean coupling (Layer 3 -> Layer 4) is the most speculative "
            "step and requires dedicated validation. The multiplicative coherence product assumes "
            "independence of the four axes, which is likely an oversimplification given the known "
            "gut-brain bidirectional coupling. The exponent 1.8 in the disease risk function is "
            "an empirical fit and not derived from first principles. All quantitative parameters "
            "require empirical calibration against actual biobank data before the model should "
            "be used for clinical or policy recommendations."
        ),
        sp(8),
        PageBreak(),
    ]

    # ═══════════════════════════════════════════════════════
    # REFERENCES
    # ═══════════════════════════════════════════════════════
    story += [
        p("References", 'section'),
        hr('#ccccdd'),
        sp(4),
        p("[1]  Baldwin, M.P., & Dunkerton, T.J. (2001). Stratospheric harbingers of anomalous weather regimes. <i>Science</i>, 294(5542), 581-584.", 'ref'),
        p("[2]  Berry, M.J., Banu, L., & Larsen, P.R. (1992). Type I iodothyronine deiodinase is a selenocysteine-containing enzyme. <i>Nature</i>, 349(6308), 438-440.", 'ref'),
        p("[3]  Delange, F., et al. (2002). Iodine deficiency in the world: where do we stand at the turn of the century? <i>Thyroid</i>, 12(6), 523-527.", 'ref'),
        p("[4]  Donohoe, D.R., et al. (2012). The microbiome and butyrate regulate energy metabolism and autophagy in the mammalian colon. <i>Cell Metabolism</i>, 13(5), 517-526.", 'ref'),
        p("[5]  Farhangi, M.A., et al. (2017). The effects of thyroid hormone on intestinal permeability and gut microbiome. <i>Biomedicine & Pharmacotherapy</i>, 95, 1609-1615.", 'ref'),
        p("[6]  Halberg, F., et al. (2000). Cross-spectrally coherent ~10.5- and 21-year biological and physical cycles, magnetic storms and myocardial infarctions. <i>Neuroendocrinology Letters</i>, 21(3), 233-258.", 'ref'),
        p("[7]  Horvath, S. (2013). DNA methylation age of human tissues and cell types. <i>Genome Biology</i>, 14(10), R115.", 'ref'),
        p("[8]  Persinger, M.A. (1987). Geopsychology and geopsychopathology: Mental processes and disorders associated with geochemical and geophysical factors. <i>Experientia</i>, 43(1), 92-104.", 'ref'),
        p("[9]  Sinha, R.A., et al. (2014). Thyroid hormone regulation of hepatic lipid and carbohydrate metabolism. <i>Trends in Endocrinology & Metabolism</i>, 25(10), 538-545.", 'ref'),
        p("[10] Vetter, C., et al. (2018). Night shift work, genetic risk, and type 2 diabetes in the UK Biobank. <i>Diabetes Care</i>, 41(4), 762-769.", 'ref'),
        p("[11] Weitzel, J.M., & Iwen, K.A.H. (2011). Coordination of mitochondrial biogenesis by thyroid hormone. <i>Molecular and Cellular Endocrinology</i>, 342(1-2), 1-7.", 'ref'),
        sp(18),
        hr('#ccccdd', 0.5),
        sp(4),
        p("Shia Miller  |  AetherLife.co  |  Cosmic Chaos Corporation(TM)  |  Hollidaysburg, PA  |  Preprint v3.0, June 2026", 'footer'),
        p("AETHER framework and CUCA architecture -- all rights reserved. Not peer reviewed. Submitted for priority timestamp.", 'footer'),
    ]

    doc.build(story)
    print(f"PDF written to: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "solar_physics_preprint.pdf"
    make_pdf(out)
