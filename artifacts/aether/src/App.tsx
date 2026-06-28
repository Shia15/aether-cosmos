import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
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
const GlossaryPage = lazy(() => import("@/pages/glossary"));
const QuantumAmmeterPage = lazy(() => import("@/pages/quantum-ammeter"));
const ThermalHierarchyView = lazy(() => import("@/pages/thermal-hierarchy"));
const GeometryOfPermissionView = lazy(() => import("@/pages/geometry-of-permission"));
const MathEnginePage = lazy(() => import("@/pages/math-engine"));
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
const NutritionalDnaKeyPage = lazy(() => import("@/pages/nutritional-dna-key"));
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
const HelicalFrameworkPage = lazy(() => import("@/pages/helical-framework"));
const RobotStrokesPage = lazy(() => import("@/pages/robot-strokes"));
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
    colorPrimary: "#00FFB2",
    colorForeground: "#B8CCE8",
    colorMutedForeground: "#3A5060",
    colorDanger: "#FF6699",
    colorBackground: "#0A0E1A",
    colorInput: "#06090F",
    colorInputForeground: "#B8CCE8",
    colorNeutral: "#2A3050",
    fontFamily: "'Space Mono', monospace",
    borderRadius: "4px",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: { background: "#0A0E1A", borderRadius: "8px", width: "440px", maxWidth: "100%", overflow: "hidden", border: "1px solid #2A3050" },
    card: { boxShadow: "none", background: "transparent" },
    footer: { boxShadow: "none", background: "transparent" },
    headerTitle: { color: "#B8CCE8" },
    headerSubtitle: { color: "#3A5060" },
    socialButtonsBlockButtonText: { color: "#B8CCE8" },
    formFieldLabel: { color: "#3A5060" },
    footerActionLink: { color: "#00FFB2" },
    footerActionText: { color: "#3A5060" },
    dividerText: { color: "#3A5060" },
    identityPreviewEditButton: { color: "#00FFB2" },
    formFieldSuccessText: { color: "#00FFB2" },
    alertText: { color: "#B8CCE8" },
    logoBox: {},
    logoImage: { height: "40px" as const },
    socialButtonsBlockButton: { borderColor: "#2A3050", background: "#06090F" },
    formButtonPrimary: { background: "#00FFB2", color: "#02030A" },
    formFieldInput: { background: "#06090F", borderColor: "#2A3050", color: "#B8CCE8" },
    footerAction: {},
    dividerLine: { background: "#2A3050" },
    alert: { background: "#0A0E1A", borderColor: "#2A3050" },
    otpCodeFieldInput: { background: "#06090F", borderColor: "#2A3050" },
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

