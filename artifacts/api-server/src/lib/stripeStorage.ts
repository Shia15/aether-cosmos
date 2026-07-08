import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export class StripeStorage {
  async getUser(id: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user;
  }

  async upsertUser(id: string, email: string | null) {
    const [user] = await db
      .insert(usersTable)
      .values({ id, email: email ?? undefined })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email: email ?? undefined },
      })
      .returning();
    return user;
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string) {
    const [user] = await db
      .update(usersTable)
      .set({ stripeCustomerId })
      .where(eq(usersTable.id, id))
      .returning();
    return user;
  }

  async listActiveProductsWithPrices() {
    const result = await db.execute(sql`
      WITH active_products AS (
        SELECT id, name, description, metadata, active
        FROM stripe.products
        WHERE active = true
      )
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.metadata as price_metadata
      FROM active_products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      ORDER BY p.metadata->>'order' NULLS LAST, p.id, pr.unit_amount
    `);
    return result.rows;
  }

  async getSubscriptionsForCustomer(customerId: string) {
    const result = await db.execute(sql`
      SELECT
        id,
        status,
        current_period_end,
        items,
        items->'data'->0->'price'->>'id' as price_id,
        items->'data'->0->'price'->>'product' as product_id
      FROM stripe.subscriptions
      WHERE customer = ${customerId}
      ORDER BY created DESC
    `);
    return result.rows;
  }

  async getPaymentIntentsForCustomer(customerId: string) {
    const result = await db.execute(sql`
      SELECT id, status, amount, currency, metadata, created
      FROM stripe.payment_intents
      WHERE customer = ${customerId} AND status = 'succeeded'
      ORDER BY created DESC
    `);
    return result.rows;
  }
}

export const stripeStorage = new StripeStorage();
