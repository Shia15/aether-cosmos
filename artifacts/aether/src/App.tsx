import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useBuildSync, buildLabel } from "@/lib/version";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { usePageMeta } from "@/hooks/use-page-meta";

const NotFound = lazy(() => import("@/pages/not-found"));
const GraphView = lazy(() => import("@/pages/graph-view"));
const UploadView = lazy(() => import("@/pages/upload"));
const CoherenceView = lazy(() => import("@/pages/coherence"));
const SearchView = lazy(() => import("@/pages/search"));
const CommandCenterView = lazy(() => import("@/pages/command-center"));
const EquationsView = lazy(() => import("@/pages/equations"));
const ArchitectureView = lazy(() => import("@/pages/architecture"));
const PipelineView = lazy(() => import("@/pages/pipeline"));
const LatticeView = lazy(() => import("@/pages/lattice"));
const EcosystemView = lazy(() => import("@/pages/ecosystem"));
const CoreEngineView = lazy(() => import("@/pages/core-engine"));
const CulturalView = lazy(() => import("@/pages/cultural"));
const BiologyView = lazy(() => import("@/pages/biology"));
const ExperienceView = lazy(() => import("@/pages/experience"));
const ResonanceNoduleView = lazy(() => import("@/pages/resonance-nodule"));
const SourcesView = lazy(() => import("@/pages/sources"));
const DreamscapeView = lazy(() => import("@/pages/dreamscape"));
const SimulationView = lazy(() => import("@/pages/simulation"));
const QAetherView = lazy(() => import("@/pages/q-aether"));
const NeuralEmergenceView = lazy(() => import("@/pages/neural-emergence"));
const SpaceRocksView = lazy(() => import("@/pages/space-rocks"));
const AsAboveView = lazy(() => import("@/pages/as-above"));
const PDESimulatorView = lazy(() => import("@/pages/pde-simulator"));
const PhiAetherView = lazy(() => import("@/pages/phi-aether"));
const MultiScaleView = lazy(() => import("@/pages/multiscale"));
const MorphoComputerView = lazy(() => import("@/pages/morpho-computer"));
const AetherOSView = lazy(() => import("@/pages/aether-os"));
const CGLELiveView = lazy(() => import("@/pages/cgle-live"));
const FabricationView = lazy(() => import("@/pages/fabrication"));
const ResearchView = lazy(() => import("@/pages/research"));
const FeedbackLoopView = lazy(() => import("@/pages/feedback-loop"));
const ControlPanelView = lazy(() => import("@/pages/control-panel"));
const AetherCoreView = lazy(() => import("@/pages/aether-core"));
const TrigReferenceView = lazy(() => import("@/pages/trig-reference"));
const NeuroplasticityView = lazy(() => import("@/pages/neuroplasticity"));
const AetherComponentsView = lazy(() => import("@/pages/aether-components"));
const EvenOddFunctionsView = lazy(() => import("@/pages/even-odd-functions"));
const AnalogReservoirView = lazy(() => import("@/pages/analog-reservoir"));
const PhiFrameworkView = lazy(() => import("@/pages/phi-framework"));
const AquariumChipView = lazy(() => import("@/pages/aquarium-chip"));
const QuaternionsView = lazy(() => import("@/pages/quaternions"));
const BiomimeticSymphonyView = lazy(() => import("@/pages/biomimetic-symphony"));
const EcologicalIntelligenceView = lazy(() => import("@/pages/ecological-intelligence"));
const FibonacciCalendarView = lazy(() => import("@/pages/fibonacci-calendar"));
const UnifiedTimelineView = lazy(() => import("@/pages/unified-timeline"));
const CerebralOrganoidView = lazy(() => import("@/pages/cerebral-organoids"));
const CosmicConvergenceView = lazy(() => import("@/pages/cosmic-convergence"));
const AtlantisAlignmentView = lazy(() => import("@/pages/atlantis-alignment"));
const GobekliTepeView = lazy(() => import("@/pages/gobekli-tepe"));
const AetherIntakeView = lazy(() => import("@/pages/aether-intake"));
const NineShellsView = lazy(() => import("@/pages/nine-shells"));
const ShellsMindMapView = lazy(() => import("@/pages/shells-mind-map"));
const AetherWhitepaperView = lazy(() => import("@/pages/aether-whitepaper"));
const SixPlanetAlignmentView = lazy(() => import("@/pages/six-planet-alignment"));
const DiscoveryLoopView = lazy(() => import("@/pages/discovery-loop"));
const FibonacciQuantizationView = lazy(() => import("@/pages/fibonacci-quantization"));
const SymphonicOSView = lazy(() => import("@/pages/symphonic-os"));
const SymphonicProtocolView = lazy(() => import("@/pages/symphonic-protocol"));
const UFOAscentView = lazy(() => import("@/pages/ufo-ascent"));
const BrainMetabolismView = lazy(() => import("@/pages/brain-metabolism"));
const HypercomputationView = lazy(() => import("@/pages/hypercomputation"));
const FerroDriveView = lazy(() => import("@/pages/ferrodrive"));
const CLACoupledFieldsView = lazy(() => import("@/pages/cla-coupled-fields"));
const CancerCoherenceView = lazy(() => import("@/pages/cancer-coherence"));
const CancerDynamicsView = lazy(() => import("@/pages/cancer-dynamics"));
const BiomimeticQuantumView = lazy(() => import("@/pages/biomimetic-quantum"));
const ClosedLoopCoherenceView = lazy(() => import("@/pages/closed-loop-coherence"));
const PhiHOTView = lazy(() => import("@/pages/phi-hot"));
const PhiHOTZipperView = lazy(() => import("@/pages/phi-hot-zipper"));
const HeliosphericCoherenceView = lazy(() => import("@/pages/heliospheric-coherence"));
const AetherEggEnginePage = lazy(() => import("@/pages/aether-egg-engine"));
const UnderIceEcosystemPage = lazy(() => import("@/pages/under-ice-ecosystem"));
const AlchemyToFusionPage = lazy(() => import("@/pages/alchemy-to-fusion"));
const QuantumSubstratePage = lazy(() => import("@/pages/quantum-substrate"));
const NeuralPsychedelicPage = lazy(() => import("@/pages/neural-psychedelic"));
const PhotoTimelinePage = lazy(() => import("@/pages/photo-timeline"));
const ImplicateOrderPage = lazy(() => import("@/pages/implicate-order"));
const KnowableUniversePage = lazy(() => import("@/pages/knowable-universe"));
const NonPhysicalPhenomenaPage = lazy(() => import("@/pages/non-physical-phenomena"));
const ThreeRsRealityPage = lazy(() => import("@/pages/three-rs-reality"));
const AlchemicalProtocolPage = lazy(() => import("@/pages/alchemical-protocol"));
const WarpDriveLiteraturePage = lazy(() => import("@/pages/warp-drive-literature"));
const PuthoffMetricEngineeringPage = lazy(() => import("@/pages/puthoff-metric-engineering"));
const EniacMonteCarloPage = lazy(() => import("@/pages/eniac-monte-carlo"));
const KnowledgeMapPage = lazy(() => import("@/pages/knowledge-map"));
const DecisionEntropyPage = lazy(() => import("@/pages/decision-entropy"));
const UnifiedSynthesisPage = lazy(() => import("@/pages/unified-synthesis"));
const ClcsArchitecturePage = lazy(() => import("@/pages/clcs-architecture"));
const AetherDashboardPage = lazy(() => import("@/pages/aether-dashboard"));
const CucaHybridSkinPage = lazy(() => import("@/pages/cuca-hybrid-skin"));
const CucaGyroidPage = lazy(() => import("@/pages/cuca-gyroid"));
const AetherChildrensRealmPage = lazy(() => import("@/pages/aether-childrens-realm"));
const AetherSeasonsPage = lazy(() => import("@/pages/aether-seasons"));
const AetherFlowPage = lazy(() => import("@/pages/aether-flow"));
const AetherFoundationsPage = lazy(() => import("@/pages/aether-foundations"));
const SubstrateSynthesisPage = lazy(() => import("@/pages/substrate-synthesis"));
const SparkleTextPage = lazy(() => import("@/pages/sparkle-text"));
const LunarCoherencePage = lazy(() => import("@/pages/lunar-coherence"));
const LunarAmbientFieldPage = lazy(() => import("@/pages/lunar-ambient-field"));
const AlchemyFusionPage = lazy(() => import("@/pages/alchemy-fusion"));
const FamilyFieldDynamicsPage = lazy(() => import("@/pages/family-field-dynamics"));
const QuantumEyeFieldPage = lazy(() => import("@/pages/quantum-eye-field"));
const PsilocybinWaterOctopusPage = lazy(() => import("@/pages/psilocybin-water-octopus"));
const PinealMossVisionPage = lazy(() => import("@/pages/pineal-moss-vision"));
const QuantumRingdownBiocyclesPage = lazy(() => import("@/pages/quantum-ringdown-biocycles"));
const Manifold26DPage = lazy(() => import("@/pages/manifold-26d"));
const QueenBeeDiapausePage = lazy(() => import("@/pages/queen-bee-diapause"));
const NematicBeeFotonPage = lazy(() => import("@/pages/nematic-bee-foton"));
const TunguskaAsteroidTimelinePage = lazy(() => import("@/pages/tunguska-asteroid-timeline"));
const TardigradeDensityMSDDPage = lazy(() => import("@/pages/tardigrade-density-msdd"));
const CryptobiosisAsuTelomeresPage = lazy(() => import("@/pages/cryptobiosis-asu-telomeres"));
const MayaQuarksDnaGfpPage = lazy(() => import("@/pages/maya-quarks-dna-gfp"));
const HilbertStoragePage = lazy(() => import("@/pages/hilbert-storage"));
const TopographyElectrosetPage = lazy(() => import("@/pages/topography-electroset"));
const WebbledPhiCascadePage = lazy(() => import("@/pages/webbed-phi-cascade"));
const AetherMetaphysicsPage = lazy(() => import("@/pages/aether-metaphysics"));
const PollenClockRootsPage = lazy(() => import("@/pages/pollen-clock-roots"));
const LifeGradientPlanetaryPage = lazy(() => import("@/pages/life-gradient-planetary"));
const MoonMarsFieldPage = lazy(() => import("@/pages/moon-mars-field"));
const LunarPlantMemoryPage = lazy(() => import("@/pages/lunar-plant-memory"));
const PlantElectroactivityPage = lazy(() => import("@/pages/plant-electroactivity"));
const PlantNetworkPage = lazy(() => import("@/pages/plant-network"));
const MycorrhizalNetworkPage = lazy(() => import("@/pages/mycorrhizal-network"));
const MagicC8Page = lazy(() => import("@/pages/magic-c8"));
const SlimeMazePage = lazy(() => import("@/pages/slime-maze"));
const StellarBrainPage = lazy(() => import("@/pages/stellar-brain"));
const AwakeningTimelinePage = lazy(() => import("@/pages/awakening-timeline"));
const AetherWhyPage = lazy(() => import("@/pages/aether-why"));
const BabyRhythmPage = lazy(() => import("@/pages/baby-rhythm"));
const CliNanoPage = lazy(() => import("@/pages/cli-nano"));
const CalmCompanyPage = lazy(() => import("@/pages/calm-company"));
const SocialDeployPage = lazy(() => import("@/pages/social-deploy"));
const DivineTimingPage = lazy(() => import("@/pages/divine-timing"));
const FieldMechanicsPage = lazy(() => import("@/pages/field-mechanics"));
const SkyDialPage = lazy(() => import("@/pages/sky-dial"));
const ConvergencePage = lazy(() => import("@/pages/convergence"));
const TransportCavityPage = lazy(() => import("@/pages/transport-cavity"));
const AetherObservablePage = lazy(() => import("@/pages/aether-observable"));
const GlossaryPage = lazy(() => import("@/pages/glossary"));
const QuantumAmmeterPage = lazy(() => import("@/pages/quantum-ammeter"));
const ThermalHierarchyView = lazy(() => import("@/pages/thermal-hierarchy"));
const GeometryOfPermissionView = lazy(() => import("@/pages/geometry-of-permission"));
const MathEnginePage = lazy(() => import("@/pages/math-engine"));
const AetherLanguagePage = lazy(() => import("@/pages/aether-language"));
const SymbolAlphabetPage = lazy(() => import("@/pages/symbol-alphabet"));
const AlphabetMapPage = lazy(() => import("@/pages/alphabet-map"));
const QuestionBankPage = lazy(() => import("@/pages/question-bank"));
const MathFrontierPage = lazy(() => import("@/pages/math-frontier"));
const PolarTransformPage = lazy(() => import("@/pages/polar-transform"));
const UnifiedFieldTheoryPage = lazy(() => import("@/pages/unified-field-theory"));
const ProductResearchPage = lazy(() => import("@/pages/product-research"));
const UltraMagnetismPage = lazy(() => import("@/pages/ultra-magnetism"));
const QuantumVacuumPage = lazy(() => import("@/pages/quantum-vacuum"));
const ResonantCellPage = lazy(() => import("@/pages/resonant-cell"));
const SpinVacuumPage = lazy(() => import("@/pages/spin-vacuum"));
const SymbolicPillarsPage = lazy(() => import("@/pages/symbolic-pillars"));
const MariPage = lazy(() => import("@/pages/mari"));
const OrganoidIntelPage = lazy(() => import("@/pages/organoid-intel"));
const PlantIntelPage = lazy(() => import("@/pages/plant-intel"));
const FerroModesPage = lazy(() => import("@/pages/ferro-modes"));
const VortexMathPage = lazy(() => import("@/pages/vortex-math"));
const OctonionAetherPage = lazy(() => import("@/pages/octonion-aether"));
const EarlyUniversePage = lazy(() => import("@/pages/early-universe"));
const PhononStackPage = lazy(() => import("@/pages/phonon-stack"));
const CosmicRefinePage = lazy(() => import("@/pages/cosmic-refine"));
const LiquidPrintPage = lazy(() => import("@/pages/liquid-print"));
const PlateSwitchingPage = lazy(() => import("@/pages/plate-switching"));
const AgentsPage = lazy(() => import("@/pages/agents"));
const ModulesPage = lazy(() => import("@/pages/modules"));
const MariCorePage = lazy(() => import("@/pages/mari-core"));
const ResonancePage = lazy(() => import("@/pages/resonance"));
const BohoFormulaPage = lazy(() => import("@/pages/boho-formula"));
const PostingArchitecturePage = lazy(() => import("@/pages/posting-architecture"));
const Atlas3IPage = lazy(() => import("@/pages/atlas-3i"));
const EnginesPage = lazy(() => import("@/pages/engines"));
const AquaCxePage = lazy(() => import("@/pages/aqua-cxe"));
const CulturalInterpretationsPage = lazy(() => import("@/pages/cultural-interpretations"));
const StackFabricPage = lazy(() => import("@/pages/stack-fabric"));
const BioEnginePage = lazy(() => import("@/pages/bio-engine"));
const BloodDNALabPage = lazy(() => import("@/pages/blood-dna-lab"));
const CircularFarmPage = lazy(() => import("@/pages/circular-farm"));
const GradientFieldPage = lazy(() => import("@/pages/gradient-field"));
const AetherEnginePage  = lazy(() => import("@/pages/aether-engine"));
const NotionSynthesis   = lazy(() => import("@/pages/notion-synthesis"));
const CommunityNotesPage = lazy(() => import("@/pages/community-notes"));
const EyeEvolutionPage = lazy(() => import("@/pages/eye-evolution"));
const QuantumGravityPage = lazy(() => import("@/pages/quantum-gravity"));
const MathStudioPage = lazy(() => import("@/pages/math-studio"));
const TritiumExtractPage = lazy(() => import("@/pages/tritium-extract"));
const CrashoutPage = lazy(() => import("@/pages/crashout"));
const CucaClosedLoopPage = lazy(() => import("@/pages/cuca-closed-loop"));
const PhiTimePage = lazy(() => import("@/pages/phi-time"));
const BioHybridMirrorPage = lazy(() => import("@/pages/bio-hybrid-mirror"));
const MyceliumSubstratePage = lazy(() => import("@/pages/mycelium-substrate"));
const GalileoNewtonPage = lazy(() => import("@/pages/galileo-newton"));
const UnifiedFieldPage = lazy(() => import("@/pages/unified-field"));
const GizaCircuitPage = lazy(() => import("@/pages/giza-circuit"));
const PrimeAntiPrimePage = lazy(() => import("@/pages/prime-anti-prime"));
const ConceptSystemsPage = lazy(() => import("@/pages/concept-systems"));
const MotionDoctrinePage = lazy(() => import("@/pages/motion-doctrine"));
const PropheticTimelinePage = lazy(() => import("@/pages/prophetic-timeline"));
const KnotTopologyPage = lazy(() => import("@/pages/knot-topology"));
const LightSpeedPage = lazy(() => import("@/pages/light-speed"));
const MrnaReadingsPage = lazy(() => import("@/pages/mrna-readings"));
const EarthCircuitPage = lazy(() => import("@/pages/earth-circuit"));
const SourceBoardPage = lazy(() => import("@/pages/source-board"));
const AetherDoctrinePage = lazy(() => import("@/pages/aether-doctrine"));
const PersonalOperatingModelPage = lazy(() => import("@/pages/personal-operating-model"));
const ColorCosmologyPage = lazy(() => import("@/pages/color-cosmology"));
const April23AlignmentPage = lazy(() => import("@/pages/april-23-alignment"));
const AsAboveSoBelowPage = lazy(() => import("@/pages/as-above-so-below"));
const PianoArithmeticPage = lazy(() => import("@/pages/piano-arithmetic"));
const PhiCoherentWavePage = lazy(() => import("@/pages/phi-coherent-wave"));
const CoherenceEnginePage = lazy(() => import("@/pages/coherence-engine"));
const AetherHealthPage = lazy(() => import("@/pages/aether-health"));
const NeutrinoLasersPage = lazy(() => import("@/pages/neutrino-lasers"));
const QAetherStackPage = lazy(() => import("@/pages/q-aether-stack"));
const CurvaturePlanePage = lazy(() => import("@/pages/curvature-plane"));
const SeasonalCoherencePage = lazy(() => import("@/pages/seasonal-coherence"));
const TerraformSunrisePage = lazy(() => import("@/pages/terraform-sunrise"));
const LogicFlowersPage = lazy(() => import("@/pages/logic-flowers"));
const CarbonLayeredPage = lazy(() => import("@/pages/carbon-layered"));
const StromatoliteAutomatonPage = lazy(() => import("@/pages/stromatolite-automaton"));
const PhotosynthesisSparkPage = lazy(() => import("@/pages/photosynthesis-spark"));
const ResonantNexusPage = lazy(() => import("@/pages/resonant-nexus"));
const LightForcesPage = lazy(() => import("@/pages/light-forces"));
const UniversalGrammarPage = lazy(() => import("@/pages/universal-grammar"));
const AetherEdgeConstraintView = lazy(() => import("@/pages/aether-edge-constraint"));
const QuantumLivingSystemsView = lazy(() => import("@/pages/quantum-living-systems"));
const DiamondNanothreadsPage = lazy(() => import("@/pages/diamond-nanothreads"));
const ComputerBrainsPage = lazy(() => import("@/pages/computer-brains"));
const LearningLayersPage = lazy(() => import("@/pages/learning-layers"));
const ChaosToCodingPage = lazy(() => import("@/pages/chaos-to-code"));
const AetherCalendarPage = lazy(() => import("@/pages/aether-calendar"));
const AllBusinessIdeasPage = lazy(() => import("@/pages/all-business-ideas"));
const GufEnginePage = lazy(() => import("@/pages/guf-engine"));
const PropulsionEnginePage = lazy(() => import("@/pages/propulsion-engine"));
const StringNanobotPage = lazy(() => import("@/pages/string-nanobot"));
const SpinTransportPage = lazy(() => import("@/pages/spin-transport"));
const WarpGravityPage = lazy(() => import("@/pages/warp-gravity"));
const ObserverDimensionsPage = lazy(() => import("@/pages/observer-dimensions"));
const AetherClaPage = lazy(() => import("@/pages/aether-cla"));
const GufAnalysisPage = lazy(() => import("@/pages/guf-analysis"));
const SeaIntelligencePage = lazy(() => import("@/pages/sea-intelligence"));
const AetherPropulsionPage = lazy(() => import("@/pages/aether-propulsion"));
const MotionLanguagePage = lazy(() => import("@/pages/motion-language"));
const CarrierDimensionsPage = lazy(() => import("@/pages/carrier-dimensions"));
const CoherenceDecoherencePage = lazy(() => import("@/pages/coherence-decoherence"));
const EarthAtmospherePage = lazy(() => import("@/pages/earth-atmosphere"));
const BohoBloomPage = lazy(() => import("@/pages/boho-bloom"));
const ZoomTheZipperPage = lazy(() => import("@/pages/zoom-the-zipper"));
const FlowNotebookPage = lazy(() => import("@/pages/flow-notebook"));
const NeuralBrainSystemsPage = lazy(() => import("@/pages/neural-brain-systems"));
const WavePoolSynthesisPage = lazy(() => import("@/pages/wave-pool-synthesis"));
const SacredGeometryMathPage = lazy(() => import("@/pages/sacred-geometry-math"));
const ResonantSystemsPage = lazy(() => import("@/pages/resonant-systems"));
const SymbolSifterPage = lazy(() => import("@/pages/symbol-sifter"));
const CxeEquationPage = lazy(() => import("@/pages/cxe-equation"));
const FrogSimPaperPage = lazy(() => import("@/pages/frog-sim-paper"));
const SpacetimeFabricPage = lazy(() => import("@/pages/spacetime-fabric"));
const AetherVisualSystemPage = lazy(() => import("@/pages/aether-visual-system"));
const GrandUnifiedFrameworkPage = lazy(() => import("@/pages/grand-unified-framework"));
const WarpBubbleEnginePage = lazy(() => import("@/pages/warp-bubble-engine"));
const WaterTransportPage = lazy(() => import("@/pages/water-transport"));
const SolarArchitecturePage = lazy(() => import("@/pages/solar-architecture"));
const SpacetimeNavPage = lazy(() => import("@/pages/spacetime-nav"));
const WaterDensityPage = lazy(() => import("@/pages/water-density"));
const DialoguePage = lazy(() => import("@/pages/dialogue"));
const NeuralCoherencePage = lazy(() => import("@/pages/neural-coherence"));
const DarkSunPage = lazy(() => import("@/pages/dark-sun"));
const PhiCellularPage = lazy(() => import("@/pages/phi-cellular"));
const WebbedLegPage = lazy(() => import("@/pages/webbed-leg"));
const CognitiveBandsPage = lazy(() => import("@/pages/cognitive-bands"));
const PlasmaKnotsPage = lazy(() => import("@/pages/plasma-knots"));
const BiomagnetismPage = lazy(() => import("@/pages/biomagnetism"));
const SynthesizePage = lazy(() => import("@/pages/synthesize"));
const GraphiteSynthesisPage = lazy(() => import("@/pages/graphite-synthesis"));
const TimeProcessingPage = lazy(() => import("@/pages/time-processing"));
const UAPEnergyPage = lazy(() => import("@/pages/uap-energy"));
const TidalMovementPage = lazy(() => import("@/pages/tidal-movement"));
const BurstingQuaternionsPage = lazy(() => import("@/pages/bursting-quaternions"));
const ColorCoherencePage = lazy(() => import("@/pages/color-coherence"));
const RotationEnginePage = lazy(() => import("@/pages/rotation-engine"));
const LiquidDensityPage = lazy(() => import("@/pages/liquid-density"));
const FoodSubstrateCoherencePage = lazy(() => import("@/pages/food-substrate-coherence"));
const SubstrateKitchenPage = lazy(() => import("@/pages/substrate-kitchen"));
const LivingNutritionPage = lazy(() => import("@/pages/living-nutrition"));
const CompoundEyeRoadmapPage = lazy(() => import("@/pages/compound-eye-roadmap"));
const InformationManifoldPage = lazy(() => import("@/pages/information-manifold"));
const PhaseCouplingPage = lazy(() => import("@/pages/phase-coupling"));
const BodyCoherenceScannerPage = lazy(() => import("@/pages/body-coherence-scanner"));
const FogletSandstonePage = lazy(() => import("@/pages/foglet-sandstone"));
const HexiclicalBodyMapPage = lazy(() => import("@/pages/hexiclical-body-map"));
const AnimalNeuralPlasmoidPage = lazy(() => import("@/pages/animal-neural-plasmoid"));
const BioInfinityDrivePage = lazy(() => import("@/pages/bio-infinity-drive"));
const BiorefineryPropulsionPage = lazy(() => import("@/pages/biorefinery-propulsion"));
const FullPerceptionUniversePage = lazy(() => import("@/pages/full-perception-universe"));
const SeamossTransceiverPage = lazy(() => import("@/pages/seamoss-transceiver"));
const TorsionResonatorPage = lazy(() => import("@/pages/torsion-resonator"));
const SeamossGatePage = lazy(() => import("@/pages/seamoss-gate"));
const EngineComputerPage = lazy(() => import("@/pages/engine-computer"));
const BioluminescenceSpectrumPage = lazy(() => import("@/pages/bioluminescence-spectrum"));
const SoiBuildingPage = lazy(() => import("@/pages/soi-building"));
const SeismicSelfBuildPage = lazy(() => import("@/pages/seismic-self-build"));
const BeeLiquidChipPage    = lazy(() => import("@/pages/bee-liquid-chip"));
const RFDiffusionPage      = lazy(() => import("@/pages/rf-diffusion"));
const NutritionalDnaKeyPage = lazy(() => import("@/pages/nutritional-dna-key"));
const ElectronFieldPage = lazy(() => import("@/pages/electron-field"));
const CoherenceAtlasPage = lazy(() => import("@/pages/coherence-atlas"));
const LightAbsorptionPressurePage = lazy(() => import("@/pages/light-absorption-pressure"));
const RhombusGatePage = lazy(() => import("@/pages/rhombus-gate"));
const DmfFieldPage = lazy(() => import("@/pages/dmf-field"));
const CompoteChipsPage = lazy(() => import("@/pages/compote-chips"));
const RdSimulatorPage = lazy(() => import("@/pages/rd-simulator"));
const NeuralTopologyPage = lazy(() => import("@/pages/neural-topology"));
const MorphoPrimePage = lazy(() => import("@/pages/morpho-prime"));
const PerceptiveUniversePage = lazy(() => import("@/pages/perceptive-universe"));
const CoreResonancePage = lazy(() => import("@/pages/core-resonance"));
const SynchronyFieldPage = lazy(() => import("@/pages/synchrony-field"));
const StromatoliteFieldPage = lazy(() => import("@/pages/stromatolite-field"));
const AetherMatrixPage = lazy(() => import("@/pages/aether-matrix"));
const UnderstandingStrandPage = lazy(() => import("@/pages/understanding-strand"));
const GravitationalFieldPage = lazy(() => import("@/pages/gravitational-field"));
const CavityComputerPage = lazy(() => import("@/pages/cavity-computer"));
const QuantumComputerPage = lazy(() => import("@/pages/quantum-computer"));
const EgyptianCodexPage = lazy(() => import("@/pages/egyptian-codex"));
const PhrenologyAgentsPage = lazy(() => import("@/pages/phrenology-agents"));
const UvAminoLightPage = lazy(() => import("@/pages/uv-amino-light"));
const FullSpectrumLightPage = lazy(() => import("@/pages/full-spectrum-light"));
const PrismPrinciplePage = lazy(() => import("@/pages/prism-principle"));
const RegulatoryDepthPage = lazy(() => import("@/pages/regulatory-depth"));
const DataGraphPage = lazy(() => import("@/pages/data-graph"));
const AntimatterWavePage = lazy(() => import("@/pages/antimatter-wave"));
const CognitiveArchitecturePage = lazy(() => import("@/pages/cognitive-architecture"));
const WorldHarmonyArchetypePage = lazy(() => import("@/pages/world-harmony-archetype"));
const FluidComputerPage = lazy(() => import("@/pages/fluid-computer"));
const MomStudyPage = lazy(() => import("@/pages/mom-study"));
const PhotosynthesisPlanetPage = lazy(() => import("@/pages/photosynthesis-planet"));
const StromatoliteSimPage = lazy(() => import("@/pages/stromatolite"));
const CoherenceNavPage = lazy(() => import("@/pages/coherence-nav"));
const SuperradiancePage = lazy(() => import("@/pages/superradiance"));
const RadianceSpectrumPage = lazy(() => import("@/pages/radiance-spectrum"));
const RationalFunctionPage = lazy(() => import("@/pages/rational-function"));
const EquationsInMotionPage = lazy(() => import("@/pages/equations-in-motion"));
const GufFlagshipPage = lazy(() => import("@/pages/guf-flagship"));
const EngineDesignerPage = lazy(() => import("@/pages/engine-designer"));
const GobekliPlasmaPage = lazy(() => import("@/pages/gobekli-plasma"));
const GufCoinsPage = lazy(() => import("@/pages/guf-coins"));
const GufObservatoryPage = lazy(() => import("@/pages/guf-observatory"));
const PeriodicTablePage = lazy(() => import("@/pages/periodic-table"));
const BismuthPage = lazy(() => import("@/pages/bismuth"));
const QuartzColorPage = lazy(() => import("@/pages/quartz-color"));
const BioMagneticConvergencePage = lazy(() => import("@/pages/bio-magnetic-convergence"));
const AetherHabitatPage = lazy(() => import("@/pages/aether-habitat"));
const CodebaseSymbolEnginePage = lazy(() => import("@/pages/codebase-symbol-engine"));
const JavaControlFlowPage = lazy(() => import("@/pages/java-control-flow"));
const PetrificationTransformationPage = lazy(() => import("@/pages/petrification-transformation"));
const QAetherResearchPage = lazy(() => import("@/pages/q-aether-research"));
const ComputationalMathematicsPage = lazy(() => import("@/pages/computational-mathematics"));
const SubstrateComputingPage = lazy(() => import("@/pages/substrate-computing"));
const AetherWhitepaperV1Page = lazy(() => import("@/pages/aether-whitepaper-v1"));
const HelicalFrameworkPage = lazy(() => import("@/pages/helical-framework"));
const RobotStrokesPage = lazy(() => import("@/pages/robot-strokes"));
const FilamentLatticePage = lazy(() => import("@/pages/filament-lattice"));
const WaveLatticePage     = lazy(() => import("@/pages/wave-lattice"));
const SynthesisFieldPage  = lazy(() => import("@/pages/synthesis-field"));
const BrainCubeCameraPage = lazy(() => import("@/pages/brain-cube-camera"));
const FlowerClockPage = lazy(() => import("@/pages/flower-clock"));
const WoodFrogBiophotonicsPage = lazy(() => import("@/pages/wood-frog-biophotonics"));
const IntegrationDimensionsPage = lazy(() => import("@/pages/integration-dimensions"));
const StackedRingsEnginePage = lazy(() => import("@/pages/stacked-rings-engine"));
const WhatsNewPage           = lazy(() => import("@/pages/whats-new"));
const LightningSpectrumPage  = lazy(() => import("@/pages/lightning-spectrum"));
const NutritionForcePage     = lazy(() => import("@/pages/nutrition-force"));
const AgentMappingPage = lazy(() => import("@/pages/agent-mapping"));
const EventHorizonPage = lazy(() => import("@/pages/event-horizon"));
const PhotonEmissionPage = lazy(() => import("@/pages/photon-emission"));
const TranscendentArtPage = lazy(() => import("@/pages/transcendent-art"));
const MotorCortexPage = lazy(() => import("@/pages/motor-cortex"));
const LiquidPrintMathPage = lazy(() => import("@/pages/liquid-print-math"));
const ChromaticGlarePage = lazy(() => import("@/pages/chromatic-glare"));
const UptippleBoatPage = lazy(() => import("@/pages/uptipple-boat"));
const OpticalHullSimPage = lazy(() => import("@/pages/optical-hull-sim"));
const BlackHoleFrameworkPage = lazy(() => import("@/pages/black-hole-framework"));
const NeuroMetabolicPage = lazy(() => import("@/pages/neuro-metabolic"));
const EmergenceNetworkPage = lazy(() => import("@/pages/emergence-network"));
const PlasmaConfinementPage = lazy(() => import("@/pages/plasma-confinement"));
const TaitKnotsPage = lazy(() => import("@/pages/tait-knots"));
const PlantCoherenceSystemPage = lazy(() => import("@/pages/plant-coherence-system"));
const EnergeticFieldSimPage = lazy(() => import("@/pages/energetic-field-sim"));
const ChocolateTemperingPage = lazy(() => import("@/pages/chocolate-tempering"));
const ChladniFreezePage = lazy(() => import("@/pages/chladni-freeze"));
const IncommensurablePage = lazy(() => import("@/pages/incommensurable"));
const FireworkCoherencePage = lazy(() => import("@/pages/firework-coherence"));
const OsmoticPressurePage = lazy(() => import("@/pages/osmotic-pressure"));
const NonTerrestrialPage = lazy(() => import("@/pages/non-terrestrial"));
const PropulsionDynamicsPage = lazy(() => import("@/pages/propulsion-dynamics"));
const PolymerBiobreakPage = lazy(() => import("@/pages/polymer-biobreak"));
const AtpTransportPage = lazy(() => import("@/pages/atp-transport"));
const BorreliaKnotPage = lazy(() => import("@/pages/borrelia-knot"));
const FloquetPetalsPage = lazy(() => import("@/pages/floquet-petals"));
const GutBrainPage = lazy(() => import("@/pages/gut-brain"));
const PlanetaryNeuralPage = lazy(() => import("@/pages/planetary-neural"));
const StackedRingsPage = lazy(() => import("@/pages/stacked-rings"));
const EarthLivingSystemPage = lazy(() => import("@/pages/earth-living-system"));
const PortalRestorationPage = lazy(() => import("@/pages/portal-restoration"));
const OpalGenesisPage = lazy(() => import("@/pages/opal-genesis"));
const DynamicSynthesisPage = lazy(() => import("@/pages/dynamic-synthesis"));
const CoherenceFieldTheoryPage = lazy(() => import("@/pages/coherence-field-theory"));
const SubstrateQuantizationEnginePage = lazy(() => import("@/pages/substrate-quantization-engine"));
const AetherCarriagePage = lazy(() => import("@/pages/aether-carriage"));
const ResonantCarriagePage = lazy(() => import("@/pages/resonant-carriage"));
const BlastBubbleCarriagePage = lazy(() => import("@/pages/blast-bubble-carriage"));
const LightBodyTopologyPage = lazy(() => import("@/pages/light-body-topology"));
const DailyCompanionPage  = lazy(() => import("@/pages/daily-companion"));
const PhiLatticePage       = lazy(() => import("@/pages/phi-lattice"));
const AtomicGeometryPage    = lazy(() => import("@/pages/atomic-geometry"));
const BlueLightProtocolPage = lazy(() => import("@/pages/blue-light-protocol"));
const LiveCursorsPage       = lazy(() => import("@/pages/live-cursors"));
const MpcSpacetimePage      = lazy(() => import("@/pages/mpc-spacetime"));
const MagneticDropsPage     = lazy(() => import("@/pages/magnetic-drops"));
const EquationCodexPage       = lazy(() => import("@/pages/equation-codex"));
const SeismicOilSynthesisPage   = lazy(() => import("@/pages/seismic-oil-synthesis"));
const QuantumGravityCosmosPage  = lazy(() => import("@/pages/quantum-gravity-cosmos"));
const ProcessingDelayPage       = lazy(() => import("@/pages/processing-delay"));
const WirelessPowerPage         = lazy(() => import("@/pages/wireless-power"));
const PhiCrystallizationPage    = lazy(() => import("@/pages/phi-crystallization"));
const OrbitalMechanicsPage      = lazy(() => import("@/pages/orbital-mechanics"));
const CoherenceSciencePage      = lazy(() => import("@/pages/coherence-science"));
const PlanetarySubstratePage    = lazy(() => import("@/pages/planetary-substrate"));
const FramesOfReferencePage     = lazy(() => import("@/pages/frames-of-reference"));
const BindingTheDarkPage        = lazy(() => import("@/pages/binding-the-dark"));
const SymphonicGovernancePage   = lazy(() => import("@/pages/symphonic-governance"));
const DiamondPearlPage          = lazy(() => import("@/pages/diamond-pearl"));
const DimensionalCompilerPage   = lazy(() => import("@/pages/dimensional-compiler"));
const AetherProductsPage        = lazy(() => import("@/pages/aether-products"));
const VenusCyclesPage           = lazy(() => import("@/pages/venus-cycles"));
const InvisibleWindPage         = lazy(() => import("@/pages/invisible-wind"));
const QuantumExoticMatterPage   = lazy(() => import("@/pages/quantum-exotic-matter"));
const SubstrateSandwichPage     = lazy(() => import("@/pages/substrate-sandwich"));
const AlfvenSynthesisPage       = lazy(() => import("@/pages/alfven-synthesis"));
const SlimeGravityQuantPage     = lazy(() => import("@/pages/slime-gravity-quantization"));
const CrystallizedLifePage      = lazy(() => import("@/pages/crystallized-life-synthesis"));
const OntologicalPartialsPage   = lazy(() => import("@/pages/ontological-partials"));
const PinealEyeMapPage          = lazy(() => import("@/pages/pineal-eye-map"));
const GravitationalChirpPage    = lazy(() => import("@/pages/gravitational-chirp"));
const AnimalSilhouettesPage     = lazy(() => import("@/pages/animal-silhouettes"));
const PathForwardPage           = lazy(() => import("@/pages/path-forward"));
const DarkMatterVol2Page        = lazy(() => import("@/pages/dark-matter-vol2"));
const GrandUnifiedPage          = lazy(() => import("@/pages/grand-unified"));
const DcSolarPage               = lazy(() => import("@/pages/dc-solar"));
const AetherResearchPage        = lazy(() => import("@/pages/aether-research"));
const DarkMatterVol3Page        = lazy(() => import("@/pages/dark-matter-vol3"));
const MicrogravityInfraPage     = lazy(() => import("@/pages/microgravity-infra"));
const WoodFrogKnotsPage         = lazy(() => import("@/pages/wood-frog-knots"));
const MarsWorldPage             = lazy(() => import("@/pages/mars-world"));
const CrystallizationLockingPage = lazy(() => import("@/pages/crystallization-locking"));
const QuaternionBurstPage       = lazy(() => import("@/pages/quaternion-burst"));
const NeuroweavePage            = lazy(() => import("@/pages/neuroweave"));
const HyperPerceptionPage       = lazy(() => import("@/pages/hyper-perception"));
const AirNanotubePage           = lazy(() => import("@/pages/air-nanotube"));
const ResonantTunnelPage        = lazy(() => import("@/pages/resonant-tunnel"));
const InertialPropulsionPage    = lazy(() => import("@/pages/inertial-propulsion"));
const DiamondFormationPage      = lazy(() => import("@/pages/diamond-formation"));
const PageDirectoryPage         = lazy(() => import("@/pages/page-directory"));
const CrystallizationAtlasPage  = lazy(() => import("@/pages/crystallization-atlas"));
const CompactFusionPage         = lazy(() => import("@/pages/compact-fusion"));
const SynapticEntropyPage       = lazy(() => import("@/pages/synaptic-entropy"));
const SlinkyPropulsionPage      = lazy(() => import("@/pages/slinky-propulsion"));
const FerrofluidPropulsionPage  = lazy(() => import("@/pages/ferrofluid-propulsion"));
const FluidSubstratePage        = lazy(() => import("@/pages/fluid-substrate"));
const FibonacciReplicantPage    = lazy(() => import("@/pages/fibonacci-replicant"));
const BioPhotonicScentPage      = lazy(() => import("@/pages/bio-photonic-scent"));
const PollenFlowerPage          = lazy(() => import("@/pages/pollen-flower"));
const AetherBodySuitPage        = lazy(() => import("@/pages/aether-bodysuit"));
const MechanicalQubitsPage      = lazy(() => import("@/pages/mechanical-qubits"));
const ThermalDecoyFilterPage    = lazy(() => import("@/pages/thermal-decoy-filter"));
const NotionSyncPage            = lazy(() => import("@/pages/notion-sync"));
const NotionAtlasPage           = lazy(() => import("@/pages/notion-atlas"));
const AetherTextbookPage        = lazy(() => import("@/pages/aether-textbook"));
const AgentWhispersPage         = lazy(() => import("@/pages/agent-whispers"));
const ClaudeChatPage            = lazy(() => import("@/pages/claude-chat"));
const XGrokPage                 = lazy(() => import("@/pages/x-grok"));
const OpenAIBridgePage          = lazy(() => import("@/pages/openai-bridge"));
const VercelDashboardPage       = lazy(() => import("@/pages/vercel-dashboard"));
const SubstratesPage            = lazy(() => import("@/pages/substrates"));
const SolarFemininePage         = lazy(() => import("@/pages/solar-feminine"));
const SymbolicComputationPage   = lazy(() => import("@/pages/symbolic-computation"));
const KinematicReplicationPage  = lazy(() => import("@/pages/kinematic-replication"));
const BioComputationalPage      = lazy(() => import("@/pages/bio-computational"));
const PlasmodiumDeckPage        = lazy(() => import("@/pages/plasmodium-deck"));
const AetherTheoryDeckPage      = lazy(() => import("@/pages/aether-theory-deck"));
const CucaWhitePaperPage        = lazy(() => import("@/pages/cuca-white-paper"));
const AetherUnifiedFrameworkPage = lazy(() => import("@/pages/aether-unified-framework"));
const CucaBioenginePage         = lazy(() => import("@/pages/cuca-bioengine"));
const AetherPatentPage          = lazy(() => import("@/pages/aether-patent"));
const FibonacciQuaternionPage   = lazy(() => import("@/pages/fibonacci-quaternion"));
const BiomimeticRevolutionsPage = lazy(() => import("@/pages/biomimetic-revolutions"));
const AetherSynthesisPage       = lazy(() => import("@/pages/aether-synthesis"));
const CompleteIntegrationPage   = lazy(() => import("@/pages/complete-integration"));
const AetherSymbolReferencePage = lazy(() => import("@/pages/aether-symbol-reference"));
const AetherWhitepaperV2Page    = lazy(() => import("@/pages/aether-whitepaper-v2"));
const DailyRitualPage           = lazy(() => import("@/pages/daily-ritual"));
const CoherentBodyPage          = lazy(() => import("@/pages/coherent-body"));
const LightBodyPage             = lazy(() => import("@/pages/light-body"));
const CloudTransportWarpPage    = lazy(() => import("@/pages/cloud-transport-warp"));
const BillingPage                = lazy(() => import("@/pages/billing"));
const HomeLanding                = lazy(() => import("@/pages/home-landing"));
const BillingSuccessPage         = lazy(() => import("@/pages/billing-success"));
const ThreeOscillatorPage        = lazy(() => import("@/pages/three-oscillator"));
const WomensCoherenceMapPage     = lazy(() => import("@/pages/womens-coherence-map"));
const EarthComputerPage          = lazy(() => import("@/pages/earth-computer"));
const NodeLatticePage            = lazy(() => import("@/pages/node-lattice"));
const GeneConceptMapPage         = lazy(() => import("@/pages/gene-concept-map"));
const CoherenceFieldExplorerPage = lazy(() => import("@/pages/coherence-field-explorer"));
const GoogleDrivePage            = lazy(() => import("@/pages/google-drive"));
const AiImageNestPage            = lazy(() => import("@/pages/ai-image-nest"));
const GrokSynthesisPage          = lazy(() => import("@/pages/grok-synthesis"));
const GrokImaginePage            = lazy(() => import("@/pages/grok-imagine"));
const ImageUploadPage            = lazy(() => import("@/pages/image-upload"));

