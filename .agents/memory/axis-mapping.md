---
name: Axis letter-to-domain mapping
description: The locked W/X/Y/Z axis key from docs/wiki/axes.md. Critical to get right — W and Y were historically swapped in archetypes.md and in early agent edits.
---

## Locked axis key (axes.md is authoritative)

| Axis | Domain       | + Pole         | − Pole     |
|------|--------------|----------------|------------|
| W    | Architecture | Interdependent | Autonomous |
| X    | Drive        | Recreational   | Romantic   |
| Y    | Permeability | Contained      | Permeable  |
| Z    | Method       | Directed       | Organic    |

**Why:** `archetypes.md` has a "v2.1 axis remap" changelog entry that swapped W and Y relative to `axes.md`. `axes.md` is labeled "Locked axis key" and is the source of truth. Any discrepancy in `archetypes.md` is a doc bug, not the spec.

**How to apply:** Whenever writing axis labels, pole names, diagnostic questions, SVG annotations, survey seeds, or archetype resolver logic — always derive from this table, not from session notes.

## Diagnostic questions

- W (Architecture): "How do you build your life?"
- X (Drive): "Why are you connecting?"
- Y (Permeability): "How far can connections enter and reshape your relational life?" (UI shorthand: "How open is your relational world?")
- Z (Method): "How does it actually happen?"

## Color assignments (landing page / UI)

- W: violet `#9b7fe8`
- X: rose `#9e7982` / `var(--rose)`
- Y: gold `#c4a574`
- Z: teal `#7a9e9a`

## labels.ts status (V2 — current)

`src/lib/labels.ts` is V2: 16 archetypes over WXYZ with correct V2 pole names, descriptions, and signatures from archetypes.md. `resolveArchetype()` matches on all four axes. Special case: coords (0,0,0,0) returns `SCHRODINGERS_PARTNER` before sign resolution.

`src/lib/scoring.ts` includes `w` in sums, counts, and return value — all four axes scored.

`src/lib/types.ts` has `w` in both `Axis` union and `Coordinates` type.

## Schrödinger's Partner (origin special case)

When all four coordinates are exactly 0, `resolveArchetype` returns `SCHRODINGERS_PARTNER` — a comical archetype with no `signs` field. The `signs` field on `Archetype` is optional for this reason. This triggers on the Simulate page "Reset to zero" button and is theoretically possible (but rare) in real survey data.
