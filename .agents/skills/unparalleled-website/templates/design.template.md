# Design: <product>

Revision: <design revision> · Product record: product.md · Live system: design.html
Status: draft | awaiting review | changes requested | approved (quote and date)

Every section records: decision · source (product.md fact, vocabulary term or personality trait) · standard satisfied · project bans or explicit user overrides · check. Rules, standards and allowed/banned practice: `references/intelligence/`.

## 0. Premise
Governing product truth (cite facts) · relationship it creates in the design · swap test · counter-argument and answer · invalidated by.

## 1. Brand personality
Evidence · 3–5 trait pairs ("X, not Y") · tone on the four dimensions · expression map (trait → color terms → type → geometry → imagery → motion → copy) · existing commitments · swap test.

## 2. Color
Route (mcp, cli or fallback) and evidence file · terms and weights · locked roles · theme(s).
| Role | OKLCH | Hex | Source | Reason | Approx. area |
| --- | --- | --- | --- | --- | --- |
Certificate status · changes and unresolved · measured pairs (including states and media) · non-color partners for every color meaning.

## 3. Typography
Families (source, licence, scripts, weights, axes) and why · pairing principle · loading and fallback overrides.
| Role | Step | Min px | Max px | clamp() | Line height | Tracking | Weight |
| --- | --- | --- | --- | --- | --- | --- | --- |
Measure · numerals and features · specimen strings.

## 4. Spatial and layout
Base unit and scale (token, value, role) · proximity ratio · grid per breakpoint · alignment and intentional breaks · hierarchy per key view · density per surface.

## 5. Negative space
Macro and micro rules · focal point per key view · removed elements and why · noise budget (also in design-tokens).

## 6. Visual assets
| Asset | Purpose | Route (2D image, vector, 3D, video) | Source or generator | Licence | Status |
| --- | --- | --- | --- | --- | --- |
Art direction rules · icon grid and stroke · formats and budgets · alt-text policy · fallbacks.

## 7. Components
Inventory · per component: anatomy, geometry and why, variants, state table (state → treatment → token), keyboard model, target size, label and error copy.

## 8. UX and information architecture
Audiences and top tasks · sitemap or screen map · primary flow with every state · navigation model · label glossary · heading outline · landmarks.

## 9. Responsive
Breakpoints and why · per-component transformations · fluid endpoints · input and hover rules · short-height rules · asset variants.

## 10. Motion
Tokens (duration and easing per purpose).
| Moment | Trigger | What changes and why | Duration and easing | Interruption | Reduced-motion equivalent |
| --- | --- | --- | --- | --- | --- |

## 11. Accessibility
Target (WCAG 2.2 AA unless stated) and legal context · focus indicator · target size policy · keyboard models · text-alternative policy · forced colors · test plan.

## 12. Conversion
Primary and secondary actions per key view · value proposition · objection map · proof inventory with sources · friction audit · CTA and form rules · success metric.

## 13. Stack and pipelines
Framework recommendation, reason and one credible alternative (or the user's choice) · dimension · image, 3D and motion-graphics pipelines and their prerequisites.

## 14. Machine-readable tokens
```json design-tokens
{
  "tokens": {},
  "fonts": [],
  "noise_budget": { "fontSizes": 0, "textColors": 0, "radii": 0, "shadows": 0, "spacingValues": 0, "focalCandidates": 1 }
}
```

## 15. Review ledger
| Revision | Inner evidence (sync report, captures opened, pairs measured) | Human feedback (exact words) | Decision | Changes made |
| --- | --- | --- | --- | --- |