/* ── Auth layout: full-screen canvas + centered card ─ */
function AuthLayout({ children, loading }: { children?: ReactNode; loading?: boolean }) {
  const domains=[
    {col:"#C8A030",name:"Cosmic"},
    {col:"#00FFB2",name:"Quantum"},
    {col:"#44CC77",name:"Biology"},
    {col:"#9966FF",name:"Math"},
    {col:"#4488FF",name:"Physics"},
    {col:"#FF9933",name:"Substrate"},
    {col:"#FF6699",name:"Mind"},
  ];
  return (
    <div style={{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",
      background:"#02030A",zIndex:9999,overflow:"hidden"}}>
      <style>{`
        @keyframes ak-spin{to{transform:rotate(360deg)}}
        @keyframes ak-fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ak-glow{0%,100%{box-shadow:0 0 32px rgba(0,255,178,0.10)}50%{box-shadow:0 0 56px rgba(0,255,178,0.22)}}
      `}</style>

      {/* Live knowledge graph background */}
      <AuthKnowledgeCanvas/>

      {/* Domain legend strip — bottom of screen */}
      <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",
        display:"flex",gap:14,alignItems:"center",zIndex:2}}>
        {domains.map(d=>(
          <div key={d.name} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:d.col,boxShadow:`0 0 6px ${d.col}`}}/>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:7,
              color:d.col+"99",letterSpacing:"0.1em"}}>{d.name}</span>
          </div>
        ))}
      </div>

      {/* Centered floating card */}
      <div style={{position:"absolute",inset:0,display:"flex",
        alignItems:"center",justifyContent:"center",padding:20,overflowY:"auto",zIndex:2}}>
        <div style={{
          width:"100%",maxWidth:440,
          background:"rgba(4,6,18,0.82)",
          backdropFilter:"blur(24px)",
          border:"1px solid rgba(0,255,178,0.18)",
          borderRadius:12,padding:"32px 32px 28px",
          animation:"ak-fade .5s ease both, ak-glow 4s ease-in-out infinite",
        }}>
          {/* Wordmark */}
          <div style={{textAlign:"center",marginBottom:6}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"2rem",fontWeight:600,
              color:"#00FFB2",letterSpacing:"0.4em",lineHeight:1,
              textShadow:"0 0 36px rgba(0,255,178,0.45)"}}>AETHER</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:7.5,
              color:"rgba(0,255,178,0.45)",letterSpacing:"0.2em",marginTop:6}}>
              KNOWLEDGE SYSTEM
            </div>
          </div>

          {/* Tagline */}
          <div style={{textAlign:"center",marginBottom:22,
            fontFamily:"'Crimson Pro',serif",fontSize:13,
            color:"rgba(184,204,232,0.55)",letterSpacing:"0.04em"}}>
            Synthesise · Discover · Crystallise
          </div>

          {/* Divider */}
          <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,178,0.2),transparent)",
            marginBottom:22}}/>

          {/* Form / loading */}
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18,padding:"16px 0"}}>
              <div style={{width:32,height:32,border:"2px solid rgba(0,255,178,0.12)",
                borderTop:"2px solid #00FFB2",borderRadius:"50%",
                animation:"ak-spin 1s linear infinite"}}/>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,
                color:"rgba(0,255,178,0.45)",letterSpacing:"0.2em"}}>INITIALISING</div>
              <a href={`${basePath}/sign-in`}
                style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#00FFB2",
                  textDecoration:"none",letterSpacing:"0.14em",
                  border:"1px solid rgba(0,255,178,0.3)",borderRadius:4,
                  padding:"8px 22px",background:"rgba(0,255,178,0.06)"}}>
                SIGN IN
              </a>
            </div>
          ) : children}
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
        color: "#00FFB2", letterSpacing: "0.4em" }}>AETHER</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9,
        color: "#3A5060", letterSpacing: "0.2em" }}>LOADING ···</div>
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
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

const ACCESS_CODE_STORAGE_KEY = "aether.access.v1";

