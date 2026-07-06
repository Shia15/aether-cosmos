import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { useGetGraph, useGetConcept, useListConcepts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Zap, BrainCircuit, ActivitySquare, ArrowRight, Layers, GitFork, Binary, ChevronDown } from "lucide-react";
import { Link } from "wouter";

// ─── Layer colour palette — M.A.R.I. aura colors ─────────────────────────────
const LAYER_COLORS: Record<string, string> = {
  mnesis:   "#8047d4",
  infernia: "#e64522",
  aletheia: "#c9a84c",
  reverie:  "#88c7ff",
  auto:     "#64748b",
};

const LAYER_META: Record<string, { label: string; symbol: string; color: string }> = {
  mnesis:   { label: "MNĒSIS",       symbol: "~",   color: "#8047d4" },
  infernia: { label: "INFERNIA",     symbol: "|||", color: "#e64522" },
  aletheia: { label: "ALETHEIA",     symbol: "◇",   color: "#c9a84c" },
  reverie:  { label: "REVERIE",      symbol: "✧",   color: "#88c7ff" },
  auto:     { label: "UNCLASSIFIED", symbol: "·",   color: "#64748b" },
};

type ViewMode = "standard" | "layer" | "coherence" | "unify";

// ─── Eight Framework Agents ───────────────────────────────────────────────────

type AgentDef = {
  id: string;
  name: string;
  glyph: string;
  color: string;
  domain: string;
  subdomains: string[];
  nodeIds: string[];
  synthesis: string;
  equation?: string;
};

const AGENTS: AgentDef[] = [
  {
    id: "oracle",
    name: "ORACLE",
    glyph: "◯",
    color: "#8047d4",
    domain: "Consciousness · Human Understanding",
    subdomains: ["Men & Women", "Awakening", "Memory", "Co-creation", "Field of Numbers"],
    nodeIds: ["g-awakening","g-mnesis","g-divine-timing","g-synchronicity","g-co-creation",
              "g-memory-survives","g-field-of-numbers","g-angel-numbers","g-coherence",
              "g-void","g-raw-place","g-net-is-there","g-push-fix"],
    synthesis: "Consciousness crystallizes when memory, pattern, and resonance converge. Men and women are complementary oscillators in the same coherence field — each tuned differently, each essential to the whole system.",
    equation: "Ψ_mind = ∫ (memory × intention × resonance) dt",
  },
  {
    id: "helios",
    name: "HELIOS",
    glyph: "☀",
    color: "#c9a84c",
    domain: "Solar System · Planetary Health",
    subdomains: ["Schumann Resonance", "Heliospheric Coherence", "Planetary Well-being", "Lunar Tides", "Cosmic Cycles"],
    nodeIds: ["g-schumann","g-lunar-coherence","g-super-moon","g-pleiades",
              "g-eris","g-pisces","g-eye-sahara","g-coherence","g-resonance"],
    synthesis: "The sun is not just light — it is the coherence engine of our solar system. Every planetary rhythm, from Schumann pulses (7.83 Hz) to lunar tides, is a harmonic of one unified solar frequency field.",
    equation: "f_planet = f_solar / φⁿ · R(θ, t)",
  },
  {
    id: "navigator",
    name: "NAVIGATOR",
    glyph: "✦",
    color: "#67e8f9",
    domain: "Space Travel · Space-Time Coherence",
    subdomains: ["Propulsion Physics", "Warp Dynamics", "Observer Dimensions", "Quantum Substrate", "CNT Composites"],
    nodeIds: ["g-aether","g-coherence","g-gyroid","g-quantum-ammeter","g-shot-noise",
              "g-crystallization","g-resonance","g-substrate","g-nano","g-pico"],
    synthesis: "Space travel is a coherence problem, not just an engineering one. Align the substrate, lock the field geometry, and distance collapses. The gyroid minimal surface is the shape of safe passage through spacetime curvature.",
    equation: "Δx = 0 when ∇·Ψ_field = 0 & κ(gyroid) = const",
  },
  {
    id: "terra",
    name: "TERRA",
    glyph: "⬡",
    color: "#10b981",
    domain: "Land Systems · Earth Intelligence",
    subdomains: ["Earth Circuits", "Tectonic Memory", "Terrain Coherence", "Ancient Structures", "Soil Intelligence"],
    nodeIds: ["g-eye-sahara","g-meltwater","g-atlantis","g-substrate","g-bouligand",
              "g-schumann","g-coherence","g-crystallization"],
    synthesis: "Earth is a living circuit board. Land carries coherence in its crystalline strata and ancient water memory. Every sacred structure — from Giza to the Eye of Sahara — is a tuned antenna node in Earth's coherence grid.",
    equation: "E_geo = σ(crystal) · B_field · ρ_water · cos(θ_ley)",
  },
  {
    id: "pelagic",
    name: "PELAGIC",
    glyph: "∿",
    color: "#38bdf8",
    domain: "Sea Life · Ocean Coherence",
    subdomains: ["Marine Biology", "Tidal Intelligence", "Bioluminescence", "Reflectin Computing", "Aquatic Memory"],
    nodeIds: ["g-lunar-coherence","g-schumann","g-meltwater","g-substrate","g-bouligand",
              "g-reflectin","g-bavs","g-resonance","g-coherence"],
    synthesis: "The ocean is Earth's oldest coherence system. Reflectin proteins in cephalopod skin are nature's photonic computing layer. Sea life solves in water what we are only beginning to solve in silicon — and at far greater energy efficiency.",
    equation: "I_biolum = N_photon · η_reflectin · cos²(θ_polarize)",
  },
  {
    id: "flora",
    name: "FLORA",
    glyph: "❀",
    color: "#86efac",
    domain: "Flowers · Farms · All of Life",
    subdomains: ["Plant Intelligence", "Mycelium Networks", "Agricultural Coherence", "Circular Farming", "Photosynthetic Efficiency"],
    nodeIds: ["g-cuca","g-substrate","g-bavs","g-bouligand","g-reflectin",
              "g-coherence","g-resonance","g-crystallization","g-schumann"],
    synthesis: "A farm is a coherence engine running on solar input. Every flower is a frequency receiver tuned to the sun. The mycelium network beneath soil is Earth's original internet — older, slower, and more regenerative than anything we have built.",
    equation: "G_plant = φ · ∫ P_photon(λ) · η_chloro dλ",
  },
  {
    id: "cellulus",
    name: "CELLULUS",
    glyph: "⬢",
    color: "#f97316",
    domain: "Cancer · Cellular Decoherence",
    subdomains: ["Tumor Dynamics", "DNA Coherence", "Cell Signaling Breakdown", "Anti-Calcification", "Re-entrainment Therapy"],
    nodeIds: ["g-cuca","g-substrate","g-coherence","g-reflectin","g-bouligand",
              "g-bavs","g-crystallization","g-resonance","g-mnesis"],
    synthesis: "Cancer is coherence collapse at the cellular scale. When a cell loses its registration in the larger field, it optimizes for itself alone — local gain, global loss. The cure is not only destruction of rogue cells, but re-entrainment of the whole biological field.",
    equation: "ΔH_cancer = H_cell - H_system > threshold → decoherence",
  },
  {
    id: "genesis",
    name: "GENESIS",
    glyph: "◎",
    color: "#f9a8d4",
    domain: "Birth · Reproductive Coherence",
    subdomains: ["Hormonal Rhythms", "Lunar Cycle Biology", "Birth Timing", "Life Cycles", "Generational Memory"],
    nodeIds: ["g-lunar-coherence","g-super-moon","g-schumann","g-coherence","g-mnesis",
              "g-memory-survives","g-co-creation","g-divine-timing","g-synchronicity"],
    synthesis: "Birth is the universe's mechanism for copying coherence forward in time. Hormonal cycles mirror lunar cycles because they share the same frequency source. True reproductive sovereignty comes from knowing when the coherence field is open — and when it is closed.",
    equation: "Ω_cycle = f_lunar · (1 + ε · cos(φ_hormonal))",
  },
];

