# Design bans and their scope

These are the cross-cutting composition and truth bans for generated websites and UI. Discipline-specific bans (palette, type, spacing, negative space, assets, components, IA, responsive, motion, accessibility, conversion) live in the **Banned practice** section of each [intelligence file](intelligence/README.md) and are not repeated here. Read this file and the intelligence index before proposing a direction and again before review.

Explicit user direction and existing brand requirements take precedence over aesthetic bans. Record the instruction in design.md next to the decision. Do not evade a ban by renaming the same treatment, using a synonym, swapping in a fashionable replacement font or hex value, or substituting a square container for a generic rounded card.

## Composition and truth bans

| Banned pattern | Required decision |
| --- | --- |
| Emoji spam, emoji icons, decorative stars, checkmarks, rockets, sparkles and Unicode pictograms | Draw a bespoke SVG mark where it communicates meaning; otherwise use plain text or no icon. |
| Visible bullet-point marketing content, checkmark benefit lists, icon-led feature inventories, three interchangeable cards | Shape information as connected prose, a meaningful comparison, a demonstration or a product-driven sequence. Replacing every bullet with an icon is still a list in disguise. |
| Cards as the default unit: bordered, rounded, shadowed boxes in rows of three or four, bento cells, feature tiles | Present related information as a comparison, sequence, demonstration, annotated image or structured prose. Frame a region only when it is a genuinely separate object. |
| Kanban aesthetics: lanes of stacked cards, count badges, drag-handle dots, status columns as decoration | Use the content's own shape. Build a board only for a board product whose user wants one. |
| Hero kit: eyebrow, giant headline, grey paragraph, filled plus ghost button, floating widget or mockup, badge beside the logo | Let the product's own object, output or behavior own the first frame. See [generic-tells.md](generic-tells.md). |
| Status theatre: pulsing dots, "READY" and version badges, fake latency, counters, terminal windows | Show real product output, or nothing. |
| Named morphisms and mainstream genre recipes: glass/clay/neumorphism on all chrome, editorial/luxury spreads, Swiss poster formulas, brutalist stickers, bento-first SaaS, Linear/Vercel clones | Establish an original spatial and narrative rule that can be explained without naming a design trend. Grids, shadows, serif type and depth remain tools. |
| Centered slogan over a blurry gradient, abstract floating blobs, orbiting logos, random particles, decorative 3D primitives | Make the first screen show what the product is; make movement explain a real relationship. |
| Buzzwords, filler, generic slogans, repeated em dashes, formulaic "Not X. Y." contrasts | Concrete, humane sentences with a clear speaker, useful detail and an honest next step ([human-writing.md](human-writing.md)). |
| Fabricated metrics, testimonials, customers, logos, prices, urgency or founder anecdotes | Verified facts from product.md, or clearly marked gaps in working artifacts; omit unsupported claims from production. |
| Scroll hijacking, hidden essential copy, pointer-only meaning, mandatory WebGL | A complete native-scroll reading path and accessible controls with static fallbacks. |
| Endless alignment tweaks, artificial symmetry, motion added merely to impress | Preserve deliberate irregularities that add character; finish once the experience is clear, tested and coherent. |

## Scope notes

**Bullets.** The ban targets presentation of marketing and explanatory copy, not structure. Navigation, option groups, process semantics and real tabular data keep semantic `ul`, `ol`, `li` and `table` markup. Do not hide a necessary list of choices in a paragraph.

**Genre.** A real product may be made of glass, paper, clay or metal; showing it is legitimate. Turning every panel into frosted glass is the banned recipe. A serif typeface is not automatically an editorial layout. Judge the complete composition, not one CSS property.

**Geometry.** No shape is banned in isolation. Pills, rounded forms, circles and square edges are chosen per role from product, brand and control meaning ([components.md](intelligence/components.md)). Repetition without a reason is a tell at any radius; never replace every pill with a square as an automatic repair.

**Hand words.** "Bespoke" and "handcrafted" ask for precise, product-specific craft. They never authorize handwriting fonts, sketch textures or wobbly borders; those belong to briefs that say handmade, handwritten or hand-drawn ([brief-vocabulary.md](brief-vocabulary.md)).

## Richness without the template

Do not answer these bans with an empty page, a tiny amount of content or a conventional layout with its decorations removed. Negative space must clarify attention or action ([negative-space.md](intelligence/negative-space.md)); it is not a substitute for substance. Build a specific focal composition, substantial useful content, authored assets and a working product relationship. A decorative 3D hero followed by stock sections fails continuity. [craft-foundation.md](craft-foundation.md) establishes what takes the template's place.

## Evidence, exceptions and enforcement

For each major choice record **source → product relationship → implementation rule → inspected evidence** in design.md. "Modern", "premium", "minimal", a palette name or a trend reference does not supply the relationship. Run the competitor-swap test on content, composition and behavior; replacing the logo should break the premise.

Functional conventions, a consistent spacing scale and load-time font fallbacks are not violations. An automated heuristic false positive needs a concrete explanation and the relevant screenshot. Do not grant yourself broad exceptions because a design is tidy.

An unsupported generic direction is a major finding even when every control works. Fabricated content, inaccessible essential paths and explicit user-ban violations are blockers. User approval locks the selected direction; it does not certify accessibility or make invented claims true. Remove the pattern at its source, then recapture.
