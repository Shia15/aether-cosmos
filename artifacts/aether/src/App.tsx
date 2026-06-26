import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import GraphView from "@/pages/graph-view";
import UploadView from "@/pages/upload";
import CoherenceView from "@/pages/coherence";
import SearchView from "@/pages/search";
import EquationsView from "@/pages/equations";
import ArchitectureView from "@/pages/architecture";
import PipelineView from "@/pages/pipeline";
import LatticeView from "@/pages/lattice";
import EcosystemView from "@/pages/ecosystem";
import CoreEngineView from "@/pages/core-engine";
import CulturalView from "@/pages/cultural";
import BiologyView from "@/pages/biology";
import ExperienceView from "@/pages/experience";
import ResonanceNoduleView from "@/pages/resonance-nodule";
import SourcesView from "@/pages/sources";
import DreamscapeView from "@/pages/dreamscape";
import SimulationView from "@/pages/simulation";
import QAetherView from "@/pages/q-aether";
import NeuralEmergenceView from "@/pages/neural-emergence";
import SpaceRocksView from "@/pages/space-rocks";
import AsAboveView from "@/pages/as-above";
import PDESimulatorView from "@/pages/pde-simulator";
import PhiAetherView from "@/pages/phi-aether";
import MultiScaleView from "@/pages/multiscale";
import MorphoComputerView from "@/pages/morpho-computer";
import AetherOSView from "@/pages/aether-os";
import CGLELiveView from "@/pages/cgle-live";
import FabricationView from "@/pages/fabrication";
import ResearchView from "@/pages/research";
import FeedbackLoopView from "@/pages/feedback-loop";
import ControlPanelView from "@/pages/control-panel";
import AetherCoreView from "@/pages/aether-core";
import TrigReferenceView from "@/pages/trig-reference";
import NeuroplasticityView from "@/pages/neuroplasticity";
import AetherComponentsView from "@/pages/aether-components";
import EvenOddFunctionsView from "@/pages/even-odd-functions";
import AnalogReservoirView from "@/pages/analog-reservoir";
import PhiFrameworkView from "@/pages/phi-framework";
import AquariumChipView from "@/pages/aquarium-chip";
import QuaternionsView from "@/pages/quaternions";
import BiomimeticSymphonyView from "@/pages/biomimetic-symphony";
import EcologicalIntelligenceView from "@/pages/ecological-intelligence";
import FibonacciCalendarView from "@/pages/fibonacci-calendar";
import UnifiedTimelineView from "@/pages/unified-timeline";
import CerebralOrganoidView from "@/pages/cerebral-organoids";
import CosmicConvergenceView from "@/pages/cosmic-convergence";
import AtlantisAlignmentView from "@/pages/atlantis-alignment";
import GobekliTepeView from "@/pages/gobekli-tepe";
import AetherIntakeView from "@/pages/aether-intake";
import NineShellsView from "@/pages/nine-shells";
import ShellsMindMapView from "@/pages/shells-mind-map";
import AetherWhitepaperView from "@/pages/aether-whitepaper";
import SixPlanetAlignmentView from "@/pages/six-planet-alignment";
import DiscoveryLoopView from "@/pages/discovery-loop";
import FibonacciQuantizationView from "@/pages/fibonacci-quantization";
import SymphonicOSView from "@/pages/symphonic-os";
import SymphonicProtocolView from "@/pages/symphonic-protocol";
import UFOAscentView from "@/pages/ufo-ascent";
import BrainMetabolismView from "@/pages/brain-metabolism";
import HypercomputationView from "@/pages/hypercomputation";
import FerroDriveView from "@/pages/ferrodrive";
import CLACoupledFieldsView from "@/pages/cla-coupled-fields";
import CancerCoherenceView from "@/pages/cancer-coherence";
import CancerDynamicsView from "@/pages/cancer-dynamics";
import BiomimeticQuantumView from "@/pages/biomimetic-quantum";
import ClosedLoopCoherenceView from "@/pages/closed-loop-coherence";
import PhiHOTView from "@/pages/phi-hot";
import PhiHOTZipperView from "@/pages/phi-hot-zipper";
import HeliosphericCoherenceView from "@/pages/heliospheric-coherence";
import AetherEggEnginePage from "@/pages/aether-egg-engine";
import UnderIceEcosystemPage from "@/pages/under-ice-ecosystem";
import AlchemyToFusionPage from "@/pages/alchemy-to-fusion";
import QuantumSubstratePage from "@/pages/quantum-substrate";
import NeuralPsychedelicPage from "@/pages/neural-psychedelic";
import PhotoTimelinePage from "@/pages/photo-timeline";
import ImplicateOrderPage from "@/pages/implicate-order";
import KnowableUniversePage from "@/pages/knowable-universe";
import NonPhysicalPhenomenaPage from "@/pages/non-physical-phenomena";
import ThreeRsRealityPage from "@/pages/three-rs-reality";
import AlchemicalProtocolPage from "@/pages/alchemical-protocol";
import WarpDriveLiteraturePage from "@/pages/warp-drive-literature";
import PuthoffMetricEngineeringPage from "@/pages/puthoff-metric-engineering";
import EniacMonteCarloPage from "@/pages/eniac-monte-carlo";
import KnowledgeMapPage from "@/pages/knowledge-map";
import DecisionEntropyPage from "@/pages/decision-entropy";
import UnifiedSynthesisPage from "@/pages/unified-synthesis";
import ClcsArchitecturePage from "@/pages/clcs-architecture";
import AetherDashboardPage from "@/pages/aether-dashboard";
import CucaHybridSkinPage from "@/pages/cuca-hybrid-skin";
import CucaGyroidPage from "@/pages/cuca-gyroid";
import AetherChildrensRealmPage from "@/pages/aether-childrens-realm";
import AetherSeasonsPage from "@/pages/aether-seasons";
import AetherFlowPage from "@/pages/aether-flow";
import AetherFoundationsPage from "@/pages/aether-foundations";
import SubstrateSynthesisPage from "@/pages/substrate-synthesis";
import SparkleTextPage from "@/pages/sparkle-text";
import LunarCoherencePage from "@/pages/lunar-coherence";
import LunarAmbientFieldPage from "@/pages/lunar-ambient-field";
import AlchemyFusionPage from "@/pages/alchemy-fusion";
import FamilyFieldDynamicsPage from "@/pages/family-field-dynamics";
import QuantumEyeFieldPage from "@/pages/quantum-eye-field";
import PsilocybinWaterOctopusPage from "@/pages/psilocybin-water-octopus";
import PinealMossVisionPage from "@/pages/pineal-moss-vision";
import QuantumRingdownBiocyclesPage from "@/pages/quantum-ringdown-biocycles";
import Manifold26DPage from "@/pages/manifold-26d";
import QueenBeeDiapausePage from "@/pages/queen-bee-diapause";
import NematicBeeFotonPage from "@/pages/nematic-bee-foton";
import TunguskaAsteroidTimelinePage from "@/pages/tunguska-asteroid-timeline";
import TardigradeDensityMSDDPage from "@/pages/tardigrade-density-msdd";
import CryptobiosisAsuTelomeresPage from "@/pages/cryptobiosis-asu-telomeres";
import MayaQuarksDnaGfpPage from "@/pages/maya-quarks-dna-gfp";
import HilbertStoragePage from "@/pages/hilbert-storage";
import TopographyElectrosetPage from "@/pages/topography-electroset";
import WebbledPhiCascadePage from "@/pages/webbed-phi-cascade";
import AetherMetaphysicsPage from "@/pages/aether-metaphysics";
import PollenClockRootsPage from "@/pages/pollen-clock-roots";
import LifeGradientPlanetaryPage from "@/pages/life-gradient-planetary";
import MoonMarsFieldPage from "@/pages/moon-mars-field";
import LunarPlantMemoryPage from "@/pages/lunar-plant-memory";
import PlantElectroactivityPage from "@/pages/plant-electroactivity";
import PlantNetworkPage from "@/pages/plant-network";
import MycorrhizalNetworkPage from "@/pages/mycorrhizal-network";
import MagicC8Page from "@/pages/magic-c8";
import SlimeMazePage from "@/pages/slime-maze";
import StellarBrainPage from "@/pages/stellar-brain";
import AwakeningTimelinePage from "@/pages/awakening-timeline";
import AetherWhyPage from "@/pages/aether-why";
import BabyRhythmPage from "@/pages/baby-rhythm";
import CliNanoPage from "@/pages/cli-nano";
import CalmCompanyPage from "@/pages/calm-company";
import SocialDeployPage from "@/pages/social-deploy";
import DivineTimingPage from "@/pages/divine-timing";
import GlossaryPage from "@/pages/glossary";
import QuantumAmmeterPage from "@/pages/quantum-ammeter";
import ThermalHierarchyView from "@/pages/thermal-hierarchy";
import GeometryOfPermissionView from "@/pages/geometry-of-permission";
import MathEnginePage from "@/pages/math-engine";
import ProductResearchPage from "@/pages/product-research";
import UltraMagnetismPage from "@/pages/ultra-magnetism";
import QuantumVacuumPage from "@/pages/quantum-vacuum";
import ResonantCellPage from "@/pages/resonant-cell";
import SpinVacuumPage from "@/pages/spin-vacuum";
import SymbolicPillarsPage from "@/pages/symbolic-pillars";
import MariPage from "@/pages/mari";
import OrganoidIntelPage from "@/pages/organoid-intel";
import PlantIntelPage from "@/pages/plant-intel";
import FerroModesPage from "@/pages/ferro-modes";
import VortexMathPage from "@/pages/vortex-math";
import OctonionAetherPage from "@/pages/octonion-aether";
import EarlyUniversePage from "@/pages/early-universe";
import PhononStackPage from "@/pages/phonon-stack";
import CosmicRefinePage from "@/pages/cosmic-refine";
import LiquidPrintPage from "@/pages/liquid-print";
import PlateSwitchingPage from "@/pages/plate-switching";
import AgentsPage from "@/pages/agents";
import ModulesPage from "@/pages/modules";
import MariCorePage from "@/pages/mari-core";
import ResonancePage from "@/pages/resonance";
import BohoFormulaPage from "@/pages/boho-formula";
import PostingArchitecturePage from "@/pages/posting-architecture";
import Atlas3IPage from "@/pages/atlas-3i";
import EnginesPage from "@/pages/engines";
import AquaCxePage from "@/pages/aqua-cxe";
import CulturalInterpretationsPage from "@/pages/cultural-interpretations";
import StackFabricPage from "@/pages/stack-fabric";
import BioEnginePage from "@/pages/bio-engine";
import BloodDNALabPage from "@/pages/blood-dna-lab";
import CircularFarmPage from "@/pages/circular-farm";
import EyeEvolutionPage from "@/pages/eye-evolution";
import QuantumGravityPage from "@/pages/quantum-gravity";
import MathStudioPage from "@/pages/math-studio";
import TritiumExtractPage from "@/pages/tritium-extract";
import CrashoutPage from "@/pages/crashout";
import CucaClosedLoopPage from "@/pages/cuca-closed-loop";
import PhiTimePage from "@/pages/phi-time";
import BioHybridMirrorPage from "@/pages/bio-hybrid-mirror";
import MyceliumSubstratePage from "@/pages/mycelium-substrate";
import GalileoNewtonPage from "@/pages/galileo-newton";
import UnifiedFieldPage from "@/pages/unified-field";
import GizaCircuitPage from "@/pages/giza-circuit";
import PrimeAntiPrimePage from "@/pages/prime-anti-prime";
import ConceptSystemsPage from "@/pages/concept-systems";
import MotionDoctrinePage from "@/pages/motion-doctrine";
import PropheticTimelinePage from "@/pages/prophetic-timeline";
import KnotTopologyPage from "@/pages/knot-topology";
import LightSpeedPage from "@/pages/light-speed";
import MrnaReadingsPage from "@/pages/mrna-readings";
import EarthCircuitPage from "@/pages/earth-circuit";
import SourceBoardPage from "@/pages/source-board";
import AetherDoctrinePage from "@/pages/aether-doctrine";
import PersonalOperatingModelPage from "@/pages/personal-operating-model";
import ColorCosmologyPage from "@/pages/color-cosmology";
import April23AlignmentPage from "@/pages/april-23-alignment";
import AsAboveSoBelowPage from "@/pages/as-above-so-below";
import PianoArithmeticPage from "@/pages/piano-arithmetic";
import PhiCoherentWavePage from "@/pages/phi-coherent-wave";
import CoherenceEnginePage from "@/pages/coherence-engine";
import AetherHealthPage from "@/pages/aether-health";
import NeutrinoLasersPage from "@/pages/neutrino-lasers";
import QAetherStackPage from "@/pages/q-aether-stack";
import CurvaturePlanePage from "@/pages/curvature-plane";
import SeasonalCoherencePage from "@/pages/seasonal-coherence";
import TerraformSunrisePage from "@/pages/terraform-sunrise";
import LogicFlowersPage from "@/pages/logic-flowers";
import CarbonLayeredPage from "@/pages/carbon-layered";
import StromatoliteAutomatonPage from "@/pages/stromatolite-automaton";
import PhotosynthesisSparkPage from "@/pages/photosynthesis-spark";
import UniversalGrammarPage from "@/pages/universal-grammar";
import AetherEdgeConstraintView from "@/pages/aether-edge-constraint";
import QuantumLivingSystemsView from "@/pages/quantum-living-systems";
import DiamondNanothreadsPage from "@/pages/diamond-nanothreads";
import ComputerBrainsPage from "@/pages/computer-brains";
import LearningLayersPage from "@/pages/learning-layers";
import ChaosToCodingPage from "@/pages/chaos-to-code";
import AetherCalendarPage from "@/pages/aether-calendar";
import AllBusinessIdeasPage from "@/pages/all-business-ideas";
import GufEnginePage from "@/pages/guf-engine";
import PropulsionEnginePage from "@/pages/propulsion-engine";
import StringNanobotPage from "@/pages/string-nanobot";
import SpinTransportPage from "@/pages/spin-transport";
import WarpGravityPage from "@/pages/warp-gravity";
import ObserverDimensionsPage from "@/pages/observer-dimensions";
import AetherClaPage from "@/pages/aether-cla";
import GufAnalysisPage from "@/pages/guf-analysis";
import SeaIntelligencePage from "@/pages/sea-intelligence";
import AetherPropulsionPage from "@/pages/aether-propulsion";
import MotionLanguagePage from "@/pages/motion-language";
import CarrierDimensionsPage from "@/pages/carrier-dimensions";
import CoherenceDecoherencePage from "@/pages/coherence-decoherence";
import EarthAtmospherePage from "@/pages/earth-atmosphere";
import BohoBloomPage from "@/pages/boho-bloom";
import ZoomTheZipperPage from "@/pages/zoom-the-zipper";
import FlowNotebookPage from "@/pages/flow-notebook";
import NeuralBrainSystemsPage from "@/pages/neural-brain-systems";
import WavePoolSynthesisPage from "@/pages/wave-pool-synthesis";
import SacredGeometryMathPage from "@/pages/sacred-geometry-math";
import ResonantSystemsPage from "@/pages/resonant-systems";
import SymbolSifterPage from "@/pages/symbol-sifter";
import CxeEquationPage from "@/pages/cxe-equation";
import MagneticDropsPage from "@/pages/magnetic-drops";
import FrogSimPaperPage from "@/pages/frog-sim-paper";
import SpacetimeFabricPage from "@/pages/spacetime-fabric";
import AetherVisualSystemPage from "@/pages/aether-visual-system";
import GrandUnifiedFrameworkPage from "@/pages/grand-unified-framework";
import WarpBubbleEnginePage from "@/pages/warp-bubble-engine";
import WaterTransportPage from "@/pages/water-transport";
import SolarArchitecturePage from "@/pages/solar-architecture";
import SpacetimeNavPage from "@/pages/spacetime-nav";
import WaterDensityPage from "@/pages/water-density";
import DialoguePage from "@/pages/dialogue";
import NeuralCoherencePage from "@/pages/neural-coherence";
import DarkSunPage from "@/pages/dark-sun";
import PhiCellularPage from "@/pages/phi-cellular";
import WebbedLegPage from "@/pages/webbed-leg";
import CognitiveBandsPage from "@/pages/cognitive-bands";
import PlasmaKnotsPage from "@/pages/plasma-knots";
import BiomagnetismPage from "@/pages/biomagnetism";
import SynthesizePage from "@/pages/synthesize";
import GraphiteSynthesisPage from "@/pages/graphite-synthesis";
import TimeProcessingPage from "@/pages/time-processing";
import UAPEnergyPage from "@/pages/uap-energy";
import TidalMovementPage from "@/pages/tidal-movement";
import BurstingQuaternionsPage from "@/pages/bursting-quaternions";
import ColorCoherencePage from "@/pages/color-coherence";
import RotationEnginePage from "@/pages/rotation-engine";
import LiquidDensityPage from "@/pages/liquid-density";
import FoodSubstrateCoherencePage from "@/pages/food-substrate-coherence";
import SubstrateKitchenPage from "@/pages/substrate-kitchen";
import LivingNutritionPage from "@/pages/living-nutrition";
import CompoundEyeRoadmapPage from "@/pages/compound-eye-roadmap";
import InformationManifoldPage from "@/pages/information-manifold";
import PhaseCouplingPage from "@/pages/phase-coupling";
import BodyCoherenceScannerPage from "@/pages/body-coherence-scanner";
import FogletSandstonePage from "@/pages/foglet-sandstone";
import HexiclicalBodyMapPage from "@/pages/hexiclical-body-map";
import AnimalNeuralPlasmoidPage from "@/pages/animal-neural-plasmoid";
import BioInfinityDrivePage from "@/pages/bio-infinity-drive";
import BiorefineryPropulsionPage from "@/pages/biorefinery-propulsion";
import FullPerceptionUniversePage from "@/pages/full-perception-universe";
import SeamossTransceiverPage from "@/pages/seamoss-transceiver";
import TorsionResonatorPage from "@/pages/torsion-resonator";
import SeamossGatePage from "@/pages/seamoss-gate";
import EngineComputerPage from "@/pages/engine-computer";
import BioluminescenceSpectrumPage from "@/pages/bioluminescence-spectrum";
import SoiBuildingPage from "@/pages/soi-building";
import RdSimulatorPage from "@/pages/rd-simulator";
import NeuralTopologyPage from "@/pages/neural-topology";
import MorphoPrimePage from "@/pages/morpho-prime";
import PerceptiveUniversePage from "@/pages/perceptive-universe";
import CoreResonancePage from "@/pages/core-resonance";
import SynchronyFieldPage from "@/pages/synchrony-field";
import StromatoliteFieldPage from "@/pages/stromatolite-field";
import AetherMatrixPage from "@/pages/aether-matrix";
import UnderstandingStrandPage from "@/pages/understanding-strand";
import GravitationalFieldPage from "@/pages/gravitational-field";
import CavityComputerPage from "@/pages/cavity-computer";
import QuantumComputerPage from "@/pages/quantum-computer";
import EgyptianCodexPage from "@/pages/egyptian-codex";
import PhrenologyAgentsPage from "@/pages/phrenology-agents";
import UvAminoLightPage from "@/pages/uv-amino-light";
import FullSpectrumLightPage from "@/pages/full-spectrum-light";
import PrismPrinciplePage from "@/pages/prism-principle";
import RegulatoryDepthPage from "@/pages/regulatory-depth";
import AntimatterWavePage from "@/pages/antimatter-wave";
import CognitiveArchitecturePage from "@/pages/cognitive-architecture";
import WorldHarmonyArchetypePage from "@/pages/world-harmony-archetype";
import FluidComputerPage from "@/pages/fluid-computer";
import AgentMappingPage from "@/pages/agent-mapping";
import EventHorizonPage from "@/pages/event-horizon";
import PhotonEmissionPage from "@/pages/photon-emission";
import TranscendentArtPage from "@/pages/transcendent-art";
import MotorCortexPage from "@/pages/motor-cortex";
import LiquidPrintMathPage from "@/pages/liquid-print-math";
import OpticalHullSimPage from "@/pages/optical-hull-sim";
import BlackHoleFrameworkPage from "@/pages/black-hole-framework";
import NeuroMetabolicPage from "@/pages/neuro-metabolic";
import EmergenceNetworkPage from "@/pages/emergence-network";
import PlasmaConfinementPage from "@/pages/plasma-confinement";
import TaitKnotsPage from "@/pages/tait-knots";
import PlantCoherenceSystemPage from "@/pages/plant-coherence-system";
import EnergeticFieldSimPage from "@/pages/energetic-field-sim";
import ChocolateTemperingPage from "@/pages/chocolate-tempering";
import ChladniFreezePage from "@/pages/chladni-freeze";
import IncommensurablePage from "@/pages/incommensurable";
import FireworkCoherencePage from "@/pages/firework-coherence";
import OsmoticPressurePage from "@/pages/osmotic-pressure";
import NonTerrestrialPage from "@/pages/non-terrestrial";
import PropulsionDynamicsPage from "@/pages/propulsion-dynamics";
import PolymerBiobreakPage from "@/pages/polymer-biobreak";
import AtpTransportPage from "@/pages/atp-transport";
import BorreliaKnotPage from "@/pages/borrelia-knot";
import FloquetPetalsPage from "@/pages/floquet-petals";
import GutBrainPage from "@/pages/gut-brain";
import PlanetaryNeuralPage from "@/pages/planetary-neural";
import StackedRingsPage from "@/pages/stacked-rings";
import EarthLivingSystemPage from "@/pages/earth-living-system";
import PortalRestorationPage from "@/pages/portal-restoration";
import OpalGenesisPage from "@/pages/opal-genesis";
import DynamicSynthesisPage from "@/pages/dynamic-synthesis";

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

function SignInPage() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "#02030A", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: 9999, overflowY: "auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 24, fontFamily: "'Cinzel', serif", fontSize: "1.4rem",
        color: "#00FFB2", letterSpacing: "0.4em", textAlign: "center" }}>AETHER</div>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "#02030A", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: 9999, overflowY: "auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: 24, fontFamily: "'Cinzel', serif", fontSize: "1.4rem",
        color: "#00FFB2", letterSpacing: "0.4em", textAlign: "center" }}>AETHER</div>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
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

function AuthGate({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh",
        background:"#02030A", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:14, zIndex:9999 }}>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.4rem",
          color:"#00FFB2", letterSpacing:"0.4em" }}>AETHER</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9,
          color:"#3A5060", letterSpacing:"0.2em" }}>AUTHENTICATING ···</div>
      </div>
    );
  }
  if (!isSignedIn) return <SignInPage />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route>
        <AuthGate>
          <Layout>
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
        <Route path="/magnetic-drops" component={MagneticDropsPage} />
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
        <Route component={NotFound} />
            </Switch>
          </Layout>
        </AuthGate>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