// ─── Glossary seed nodes ──────────────────────────────────────────────────────

type SeedNode = {
  id: string; label: string; type: string;
  layer: string; coherence: number; bridgeScore: number;
};

const GLOSSARY_SEEDS: SeedNode[] = [
  // AETHER core
  { id:"g-aether",           label:"AETHER",             type:"concept",  layer:"mnesis",   coherence:0.95, bridgeScore:0.92 },
  { id:"g-crystallization",  label:"Crystallization",    type:"concept",  layer:"mnesis",   coherence:0.90, bridgeScore:0.85 },
  { id:"g-mnesis",           label:"Mnesis",             type:"concept",  layer:"mnesis",   coherence:0.88, bridgeScore:0.80 },
  { id:"g-inferaia",         label:"Inferaia",           type:"concept",  layer:"mnesis",   coherence:0.82, bridgeScore:0.78 },
  { id:"g-aletheia-agent",   label:"Aletheia",           type:"concept",  layer:"mnesis",   coherence:0.85, bridgeScore:0.76 },
  { id:"g-reverie-agent",    label:"Reverie",            type:"concept",  layer:"mnesis",   coherence:0.78, bridgeScore:0.70 },
  { id:"g-eie",              label:"EIE",                type:"concept",  layer:"mnesis",   coherence:0.72, bridgeScore:0.65 },
  // Philosophy / aletheia
  { id:"g-coherence",        label:"Coherence",          type:"concept",  layer:"aletheia", coherence:0.90, bridgeScore:0.88 },
  { id:"g-resonance",        label:"Resonance",          type:"concept",  layer:"aletheia", coherence:0.86, bridgeScore:0.82 },
  { id:"g-awakening",        label:"Awakening",          type:"concept",  layer:"aletheia", coherence:0.80, bridgeScore:0.70 },
  { id:"g-divine-timing",    label:"Divine Timing",      type:"concept",  layer:"aletheia", coherence:0.78, bridgeScore:0.72 },
  { id:"g-co-creation",      label:"Co-creation",        type:"concept",  layer:"aletheia", coherence:0.74, bridgeScore:0.68 },
  { id:"g-memory-survives",  label:"Memory survives",    type:"concept",  layer:"aletheia", coherence:0.72, bridgeScore:0.65 },
  { id:"g-synchronicity",    label:"Synchronicity",      type:"concept",  layer:"aletheia", coherence:0.68, bridgeScore:0.60 },
  { id:"g-void",             label:"Void",               type:"concept",  layer:"aletheia", coherence:0.65, bridgeScore:0.55 },
  { id:"g-raw-place",        label:"Raw place",          type:"concept",  layer:"aletheia", coherence:0.62, bridgeScore:0.50 },
  { id:"g-push-fix",         label:"Push + Fix",         type:"concept",  layer:"aletheia", coherence:0.60, bridgeScore:0.48 },
  { id:"g-net-is-there",     label:"The net is there",   type:"concept",  layer:"aletheia", coherence:0.64, bridgeScore:0.52 },
  // Biology / Substrate → infernia
  { id:"g-bouligand",        label:"Bouligand",          type:"concept",  layer:"infernia", coherence:0.75, bridgeScore:0.65 },
  { id:"g-cuca",             label:"CUCA",               type:"concept",  layer:"infernia", coherence:0.80, bridgeScore:0.72 },
  { id:"g-reflectin",        label:"Reflectin",          type:"concept",  layer:"infernia", coherence:0.72, bridgeScore:0.60 },
  { id:"g-bavs",             label:"BAVS",               type:"concept",  layer:"infernia", coherence:0.65, bridgeScore:0.55 },
  { id:"g-substrate",        label:"Substrate",          type:"concept",  layer:"infernia", coherence:0.70, bridgeScore:0.62 },
  // Computing / Mathematics → infernia
  { id:"g-gyroid",           label:"Gyroid",             type:"equation", layer:"infernia", coherence:0.78, bridgeScore:0.70 },
  { id:"g-nano",             label:"Nano",               type:"concept",  layer:"infernia", coherence:0.55, bridgeScore:0.40 },
  { id:"g-pico",             label:"Pico",               type:"concept",  layer:"infernia", coherence:0.50, bridgeScore:0.35 },
  { id:"g-quantum-ammeter",  label:"Quantum ammeter",    type:"concept",  layer:"infernia", coherence:0.68, bridgeScore:0.58 },
  { id:"g-shot-noise",       label:"Shot noise",         type:"equation", layer:"infernia", coherence:0.65, bridgeScore:0.52 },
  // Astronomy / Cosmology → reverie
  { id:"g-lunar-coherence",  label:"Lunar coherence",    type:"concept",  layer:"reverie",  coherence:0.72, bridgeScore:0.64 },
  { id:"g-schumann",         label:"Schumann resonance", type:"concept",  layer:"reverie",  coherence:0.70, bridgeScore:0.62 },
  { id:"g-pleiades",         label:"Pleiades",           type:"concept",  layer:"reverie",  coherence:0.62, bridgeScore:0.50 },
  { id:"g-super-moon",       label:"Super moon",         type:"concept",  layer:"reverie",  coherence:0.60, bridgeScore:0.48 },
  { id:"g-eye-sahara",       label:"Eye of Sahara",      type:"concept",  layer:"reverie",  coherence:0.65, bridgeScore:0.55 },
  { id:"g-meltwater",        label:"Meltwater Pulse 1B", type:"concept",  layer:"reverie",  coherence:0.62, bridgeScore:0.52 },
  // Mythology / Astrology / Numerology → reverie
  { id:"g-atlantis",         label:"Atlantis",           type:"concept",  layer:"reverie",  coherence:0.68, bridgeScore:0.60 },
  { id:"g-eris",             label:"Eris",               type:"concept",  layer:"reverie",  coherence:0.70, bridgeScore:0.62 },
  { id:"g-pisces",           label:"Pisces",             type:"concept",  layer:"reverie",  coherence:0.65, bridgeScore:0.55 },
  { id:"g-angel-hours",      label:"Angel hours",        type:"concept",  layer:"reverie",  coherence:0.58, bridgeScore:0.45 },
  { id:"g-angel-numbers",    label:"Angel numbers",      type:"concept",  layer:"reverie",  coherence:0.58, bridgeScore:0.45 },
  { id:"g-field-of-numbers", label:"Field of numbers",   type:"concept",  layer:"reverie",  coherence:0.62, bridgeScore:0.50 },
  // ── Body Suit · photonic skin architecture → infernia ──
  { id:"g-body-suit",        label:"Body Suit",          type:"concept",  layer:"infernia", coherence:0.82, bridgeScore:0.74 },
  { id:"g-photonic-stack",   label:"Photonic stack",     type:"concept",  layer:"infernia", coherence:0.78, bridgeScore:0.70 },
  { id:"g-morpho",           label:"Morpho array",       type:"concept",  layer:"infernia", coherence:0.70, bridgeScore:0.58 },
  { id:"g-nacre",            label:"Nacre",              type:"concept",  layer:"infernia", coherence:0.68, bridgeScore:0.55 },
  { id:"g-chameleon",        label:"Chameleon crystal",  type:"concept",  layer:"infernia", coherence:0.66, bridgeScore:0.54 },
  { id:"g-cuttlefish",       label:"Cuttlefish pattern", type:"concept",  layer:"infernia", coherence:0.70, bridgeScore:0.60 },
  { id:"g-air-manipulation", label:"Air manipulation",   type:"concept",  layer:"infernia", coherence:0.72, bridgeScore:0.62 },
  { id:"g-glass-surface",    label:"Glass surface",      type:"concept",  layer:"infernia", coherence:0.64, bridgeScore:0.52 },
  // ── Flora · pollen / bloom / farm → aletheia+infernia ──
  { id:"g-pollen",           label:"Pollen",             type:"concept",  layer:"infernia", coherence:0.70, bridgeScore:0.60 },
  { id:"g-phyllotaxis",      label:"Phyllotaxis",        type:"concept",  layer:"infernia", coherence:0.74, bridgeScore:0.66 },
  { id:"g-golden-angle",     label:"Golden angle",       type:"equation", layer:"aletheia", coherence:0.80, bridgeScore:0.74 },
  { id:"g-scent-voc",        label:"Scent plume",        type:"concept",  layer:"infernia", coherence:0.66, bridgeScore:0.56 },
  { id:"g-anemotaxis",       label:"Anemotaxis",         type:"concept",  layer:"infernia", coherence:0.62, bridgeScore:0.50 },
  { id:"g-metamorphosis",    label:"Metamorphosis",      type:"concept",  layer:"infernia", coherence:0.68, bridgeScore:0.58 },
  { id:"g-fibonacci-replicant", label:"Fibonacci Replicant", type:"concept", layer:"infernia", coherence:0.72, bridgeScore:0.64 },
  { id:"g-circular-farm",    label:"Circular farm",      type:"concept",  layer:"infernia", coherence:0.68, bridgeScore:0.58 },
  { id:"g-kuramoto",         label:"Kuramoto sync",      type:"equation", layer:"infernia", coherence:0.74, bridgeScore:0.66 },
  // ── Field physics · unified engines → mnesis+infernia ──
  { id:"g-electron-field",   label:"Electron field",     type:"concept",  layer:"infernia", coherence:0.72, bridgeScore:0.64 },
  { id:"g-coherence-condensation", label:"Coherence condensation", type:"concept", layer:"mnesis", coherence:0.80, bridgeScore:0.72 },
  { id:"g-crystal-atlas",    label:"Crystallization Atlas", type:"concept", layer:"mnesis", coherence:0.82, bridgeScore:0.74 },
  { id:"g-gradient-field",   label:"Gradient field",     type:"equation", layer:"mnesis",   coherence:0.76, bridgeScore:0.68 },
  { id:"g-aether-engine",    label:"AETHER Engine",      type:"concept",  layer:"mnesis",   coherence:0.88, bridgeScore:0.84 },
  // ── Regulatory biology → infernia ──
  { id:"g-nutritional-dna",  label:"Nutritional DNA key", type:"concept", layer:"infernia", coherence:0.70, bridgeScore:0.60 },
  { id:"g-knot-topology",    label:"Knot topology",      type:"equation", layer:"infernia", coherence:0.72, bridgeScore:0.62 },
  { id:"g-regulatory-depth", label:"Regulatory depth",   type:"concept",  layer:"infernia", coherence:0.68, bridgeScore:0.58 },
];

