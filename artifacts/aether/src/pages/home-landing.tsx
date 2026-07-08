import GraphView from "./graph-view";
import BillingPage from "./billing";
import XGrokPage from "./x-grok";
import SubstratesPage from "./substrates";

const M = "'Space Mono',monospace";
const GOLD = "#f5c84c";

function Divider({ label }: { label: string }) {
  return (
    <div style={{ padding: "10px 7vw 0", textAlign: "center" }}>
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(245,200,76,0.35), transparent)" }} />
      <div style={{ marginTop: 34, fontFamily: M, fontSize: 11, letterSpacing: "0.35em", color: GOLD }}>
        {label}
      </div>
    </div>
  );
}

export default function HomeLanding() {
  return (
    <div style={{ background: "#0b0906" }}>
      <GraphView />

      <Divider label="THE COURSE — ENROL & ACCESS THE FULL SYSTEM ↓" />
      <BillingPage />

      <Divider label="GROK BRIDGE — LIVE X INTELLIGENCE ↓" />
      <XGrokPage />

      <Divider label="WHAT'S INSIDE — THE LIVE SYSTEM, IN TOTALITY ↓" />
      <SubstratesPage />
    </div>
  );
}
