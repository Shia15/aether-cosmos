import { Router, type IRouter } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { stripeStorage } from "../lib/stripeStorage";
import { stripeService } from "../lib/stripeService";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getOrigin(req: import("express").Request) {
  const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domains) return `https://${domains}`;
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/billing/products", async (_req, res) => {
  const rows = await stripeStorage.listActiveProductsWithPrices();

  const products = rows.map((row: any) => ({
    id: row.product_id,
    name: row.product_name,
    description: row.product_description ?? null,
    metadata: row.product_metadata ?? {},
    price: row.price_id
      ? {
          id: row.price_id,
          unitAmount: row.unit_amount,
          currency: row.currency,
          interval: row.recurring?.interval ?? null,
        }
      : undefined,
  }));

  res.json(products);
});

router.post("/billing/checkout", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { priceId } = req.body ?? {};
  if (!priceId || typeof priceId !== "string") {
    return res.status(400).json({ error: "priceId is required" });
  }

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? null;

    const customerId = await stripeService.getOrCreateCustomerId(
      userId,
      email,
    );

    const origin = getOrigin(req);
    const stripe = await getUncachableStripeClient();
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? "subscription" : "payment";

    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      mode,
      `${origin}/billing/success`,
      `${origin}/billing`,
    );

    res.json({ url: session.url ?? null });
    return;
  } catch (err) {
    logger.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
    return;
  }
});

router.post("/billing/portal", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const user = await stripeStorage.getUser(userId);
  if (!user?.stripeCustomerId) {
    res.status(400).json({ error: "No billing account yet" });
    return;
  }

  const origin = getOrigin(req);
  const session = await stripeService.createCustomerPortalSession(
    user.stripeCustomerId,
    `${origin}/billing`,
  );

  res.json({ url: session.url ?? null });
});

router.get("/billing/status", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const user = await stripeStorage.getUser(userId);
  if (!user?.stripeCustomerId) {
    res.json({ subscriptions: [], purchases: [] });
    return;
  }

  const [subscriptionRows, purchaseRows] = await Promise.all([
    stripeStorage.getSubscriptionsForCustomer(user.stripeCustomerId),
    stripeStorage.getPaymentIntentsForCustomer(user.stripeCustomerId),
  ]);

  const subscriptions = subscriptionRows
    .filter((row: any) => row.status === "active" || row.status === "trialing")
    .map((row: any) => ({
      id: row.id,
      status: row.status,
      priceId: row.price_id ?? null,
      productId: row.product_id ?? null,
      currentPeriodEnd: row.current_period_end
        ? new Date(row.current_period_end * 1000).toISOString()
        : null,
    }));

  const purchases = purchaseRows.map((row: any) => ({
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    priceId: row.metadata?.priceId ?? null,
    createdAt: new Date(row.created * 1000).toISOString(),
  }));

  res.json({ subscriptions, purchases });
});

export default router;
