import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "96px 24px",
        textAlign: "center",
      }}
    >
      <CheckCircle2 size={48} color="#00FFB2" style={{ marginBottom: 20 }} />
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#EAF2FF", marginBottom: 12 }}>
        You're in.
      </h1>
      <p style={{ color: "#9FB3D1", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
        Your payment was successful. It may take a few seconds for your access to
        update — refresh the billing page if it doesn't show right away.
      </p>
      <Link href="/billing">
        <Button>Back to billing</Button>
      </Link>
    </div>
  );
}
