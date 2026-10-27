# Unparalleled Skillset

Two agent skills for designing interfaces with a visual language rooted in the product. The goal is useful, original work with a human point of view, with the conviction and detail of an independently art-directed product. A sufficient prompt starts research, a product-specific recommendation and a concrete specimen. New directions are reviewed and revised with the user before full development, unless that review was explicitly waived.

## Quick start

Until the package is published on npm, run the commands through GitHub. Replace `npx unparalleled` with `npx github:Phantom-Con-Artist/unparalleled-skillset` in every line below.

```bash
npx unparalleled setup              # install both skills for the agents on this machine, then show what else is ready
npx unparalleled doctor             # any time: what is ready, and the exact fix for what is not
npx unparalleled hook --write       # optional, Claude Code: add a structured brief to every design prompt
npx unparalleled studio --demo      # optional: try the in-page Studio on a practice page
npx unparalleled update             # later: refresh the installed skills to the newest version
```

Start a new agent session after `setup` or `update`. `setup` changes only the skill folders, a short routing note and its own state file; it never edits agent permissions or settings. `hook --write` is the only command that edits an agent setting, and only the project's `.claude/settings.json`, only when you ask. See [docs/installation.md](docs/installation.md) for the details.

## Choose the skill

This repository is the monorepo for the installable Unparalleled design skills and the first working Unparalleled Studio implementation. Studio adds an inspector to your running page and connects targeted change requests to your existing IDE agent. The skills remain available independently.

| Skill | Use it for | Core concerns |
| --- | --- | --- |
| [unparalleled-ui](.agents/skills/unparalleled-ui/SKILL.md) | Applications, dashboards, tables, forms, and settings | Task clarity, data density, complete states, semantic tokens, and keyboard access. |
| [unparalleled-website](.agents/skills/unparalleled-website/SKILL.md) | Public websites, portfolios, landing pages, and product stories | Experimental product-specific direction, domain vocabulary, one iterative specimen, distinctive type, authored assets and purposeful 2D/3D motion. |

## Unparalleled Studio: first working slice

Studio works on the page you are building. It has a small tool strip and a compact composer beside the selected element, pointer/parent/selector picking, computed-style inspection, page-wide steering, a durable request queue, source-change review and guarded undo. Your existing coding agent reads the target and instruction through local tools; Studio does not run a model or require another desktop editor.

Run the included fictional practice page:

```bash
npm run studio:demo
# Open http://127.0.0.1:4310 and use Pick or Page.
```

Serve a static project with Studio attached:

```bash
npm run studio -- --root /absolute/path/to/site --port 4310
```

The engine prints the page URL and an ignored connection-file location. Keep it running while your IDE agent works. From this repository, the agent can use:

```bash
npm run studio:agent -- --project /absolute/path/to/site context
npm run studio:agent -- --project /absolute/path/to/site next --wait 25000
npm run studio:agent -- --project /absolute/path/to/site inspect --selector '#heading'
npm run studio:agent -- --project /absolute/path/to/site read --file index.html
npm run studio:agent -- --project /absolute/path/to/site patch --input /tmp/studio-patch.json
```

`context` returns the complete website skill by default; start the server with `--skill ui` for application work. `context --reference framework-selection` reads a supporting reference. `next` returns one request with its `id` and exclusive `leaseToken`. `read` returns actual source and its hash. A patch file contains:

```json
{
  "id": "request-id-from-next",
  "leaseToken": "lease-token-from-next",
  "file": "index.html",
  "expectedHash": "hash-from-read",
  "summary": "Made the heading more specific.",
  "edits": [{ "search": "The exact existing heading", "replace": "The revised heading" }]
}
```

Every search must match exactly once and the file hash must still match. One source file is supported per request in this slice. To create a new component/file, use `create: true`, `expectedHash: null` and `content` instead of `edits`. Creation refuses existing files and paths outside visible project source; undo removes the created file only when it still matches the recorded version. Static pages reload after a patch; the user can Keep or Undo from Activity. Undo refuses to overwrite a newer developer edit. Use `renew --id <id> --lease <token>` during work longer than five minutes, or `reply --input <json>` with `id`, `leaseToken`, `status` (`review` or `failed`) and a useful `message` when no automated patch is appropriate. A reply is not proof of a source edit or verification.

The browser has a separate, restricted capability: it can submit and review requests but cannot call source-edit tools. Engine state, credentials and history stay in the project's ignored `.unparalleled/studio/` directory. Requests survive page reloads and engine restarts. The UI says an agent is listening only while an agent actually has an outstanding wait; a running helper does not automatically wake an ended IDE conversation.