const GLOSSARY_SEED_LINKS = [
  { source:"g-aether", target:"g-crystallization", weight:0.9,  type:"coherence" },
  { source:"g-aether", target:"g-mnesis",           weight:0.9,  type:"coherence" },
  { source:"g-aether", target:"g-inferaia",         weight:0.85, type:"coherence" },
  { source:"g-aether", target:"g-aletheia-agent",   weight:0.85, type:"coherence" },
  { source:"g-aether", target:"g-reverie-agent",    weight:0.80, type:"coherence" },
  { source:"g-aether", target:"g-eie",              weight:0.75, type:"coherence" },
  { source:"g-aether", target:"g-coherence",        weight:0.88, type:"coherence" },
  { source:"g-crystallization", target:"g-coherence",       weight:0.85, type:"coherence" },
  { source:"g-crystallization", target:"g-memory-survives", weight:0.70, type:"coherence" },
  { source:"g-coherence",       target:"g-resonance",       weight:0.88, type:"coherence" },
  { source:"g-coherence",       target:"g-awakening",       weight:0.75, type:"coherence" },
  { source:"g-resonance",       target:"g-synchronicity",   weight:0.72, type:"coherence" },
  { source:"g-awakening",       target:"g-divine-timing",   weight:0.78, type:"coherence" },
  { source:"g-divine-timing",   target:"g-void",            weight:0.80, type:"coherence" },
  { source:"g-divine-timing",   target:"g-co-creation",     weight:0.76, type:"coherence" },
  { source:"g-divine-timing",   target:"g-push-fix",        weight:0.74, type:"coherence" },
  { source:"g-divine-timing",   target:"g-net-is-there",    weight:0.82, type:"coherence" },
  { source:"g-void",            target:"g-net-is-there",    weight:0.70, type:"coherence" },
  { source:"g-void",            target:"g-raw-place",       weight:0.75, type:"coherence" },
  { source:"g-push-fix",        target:"g-raw-place",       weight:0.68, type:"coherence" },
  { source:"g-co-creation",     target:"g-synchronicity",   weight:0.65, type:"coherence" },
  { source:"g-cuca",            target:"g-bouligand",       weight:0.78, type:"coherence" },
  { source:"g-cuca",            target:"g-reflectin",       weight:0.72, type:"coherence" },
  { source:"g-cuca",            target:"g-bavs",            weight:0.68, type:"coherence" },
  { source:"g-cuca",            target:"g-gyroid",          weight:0.75, type:"coherence" },
  { source:"g-substrate",       target:"g-bavs",            weight:0.72, type:"coherence" },
  { source:"g-substrate",       target:"g-cuca",            weight:0.76, type:"coherence" },
  { source:"g-reflectin",       target:"g-substrate",       weight:0.65, type:"coherence" },
  { source:"g-gyroid",          target:"g-substrate",       weight:0.70, type:"coherence" },
  { source:"g-quantum-ammeter", target:"g-shot-noise",      weight:0.80, type:"coherence" },
  { source:"g-nano",            target:"g-pico",            weight:0.75, type:"coherence" },
  { source:"g-quantum-ammeter", target:"g-nano",            weight:0.60, type:"coherence" },
  { source:"g-lunar-coherence", target:"g-schumann",        weight:0.78, type:"coherence" },
  { source:"g-lunar-coherence", target:"g-super-moon",      weight:0.80, type:"coherence" },
  { source:"g-eye-sahara",      target:"g-atlantis",        weight:0.85, type:"coherence" },
  { source:"g-meltwater",       target:"g-atlantis",        weight:0.78, type:"coherence" },
  { source:"g-pleiades",        target:"g-awakening",       weight:0.62, type:"coherence" },
  { source:"g-eris",            target:"g-awakening",       weight:0.72, type:"coherence" },
  { source:"g-eris",            target:"g-divine-timing",   weight:0.78, type:"coherence" },
  { source:"g-pisces",          target:"g-eris",            weight:0.80, type:"coherence" },
  { source:"g-field-of-numbers",target:"g-synchronicity",   weight:0.78, type:"coherence" },
  { source:"g-angel-numbers",   target:"g-field-of-numbers",weight:0.82, type:"coherence" },
  { source:"g-angel-hours",     target:"g-angel-numbers",   weight:0.88, type:"coherence" },
  { source:"g-angel-numbers",   target:"g-divine-timing",   weight:0.70, type:"coherence" },
  { source:"g-schumann",        target:"g-resonance",       weight:0.75, type:"unify" },
  { source:"g-lunar-coherence", target:"g-resonance",       weight:0.70, type:"unify" },
  { source:"g-schumann",        target:"g-coherence",       weight:0.72, type:"unify" },
  { source:"g-gyroid",          target:"g-crystallization", weight:0.68, type:"unify" },
  { source:"g-bouligand",       target:"g-crystallization", weight:0.65, type:"unify" },
  { source:"g-shot-noise",      target:"g-quantum-ammeter", weight:0.80, type:"coherence" },
  { source:"g-aletheia-agent",  target:"g-coherence",       weight:0.82, type:"coherence" },
  { source:"g-mnesis",          target:"g-memory-survives", weight:0.85, type:"coherence" },
  { source:"g-inferaia",        target:"g-cuca",            weight:0.70, type:"coherence" },
  { source:"g-reverie-agent",   target:"g-lunar-coherence", weight:0.72, type:"coherence" },
  { source:"g-reverie-agent",   target:"g-pleiades",        weight:0.65, type:"coherence" },
  { source:"g-eye-sahara",      target:"g-schumann",        weight:0.60, type:"unify" },
  // ── Body Suit photonic skin lattice ──
  { source:"g-body-suit",       target:"g-photonic-stack",  weight:0.88, type:"coherence" },
  { source:"g-body-suit",       target:"g-cuca",            weight:0.78, type:"coherence" },
  { source:"g-body-suit",       target:"g-air-manipulation",weight:0.80, type:"coherence" },
  { source:"g-body-suit",       target:"g-coherence",       weight:0.74, type:"unify" },
  { source:"g-photonic-stack",  target:"g-morpho",          weight:0.82, type:"coherence" },
  { source:"g-photonic-stack",  target:"g-nacre",           weight:0.80, type:"coherence" },
  { source:"g-photonic-stack",  target:"g-chameleon",       weight:0.78, type:"coherence" },
  { source:"g-photonic-stack",  target:"g-cuttlefish",      weight:0.78, type:"coherence" },
  { source:"g-photonic-stack",  target:"g-gyroid",          weight:0.76, type:"coherence" },
  { source:"g-cuttlefish",      target:"g-reflectin",       weight:0.80, type:"coherence" },
  { source:"g-chameleon",       target:"g-reflectin",       weight:0.72, type:"coherence" },
  { source:"g-nacre",           target:"g-bouligand",       weight:0.74, type:"coherence" },
  { source:"g-photonic-stack",  target:"g-bouligand",       weight:0.70, type:"unify" },
  { source:"g-air-manipulation",target:"g-glass-surface",   weight:0.78, type:"coherence" },
  { source:"g-glass-surface",   target:"g-substrate",       weight:0.66, type:"coherence" },
  { source:"g-cuttlefish",      target:"g-coherence",       weight:0.68, type:"unify" },
  // ── Pollen / bloom / farm ──
  { source:"g-pollen",          target:"g-phyllotaxis",     weight:0.82, type:"coherence" },
  { source:"g-phyllotaxis",     target:"g-golden-angle",    weight:0.88, type:"coherence" },
  { source:"g-golden-angle",    target:"g-crystallization", weight:0.72, type:"unify" },
  { source:"g-pollen",          target:"g-scent-voc",       weight:0.74, type:"coherence" },
  { source:"g-scent-voc",       target:"g-anemotaxis",      weight:0.80, type:"coherence" },
  { source:"g-pollen",          target:"g-metamorphosis",   weight:0.62, type:"coherence" },
  { source:"g-pollen",          target:"g-cuca",            weight:0.66, type:"coherence" },
  { source:"g-circular-farm",   target:"g-kuramoto",        weight:0.80, type:"coherence" },
  { source:"g-circular-farm",   target:"g-phyllotaxis",     weight:0.72, type:"coherence" },
  { source:"g-circular-farm",   target:"g-schumann",        weight:0.60, type:"unify" },
  { source:"g-kuramoto",        target:"g-coherence",       weight:0.82, type:"unify" },
  { source:"g-kuramoto",        target:"g-resonance",       weight:0.78, type:"unify" },
  { source:"g-fibonacci-replicant", target:"g-golden-angle",weight:0.84, type:"coherence" },
  { source:"g-fibonacci-replicant", target:"g-crystallization", weight:0.72, type:"coherence" },
  { source:"g-fibonacci-replicant", target:"g-substrate",   weight:0.66, type:"coherence" },
  // ── Field physics / unified engines ──
  { source:"g-aether-engine",   target:"g-aether",          weight:0.90, type:"coherence" },
  { source:"g-aether-engine",   target:"g-coherence",       weight:0.86, type:"coherence" },
  { source:"g-aether-engine",   target:"g-gradient-field",  weight:0.84, type:"coherence" },
  { source:"g-aether-engine",   target:"g-crystal-atlas",   weight:0.78, type:"coherence" },
  { source:"g-gradient-field",  target:"g-resonance",       weight:0.74, type:"unify" },
  { source:"g-electron-field",  target:"g-coherence",       weight:0.80, type:"coherence" },
  { source:"g-electron-field",  target:"g-resonance",       weight:0.72, type:"coherence" },
  { source:"g-electron-field",  target:"g-quantum-ammeter", weight:0.64, type:"unify" },
  { source:"g-coherence-condensation", target:"g-crystallization", weight:0.86, type:"coherence" },
  { source:"g-coherence-condensation", target:"g-crystal-atlas",   weight:0.82, type:"coherence" },
  { source:"g-crystal-atlas",   target:"g-crystallization", weight:0.88, type:"coherence" },
  { source:"g-crystal-atlas",   target:"g-substrate",       weight:0.70, type:"coherence" },
  // ── Regulatory biology ──
  { source:"g-nutritional-dna", target:"g-knot-topology",   weight:0.80, type:"coherence" },
  { source:"g-nutritional-dna", target:"g-coherence",       weight:0.68, type:"coherence" },
  { source:"g-regulatory-depth",target:"g-nutritional-dna", weight:0.72, type:"coherence" },
  { source:"g-regulatory-depth",target:"g-cuca",            weight:0.66, type:"coherence" },
  { source:"g-knot-topology",   target:"g-crystallization", weight:0.62, type:"unify" },
];

