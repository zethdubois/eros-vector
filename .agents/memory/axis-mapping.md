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

**How to apply:** Whenever writing axis labels, pole names, diagnostic questions, SVG annotations, survey seeds, or archetype resolver logic — always derive from this table, not from `archetypes.md` pole descriptions or session notes.

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

## labels.ts status

As of the current codebase, `src/lib/labels.ts` is still V1 — 8 archetypes over XYZ only, using old pole names ("Erotic/Emotional"). The `resolveArchetype()` function ignores `w`. The V2 16-archetype engine has not been built yet.