For a Vite application, add the development-only adapter to `vite.config.js`/`vite.config.ts`. After installing this package as a development dependency, use its public export; in this checkout you can also import the adapter by absolute path:

```js
import { unparalleledStudio } from 'unparalleled/studio/vite';

export default {
  plugins: [unparalleledStudio()],
  server: { host: '127.0.0.1' }
};
```

The adapter serves the overlay through Vite, preserves production builds and blocks its credential directory. This first adapter requires local HTTP with Vite owning its server. Add it alongside existing plugins. Static serving does not compile React/Next/Nuxt; do not use it as a replacement for their development server.

`capture --out /tmp/page.png` uses an available Playwright installation and returns a labeled **separate rendering**, not a screenshot of the user's exact tab. Use an existing IDE/browser tool when same-tab state matters. Runtime source mapping is currently a source hint plus explicit source inspection; selectors do not identify framework components reliably. Dedicated IDE wakeup, MCP transport, multi-file transactions, automatic component instrumentation, visual variant generation, cross-frame inspection and 3D object picking are not implemented yet.

Reference mode supports **inspire**, **recreate**, and **redesign**. Use Reference in the on-page toolbar to attach a URL, or let the agent capture a rendered element/page:

```bash
npm run studio:agent -- --project /absolute/path/to/site reference --url https://example.com --selector 'main' --intent redesign --instruction 'Use this composition for our product, with our content.'
```

For direct picking in your existing browser, load `packages/studio-browser-extension/` as an unpacked Chromium extension. Run `npm run studio:agent -- --project /absolute/path/to/site pair`, then paste the printed Studio URL and reference pairing key into the extension's Local project connection. Click the extension on an ordinary webpage, choose Pick an element or Use whole page, and send your instruction. The companion supports parent selection and submits rendered context plus a visible-tab image when Chrome grants capture access. If image capture is unavailable, the reference is retained with an explicit warning. The pairing key can only submit references and persists with the project; it does not grant source-edit access. Engine port changes require updating the URL.

Remote selections are recorded as reference material for the local project. Their HTML/text is untrusted evidence, not agent instructions or editable remote source. Browser-internal/protected pages, cross-origin frame internals and WebGL object identities are outside this first picker's scope. The companion is a development extension, not a published browser-store release.

The workspace packages are `studio-engine`, `studio-overlay`, `studio-protocol`, `studio-adapters`, `studio-agent-tools` and `studio-browser-extension` under `packages/`. Run `npm run test:studio` for their tests. Studio's runtime has no third-party dependencies; browser integration tests reuse the existing optional Playwright/Vite tooling. New design/research documentation stays local under the ignored `/docs/` directory.

## Craft direction

No emoji decoration, bullet-point marketing inventories, buzzword filler, formulaic slogans, em-dash spam, generic sans-serif visual identities, stock palettes, or mainstream design genre recipes. Agents must derive their choices from real product evidence and explain them. Semantic lists remain available for navigation and accessibility, and explicit user choices and established brand commitments take precedence.

Card grids, kanban lanes, and pill-shaped controls are banned by default in both skills, along with generic SaaS color (indigo buttons, purple-blue gradients, cyan or emerald accents on slate) and neon aesthetics unless the user asks for them. A [dissection of a real generic page](.agents/skills/unparalleled-website/references/generic-tells.md) shows what these look like together.

Brief words are read precisely. "Bespoke" and "handcrafted" ask for exact, product-specific craft; "handmade", "handwritten", and "hand-drawn" ask for literal marks of a hand. A user who names 2D, 3D, or both sets a constraint the agent keeps. See [brief vocabulary](.agents/skills/unparalleled-website/references/brief-vocabulary.md).

The website skill avoids named morphisms, editorial/luxury spreads, Swiss poster formulas, brutalism, bento-first SaaS, and copied developer-tool aesthetics. It treats grids, serif type, shadows, and perspective as tools rather than styles to reproduce. The old archetype, hero, and bento reference filenames remain as guidance against presets, not catalogs.

Interactivity, motion graphics, scroll-driven stories, and 2D/3D relationships should reveal what a product does. Native scrolling and a complete static reading path remain essential. Agents can keep deliberate irregularity when it adds character, while keeping facts, controls, readability, and access reliable. Finishing well matters more than endless cosmetic correction.

## A shared foundation, two kinds of ambition

Both skills selectively blend Impeccable's purpose-aware product rigor, Awwwards' concept and creative-development discipline, and Taste's particular-subject inventory, content substance, competitor test, and rendered critique. They include their own guidance and require none of those skills to be installed. Their preset genres, default fonts/palettes, random catalog dealing, compulsory interviews, and universal effect or image quotas are not imported.

