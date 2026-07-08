import BillingPage from "./billing";
import SubstratesPage from "./substrates";

const M = "'Space Mono',monospace";
const GOLD = "#f5c84c";

export default function HomeLanding() {
  return (
    <div style={{ background: "#0b0906" }}>
      <BillingPage />

      {/* ── Divider: the data/information hook ── */}
      <div style={{ padding: "10px 7vw 0", textAlign: "center" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(245,200,76,0.35), transparent)" }} />
        <div style={{ marginTop: 34, fontFamily: M, fontSize: 11, letterSpacing: "0.35em", color: GOLD }}>
          WHAT'S INSIDE — THE LIVE SYSTEM, IN TOTALITY ↓
        </div>
      </div>

      <SubstratesPage />
    </div>
  );
}
