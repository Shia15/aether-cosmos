---
name: Screenshots of deep SPA routes need the dev-access bypass
description: How to reach AETHER deep routes in app_preview screenshots past the access-code gate
---

# Screenshot tool and deep SPA routes (AETHER)

Historically, `app_preview` screenshots of deep routes like `/sky-dial` showed the
home knowledge-graph or the login/access gate instead of the target page.

**Update (July 2026):** the access-code gate (`AccessCodeGate` in App.tsx, driven by
`VITE_AETHER_ACCESS_CODE`) now has a dev-only bypass: append `?dev-access=1` to the
path. It only activates when `import.meta.env.DEV` is true, sets the
`aether.access.v1` sessionStorage flag, and production is unaffected.
Screenshotting `path="/vercel-dashboard?dev-access=1"` was confirmed to render the
actual deep page with live data — deep routes ARE reachable this way.

**How to apply:** to validate a deep page visually, screenshot
`/<route>?dev-access=1`. If a deep route still boots at `/` (GraphView), fall back to:
(1) confirm Vite transforms the page without a parse error, (2) confirm lazy import +
`<Route>` in App.tsx and nav entry in layout.tsx, (3) trust in-app navigation.
