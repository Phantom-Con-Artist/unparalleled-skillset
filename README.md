# Unparalleled Skillset

Two agent skills for designing interfaces with a visual language rooted in the product. The goal is useful, original work with a human point of view, with the conviction and detail of an independently art-directed product. A sufficient prompt supports research, direction, exploration where appropriate, decisive selection, implementation, and verification.

## Choose the skill

| Skill | Use it for | Core concerns |
| --- | --- | --- |
| [unparalleled-ui](.agents/skills/unparalleled-ui/SKILL.md) | Applications, dashboards, tables, forms, and settings | Task clarity, data density, complete states, semantic tokens, and keyboard access. |
| [unparalleled-website](.agents/skills/unparalleled-website/SKILL.md) | Public websites, portfolios, landing pages, and product stories | Product research, domain vocabulary, five original hypotheses, distinctive type, bespoke icons, human writing, and purposeful 2D/3D motion. |

## Craft direction

No emoji decoration, bullet-point marketing inventories, buzzword filler, formulaic slogans, em-dash spam, generic sans-serif visual identities, stock palettes, or mainstream design genre recipes. Agents must derive their choices from real product evidence and explain them. Semantic lists remain available for navigation and accessibility, and explicit user choices and established brand commitments take precedence.

The website skill avoids named morphisms, editorial/luxury spreads, Swiss poster formulas, brutalism, bento-first SaaS, and copied developer-tool aesthetics. It treats grids, serif type, shadows, and perspective as tools rather than styles to reproduce. The old archetype, hero, and bento reference filenames remain as guidance against presets, not catalogs.

Interactivity, motion graphics, scroll-driven stories, and 2D/3D relationships should reveal what a product does. Native scrolling and a complete static reading path remain essential. Agents can keep deliberate irregularity when it adds character, while keeping facts, controls, readability, and access reliable. Finishing well matters more than endless cosmetic correction.

## A shared foundation, two kinds of ambition

Both skills selectively blend Impeccable's purpose-aware product rigor, Awwwards' concept and creative-development discipline, and Taste's particular-subject inventory, content substance, competitor test, and rendered critique. They include their own guidance and require none of those skills to be installed. Their preset genres, default fonts/palettes, random catalog dealing, compulsory interviews, and universal effect or image quotas are not imported.

A compact direction contract connects the real product, governing idea, composition, type and material grammar, asset route, useful signature behavior, complete journey, and acceptance evidence. Website work can become a substantial immersive experience; application work expresses the same care through task-specific tools, truthful data, context-preserving interaction, and responsive feedback. Neither a decorative 3D hero nor a tidy empty dashboard is enough.

The [reference intentions](.agents/skills/unparalleled-website/references/reference-intentions.md) record the supplied Lando Norris, Messenger, Igloo, KPR, Noomo, Don't Board Me, Inside the Head, Active Theory, and In Pieces references with sources and inspection limits. They transfer creative intent without copying identities or treating incomplete scene loads as full audits.

For a full website direction, five live hypotheses inform a reasoned recommendation; the agent selects and builds unless the user requested a vote. A working application gets a task-appropriate surface brief and useful structural exploration, not a mandatory marketing tournament. Existing identity and narrow requested scope remain authoritative.

Rendered review covers the opening and whole experience, the complete task/action, phone and intermediate layouts, short laptop height, motion preference, input, and failure states. Scores require evidence; there is no automatic guarantee of awards or superiority over references.

## Installation

```bash
npx unparalleled install ui
npx unparalleled install website
npx unparalleled install all
```

The dependency-free installer detects supported agents from executable paths, configuration/application folders, project settings, and editor extensions. It installs complete skills in native discovery locations and preserves existing project instructions. Twelve integrations are supported: Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Devin, OpenCode, Cline, Roo Code, and Kiro.

```bash
npx unparalleled agents
npx unparalleled install website --global
npx unparalleled install ui --agent claude,codex
npx unparalleled install all --dry-run
```

No prompts are required. Explicit agent selection and `--all-agents` are available when detection is insufficient. Global installation configures user-level skill discovery across projects. Changed existing files are backed up, repeated installs are idempotent, and installing the second skill retains the first. No credentials, trust, or agent permissions are changed. See [installation details](docs/installation.md) for native paths, detection evidence, flags, recovery, and publication status.

These short public commands become available after the `unparalleled` package is published to npm. For local verification before publication, run `npm pack --pack-destination /tmp`, then `npx --yes --package=/tmp/unparalleled-1.0.0.tgz unparalleled install ui --project /tmp/example-project`.

```bash
npx unparalleled scaffold ui
npx unparalleled scaffold website
```

Both scaffolds copy self-contained Hollow examples. The website follows a piece through making; the working Studio Desk handles dispatch, packing states, search, filters, sorting, pagination, and undo with clearly fictional data. Examples are references, not presets to transplant into unrelated briefs.

## Website workflow

The eight phases cover subject and competitor research, a prospective direction, optional user alignment with a skip option, a 15–25 word vocabulary, the experience foundation, at least five live situational specimens, production, and independent review. The specimen viewer is intentionally empty until the agent authors product-specific directions. Fit scores include rationale and are design judgments, not conversion predictions.

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

The complete skills live in `.agents/skills/`, each with `SKILL.md`, `references/`, `workflows/`, `templates/`, and `scripts/`. `bin/cli.js` and `lib/` provide the dependency-free installer. Assistant instruction files route to the canonical skills. `examples/unparalleled-website-demo/` contains the current Hollow website example. `examples/unparalleled-ui-demo/` contains the paired Studio Desk. The redundant root showcase has been removed.
