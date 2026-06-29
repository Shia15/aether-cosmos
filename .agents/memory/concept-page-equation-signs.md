---
name: Concept-page equation/runtime sign consistency
description: For AETHER concept pages that both display a governing equation and simulate its dynamics, the displayed variable's meaning must match the runtime sign.
---

When a page renders a source equation (e.g. `dS/dt = -k(chaos) + m(minerals)`) AND animates a state bar/meter from it, the bar's labeled quantity must be the SAME variable S in the equation, with matching signs.

**Why:** On `/crystallization-locking` the displayed equation used S = brittle "lock state" (minerals raise it, chaos lowers it), but the runtime tracked the inverse ("coherence", minerals lower it). Equation, labels, and behavior disagreed -- caught only in architect review, not by typecheck.

**How to apply:** Pick ONE meaning for the state variable up front. If the source art shows S as the "bad/locked" state, the meter should rise toward bad and the reset button drives it to 0. If you prefer an intuitive "health/coherence" meter (full = good), then restate the equation in that variable's form (flip both signs) so all three stay aligned. Never show the source equation verbatim while computing its inverse.

**Second instance (live-sim pages):** On `/transport-cavity` the equation cards advertised a Gaussian a_z(t) and v_trans = v0 + K·gradC, but the runtime drove the object with a smootherstep polynomial and K/C only nudged lateral drift — so the headline sliders didn't drive the advertised transport. Same class of bug, again caught only by architect. Fix: make the runtime integrate the actual displayed equation (true Gaussian pulse, K·C axial term), and add a short "RUNTIME MODEL" note beside the sim so any later divergence is visible. Rule: on any page that shows an equation AND simulates it, the named control variables in the equation must be the ones the sliders actually move in the loop.

**Third instance (source-image equation transcribed verbatim):** A source diagram printed `V̇_VOC = V̇₀ exp((C − φ⁻¹)/Δc)` with the chart showing VOC HIGH at low C and decaying as C rises. Transcribing the printed form verbatim with an implicit positive Δc inverts the trend (it rises with C). Architect caught it. Fix: rewrite as `exp((φ⁻¹ − C)/Δc), Δc>0` (equivalent to the image's form with Δc<0) so equation + chart + caption agree. Rule: don't trust the literal sign in a source image — re-derive the monotonic direction from the chart and pick the sign/convention that reproduces it, stating the Δ-parameter sign explicitly.
