---
name: declare-const underscore suppression trap
description: Why `declare const _` + `_ = x` unused-var suppression crashes at runtime
---

# `declare const _` unused-variable suppression is a runtime trap

Some pages tried to silence TS `noUnusedLocals`/`noUnusedParameters` by
assigning throwaway values to `_` and declaring it with `declare const _: unknown;`.

**The bug:** `declare const` is a TYPE-ONLY declaration. It satisfies the
typechecker but emits zero JavaScript, so at runtime `_` does not exist.
Every `_ = something` line then throws `ReferenceError: _ is not defined`
the moment the function runs (e.g. inside a canvas draw loop), which in a
React component cascades into a misleading "Invalid hook call" error from
the nearest error boundary.

**Why:** typecheck passes (the symbol is "declared"), so the bug is
invisible until the code path actually executes in the browser. Pure
typecheck verification will NOT catch it — you must restart the workflow
and check browser/runtime logs.

**How to apply:** never use `declare const _` + `_ = x` to suppress
unused-variable warnings. Instead delete the dead variables/computations,
or prefix a genuinely-unused parameter with `_` (e.g. `_label`) which is
the supported way to satisfy `noUnusedParameters` without any runtime code.
