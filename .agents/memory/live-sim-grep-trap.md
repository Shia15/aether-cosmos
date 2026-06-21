---
name: Live Simulation grep trap
description: AETHER pages use mixed-case "Live Simulation" in existing blocks — uppercase grep gives false negatives.
---

When auditing AETHER pages for Live Simulation coverage, always use `grep -qi "live simulation"`, NOT `grep -q "LIVE SIMULATION"`. The earlier sessions wrote badge text as `"Live Simulation"` (mixed case) while the audit loop was checking for the uppercase variant, causing ~200 pages to be falsely reported as missing and leading to orphaned canvas component functions being added and then removed. A single case-insensitive grep would have caught this immediately.

**Why:** Two naming conventions co-exist in the codebase — some pages were written with `"LIVE SIMULATION"` (uppercase, DM Mono badge style) and many with `"Live Simulation"` (mixed case, system-ui badge style). Neither is wrong; both are present.

**How to apply:** Before starting any new "add badge to all pages" audit, run `for f in *.tsx; do grep -qi "live simulation" "$f" || echo "$f"; done` and confirm the count matches expectations. If a page appears missing, open it to visually verify before adding anything.
