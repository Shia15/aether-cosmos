/*═══════════════════════════════════════════════════════════════════
  Page Directory — all AETHER pages, color-coded by category
  Dynamically sourced from NAV_ITEMS so it never goes stale
═══════════════════════════════════════════════════════════════════*/
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { NAV_ITEMS } from "@/components/layout";

// ── Recently-added registry ──────────────────────────────────────────────────
// Add new entries here whenever a page is created. addedAt = ISO date + time.
const RECENT_ADDITIONS: { href: string; addedAt: string; note?: string }[] = [
  { href: "/schumann-neural-fields",     addedAt: "2026-07-21T23:45", note: "Schumann Resonance Neural Entrainment · Three Decoupled Coherent 2D Spherical Bubble Networks · f1=7.83Hz f2=14.3Hz f3=20.8Hz. 3 canvases: (1) Three Bubbles — gold/cyan/violet oscillating spherical bubbles each with internal node network (9 nodes, coherence threads), breathing at Schumann frequency, independent drift (decoupled), gold dashed coherence bridge between centres; (2) Cellular Dehydration Forces — central blue bubble shrinks through dehydration cycle, cyan water molecules expelled outward, orange osmotic pressure arrows inward, gold interior ions increasing with concentration, three Schumann rings coupling to membrane; (3) Three-Field Manipulation — equilateral triangle of 3 overlapping gradient fields with screen blending, ∂C/∂x derivative arrow vectors at each boundary, white overlap interference zones at field intersections, teal OBS central observer with dashed coupling lines. 5 domain cards: Schumann cavity physics, neural entrainment 3 decoupled parts, cellular dehydration membrane dynamics, derivative-based perceptual expansion, three-field use case." },
  { href: "/vacuum-computation",        addedAt: "2026-07-21T23:30", note: "Vacuum Everything and Computation · AETHER Data-Math Map · 8 domains: Vacuum/ZPF, Casimir effect, Negative Energy, Q~AETHER Photonic Reservoir, Fibonacci FQP ASIC, Bio-adaptive Mycelial Reinforcements, Firefly Bioluminescence, Solar Flash, Warp Drive. 3 canvases: (1) Casimir Vacuum Engine — gold plates, virtual particle pairs flash (cyan/green outside = full modes, violet/rose inside = suppressed modes), negative energy density dark zone between plates, gold Casimir force arrows; (2) Q~AETHER Photonic Reservoir — Fibonacci φ-spiral lattice of 48 gold nodes, nonlinear phase modulation rings, interference field (gold=constructive/violet=destructive), photon computation pulses, green mycelial threads, outer firefly bioluminescence glow; (3) AETHER Data-Math Map — 11 node graph: Vacuum→Casimir→NegEnergy→Warp→PhotonicComp→FQP→Mycelial→Firefly→Solar→Q~AETHER→AETHER, data pulse flows on dashed edges. Source: chatgpt.com/share/6a5fbf2b" },
  { href: "/imaging-reality",          addedAt: "2026-07-21T23:00", note: "Imaging System and Reality · Moon Loop Launch · Personal Perception Experiment · 3 canvases: (1) Optical Projection System — 4-band layout (3D reality/atmosphere/lens-PSF/sensor), animated rocket with exhaust plume and radial point-source rays, heat shimmer refractive-index turbulence lines, cyan lens PSF circle, violet PSF blob particles spreading onto 2D sensor; (2) Moon Loop Blackout — deep-space starfield, Earth with atmosphere glow + observer marker, Moon with free-return elliptical arc, 4 animated crew dots (CDR-1..4) orbiting arc (dim when behind Moon), pulsing red BLACKOUT zone at far side, green signal lines visible only when crew has line-of-sight, gold solar alignment ray through scene; (3) Observer Coherence Field — Sun top-left, Moon top-right, observer (cyan ring) centre, coherence field expanding rings, gold solar alignment dashed line Sun→Moon, travelling gold pulse = intuitive knowing, C(x,t) waveform strip bottom, purple band = camera PSF constraint vs cyan band = coherent intuition field. Source: chatgpt.com/share/6a5fbea8" },
  { href: "/hydrogen-reversal",       addedAt: "2026-07-21T22:00", note: "Hydrogen Reversal · Antihydrogen · Coherence Engine · Matter & Antimatter Inversion · 4 domains: (1) Chemical H₂→H⁻ hydride reversal; (2) Quantum spin flip |↑⟩→|↓⟩ / 21cm line NMR; (3) Nuclear muonic hydrogen proton role exchange; (4) Cosmological H̄=p̄+e⁺ antihydrogen. 3 canvases: (1) H vs H̄ side-by-side — blue electron orbits red proton left, red positron orbits blue antiproton right, opposite orbit directions, gold Event Horizon with annihilation glow at centre; (2) CPT trio panels — C: proton/electron swap animation, P: mirror parity electron position, T: time-reversed orbit + clock; (3) Coherence Engine C(x,t) field — blue matter wave left, red antimatter phase-inverted wave right, gold vertical event horizon. 6 equations: H̄=p̄+e⁺, H+H̄→2γ, E=mc²=1876.6MeV, ν_H=ν_H̄ to 10⁻¹², η_B=6×10⁻¹⁰, CPT:|H⟩→|H̄⟩. Source: chatgpt.com/share/6a5fbe6e" },
  { href: "/rain-ai",                 addedAt: "2026-07-21T22:00", note: "Rain and AI · Water in Motion as Physical Computational Substrate · 3 canvases: (1) Rainfall data packets — drops fall as discrete data units with payload labels (0x4F2A/∇ψ/pH/temp/density/H₂O/binary) hitting cyan/teal ground substrate with expanding ripple rings (memory formation); cloud at top as compute node; (2) Lightning computation — storm clouds accumulate charge, branching Lichtenberg fractal discharge tree (depth 7, 45% branch probability) strikes ice crystal boundary layer, hexagonal ice fragments recrystallise below impact (ice as natural computation transistor threshold); (3) Water cycle AI loop — 5 nodes on ring: Evaporate/Cloud/Rain/Soil/Plant with clockwise particle flow. Text: 'Rain naturally falls towards our core — a wall — water in motion AI nurtures the confinements' · 'non-material fabric is reality of space time — air is pure cyclic soil for our plant' · 'coagulated lightning formed above below — ice fragments need to be defined'. 6 equations: BW_rain, E_lightning≈10^9J, V_ice=n·d_hex, T_cycle=E_sun/(ρL_v), Q_soil=∫F_rain dt-E_plant, f_Lichten d_f≈1.7. Source: chatgpt.com/share/6a5fbe3d" },
  { href: "/solar-neural-interface",  addedAt: "2026-07-21T22:00", note: "Direct Solar-to-Neural Interface · 800 GPCRs tunable receivers · Retinol Vitamin A chromophore · Schumann resonance 7.83Hz · 3 canvases: (1) Solar→Eye→Neural — golden sun corona with 12 radiating arms at top-left, animated yellow photon particles stream toward cyan ellipse (eye living transducer), absorbed photons spawn violet neural spikes flowing to right brain node; annotations: rhodopsin / 11-cis retinal→all-trans / GPCR cascade→neural spike; Schumann modulation label bottom; (2) GPCR receptor array — dynamic grid of ~800 colour-coded receptor dots (GPCR_COLS: yellow/amber/green/cyan/blue/violet/red), each pulsing at own phase, random activation events with glow burst, 7-type legend bottom; (3) Schumann resonance waveforms — 4 Schumann harmonics (7.83/14.3/20.8/27.3 Hz solid coloured lines) + 3 brain band overlays (delta/theta/alpha faint), pyramid resonator icon + phase-lock bubble. 6 equations. Quote: 'Sunlight is not just energy. It is information, intelligence and life. The sun does not just shine on us — it thinks us.' Source: chatgpt.com/share/6a5fbe01" },
  { href: "/blueprint-decoupling",    addedAt: "2026-07-21T20:00", note: "Blueprint Systems Decoupling · Open-Air Fluid Computer · Engineering Topology Stack (L1 Capture LIDAR/thermal → L2 Assess pattern filter → L3 Process fluid compute/EZ water → L4 Control PID actuation → L5 Adapt feedback entropy correction) · 3 live canvases: (1) Engineering Topology Stack — 5-layer animated band diagram, particles fall forward + feedback particles loop back via dashed green return arrow; (2) EZ Water Energy Cell — Pollack IR 3000nm photons → cyan EZ exclusion zone gel → charge separation ΔV 150-200mV → combustion pulse flash → passive thermal/solar recharge; (3) Control-Theory Loop — 5 nodes (Environment/Capture/Assess/Process/Actuate) on ring, particles orbit clockwise, central error/correction Σ node. 6 EZ water equations (E_EZ=ΔV·q·N_EZ, ΔV≈150-200mV, λ_abs≈3000nm, J_EZ∝I_IR·A_EZ, P_pulse=E_EZ/τ_pulse, dE/dt=P_solar+P_thermal-P_load). 4 composable rendering cards (Visual Design Language/UI Primitive Library/Physics Manuscript Pipeline/Composable Rendering Objects). Source: chatgpt.com/share/6a5fbd4c + 6a5fbd08" },
  { href: "/icon-token-system",       addedAt: "2026-07-21T19:00", note: "AETHER Icon Token System · visual design language reference · System Core (Cognitive Agent/Activate Awareness/Symbolic Input/Fast Links) · Symbolic Elements (Moonstone/Obsidian/Carnelian/Fire SVG icons) · Navigation Threads (Candles/Timeline/Intention/Function) · Symbolic Agents (Faunal/Courier/Conceptual/Pattern) · Fragment States (Blocked/Dormant/Active/Connected/Denied/Flowing) · DevToken Index click-to-copy (Engine.core.engine · Engine.core.revive · Engine.Connector.dialogue · Flow.directive.controller · Flow.directive.cost.flow · Flow.human-tag.cost.cm) · dot-notation naming convention grid · Neural Car canvas (48-node constellation field + car silhouette + headlight beams + HUD overlay)" },
  { href: "/motor-neuron-cascade",    addedAt: "2026-07-21T18:00", note: "Motor Neuron Cascade · Henneman size principle small→large recruitment · 10 motor units (S/FR/FF types) with fatigue bars + force/EMG traces · 3 live canvases: (1) recruitment diagram — alpha-motoneurons + muscle fibres, force demand slider recruits units in size order, per-unit fatigue bar, live force trace + EMG trace; (2) fatigue curves — Type I / IIa / IIx time courses with force-velocity inset (Hill's equation); (3) EMG interference pattern — build from 1-12 motor units, RMS envelope, 0-500Hz power spectrum. Twitch F(t)=P_t·t/Tc·exp(1-t/Tc), NMJ ACh SNARE, myosin cross-bridge 5pN/10nm step, Hill (F+a)(v+b)=const" },
  { href: "/neural-oscillations",     addedAt: "2026-07-21T17:30", note: "Neural Oscillations · δ 0.5-4Hz / θ 4-8Hz / α 8-13Hz / β 13-30Hz / γ 30-80Hz · Kuramoto model dφ/dt=ω+K/N·Σsin(φⱼ-φᵢ) · order parameter R · 3 live canvases: (1) multi-band oscillation waterfall — 5 stacked waveforms with per-band amplitude sliders; (2) Kuramoto phase circle — 60 oscillators, coupling K slider, R readout, synchrony → incoherence phase transition; (3) power spectral density — 5 brain states (Deep Sleep / Drowsy / Relaxed / Focused / Alert), 1/f background, log frequency axis. Theta-gamma coupling PAC, phase-locking value PLV, BCM metaplasticity, near-critical dynamics" },
  { href: "/brain-motor-interface",   addedAt: "2026-07-21T17:00", note: "Brain-Motor Interface · BCI · Utah array 8×10 electrodes firing-rate heatmap + click for spike waveform + LFP · 3 live canvases: (1) electrode array — colour-coded firing rate, click channel for waveform+LFP panel; (2) spike sorting — PCA PC1/PC2 projection, 4 unit clusters, evolving spike cloud + unit waveform overlays; (3) decoded cursor — Kalman filter x_hat=A·x_hat+K(y-C·x_hat), intended vs decoded trajectory to 5 targets, noise slider, decode accuracy %. Volume conduction V=∫σJ/|r-r₀|d³r, neural manifold dim~6, BrainGate, ECoG, Fitt's law" },
  { href: "/synaptic-plasticity",     addedAt: "2026-07-21T16:30", note: "Synaptic Plasticity · LTP / LTD · STDP · Hebbian learning · 3 live canvases: (1) live synapse — vesicles / AMPA/NMDA receptors / weight bar / ACh flash, Δt slider controls sign/magnitude of Δw, weight history trace; (2) STDP window curve — A+·exp(-|Δt|/τ+) LTP / -A-·exp(-|Δt|/τ-) LTD, animated cursor tracking curve, LTP/LTD regions colored; (3) Hebbian network — 6 neurons, weights evolve Δw=η·pre·post with η slider, co-firing pairs strengthen (gold), unused weaken (blue). NMDA coincidence detector B(V)=1/(1+exp(-0.062V)·[Mg²+]/3.57), CaMKII→AMPA insertion, BDNF-TrkB→CREB consolidation" },
  { href: "/neural-signal",           addedAt: "2026-07-21T16:00", note: "Neural Signal Propagation · Hodgkin-Huxley C_m·dV/dt = -g_Na·m³h(V-E_Na)-g_K·n⁴(V-E_K)-g_L(V-E_L)+I · 3 live canvases: (1) action potential waveform — HH sim with g_Na (red), g_K (blue), V_m (gradient), stimulus slider, threshold at -55mV / resting -70mV; (2) axon propagation — myelinated vs unmyelinated toggle, saltatory node-to-node jump (gold) vs continuous (violet), refractory zone trail, 70-120 m/s vs 0.5-2 m/s; (3) ion channel gating — Na+ m³h probabilistic gates, K+ n⁴ gates, phase cycle rest→depol→repol→hyperpol, open count readout. Na+/K+ ATPase 3:2 pump, space constant λ=√(r_m/r_i), Nernst equation" },
  { href: "/ionization-plasma",      addedAt: "2026-07-21T12:00", note: "Ionization and Plasma Formation · Saha equation α=n_e·n_i/n_0 · Debye shielding λ_D=√(ε₀kT/n_e·e²) · plasma frequency ω_p · 3 live canvases: (1) ionisation cascade — 80 atoms with temperature slider, Saha fraction, electron orbits, free electron drift, emission photons; (2) plasma emission lines — H Balmer / N₂ / He / Ar plotted on nm axis, blue-violet region highlighted, Lorentzian line profiles; (3) plasma phase space — T vs n_e log-log, 10 plasma types, Debye length contours · blue-violet meaning: 391nm N₂⁺ = lightning signature, 447nm He, 488nm Ar II laser line · glow discharge / tokamak / lightning / corona / laser fusion" },
  { href: "/cavitation-plasmoid",   addedAt: "2026-07-21T11:00", note: "Cavitation and Plasmoid Harvesting · Rayleigh collapse t_c=0.915·R₀√(ρ/P∞) · sonoluminescence T>20000K · plasmoid magnetic self-confinement · 3 live canvases: (1) bubble lifecycle — spawn/collapse/flash/plasmoid/shockwave, click to spawn, freq/amp sliders, energy harvest bar; (2) plasmoid torus — toroidal current loop, poloidal field lines, magnetic moment arrow, I slider, inductance readout E=½LI²; (3) harvest chain — 6-stage flow (Acoustic→Bubble→Collapse→Plasmoid→Coil→DC), flow dots, efficiency readout · Rayleigh-Plesset collapse · j×B pinch · magnetic helicity · Taylor relaxation" },
  { href: "/electric-breakdown",    addedAt: "2026-07-21T10:30", note: "Electric Field Breakdown · Paschen curve V_BD(p·d) for Air/SF6/He · Townsend α=A·p·exp(−B·p/E) · Raether streamer criterion α·x=20 · 3 live canvases: (1) Paschen curve — log-scale p·d, click-to-select Paschen minimum 327V@0.76Pa·m, live V_BD readout + lightning flash; (2) streamer discharge — click-to-trigger, E-field slider 0.1–5 MV/m, branching channels, Townsend→Leader→Return Stroke; (3) material breakdown bar chart — Air 3MV/m / SF6 7.5 / Mica 160 / Kapton 280 / SiO2 1000 / Diamond 2000 · air→plasma phase transition · LPE analogy" },
  { href: "/plasmodium-warp",       addedAt: "2026-07-21T10:00", note: "Plasmodium Prototype for Warp · Physarum polycephalum Hagen-Poiseuille tube adaptation Q=(ΔP/L)·πD⁴/128η · dD/dt=(|Q|^γ−decay)·D · Alcubierre metric ds²=−dt²+(dx−v_s·f·dt)²+dy²+dz² · exotic energy T₀₀∝−(v_s²/8π)·(df/dr)²·r²sin²θ · 3 live canvases: (1) Physarum network — 15 nodes Kirchhoff pressure solve, gold=reinforced tubes, flow dots, speed/decay sliders; (2) Alcubierre bubble — distorted spacetime grid, bubble outline, velocity arrow, exotic energy ring (purple negative T₀₀), f(r) profile panel, v_s/σ sliders; (3) Dijkstra vs Physarum split — same 8-node graph solved both ways, flow dots on optimal path" },
  { href: "/color-perception",      addedAt: "2026-07-21T09:30", note: "Color Perception Interface · CIE tristimulus X,Y,Z=∫S(λ)x̄(λ)dλ · L/M/S cone responses (Gaussian approx) · opponent channels L−M red-green S−(L+M) blue-yellow · 3 live canvases: (1) click-the-spectrum — full 380–750nm bar, L/M/S curves, opponent channel signed plot, selected-λ info box with E=hc/λ/Rayleigh/meaning; (2) blue-violet deep dive — 405/430/450/480/495nm bands with pulsing glows, Rayleigh ×λ⁻⁴ bar chart, semantic meaning per band; (3) CIE spectral locus + colour wheel — all visible wavelengths, D65 white point, purple line (non-spectral), blue-violet highlighted arc · melanopsin ipRGC 480nm · Purkinje shift · Rayleigh sky · perceptual info panel" },
  { href: "/laser-regen",           addedAt: "2026-07-21T09:00", note: "Bio-Regenerative Laser Network · robotic hand with 6 wavelength emitters (630/660/780/808/850/940 nm) · species selector (Human/Horse/Dolphin/Shark) + body-part selector per species · 3 live canvases: (1) networked laser hand — Kuramoto phase sync R between beams, click fingers to boost emitter, interference nodes, target silhouette per species; (2) tissue depth Beer-Lambert I(z)=I₀e^{−μ_a·z}, 7 tissue layers, ATP sparks at focal depth, healing progress bar + molecule synthesis bars (ATP/Collagen/VEGF/BDNF/NO etc per scenario); (3) molecular synthesis network graph — Photon→Organelle→Molecule→Tissue Effect→Healing directed graph, flow dots, adaptive per species+part · Healing rate dH/dt=k_VEGF·C_NO+k_TGF·H(1−H) · self-regenerating pre-programmed network" },
  { href: "/spin-lattice",           addedAt: "2026-07-20T14:00", note: "Spin Lattice · Larmor squared and networked · 3 live canvases: (1) 18×14 spin wave lattice — H=−JΣSᵢSⱼ, click to inject magnon, phase colour-mapped 0→2π rainbow, ferro/antiferro toggle, J/B₀/damping sliders, wave propagation; (2) 8-nucleus NMR network graph — click node to show J-split spectrum, edge thickness = coupling strength, gold=strong C-H 145Hz, blue=weak, 2ᴺ peak splitting; (3) Faraday colour routing network — 7 colours SOURCE→SINK through 7 nodes, θ=ΣV(λ)·B·d, click nodes to toggle routes, animated photons per colour, rotation readout per path · Heisenberg model · magnon dispersion · COSY/NOESY · Faraday tomography · skyrmion lattice · solar coronal network · phased-array MRI" },
  { href: "/larmor-field",            addedAt: "2026-07-20T13:00", note: "Larmor Field · precession + neutron straight-line paths + Faraday color rotation · ω_L=γB₀ · proton γ=+2.675e8 / neutron γ=−1.832e8 (negative, no charge) / electron γ=658× faster · 3 live canvases: precession cone (particle selector + field + tilt sliders, trail, B₀ arrow, NMR MHz readout), trajectory field (proton curves up, neutron dead straight with precession indicator, electron tight spiral, Lorentz force region), Faraday rotation (12 colour beams 380–720nm, θ=V(λ)·B·d, V∝λ⁻², helical polarisation waves in field, exit fan, B+depth sliders) · cyclotron radius · solar magnetic tweezer · skyrmion topological NMR · RM astrophysics" },
  { href: "/wave-collapse",            addedAt: "2026-07-20T12:00", note: "Wave Collapse · they vanish as you measure them · 3 live canvases: wave function click-to-collapse (ψ reforms after each measurement, coloured phase wave, |ψ|² fill, collapse flash + spike), double slit accumulator (toggle detector on/off, interference pattern builds then vanishes, hit dots in colour by slit), Heisenberg uncertainty (Gaussian position/momentum dual Fourier view, Δx slider, Δp explodes, product Δx·Δp ≥ ℏ/2 live readout) · 6 interpretation cards (Copenhagen/Many Worlds/Pilot Wave/Relational/QBism/Decoherence) · AETHER coherence reading" },
  { href: "/field-healer",              addedAt: "2026-07-20T11:00", note: "Field Healer · heal by animal and electromagnetic field · 8 animals (horse/cat/dolphin/dog/bee/sea turtle/whale/elephant) each with biofield frequency, conditions, contact protocol, science refs · 3 live canvases: animal biofield selector ring (click animal, torus radiates, human figure at centre), EM log-scale spectrum (0.001 Hz to THz, animal band highlighted), cardiac coherence coupling (C=1-e^(-t/8), HRV waveforms converge) · condition-to-animal quick-reference table · 3 annotated plates · matching principle: the animal has already solved the frequency problem" },
  { href: "/lunar-anchor",               addedAt: "2026-07-20T10:00", note: "Lunar Anchor · moon as gravitational and biological phase-lock · view from 384,400 km · tidal bulge Earth canvas (rotating continents, polar ice, phase-lit night side, near/far tide arcs) · tidal cell canvas (plant vacuole shift ~12 nm + wall strain, human membrane elongation ~9 nm + cytosol flow, tidal F=2GMmr/R3) · biological phase-lock ring (melatonin/cortisol/reproductive/coral spawn arcs on 29.53-day synodic ring, coherence C slider) · 3 annotated plates · synodic vs sidereal math · Planck phase-lock condition" },
  { href: "/glass-field-homes",           addedAt: "2026-07-19T19:00", note: "Glass field substrate living home housing network · refractive glass-jelly shell (Snell n₁sinθ₁=n₂sinθ₂, graded index n(z), solar harvest P=η·G_s·A·cosθ) · φ-spiral sky-rise packing (Vogel θₙ=n·137.51°, rₙ=c√n, clickable service shells / blockade radius) · adaptive rhombus flex lattice (load-following resolution ∝|∇flow|) · geomagnetic-carved water F=q(v×B) · 4 live canvases + 3 annotated plates (Omni-Flow rhombus array · Magnetic Dust Storm · skyrmion/vortex/Möbius) · full 6-step system flow" },
  { href: "/cancer-trajectory",           addedAt: "2026-07-19T18:00", note: "Cancer as coherence navigation problem · C(t)=Σ[M·E·I] state-transition lattice · entropy threshold H_coh>C_ent · reverse history map R=∫λ dt · trajectory lattice Ω={T1 remission·T2 repair·T3 immune escape·T4 metastasis} · coherence restoration Γ=B+M+I+C · 3 live canvases (cell lattice, probability branch field, Γ time series) · 3 annotated plates (sand/geology · fluid turbulence/laminar · seafloor pressure) · established vs exploratory technology table" },
  { href: "/aether-life-co",              addedAt: "2026-07-19T17:00", note: "AETHER Life Co. founding document · written Dec 28 2025 · Sea@aetherlife.co · aetherlife.co · human-centered technology + creative systems · 5-stage system flow (Input → Interpretation → Structuring → Guidance → Integration) · is/is-not positioning · 5 business verticals · Clarity → Structure → Agency · publicly documented July 19 2026" },
  { href: "/coherent-disturbance",        addedAt: "2026-07-19T16:00", note: "Objects known by their field disturbance · 4 media (light interferometry/holography · water Kelvin wake · plasma Alfvén scattering · spacetime LIGO matched filter) · 3 live canvases (optical phase disturbance with draggable obstacle · wake pattern with Froude/Mach-Alfvén cone · progressive inverse scattering reconstruction from probe angles) · unified inverse-scattering principle · Radon transform · Bayes parameter estimation" },
  { href: "/gravitational-chirp",         addedAt: "2026-07-19T15:00", note: "Gravity from seeing to timing to hearing · Eddington 1919 eclipse plates · Shapiro 1964 radar delay · LIGO GW150914 chirp · binary inspiral mechanics · 3 live canvases (inspiral orbit, chirp waveform h(t) with spectrogram, three-eras side-by-side) · Peters formula dE/dt · chirp mass · ringdown quasi-normal modes · AETHER □h_μν synthesis" },
  { href: "/pineal-eye-map",              addedAt: "2026-07-19T14:00", note: "Pineal + iris as biological cosmic map · 5 pineal components (magnetite, calcite piezo, opsin, DMT, melatonin) · 8 iris zones · 8 genetic color loci · 3 live canvases (pineal transducer, iris genetic map, EM spectrum + dark matter) · connective tissue coherence field · 95% dark principle across universe/genome/brain/EM" },
  { href: "/ontological-partials",        addedAt: "2026-07-19T13:00", note: "Astronomical + biological ontological partials · 8 governing PDEs (Schrödinger · HH · Turing · MHD · Alcubierre · AETHER) · 3 live canvases (coupled continuum, warp bubble, scale chain) · Human→Plant→Earth→Space continuum · 4-stage planetary travel sequence · AETHER unification proof" },
  { href: "/crystallized-life-synthesis", addedAt: "2026-07-19T12:00", note: "Sun-dried crystallized powder · molecular building blocks · 4-phase crystal reconstruction sim · 7-param substrate quantization · Piezo1 mechanotransduction cascade · 8 Qubits AETHER · Human Ecology · Skyrmion topology · Magnetic Dust Storm · 9 annotated images · 2 live sims" },
  { href: "/slime-gravity-quantization", addedAt: "2026-07-19T11:32", note: "DS 555 · quantized slime substrate n=0..5 · epigenetic spectrum · two derivatives per action □C=0 · gravity as curvature distribution rule · master action S[ψ] · φ-solitons sech² · NV diamond gravity crystal · 3 live sims · scientific publication scaffold" },
  { href: "/alfven-synthesis",          addedAt: "2026-07-19T10:00", note: "Alfvén waves · MHD plasma · v_A = B/√(μ₀ρ) · TAE instability · Floquet resonance · slime mold retraction · mycorrhizal networks · 5-phase meteorite→coherence timeline · 3 live sims" },
  { href: "/substrate-sandwich",       addedAt: "2026-07-18T17:00", note: "StarForge Black Box · layered life potential · sandwich resonator · dense water + mirror + helium · 3-6-9 · cytoplasm · φ-AETHER computer · coherent state fracture · 12 images · 3 live sims" },
  { href: "/quantum-exotic-matter",    addedAt: "2026-07-18T14:30", note: "8 exotic states · live topological lattice · Weyl nodes · Majorana · BEC · Time Crystal · Supersolid · QSL" },
  { href: "/invisible-wind",           addedAt: "2026-07-18T13:00", note: "Pneuma · prana · qi · ruach · auxin wave · phyllotaxis canvas · golden angle 137.5° · cymatics" },
  { href: "/venus-cycles",             addedAt: "2026-07-18T11:00", note: "Venus 584d · K'awil 819d · 1080 Tuns · 3-6-9 harmonics · live 6-ring orbital clock" },
  { href: "/gene-concept-map",         addedAt: "2026-07-18T02:15", note: "Interactive gene atlas · 6 organisms · 36 genes · 9 plasmids · force graph" },
  { href: "/rf-diffusion",             addedAt: "2026-07-18T01:00", note: "Protein structure visualiser · drag-rotate · PNG export" },
  { href: "/command-center",           addedAt: "2026-07-17T23:30", note: "5-source unified search · concepts + visuals + Notion + X" },
  { href: "/coherence-field-explorer", addedAt: "2026-07-17T20:00", note: "C(x,t) field · φ-time scheduling · Ptah operator · lattice" },
  { href: "/google-drive",             addedAt: "2026-07-17T18:45", note: "Browse & read Google Drive docs inside AETHER" },
  { href: "/grok-imagine",             addedAt: "2026-07-17T16:20", note: "Aurora image generation · grok-2-image · AI art synthesis" },
  { href: "/grok-synthesis",           addedAt: "2026-07-17T14:10", note: "Cross-synthesis · @Strategicproce × @Shia449272 · material nodes" },
  { href: "/ai-image-nest",            addedAt: "2026-07-17T12:00", note: "GPT image vault · typeahead · Drive photos · visual search" },
  { href: "/bee-liquid-chip",          addedAt: "2026-07-17T09:30", note: "Cryogenic neuromorphic reservoir · hemolymph packet switching" },
  { href: "/node-lattice",             addedAt: "2026-07-17T08:00", note: "Cell division & gene replication · mutation · plasmid conjugation · live sim" },
];

