import { stripeStorage } from "./stripeStorage";
import { getUncachableStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string | null, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email: email ?? undefined,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    mode: "payment" | "subscription",
    successUrl: string,
    cancelUrl: string,
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getOrCreateCustomerId(userId: string, email: string | null) {
    let user = await stripeStorage.getUser(userId);
    if (!user) {
      user = await stripeStorage.upsertUser(userId, email);
    }
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }
    const customer = await this.createCustomer(email, userId);
    await stripeStorage.setStripeCustomerId(userId, customer.id);
    return customer.id;
  }
}

export const stripeService = new StripeService();
