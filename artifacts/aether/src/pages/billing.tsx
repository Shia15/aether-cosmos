import { useState } from "react";
import { Link } from "wouter";
import { useUser } from "@clerk/react";
import {
  useListBillingProducts,
  useCreateBillingCheckout,
  useCreateBillingPortalSession,
  useGetBillingStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Lock } from "lucide-react";

const F = "'Inter',ui-sans-serif,system-ui,sans-serif";
const M = "'Space Mono',monospace";
const GOLD = "#f5c84c";
const GOLD_DIM = "rgba(245,200,76,0.55)";
const WHITE = "#f4f1ea";
const TEXT = "rgba(244,241,234,0.62)";
const MUTED = "rgba(244,241,234,0.4)";
const BORDER = "rgba(255,255,255,0.09)";
const CARD = "rgba(255,255,255,0.028)";

const PHASES = [
  {
    weeks: "Weeks 1–2",
    title: "Foundations",
    desc: "Orient inside the system. The Crystallization Model, the coherence field C(x,t), and the vocabulary of AETHER.",
    stops: ["Graph Map", "AETHER Foundations", "Glossary", "The Why"],
  },
  {
    weeks: "Weeks 3–4",
    title: "Substrates & Matter",
    desc: "Matter as staged crystallization. Work every atomic substrate hands-on — diamond to bismuth — in live simulation.",
    stops: ["Crystallization Atlas", "Substrate Studio", "Periodic Table", "Quantum Substrate"],
  },
  {
    weeks: "Weeks 5–6",
    title: "Living Systems",
    desc: "The biological levers: epigenetic switches, nutrition as information, bio-hybrid computation.",
    stops: ["Regulatory Depth", "Nutritional DNA Key", "Bio-Computational", "Mycelium Substrate"],
  },
  {
    weeks: "Weeks 7–8",
    title: "Cosmos & Fields",
    desc: "Fields that never break: lunar coupling, electron coherence, gradient mechanisms, timing windows.",
    stops: ["Lunar Coherence", "Electron Field", "Gradient Field", "Divine Timing"],
  },
  {
    weeks: "Weeks 9–10",
    title: "Engines & Synthesis",
    desc: "All fields unified into working engines — matter synthesis, circular farms, pneumatic transport, living tunnels.",
    stops: ["AETHER Engine", "Circular AI Farm", "Air Nanotube", "Resonant Tunnel"],
  },
  {
    weeks: "Weeks 11–12",
    title: "Mastery & Synthesis",
    desc: "Run the full system yourself: interrogate the equation clusters, map the data graph, and produce your own synthesis.",
    stops: ["Question Bank", "Data Graph", "Semantic Search", "Batch Intake"],
  },
];

const INCLUDED = [
  "Lifetime access to all 480+ interfaces — every simulator, workbench, and image atlas",
  "The 12-week guided timeline: foundations → substrates → life → cosmos → engines → mastery",
  "Every live canvas simulation with sliders, readouts, and the math behind them",
  "All annotated image plates and source-material galleries",
  "Claude-powered chat inside the system for questions as you learn",
  "All future modules — the system grows, your access doesn't expire",
];

function formatUsd(unitAmount: number, currency: string) {
  return (unitAmount / 100).toLocaleString(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  });
}

