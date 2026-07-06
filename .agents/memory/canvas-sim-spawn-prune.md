---
name: Canvas sim spawn/prune balance
description: Particle-spawn caps in AETHER canvas sims must be reconciled with the prune threshold or the array saturates and the sim silently stalls
---

# Canvas particle spawn cap must be reconcilable with the prune threshold

In AETHER live-canvas sims, particles are typically spawned each frame up to
a cap and pruned when the array grows past a larger threshold. If the spawn
cap is on the **total** array length and sits **below** the prune threshold,
the prune branch is unreachable: once landed/dead particles fill the array to
the spawn cap, spawning halts and the sim freezes with no error.

**Why:** the pollen-flower `PollenBloomCanvas` spawned while
`grains.length < 260` but only pruned `if (grains.length > 300)`. Landed grains
were never removed, the array saturated at 260, spawning stopped, the bloom
stalled. Parse-check and dev server pass clean — this only shows up in a
2–5 min soak, so it slips past normal verification.

**How to apply:** cap spawning against the count of **active** (still-moving)
particles, not total length — then dead/landed particles accumulate past the
prune threshold and get pruned each cycle. Also guard any `dx/d`, `dy/d`
attraction normalization with `d > eps` (e.g. `d > 0.001`) so a particle
exactly on the attractor doesn't inject NaN into velocity and corrupt state.
