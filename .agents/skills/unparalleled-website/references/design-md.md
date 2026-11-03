# design.md and design.html: the binding design system

`design.md` is the written design system and brand kit for this product: every visual and experience decision, its source and its check. `design.html` is the same system rendered live in the browser. Together they replace moodboards, separate brand-kit documents and specimen viewers. Development may not start until a human has approved the current revision of both.

## Write design.md in the fixed order

Use the [template](../templates/design.template.md). Fill the sections in this order; each reads the ones above it. The rules, standards, allowed and banned practice for each section are in [intelligence/](intelligence/README.md).

0. **Premise**: the one product truth that governs the design, the swap test, the counter-argument and what would invalidate it.
1. **Brand personality** ([brand-personality.md](intelligence/brand-personality.md))
2. **Color** ([color.md](intelligence/color.md)), run through the Color Intelligence Layer
3. **Typography** ([typography.md](intelligence/typography.md))
4. **Spatial and layout** ([spatial-layout.md](intelligence/spatial-layout.md))
5. **Negative space** ([negative-space.md](intelligence/negative-space.md)), including the noise budget
6. **Visual assets** ([visual-assets.md](intelligence/visual-assets.md)): 2D or 3D route
7. **Components** ([components.md](intelligence/components.md))
8. **UX and information architecture** ([ux-information-architecture.md](intelligence/ux-information-architecture.md))
9. **Responsive** ([responsive.md](intelligence/responsive.md))
10. **Motion** ([motion.md](intelligence/motion.md))
11. **Accessibility** ([accessibility.md](intelligence/accessibility.md))
12. **Conversion** ([conversion.md](intelligence/conversion.md))
13. **Stack and pipelines**: framework recommendation with one credible alternative ([framework-selection.md](framework-selection.md)); 2D/3D/hybrid; image, Blender and motion-graphics pipelines when used.
14. **Machine-readable tokens**: the fenced `design-tokens` block (below).
15. **Review ledger**: revisions, inner-review evidence, exact human feedback and decisions.

Each section records: the decision, its source (product.md fact or vocabulary term, or a personality trait), the standard it satisfies, project-specific banned practice or explicit user overrides, and how it will be checked. A section with only adjectives is incomplete.

## The design-tokens block

`design.md` ends with one fenced block tagged `design-tokens` so scripts can compare the written system with the rendered one:

````markdown
```json design-tokens
{
  "tokens": { "--color-canvas": "#F6F1E7", "--color-text": "#1C1A17", "--space-3": "1rem" },
  "fonts": ["Fraunces", "Public Sans"],
  "noise_budget": { "fontSizes": 7, "textColors": 5, "radii": 3, "shadows": 2, "spacingValues": 12, "focalCandidates": 1 }
}
```
````

Token names are the CSS custom properties `design.html` and the product define on `:root`. Fonts are family names exactly as used in `font-family`. The noise budget uses the measures from `capture.mjs` (see [negative-space.md](intelligence/negative-space.md)).

## Build design.html

Start from the [template](../templates/design.template.html). It is the design system's live specimen and the representative design in one page, built only from design.md tokens:

- **Tokens** declared on `:root` exactly as in the `design-tokens` block.
- **Color**: each role as a swatch with its measured contrast pairs in text.
- **Typography**: the scale set in the product's real strings (name, longest heading, body paragraph, label, numbers), at each step.
- **Space**: the spacing scale and one grouped example showing the proximity ratio.
- **Components**: every component in every state (state sheet), in each theme the product supports.
- **Assets**: the actual or stand-in visual assets at placement size, labeled honestly.
- **Representative section**: the first frame and one later segment of the real site or screen, with the decisive interaction working, so the human judges the design in use and not only as parts.
- **Motion**: the key transition, with a reduced-motion toggle showing its equivalent.

No invented proof, metrics or testimonials. Stand-ins are labeled as stand-ins.

## Inner loop: Playwright checks design.html against design.md

Before showing a human:

1. `node scripts/check-design-sync.mjs --design design.md --url design.html` confirms every token resolves to its declared value, every declared font is loaded, and the noise budget holds. Save its output as evidence.
2. `node scripts/capture.mjs --url design.html --out <dir>` at desktop and phone, plus `--reduced-motion`. Open every image.
3. Measure the rendered contrast pairs (`node scripts/check-contrast.mjs --pairs <file>`).
4. Fix defects at their source (the design.md decision, then the token, then design.html) and re-run.

If the browser is unavailable, record that gap; do not claim the inner review passed.

## Outer loop: human review

Present design.html (a runnable file or preview URL), the revision, the opened captures, a short rationale per discipline, and known limits. Ask for decisions on concrete choices. Record the human's exact words in the review ledger and the contract.

- **No, refine**: update the affected design.md sections first, then tokens, then design.html; repeat the inner loop; present the new revision. Keep the previous decision in the ledger's history.
- **Yes**: record the approval and its scope. Development starts from this revision.

Silence, praise without a decision, elapsed time or a passing script is not approval. Human approval never waives an accessibility failure. A later material change to premise, palette, type, geometry, dimension or stack returns here.
