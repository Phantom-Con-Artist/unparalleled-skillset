# Negative space intelligence

**This is the governing discipline.** Negative space (white space) is the deliberate absence of content: the room around and between elements. Used well, it reduces visual noise, groups related things, isolates the one thing that matters and makes reading effortless. Every other discipline adds something to the page; this one decides what the page can afford to carry.

The objective is **signal over noise**: every visible element must earn its place, and every gap must say something (these belong together; this is separate; look here).

## What the discipline decides

- **Macro space**: margins, section breaks, the room around the focal point and around the primary action.
- **Micro space**: line height, letter and word spacing, padding inside controls, the gap between a label and its field.
- **Active space**: space placed on purpose to direct attention or create grouping.
- **Passive space**: the incidental room that results from layout; check it is not uneven or accidental.
- **Noise budget**: how many distinct visual treatments (font sizes, colors, radii, shadows, borders, decorative elements) a view may use.
- **Removal**: what to take away. Professionals remove before they add.

## Principles

1. **Proximity before enclosure.** Group with space first. Add a rule, background or border only when space alone cannot separate (dense data, a genuinely separate object).
2. **One focal point per view.** Give the most important element the most room. Space around an element raises its importance more cheaply than size or color.
3. **Space follows hierarchy.** Larger gaps separate larger ideas. Inside a group, the gap is smaller than the gap to the next group.
4. **Every element pays rent.** For each element ask: what question does it answer, what action does it enable? If neither, remove it. Decoration earns its place only by expressing a recorded brand or product trait.
5. **Reduce treatments, not content.** Visual noise comes more from many different treatments (sizes, colors, borders, icons, badges) than from the amount of information. A dense table with one consistent treatment can be calmer than a sparse page with ten styles.
6. **Empty is not minimal.** Space must clarify attention or action. A sparse page with little useful content is not "clean"; it is unfinished.
7. **Density is a choice per surface.** A repeated-use tool needs compact layouts with consistent rhythm; a story page can afford wide breathing room. Both obey principles 1–5.

## Standards and data

| Source | What it settles |
| --- | --- |
| Gestalt proximity and common region (NN/g, Laws of UX) | Space groups; enclosure is a stronger, heavier signal used sparingly. |
| NN/g on signal-to-noise ratio, cognitive load and the aesthetic-usability effect | Every non-essential element competes with the essential ones; cleaner designs are perceived as more usable. |
| NN/g form design white space | Space between label, field and group affects completion and error rates. |
| A List Apart, "Whitespace" (Boulton) | Macro/micro white space and its effect on reading. |
| Tufte, data-ink and chartjunk | Maximize information per mark; remove non-data ink in charts and tables. |
| WCAG 2.2 SC 1.4.12 Text Spacing, 1.4.8 Visual Presentation (AAA) | Spacing that supports reading must survive user overrides. |

Links: [sources.md](sources.md#negative-space).

## Allowed practice

- Generous macro space around the hero object, the primary action and the key message.
- A proximity ratio of roughly 1.5–3× between inter-group and intra-group gaps.
- Removing borders, dividers, backgrounds and icons once space and alignment already separate the content.
- One accent color usage per region, reserved for the primary action or the most important state.
- Progressive disclosure: secondary detail behind a clear control rather than shown all at once.
- Compact density for tools, with consistent row rhythm, aligned columns and zebra or rules only when they aid scanning.
- Silence: a section with one sentence and one image, when the content warrants emphasis.

## Banned practice

- Filling space because it is empty: decorative blobs, floating particles, badge clusters, stock icons beside every sentence.
- Every element framed: card in a card, borders around every group, shadows on every container.
- Uniform gaps everywhere so grouping disappears, or random gaps so rhythm disappears.
- Huge empty space covering for missing content, or tiny text and targets shrunk to make a mockup "breathe".
- More than two focal points competing in the first view.
- Ornamental noise without meaning: eyebrow labels on every section, status dots, version badges, dividers between every block, repeated decorative icons.
- Treatment sprawl: rendered page with more than about 9 font sizes, 8 text colors, 4 corner radii or 3 shadow styles without named roles.
- Wall-of-text paragraphs without measure limits, or crowded forms where labels touch the previous field.
- Cramming the first viewport with every message, CTA and proof point.

## Noise budget (record in design.md)

Set budgets from the product before building, then measure. Starting points, adjusted with a reason:

| Measure (from `capture.mjs` `noise`) | Starting budget |
| --- | --- |
| Distinct font sizes | ≤ number of named type roles (typically 6–9) |
| Distinct text colors | ≤ number of named text roles (typically 4–8) |
| Distinct corner radii | ≤ 3–4 named geometry roles |
| Distinct box-shadows | ≤ 3 elevation levels |
| Distinct spacing values | close to the scale size (typically ≤ 12–16) |
| First-view focal candidates | 1 (2 with a reason) |
| First-view interactive elements | primary action unmistakable; few competing actions |
| First-view ink coverage | Website: often 25–50%. App UI: higher, but with clear grouping |

## Record in design.md (Negative space section)

Macro and micro space rules; proximity ratio; focal point per key view; the noise budget table; what was removed and why; density per surface.

## Verify

1. Run `node scripts/capture.mjs --url <page>` and compare every `noise` number with the budget. Each overrun is a finding or a recorded justification.
2. **Squint test**: view the screenshot blurred or at 25% size. The focal point and groups must be obvious; if everything looks equally grey, hierarchy has failed.
3. **Removal pass**: list every decorative element in the key view and the trait or task it serves. Remove the ones with no answer and recapture.
4. Compare the first viewport with the phone capture: the focal point and primary action must survive the narrow layout without crowding.
