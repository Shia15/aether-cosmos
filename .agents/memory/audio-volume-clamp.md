---
name: HTMLMediaElement volume must be clamped
description: rAF volume-fade loops throw IndexSizeError when eased interpolation dips slightly below 0 / above 1
---

Setting `HTMLMediaElement.volume` to any value outside `[0,1]` throws
`IndexSizeError: The volume provided (…) is outside the range [0, 1]`.

**Why:** a requestAnimationFrame fade that interpolates `start + (target-start)*eased`
can produce tiny out-of-range floats (e.g. -0.0024) from easing/float drift even when
start and target are both in range. The error surfaces as an unhandled runtime error in
the browser console, not a build failure.

**How to apply:** always clamp before assigning: `el.volume = Math.min(1, Math.max(0, v))`
(both inside the animation step AND on the final settle assignment). Seen in
`artifacts/aether/src/components/background-music.tsx`.
