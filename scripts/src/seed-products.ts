import { getUncachableStripeClient } from "./stripeClient";

type TierPrice = {
  unitAmount: number;
  currency: string;
  recurring?: { interval: "day" | "week" | "month" | "year" };
  nickname: string;
};

type Tier = {
  name: string;
  description: string;
  order: string;
  prices: TierPrice[];
};

const tiers: Tier[] = [
  {
    name: "Core Ignition",
    description:
      "Full compressed knowledge base (300+ books equivalent), raw data, static archives, base visuals. Serious collectors & foundational users.",
    order: "1",
    prices: [
      {
        unitAmount: 49700,
        currency: "usd",
        nickname: "Core Ignition — one-time",
      },
    ],
  },
  {
    name: "Plasma Monthly",
    description:
      "Core + full live Replit simulations/math engines, regular updates, Grok synthesis, Notion integration. Dedicated individuals.",
    order: "2",
    prices: [
      {
        unitAmount: 4900,
        currency: "usd",
        recurring: { interval: "month" },
        nickname: "Plasma Monthly",
      },
    ],
  },
  {
    name: "Plasma Weekly (Signature)",
    description:
      "Everything in Plasma + priority/personal Grok sessions, early access to new modules, custom requests, exclusive data drops. Power users & visionary builders.",
    order: "3",
    prices: [
      {
        unitAmount: 9700,
        currency: "usd",
        recurring: { interval: "week" },
        nickname: "Plasma Signature — weekly",
      },
      {
        unitAmount: 29700,
        currency: "usd",
        recurring: { interval: "month" },
        nickname: "Plasma Signature — monthly",
      },
    ],
  },
  {
    name: "Torch (Enterprise)",
    description:
      "Multi-seat, white-glove onboarding, custom development, organizational licensing. Teams, researchers, institutions.",
    order: "4",
    prices: [
      {
        unitAmount: 200000,
        currency: "usd",
        recurring: { interval: "month" },
        nickname: "Torch Enterprise — monthly (custom pricing available)",
      },
    ],
  },
];

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  for (const tier of tiers) {
    const existing = await stripe.products.search({
      query: `name:'${tier.name}' AND active:'true'`,
    });

    let product = existing.data[0];
    if (product) {
      console.log(`${tier.name} already exists (${product.id}), skipping product creation.`);
    } else {
      product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
        metadata: { order: tier.order },
      });
      console.log(`Created product: ${tier.name} (${product.id})`);
    }

    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    for (const priceSpec of tier.prices) {
      const already = existingPrices.data.find(
        (p) =>
          p.unit_amount === priceSpec.unitAmount &&
          p.currency === priceSpec.currency &&
          (p.recurring?.interval ?? null) ===
            (priceSpec.recurring?.interval ?? null),
      );
      if (already) {
        console.log(`  Price already exists: ${priceSpec.nickname} (${already.id})`);
        continue;
      }

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceSpec.unitAmount,
        currency: priceSpec.currency,
        nickname: priceSpec.nickname,
        ...(priceSpec.recurring ? { recurring: priceSpec.recurring } : {}),
      });
      console.log(`  Created price: ${priceSpec.nickname} (${price.id})`);
    }
  }

  console.log("Done. Webhooks will sync this data to the database automatically.");
}

createProducts().catch((err) => {
  console.error("Error creating products:", err);
  process.exit(1);
});