function AccessCodeGate({ children }: { children: ReactNode }) {
  const expectedCode = import.meta.env.VITE_AETHER_ACCESS_CODE as string | undefined;
  const { signOut } = useClerk();

  const [verified, setVerified] = useState(() => {
    if (!expectedCode) return true;
    return sessionStorage.getItem(ACCESS_CODE_STORAGE_KEY) === "1";
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (verified || !expectedCode) return <>{children}</>;

  function submit() {
    if (input.trim() === expectedCode) {
      sessionStorage.setItem(ACCESS_CODE_STORAGE_KEY, "1");
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

  return (
    <AuthLayout>
      <style>{`
        @keyframes ak-shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{textAlign:"center",marginBottom:4}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,
            color:"rgba(0,255,178,0.55)",letterSpacing:"0.25em",marginBottom:8}}>
            SECURE ACCESS
          </div>
          <div style={{fontFamily:"'Crimson Pro',serif",fontSize:"0.95rem",
            color:"rgba(184,204,232,0.7)",lineHeight:1.5}}>
            Enter your access code to enter the knowledge system.
          </div>
        </div>

        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,255,178,0.15),transparent)",margin:"6px 0"}}/>

        <div style={{
          animation: shake ? "ak-shake 0.55s ease" : "none",
        }}>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Enter access code"
            style={{
              width:"100%",boxSizing:"border-box",
              background:"rgba(0,255,178,0.05)",
              border:`1px solid ${error ? "rgba(255,68,119,0.6)" : "rgba(0,255,178,0.2)"}`,
              borderRadius:6,
              padding:"12px 16px",
              fontFamily:"'Space Mono',monospace",fontSize:13,
              color:"#B8CCE8",letterSpacing:"0.15em",
              outline:"none",
              transition:"border-color 0.2s",
            }}
          />
        </div>

        {error && (
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,
            color:"#FF4477",letterSpacing:"0.14em",textAlign:"center"}}>
            INCORRECT CODE{attempts >= 3 ? ` -- ${attempts} attempts` : ""}
          </div>
        )}

        <button
          onClick={submit}
          style={{
            marginTop:4,
            background:"rgba(0,255,178,0.1)",
            border:"1px solid rgba(0,255,178,0.35)",
            borderRadius:6,padding:"11px",
            fontFamily:"'Space Mono',monospace",fontSize:9,
            color:"#00FFB2",letterSpacing:"0.22em",
            cursor:"pointer",transition:"all 0.18s",
          }}
        >
          ENTER AETHER
        </button>

        <button
          onClick={() => signOut({ redirectUrl: basePath || "/" })}
          style={{
            background:"transparent",border:"none",
            fontFamily:"'Space Mono',monospace",fontSize:7,
            color:"rgba(184,204,232,0.3)",letterSpacing:"0.14em",
            cursor:"pointer",padding:"6px",textAlign:"center",
          }}
        >
          sign out
        </button>
      </div>
    </AuthLayout>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <AuthLayout loading />;
  if (!isSignedIn) return <SignInPage />;
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
                <Route path="/" component={GraphView} />
                <Route path="/architecture" component={ArchitectureView} />
                <Route path="/upload" component={UploadView} />
                <Route path="/coherence" component={CoherenceView} />
                <Route path="/search" component={SearchView} />
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
                <Route path="/nutritional-dna-key" component={NutritionalDnaKeyPage} />
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
                <Route path="/antimatter-wave" component={AntimatterWavePage} />
                <Route path="/cognitive-architecture" component={CognitiveArchitecturePage} />
                <Route path="/world-harmony-archetype" component={WorldHarmonyArchetypePage} />
                <Route path="/fluid-computer" component={FluidComputerPage} />
                <Route path="/motor-cortex" component={MotorCortexPage} />
                <Route path="/liquid-print-math" component={LiquidPrintMathPage} />
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
                <Route path="/helical-framework"   component={HelicalFrameworkPage} />
                <Route path="/robot-strokes"       component={RobotStrokesPage} />
                <Route path="/flower-clock"        component={FlowerClockPage} />
                <Route path="/wood-frog-biophotonics" component={WoodFrogBiophotonicsPage} />
                <Route path="/integration-dimensions" component={IntegrationDimensionsPage} />
                <Route path="/stacked-rings-engine" component={StackedRingsEnginePage} />
                <Route path="/whats-new"           component={WhatsNewPage} />
                <Route path="/lightning-spectrum"  component={LightningSpectrumPage} />
                <Route path="/nutrition-force"     component={NutritionForcePage} />
                <Route path="/crystallization-locking" component={CrystallizationLockingPage} />
                <Route path="/quaternion-burst"    component={QuaternionBurstPage} />
                <Route path="/neuroweave"          component={NeuroweavePage} />
                <Route path="/hyper-perception"    component={HyperPerceptionPage} />
                <Route path="/air-nanotube"        component={AirNanotubePage} />
                <Route path="/resonant-tunnel"     component={ResonantTunnelPage} />
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
