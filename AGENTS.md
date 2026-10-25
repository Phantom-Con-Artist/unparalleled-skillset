# Unparalleled Agent Workspace Guidelines

This repository contains two independently installable design skills. Read the applicable complete skill before designing or changing generated work.

## Application UI

Use `.agents/skills/unparalleled-ui/SKILL.md` for software people work in: dashboards, tables, forms, settings, and component systems. Prioritize a product-specific direction, the real task, semantic tokens, complete interaction and data states, truthful data, keyboard navigation, readable density, and actual WCAG AA contrast. Read the shared craft foundation and premium workflow references for full new surfaces or overhauls.

## Public websites

Use `.agents/skills/unparalleled-website/SKILL.md` for public pages and product stories. Follow its eight phases: understand the subject and competitors, write `prospective-design.md`, align with the user with a skip option, derive an evidence-grounded vocabulary, aiming for 15–25 terms, establish the experience, author at least five live situational specimens with evidence-based fit scores, build the chosen direction, and obtain independent review. A sufficient brief supports end-to-end execution with decisive selection; user alignment and specimen voting are not mandatory pauses. Respect authorized scope for small changes.

## Authored experience

Both skills blend selected methods from Impeccable, Awwwards, and Taste into standalone guidance. They include a sourced interpretation of the nine supplied reference sites, distinguishing live observations from creator accounts and incomplete scene inspection. Use a direction contract to connect product truth, governing idea, visual grammar, authored assets, signature behavior, complete journey, and acceptance evidence. Premium means conviction and care across the actual product, not a stock luxury aesthetic. Prototype the decisive interaction early and carry the identity beyond the first screen.

## Shared craft contract

Generated interfaces and copy must avoid emoji decoration, visible bullet-point marketing inventories, stock icon tiles, buzzword filler, formulaic slogans, em-dash spam, generic sans-serif visual identities, stock palettes, and mainstream design genre recipes. Use meaningful bespoke SVG icons, distinctive readable type, honest human writing, and colors derived from the product. Semantic lists and established control meanings remain available for accessibility. Explicit user choices and existing brand requirements take precedence.

Card grids, kanban lanes, and pill-shaped buttons, badges, chips, and filters are banned by default, as are generic SaaS color (indigo buttons, purple-blue gradients, cyan or emerald "live" accents on slate) and neon aesthetics unless the user asks. Each skill's `references/generic-tells.md` dissects a real generic page. Read brief words with `references/brief-vocabulary.md`: "bespoke" and "handcrafted" mean precise product-specific craft, never handwriting fonts or sketch textures; "handmade", "handwritten", and "hand-drawn" ask for literal hand marks. A named 2D or 3D dimension is a constraint.

Do not prescribe glassmorphism, neumorphism, skeuomorphism, claymorphism or another named morphism, editorial/luxury spreads, Swiss posters, brutalism, bento-first SaaS, or Linear/Vercel clones. Grids, serif type, shadows, and perspective remain tools; invent their relationship from the product rather than selecting a genre.

For websites, blend 2D and 3D through meaningful interactivity, motion graphics, and scroll-driven storytelling in proportion to the brief. Preserve native scrolling, keyboard and touch use, reduced motion, and a complete static reading path. No compulsory grain, glow, tilt, particles, or heavy 3D engine.

Allow deliberate, discreet irregularity when it gives the work character. Keep facts, access, readable contrast, and controls correct. Make one focused craft pass and finish when the experience and checks hold together; do not chase endless cosmetic perfection.

## Visual review loop

Agents must see what they build. Each skill's `references/visual-review-loop.md` defines the loop: confirm a browser (a connected Playwright MCP tool, or `node scripts/capture.mjs`, which installs Playwright and Chromium into `~/.cache/unparalleled/playwright` with `--install`), capture desktop, short laptop, tablet, phone, and 320px views plus reduced motion, open every screenshot, fix one ranked batch at its source, recapture, and compare. The capture report flags measurable template tells; each flag is removed or justified in writing. Stop when a round finds nothing consequential.

## Validation

Run `npm run validate-all` for skill structure and local Markdown links. Run `npm run check-contrast` for reference fixtures only. Neither proves design quality or rendered accessibility. Validate actual measured pairs with each skill's `scripts/check-contrast.mjs --pairs <pairs.json>` and inspect the rendered work. Token generation requires project-specific `--input <tokens.json> --output <tokens.css>` and supplies no palette or font preset.
