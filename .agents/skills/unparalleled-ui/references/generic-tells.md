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

## Where each tell is banned

| Tell in the anatomy above | Banned in |
| --- | --- |
| Stock dark developer palette, indigo button, cyan/emerald accents, neon | [color.md](intelligence/color.md) |
| Version badge, status dot, fake telemetry widget | [anti-slop-invariants.md](anti-slop-invariants.md) (status theatre, fabricated content) |
| Eyebrow label above every heading, five-line bold headline as hierarchy | [typography.md](intelligence/typography.md) |
| Hero kit, two equal buttons | [anti-slop-invariants.md](anti-slop-invariants.md), [components.md](intelligence/components.md), [conversion.md](intelligence/conversion.md) |
| Same column, padding and divider on every section | [spatial-layout.md](intelligence/spatial-layout.md), [negative-space.md](intelligence/negative-space.md) |
| Cards, bento, kanban lanes as default containers | [anti-slop-invariants.md](anti-slop-invariants.md) |

## What to do instead

Start from what the product actually does and let it own the first frame: the object, the output, the before and after, the place, the person using it. Let structure come from the content's own shape. A process is a path; a comparison is a set of things side by side with the same measures; a material has a surface and an edge. Pick corner, border, and color decisions from that evidence and use them consistently. Read [craft-foundation.md](craft-foundation.md) for the direction contract.

## Checking for it

`node scripts/capture.mjs` flags most of these in the rendered DOM: pill shapes, card groups, kanban columns, eyebrow labels, status dots, stock SaaS hue families, dark-slate-plus-neon palettes, default typefaces, emoji, and em-dash density. See [visual-review-loop.md](visual-review-loop.md). The script cannot judge a hero kit or uniform section rhythm; look for those in the screenshots yourself.

The `noise` block of the same report measures treatment sprawl (font sizes, text colors, radii, shadows, spacing values) and first-view crowding against the negative-space budget in design.md.
