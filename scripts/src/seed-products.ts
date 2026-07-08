import { getUncachableStripeClient } from "./stripeClient";

const COURSE_NAME = "AETHER · The Complete Course";
const COURSE_PRICE = 299700; // $2,997 one-time
const RETIRED_TIERS = [
  "Core Ignition",
  "Plasma Monthly",
  "Plasma Weekly (Signature)",
  "Torch (Enterprise)",
];

async function seed() {
  const stripe = await getUncachableStripeClient();

  for (const name of RETIRED_TIERS) {
    const found = await stripe.products.search({
      query: `name:'${name}' AND active:'true'`,
    });
    for (const product of found.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false });
        console.log(`  Deactivated price ${price.id} (${name})`);
      }
      await stripe.products.update(product.id, { active: false });
      console.log(`Retired product: ${name} (${product.id})`);
    }
  }

  const existing = await stripe.products.search({
    query: `name:'${COURSE_NAME}' AND active:'true'`,
  });

  let product = existing.data[0];
  if (product) {
    console.log(`${COURSE_NAME} already exists (${product.id}).`);
  } else {
    product = await stripe.products.create({
      name: COURSE_NAME,
      description:
        "One large coherent course. A guided journey through every AETHER simulation, image plate, and workbench on a practical staged timeline — from foundations to full-system synthesis. Lifetime access, one payment.",
      metadata: { kind: "course", order: "1" },
    });
    console.log(`Created product: ${COURSE_NAME} (${product.id})`);
  }

  const existingPrices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
  const already = existingPrices.data.find(
    (p) => p.unit_amount === COURSE_PRICE && p.currency === "usd" && !p.recurring,
  );
  if (already) {
    console.log(`  Price already exists: ${already.id}`);
  } else {
    for (const price of existingPrices.data) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`  Deactivated stale course price ${price.id}`);
    }
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: COURSE_PRICE,
      currency: "usd",
      nickname: "Complete Course — one-time",
    });
    console.log(`  Created price: $2,997 one-time (${price.id})`);
  }

  console.log("Done. Webhooks will sync this data to the database automatically.");
}

seed().catch((err) => {
  console.error("Error seeding products:", err);
  process.exit(1);
});