export default function BillingPage() {
  const { user, isLoaded: authLoaded, isSignedIn } = useUser();
  const { data: products, isLoading: productsLoading } = useListBillingProducts();
  const { data: status } = useGetBillingStatus();
  const checkout = useCreateBillingCheckout();
  const portal = useCreateBillingPortalSession();
  const [redirecting, setRedirecting] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const course = (products ?? []).find(p => p.price && !p.price.interval);
  const owned = (status?.purchases ?? []).some(
    p =>
      course?.price &&
      (p.priceId
        ? p.priceId === course.price.id
        : p.amount === course.price.unitAmount),
  );
  const hasBilling =
    (status?.subscriptions?.length ?? 0) > 0 || (status?.purchases?.length ?? 0) > 0;

  async function handleBuy() {
    if (!course?.price) return;
    setBuyError(null);
    setRedirecting(true);
    try {
      const session = await checkout.mutateAsync({ data: { priceId: course.price.id } });
      if (session.url) window.location.href = session.url;
    } catch {
      setBuyError("Please sign in first — then your purchase is tied to your account.");
    } finally {
      setRedirecting(false);
    }
  }

  async function handlePortal() {
    const session = await portal.mutateAsync();
    if (session.url) window.location.href = session.url;
  }

  const loading = productsLoading;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0906", fontFamily: F, color: WHITE }}>
      <style>{`
        .bl-glow { position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 800px 440px at 50% -8%, rgba(245,200,76,0.14), transparent 62%); }
        .bl-buy { transition: transform .15s, box-shadow .15s; }
        .bl-buy:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(245,200,76,0.25); }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ position: "relative", padding: "96px 7vw 40px", textAlign: "center", overflow: "hidden" }}>
        <div className="bl-glow" />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: M, fontSize: 12, letterSpacing: "0.35em", color: GOLD, marginBottom: 24 }}>
            AETHER · THE COMPLETE COURSE
          </div>
          <h1 style={{ margin: 0, fontFamily: F, fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
            One system. One journey.<br />
            <span style={{ color: GOLD }}>One payment.</span>
          </h1>
          <p style={{ margin: "24px auto 0", maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: TEXT }}>
            The entire AETHER knowledge system as one large coherent course. Over 12 weeks you are
            led through the simulations, the image atlases, and the working engines on a practical,
            staged timeline — from first principles to full-system synthesis.
          </p>

          {/* ── Login area ── */}
          {authLoaded && (
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              {isSignedIn ? (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999,
                  background: "rgba(245,200,76,0.06)", border: "1px solid rgba(245,200,76,0.22)",
                  fontFamily: M, fontSize: 11, letterSpacing: "0.12em", color: GOLD_DIM,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  SIGNED IN AS {(user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "MEMBER").toUpperCase()}
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    <Link href="/sign-in">
                      <Button style={{
                        background: "transparent", color: GOLD, fontWeight: 700, fontSize: 13,
                        padding: "18px 26px", borderRadius: 10, border: `1px solid rgba(245,200,76,0.45)`,
                      }}>
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button style={{
                        background: "rgba(245,200,76,0.1)", color: GOLD, fontWeight: 700, fontSize: 13,
                        padding: "18px 26px", borderRadius: 10, border: `1px solid rgba(245,200,76,0.25)`,
                      }}>
                        Create account
                      </Button>
                    </Link>
                  </div>
                  <div style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.2em", color: MUTED }}>
                    SIGN IN FIRST — YOUR PURCHASE IS TIED TO YOUR ACCOUNT
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Offer card ── */}
      <div style={{ padding: "0 7vw 70px", display: "flex", justifyContent: "center" }}>
        {loading ? (
          <Skeleton style={{ height: 260, width: "100%", maxWidth: 560, borderRadius: 16 }} />
        ) : course?.price ? (
          <div style={{
            width: "100%", maxWidth: 560, borderRadius: 18, padding: "36px 38px", textAlign: "center",
            background: "linear-gradient(165deg, rgba(245,200,76,0.09), rgba(255,255,255,0.02))",
            border: `1px solid ${owned ? GOLD : "rgba(245,200,76,0.35)"}`,
          }}>
            {owned ? (
              <>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: GOLD, fontFamily: M, fontSize: 12, letterSpacing: "0.2em", marginBottom: 14 }}>
                  <CheckCircle2 size={16} /> YOU OWN THE COURSE
                </div>
                <div style={{ fontSize: 15, color: TEXT, marginBottom: 22, lineHeight: 1.55 }}>
                  Lifetime access is active. Begin at Phase 01 — Foundations.
                </div>
                <Link href="/aether-foundations">
                  <Button className="bl-buy" style={{ background: GOLD, color: "#141005", fontWeight: 700, fontSize: 15, padding: "22px 34px", borderRadius: 12 }}>
                    Start Phase 01 →
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {formatUsd(course.price.unitAmount, course.price.currency)}
                </div>
                <div style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.25em", color: MUTED, margin: "6px 0 24px" }}>
                  ONE-TIME · LIFETIME ACCESS · NO SUBSCRIPTION
                </div>
                <Button
                  className="bl-buy"
                  onClick={handleBuy}
                  disabled={redirecting || checkout.isPending}
                  style={{ background: GOLD, color: "#141005", fontWeight: 700, fontSize: 15, padding: "24px 40px", borderRadius: 12 }}
                >
                  {redirecting || checkout.isPending ? "Redirecting to checkout…" : "Get the Complete Course"}
                </Button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 12, color: MUTED }}>
                  <Lock size={12} /> Secure checkout via Stripe
                </div>
                {buyError && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#f0a8a8" }}>{buyError}</div>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{ color: MUTED, fontSize: 14 }}>Course offer unavailable — please try again shortly.</div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div style={{ padding: "0 7vw 60px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 6px", fontFamily: F, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" }}>
          The practical timeline
        </h2>
        <p style={{ margin: "0 auto 40px", fontSize: 14, color: MUTED, textAlign: "center", maxWidth: 520 }}>
          Six phases, each building on the last. Every phase works inside the live system — not videos about it.
        </p>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 1, background: "linear-gradient(180deg, rgba(245,200,76,0.5), rgba(245,200,76,0.08))" }} />
          {PHASES.map((ph, i) => (
            <div key={ph.title} style={{ position: "relative", paddingLeft: 58, marginBottom: 34 }}>
              <div style={{
                position: "absolute", left: 6, top: 2, width: 27, height: 27, borderRadius: "50%",
                background: "#141005", border: `1.5px solid ${GOLD_DIM}`, color: GOLD,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: M, fontSize: 11,
              }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.25em", color: GOLD_DIM, marginBottom: 5 }}>
                {ph.weeks.toUpperCase()}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                Phase {String(i + 1).padStart(2, "0")} · {ph.title}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: TEXT, maxWidth: 620, marginBottom: 10 }}>
                {ph.desc}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ph.stops.map(s => (
                  <span key={s} style={{
                    fontFamily: M, fontSize: 10.5, letterSpacing: "0.06em", color: MUTED,
                    border: `1px solid ${BORDER}`, borderRadius: 999, padding: "4px 11px", background: CARD,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What's included ── */}
      <div style={{ padding: "0 7vw 80px", maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 24px", fontFamily: F, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", textAlign: "center" }}>
          What the one payment covers
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {INCLUDED.map(line => (
            <div key={line} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "15px 18px",
            }}>
              <CheckCircle2 size={16} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 14, lineHeight: 1.55, color: TEXT }}>{line}</span>
            </div>
          ))}
        </div>
        {!owned && course?.price && (
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Button
              className="bl-buy"
              onClick={handleBuy}
              disabled={redirecting || checkout.isPending}
              style={{ background: GOLD, color: "#141005", fontWeight: 700, fontSize: 15, padding: "24px 40px", borderRadius: 12 }}
            >
              {redirecting || checkout.isPending
                ? "Redirecting to checkout…"
                : `Begin the journey — ${formatUsd(course.price.unitAmount, course.price.currency)}`}
            </Button>
          </div>
        )}
      </div>

      {/* ── Billing management ── */}
      {hasBilling && (
        <div style={{ padding: "0 7vw 80px", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <Button variant="outline" onClick={handlePortal} disabled={portal.isPending}
              style={{ borderColor: BORDER, color: TEXT, background: "transparent" }}>
              {portal.isPending ? "Opening portal…" : "Manage billing"}
            </Button>
          </div>
          {(status?.purchases?.length ?? 0) > 0 && (
            <>
              <div style={{ fontFamily: M, fontSize: 11, letterSpacing: "0.25em", color: MUTED, marginBottom: 12, textAlign: "center" }}>
                PAST PURCHASES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {status!.purchases.map(p => (
                  <div key={p.id} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "10px 14px", background: CARD, border: `1px solid ${BORDER}`,
                    borderRadius: 8, fontSize: 13, color: TEXT,
                  }}>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    <span>{formatUsd(p.amount, p.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
