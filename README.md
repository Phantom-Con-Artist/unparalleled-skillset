# Unparalleled Skillset

Two agent skills for designing interfaces with a visual language rooted in the product. The goal is useful, original work with a human point of view, rather than another variation on a familiar template.

## Choose the skill

| Skill | Use it for | Core concerns |
| --- | --- | --- |
| [unparalleled-ui](.agents/skills/unparalleled-ui/SKILL.md) | Applications, dashboards, tables, forms, and settings | Task clarity, data density, complete states, semantic tokens, and keyboard access. |
| [unparalleled-website](.agents/skills/unparalleled-website/SKILL.md) | Public websites, portfolios, landing pages, and product stories | Product research, domain vocabulary, five original hypotheses, distinctive type, bespoke icons, human writing, and purposeful 2D/3D motion. |

## Craft direction

No emoji decoration, bullet-point marketing inventories, buzzword filler, formulaic slogans, em-dash spam, generic sans-serif visual identities, stock palettes, or mainstream design genre recipes. Agents must derive their choices from real product evidence and explain them. Semantic lists remain available for navigation and accessibility, and explicit user choices and established brand commitments take precedence.

The website skill avoids named morphisms, editorial/luxury spreads, Swiss poster formulas, brutalism, bento-first SaaS, and copied developer-tool aesthetics. It treats grids, serif type, shadows, and perspective as tools rather than styles to reproduce. The old archetype, hero, and bento reference filenames remain as guidance against presets, not catalogs.

Interactivity, motion graphics, scroll-driven stories, and 2D/3D relationships should reveal what a product does. Native scrolling and a complete static reading path remain essential. Agents can keep deliberate irregularity when it adds character, while keeping facts, controls, readability, and access reliable. Finishing well matters more than endless cosmetic correction.

## Installation

```bash
npx unparalleled-skillset
npx unparalleled-skillset --all --local
npx unparalleled-ui --global
npx unparalleled-website --dest ./my-project/.agents/skills
```

The CLI installs the chosen skill folders and routes supported assistants to their full instructions. Local integration uses managed instruction blocks to preserve surrounding project guidance. Global installation uses `~/.gemini/config/skills/`; a custom destination can be supplied with `--dest`.

```bash
npx unparalleled-skillset --scaffold website
npx unparalleled-skillset --scaffold ui
```

The scaffold commands copy legacy demonstration pages. They are implementation examples, not approved specimen directions or compliance evidence for the current skill contract.

## Website workflow

The eight phases cover subject and competitor research, a prospective direction, user alignment with a skip option, a 15–25 word vocabulary, the experience foundation, at least five live situational specimens, production, and independent review. The specimen viewer is intentionally empty until the agent authors product-specific directions. Fit scores include rationale and are design judgments, not conversion predictions.

Supporting references cover humane writing, bespoke SVG icons, distinctive typography, palette bans, spatial blending, motion engineering, intentional imperfection, and a finite review gate. Read only what the task needs.

## Validation and token tools

```bash
npm run validate-all
npm run check-contrast
```

Skill validation checks structure and local Markdown links. Contrast checks without arguments run reference fixtures only. Neither command certifies a generated website or UI.

```bash
node .agents/skills/unparalleled-website/scripts/check-contrast.mjs --pairs ./pairs.json
node .agents/skills/unparalleled-website/scripts/generate-tokens.mjs --input ./tokens.json --output ./tokens.css
```

A contrast input is an array of objects with `name`, opaque sRGB hex `fg` and `bg`, and `req` set to 4.5 for ordinary text, 3 for qualifying large text or meaningful UI graphics, or 7 for an intentional higher threshold. Measure composited colors and usage in the browser. Token input is a nonempty JSON object mapping CSS custom property names to project-specific CSS values. There is no default palette or font pairing. Each skill ships its own standalone tools.

## Repository

The complete skills live in `.agents/skills/`, each with `SKILL.md`, `references/`, `workflows/`, `templates/`, and `scripts/`. `bin/cli.js` provides the dependency-free installer. Assistant instruction files route to the canonical skills. `examples/` and `unparalleled-website/` contain legacy demonstration pages.
