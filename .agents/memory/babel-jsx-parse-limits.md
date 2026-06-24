---
name: Babel JSX parse limits in this codebase
description: Two Babel/Vite parse failure patterns to avoid in JSX files — local type aliases and long strings with multi-byte chars
---

## Rule 1: No local TypeScript type aliases inside function bodies

In Babel 7 with @babel/plugin-transform-typescript (used by Vite), `type Alias = {...}` inside a function body (including useEffect callbacks) can cause cascading parse errors. The error appears at a seemingly unrelated line far from the `type` declaration.

**Fix:** Use inline type annotations instead:
- `const arr: {x:number;y:number}[] = []` instead of `type T={x:number;y:number}; const arr: T[]`
- `const fn = (items: {x:number}[]) => {}` instead of defining a named type

**Why:** Babel treats `type` as a contextual keyword only at module scope. Inside nested function bodies, the parser may interpret `type Identifier` as two adjacent expression-statements, causing it to lose track of the surrounding JSX structure.

## Rule 2: Keep P() string arguments under ~400 characters per line

Babel has issues with string tokens > 1000 characters that contain multi-byte Unicode characters (em-dash U+2014, middle dot U+00B7) inside JSX expression contexts. The error reports as "Unexpected token, expected ','" at the closing `}` of the JSX expression.

**Fix:** Split long prose strings into multiple P() calls, each under 400 chars per line.

**How to apply:** Whenever writing page JSX with prose paragraphs, keep each `{P("...")}` on a line ≤ 400 characters. Split at sentence boundaries.
