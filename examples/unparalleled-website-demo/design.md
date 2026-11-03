# Design: Hollow

Revision: d3 · Product record: product.md · Live system: design.html · Built page: index.html
Status: approved d3. Repository owner, 2026-11-03: "Example looks good approved".

## 0. Premise
Governing truth: a pot is a profile turned around a hollow (F2). Relationship: the page's one focal object is a vessel whose flat profile and turned form are shown together, and the reader's main interaction is the making itself (shape, trim, fire). Swap test: replace "Hollow" with a yoga studio and the profile, foot and kiln stages have nothing to describe. Counter-argument: a class catalogue converts better. Answer: there are no real classes (F1); the honest action is understanding the process. Invalidated by: readers skipping the workbench entirely, or not realising the studio is fictional.

## 1. Brand personality
Evidence: F1, F2, vocabulary. Traits: **patient, not slow** · **hand-made, not rustic** · **encouraging, not cute** · **exact, not clinical**. Tone: serious-leaning but warm, casual, respectful, matter-of-fact. Expression: warm-but-not-craft palette (color), irregular open counters (type), uneven rim only in the illustration (geometry), one product object (imagery), settle-and-stop motion, short plain sentences in second person (copy). Competitor swap: the studio sites in product.md lead with class lists; this page leads with the clay.

## 2. Color
Route: `cli` (Color Intelligence Layer `analyze` with declared usages; palette authored from the vocabulary, roles locked). Evidence: `color/analyze.json`.

| Role | Hex | Source | Reason | Approx. area |
| --- | --- | --- | --- | --- |
| canvas `--pigment-shelf` | #E8EFF1 | "shelf" | Cool drying-shelf ground; avoids the beige craft preset | 45% |
| stage `--pigment-kiln-wash` | #F4DF83 | "kiln" test label | Marks the hero and the making as the warm centre | 30% |
| ink / action `--pigment-manganese` | #442D3D | "manganese glaze" | Text and the one primary action | 15% |
| ink-soft | #63515E | manganese, lighter | Secondary text | 5% |
| paper | #FBFCF9 | chalk | Workbench surface | 5% |
| focus | #87363E | oxide | Focus ring, distinct from ink | <1% |
| line | #887881 | manganese, desaturated | Control boundaries | <1% |

Measured (WCAG 2.2 AA, engine output): ink on canvas 10.69:1, ink-soft on canvas 6.29:1, ink on stage 9.32:1, action text 12.08:1, focus 6.87:1 (non-text), line 3.57:1 (non-text). All pass. APCA (supplementary): body pairs reach Lc 75–88, below the engine's conservative Lc 90 body guidance; recorded, not a WCAG failure. Color never carries meaning alone: stages are named and numbered. Project bans: no gradients on surfaces, no glow, no second accent.

## 3. Typography
Family: Bricolage Grotesque (SIL OFL, F5), embedded Latin WOFF2 subset as `Hollow`, weights 400–800, optical sizing. Why: irregular, open counters echo the uneven rim (trait "hand-made, not rustic"); not a neutral default sans. One family; contrast comes from size and weight. Fallback: Georgia, serif.

| Role | Token | Min → max | Line height | Tracking | Weight |
| --- | --- | --- | --- | --- | --- |
| Display (h1) | `--display` | 49.6 → 145.6px | .96 | −.055em | 650 |
| Heading (h2) | `--heading` | 32 → 70.4px | 1.05 | −.045em | 650 |
| Title (h3, wordmark-scale) | `--title` | 22.4 → 35.2px | 1.2 | −.025em | 650 |
| Lead | `--lead` | 16.8 → 22.4px | 1.5 | 0 | 450 |
| Body | `--body` | 16 → 18.4px | 1.6 | 0 | 450 |
| Small (labels, captions, notes) | `--small` | 14px | 1.5 | 0 | 450–600 |

Measure 30–56ch. No tracked uppercase labels. The vessel annotations inside the SVG add two illustration sizes (counted in the noise budget).

## 4. Spatial and layout
Spacing scale: `--space-xs` 8, `--space-s` 16, `--space-m` 24, `--space-l` 32, `--space-xl` 48, `--space-2xl` 80px; fluid `--gutter` 18–64px; hero foot 128px is the one recorded exception (it lets the vessel sit low). Proximity: inside a beat 16–24px, between beats 48–80px (≥2×). Grid: two-column process layout (1.25fr / 1fr) above 900px, single flow below 640px. Hierarchy (hero): headline → vessel → lead → action.

## 5. Negative space
One focal point per view: the headline and the vessel read as one composition. Removed in d3: the tracked-uppercase eyebrow treatment, the eyebrow above the studio heading, the category label on phones, eight near-duplicate font sizes and five off-scale spacing values. Budget (also in design-tokens): font sizes 8, text colors 3, radii 1, shadows 1, spacing values 12, focal 1. Measured on index.html d3 at desktop: 8 / 3 / 0 / 0 / 12 / 1. Justified exception: phone first-view ink measures 71% because the metric counts the vessel's SVG bounding box as solid; the drawn vessel occupies far less, and the vessel is the product.

