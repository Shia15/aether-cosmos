---
name: Screenshot tool can't reach deep SPA routes
description: Why direct screenshots of AETHER deep routes always show the home graph
---

# Screenshot tool and deep SPA routes (AETHER)

Taking an `app_preview` screenshot of a deep route like `/sky-dial` reliably shows the
home knowledge-graph (`GraphView`, the `path="/"` route), not the target page — for
every deep route, including ones confirmed working via in-app nav.

**Why:** the workspace iframe normally passes the path via `?initialPath=...`. The
screenshot tool loads the proxy URL but the SPA boots wouter at `/`, so the inner
`<Switch>` matches `path="/"` (GraphView) before the deep route is ever navigated to.
It is NOT a routing bug and NOT a lazy-load timing issue.

**How to apply:** to validate a new deep page, (1) confirm Vite transforms it without a
Babel/esbuild parse error (`curl /@fs/<abs-path>.tsx` returns compiled JS), (2) confirm
the lazy import + `<Route>` in App.tsx and the nav entry in layout.tsx, (3) trust in-app
navigation. Don't keep re-screenshotting expecting the deep page to appear.