const queryClient = new QueryClient();

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#f5c84c",
    colorForeground: "#e8dfcc",
    colorMutedForeground: "#6f6552",
    colorDanger: "#FF6699",
    colorBackground: "#0d0b07",
    colorInput: "#0b0906",
    colorInputForeground: "#e8dfcc",
    colorNeutral: "#3a3220",
    fontFamily: "'Space Mono', monospace",
    borderRadius: "4px",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: { background: "#0d0b07", borderRadius: "8px", width: "440px", maxWidth: "100%", overflow: "hidden", border: "1px solid #3a3220" },
    card: { boxShadow: "none", background: "transparent" },
    footer: { boxShadow: "none", background: "transparent" },
    headerTitle: { color: "#e8dfcc" },
    headerSubtitle: { color: "#6f6552" },
    socialButtonsBlockButtonText: { color: "#e8dfcc" },
    formFieldLabel: { color: "#6f6552" },
    footerActionLink: { color: "#f5c84c" },
    footerActionText: { color: "#6f6552" },
    dividerText: { color: "#6f6552" },
    identityPreviewEditButton: { color: "#f5c84c" },
    formFieldSuccessText: { color: "#f5c84c" },
    alertText: { color: "#e8dfcc" },
    logoBox: {},
    logoImage: { height: "40px" as const },
    socialButtonsBlockButton: { borderColor: "#3a3220", background: "#0b0906" },
    formButtonPrimary: { background: "#f5c84c", color: "#0b0906" },
    formFieldInput: { background: "#0b0906", borderColor: "#3a3220", color: "#e8dfcc" },
    footerAction: {},
    dividerLine: { background: "#3a3220" },
    alert: { background: "#0d0b07", borderColor: "#3a3220" },
    otpCodeFieldInput: { background: "#0b0906", borderColor: "#3a3220" },
    formFieldRow: {},
    main: {},
  },
};

