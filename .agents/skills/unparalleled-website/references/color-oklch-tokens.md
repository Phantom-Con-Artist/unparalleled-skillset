# Product-derived color

Choose colors from evidence: the actual product, its environment, materials, existing identity, or a specific emotional association justified by the brief. Record the source, role, and reason for each major color in `prospective-design.md`. A pigment name alone is not evidence. Use OKLCH to tune relationships, then inspect in the target browser and gamut.

## Palette bans

| Banned default | Why it fails |
| --- | --- |
| Purple/blue AI gradients and lavender pastel washes | They substitute category fashion for product identity. |
| Obsidian or slate with neon emerald, cyan, or violet | The familiar dark developer-tool kit is not an original direction. |
| Cream/beige with terracotta or sage and a luxury serif | The stock artisan/editorial palette carries a preset genre. |
| Black-and-white Swiss red or Klein blue | A gallery poster recipe is not subject research. |
| Candy pastels with black borders, rainbow mesh, aurora, or holographic iridescence | Decoration becomes the subject. |
| Arbitrary single neon accent, stock Tailwind scales, or identical palettes across all specimens | An implementation shortcut cannot stand in for a palette decision. |

These bans target stock combinations and unsupported use, not every isolated hue. Honor explicit user colors, an established identity, and real product colors. Do not ban a genuine orange product just because orange appears in a trend. Explain retained colors and make the surrounding system original. Pure white and black are available when materially or functionally justified; do not replace them reflexively with beige and obsidian.

## Token contract

Use three levels: source pigments, semantic roles, and component aliases. Describe canvas, surface, primary and secondary text, action, focus, selection, and status. Accent count follows actual information needs rather than a compulsory one-accent rule. Keep status meaning recognizable and pair it with words or shape.

Token generation must take a project-specific JSON object of CSS custom properties. The supplied generator intentionally has no default palette. It accepts `--input <tokens.json> --output <tokens.css>`, with values such as `oklch(...)`, `clamp(...)`, and font stacks chosen from the brief. Do not call it and assume color authorship is complete.

## Verification

Test real foreground/background pairs after compositing opacity, textures, overlays, video frames, and hover states. Body text needs at least 4.5:1; qualifying large text and meaningful UI boundaries need at least 3:1. Do not label ordinary captions “large text” to pass a weaker threshold. Disabled elements require clear semantics even when contrast exemptions apply.

Run `node scripts/check-contrast.mjs --pairs <pairs.json>` from the skill directory with measured sRGB hex pairs and a valid threshold for each. The input is an array of objects with `name`, `fg`, `bg`, and `req` fields. The no-argument repository command tests reference fixtures only and cannot certify generated OKLCH tokens or a rendered page. Record any untested surfaces honestly.
