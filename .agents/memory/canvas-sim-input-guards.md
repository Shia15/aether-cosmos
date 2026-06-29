---
name: Canvas simulation input guards
description: Two recurring bug classes in AETHER's live-canvas pages (angle metrics + date-derived inputs)
---

# Canvas simulation input guards

AETHER has many live-canvas "simulation" pages (orrery/sky-dial, fields, etc.). Two
recurring bug classes to check on every new one:

## 1. Angle-difference metrics must be circular
Any metric built from the difference of two angles (azimuth, ecliptic longitude,
phase) must use shortest-arc separation `min(|a-b|, 360-|a-b|)`, NOT raw `Math.abs(a-b)`.

**Why:** raw subtraction is wrong across the 0/360 wrap (359 vs 1 reads as 358 apart,
not 2), producing visibly wrong readouts that typecheck fine and never throw.

**How to apply:** define one `angSep(a,b)` helper and route every azimuth/longitude
delta through it.

## 2. Date-derived canvas inputs need NaN guards
When a `datetime-local` (or any user field) feeds math that lands on canvas
coordinates, an invalid/cleared input yields `Invalid Date` -> `NaN` -> non-finite
`x,y` -> `ctx.arc(...)` throws and the draw loop dies.

**Why:** the field can be momentarily empty/partial while the user edits; one NaN
silently breaks the whole animation.

**How to apply:** guard the parse (`isNaN(d.getTime())` -> fall back to last-valid /
`new Date()`), AND add a `Number.isFinite(...)` continue-guard at the top of the
per-item draw loop as defense in depth.