const RECENT_WINDOW_DAYS = 7;

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
function relDate(iso: string): string {
  const d = daysAgo(iso);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/New_York" });
}

// ── Category definitions ──────────────────────────────────────────────────────
const CATS = [
  {
    id: "ai",
    label: "AI & Media",
    color: "#4fe8e8",
    bg: "rgba(79,232,232,0.10)",
    hrefs: ["/claude-chat","/x-grok","/openai-bridge","/grok-synthesis","/grok-imagine","/ai-image-nest","/google-drive","/command-center","/synthesize","/search","/aether-intake","/notion-synthesis","/notion-atlas","/notion-sync","/question-bank","/synthesize"],
  },
  {
    id: "core",
    label: "Core AETHER",
    color: "#f5c84c",
    bg: "rgba(245,200,76,0.10)",
    hrefs: ["/substrates","/graph-map","/page-directory","/coherence-atlas","/ecosystem","/architecture","/pipeline","/core","/coherence-engine","/aether-engine","/aether-dashboard","/clcs-architecture","/dmf-field","/gradient-field","/equation-codex","/aether-doctrine","/aether-why","/aether-unified-framework","/aether-matrix","/whats-new","/resonant-nexus","/guf-flagship","/guf-observatory","/guf-engine","/guf-analysis","/coherence","/unified-synthesis","/aether-observable","/coherence-field-theory","/complete-integration","/aether-synthesis","/grand-unified-framework","/unified-field-theory","/helical-framework","/dynamic-synthesis"],
  },
  {
    id: "physics",
    label: "Physics & Cosmos",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.10)",
    hrefs: ["/black-hole-framework","/quantum-gravity","/event-horizon","/compact-fusion","/plasma-knots","/photon-emission","/antimatter-wave","/tidal-movement","/six-planet-alignment","/heliospheric-coherence","/atlas-3i","/slinky-propulsion","/ferrofluid-propulsion","/quantum-vacuum","/spin-vacuum","/early-universe","/superradiance","/photosynthesis-spark","/photosynthesis-planet","/cosmic-convergence","/as-above","/as-above-so-below","/april-23-alignment","/uap-energy","/non-terrestrial","/warp-drive-literature","/puthoff-metric-engineering","/ufo-ascent","/warp-gravity","/warp-bubble-engine","/propulsion-engine","/propulsion-dynamics","/aether-propulsion","/plasma-confinement","/tait-knots","/quantum-substrate","/light-forces","/perceptive-universe","/aether-carriage","/resonant-carriage","/blast-bubble-carriage","/spacetime-fabric","/spacetime-nav","/water-transport","/mpc-spacetime","/transport-cavity","/stacked-rings","/stacked-rings-engine","/grand-unified-framework","/carrier-dimensions","/observer-dimensions","/integration-dimensions","/manifold-26d","/gobekli-plasma","/bismuth","/alchemy-to-fusion","/alchemical-protocol","/quartz-color","/opal-genesis","/knowable-universe","/non-physical-phenomena"],
  },
  {
    id: "bio",
    label: "Biology & Health",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.10)",
    hrefs: ["/biology","/blood-dna-lab","/solar-feminine","/womens-coherence-map","/invisible-wind","/gut-brain","/neuro-metabolic","/neural-coherence","/neural-brain-systems","/neural-psychedelic","/bio-computational","/bio-photonic-scent","/bio-magnetic-convergence","/biomagnetism","/kinematic-replication","/cerebral-organoids","/organoid-intel","/plant-coherence-system","/plant-intel","/pollen-flower","/pollen-clock-roots","/eye-evolution","/uv-amino-light","/full-spectrum-light","/blue-light-protocol","/aether-health","/osmotic-pressure","/cancer-coherence","/borrelia-knot","/thermal-decoy-filter","/polymer-biobreak","/three-rs-reality","/life-gradient-planetary","/moon-mars-field","/queen-bee-diapause","/nematic-bee-foton","/tardigrades-density-msdd","/cryptobiosis-asu-telomeres","/maya-quarks-dna-gfp","/mycorrhizal-network","/magic-c8","/slime-maze","/plant-network","/plant-electroactivity","/tunguska-asteroid-timeline","/wood-frog-biophotonics","/wood-frog-knots","/frog-sim-paper","/tardigrade-density-msdd","/regulatory-depth","/prism-principle","/atp-transport","/brain-metabolism","/nutrition-force","/aether-bodysuit","/neuroplasticity","/brain-cube-camera","/stellar-brain","/motor-cortex","/pineal-moss-vision","/psilocybin-water-octopus","/mycelium-substrate","/daily-ritual","/gut-brain","/planetary-neural","/heliospheric-coherence","/aether-metaphysics","/under-ice-ecosystem","/sea-intelligence","/bee-liquid-chip","/rf-diffusion","/solar-neural-interface"],
  },
  {
    id: "sim",
    label: "Simulations",
    color: "#c084fc",
    bg: "rgba(192,132,252,0.10)",
    hrefs: ["/schumann-neural-fields","/vacuum-computation","/imaging-reality","/solar-neural-interface","/rain-ai","/hydrogen-reversal","/node-lattice","/quantum-exotic-matter","/substrate-sandwich","/alfven-synthesis","/slime-gravity-quantization","/crystallized-life-synthesis","/ontological-partials","/pineal-eye-map","/gravitational-chirp","/coherent-disturbance","/cancer-trajectory","/glass-field-homes","/lunar-anchor","/field-healer","/wave-collapse","/larmor-field","/spin-lattice","/laser-regen","/color-perception","/plasmodium-warp","/electric-breakdown","/cavitation-plasmoid","/ionization-plasma","/neural-signal","/synaptic-plasticity","/brain-motor-interface","/neural-oscillations","/motor-neuron-cascade","/coherence-field-explorer","/three-oscillator","/earth-computer","/crystallization-atlas","/circular-farm","/pde-simulator","/morpho-computer","/cgle-live","/synchrony-field","/stromatolite-field","/stromatolite-automaton","/stromatolite","/emergence-network","/energetic-field-sim","/gradiant-field","/synthesis-field","/wave-lattice","/filament-lattice","/robot-strokes","/superradiance","/rational-function","/equations-in-motion","/substrate-synthesis","/substrate-computing","/substrate-quantization-engine","/coherence-field-explorer","/lunar-coherence","/lunar-ambient-field","/flowet-clock","/flower-clock","/uptipple-boat","/chromatic-glare","/color-cosmology","/gobekli-plasma","/quantum-ammeter","/gravity-field","/gravitational-field","/cavity-computer","/quantum-computer","/phi-coherent-wave","/fluid-computer","/fluid-substrate","/water-density","/magnetic-drops","/ferro-modes","/ferrodrive","/phi-hot","/phi-hot-zipper","/vortex-math","/floquet-petals","/stacked-rings","/guf-coins","/life-gradient-planetary","/slime-maze","/aether-egg-engine","/world-harmony-archetype","/plasma-confinement","/tait-knots","/gobekli-tepe","/photosynthesis-spark","/photosynthesis-planet","/circular-farm","/phonon-stack","/octonion-aether"],
  },
  {
    id: "math",
    label: "Mathematics",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    hrefs: ["/equations","/math-engine","/math-studio","/math-frontier","/venus-cycles","/fibonacci-quaternion","/aether-symbol-reference","/vortex-math","/knot-topology","/plasma-knots","/tait-knots","/nine-shells","/shells-mind-map","/phi-framework","/phi-aether","/quaternions","/bursting-quaternions","/octonion-aether","/fibonacci-quantization","/fibonacci-calendar","/fibonacci-replicant","/trig-reference","/even-odd","/polar-transform","/symbol-alphabet","/alphabet-map","/aether-language","/symbol-sifter","/aether-symbol-reference","/prime-anti-prime","/incommensurable","/eniac-monte-carlo","/decision-entropy","/symbolic-computation","/computational-mathematics","/understanding-strand","/firework-coherence","/cxe-equation","/sacred-geometry-math","/math-frontier","/aether-visual-system","/color-coherence","/color-cosmology"],
  },
  {
    id: "docs",
    label: "Documents & Papers",
    color: "#fb7185",
    bg: "rgba(251,113,133,0.10)",
    hrefs: ["/aether-whitepaper","/aether-whitepaper-v1","/aether-whitepaper-v2","/aether-patent","/aether-theory-deck","/cuca-white-paper","/aether-textbook","/research","/universal-grammar","/aether-edge-constraint","/agent-whispers","/aether-whitepaper","/q-aether-research","/aether-whitepaper-v1","/aether-whitepaper-v2","/notion-sync","/notion-atlas","/notion-synthesis","/aether-foundations","/q-aether-stack","/sources","/upload","/aether-intake","/glossary","/coherence-nav","/daily-companion"],
  },
  {
    id: "creative",
    label: "Creative & Life",
    color: "#f9a8d4",
    bg: "rgba(249,168,212,0.10)",
    hrefs: ["/sparkle-text","/calm-company","/social-deploy","/baby-rhythm","/daily-ritual","/crashout","/aether-flow","/aether-calendar","/boho-formula","/posting-architecture","/personal-operating-model","/mom-study","/aether-seasons","/learning-layers","/aether-childrens-realm","/computer-brains","/community-notes","/divine-timing","/awakening-timeline","/april-23-alignment","/photo-timeline","/live-cursors","/experience","/dreamscape","/simulation","/all-business-ideas","/source-board","/mrna-readings","/cli-nano","/math-studio","/sparkle-text","/chocolate-tempering","/compote-chips","/daily-companion","/portal-restoration","/terrain-sunrise","/terraform-sunrise","/sky-dial","/coherence-nav","/aether-habitat","/solar-architecture"],
  },
] as const;

