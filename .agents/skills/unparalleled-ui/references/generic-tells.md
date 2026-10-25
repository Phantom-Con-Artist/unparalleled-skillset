# What a generic page looks like

A generated page can be tidy, accessible, and on-brief while still looking like every other generated page. This file describes that look precisely so you can recognize it in your own screenshots. Explicit user direction overrides any item here; when it does, record the instruction in the direction contract.

## Anatomy of a real example

A landing page for an AI model, produced from a one-line prompt. Nothing on it is broken. Everything on it is a default.

| What is on screen | Why it reads as generic |
| --- | --- |
| Blue-grey near-black canvas, indigo primary button, cyan "live" accents, one green status line | The stock dark developer-tool palette. It says "software" and nothing about this software. |
| Logo, product name, then a bordered version badge in monospace beside it | Badge-next-to-wordmark is a template slot. The version number carries no meaning for a first-time visitor. |
| Four text links on the right of a thin top bar | The default navigation shape, unexamined. |
| Tiny tracked uppercase monospace label with a glowing dot, above the headline | The eyebrow-with-status-dot. It repeats above every section ("PRODUCT TRUTH & MECHANICS"), which turns it into furniture. |
| Five-line bold sans headline in first person, built on "I do not X. I do Y." | A formulaic contrast. Large weight stands in for an idea. |
| Grey paragraph of capability claims, then a filled button and a ghost button side by side | The universal hero kit. Two actions of equal shape, neither clearly first. |
| Text left, a rounded bordered panel right, holding a chart of dots on a curve, a slider, and numbers like "2,048,000 KV-CACHE READY" and "38ms" | Fake telemetry in a floating widget. The numbers are decoration; the slider changes nothing a visitor cares about. |
| A centered column of about 1150px, the same padding on every section, a hairline divider between them | Every section is the same container, so the page has no rhythm. |
| Second section opens with another eyebrow and another bold two-line heading | The same move again. The page is now a stack of identical units. |

Notice what is missing: the product itself doing something a visitor can recognize, a single specific idea about this product, and any sign that a person made a decision.

## Banned by default

These are banned unless the user asks for them or the product is literally made of them.

**Cards as the unit of design.** Bordered, rounded, shadowed rectangles holding a heading and a sentence, repeated in rows of three or four, or arranged as a bento grid. A card is a container, not an idea. Present related information as a comparison, a sequence, a working demonstration, annotated imagery, or prose with real structure. A data surface may frame a genuinely separate object (one record's detail beside a list), but framing must be the exception that marks a boundary, not the default wrapper for every block.

**Kanban aesthetics.** Side-by-side columns of stacked cards, column headers with count badges, drag-handle dots, status lanes used as decoration. If the product is a board tool and the user wants a board, build a board well; otherwise never use columns of cards to present features, steps, or pricing.

**Pill shapes.** Fully rounded ends on buttons, tags, badges, chips, filters, toggles, nav items, and input fields. Choose corner geometry from the product: square, a small radius tied to a material, a cut corner, a drawn edge, an asymmetric shape. Truly circular controls (a round play button, an avatar) are circles, not pills, and remain fine. A native control keeps its platform shape.

**Generic SaaS color.** Indigo or violet primary buttons, purple-to-blue gradients, cyan or teal "live" accents, emerald success glows, slate-900 canvases, Tailwind default scales used unchanged, and pastel washes behind feature icons.

**Neon aesthetics.** Glowing text, saturated accents on near-black, outer-glow shadows, neon gradients on borders, synthwave grids, cyber-HUD overlays. Only when the user asks for neon, or the product is literally about light signage.

**Hero kit.** Eyebrow plus giant headline plus grey paragraph plus filled and ghost button, beside a floating mockup or widget. Badge in the nav. Logo strip of "trusted by". A three-up feature row under it.

**Status theatre.** Pulsing dots, "READY", "ONLINE", "v3.8", counters, fake latency, terminal windows, and code snippets added to signal "technical" when the visitor is not monitoring anything.

**Eyebrow labels everywhere.** One small label can orient a reader. A tiny tracked uppercase label above every heading is a template rhythm.

**Uniform section stacking.** The same max-width column, padding, and heading pattern for every section. Vary scale, density, and alignment for a reason the content gives you.

## What to do instead

Start from what the product actually does and let it own the first frame: the object, the output, the before and after, the place, the person using it. Let structure come from the content's own shape. A process is a path; a comparison is a set of things side by side with the same measures; a material has a surface and an edge. Pick corner, border, and color decisions from that evidence and use them consistently. Read [craft-foundation.md](craft-foundation.md) for the direction contract and [ui-tokens.md](ui-tokens.md) for color and shape tokens.

## Checking for it

`node scripts/capture.mjs` flags most of these in the rendered DOM: pill shapes, card groups, kanban columns, eyebrow labels, status dots, stock SaaS hue families, dark-slate-plus-neon palettes, default typefaces, emoji, and em-dash density. See [visual-review-loop.md](visual-review-loop.md). The script cannot judge a hero kit or uniform section rhythm; look for those in the screenshots yourself.