## 6. Visual assets
| Asset | Purpose | Route | Source | Licence | Status |
| --- | --- | --- | --- | --- | --- |
| Revolved vessel | Shows profile, wall and foot changing by stage | 2D canvas projection + inline SVG fallback | Authored in code | Repository licence | Final |
| Stage marks | Number and name each stage | Inline SVG | Authored | Repository licence | Final |
| Maker mark | Wordmark from the rim | Inline SVG | Authored | Repository licence | Final |

No photography, no generated images, no 3D runtime. Alt: the vessel has a text title; stage marks are decorative.

## 7. Components
Primary action (`.action`): square-edged, manganese, 52px min height, arrow mark; square because a kiln-shelf edge is straight and the vessel carries all curvature. Stage buttons: outlined, 46px, `aria-pressed`. Range input: labeled, 44px. Links: underlined on hover, 44px targets in nav and footer. Focus: 3px oxide outline, 5px offset. States: default, hover, focus-visible, pressed (2px down), selected (`aria-pressed`), disabled (opacity .55 with `disabled`).

## 8. UX and information architecture
Flow: arrival (what this is, fictional disclosure) → the making (workbench + three beats) → a place to begin → footer disclosure. Navigation: two anchors. Outline: h1 → h2 "From a line…" (h3 ×3) → h2 "You don't need a perfect circle". Landmarks: header, nav, main, footer; skip link.

## 9. Responsive
Above 900px: absolute hero vessel, sticky workbench. 641–900px: narrower vessel, two-column process. ≤640px: vessel in flow, workbench in flow, manual stage buttons instead of scroll-driven stages, category label hidden. Short laptops (≤850px tall): shorter vessel view. ≤650px tall: workbench returns to normal flow.

## 10. Motion
| Moment | Trigger | What changes and why | Duration and easing | Interruption | Reduced motion |
| --- | --- | --- | --- | --- | --- |
| Stage change | Native scroll (desktop) or stage button | Vessel geometry/surface shows the stage's effect | Brief interpolation, then stops | New stage replaces old | Direct change, no interpolation |
| Turn | Range input | Rotates the vessel to inspect the wall | Immediate | User-driven | Unchanged (user-driven) |
No loops; rendering stops when the document is hidden.

## 11. Accessibility
WCAG 2.2 AA. Focus ring 3px, 6.87:1. Targets ≥44px for nav, actions, stage buttons, range and footer link (24px minimum met everywhere). Full process text is in the DOM without JavaScript; SVG fallback without canvas. Keyboard: all controls native.

## 12. Conversion
Primary action per view: hero "Follow the clay" (to the making); final "A place to begin". No urgency, no fabricated proof, no forms: there is nothing real to sell (F1). Success metric for a real studio would be first-visit enquiries; not measured here.

## 13. Stack and pipelines
Single static HTML file, no framework (offline example, F4). Alternative: Astro with the same CSS if the studio became real. 2D only; no image-generation, Blender or motion-graphics pipelines.

## 14. Machine-readable tokens
```json design-tokens
{
  "tokens": {
    "--pigment-shelf": "#e8eff1",
    "--pigment-kiln-wash": "#f4df83",
    "--pigment-manganese": "#442d3d",
    "--pigment-manganese-muted": "#63515e",
    "--pigment-chalk": "#fbfcf9",
    "--canvas": "var(--pigment-shelf)",
    "--ink": "var(--pigment-manganese)",
    "--ink-soft": "var(--pigment-manganese-muted)",
    "--stage": "var(--pigment-kiln-wash)",
    "--paper": "var(--pigment-chalk)",
    "--action": "var(--pigment-manganese)",
    "--action-text": "var(--pigment-chalk)",
    "--focus": "#87363e",
    "--line": "#887881",
    "--gutter": "clamp(1.125rem, calc(.25rem + 3.5vw), 4rem)",
    "--display": "clamp(3.1rem, calc(1.15rem + 7.8vw), 9.1rem)",
    "--heading": "clamp(2rem, calc(1.2rem + 3.2vw), 4.4rem)",
    "--title": "clamp(1.4rem, calc(1.1rem + 1.2vw), 2.2rem)",
    "--lead": "clamp(1.05rem, calc(.95rem + .5vw), 1.4rem)",
    "--body": "clamp(1rem, calc(.94rem + .25vw), 1.15rem)",
    "--small": ".875rem",
    "--space-xs": ".5rem",
    "--space-s": "1rem",
    "--space-m": "1.5rem",
    "--space-l": "2rem",
    "--space-xl": "3rem",
    "--space-2xl": "5rem"
  },
  "fonts": ["Hollow"],
  "noise_budget": { "fontSizes": 8, "textColors": 3, "radii": 1, "shadows": 1, "spacingValues": 12, "focalCandidates": 1 }
}
```

## 15. Review ledger
| Revision | Inner evidence | Human feedback | Decision | Changes made |
| --- | --- | --- | --- | --- |
| d3 | `evidence/sync-design.json`, `evidence/sync-site.json`, capture rounds at desktop/phone/320px opened | "Example looks good approved" (repository owner, 2026-11-03) | Approved | Moved to the 1.3 flow: type scale consolidated (13 → 8 sizes), spacing snapped (26 → 12 values), eyebrow treatment removed, footer link target 44px |
