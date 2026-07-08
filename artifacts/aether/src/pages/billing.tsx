import { useState } from "react";
import {
  useListBillingProducts,
  useCreateBillingCheckout,
  useCreateBillingPortalSession,
  useGetBillingStatus,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Zap, Radio, Building2, CheckCircle2 } from "lucide-react";

const TIER_META: Record<
  string,
  { icon: typeof Sparkles; blurb: string; accent: string }
> = {
  "Core Ignition": {
    icon: Sparkles,
    blurb: "One-time onboarding — full system access, no recurring commitment.",
    accent: "#00FFB2",
  },
  "Plasma Monthly": {
    icon: Zap,
    blurb: "Standing monthly access to the full coherence system.",
    accent: "#7DD3FC",
  },
  "Plasma Weekly (Signature)": {
    icon: Radio,
    blurb: "High-touch weekly cadence for active practitioners.",
    accent: "#F472B6",
  },
  "Torch (Enterprise)": {
    icon: Building2,
    blurb: "Custom enterprise deployment, support, and integration.",
    accent: "#FBBF24",
  },
};

function formatPrice(unitAmount: number, currency: string, interval: string | null) {
  const amount = (unitAmount / 100).toLocaleString(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
  });
  if (!interval) return amount;
  return `${amount} / ${interval}`;
}

export default function BillingPage() {
  const { data: products, isLoading: productsLoading } = useListBillingProducts();
  const { data: status, isLoading: statusLoading } = useGetBillingStatus();
  const checkout = useCreateBillingCheckout();
  const portal = useCreateBillingPortalSession();
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);

  const activePriceIds = new Set(
    (status?.subscriptions ?? [])
      .map((s) => s.priceId)
      .filter((id): id is string => Boolean(id)),
  );
  const hasBilling = (status?.subscriptions?.length ?? 0) > 0 || (status?.purchases?.length ?? 0) > 0;

  async function handleCheckout(priceId: string) {
    setPendingPriceId(priceId);
    try {
      const session = await checkout.mutateAsync({ data: { priceId } });
      if (session.url) window.location.href = session.url;
    } finally {
      setPendingPriceId(null);
    }
  }

  async function handlePortal() {
    const session = await portal.mutateAsync();
    if (session.url) window.location.href = session.url;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 96px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: "'Space Mono',monospace",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "rgba(0,255,178,0.6)",
            marginBottom: 12,
          }}
        >
          AETHER · ACCESS TIERS
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#EAF2FF", marginBottom: 12 }}>
          Choose your coherence path
        </h1>
        <p style={{ color: "#9FB3D1", fontSize: 15, maxWidth: 620, margin: "0 auto" }}>
          Every tier grants access to the AETHER knowledge system. Pick the ignition,
          cadence, or enterprise deployment that fits how you work.
        </p>
      </div>

      {hasBilling && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <Button variant="outline" onClick={handlePortal} disabled={portal.isPending}>
            {portal.isPending ? "Opening portal..." : "Manage billing"}
          </Button>
        </div>
      )}

      {productsLoading || statusLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {(products ?? []).map((product) => {
            const meta = TIER_META[product.name] ?? {
              icon: Sparkles,
              blurb: product.description ?? "",
              accent: "#00FFB2",
            };
            const Icon = meta.icon;
            const isActive = Boolean(
              product.price && activePriceIds.has(product.price.id),
            );
            const isPending = pendingPriceId === product.price?.id && checkout.isPending;

            return (
              <Card
                key={product.price?.id ?? product.id}
                style={{
                  background: "rgba(10,16,28,0.6)",
                  border: `1px solid ${isActive ? meta.accent : "rgba(184,204,232,0.15)"}`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <Icon size={20} color={meta.accent} />
                    {isActive && (
                      <Badge style={{ background: `${meta.accent}22`, color: meta.accent, border: "none" }}>
                        <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle style={{ fontSize: 17, color: "#EAF2FF" }}>
                    {product.name}
                    {product.price?.interval && (
                      <span style={{ fontSize: 11, color: "#9FB3D1", fontWeight: 400, marginLeft: 8 }}>
                        billed {product.price.interval}ly
                      </span>
                    )}
                  </CardTitle>
                  <div style={{ fontSize: 22, fontWeight: 700, color: meta.accent, marginTop: 4 }}>
                    {product.price
                      ? formatPrice(product.price.unitAmount, product.price.currency, product.price.interval)
                      : "Contact us"}
                  </div>
                </CardHeader>
                <CardContent style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                  <p style={{ fontSize: 13, color: "#9FB3D1", flex: 1, lineHeight: 1.5 }}>
                    {product.description || meta.blurb}
                  </p>
                  <Button
                    onClick={() => product.price && handleCheckout(product.price.id)}
                    disabled={!product.price || isPending || isActive}
                    style={{
                      background: isActive ? "transparent" : meta.accent,
                      color: isActive ? meta.accent : "#03110A",
                      border: isActive ? `1px solid ${meta.accent}` : "none",
                    }}
                  >
                    {isActive
                      ? "Current plan"
                      : isPending
                        ? "Redirecting..."
                        : product.price
                          ? "Get started"
                          : "Contact sales"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {(status?.purchases?.length ?? 0) > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 15, color: "#EAF2FF", marginBottom: 16, letterSpacing: "0.08em" }}>
            PAST PURCHASES
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {status!.purchases.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#9FB3D1",
                }}
              >
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                <span>
                  {(p.amount / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: p.currency.toUpperCase(),
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