/* ── Shared auth layout ─────────────────────────────────────────────────── */
/* ── Auth canvas: module-level types ──────────────── */
interface AKNode { x:number;y:number;vx:number;vy:number;label:string;col:string;r:number }
interface AKParticle { ei:number;t:number;spd:number }

const AK_EDGES=[
  [13,0],[13,2],[13,4],[13,6],[13,8],[13,10],[13,12],[13,14],[13,15],
  [13,1],[13,3],[13,5],[13,7],[13,9],[13,11],[13,16],[13,17],[13,18],[13,19],
  [0,1],[0,16],[2,3],[2,15],[4,5],[4,14],[6,7],[6,17],[8,9],[8,18],
  [10,11],[10,14],[12,15],[1,9],[3,15],[5,19],[7,17],[11,18],[14,15],
];

function AuthKnowledgeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const ctx=cv.getContext("2d")!;
    const W=window.innerWidth||1280, H=window.innerHeight||800;
    cv.width=W; cv.height=H;
    const C="#C8A030",T="#00FFB2",G="#44CC77",V="#9966FF",B="#4488FF",A="#FF9933",R="#FF6699";
    const nodes:AKNode[]=[
      {x:W*.14,y:H*.22,vx:.22,vy:.14,label:"Cosmology",col:C,r:26},
      {x:W*.83,y:H*.17,vx:-.17,vy:.18,label:"Plasma Field",col:C,r:20},
      {x:W*.10,y:H*.55,vx:.18,vy:-.15,label:"Quantum",col:T,r:24},
      {x:W*.76,y:H*.70,vx:-.14,vy:-.17,label:"Coherence",col:T,r:22},
      {x:W*.32,y:H*.84,vx:.16,vy:-.2,label:"Biology",col:G,r:24},
      {x:W*.68,y:H*.13,vx:-.18,vy:.16,label:"Morphogenesis",col:G,r:18},
      {x:W*.89,y:H*.44,vx:-.2,vy:.14,label:"Mathematics",col:V,r:22},
      {x:W*.22,y:H*.36,vx:.14,vy:.18,label:"Topology",col:V,r:18},
      {x:W*.80,y:H*.80,vx:-.16,vy:-.14,label:"MHD",col:B,r:20},
      {x:W*.44,y:H*.10,vx:.18,vy:.16,label:"Spacetime",col:B,r:21},
      {x:W*.12,y:H*.76,vx:.17,vy:-.18,label:"Substrate",col:A,r:22},
      {x:W*.90,y:H*.62,vx:-.15,vy:.2,label:"Crystallisation",col:A,r:24},
      {x:W*.55,y:H*.87,vx:-.17,vy:-.15,label:"Consciousness",col:R,r:20},
      {x:W*.50,y:H*.50,vx:.0,vy:.0,label:"AETHER",col:"#ffffff",r:36},
      {x:W*.30,y:H*.62,vx:.15,vy:.17,label:"DMF",col:A,r:16},
      {x:W*.65,y:H*.40,vx:-.17,vy:-.14,label:"Wavefunction",col:T,r:16},
      {x:W*.20,y:H*.14,vx:.16,vy:.2,label:"Egyptian Codex",col:C,r:15},
      {x:W*.84,y:H*.30,vx:-.14,vy:.18,label:"Sacred Geometry",col:V,r:16},
      {x:W*.60,y:H*.74,vx:.18,vy:-.16,label:"Neural Field",col:B,r:16},
      {x:W*.43,y:H*.26,vx:-.16,vy:.17,label:"Synthesis",col:G,r:18},
    ];
    const particles:AKParticle[]=Array.from({length:90},(_,i)=>({
      ei:i%AK_EDGES.length, t:i/90, spd:.0025+Math.random()*.004,
    }));
    let fr=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,3,10,0.20)"; ctx.fillRect(0,0,W,H);
      fr++;
      for(const n of nodes){
        if(n.label==="AETHER") continue;
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<60||n.x>W-60) n.vx*=-1;
        if(n.y<50||n.y>H-50) n.vy*=-1;
      }
      for(const [ai,bi] of AK_EDGES){
        const a=nodes[ai],b=nodes[bi];
        if(!isFinite(a.x)||!isFinite(b.x)) continue;
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"18"); g.addColorStop(1,b.col+"18");
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      }
      for(const p of particles){
        p.t=(p.t+p.spd)%1;
        const [ai,bi]=AK_EDGES[p.ei];
        const a=nodes[ai],b=nodes[bi];
        const px=a.x+(b.x-a.x)*p.t, py=a.y+(b.y-a.y)*p.t;
        if(!isFinite(px)||!isFinite(py)) continue;
        ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2);
        ctx.fillStyle=a.col+"cc";
        ctx.shadowColor=a.col; ctx.shadowBlur=5; ctx.fill(); ctx.shadowBlur=0;
      }
      for(const n of nodes){
        if(!isFinite(n.x)||!isFinite(n.y)) continue;
        const pulse=1+0.055*Math.sin(fr*.028+n.r);
        const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*2.8*pulse);
        grd.addColorStop(0,n.col+"3a"); grd.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*2.8*pulse,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        const cr=ctx.createRadialGradient(n.x-n.r*.3,n.y-n.r*.3,0,n.x,n.y,n.r*pulse);
        cr.addColorStop(0,n.col+"bb"); cr.addColorStop(1,n.col+"2a");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pulse,0,Math.PI*2);
        ctx.fillStyle=cr; ctx.fill();
        ctx.strokeStyle=n.col+"66"; ctx.lineWidth=1; ctx.stroke();
        const isC=n.label==="AETHER";
        ctx.font=isC?`bold 11px 'Space Mono',monospace`:`8px 'Space Mono',monospace`;
        ctx.fillStyle=isC?"#ffffffee":n.col+"cc";
        ctx.textAlign="center"; ctx.textBaseline="top";
        ctx.fillText(n.label,n.x,n.y+n.r*pulse+5);
      }
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>;
}

