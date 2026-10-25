# Design bans and their scope

These are defaults for generated websites and UI. Explicit user direction and existing brand requirements take precedence. Make any conflict visible in the design rationale. Do not evade a ban by renaming the same treatment.

| Banned pattern | Required decision |
| --- | --- |
| Emoji spam, emoji icons, decorative stars, checkmarks, rockets, sparkles, and Unicode pictograms | Draw a bespoke SVG mark where it communicates meaning; otherwise use plain text or no icon. |
| Visible bullet-point content, checkmark benefits, icon-led feature inventories, and three interchangeable cards | Shape information as connected prose, a meaningful comparison, a demonstration, or a product-driven sequence. Replacing every bullet with an icon is still a list in disguise. |
| Named morphisms and mainstream genre recipes | Invent from product operations, materials, people, and outcomes. Grids, shadows, serif type, and depth are tools, not banned primitives. |
| Editorial/luxury spreads, Swiss poster formulas, brutalist stickers, bento-first SaaS, stock minimalism, and Linear/Vercel clones | Establish an original spatial and narrative rule that can be explained without naming a design trend. |
| Centered slogan over a blurry gradient, abstract floating blobs, orbiting logos, random particles, and decorative 3D primitives | Make the first screen show what the product is; make movement explain a real relationship. |
| Stock icon libraries as a visual identity, tinted icon squares, and universal sparkle/bolt motifs | Use a coherent, product-derived icon grammar. Native OS controls and established brand marks keep their recognized meanings. |
| Inter, Geist, Roboto, Arial, Helvetica, system-ui, or generic neo-grotesque pairings as the authored visual identity | Research and specify distinctive type matched to the product. Robust system fallbacks remain appropriate while fonts load. |
| Stock palettes, token-generator defaults, and mandatory one-neon-accent rules | Derive and document colors from actual subject evidence; test their roles in context. |
| Buzzwords, filler, generic slogans, repeated em dashes, and formulaic contrasts | Use concrete, humane sentences with a clear speaker, useful detail, and an honest next step. |
| Fabricated metrics, testimonials, customers, prices, urgency, or founder anecdotes | Use verified facts or clearly mark missing evidence in working artifacts; omit unsupported claims from production. |
| Scroll hijacking, hidden essential copy, pointer-only meaning, and mandatory WebGL | Keep a complete native-scroll reading path and accessible controls with static fallbacks. |
| Endless alignment tweaks, artificial symmetry, and motion added merely to impress | Preserve deliberate irregularities that add character; finish once the experience is clear, tested, and coherent. |

## Bullet scope

Do not render marketing or explanatory copy as bullet points, numbered-list substitutes, or repeated icon-and-sentence rows. Navigation, option groups, process semantics, and real tabular data may use semantic `ul`, `ol`, `li`, and table markup. Remove decorative markers where appropriate without removing useful semantics; retain list semantics explicitly if a target assistive technology needs them. Do not hide a necessary list of choices in a prose paragraph. The ban targets presentation and lazy information architecture, not accessible structure.

## Genre scope

A real product may be made of glass, paper, clay, or metal. Showing that product is legitimate. Turning every interface panel into frosted glass or embossed clay is a banned genre recipe. Similarly, a serif typeface is not automatically an editorial layout. Evaluate the complete composition rather than scanning for a single CSS property.
