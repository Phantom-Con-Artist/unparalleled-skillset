# Design intelligence: the professional disciplines behind design.md

Each file below is one discipline a professional web or product designer is accountable for. Each has the same parts: what the discipline decides, the standards and data to fetch, **Allowed practice**, **Banned practice**, what to record in `design.md`, and how to verify it in the browser.

These files are shared by `unparalleled-website` and `unparalleled-ui`. Lines marked **Website** or **App UI** apply to that skill only.

## Order of work (fixed)

Design.md is written in this order. Each step reads the decisions above it. Do not start a step before the one above has a recorded decision.

| # | Discipline | File | Why it sits here |
| --- | --- | --- | --- |
| 0 | Brand personality | [brand-personality.md](brand-personality.md) | Turns product.md and its vocabulary into traits every later step must express. |
| 1 | Color | [color.md](color.md) | Uses the Color Intelligence Layer. Sets the roles that type and components sit on. |
| 2 | Typography | [typography.md](typography.md) | Typeface, pairing and scale, measured against the color roles. |
| 3 | Spatial and layout | [spatial-layout.md](spatial-layout.md) | Grid, spacing scale and density, derived from the type scale. |
| 3a | Negative space | [negative-space.md](negative-space.md) | **The governing discipline.** Sets the noise budget every other step must respect. |
| 4 | Visual assets | [visual-assets.md](visual-assets.md) | 2D (image generation, vector) or 3D (Blender) routes, placed inside the space budget. |
| 5 | Components | [components.md](components.md) | Geometry, states and targets, built from 1–4. |
| 6 | UX and information architecture | [ux-information-architecture.md](ux-information-architecture.md) | Structure, navigation, labels and the journey. |
| 7 | Responsive | [responsive.md](responsive.md) | How 1–6 transform from 320px to wide screens. |
| 8 | Motion | [motion.md](motion.md) | What moves, why, and the reduced-motion equivalent. |
| 9 | Accessibility | [accessibility.md](accessibility.md) | WCAG 2.2 AA as a floor across 1–8, not a final coat. |
| 10 | Conversion | [conversion.md](conversion.md) | The primary action, friction and honest persuasion. |

[sources.md](sources.md) lists the verified primary sources for every discipline in one place.

## How to apply Allowed and Banned

- **Banned** is the default. A banned practice may appear only when the user explicitly asks for it or an existing brand already commits to it. Record that instruction in `design.md` next to the decision. Renaming a banned practice does not make it allowed.
- **Allowed** is a menu, not a quota. Pick what the product evidence supports and say why in `design.md`.
- Hard accessibility floors (contrast, focus, target size, reflow, reduced motion) cannot be waived by taste, approval or brand.
- A heuristic number (60-30-10, 8pt grid, golden ratio, 45–75 characters) is a starting point you can depart from with a reason. A WCAG success criterion is not a heuristic.

## Fetch, then decide

When a decision depends on a standard, fetch the cited page and record the access date and what it settled in `design.md`. If a page cannot be fetched, say so and do not quote it from memory as if read. Reference sites and design systems are evidence of method, never components or identities to copy.
