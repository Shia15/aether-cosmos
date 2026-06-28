---
name: Wiring new pages into App.tsx + layout.tsx
description: Avoid duplicate lazy/Route/nav entries when adding a page to the aether artifact
---

When adding a new page to `artifacts/aether`, three places must be touched and each must stay unique:

1. `src/App.tsx` — a `const XPage = lazy(() => import("@/pages/x"))` declaration.
2. `src/App.tsx` — a `<Route path="/x" component={XPage} />` entry.
3. `src/components/layout.tsx` — one nav object `{ href: "/x", label: "...", icon: SomeIcon }`.

**Why:** A duplicated `lazy()` const causes a `VarRedeclaration` build error; a duplicated `<Route>` or nav entry causes React duplicate-key warnings and confusing double links.

**How to apply:** Before adding, grep the route slug and component name across `App.tsx` and `layout.tsx` to confirm none already exist. Use an `icon` value that is already imported from `lucide-react` in `layout.tsx` (e.g. `Boxes`) to avoid adding a missing import.
