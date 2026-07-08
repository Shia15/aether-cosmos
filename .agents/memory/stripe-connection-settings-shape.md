---
name: Stripe connection settings shape
description: The actual field names returned by the Replit Stripe connector API differ from the stripe skill's code-template docs
---

When fetching Stripe credentials via `GET https://${REPLIT_CONNECTORS_HOSTNAME}/api/v2/connection?include_secrets=true&connector_names=stripe`, the real response shape is:

```
settings: { account_id, secret: "sk_...", publishable: "pk_...", mcp: "ek_test_...", claim_url }
```

- `settings.secret` is a **plain string** (the secret key itself) — NOT a nested object with `.secret_key`.
- `settings.publishable` is also a plain string (not `.publishable_key`).
- There is **no `webhook_secret` field** in connection settings at all.
- `settings.mcp` holds an `ek_test_...` key for a different (MCP) purpose — do not confuse it with the main secret key.

**Why:** the `.local/skills/stripe/references/code-templates.md` ground-truth template documents `secret_key`/`webhook_secret` field names, which do not match this environment's live connector response. Trusting the skill template literally caused two separate `getStripeCredentials()` implementations (server + scripts) to throw "missing secret key" until corrected.

**How to apply:** always read `settings.secret ?? settings.secret_key` (string fallback chain) for the key, and leave webhook secret undefined/optional — rely on `stripe-replit-sync`'s `findOrCreateManagedWebhook()` to manage webhooks server-side rather than expecting a webhook secret from connection settings.