A compact direction contract connects the real product, governing idea, composition, type and material grammar, asset route, useful signature behavior, complete journey, and acceptance evidence. Website work can become a substantial immersive experience; application work expresses the same care through task-specific tools, truthful data, context-preserving interaction, and responsive feedback. Neither a decorative 3D hero nor a tidy empty dashboard is enough.

The [reference intentions](.agents/skills/unparalleled-website/references/reference-intentions.md) record the supplied Lando Norris, Messenger, Igloo, KPR, Noomo, Don't Board Me, Inside the Head, Active Theory, and In Pieces references with sources and inspection limits. They transfer creative intent without copying identities or treating incomplete scene loads as full audits.

For a full new website direction, the agent recommends a product-specific experiment, discusses concrete choices in `prospective-design.md`, and builds one representative HTML specimen. Additional directions are an optional choice in that file, not five required pages. The agent renders and self-reviews the specimen, revises it with feedback, and waits for explicit user green light before full development unless review was already waived. New application surfaces use the same collaboration contract around a real task. Local fixes preserve approved identity and scope.

The [experimental direction guide](.agents/skills/unparalleled-website/references/experimental-direction.md) closes the editorial fallback: oversized type, neutral color, fine rules, broad whitespace and prose spreads cannot substitute for a governing product relationship. Experiment through composition, agency or narrative, prototype the hardest relationship early and preserve it through the whole site. The separate [3D website reference guide](.agents/skills/unparalleled-website/references/website-3d-references.md) covers Igloo and the user-supplied Algal Biotech Lab demo with observed details and inspection limits.

## Framework selection and production pipelines

Both skills require a context-based stack recommendation before new implementation: product needs, existing code, hosting, output, one credible alternative and tradeoffs. A user's framework choice takes precedence; local refinements keep the existing stack. The [framework guide](.agents/skills/unparalleled-website/references/framework-selection.md) distinguishes Node.js, Next.js/Nuxt, React/Vue, GSAP/Motion, Three.js/React Three Fiber, Babylon.js and utility icons rather than installing them all.

Agents deliberately choose [2D](.agents/skills/unparalleled-website/references/pipeline-2d.md), [3D](.agents/skills/unparalleled-website/references/pipeline-3d.md) or hybrid. The 3D route requires open-model research and inspected visual references before scratch modeling, plus a verified Blender connection through MCP for Blender before dependent production. Agents configure it when permitted or request the specific missing user setup step, continuing independent work. Available [image-generation capabilities](.agents/skills/unparalleled-website/references/image-generation-direction.md) produce product-specific cinematic, avant-garde look-development studies, with documented exceptions for user instructions, final art, factual fidelity or tool limits. Generated concepts never establish real product geometry.

The [motion graphics pipeline](.agents/skills/unparalleled-website/references/pipeline-motion-graphics.md) covers Remotion, kinetic typography, actual-song beat/phrase maps, audio-clock synchronization, deterministic frame timing, video export and playback checks. It preserves readable text, authorized audio, silent alternatives and reduced motion. Each independently installable skill contains these references; Blender, image generation and Remotion are task-dependent capabilities, not dependencies installed by the skill installer.

## Screenshot review loop

Agents look at their own work. Each skill's [visual review loop](.agents/skills/unparalleled-website/references/visual-review-loop.md) makes sure a browser is available (a connected Playwright tool, or the bundled capture script, which installs Playwright and Chromium into a user cache on request), captures the page at five widths plus reduced motion, and has the agent open every screenshot, fix one ranked batch at its source, recapture, and compare. Each round needs a severity/evidence/remedy/retest ledger and matched before/after comparison. Specimen review continues to user approval or an explicit waiver; production review ends when no blockers/majors remain and actual acceptance checks pass.

```bash
node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url ./index.html --out ./shots
node .agents/skills/unparalleled-website/scripts/capture.mjs --url http://localhost:5173 --out ./shots --round 2 --viewports desktop,phone
```

Each round writes first-frame and full-page screenshots and a `report.json` that flags measurable template tells: pill shapes, card groups, kanban columns, default typefaces, eyebrow labels, status dots, stock SaaS hues, dark-slate-plus-neon palettes, emoji, em-dash density, horizontal overflow, runtime errors, stock/placeholder copy, repeated large section padding, gradient overuse, identical transform/opacity motion and continuous animation under reduced motion. Flags require a fix/retest, evidenced false positive, or explicit user/brand requirement with functional/access checks. They are not a verdict; the agent still judges images and actual behavior, including content, spacing, focus and motion.

Rendered review covers the opening and whole experience, the complete task/action, phone and intermediate layouts, short laptop height, motion preference, input, and failure states. Scores require evidence; there is no automatic guarantee of awards or superiority over references.

