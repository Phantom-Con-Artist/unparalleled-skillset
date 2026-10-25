# Unparalleled Agent Workspace Guidelines

This repository contains two independently installable design skills. Read the applicable complete skill before designing or changing generated work.

## Application UI

Use `.agents/skills/unparalleled-ui/SKILL.md` for software people work in: dashboards, tables, forms, settings, and component systems. Prioritize the real task, semantic tokens, complete interaction and data states, keyboard navigation, readable data density, and actual WCAG AA contrast.

## Public websites

Use `.agents/skills/unparalleled-website/SKILL.md` for public pages and product stories. Follow its eight phases: understand the subject and competitors, write `prospective-design.md`, align with the user with a skip option, derive a 15–25 word vocabulary, establish the experience, author at least five live situational specimens with evidence-based fit scores, build the chosen direction, and obtain independent review. Respect authorized scope for small changes.

## Shared craft contract

Generated interfaces and copy must avoid emoji decoration, visible bullet-point marketing inventories, stock icon tiles, buzzword filler, formulaic slogans, em-dash spam, generic sans-serif visual identities, stock palettes, and mainstream design genre recipes. Use meaningful bespoke SVG icons, distinctive readable type, honest human writing, and colors derived from the product. Semantic lists and established control meanings remain available for accessibility. Explicit user choices and existing brand requirements take precedence.

Do not prescribe glassmorphism, neumorphism, skeuomorphism, claymorphism or another named morphism, editorial/luxury spreads, Swiss posters, brutalism, bento-first SaaS, or Linear/Vercel clones. Grids, serif type, shadows, and perspective remain tools; invent their relationship from the product rather than selecting a genre.

For websites, blend 2D and 3D through meaningful interactivity, motion graphics, and scroll-driven storytelling in proportion to the brief. Preserve native scrolling, keyboard and touch use, reduced motion, and a complete static reading path. No compulsory grain, glow, tilt, particles, or heavy 3D engine.

Allow deliberate, discreet irregularity when it gives the work character. Keep facts, access, readable contrast, and controls correct. Make one focused craft pass and finish when the experience and checks hold together; do not chase endless cosmetic perfection.

## Validation

Run `npm run validate-all` for skill structure and local Markdown links. Run `npm run check-contrast` for reference fixtures only. Neither proves design quality or rendered accessibility. Validate actual measured pairs with each skill's `scripts/check-contrast.mjs --pairs <pairs.json>` and inspect the rendered work. Token generation requires project-specific `--input <tokens.json> --output <tokens.css>` and supplies no palette or font preset.
