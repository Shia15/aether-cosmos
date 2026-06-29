---
name: HTML entities render literally in JSX string props
description: Why &middot; / &amp; etc. break when passed as component props vs JSX text
---

# HTML entities in JSX string props

HTML entities (`&middot;`, `&amp;`, `&mdash;`, `&rarr;`, `&ldquo;`...) are decoded by JSX
**only inside JSX text nodes**. When the same token sits inside a quoted string that is
passed as a prop (`title="A &middot; B"`, `role="MEMORY &middot; X"`, or a
`{"...&amp;..."}` string-literal child), it is a plain JS string — React renders it
**literally** (`A &middot; B`), not as the glyph.

**Why:** the AETHER atlas/synthesis pages (data-graph.tsx, regulatory-depth.tsx,
convergence.tsx) pass lots of label/title/sub/caption text as props to helper
components (Plate/Anno/ClusterHead/Tier/Droplet). Entities in those props leak
through visibly and typecheck fine, so it ships broken.

**How to apply:** in these pages use literal Unicode glyphs in prop strings (`·`, `—`,
`&`, `“ ”`, `→`) or `\\u` escapes — NOT HTML entities. Reserve HTML entities for actual
JSX text-node content. The working reference (data-graph.tsx) already uses literal `·`
and `—` in its strings; copy that, don't introduce entities.