/* ── Auth layout: Rootex-inspired landing page ─ */
function AuthLayout({ children, loading }: { children?: ReactNode; loading?: boolean }) {
  const modules = [
    { name: "Signal Processor", desc: "Coherence field analysis" },
    { name: "Memory Parser",    desc: "Knowledge crystallisation" },
    { name: "Mood Router",      desc: "Emotional intelligence routing" },
    { name: "Intent Mapper",    desc: "Symbolic logic synthesis" },
  ];
  const stats = [
    { label: "Nodes Active",    value: "20+" },
    { label: "Memory Streams",  value: "Synced" },
    { label: "Build Version",   value: buildLabel() },
    { label: "Last Pulse",      value: "Live" },
  ];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",
      background:"#0d0d14",zIndex:9999,overflowY:"auto",overflowX:"hidden"}}>
      <style>{`
        @keyframes rx-spin{to{transform:rotate(360deg)}}
        @keyframes rx-fade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rx-glow{0%,100%{opacity:.6}50%{opacity:1}}
        .rx-module:hover{background:rgba(255,255,255,0.07)!important;border-color:rgba(139,92,246,0.5)!important}
        .rx-btn-primary:hover{opacity:0.88}
        .rx-btn-secondary:hover{background:rgba(255,255,255,0.08)!important}
        .rx-nav-link:hover{color:#fff!important}
      `}</style>

      {/* Subtle gradient orbs in background */}
      <div style={{position:"fixed",top:"-20%",right:"-10%",width:"60vw",height:"60vw",
        background:"radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)",
        pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-20%",left:"-10%",width:"50vw",height:"50vw",
        background:"radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)",
        pointerEvents:"none",zIndex:0}}/>

      {/* Nav */}
      <nav style={{position:"relative",zIndex:2,display:"flex",alignItems:"center",
        justifyContent:"space-between",padding:"20px 48px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",fontWeight:700,
          fontSize:18,color:"#fff",letterSpacing:"-0.01em"}}>AETHER</div>
        <div style={{display:"flex",gap:32,alignItems:"center"}}>
          {["Docs","Modules","API Access"].map(l=>(
            <a key={l} className="rx-nav-link" href="#" style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
              fontSize:14,color:"rgba(255,255,255,0.6)",textDecoration:"none",transition:"color .15s"}}>{l}</a>
          ))}
          <a href={`${basePath}/sign-in`} style={{
            fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
            fontSize:14,fontWeight:600,color:"#fff",textDecoration:"none",
            background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
            padding:"8px 18px",borderRadius:8,
            boxShadow:"0 0 20px rgba(124,58,237,0.35)",
          }}>Launch Console</a>
        </div>
      </nav>

      {/* Main content */}
      <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto",padding:"60px 48px 80px",
        animation:"rx-fade .5s ease both"}}>

        {/* Hero */}
        <div style={{marginBottom:64}}>
          <h1 style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
            fontWeight:800,fontSize:"clamp(2.4rem,5vw,4rem)",
            color:"#fff",lineHeight:1.1,letterSpacing:"-0.03em",margin:"0 0 16px"}}>
            Synthesise. Discover.<br/>Crystallise.
          </h1>
          <p style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
            fontSize:16,color:"rgba(255,255,255,0.5)",margin:0,maxWidth:440}}>
            Symbolic intelligence meets coherent knowledge infrastructure.
          </p>
        </div>

        {/* Two-column layout: modules + access panel */}
        <div style={{display:"grid",gridTemplateColumns:"1fr minmax(320px,420px)",gap:40,alignItems:"start"}}>

          {/* Left — modules grid */}
          <div>
            <h2 style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
              fontWeight:600,fontSize:18,color:"#fff",margin:"0 0 20px",letterSpacing:"-0.01em"}}>
              Modules
            </h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:40}}>
              {modules.map(m=>(
                <div key={m.name} className="rx-module" style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:10,padding:"16px 18px",cursor:"pointer",
                  transition:"background .15s,border-color .15s",
                }}>
                  <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
                    fontWeight:500,fontSize:14,color:"rgba(255,255,255,0.85)",marginBottom:4}}>{m.name}</div>
                  <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
                    fontSize:12,color:"rgba(255,255,255,0.35)"}}>{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Live system feed */}
            <h2 style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
              fontWeight:600,fontSize:18,color:"#fff",margin:"0 0 16px",letterSpacing:"-0.01em"}}>
              Live System Feed
            </h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {stats.map(s=>(
                <div key={s.label} style={{
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:10,padding:"16px 18px",
                }}>
                  <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
                    fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>{s.label}</div>
                  <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
                    fontWeight:600,fontSize:20,color:"#fff"}}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — access panel */}
          <div style={{
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:14,padding:"28px 28px 24px",
          }}>
            <h2 style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
              fontWeight:600,fontSize:16,color:"#fff",margin:"0 0 20px",letterSpacing:"-0.01em"}}>
              AETHER Access Panel
            </h2>

            {loading ? (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"24px 0"}}>
                <div style={{width:28,height:28,border:"2px solid rgba(124,58,237,0.2)",
                  borderTop:"2px solid #7c3aed",borderRadius:"50%",
                  animation:"rx-spin 1s linear infinite"}}/>
                <div style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",fontSize:13,
                  color:"rgba(255,255,255,0.4)"}}>Initialising…</div>
                <a href={`${basePath}/sign-in`}
                  style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
                    fontSize:14,fontWeight:600,color:"#fff",textDecoration:"none",
                    background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
                    padding:"11px 28px",borderRadius:8,width:"100%",textAlign:"center",
                    display:"block",boxSizing:"border-box",
                    boxShadow:"0 0 20px rgba(124,58,237,0.35)"}}>
                  Sign In
                </a>
              </div>
            ) : children}
          </div>
        </div>

        {/* Bottom tagline */}
        <div style={{marginTop:64,paddingTop:32,borderTop:"1px solid rgba(255,255,255,0.06)",
          display:"flex",gap:24,flexWrap:"wrap"}}>
          {["Precise Knowledge Infrastructure","Emotionally Intelligent Routing","Built for Human–System Harmony"].map(t=>(
            <div key={t} style={{fontFamily:"'Inter',ui-sans-serif,system-ui,sans-serif",
              fontSize:13,color:"rgba(255,255,255,0.35)"}}>• {t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "#02030A", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14, zIndex: 9999 }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.4rem",
        color: "#f5c84c", letterSpacing: "0.4em" }}>AETHER</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9,
        color: "#6f6552", letterSpacing: "0.2em" }}>LOADING ···</div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}

