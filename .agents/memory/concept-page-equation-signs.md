---
name: Concept-page equation/runtime sign consistency
description: For AETHER concept pages that both display a governing equation and simulate its dynamics, the displayed variable's meaning must match the runtime sign.
---

When a page renders a source equation (e.g. `dS/dt = -k(chaos) + m(minerals)`) AND animates a state bar/meter from it, the bar's labeled quantity must be the SAME variable S in the equation, with matching signs.

**Why:** On `/crystallization-locking` the displayed equation used S = brittle "lock state" (minerals raise it, chaos lowers it), but the runtime tracked the inverse ("coherence", minerals lower it). Equation, labels, and behavior disagreed -- caught only in architect review, not by typecheck.

**How to apply:** Pick ONE meaning for the state variable up front. If the source art shows S as the "bad/locked" state, the meter should rise toward bad and the reset button drives it to 0. If you prefer an intuitive "health/coherence" meter (full = good), then restate the equation in that variable's form (flip both signs) so all three stay aligned. Never show the source equation verbatim while computing its inverse.
