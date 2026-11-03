# Design: Hollow Studio Desk

Revision: d3 · Product record: product.md · Live system: design.html · Built screen: index.html
Status: approved d3. Repository owner, 2026-11-03: "Example looks good approved".

## 0. Premise
Governing truth: priority is due date crossed with packing readiness (F2). Relationship: the queue keeps that priority visible while the packing bench shows one piece and its protection, and the queue only changes after save. Swap test: a CRM has no packing state, rim or collection to protect. Counter-argument: a KPI dashboard summarizes faster. Answer: the job is to pack the next piece, not to read totals; totals live in the scope counts. Invalidated by: people needing cross-day planning more than the next piece.

## 1. Brand personality
Inherited from the website example: **patient, not slow** · **exact, not clinical**. For a working tool tone moves to matter-of-fact and brief ("Needs a hand", "Leave it ready for the next pair of hands"). Expression: same palette and font, compact scale, quiet controls, one warm color for the selection.

## 2. Color
Route: `cli` (Color Intelligence Layer `analyze` with declared usages; brand roles locked from the website example). Evidence: `color/analyze.json`.

| Role | Hex | Source | Reason |
| --- | --- | --- | --- |
| canvas | #E8EFF1 | shelf | Ground behind panels |
| panel | #FBFCF9 | chalk | Queue and bench surfaces |
| ink | #442D3D | manganese | Text, primary controls |
| muted | #695963 | manganese, lighter | Secondary text and sublines |
| accent | #F4DF83 | kiln label | Scope counts for "needs a hand" |
| selected | #F4ECD1 | kiln label, lighter | Selected row; paired with the bench, never alone |
| control-edge | #8A7984 | manganese, desaturated | Input and button boundaries |
| edge | #B5AEB0 | same | Decorative dividers (not meaningful boundaries) |
| hover | #EDF0EC | shelf, lighter | Row hover |
| error | #8A3738 | oxide | Failed save and validation |
| focus | #87363E | oxide | Focus ring |

Measured (WCAG 2.2 AA, engine output): ink on panel 12.08:1, muted on panel 6.35:1, ink on selected 10.52:1, error on panel 7.6:1, control edge 3.96:1 (non-text), focus 6.87:1 (non-text). All pass. APCA (supplementary, 14px): ink passes the engine's guidance; muted, selected and error pairs fall below its conservative body tier; recorded. Status always has a text label and a mark.

## 3. Typography
Family: Hollow (Bricolage Grotesque, SIL OFL, F5), shared with the website. Compact app scale:

| Role | Size | Use |
| --- | --- | --- |
| Page title (h1) | clamp(1.8rem, 1.25rem + 1.9vw, 3rem) | "Dispatch" |
| Record title | 1.5rem | Brand name, piece at the bench |
| Section | 1.125rem | Panel headings |
| Body / piece name | var(--body): 14 → 16px | Rows, piece name, inputs |
| Secondary | .875rem | Help text, details |
| Meta | .75rem (12px) | Column headers, sublines, counts |

Tabular numerals in the pieces column. Removed in d3: four near-duplicate sizes (.7–.9rem) and an 11.2px size; the piece name now leads its row at body size instead of inheriting the 12px header size.

## 4. Spatial and layout
4px-based scale (.25, .5, .75, 1, 1.25, 1.5, 2rem) plus fluid `--gap`. Shell from the task: masthead, scope toggles, filters, queue table, packing bench beside it (above 860px), modal bench on phones. No sidebar, no KPI cards. Proximity: cell padding 12–16px, group gaps 16–32px.

## 5. Negative space
Focal point: the "Dispatch" title, then the selected row and bench. Density is deliberate: the queue shows 8–10 rows above the fold on desktop. Budget (in design-tokens): font sizes 6, text colors 4, radii 2, shadows 1, spacing values 10, focal 1. Measured on index.html d3: 6 / 4 / 2 / 0 / 9 / 1. Justified exception: 10–15 interactive elements in the first view (each queue row is a button, plus search, scope toggles and filters); the primary action is the selected row's bench.

## 6. Visual assets
Vessel mark (SVG), packing-layer diagram (SVG, per state), box status mark (SVG). All authored; no photography or generated images.

## 7. Components
Scope buttons with counts (a labeled group of `aria-pressed` toggles); search with visible label and `/` shortcut; collection select; sort control; row buttons (44px); bench with packing-state select, save, undo and reset; pager. Geometry: 0–3px radii, square-edged like shelf labels; one drawer shadow on the phone bench only. Focus: 3px oxide outline. States: hover, focus-visible, selected, disabled (Clear when nothing to clear), saving, failed save with retry, empty view.

## 8. UX and information architecture
Primary flow: scope → find → select row → inspect bench → change packing → save → queue updates → undo available. Context kept: filters, page and selection survive saves; on phones the bench returns focus to the selected row. Empty state names what to change. Landmarks: header, main, the bench as an `aside`, footer.

## 9. Responsive
>1150px: table plus side bench. 861–1150px: narrower bench. ≤860px: stacked rows with key data, bench as a modal panel with focus containment and Escape. ≤550px: dedicated sort control. Short desktop (≤780px tall): bench in normal flow.

## 10. Motion
One transition: packing-diagram layer opacity, 160ms; removed under reduced motion. No loops, no entrance animations.

## 11. Accessibility
WCAG 2.2 AA. Semantic table with row headers and `aria-sort`; scope toggles with `aria-pressed`; `role="status"` for save results; targets 32–44px (≥24px minimum); modal focus containment and return; storage failure announced.

## 12. Conversion (task completion)
Success: a piece moves from "needs a hand" to packed with one save and can be undone. Friction removed: no confirmation dialog for reversible changes; undo instead.

## 13. Stack and pipelines
Single static HTML file with vanilla JavaScript (offline example). Alternative: Svelte for a real multi-user version with a server. 2D only.

## 14. Machine-readable tokens
```json design-tokens
{
  "tokens": {
    "--canvas": "#e8eff1",
    "--panel": "#fbfcf9",
    "--ink": "#442d3d",
    "--muted": "#695963",
    "--accent": "#f4df83",
    "--edge": "#b5aeb0",
    "--control-edge": "#8a7984",
    "--hover": "#edf0ec",
    "--selected": "#f4ecd1",
    "--error": "#8a3738",
    "--focus": "#87363e",
    "--gap": "clamp(1rem,calc(.5rem + 1.8vw),2rem)",
    "--body": "clamp(.875rem,calc(.82rem + .22vw),1rem)"
  },
  "fonts": ["Hollow"],
  "noise_budget": { "fontSizes": 6, "textColors": 4, "radii": 2, "shadows": 1, "spacingValues": 10, "focalCandidates": 1 }
}
```

## 15. Review ledger
| Revision | Inner evidence | Human feedback | Decision | Changes made |
| --- | --- | --- | --- | --- |
| d3 | `evidence/sync-design.json`, `evidence/sync-site.json`, captures at desktop/phone/320px opened | "Example looks good approved" (repository owner, 2026-11-03) | Approved | Moved to the 1.3 flow: type sizes 10 → 6, spacing values 20 → 9, piece name raised to body size |
