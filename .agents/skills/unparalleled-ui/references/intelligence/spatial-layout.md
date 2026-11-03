# Spatial and layout intelligence

Layout decides what is seen first, what belongs together and how the eye travels. A professional derives the grid and spacing system from the content and the type scale, then uses it consistently so that space itself carries meaning. Read [negative-space.md](negative-space.md) alongside this file: it sets the budget this system must respect.

## What the discipline decides

- **Spacing scale**: a base unit (commonly 4 or 8px) and a named set of steps, related to the type scale (for example the body line height as a rhythm unit).
- **Relational spacing**: distinct named tokens for inside a component, between related items, between groups, and between sections. The roles matter more than the numbers.
- **Grid**: column count, gutters and margins per breakpoint, chosen from content (a 12-column grid divides well but is not a law). Intrinsic layouts (CSS Grid `minmax`, `auto-fit`, subgrid, flex with `flex-basis`) where content should set the size.
- **Alignment**: shared edges and baselines; which elements break the grid on purpose.
- **Visual hierarchy**: the attention path through scale, weight, contrast, position and space. One primary focal point per view.
- **Density**: how much information per screen the task needs. App UI often needs more, a story page less.
- **Section rhythm** (**Website**): varied scale, density and alignment from section to section, driven by content.
- **Shell** (**App UI**): panes, rails, inspectors and toolbars chosen from the task (list-detail, canvas-inspector, single form), never a reflexive dashboard frame.

## Standards and data

| Source | What it settles |
| --- | --- |
| Gestalt principles (proximity, similarity, common region, continuity, closure) via NN/g and Laws of UX | Proximity groups more strongly than borders; common region (a box) is the heavier tool. |
| NN/g visual hierarchy and principles of visual design | Scale, contrast, balance and grouping as the means of hierarchy. |
| IBM Carbon spacing, Material 3 spacing, Apple HIG layout | Professional spacing scales (2/4/8 based) and layout margins. Learn the method, not their identity. |
| Utopia space calculator | Fluid space steps tied to the fluid type scale. |
| CSS Grid Level 2 and MDN Grid guide | Intrinsic tracks, alignment, subgrid. |
| *Every Layout* (Pickering and Bell) | Algorithmic, content-driven layout primitives (stack, cluster, sidebar, switcher). |
| NN/g F-pattern research | An observed scanning behavior on text-heavy pages, not a layout template. |

Links: [sources.md](sources.md#spatial-and-layout).

## Allowed practice

- A base-4 or base-8 scale with optical exceptions recorded (icons and glyph alignment may need 1–2px adjustments).
- The **proximity ratio**: space between groups clearly larger than space within a group, often 1.5–3×, so grouping reads without borders.
- Spacing that scales fluidly with the viewport for section-level gaps, and stays fixed for component internals.
- An asymmetric or broken grid where the content gives a reason (a long caption, a hero object that needs to bleed), with alignment maintained elsewhere.
- Full-bleed and contained regions alternated by content, not by pattern.
- Dense, compact layouts for repeated-use tools when rows still have clear separation and targets meet size rules.
- Logical CSS properties (`margin-inline`, `padding-block`) so layouts survive right-to-left languages.
- Container queries for components that live in several contexts.

## Banned practice

- One gap value used for every relationship, so nothing reads as grouped.
- Universal 80–120px padding on every section (identical section stacking).
- Borders, boxes or backgrounds used to create grouping that spacing should already create.
- Arbitrary spacing values outside the scale (a 13px here, a 27px there) with no recorded optical reason.
- Bento grids, three- or four-up feature card rows and kanban lanes as the default way to present information.
- Multiple competing focal points in one view: several elements at the same large size, weight and color.
- Centering everything (long centered paragraphs, centered forms in wide layouts).
- Layouts that only work at the designed width: fixed-pixel containers, absolute positioning for flow content.
- Visual order that contradicts DOM and focus order.
- Placing the call to action at an imagined Z or F endpoint instead of where the task path leads.

## Record in design.md (Spatial and layout section)

Base unit and scale table (token, value, role); proximity ratio; grid per breakpoint (columns, gutter, margin, max width); alignment rules and intentional breaks; hierarchy per key view (what is first, second, third); density target per surface; section or shell structure.

## Verify

1. `node scripts/capture.mjs` reports `spacingValues`; compare with the scale. Many off-scale values point to ad hoc styling.
2. Blur the screenshot (or view it very small): the groups and the single focal point should still be obvious.
3. Check DOM order against visual order with keyboard Tab and a screen reader's reading order.
4. Capture desktop, tablet, phone and 320px; no horizontal overflow (`capture.mjs` flags it).
