# Component intelligence

Components are where people actually touch the product. A professional defines each component's anatomy, geometry, states and behavior once, from the color, type and space decisions, and reuses it everywhere so the product behaves predictably.

## What the discipline decides

- **Inventory**: which components the product actually needs (from the task and content), not a full UI kit.
- **Anatomy**: the parts of each component (label, icon, helper text, value, container) and their spacing tokens.
- **Geometry**: corner radius, edge and silhouette per role, chosen from product, brand and control meaning. Pills, rounded, square, circular, cut and asymmetric forms are all valid when chosen for a reason.
- **States**: default, hover, focus-visible, active/pressed, selected, disabled, loading, error, success, empty, read-only. Momentary states (pressed) differ from persistent ones (selected).
- **Variants**: primary, secondary, quiet, destructive, chosen by task hierarchy.
- **Sizing and targets**: minimum hit areas, density variants.
- **Behavior**: keyboard model, pointer and touch behavior, what happens on slow or failed operations.
- **Tokens**: component aliases mapped to semantic tokens; no stray literals.

## Standards and data

| Source | What it settles |
| --- | --- |
| WAI-ARIA Authoring Practices Guide (APG) patterns | Keyboard and ARIA behavior for tabs, menus, dialogs, comboboxes, disclosures, etc. Prefer native HTML first. |
| WCAG 2.2 SC 2.5.8 Target Size (Minimum), AA | Targets at least 24×24 CSS px or spaced so a 24px circle does not overlap another target. |
| WCAG 2.2 SC 2.5.5 Target Size (Enhanced), AAA; Apple HIG | 44×44 pt/px for touch-first products. |
| WCAG 2.2 SC 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured (Minimum), 2.4.13 Focus Appearance (AAA) | A visible focus indicator that is not hidden by sticky UI; a ≥2px outline with 3:1 contrast is a reliable pattern. |
| WCAG 2.2 SC 3.3.1–3.3.3, 3.3.7, 1.3.5 | Error identification, labels or instructions, suggestions, redundant entry, input purpose (`autocomplete`). |
| GOV.UK Design System components and patterns | Thoroughly researched, accessible component behavior and form patterns. |
| Open UI | Cross-browser research on component anatomy and naming. |
| NN/g ten usability heuristics, web form design | Visibility of status, error prevention, recognition over recall. |

Links: [sources.md](sources.md#components).

## Allowed practice

- Native elements first (`button`, `a`, `input`, `select`, `dialog`, `details`), styled to the system.
- Geometry per role recorded in design.md (for example: actions square-edged to echo a printed ticket, tags fully rounded because they are removable tokens).
- Every interactive component with a designed focus-visible state (outline with `outline-offset`, 3:1 against adjacent colors).
- Visible labels connected with `for`/`id`; hints and errors linked with `aria-describedby`; `aria-invalid` on failure.
- Loading states that block duplicate submission and say what is happening; optimistic updates only with a real rollback.
- `aria-disabled` with an activation guard when a disabled control must stay discoverable; native `disabled` otherwise.
- Destructive actions visibly distinct, with confirmation or undo proportional to the consequence.
- Consistent variants: one primary action per region.

## Banned practice

- `div` or `span` click handlers imitating buttons or links.
- Removing focus outlines (`outline: none`) without an equal or better replacement.
- Placeholder text as the only label; labels that disappear on input.
- One geometry applied everywhere without a reason (every element a pill, or every element a sharp box as an anti-pill reflex).
- Card as the default container: bordered, rounded, shadowed boxes wrapping every block.
- Hover-only affordances or information; tooltips as the only place an instruction lives.
- Two equally weighted buttons (filled plus ghost) with no clear primary.
- Disabled appearance on a control that still activates, or `pointer-events: none` as the only disabling.
- Celebratory success states before the server confirms.
- Generic labels ("Submit", "Click here", "Learn more") where the action can be named.
- Targets smaller than 24×24 CSS px without sufficient spacing; icon-only buttons without accessible names.

## Record in design.md (Components section)

Component inventory; per component: anatomy, geometry and why, variants, a state table (state → visual treatment → token), keyboard model, target size, copy rules for labels and errors.

## Verify

1. Render a state sheet in design.html: every component in every state, in each theme.
2. Tab through every component: focus visible, order logical, Escape and arrow keys behave per APG.
3. `capture.mjs` flags standalone targets under 24×24 and reports `radii` and `shadows` counts against the geometry and elevation roles.
4. Trigger real errors, slow responses (throttled network) and failures; the component reports truthfully.