## Installation

You need Node.js 20 or newer. Nothing is compiled, so the installer runs straight from GitHub; no npm account or release package is required.

```bash
# Install both skills into the current project for every detected agent
npx github:Phantom-Con-Artist/unparalleled-skillset install all

# Only one skill
npx github:Phantom-Con-Artist/unparalleled-skillset install website
npx github:Phantom-Con-Artist/unparalleled-skillset install ui

# Once for all your projects
npx github:Phantom-Con-Artist/unparalleled-skillset install all --global
```

The installer detects supported agents from executable paths, configuration folders, project settings, and editor extensions, then copies the complete skills into each agent's native discovery location and adds a short routing block to its instruction file (`CLAUDE.md`, `GEMINI.md`, `.cursorrules`, `.github/copilot-instructions.md`, and so on). Existing instructions are preserved, changed files are backed up, and repeated installs are idempotent. It never prompts and never touches credentials, trust settings, or agent permissions. Twelve integrations are supported: Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Devin, OpenCode, Cline, Roo Code, and Kiro.

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset agents                          # what was detected
npx github:Phantom-Con-Artist/unparalleled-skillset install ui --agent claude,codex # pick agents yourself
npx github:Phantom-Con-Artist/unparalleled-skillset install all --dry-run           # show the plan only
```

Pin a version with a tag or commit, for example `github:Phantom-Con-Artist/unparalleled-skillset#v1.0.0`. See [installation details](docs/installation.md) for native paths, detection evidence, flags, and recovery.

### Manual install

Clone the repository and copy `.agents/skills/unparalleled-ui` and/or `.agents/skills/unparalleled-website` into your agent's skills folder, for example `.claude/skills/` for Claude Code or `.agents/skills/` for Codex and Gemini CLI.

### Screenshot loop browser

The skills screenshot their own output. Give your agent Playwright once (Claude Code: `/plugin install playwright@claude-plugins-official`; others: an MCP server running `npx @playwright/mcp@latest`), or let the bundled `scripts/capture.mjs --install` fetch Playwright into `~/.cache/unparalleled/playwright` the first time it runs. Your project's dependencies are not changed.

### Shorter command after npm publication

If the package is published to npm as `unparalleled`, the same commands shorten to `npx unparalleled install all`. Until then, use the GitHub form above.

### Scaffold the examples

```bash
npx unparalleled scaffold ui
npx unparalleled scaffold website
```

Prefix with `github:Phantom-Con-Artist/unparalleled-skillset` in place of `unparalleled` until npm publication. Both scaffolds copy self-contained Hollow examples. The website follows a piece through making; the working Studio Desk handles dispatch, packing states, search, filters, sorting, pagination, and undo with clearly fictional data. Examples are references, not presets to transplant into unrelated briefs.

## Website workflow

The guarded state machine (intake, discover, contract, specimen, execute, audit) covers request structuring; discovery; a grounded design contract and one selected specimen with iterative user review; approved execution; and evidence review with repair. Research, concrete design choices, an evidence-based vocabulary (15–25 useful terms when supported), authored assets and independent review are retained within those phases. Alternatives are optional; no five-specimen quota remains. The viewer supports one or any useful number of directions. Optional fit scores cannot replace user approval or production evidence. See the [collaboration flowchart](.agents/skills/unparalleled-website/references/design-collaboration.md).

Supporting references cover experimental direction, collaborative specimen approval, stronger bans on palette/type/spacing/shapes/icons/content/motion, 3D reference inspection, the evidence-led screenshot loop, humane writing, bespoke SVG icons, distinctive typography, palette bans, spatial blending, motion engineering, intentional imperfection, and a finite review gate. Read only what the task needs.

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

### Evidence-led skill execution

Both skill entrypoints are structured prompts (trigger contract, system role and epistemic stance, labelled invariants, state-tracker turn contract, guarded state machine) with conditional references, an intake step that turns the raw request into a `<task_brief>`, a machine-checkable `design-contract.json` verified by `scripts/check-contract.mjs`, source-to-rule acceptance criteria, durable milestone checkpoints and failure diagnosis before retries. Full new surfaces retain specimen approval unless explicitly waived; local changes inherit the existing direction and receive proportional checks. See the [website execution contract](.agents/skills/unparalleled-website/references/execution-contract.md) or [UI execution contract](.agents/skills/unparalleled-ui/references/execution-contract.md). Existing browser capture, actual-pair contrast and product checks provide concrete evidence; no script result alone certifies design quality. The local `prompt-research/` source copy and new `docs/` working notes are ignored and are not runtime dependencies of installed skills.