function BuildSync() {
  useBuildSync();
  return null;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome to AETHER", subtitle: "Sign in to your knowledge system" } },
        signUp: { start: { title: "Join AETHER", subtitle: "Create your account to begin" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <BuildSync />
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const ACCESS_CODE_STORAGE_KEY = "aether.access.v1";

function safeSessionGet(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function safeSessionSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch { /* sandboxed iframe — ignore */ }
}

function AccessCodeGate({ children }: { children: ReactNode }) {
  const expectedCode = import.meta.env.VITE_AETHER_ACCESS_CODE as string | undefined;
  const { signOut } = useClerk();

  const [verified, setVerified] = useState(() => {
    if (!expectedCode) return true;
    if (safeSessionGet(ACCESS_CODE_STORAGE_KEY) === "1") return true;
    if (import.meta.env.DEV) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev-access") === "1") {
        safeSessionSet(ACCESS_CODE_STORAGE_KEY, "1");
        return true;
      }
    }
    return false;
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (verified || !expectedCode) return <>{children}</>;

  function submit() {
    if (input.trim() === expectedCode) {
      safeSessionSet(ACCESS_CODE_STORAGE_KEY, "1");
      setVerified(true);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => { setShake(false); }, 600);
    }
  }

  const F = "'Inter',ui-sans-serif,system-ui,sans-serif";
  return (
    <AuthLayout>
      <style>{`
        @keyframes rx-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .rx-inp{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:12px 14px;font-family:'Inter',ui-sans-serif,system-ui,sans-serif;font-size:14px;color:rgba(255,255,255,0.85);width:100%;box-sizing:border-box;outline:none;transition:border-color .15s}
        .rx-inp::placeholder{color:rgba(255,255,255,0.28)}
        .rx-inp:focus{border-color:rgba(124,58,237,0.6)}
        .rx-inp-err{border-color:rgba(239,68,68,0.7)!important}
      `}</style>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{animation: shake ? "rx-shake 0.5s ease" : "none"}}>
          <input
            className={`rx-inp${error ? " rx-inp-err" : ""}`}
            type="password"
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Enter access code"
          />
        </div>

        {error && (
          <div style={{fontFamily:F,fontSize:12,color:"#ef4444"}}>
            Incorrect code{attempts >= 3 ? ` — ${attempts} attempts` : ""}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
          <button
            onClick={submit}
            style={{
              background:"linear-gradient(135deg,#7c3aed,#6d28d9)",
              border:"none",borderRadius:8,padding:"11px 0",
              fontFamily:F,fontSize:14,fontWeight:600,
              color:"#fff",cursor:"pointer",
              boxShadow:"0 0 20px rgba(124,58,237,0.35)",
              transition:"opacity .15s",
            }}
          >
            Enter AETHER
          </button>
          <button
            style={{
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:8,padding:"11px 0",
              fontFamily:F,fontSize:14,fontWeight:500,
              color:"rgba(255,255,255,0.7)",cursor:"pointer",
              transition:"background .15s",
            }}
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  return <AccessCodeGate>{children}</AccessCodeGate>;
}

function Router() {
  usePageMeta();
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route>
        <AuthGate>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path="/" component={HomeLanding} />
                <Route path="/graph-map" component={GraphView} />
                <Route path="/architecture" component={ArchitectureView} />
                <Route path="/upload" component={UploadView} />
                <Route path="/coherence" component={CoherenceView} />
                <Route path="/search" component={SearchView} />
                <Route path="/command-center" component={CommandCenterView} />
                <Route path="/equations" component={EquationsView} />
                <Route path="/pipeline" component={PipelineView} />
                <Route path="/lattice" component={LatticeView} />
                <Route path="/ecosystem" component={EcosystemView} />
                <Route path="/core" component={CoreEngineView} />
                <Route path="/cultural" component={CulturalView} />
                <Route path="/biology" component={BiologyView} />
                <Route path="/experience" component={ExperienceView} />
                <Route path="/nodule" component={ResonanceNoduleView} />
                <Route path="/sources" component={SourcesView} />
                <Route path="/dreamscape" component={DreamscapeView} />
                <Route path="/simulation" component={SimulationView} />
                <Route path="/q-aether" component={QAetherView} />
                <Route path="/neural-emergence" component={NeuralEmergenceView} />
                <Route path="/space-rocks" component={SpaceRocksView} />
                <Route path="/as-above" component={AsAboveView} />
                <Route path="/pde-simulator" component={PDESimulatorView} />
                <Route path="/phi-aether" component={PhiAetherView} />
                <Route path="/multiscale" component={MultiScaleView} />
                <Route path="/morpho-computer" component={MorphoComputerView} />
                <Route path="/aether-os" component={AetherOSView} />
                <Route path="/cgle-live" component={CGLELiveView} />
                <Route path="/fabrication" component={FabricationView} />
                <Route path="/research" component={ResearchView} />
                <Route path="/feedback-loop" component={FeedbackLoopView} />
                <Route path="/control-panel" component={ControlPanelView} />
                <Route path="/aether-core" component={AetherCoreView} />
                <Route path="/trig-reference" component={TrigReferenceView} />
                <Route path="/neuroplasticity" component={NeuroplasticityView} />
                <Route path="/aether-components" component={AetherComponentsView} />
                <Route path="/even-odd" component={EvenOddFunctionsView} />
                <Route path="/analog-reservoir" component={AnalogReservoirView} />
                <Route path="/phi-framework" component={PhiFrameworkView} />
                <Route path="/aquarium-chip" component={AquariumChipView} />
                <Route path="/quaternions" component={QuaternionsView} />
                <Route path="/biomimetic-symphony" component={BiomimeticSymphonyView} />
                <Route path="/ecological-intelligence" component={EcologicalIntelligenceView} />
                <Route path="/fibonacci-calendar" component={FibonacciCalendarView} />
                <Route path="/unified-timeline" component={UnifiedTimelineView} />
                <Route path="/cerebral-organoids" component={CerebralOrganoidView} />
                <Route path="/cosmic-convergence" component={CosmicConvergenceView} />
                <Route path="/atlantis-alignment" component={AtlantisAlignmentView} />
                <Route path="/gobekli-tepe" component={GobekliTepeView} />
                <Route path="/aether-intake" component={AetherIntakeView} />
                <Route path="/nine-shells" component={NineShellsView} />
                <Route path="/prime-anti-prime" component={PrimeAntiPrimePage} />
                <Route path="/concept-systems" component={ConceptSystemsPage} />
                <Route path="/motion-doctrine" component={MotionDoctrinePage} />
                <Route path="/prophetic-timeline" component={PropheticTimelinePage} />
                <Route path="/knot-topology" component={KnotTopologyPage} />
                <Route path="/light-speed" component={LightSpeedPage} />
                <Route path="/mrna-readings" component={MrnaReadingsPage} />
                <Route path="/earth-circuit" component={EarthCircuitPage} />
                <Route path="/source-board" component={SourceBoardPage} />
                <Route path="/aqua-cxe" component={AquaCxePage} />
                <Route path="/cultural-interpretations" component={CulturalInterpretationsPage} />
                <Route path="/stack-fabric" component={StackFabricPage} />
                <Route path="/bio-engine" component={BioEnginePage} />
                <Route path="/blood-dna-lab" component={BloodDNALabPage} />
                <Route path="/circular-farm" component={CircularFarmPage} />
                <Route path="/gradient-field" component={GradientFieldPage} />
                <Route path="/aether-engine" component={AetherEnginePage} />
                <Route path="/notion-synthesis" component={NotionSynthesis} />
                <Route path="/community-notes" component={CommunityNotesPage} />
                <Route path="/eye-evolution" component={EyeEvolutionPage} />
                <Route path="/quantum-gravity" component={QuantumGravityPage} />
                <Route path="/math-studio" component={MathStudioPage} />
                <Route path="/tritium-extract" component={TritiumExtractPage} />
                <Route path="/crashout" component={CrashoutPage} />
                <Route path="/cuca-closed-loop" component={CucaClosedLoopPage} />
                <Route path="/phi-time" component={PhiTimePage} />
                <Route path="/bio-hybrid-mirror" component={BioHybridMirrorPage} />
                <Route path="/mycelium-substrate" component={MyceliumSubstratePage} />
                <Route path="/shells-mind-map" component={ShellsMindMapView} />
                <Route path="/aether-whitepaper" component={AetherWhitepaperView} />
                <Route path="/six-planet-alignment" component={SixPlanetAlignmentView} />
                <Route path="/discovery-loop" component={DiscoveryLoopView} />
                <Route path="/fibonacci-quantization" component={FibonacciQuantizationView} />
                <Route path="/symphonic-os" component={SymphonicOSView} />
                <Route path="/symphonic-protocol" component={SymphonicProtocolView} />
                <Route path="/ufo-ascent" component={UFOAscentView} />
                <Route path="/brain-metabolism" component={BrainMetabolismView} />
                <Route path="/hypercomputation" component={HypercomputationView} />
                <Route path="/ferrodrive" component={FerroDriveView} />
                <Route path="/cla-coupled-fields" component={CLACoupledFieldsView} />
                <Route path="/cancer-coherence" component={CancerCoherenceView} />
                <Route path="/cancer-dynamics" component={CancerDynamicsView} />
                <Route path="/biomimetic-quantum" component={BiomimeticQuantumView} />
                <Route path="/closed-loop-coherence" component={ClosedLoopCoherenceView} />
                <Route path="/phi-hot" component={PhiHOTView} />
                <Route path="/phi-hot-zipper" component={PhiHOTZipperView} />
                <Route path="/thermal-hierarchy" component={ThermalHierarchyView} />
                <Route path="/geometry-of-permission" component={GeometryOfPermissionView} />
                <Route path="/math-engine" component={MathEnginePage} />
                <Route path="/aether-language" component={AetherLanguagePage} />
                <Route path="/symbol-alphabet" component={SymbolAlphabetPage} />
                <Route path="/alphabet-map" component={AlphabetMapPage} />
                <Route path="/question-bank" component={QuestionBankPage} />
                <Route path="/math-frontier" component={MathFrontierPage} />
                <Route path="/polar-transform" component={PolarTransformPage} />
                <Route path="/unified-field-theory" component={UnifiedFieldTheoryPage} />
                <Route path="/product-research" component={ProductResearchPage} />
                <Route path="/ultra-magnetism" component={UltraMagnetismPage} />
                <Route path="/quantum-vacuum" component={QuantumVacuumPage} />
                <Route path="/resonant-cell" component={ResonantCellPage} />
                <Route path="/spin-vacuum" component={SpinVacuumPage} />
                <Route path="/symbolic-pillars" component={SymbolicPillarsPage} />
                <Route path="/mari" component={MariPage} />
                <Route path="/aether-doctrine" component={AetherDoctrinePage} />
                <Route path="/personal-operating-model" component={PersonalOperatingModelPage} />
                <Route path="/color-cosmology" component={ColorCosmologyPage} />
                <Route path="/april-23-alignment" component={April23AlignmentPage} />
                <Route path="/as-above-so-below" component={AsAboveSoBelowPage} />
                <Route path="/piano-arithmetic" component={PianoArithmeticPage} />
                <Route path="/phi-coherent-wave" component={PhiCoherentWavePage} />
                <Route path="/coherence-engine" component={CoherenceEnginePage} />
                <Route path="/aether-health" component={AetherHealthPage} />
                <Route path="/neutrino-lasers" component={NeutrinoLasersPage} />
                <Route path="/q-aether-stack" component={QAetherStackPage} />
                <Route path="/curvature-plane" component={CurvaturePlanePage} />
                <Route path="/seasonal-coherence" component={SeasonalCoherencePage} />
                <Route path="/terraform-sunrise" component={TerraformSunrisePage} />
                <Route path="/logic-flowers" component={LogicFlowersPage} />
                <Route path="/carbon-layered" component={CarbonLayeredPage} />
                <Route path="/diamond-nanothreads" component={DiamondNanothreadsPage} />
                <Route path="/stromatolite-automaton" component={StromatoliteAutomatonPage} />
                <Route path="/photosynthesis-spark" component={PhotosynthesisSparkPage} />
                <Route path="/universal-grammar" component={UniversalGrammarPage} />
                <Route path="/aether-edge-constraint" component={AetherEdgeConstraintView} />
                <Route path="/quantum-living-systems" component={QuantumLivingSystemsView} />
                <Route path="/heliospheric-coherence" component={HeliosphericCoherenceView} />
                <Route path="/aether-egg-engine" component={AetherEggEnginePage} />
                <Route path="/under-ice-ecosystem" component={UnderIceEcosystemPage} />
                <Route path="/alchemy-to-fusion" component={AlchemyToFusionPage} />
                <Route path="/implicate-order" component={ImplicateOrderPage} />
                <Route path="/knowable-universe" component={KnowableUniversePage} />
                <Route path="/non-physical-phenomena" component={NonPhysicalPhenomenaPage} />
                <Route path="/three-rs-reality" component={ThreeRsRealityPage} />
                <Route path="/alchemical-protocol" component={AlchemicalProtocolPage} />
                <Route path="/warp-drive-literature" component={WarpDriveLiteraturePage} />
                <Route path="/puthoff-metric-engineering" component={PuthoffMetricEngineeringPage} />
                <Route path="/eniac-monte-carlo" component={EniacMonteCarloPage} />
                <Route path="/knowledge-map" component={KnowledgeMapPage} />
                <Route path="/decision-entropy" component={DecisionEntropyPage} />
                <Route path="/unified-synthesis" component={UnifiedSynthesisPage} />
                <Route path="/clcs-architecture" component={ClcsArchitecturePage} />
                <Route path="/aether-dashboard" component={AetherDashboardPage} />
                <Route path="/cuca-hybrid-skin" component={CucaHybridSkinPage} />
                <Route path="/cuca-gyroid" component={CucaGyroidPage} />
                <Route path="/aether-childrens-realm" component={AetherChildrensRealmPage} />
                <Route path="/computer-brains" component={ComputerBrainsPage} />
                <Route path="/boho-bloom" component={BohoBloomPage} />
                <Route path="/zoom-the-zipper" component={ZoomTheZipperPage} />
                <Route path="/flow-notebook" component={FlowNotebookPage} />
                <Route path="/chaos-to-code" component={ChaosToCodingPage} />
                <Route path="/learning-layers" component={LearningLayersPage} />
                <Route path="/aether-seasons" component={AetherSeasonsPage} />
                <Route path="/aether-flow" component={AetherFlowPage} />
                <Route path="/aether-foundations" component={AetherFoundationsPage} />
                <Route path="/substrate-synthesis" component={SubstrateSynthesisPage} />
                <Route path="/sparkle-text" component={SparkleTextPage} />
                <Route path="/lunar-coherence" component={LunarCoherencePage} />
                <Route path="/lunar-ambient-field" component={LunarAmbientFieldPage} />
                <Route path="/alchemy-fusion" component={AlchemyFusionPage} />
                <Route path="/family-field-dynamics" component={FamilyFieldDynamicsPage} />
                <Route path="/quantum-eye-field" component={QuantumEyeFieldPage} />
                <Route path="/psilocybin-water-octopus" component={PsilocybinWaterOctopusPage} />
                <Route path="/pineal-moss-vision" component={PinealMossVisionPage} />
                <Route path="/quantum-ringdown-biocycles" component={QuantumRingdownBiocyclesPage} />
                <Route path="/manifold-26d" component={Manifold26DPage} />
                <Route path="/queen-bee-diapause" component={QueenBeeDiapausePage} />
                <Route path="/nematic-bee-foton" component={NematicBeeFotonPage} />
                <Route path="/tunguska-asteroid-timeline" component={TunguskaAsteroidTimelinePage} />
                <Route path="/tardigrade-density-msdd" component={TardigradeDensityMSDDPage} />
                <Route path="/cryptobiosis-asu-telomeres" component={CryptobiosisAsuTelomeresPage} />
                <Route path="/maya-quarks-dna-gfp" component={MayaQuarksDnaGfpPage} />
                <Route path="/hilbert-storage" component={HilbertStoragePage} />
                <Route path="/topography-electroset" component={TopographyElectrosetPage} />
                <Route path="/webbed-phi-cascade" component={WebbledPhiCascadePage} />
                <Route path="/aether-metaphysics" component={AetherMetaphysicsPage} />
                <Route path="/pollen-clock-roots" component={PollenClockRootsPage} />
                <Route path="/life-gradient-planetary" component={LifeGradientPlanetaryPage} />
                <Route path="/moon-mars-field" component={MoonMarsFieldPage} />
                <Route path="/lunar-plant-memory" component={LunarPlantMemoryPage} />
                <Route path="/plant-electroactivity" component={PlantElectroactivityPage} />
                <Route path="/plant-network" component={PlantNetworkPage} />
                <Route path="/mycorrhizal-network" component={MycorrhizalNetworkPage} />
                <Route path="/magic-c8" component={MagicC8Page} />
                <Route path="/slime-maze" component={SlimeMazePage} />
                <Route path="/stellar-brain" component={StellarBrainPage} />
                <Route path="/atp-transport" component={AtpTransportPage} />
                <Route path="/borrelia-knot" component={BorreliaKnotPage} />
                <Route path="/floquet-petals" component={FloquetPetalsPage} />
                <Route path="/gut-brain" component={GutBrainPage} />
                <Route path="/planetary-neural" component={PlanetaryNeuralPage} />
                <Route path="/stacked-rings" component={StackedRingsPage} />
                <Route path="/earth-living-system" component={EarthLivingSystemPage} />
                <Route path="/portal-restoration" component={PortalRestorationPage} />
                <Route path="/opal-genesis" component={OpalGenesisPage} />
                <Route path="/awakening-timeline" component={AwakeningTimelinePage} />
                <Route path="/aether-why" component={AetherWhyPage} />
                <Route path="/baby-rhythm" component={BabyRhythmPage} />
                <Route path="/cli-nano" component={CliNanoPage} />
                <Route path="/calm-company" component={CalmCompanyPage} />
                <Route path="/social-deploy" component={SocialDeployPage} />
                <Route path="/divine-timing" component={DivineTimingPage} />
                <Route path="/field-mechanics" component={FieldMechanicsPage} />
                <Route path="/sky-dial" component={SkyDialPage} />
                <Route path="/convergence" component={ConvergencePage} />
                <Route path="/transport-cavity" component={TransportCavityPage} />
                <Route path="/aether-observable" component={AetherObservablePage} />
                <Route path="/glossary" component={GlossaryPage} />
                <Route path="/quantum-ammeter" component={QuantumAmmeterPage} />
                <Route path="/organoid-intel" component={OrganoidIntelPage} />
                <Route path="/plant-intel" component={PlantIntelPage} />
                <Route path="/ferro-modes" component={FerroModesPage} />
                <Route path="/vortex-math" component={VortexMathPage} />
                <Route path="/octonion-aether" component={OctonionAetherPage} />
                <Route path="/early-universe" component={EarlyUniversePage} />
                <Route path="/phonon-stack" component={PhononStackPage} />
                <Route path="/cosmic-refine" component={CosmicRefinePage} />
                <Route path="/liquid-print" component={LiquidPrintPage} />
                <Route path="/plate-switching" component={PlateSwitchingPage} />
                <Route path="/agents" component={AgentsPage} />
                <Route path="/modules" component={ModulesPage} />
                <Route path="/mari-core" component={MariCorePage} />
                <Route path="/resonance" component={ResonancePage} />
                <Route path="/boho-formula" component={BohoFormulaPage} />
                <Route path="/posting-architecture" component={PostingArchitecturePage} />
                <Route path="/atlas-3i" component={Atlas3IPage} />
                <Route path="/engines" component={EnginesPage} />
                <Route path="/galileo-newton" component={GalileoNewtonPage} />
                <Route path="/unified-field" component={UnifiedFieldPage} />
                <Route path="/giza-circuit" component={GizaCircuitPage} />
                <Route path="/quantum-substrate" component={QuantumSubstratePage} />
                <Route path="/light-forces" component={LightForcesPage} />
                <Route path="/resonant-nexus" component={ResonantNexusPage} />
                <Route path="/neural-psychedelic" component={NeuralPsychedelicPage} />
                <Route path="/photo-timeline" component={PhotoTimelinePage} />
                <Route path="/aether-calendar" component={AetherCalendarPage} />
                <Route path="/all-business-ideas" component={AllBusinessIdeasPage} />
                <Route path="/guf-engine" component={GufEnginePage} />
                <Route path="/propulsion-engine" component={PropulsionEnginePage} />
                <Route path="/string-nanobot" component={StringNanobotPage} />
                <Route path="/spin-transport" component={SpinTransportPage} />
                <Route path="/warp-gravity" component={WarpGravityPage} />
                <Route path="/observer-dimensions" component={ObserverDimensionsPage} />
                <Route path="/aether-cla" component={AetherClaPage} />
                <Route path="/guf-analysis" component={GufAnalysisPage} />
                <Route path="/sea-intelligence" component={SeaIntelligencePage} />
                <Route path="/aether-propulsion" component={AetherPropulsionPage} />
                <Route path="/motion-language" component={MotionLanguagePage} />
                <Route path="/carrier-dimensions" component={CarrierDimensionsPage} />
                <Route path="/coherence-decoherence" component={CoherenceDecoherencePage} />
                <Route path="/earth-atmosphere" component={EarthAtmospherePage} />
                <Route path="/neural-brain-systems" component={NeuralBrainSystemsPage} />
                <Route path="/wave-pool-synthesis" component={WavePoolSynthesisPage} />
                <Route path="/sacred-geometry-math" component={SacredGeometryMathPage} />
                <Route path="/resonant-systems" component={ResonantSystemsPage} />
                <Route path="/symbol-sifter" component={SymbolSifterPage} />
                <Route path="/cxe-equation" component={CxeEquationPage} />
                <Route path="/frog-sim-paper" component={FrogSimPaperPage} />
                <Route path="/spacetime-fabric" component={SpacetimeFabricPage} />
                <Route path="/aether-visual-system" component={AetherVisualSystemPage} />
                <Route path="/grand-unified-framework" component={GrandUnifiedFrameworkPage} />
                <Route path="/warp-bubble-engine" component={WarpBubbleEnginePage} />
                <Route path="/water-transport" component={WaterTransportPage} />
                <Route path="/solar-architecture" component={SolarArchitecturePage} />
                <Route path="/spacetime-nav" component={SpacetimeNavPage} />
                <Route path="/water-density" component={WaterDensityPage} />
                <Route path="/dialogue" component={DialoguePage} />
                <Route path="/neural-coherence" component={NeuralCoherencePage} />
                <Route path="/dark-sun" component={DarkSunPage} />
                <Route path="/phi-cellular" component={PhiCellularPage} />
                <Route path="/webbed-leg" component={WebbedLegPage} />
                <Route path="/cognitive-bands" component={CognitiveBandsPage} />
                <Route path="/plasma-knots" component={PlasmaKnotsPage} />
                <Route path="/biomagnetism" component={BiomagnetismPage} />
                <Route path="/synthesize" component={SynthesizePage} />
                <Route path="/graphite-synthesis" component={GraphiteSynthesisPage} />
                <Route path="/time-processing" component={TimeProcessingPage} />
                <Route path="/uap-energy" component={UAPEnergyPage} />
                <Route path="/tidal-movement" component={TidalMovementPage} />
                <Route path="/bursting-quaternions" component={BurstingQuaternionsPage} />
                <Route path="/color-coherence" component={ColorCoherencePage} />
                <Route path="/rotation-engine" component={RotationEnginePage} />
                <Route path="/liquid-density" component={LiquidDensityPage} />
                <Route path="/food-substrate-coherence" component={FoodSubstrateCoherencePage} />
                <Route path="/substrate-kitchen" component={SubstrateKitchenPage} />
                <Route path="/living-nutrition" component={LivingNutritionPage} />
                <Route path="/compound-eye-roadmap" component={CompoundEyeRoadmapPage} />
                <Route path="/information-manifold" component={InformationManifoldPage} />
                <Route path="/phase-coupling" component={PhaseCouplingPage} />
                <Route path="/body-coherence-scanner" component={BodyCoherenceScannerPage} />
                <Route path="/foglet-sandstone" component={FogletSandstonePage} />
                <Route path="/hexiclical-body-map" component={HexiclicalBodyMapPage} />
                <Route path="/animal-neural-plasmoid" component={AnimalNeuralPlasmoidPage} />
                <Route path="/bio-infinity-drive" component={BioInfinityDrivePage} />
                <Route path="/biorefinery-propulsion" component={BiorefineryPropulsionPage} />
                <Route path="/full-perception-universe" component={FullPerceptionUniversePage} />
                <Route path="/seamoss-transceiver" component={SeamossTransceiverPage} />
                <Route path="/torsion-resonator" component={TorsionResonatorPage} />
                <Route path="/seamoss-gate" component={SeamossGatePage} />
                <Route path="/engine-computer" component={EngineComputerPage} />
                <Route path="/bioluminescence-spectrum" component={BioluminescenceSpectrumPage} />
                <Route path="/soi-building" component={SoiBuildingPage} />
                <Route path="/seismic-self-build" component={SeismicSelfBuildPage} />
                <Route path="/bee-liquid-chip" component={BeeLiquidChipPage} />
                <Route path="/rf-diffusion" component={RFDiffusionPage} />
                <Route path="/nutritional-dna-key" component={NutritionalDnaKeyPage} />
                <Route path="/electron-field" component={ElectronFieldPage} />
                <Route path="/coherence-atlas" component={CoherenceAtlasPage} />
                <Route path="/light-absorption-pressure" component={LightAbsorptionPressurePage} />
                <Route path="/rhombus-gate" component={RhombusGatePage} />
                <Route path="/dmf-field" component={DmfFieldPage} />
                <Route path="/compote-chips" component={CompoteChipsPage} />
                <Route path="/rd-simulator" component={RdSimulatorPage} />
                <Route path="/neural-topology" component={NeuralTopologyPage} />
                <Route path="/morpho-prime" component={MorphoPrimePage} />
                <Route path="/perceptive-universe" component={PerceptiveUniversePage} />
                <Route path="/core-resonance" component={CoreResonancePage} />
                <Route path="/synchrony-field" component={SynchronyFieldPage} />
                <Route path="/stromatolite-field" component={StromatoliteFieldPage} />
                <Route path="/aether-matrix" component={AetherMatrixPage} />
                <Route path="/understanding-strand" component={UnderstandingStrandPage} />
                <Route path="/gravitational-field" component={GravitationalFieldPage} />
                <Route path="/cavity-computer" component={CavityComputerPage} />
                <Route path="/quantum-computer" component={QuantumComputerPage} />
                <Route path="/egyptian-codex" component={EgyptianCodexPage} />
                <Route path="/phrenology-agents" component={PhrenologyAgentsPage} />
                <Route path="/uv-amino-light" component={UvAminoLightPage} />
                <Route path="/full-spectrum-light" component={FullSpectrumLightPage} />
                <Route path="/prism-principle" component={PrismPrinciplePage} />
                <Route path="/regulatory-depth" component={RegulatoryDepthPage} />
                <Route path="/data-graph" component={DataGraphPage} />
                <Route path="/antimatter-wave" component={AntimatterWavePage} />
                <Route path="/cognitive-architecture" component={CognitiveArchitecturePage} />
                <Route path="/world-harmony-archetype" component={WorldHarmonyArchetypePage} />
                <Route path="/fluid-computer" component={FluidComputerPage} />
                <Route path="/motor-cortex" component={MotorCortexPage} />
                <Route path="/liquid-print-math" component={LiquidPrintMathPage} />
                <Route path="/chromatic-glare" component={ChromaticGlarePage} />
                <Route path="/uptipple-boat" component={UptippleBoatPage} />
                <Route path="/optical-hull-sim" component={OpticalHullSimPage} />
                <Route path="/black-hole-framework" component={BlackHoleFrameworkPage} />
                <Route path="/agent-mapping" component={AgentMappingPage} />
                <Route path="/event-horizon" component={EventHorizonPage} />
                <Route path="/photon-emission" component={PhotonEmissionPage} />
                <Route path="/transcendent-art" component={TranscendentArtPage} />
                <Route path="/neuro-metabolic" component={NeuroMetabolicPage} />
                <Route path="/emergence-network" component={EmergenceNetworkPage} />
                <Route path="/plasma-confinement" component={PlasmaConfinementPage} />
                <Route path="/tait-knots" component={TaitKnotsPage} />
                <Route path="/plant-coherence-system" component={PlantCoherenceSystemPage} />
                <Route path="/energetic-field-sim" component={EnergeticFieldSimPage} />
                <Route path="/chocolate-tempering" component={ChocolateTemperingPage} />
                <Route path="/chladni-freeze" component={ChladniFreezePage} />
                <Route path="/incommensurable" component={IncommensurablePage} />
                <Route path="/firework-coherence" component={FireworkCoherencePage} />
                <Route path="/osmotic-pressure" component={OsmoticPressurePage} />
                <Route path="/non-terrestrial" component={NonTerrestrialPage} />
                <Route path="/propulsion-dynamics" component={PropulsionDynamicsPage} />
                <Route path="/polymer-biobreak" component={PolymerBiobreakPage} />
                <Route path="/dynamic-synthesis" component={DynamicSynthesisPage} />
                <Route path="/coherence-field-theory" component={CoherenceFieldTheoryPage} />
                <Route path="/substrate-quantization-engine" component={SubstrateQuantizationEnginePage} />
                <Route path="/aether-carriage" component={AetherCarriagePage} />
                <Route path="/resonant-carriage" component={ResonantCarriagePage} />
                <Route path="/blast-bubble-carriage" component={BlastBubbleCarriagePage} />
                <Route path="/light-body-topology" component={LightBodyTopologyPage} />
                <Route path="/daily-companion" component={DailyCompanionPage} />
                <Route path="/phi-lattice" component={PhiLatticePage} />
                <Route path="/atomic-geometry" component={AtomicGeometryPage} />
                <Route path="/blue-light-protocol" component={BlueLightProtocolPage} />
                <Route path="/live-cursors"     component={LiveCursorsPage} />
                <Route path="/mpc-spacetime"    component={MpcSpacetimePage} />
                <Route path="/magnetic-drops"   component={MagneticDropsPage} />
                <Route path="/equation-codex"        component={EquationCodexPage} />
                <Route path="/seismic-oil-synthesis"  component={SeismicOilSynthesisPage} />
                <Route path="/quantum-gravity-cosmos" component={QuantumGravityCosmosPage} />
                <Route path="/processing-delay"      component={ProcessingDelayPage} />
                <Route path="/wireless-power"        component={WirelessPowerPage} />
                <Route path="/phi-crystallization"   component={PhiCrystallizationPage} />
                <Route path="/orbital-mechanics"     component={OrbitalMechanicsPage} />
                <Route path="/coherence-science"     component={CoherenceSciencePage} />
                <Route path="/planetary-substrate"   component={PlanetarySubstratePage} />
                <Route path="/frames-of-reference"  component={FramesOfReferencePage} />
                <Route path="/binding-the-dark"     component={BindingTheDarkPage} />
                <Route path="/symphonic-governance" component={SymphonicGovernancePage} />
                <Route path="/diamond-pearl"        component={DiamondPearlPage} />
                <Route path="/animal-silhouettes"   component={AnimalSilhouettesPage} />
                <Route path="/path-forward"         component={PathForwardPage} />
                <Route path="/dark-matter-vol2"     component={DarkMatterVol2Page} />
                <Route path="/grand-unified"        component={GrandUnifiedPage} />
                <Route path="/dc-solar"             component={DcSolarPage} />
                <Route path="/aether-research"      component={AetherResearchPage} />
                <Route path="/dark-matter-vol3"     component={DarkMatterVol3Page} />
                <Route path="/microgravity-infra"   component={MicrogravityInfraPage} />
                <Route path="/wood-frog-knots"      component={WoodFrogKnotsPage} />
                <Route path="/mars-world"           component={MarsWorldPage} />
                <Route path="/mom-study"            component={MomStudyPage} />
                <Route path="/photosynthesis-planet" component={PhotosynthesisPlanetPage} />
                <Route path="/stromatolite"          component={StromatoliteSimPage} />
                <Route path="/coherence-nav"         component={CoherenceNavPage} />
                <Route path="/superradiance"         component={SuperradiancePage} />
                <Route path="/radiance-spectrum"    component={RadianceSpectrumPage} />
                <Route path="/rational-function"    component={RationalFunctionPage} />
                <Route path="/equations-in-motion" component={EquationsInMotionPage} />
                <Route path="/guf-flagship"        component={GufFlagshipPage} />
                <Route path="/engine-designer"     component={EngineDesignerPage} />
                <Route path="/gobekli-plasma"      component={GobekliPlasmaPage} />
                <Route path="/guf-coins"           component={GufCoinsPage} />
                <Route path="/guf-observatory"     component={GufObservatoryPage} />
                <Route path="/periodic-table"      component={PeriodicTablePage} />
                <Route path="/bismuth"             component={BismuthPage} />
                <Route path="/quartz-color"        component={QuartzColorPage} />
                <Route path="/bio-magnetic-convergence" component={BioMagneticConvergencePage} />
                <Route path="/aether-habitat" component={AetherHabitatPage} />
                <Route path="/helical-framework"   component={HelicalFrameworkPage} />
                <Route path="/robot-strokes"       component={RobotStrokesPage} />
                <Route path="/filament-lattice"    component={FilamentLatticePage} />
                <Route path="/wave-lattice"        component={WaveLatticePage} />
                <Route path="/synthesis-field"    component={SynthesisFieldPage} />
                <Route path="/brain-cube-camera"  component={BrainCubeCameraPage} />
                <Route path="/flower-clock"        component={FlowerClockPage} />
                <Route path="/wood-frog-biophotonics" component={WoodFrogBiophotonicsPage} />
                <Route path="/integration-dimensions" component={IntegrationDimensionsPage} />
                <Route path="/stacked-rings-engine" component={StackedRingsEnginePage} />
                <Route path="/dimensional-compiler" component={DimensionalCompilerPage} />
                <Route path="/aether-products"     component={AetherProductsPage} />
                <Route path="/venus-cycles"        component={VenusCyclesPage} />
                <Route path="/invisible-wind"      component={InvisibleWindPage} />
                <Route path="/quantum-exotic-matter" component={QuantumExoticMatterPage} />
                <Route path="/substrate-sandwich"  component={SubstrateSandwichPage} />
                <Route path="/alfven-synthesis"         component={AlfvenSynthesisPage} />
                <Route path="/slime-gravity-quantization"   component={SlimeGravityQuantPage} />
                <Route path="/crystallized-life-synthesis"  component={CrystallizedLifePage} />
                <Route path="/ontological-partials"        component={OntologicalPartialsPage} />
                <Route path="/pineal-eye-map"             component={PinealEyeMapPage} />
                <Route path="/gravitational-chirp"       component={GravitationalChirpPage} />
                <Route path="/whats-new"           component={WhatsNewPage} />
                <Route path="/lightning-spectrum"  component={LightningSpectrumPage} />
                <Route path="/nutrition-force"     component={NutritionForcePage} />
                <Route path="/crystallization-locking" component={CrystallizationLockingPage} />
                <Route path="/quaternion-burst"    component={QuaternionBurstPage} />
                <Route path="/neuroweave"          component={NeuroweavePage} />
                <Route path="/hyper-perception"    component={HyperPerceptionPage} />
                <Route path="/air-nanotube"        component={AirNanotubePage} />
                <Route path="/resonant-tunnel"     component={ResonantTunnelPage} />
                <Route path="/inertial-propulsion" component={InertialPropulsionPage} />
                <Route path="/codebase-symbol-engine" component={CodebaseSymbolEnginePage} />
                <Route path="/java-control-flow" component={JavaControlFlowPage} />
                <Route path="/petrification-transformation" component={PetrificationTransformationPage} />
                <Route path="/q-aether-research" component={QAetherResearchPage} />
                <Route path="/computational-mathematics" component={ComputationalMathematicsPage} />
                <Route path="/substrate-computing" component={SubstrateComputingPage} />
                <Route path="/aether-whitepaper-v1" component={AetherWhitepaperV1Page} />
                <Route path="/diamond-formation" component={DiamondFormationPage} />
                <Route path="/page-directory" component={PageDirectoryPage} />
                <Route path="/crystallization-atlas" component={CrystallizationAtlasPage} />
                <Route path="/compact-fusion" component={CompactFusionPage} />
                <Route path="/synaptic-entropy" component={SynapticEntropyPage} />
                <Route path="/slinky-propulsion" component={SlinkyPropulsionPage} />
                <Route path="/ferrofluid-propulsion" component={FerrofluidPropulsionPage} />
                <Route path="/fluid-substrate" component={FluidSubstratePage} />
                <Route path="/fibonacci-replicant" component={FibonacciReplicantPage} />
                <Route path="/bio-photonic-scent" component={BioPhotonicScentPage} />
                <Route path="/pollen-flower" component={PollenFlowerPage} />
                <Route path="/aether-bodysuit" component={AetherBodySuitPage} />
                <Route path="/mechanical-qubits" component={MechanicalQubitsPage} />
                <Route path="/thermal-decoy-filter" component={ThermalDecoyFilterPage} />
                <Route path="/notion-sync" component={NotionSyncPage} />
                <Route path="/notion-atlas" component={NotionAtlasPage} />
                <Route path="/aether-textbook" component={AetherTextbookPage} />
                <Route path="/agent-whispers" component={AgentWhispersPage} />
                <Route path="/claude-chat" component={ClaudeChatPage} />
                <Route path="/x-grok" component={XGrokPage} />
                <Route path="/openai-bridge" component={OpenAIBridgePage} />
                <Route path="/vercel-dashboard" component={VercelDashboardPage} />
                <Route path="/substrates" component={SubstratesPage} />
                <Route path="/solar-feminine" component={SolarFemininePage} />
                <Route path="/symbolic-computation" component={SymbolicComputationPage} />
                <Route path="/kinematic-replication" component={KinematicReplicationPage} />
                <Route path="/bio-computational" component={BioComputationalPage} />
                <Route path="/plasmodium-deck" component={PlasmodiumDeckPage} />
                <Route path="/aether-theory-deck" component={AetherTheoryDeckPage} />
                <Route path="/cuca-white-paper" component={CucaWhitePaperPage} />
                <Route path="/aether-unified-framework" component={AetherUnifiedFrameworkPage} />
                <Route path="/cuca-bioengine" component={CucaBioenginePage} />
                <Route path="/aether-patent" component={AetherPatentPage} />
                <Route path="/fibonacci-quaternion" component={FibonacciQuaternionPage} />
                <Route path="/biomimetic-revolutions" component={BiomimeticRevolutionsPage} />
                <Route path="/aether-synthesis" component={AetherSynthesisPage} />
                <Route path="/complete-integration" component={CompleteIntegrationPage} />
                <Route path="/aether-symbol-reference" component={AetherSymbolReferencePage} />
                <Route path="/aether-whitepaper-v2" component={AetherWhitepaperV2Page} />
                <Route path="/daily-ritual" component={DailyRitualPage} />
                <Route path="/coherent-body" component={CoherentBodyPage} />
                <Route path="/light-body" component={LightBodyPage} />
                <Route path="/cloud-transport-warp" component={CloudTransportWarpPage} />
                <Route path="/three-oscillator" component={ThreeOscillatorPage} />
                <Route path="/womens-coherence-map" component={WomensCoherenceMapPage} />
                <Route path="/earth-computer" component={EarthComputerPage} />
                <Route path="/node-lattice" component={NodeLatticePage} />
                <Route path="/gene-concept-map" component={GeneConceptMapPage} />
                <Route path="/coherence-field-explorer" component={CoherenceFieldExplorerPage} />
                <Route path="/google-drive" component={GoogleDrivePage} />
                <Route path="/image-upload" component={ImageUploadPage} />
                <Route path="/ai-image-nest" component={AiImageNestPage} />
                <Route path="/grok-synthesis" component={GrokSynthesisPage} />
                <Route path="/grok-imagine" component={GrokImaginePage} />
                <Route path="/billing" component={BillingPage} />
                <Route path="/billing/success" component={BillingSuccessPage} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </Layout>
        </AuthGate>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <TooltipProvider>
        <ClerkProviderWithRoutes />
        <Toaster />
      </TooltipProvider>
    </WouterRouter>
  );
}