type CatId = typeof CATS[number]["id"] | "all" | "recent";

function getCat(href: string): typeof CATS[number] | null {
  for (const cat of CATS) {
    if (cat.hrefs.some(h => href === h || href.startsWith(h))) return cat;
  }
  return null;
}

function shortDesc(label: string): string {
  const parts = label.split(" · ");
  return parts.slice(1, 4).join(" · ") || parts[0];
}
function pageName(label: string): string {
  return label.split(" · ")[0];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PageDirectoryPage() {
  const [tab, setTab] = useState<CatId>("recent");
  const [q, setQ] = useState("");
  const [, nav] = useLocation();

  // Build recent lookup map
  const recentMap = useMemo(() => {
    const m = new Map<string, { addedAt: string; note?: string }>();
    for (const r of RECENT_ADDITIONS) {
      if (daysAgo(r.addedAt) <= RECENT_WINDOW_DAYS) m.set(r.href, r);
    }
    return m;
  }, []);

  const allPages = useMemo(() => NAV_ITEMS.map(item => ({
    href: item.href,
    name: pageName(item.label),
    desc: shortDesc(item.label),
    full: item.label,
    cat: getCat(item.href),
    recent: recentMap.get(item.href),
  })), [recentMap]);

  const recentPages = useMemo(() =>
    RECENT_ADDITIONS
      .filter(r => daysAgo(r.addedAt) <= RECENT_WINDOW_DAYS)
      .map(r => {
        const nav_item = allPages.find(p => p.href === r.href);
        return { ...r, page: nav_item };
      })
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()),
    [allPages]);

  const filtered = useMemo(() => {
    const lower = q.toLowerCase();
    if (tab === "recent") {
      return recentPages
        .filter(r => !q || (r.page?.full ?? r.href).toLowerCase().includes(lower) || r.href.includes(lower))
        .map(r => r.page ?? { href: r.href, name: r.href, desc: r.note ?? "", full: r.href, cat: null, recent: r });
    }
    return allPages.filter(p => {
      const matchesQ = !q || p.full.toLowerCase().includes(lower) || p.href.toLowerCase().includes(lower);
      const matchesTab = tab === "all" || (p.cat?.id === tab) || (!p.cat && tab === "all");
      return matchesQ && matchesTab;
    });
  }, [allPages, recentPages, tab, q]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: allPages.length, recent: recentPages.length };
    for (const cat of CATS) m[cat.id] = allPages.filter(p => p.cat?.id === cat.id).length;
    return m;
  }, [allPages, recentPages]);

  const B = {
    bg: "#0b0906", panel: "#14100a", panel2: "#1c160e",
    line: "rgba(245,200,76,0.12)", ivory: "#f4f1ea",
    dim: "rgba(244,241,234,0.45)",
    newGlow: "rgba(74,222,128,0.15)",
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit" }}>

      {/* Header */}
      <div style={{ padding: "24px 32px 18px", borderBottom: `1px solid ${B.line}`, background: "linear-gradient(180deg,rgba(245,200,76,0.06),transparent)" }}>
        <div style={{ fontSize: 21, fontWeight: 700, color: "#f5c84c", letterSpacing: 1, marginBottom: 4 }}>
          Page Directory
        </div>
        <div style={{ fontSize: 12, color: B.dim, letterSpacing: 0.5 }}>
          {allPages.length} pages · {recentPages.length} added in the last {RECENT_WINDOW_DAYS} days · searchable · color-coded by domain
        </div>
      </div>

      {/* Search + Tabs */}
      <div style={{ padding: "16px 32px 0", borderBottom: `1px solid ${B.line}`, position: "sticky", top: 0, background: B.bg, zIndex: 10 }}>
        <input
          style={{ width: "100%", marginBottom: 14, padding: "10px 16px", background: B.panel, border: `1.5px solid rgba(245,200,76,0.3)`, borderRadius: 10, color: B.ivory, fontSize: 14, outline: "none", boxSizing: "border-box" }}
          placeholder="Search all pages…"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingBottom: 14, overflowX: "auto" }}>
          {/* Recent tab — first, most prominent */}
          <TabPill
            active={tab === "recent"}
            color="#4ade80"
            label="✦ Recently Added"
            count={counts.recent}
            onClick={() => setTab("recent")}
          />
          <div style={{ width: 1, background: B.line, margin: "2px 4px", alignSelf: "stretch" }} />
          <TabPill active={tab === "all"} color="#f5c84c" label="All" count={counts.all} onClick={() => setTab("all")} />
          {CATS.map(cat => (
            <TabPill
              key={cat.id}
              active={tab === cat.id}
              color={cat.color}
              label={cat.label}
              count={counts[cat.id]}
              onClick={() => setTab(cat.id as CatId)}
            />
          ))}
        </div>
      </div>

      {/* Recent tab: timeline view */}
      {tab === "recent" && !q && (
        <div style={{ padding: "20px 32px 80px" }}>
          <div style={{ fontSize: 11, color: B.dim, letterSpacing: 0.5, marginBottom: 20 }}>
            {recentPages.length} pages · newest first · within last {RECENT_WINDOW_DAYS} days
          </div>

          {/* Group by date */}
          {groupByDate(recentPages).map(({ label: dateLabel, items }) => (
            <div key={dateLabel} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  {dateLabel}
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(74,222,128,0.15)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 10 }}>
                {items.map(r => {
                  const p = r.page;
                  const color = p?.cat?.color ?? "#4ade80";
                  const bg    = p?.cat?.bg    ?? "rgba(74,222,128,0.08)";
                  return (
                    <div
                      key={r.href}
                      onClick={() => nav(r.href)}
                      style={{
                        background: B.panel,
                        border: `1px solid rgba(74,222,128,0.2)`,
                        borderLeft: `3px solid #4ade80`,
                        borderRadius: 8,
                        padding: "14px 16px",
                        cursor: "pointer",
                        transition: "background .12s",
                        position: "relative",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = B.newGlow; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = B.panel; }}
                    >
                      {/* NEW badge */}
                      <span style={{
                        position: "absolute", top: 10, right: 12,
                        fontSize: 8, fontWeight: 700, letterSpacing: "0.15em",
                        padding: "2px 7px", borderRadius: 4,
                        background: "rgba(74,222,128,0.2)", color: "#4ade80",
                        border: "1px solid rgba(74,222,128,0.4)",
                      }}>NEW</span>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5, paddingRight: 40 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
                          {p?.name ?? r.href}
                        </div>
                        {p?.cat && (
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700 }}>
                            {p.cat.label}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 11, color: B.dim, lineHeight: 1.55, marginBottom: 8 }}>
                        {r.note ?? p?.desc ?? ""}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 10, color: "#4ade8099", letterSpacing: 0.3 }}>{r.href}</div>
                        <div style={{ fontSize: 10, color: "#4ade8066" }}>
                          {daysAgo(r.addedAt) === 0 ? fmtTime(r.addedAt) : `${relDate(r.addedAt)} · ${fmtTime(r.addedAt)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {recentPages.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: B.dim }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
              <div>No pages added in the last {RECENT_WINDOW_DAYS} days</div>
            </div>
          )}
        </div>
      )}

      {/* Search results within recent tab */}
      {tab === "recent" && q && (
        <StandardGrid pages={filtered as PageData[]} nav={nav} B={B} q={q} showNewBadge={true} recentMap={recentMap} />
      )}

      {/* All other tabs */}
      {tab !== "recent" && (
        <StandardGrid pages={filtered as PageData[]} nav={nav} B={B} q={q} showNewBadge={true} recentMap={recentMap} />
      )}
    </div>
  );
}

// ── Date grouping helper ──────────────────────────────────────────────────────
function groupByDate(items: { href: string; addedAt: string; note?: string; page?: PageData }[]) {
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const d = daysAgo(item.addedAt);
    const label = d === 0 ? "Today" : d === 1 ? "Yesterday" : new Date(item.addedAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }
  // Sort within each date group by time (newest first)
  for (const [, arr] of groups) {
    arr.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// ── Shared grid ───────────────────────────────────────────────────────────────
interface PageData {
  href: string; name: string; desc: string; full: string;
  cat: typeof CATS[number] | null;
  recent?: { addedAt: string; note?: string };
}

function StandardGrid({ pages, nav, B, q, showNewBadge, recentMap }: {
  pages: PageData[];
  nav: (href: string) => void;
  B: Record<string,string>;
  q: string;
  showNewBadge: boolean;
  recentMap: Map<string, { addedAt: string; note?: string }>;
}) {
  return (
    <div>
      <div style={{ padding: "10px 32px 0", fontSize: 11, color: B.dim, letterSpacing: 0.5 }}>
        {pages.length} pages{q ? ` matching "${q}"` : ""}
      </div>
      <div style={{ padding: "12px 32px 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
        {pages.map(p => {
          const color = p.cat?.color ?? "#f5c84c";
          const bg    = p.cat?.bg    ?? "rgba(245,200,76,0.06)";
          const isNew = showNewBadge && recentMap.has(p.href);
          return (
            <div
              key={p.href}
              onClick={() => nav(p.href)}
              style={{
                background: B.panel,
                border: `1px solid ${isNew ? "rgba(74,222,128,0.25)" : B.line}`,
                borderLeft: `3px solid ${isNew ? "#4ade80" : color}`,
                borderRadius: 8,
                padding: "12px 14px",
                cursor: "pointer",
                transition: "background .12s,border-color .12s",
                position: "relative",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.background = bg;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.background = B.panel;
              }}
            >
              {isNew && (
                <span style={{
                  position: "absolute", top: 8, right: 10,
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.12em",
                  padding: "2px 6px", borderRadius: 4,
                  background: "rgba(74,222,128,0.18)", color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.35)",
                }}>NEW</span>
              )}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4, paddingRight: isNew ? 36 : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.ivory, lineHeight: 1.3 }}>{p.name}</div>
                {p.cat && (
                  <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, letterSpacing: 0.4 }}>
                    {p.cat.label}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: B.dim, lineHeight: 1.5 }}>{p.desc}</div>
              <div style={{ marginTop: 6, fontSize: 10, color: (isNew ? "#4ade80" : color) + "99", letterSpacing: 0.3 }}>{p.href}</div>
            </div>
          );
        })}
        {pages.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: B.dim }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ color: "#f5c84c" }}>No pages match "{q}"</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab pill ──────────────────────────────────────────────────────────────────
function TabPill({ active, color, label, count, onClick }: {
  active: boolean; color: string; label: string; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 13px",
        borderRadius: 20,
        border: `1px solid ${active ? color : "rgba(244,241,234,0.12)"}`,
        background: active ? color + "22" : "rgba(244,241,234,0.04)",
        color: active ? color : "rgba(244,241,234,0.45)",
        fontSize: 11,
        cursor: "pointer",
        fontWeight: active ? 700 : 400,
        whiteSpace: "nowrap",
        transition: "all .12s",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.7, fontSize: 10, fontWeight: 400 }}>{count}</span>
    </button>
  );
}
