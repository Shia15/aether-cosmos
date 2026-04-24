import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

function Router() {
  return (
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
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