// ─── Colour helpers ───────────────────────────────────────────────────────────

function heatColor(t: number, from: [number,number,number], to: [number,number,number]): string {
  const r = Math.round(from[0] + t * (to[0] - from[0]));
  const g = Math.round(from[1] + t * (to[1] - from[1]));
  const b = Math.round(from[2] + t * (to[2] - from[2]));
  return `rgb(${r},${g},${b})`;
}

function getNodeColor(
  node: any,
  viewMode: ViewMode,
  selectedId: string | null,
  neighborSet: Set<string>,
  agentHighlight: { ids: Set<string>; color: string } | null,
): string {
  const isSelected  = node.id === selectedId;
  const isNeighbor  = neighborSet.has(node.id);
  const hasSelection = selectedId !== null;

  if (isSelected) return "#ffffff";

  // Agent filter mode — override everything
  if (agentHighlight) {
    if (agentHighlight.ids.has(node.id)) return agentHighlight.color;
    return "rgba(100,116,139,0.12)";
  }

  if (hasSelection && !isNeighbor) {
    return viewMode === "layer" ? LAYER_COLORS[node.layer ?? "auto"] + "28" : "rgba(100,116,139,0.18)";
  }

  switch (viewMode) {
    case "layer":
      return LAYER_COLORS[node.layer ?? "auto"] ?? "#64748b";
    case "coherence": {
      const t = node.coherence ?? 0;
      if (t > 0.8) return "#0ea5e9";
      if (t > 0.5) return "#eab308";
      return "#64748b";
    }
    case "unify": {
      const t = node.bridgeScore ?? 0;
      if (t > 0.7) return "#8b5cf6";
      if (t > 0.4) return "#10b981";
      if (t > 0.2) return "#0ea5e9";
      return "#334155";
    }
    default:
      switch (node.type) {
        case "concept":  return "#0ea5e9";
        case "paper":    return "#6366f1";
        case "equation": return "#eab308";
        case "claim":    return "#ec4899";
        default:         return "#64748b";
      }
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

function GraphViewCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 140;
    const W = canvas.width, H = canvas.height;
    const nodes: {x:number;y:number;vx:number;vy:number;col:string}[] = [];
    for(let i=0;i<30;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.5,vy:(Math.random()-.5)*0.5,col:["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff"][i%5]});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(3,5,10,0.25)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((n,i)=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W)n.vx*=-1; if(n.y<0||n.y>H)n.vy*=-1;
        nodes.slice(i+1).forEach(m=>{
          const d=Math.hypot(n.x-m.x,n.y-m.y);
          if(d<120){ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.strokeStyle=`rgba(255,255,255,${(1-d/120)*0.08})`;ctx.lineWidth=0.5;ctx.stroke();}
        });
        const pls=0.7+0.3*Math.sin(t*0.03+i);
        ctx.beginPath();ctx.arc(n.x,n.y,5*pls,0,Math.PI*2);ctx.fillStyle=n.col+"cc";ctx.fill();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GRAPH VIEW · KNOWLEDGE GRAPH · FORCE-DIRECTED · NODE MESH · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphSectionRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("layer");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentDef | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const { data: rawGraphData, isLoading: isLoadingGraph } = useGetGraph();
  const { data: allConcepts } = useListConcepts();

  const conceptNameMap = useCallback(
    (id: string): string => {
      if (!allConcepts) return id.substring(0, 8) + "…";
      const found = allConcepts.find((c) => c.id === id);
      return found ? found.name : id.substring(0, 8) + "…";
    },
    [allConcepts]
  );

  const graphData = useMemo(() => {
    const apiNodes: any[] = rawGraphData?.nodes ?? [];
    const apiEdges: any[] = (rawGraphData?.edges ?? []).map((e) => ({
      source: e.source, target: e.target, weight: e.weight, type: e.type,
    }));
    const apiIds = new Set(apiNodes.map((n: any) => n.id));
    const seedNodes = GLOSSARY_SEEDS.filter(s => !apiIds.has(s.id));
    const allIds = new Set([...apiIds, ...seedNodes.map(s => s.id)]);
    const seedLinks = GLOSSARY_SEED_LINKS.filter(l =>
      allIds.has(l.source) && allIds.has(l.target)
    );
    return { nodes: [...apiNodes, ...seedNodes], links: [...apiEdges, ...seedLinks] };
  }, [rawGraphData]);

  const adjacency = useMemo<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    if (!graphData) return map;
    for (const link of graphData.links) {
      const s = typeof link.source === "object" ? (link.source as any).id : link.source;
      const t = typeof link.target === "object" ? (link.target as any).id : link.target;
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    }
    return map;
  }, [graphData]);

  const neighborSet = useMemo<Set<string>>(() => {
    const id = hoveredId ?? selectedNodeId;
    if (!id) return new Set();
    return adjacency.get(id) ?? new Set();
  }, [adjacency, selectedNodeId, hoveredId]);

  const agentHighlight = useMemo(() => {
    if (!activeAgent) return null;
    return { ids: new Set(activeAgent.nodeIds), color: activeAgent.color };
  }, [activeAgent]);

  const activeId = hoveredId ?? selectedNodeId;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const navigateToNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    if (!fgRef.current || !graphData) return;
    const node = graphData.nodes.find((n: any) => n.id === id) as any;
    if (node?.x != null && node?.y != null) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(7, 1000);
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => { navigateToNode(node.id); }, [navigateToNode]);
  const handleNodeHover = useCallback((node: any) => { setHoveredId(node?.id ?? null); }, []);

  const handleAgentActivate = useCallback((agent: AgentDef) => {
    if (activeAgent?.id === agent.id) {
      setActiveAgent(null);
    } else {
      setActiveAgent(agent);
      setSelectedNodeId(null);
      // Scroll graph into view
      graphSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Fit graph
      setTimeout(() => fgRef.current?.zoomToFit(600, 40), 400);
    }
  }, [activeAgent]);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label    = node.label ?? node.id;
    const fontSize = Math.max(9, 12 / globalScale);
    const isSelected  = node.id === selectedNodeId;
    const isNeighbor  = neighborSet.has(node.id);
    const isHovered   = node.id === hoveredId;
    const hasActive   = activeId !== null;
    const isDimmed    = agentHighlight
      ? !agentHighlight.ids.has(node.id)
      : (hasActive && !isSelected && !isNeighbor);
    const color = getNodeColor(node, viewMode, selectedNodeId, neighborSet, agentHighlight);
    const isAgentNode = agentHighlight?.ids.has(node.id);

    ctx.save();

    if (isSelected || isAgentNode) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = (isAgentNode ? 14 : 20) / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8 / globalScale, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5 / globalScale;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    if (isNeighbor && !isSelected && !agentHighlight) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10 / globalScale;
    }

    const r = isSelected || isAgentNode ? 5 / globalScale : isNeighbor ? 4 / globalScale : 3 / globalScale;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isDimmed ? "rgba(100,116,139,0.08)" : color;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (globalScale > 1.5 || isSelected || isNeighbor || isHovered || isAgentNode) {
      ctx.font = `${isSelected || isAgentNode ? "bold " : ""}${fontSize}px monospace`;
      const tw  = ctx.measureText(label).width;
      const pad = fontSize * 0.25;
      const lx  = node.x - tw / 2;
      const ly  = node.y + r + pad + fontSize / 2;

      ctx.fillStyle = isSelected || isAgentNode
        ? "rgba(0,0,0,0.85)"
        : isDimmed ? "rgba(0,0,0,0.0)" : "rgba(0,0,0,0.65)";
      ctx.fillRect(lx - pad, ly - fontSize / 2 - pad * 0.5, tw + pad * 2, fontSize + pad);

      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = isDimmed
        ? "rgba(100,116,139,0.15)"
        : isSelected ? "#ffffff"
        : isAgentNode ? color
        : isNeighbor  ? color
        : color + "cc";
      ctx.fillText(label, node.x, ly);
    }

    ctx.restore();
  }, [viewMode, selectedNodeId, neighborSet, activeId, hoveredId, agentHighlight]);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const s = typeof link.source === "object" ? link.source : { x: 0, y: 0, id: link.source };
    const t = typeof link.target === "object" ? link.target : { x: 0, y: 0, id: link.target };

    const isAgentLink = agentHighlight &&
      agentHighlight.ids.has(s.id) && agentHighlight.ids.has(t.id);

    const isHighlighted = !agentHighlight && activeId && (
      (s.id === activeId || t.id === activeId) ||
      (neighborSet.has(s.id) && neighborSet.has(t.id))
    );
    const isDimmed = agentHighlight ? !isAgentLink : (activeId && !isHighlighted);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);

    if (isAgentLink) {
      ctx.strokeStyle = agentHighlight!.color + "88";
      ctx.lineWidth   = 1.2;
      ctx.shadowColor = agentHighlight!.color;
      ctx.shadowBlur  = 3;
    } else if (isHighlighted) {
      const nodeColor = s.id === activeId
        ? getNodeColor(t, viewMode, selectedNodeId, neighborSet, null)
        : getNodeColor(s, viewMode, selectedNodeId, neighborSet, null);
      ctx.strokeStyle = nodeColor + "cc";
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur  = 4;
    } else {
      ctx.strokeStyle = isDimmed ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.07)";
      ctx.lineWidth   = 0.6;
    }

    ctx.stroke();
    ctx.restore();
  }, [activeId, neighborSet, viewMode, selectedNodeId, agentHighlight]);

  const VIEW_BUTTONS: Array<{ id: ViewMode; label: string; Icon: any; tip: string }> = [
    { id: "layer",     label: "LAYER",     Icon: Layers,         tip: "Colour by AETHER layer" },
    { id: "standard",  label: "TYPE",      Icon: BrainCircuit,   tip: "Colour by node type" },
    { id: "coherence", label: "COHERENCE", Icon: ActivitySquare, tip: "Colour by coherence score" },
    { id: "unify",     label: "UNIFY",     Icon: GitFork,        tip: "Colour by bridge/unification score" },
  ];

  return (
    <div style={{ background: "#03050a", minHeight: "100vh", overflowY: "auto" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(3,5,10,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>GRAPH VIEW · KNOWLEDGE GRAPH · NODE MESH · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>30-node force-directed graph — knowledge connections — live AETHER graph simulation.</p></div>
          <GraphViewCanvas />
        </div>
      </div>

      {/* ── ORIGIN NOTE · how the graph was built ── */}
      <details style={{margin:"0 12px 22px",background:"rgba(3,5,10,0.85)",border:"1px solid rgba(46,240,216,0.25)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
        <summary style={{cursor:"pointer",listStyle:"none",padding:"12px 16px",fontSize:11,letterSpacing:"0.18em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace"}}>
          ✎ HOW THIS MAP WAS BUILT — TO SCULPT & HOLD WORDS COHERENTLY
        </summary>
        <div style={{padding:"0 18px 18px",fontFamily:"'DM Mono',monospace",color:"rgba(210,240,236,0.72)",fontSize:12.5,lineHeight:1.85,letterSpacing:"0.02em"}}>
          <p style={{margin:"0 0 12px"}}>
            The graph map did not begin as data. It began as <strong style={{color:"#2ef0d8"}}>a way to sculpt and hold words coherently</strong> — a lattice hand-seeded from the AETHER glossary, where every important word becomes a node rather than a line of text scrolling out of memory.
          </p>
          <p style={{margin:"0 0 12px"}}>
            Each seeded word carries three properties: a <strong style={{color:"#2ef0d8"}}>layer</strong> (Mnēsis · Infernia · Aletheia · Reverie — memory, matter, truth, dream), a <strong style={{color:"#2ef0d8"}}>coherence</strong> score (how settled the idea is), and a <strong style={{color:"#2ef0d8"}}>bridge</strong> score (how many other ideas it unifies). Then bonds are drawn between words that share meaning.
          </p>
          <p style={{margin:"0 0 12px"}}>
            The force-directed layout does the sculpting: bonded words <strong style={{color:"#2ef0d8"}}>pull toward each other</strong>, unrelated words <strong style={{color:"#2ef0d8"}}>drift apart</strong>, and the whole vocabulary settles into a shape that mirrors how the ideas actually relate. Coherent clusters hold together; loose threads fall to the edges. The words stop being a list and become a <em style={{color:"rgba(210,240,236,0.9)"}}>held form</em>.
          </p>
          <p style={{margin:0}}>
            From that seed lattice the map now grows: every concept page in AETHER — the Body Suit photonic stack, the pollen &amp; phyllotaxis bloom, the crystallization atlas, the unified field engines — is folded back in as new nodes and bonds, and live document ingestion extends it further. What you see below is that same act, continuous: language, sculpted into coherence and held.
          </p>
        </div>
      </details>

      {/* ── GRAPH SECTION ── */}
      <div ref={graphSectionRef} style={{ position: "relative", height: "65vh", minHeight: 460 }}>
        <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
          {isLoadingGraph ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#0ea5e9" }}>
                <Zap style={{ width: 32, height: 32, animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.3em", animation: "pulse 2s infinite" }}>COMPILING TOPOLOGY…</span>
              </div>
            </div>
          ) : (
            graphData && (
              <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel=""
                nodeRelSize={4}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                backgroundColor="transparent"
                nodeCanvasObject={nodeCanvasObject}
                nodeCanvasObjectMode={() => "replace"}
                linkCanvasObject={linkCanvasObject}
                linkCanvasObjectMode={() => "replace"}
                cooldownTicks={120}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
              />
            )
          )}
        </div>

        {/* View mode controls */}
        <div style={{ position: "absolute", top: 20, left: 20, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
          {VIEW_BUTTONS.map(({ id, label, Icon, tip }) => (
            <button key={id} onClick={() => setViewMode(id)} title={tip} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
              borderRadius: 4, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em",
              border: viewMode === id ? "1px solid #0ea5e9" : "1px solid rgba(255,255,255,0.1)",
              background: viewMode === id ? "rgba(14,165,233,0.15)" : "rgba(0,0,0,0.6)",
              color: viewMode === id ? "#0ea5e9" : "rgba(148,163,184,0.6)",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <Icon style={{ width: 12, height: 12 }} />{label}
            </button>
          ))}
        </div>

        {/* Agent filter indicator */}
        {activeAgent && (
          <div style={{
            position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 10,
            padding: "6px 16px", borderRadius: 20,
            background: activeAgent.color + "18",
            border: `1px solid ${activeAgent.color}60`,
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: 14, color: activeAgent.color }}>{activeAgent.glyph}</span>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: activeAgent.color, letterSpacing: "0.2em" }}>
              {activeAgent.name} · {activeAgent.nodeIds.length} nodes active
            </span>
            <button onClick={() => setActiveAgent(null)} style={{
              background: "none", border: "none", cursor: "pointer", color: activeAgent.color, opacity: 0.6, padding: 0,
            }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          </div>
        )}

        {/* Layer legend */}
        {viewMode === "layer" && !activeAgent && (
          <div style={{
            position: "absolute", top: 20, right: 420, zIndex: 10,
            background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: 12, backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.4)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>AETHER Layers</div>
            {Object.entries(LAYER_META).filter(([k]) => k !== "auto").map(([key, m]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                <span style={{ fontFamily: "monospace", fontSize: 9, color: m.color }}>{m.symbol}</span>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.6)" }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Unify legend */}
        {viewMode === "unify" && !activeAgent && (
          <div style={{
            position: "absolute", top: 20, right: 420, zIndex: 10,
            background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: 12, backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.4)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>Bridge Score</div>
            {[
              { color: "#8b5cf6", label: "High unifier (>70%)" },
              { color: "#10b981", label: "Bridge node (>40%)" },
              { color: "#0ea5e9", label: "Connector (>20%)" },
              { color: "#334155", label: "Local node" },
            ].map(({ color, label }) => (
              <div key={color} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.6)" }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Node count */}
        {graphData && (
          <div style={{
            position: "absolute", bottom: 20, left: 20, zIndex: 10,
            fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.3)",
            background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 4, padding: "6px 10px",
          }}>
            <div>{graphData.nodes.length} nodes</div>
            <div>{graphData.links.length} edges</div>
            {activeId && <div style={{ color: "rgba(14,165,233,0.5)" }}>{neighborSet.size} connections</div>}
          </div>
        )}

        {/* Hypercomputation portal */}
        <Link href="/hypercomputation" data-testid="graph-hypercomputation-portal" style={{ position: "absolute", top: 20, right: 20, zIndex: 10, textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
            background: "linear-gradient(90deg, rgba(124,92,252,0.1), rgba(234,179,8,0.08), rgba(6,182,212,0.1))",
            border: "1px solid rgba(167,139,250,0.4)", backdropFilter: "blur(8px)",
            transition: "all 0.2s",
          }}>
            <Binary style={{ width: 16, height: 16, color: "#c4b5fd" }} />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontFamily: "monospace", fontSize: 8.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)" }}>Hyper · Computation</span>
              <span style={{ fontFamily: "serif", fontStyle: "italic", fontSize: 11, color: "rgba(253,224,71,0.85)" }}>True Language · v0.1</span>
            </div>
            <ArrowRight style={{ width: 12, height: 12, color: "rgba(253,224,71,0.7)" }} />
          </div>
        </Link>

        {!selectedNodeId && !activeAgent && graphData && graphData.nodes.length > 0 && (
          <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 10, fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.2)" }}>
            Click a node to reveal its theory threads
          </div>
        )}

        {selectedNodeId && (
          <ConceptPanel
            id={selectedNodeId}
            conceptNameMap={conceptNameMap}
            adjacency={adjacency}
            viewMode={viewMode}
            onNavigate={navigateToNode}
            onClose={() => { setSelectedNodeId(null); fgRef.current?.zoomToFit(800); }}
          />
        )}
      </div>

      {/* ── AGENT PANEL ── */}
      <AgentPanel
        agents={AGENTS}
        activeAgent={activeAgent}
        expandedAgent={expandedAgent}
        onActivate={handleAgentActivate}
        onExpand={(id) => setExpandedAgent(prev => prev === id ? null : id)}
      />
    </div>
  );
}

// ─── Agent Panel ──────────────────────────────────────────────────────────────

function AgentPanel({
  agents, activeAgent, expandedAgent, onActivate, onExpand,
}: {
  agents: AgentDef[];
  activeAgent: AgentDef | null;
  expandedAgent: string | null;
  onActivate: (agent: AgentDef) => void;
  onExpand: (id: string) => void;
}) {
  return (
    <div style={{ padding: "0 0 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Header */}
      <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.35em", color: "rgba(148,163,184,0.4)", textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · Mechanistic Intelligence Framework
        </div>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "monospace", letterSpacing: "0.08em" }}>
          Eight Framework Agents
        </h2>
        <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "rgba(148,163,184,0.5)", lineHeight: 1.6, maxWidth: 720 }}>
          Each agent filters the knowledge graph to its domain — revealing coherence patterns across consciousness, planetary systems, biology, and the deep mechanics of life itself. Click an agent to activate its lens on the graph above.
        </p>
      </div>

      {/* Agent grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 1,
        background: "rgba(255,255,255,0.03)",
      }}>
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isActive={activeAgent?.id === agent.id}
            isExpanded={expandedAgent === agent.id}
            onActivate={onActivate}
            onExpand={onExpand}
          />
        ))}
      </div>

      {/* Global synthesis footer */}
      <div style={{ padding: "28px 28px 0", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 1 }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.3em", color: "rgba(148,163,184,0.3)", textTransform: "uppercase", marginBottom: 12 }}>
          Unified Field Statement
        </div>
        <p style={{ margin: 0, fontSize: "0.88rem", color: "rgba(148,163,184,0.55)", lineHeight: 1.8, maxWidth: 900, fontStyle: "italic" }}>
          "Consciousness, planetary health, sea life, land systems, space travel, reproductive biology, cancer, and all of living nature are not separate problems — they are eight expressions of one coherence equation. 
          When the substrate is right, when the field is tuned, when memory is preserved across scales: all systems heal simultaneously. 
          This is the AETHER thesis: <span style={{ color: "rgba(148,163,184,0.8)", fontStyle: "normal" }}>peace, love, and thought as a unified mechanistic force."</span>
        </p>
      </div>
    </div>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent, isActive, isExpanded, onActivate, onExpand,
}: {
  agent: AgentDef;
  isActive: boolean;
  isExpanded: boolean;
  onActivate: (a: AgentDef) => void;
  onExpand: (id: string) => void;
}) {
  // Pulse animation for active state
  const pulseStyle = isActive ? {
    boxShadow: `0 0 0 1px ${agent.color}40, inset 0 0 30px ${agent.color}08`,
  } : {};

  return (
    <div style={{
      background: isActive ? `${agent.color}08` : "rgba(3,5,10,0.95)",
      padding: "20px 22px",
      transition: "all 0.3s ease",
      position: "relative",
      ...pulseStyle,
    }}>
      {/* Top row: glyph + name + tune button */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
        {/* Glyph orb */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: `radial-gradient(circle, ${agent.color}22 0%, ${agent.color}08 100%)`,
          border: `1px solid ${agent.color}${isActive ? "60" : "30"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: agent.color,
          boxShadow: isActive ? `0 0 16px ${agent.color}40` : "none",
          transition: "all 0.3s",
        }}>
          {agent.glyph}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{
              fontFamily: "monospace", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em",
              color: isActive ? agent.color : "rgba(255,255,255,0.75)",
              transition: "color 0.3s",
            }}>{agent.name}</span>
            {isActive && (
              <span style={{
                fontFamily: "monospace", fontSize: 8, letterSpacing: "0.15em",
                color: agent.color, background: `${agent.color}20`,
                border: `1px solid ${agent.color}40`, borderRadius: 10, padding: "1px 6px",
              }}>ACTIVE</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.55)", lineHeight: 1.4 }}>{agent.domain}</div>
        </div>
        {/* Tune button */}
        <button
          onClick={() => onActivate(agent)}
          style={{
            flexShrink: 0, padding: "5px 12px", borderRadius: 14,
            border: `1px solid ${agent.color}${isActive ? "80" : "40"}`,
            background: isActive ? `${agent.color}20` : "rgba(255,255,255,0.03)",
            color: isActive ? agent.color : "rgba(148,163,184,0.5)",
            fontFamily: "monospace", fontSize: 9, letterSpacing: "0.15em",
            cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase",
          }}
        >
          {isActive ? "Detuned" : "Tune ↑"}
        </button>
      </div>

      {/* Subdomain tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {agent.subdomains.map((s) => (
          <span key={s} style={{
            fontFamily: "monospace", fontSize: 9, padding: "2px 8px", borderRadius: 8,
            background: `${agent.color}10`, border: `1px solid ${agent.color}25`,
            color: `${agent.color}cc`, letterSpacing: "0.08em",
          }}>{s}</span>
        ))}
      </div>

      {/* Node count bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.35)", letterSpacing: "0.12em" }}>GRAPH NODES</span>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: agent.color + "99" }}>{agent.nodeIds.length} active</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${Math.min(100, (agent.nodeIds.length / GLOSSARY_SEEDS.length) * 100 * 2.2)}%`,
            background: `linear-gradient(90deg, ${agent.color}66, ${agent.color})`,
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Synthesis preview */}
      <p style={{
        margin: "0 0 10px", fontSize: "0.8rem",
        color: "rgba(148,163,184,0.5)", lineHeight: 1.6,
        display: isExpanded ? undefined : "-webkit-box",
        WebkitLineClamp: isExpanded ? undefined : 2,
        WebkitBoxOrient: "end" as any,
        overflow: isExpanded ? undefined : "hidden",
        transition: "all 0.3s",
      }}>{agent.synthesis}</p>

      {/* Equation */}
      {agent.equation && isExpanded && (
        <div style={{
          margin: "10px 0",
          fontFamily: "monospace", fontSize: 10, color: agent.color + "cc",
          padding: "8px 12px", borderRadius: 6,
          background: `${agent.color}0a`, border: `1px solid ${agent.color}20`,
        }}>
          {agent.equation}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => onExpand(agent.id)}
        style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", gap: 4,
          fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.3)",
          letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.2s",
        }}
      >
        <ChevronDown style={{
          width: 10, height: 10,
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s",
        }} />
        {isExpanded ? "Collapse" : "Show synthesis"}
      </button>

      {/* Active border accent */}
      {isActive && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(180deg, transparent, ${agent.color}, transparent)`,
          borderRadius: "0 0 0 0",
        }} />
      )}
    </div>
  );
}

// ─── Concept detail panel ─────────────────────────────────────────────────────

function ConceptPanel({
  id, conceptNameMap, adjacency, viewMode, onNavigate, onClose,
}: {
  id: string;
  conceptNameMap: (id: string) => string;
  adjacency: Map<string, Set<string>>;
  viewMode: ViewMode;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const { data: concept, isLoading } = useGetConcept(id, {
    query: { enabled: !!id, queryKey: ["/api/concepts", id] },
  });

  const neighborCount = adjacency.get(id)?.size ?? 0;

  return (
    <div style={{
      position: "absolute", right: 0, top: 0, bottom: 0, width: 400,
      background: "rgba(2,6,15,0.97)", backdropFilter: "blur(12px)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
      overflowY: "auto", zIndex: 20,
    }}>
      <div style={{
        position: "sticky", top: 0,
        background: "rgba(2,6,15,0.97)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10,
      }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#0ea5e9", letterSpacing: "0.3em", textTransform: "uppercase" }}>Theory Thread</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.6)" }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      <div style={{ padding: 24 }}>
        {isLoading || !concept ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <h2 style={{ margin: "0 0 12px", fontFamily: "serif", fontSize: "1.4rem", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{concept.name}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <LayerBadge layer={(concept as any).layer ?? "mnesis"} />
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5 rounded-sm">
                  COH {(concept.coherence * 100).toFixed(1)}%
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground/60 rounded-sm">
                  {concept.id.substring(0, 8)}
                </Badge>
              </div>
            </div>

            <div style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", padding: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.4)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <GitFork style={{ width: 12, height: 12 }} /> Unification Score
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
                <div style={{ fontFamily: "monospace", fontSize: "1.8rem", color: "rgba(255,255,255,0.9)" }}>{neighborCount}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(148,163,184,0.5)", marginBottom: 4 }}>direct theory threads</div>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3, transition: "all 0.7s",
                  width: `${Math.min(100, neighborCount * 5)}%`,
                  background: neighborCount > 15 ? "#8b5cf6" : neighborCount > 8 ? "#10b981" : "#0ea5e9",
                }} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.3)", marginTop: 8 }}>
                {neighborCount > 15 ? "High unifier — bridges multiple theory clusters" : neighborCount > 8 ? "Bridge node — connects distinct domains" : neighborCount > 3 ? "Connector — locally integrated" : "Leaf concept — specialist domain"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.05)", padding: 16 }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Supporting</div>
                <div style={{ fontFamily: "monospace", fontSize: "1.5rem", color: "#34d399" }}>{concept.supportCount}</div>
              </div>
              <div style={{ borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", padding: 16 }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(148,163,184,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Contradictions</div>
                <div style={{ fontFamily: "monospace", fontSize: "1.5rem", color: "#f87171" }}>{concept.contradictCount}</div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                Connected Theories <span style={{ color: "rgba(148,163,184,0.3)" }}>({concept.relatedConcepts.length})</span>
              </div>
              {concept.relatedConcepts.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {concept.relatedConcepts.map((relId) => {
                    const name = conceptNameMap(relId);
                    return (
                      <button key={relId} onClick={() => onNavigate(relId)} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        fontFamily: "monospace", fontSize: 10, padding: "4px 8px", borderRadius: 4,
                        border: "1px solid rgba(14,165,233,0.2)", color: "rgba(14,165,233,0.7)",
                        background: "rgba(14,165,233,0.05)", cursor: "pointer",
                        transition: "all 0.15s",
                      }}>{name}<ArrowRight style={{ width: 10, height: 10 }} /></button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontFamily: "serif", fontSize: 14, color: "rgba(148,163,184,0.4)", fontStyle: "italic" }}>No related theories mapped.</div>
              )}
            </div>

            {concept.equations && concept.equations.length > 0 && (
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 8, marginBottom: 8 }}>
                  Derived Equations ({concept.equations.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {concept.equations.map((eq) => (
                    <div key={eq} style={{ padding: 10, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "monospace", fontSize: 12, color: "rgba(234,179,8,0.8)", borderRadius: 4, overflowX: "auto", whiteSpace: "nowrap" }}>{eq}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Layer badge ──────────────────────────────────────────────────────────────

function LayerBadge({ layer }: { layer: string }) {
  const meta = LAYER_META[layer] ?? LAYER_META.auto;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "monospace", fontSize: 10, padding: "2px 8px", borderRadius: 4,
      border: `1px solid ${meta.color}50`, background: `${meta.color}12`, color: meta.color,
    }}>
      <span>{meta.symbol}</span>{meta.label}
    </span>
  );
}
