# Design bans and their scope

These are defaults for generated websites and UI. Explicit user direction and existing brand requirements take precedence. Make any conflict visible in the design rationale. Do not evade a ban by renaming the same treatment.

| Banned pattern | Required decision |
| --- | --- |
| Emoji spam, emoji icons, decorative stars, checkmarks, rockets, sparkles, and Unicode pictograms | Draw a bespoke SVG mark where it communicates meaning; otherwise use plain text or no icon. |
| Visible bullet-point content, checkmark benefits, icon-led feature inventories, and three interchangeable cards | Shape information as connected prose, a meaningful comparison, a demonstration, or a product-driven sequence. Replacing every bullet with an icon is still a list in disguise. |
| Cards as the default unit: bordered, rounded, shadowed boxes in rows of three or four, bento cells, feature tiles | Present related information as a comparison, sequence, demonstration, annotated image, or structured prose. Frame a region only when it is a genuinely separate object. |
| Kanban aesthetics: side-by-side lanes of stacked cards, count badges, drag-handle dots, status columns as decoration | Use the content's own shape. Build a board only for a board product whose user wants one. |
| Pill shapes: fully rounded buttons, tags, badges, chips, filters, toggles, nav items, inputs | Choose corner geometry from the product and use it consistently. True circles (play button, avatar) and native controls are fine. |
| Hero kit: eyebrow, giant headline, grey paragraph, filled plus ghost button, floating widget or mockup, badge beside the logo | Let the product's own object, output, or behavior own the first frame. See [generic-tells.md](generic-tells.md). |
| Status theatre: pulsing dots, "READY" and version badges, fake latency, counters, terminal windows | Show real product output, or nothing. |
| Named morphisms and mainstream genre recipes | Invent from product operations, materials, people, and outcomes. Grids, shadows, serif type, and depth are tools, not banned primitives. |
| Editorial/luxury spreads, Swiss poster formulas, brutalist stickers, bento-first SaaS, stock minimalism, and Linear/Vercel clones | Establish an original spatial and narrative rule that can be explained without naming a design trend. |
| Centered slogan over a blurry gradient, abstract floating blobs, orbiting logos, random particles, and decorative 3D primitives | Make the first screen show what the product is; make movement explain a real relationship. |
| Stock icon libraries as a visual identity, tinted icon squares, and universal sparkle/bolt motifs | Use a coherent, product-derived icon grammar. Native OS controls and established brand marks keep their recognized meanings. |
| Inter, Geist, Roboto, Arial, Helvetica, system-ui, or generic neo-grotesque pairings as the authored visual identity | Research and specify distinctive type matched to the product. Robust system fallbacks remain appropriate while fonts load. |
| Generic SaaS color (indigo buttons, purple-blue gradients, cyan or emerald "live" accents, slate canvases) and neon aesthetics (glows, saturated accents on near-black) unless the user asks | Derive color from the subject; see [color-oklch-tokens.md](color-oklch-tokens.md). |
| Stock palettes, token-generator defaults, and mandatory one-neon-accent rules | Derive and document colors from actual subject evidence; test their roles in context. |
| Buzzwords, filler, generic slogans, repeated em dashes, and formulaic contrasts | Use concrete, humane sentences with a clear speaker, useful detail, and an honest next step. |
| Fabricated metrics, testimonials, customers, prices, urgency, or founder anecdotes | Use verified facts or clearly mark missing evidence in working artifacts; omit unsupported claims from production. |
| Scroll hijacking, hidden essential copy, pointer-only meaning, and mandatory WebGL | Keep a complete native-scroll reading path and accessible controls with static fallbacks. |
| Endless alignment tweaks, artificial symmetry, and motion added merely to impress | Preserve deliberate irregularities that add character; finish once the experience is clear, tested, and coherent. |

## Bullet scope

Do not render marketing or explanatory copy as bullet points, numbered-list substitutes, or repeated icon-and-sentence rows. Navigation, option groups, process semantics, and real tabular data may use semantic `ul`, `ol`, `li`, and table markup. Remove decorative markers where appropriate without removing useful semantics; retain list semantics explicitly if a target assistive technology needs them. Do not hide a necessary list of choices in a prose paragraph. The ban targets presentation and lazy information architecture, not accessible structure.

## Genre scope

A real product may be made of glass, paper, clay, or metal. Showing that product is legitimate. Turning every interface panel into frosted glass or embossed clay is a banned genre recipe. Similarly, a serif typeface is not automatically an editorial layout. Evaluate the complete composition rather than scanning for a single CSS property.

## Hand words

"Bespoke" and "handcrafted" ask for precise, product-specific craft. They never authorize handwriting fonts, sketch textures, or wobbly borders; those belong to briefs that say handmade, handwritten, or hand-drawn. See [brief-vocabulary.md](brief-vocabulary.md).

## Richness without the template

Do not answer these bans with an empty page, a tiny amount of content, or a conventional layout with its decorations removed. Build a specific focal composition, substantial useful content, authored assets, and a working product relationship. A decorative 3D hero followed by stock sections fails continuity. Read [craft-foundation.md](craft-foundation.md) to establish what takes the template's place.
