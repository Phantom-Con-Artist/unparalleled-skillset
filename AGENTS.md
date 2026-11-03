# Unparalleled Agent Workspace Guidelines

This repository contains two independently installable design skills and the Color Intelligence Layer they use. Read the applicable complete skill before designing or changing generated work.

- **Application UI**: `.agents/skills/unparalleled-ui/SKILL.md` for software people work in (dashboards, tables, forms, settings, editors).
- **Public websites**: `.agents/skills/unparalleled-website/SKILL.md` for public pages, landing pages, portfolios and immersive product stories.

## The fixed flow

New surfaces and overhauls follow the same state machine in both skills, enforced by `scripts/check-contract.mjs` (schema `unparalleled-contract/3`):

1. **Intake**: a prompt architect subagent reads the bundled prompt-research guidelines, then the exact human request, and returns a high-performance prompt (`prompt-handoff.md`). Explicit choices are preserved.
2. **Product**: the main agent gathers product information into `product.md`, ending with a vocabulary of terms that each carry a design consequence.
3. **Design**: `design.md` in a fixed order (premise, brand personality, color, typography, spatial and layout, negative space, visual assets, components, UX/IA, responsive, motion, accessibility, conversion, stack) and `design.html`, its live rendering. Color runs through the Color Intelligence Layer. `--gate design`.
4. **Design review**: `check-design-sync.mjs` proves design.html implements design.md; a human approves or asks for changes. No means refine design.md, tokens and design.html. `--gate build`.
5. **Build** in progressive slices from the approved tokens.
6. **Verify**: Playwright/headless capture, `check-design-sync.mjs` on the built product, measured contrast, task runs. A mismatch means the build drifted; refine and recheck.
7. **Human review** of the working product, then delivery. `--gate deliver`.

Local fixes inherit product.md and design.md and check only what they touch. The diagram and review rules are in each skill's `references/design-collaboration.md`.

## Design intelligence

Each skill's `references/intelligence/` holds one file per professional discipline: brand personality, color, typography, spatial and layout, negative space, visual assets, components, UX and information architecture, responsive, motion, accessibility, conversion. Each gives the standards to fetch (WCAG 2.2, WAI-ARIA APG, CSS specifications, NN/g research, professional design systems), **Allowed practice**, **Banned practice**, what to record in design.md and how to verify it. `sources.md` lists the verified links.

Negative space is the governing discipline: every element must answer a question or enable an action, grouping comes from proximity before boxes, and each view has one focal point. `capture.mjs` measures treatment sprawl and first-view crowding against the noise budget in design.md.

Banned practice is the default; it appears only when the user explicitly asks or an existing brand commits to it, recorded in design.md. Accessibility floors cannot be waived by taste or approval. Component geometry is chosen per role from product, task and brand: pills, rounded forms and square edges are all valid.

## Color Intelligence Layer

`packages/color-intelligence` vendors the offline palette engine (Apache-2.0). `npm run color:setup` builds its Python runtime and registers the `color-intelligence` MCP server in `.mcp.json`; `npm run color:doctor` and `npm run test:color` check it. Certificates cover declared role pairs only; similarity scores are uncalibrated. Rendered pages still need measured pairs.

## Validation

- `npm run validate-all`: skill structure and local Markdown links.
- `npm run check-contrast`: reference fixtures only.
- `npm test`: contract checker, installer, tooling and Studio tests.
- `scripts/check-contract.mjs --gate design|build|deliver`: record completeness and currency.
- `scripts/check-design-sync.mjs --design design.md --url <page>`: a rendered page implements the written system.

None of these proves design quality, rendered accessibility or human approval. Open the screenshots, perform the task and quote the human.
