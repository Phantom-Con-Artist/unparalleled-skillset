# Using Unparalleled

[README](../README.md) · [Install reference](../docs/installation.md) · [Studio manual](studio.md) · [Changelog](../CHANGELOG.md)

Unparalleled supplies design instructions and tools to your coding agent. The agent works in your project and uses its own available tools; installing a skill does not start a hosted designer or create a website by itself.

## 1. Install in your project

Requires Node.js 20+ and npm. From your project directory:

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset setup
npx github:Phantom-Con-Artist/unparalleled-skillset doctor
```

`setup` installs both skills for detected integrations and reports readiness. To select a skill or integration:

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset install website --agent codex
npx github:Phantom-Con-Artist/unparalleled-skillset install ui --agent claude
npx github:Phantom-Con-Artist/unparalleled-skillset agents
```

Start a new agent session or refresh its skill list. Choose `unparalleled-website` for public pages and stories; choose `unparalleled-ui` for software people work in. Use your agent's skill picker or name the skill in your prompt. If it cannot find the skill, point it to the installed `SKILL.md` and run `doctor`.

For a shared user-level installation, add `--global`. For another project, use `--project /absolute/path/to/project`. See [installation and recovery](../docs/installation.md).

## 2. Give the agent the real brief

Include what the product does, who uses it, what they should accomplish, your existing assets/content and any firm requirements. You can leave design decisions open. The agent should ask only questions that materially change the outcome.

**Website example**

> Use unparalleled-website for our seed research lab. Visitors should understand the trial process and request the current catalogue. Use the real copy and photography in ./content. The tone should be curious and precise, with illustration explaining the process. Recommend a 2D or hybrid route. Review the brand kit and live specimen with me, then develop in reviewed milestones.

**Application example**

> Use unparalleled-ui to overhaul the seed trial comparison screen. Researchers compare germination, climate and trial notes before choosing varieties. Preserve the existing React stack, real data and filter behavior. Rounded filter pills suit our current brand. Show a representative comparison and recovery state. Keep keyboard use and narrow-screen reading clear.

**Local change example**

> Use unparalleled-ui to fix the comparison table overflowing at 320px. Keep the current brand kit, shapes and stack. Inspect the affected task and retest keyboard use and zoom.

Your explicit choices remain constraints. An ordinary local fix should not trigger a new brand interview or a full redesign.

## 3. Expect a prompt architect handoff

For a new task, the main agent invokes a dedicated prompt architect. It first reads the bundled research guidance, then the exact human prompt and relevant prior choices. It interviews you only for consequential unanswered questions and returns an executable prompt in `prompt-handoff.md`.

The handoff preserves your goal, scope, constraints and approvals, separates facts from assumptions, and names deliverables and acceptance evidence. The main agent checks it against your request before starting design work. You do not need to approve a faithful rewrite as an extra ceremony.

If the host lacks delegation or higher-priority instructions prohibit it, the agent must disclose that limit and perform the same intake itself. It must not claim a subagent was used. Clarification can be relayed through the main agent when the architect cannot contact you directly.

## 4. Review the Design/Brand Kit

The main agent reads the product and asks remaining questions about brand philosophy, audience, visual direction, 2D/3D, illustration, motion, kinetic text, audio and constraints. It carries forward your previous answers.

The kit defines the boundaries for the whole experience:

| Decision | What you review |
| --- | --- |
| Product vocabulary | Specific ideas and relationships drawn from your product and content |
| Type and color | Real word samples, font roles, semantic colors, backgrounds and measured pair contrast |
| Components and layout | Dynamic shapes, grouping, density, spacing, responsive transformations and interaction states |
| Assets | Existing and proposed illustration/photography, transparency, purpose, crops, rights and fallbacks |
| Experience and production | Journey/task, 2D/3D route, framework choice, motion behavior, accessibility and performance budget |

Ask for a live kit preview, not just a list of font names and hex codes. The agent should inspect it in Playwright and repair defects before presenting it. Give concrete feedback: “The diagram explains the process, but the headings feel too formal; keep the colors and try the second typeface.”

The canonical kit may live in `brand-kit.md`, `prospective-design.md` or the existing surface brief. Its path and revision are linked from `design-contract.json`. Pills, rounded forms, square edges and other geometry are selected for the product; no shape is compulsory.

## 5. Review the specimen, then working milestones

After kit approval, the agent builds one representative live specimen: the decisive product relationship, a later segment/task state, the primary action and meaningful recovery. Additional directions are optional. The specimen tests whether the chosen language actually works.

Every review boundary uses two loops:

1. **Inner Playwright review.** Render the current revision, capture and open images, exercise the important behavior, measure real contrast, repair at source and recapture.
2. **Outer human review.** Show you the artifact, choices, changes, evidence and limits. Incorporate feedback, update the canonical record and repeat the inner loop.

Give explicit approval for the current scope when ready, for example: “Approve this kit for the specimen,” then “Approve this specimen; build the comparison flow next.” Silence and scores are not approval. The agent preserves approved choices and does not repeatedly ask about ordinary corrections within them.

An explicit waiver can authorize autonomous progression: “Choose the kit and build the remaining milestones without waiting for my review; keep the inner checks.” Waivers apply to the scope you name. A specimen-only waiver does not silently waive every other review.

For progressive work, `human_reviews` keeps a canonical row per boundary with earlier feedback in `history`. `progression.depends_on` identifies decisions needed before the next dependent slice. Independent discovery and corrections can continue while review is pending. Material changes to approved identity or behavior return to review.

## 6. Resume or refine without starting over

Ask the agent to read the existing handoff, kit, contract, current diff and latest evidence. It should verify the revision and continue the next milestone rather than repeating discovery or requesting an approval already recorded.

Use [Studio](studio.md) for targeted feedback on a running page. A bounded Studio change inherits the established kit; a request to replace the whole direction still needs the corresponding review path.

## 7. Check the result

Expect a working task/journey, complete relevant states, keyboard/touch use, readable content, reduced-motion/static paths and actual rendered evidence. Review includes desktop, short laptop, tablet, phone and 320px widths, plus appropriate zoom and device-scale checks. A script cannot determine whether the design is good or whether a screenshot was opened.

From your project, use the installed skill's tools. Substitute `unparalleled-ui` for application work:

```bash
node .agents/skills/unparalleled-website/scripts/capture.mjs --url http://127.0.0.1:5173 --out ./review
node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url http://127.0.0.1:5173 --out ./review
node .agents/skills/unparalleled-website/scripts/capture.mjs --url http://127.0.0.1:5173 --out ./review --round 2 --reduced-motion
node .agents/skills/unparalleled-website/scripts/check-contract.mjs --contract ./design-contract.json --gate deliver
```

Use `--install` only when a browser is needed; it downloads Playwright/Chromium to a user cache. The capture script has no browser-zoom/DPR flags; use browser tools or a suitable project harness for those checks.

**Actual contrast pairs**

Create `pairs.json` from the real composited foreground/background colors:

```json
[
  { "name": "Body on canvas", "fg": "#242724", "bg": "#f2f2ed", "req": 4.5 }
]
```

```bash
node .agents/skills/unparalleled-website/scripts/check-contrast.mjs --pairs ./pairs.json
```

Ordinary text requires 4.5:1; 3:1 applies to qualifying large text and relevant non-text graphics. Verify rendered sizes, states and compositing rather than selecting a weaker threshold for convenience.

**Palette diagnostics**

`score-palette.mjs --input ./palette.json` reports luminance range, saturation, hue dispersion, hue separation, local target-fit scores and independent pair contrast. Define project-specific targets before optimizing; see [the input format and limitations](../.agents/skills/unparalleled-website/references/design-measurements.md). This is not an implementation of the Ou–Luo formula or an aesthetic certification.

**Project tokens**

```json
{
  "--color-text": "#242724",
  "--color-canvas": "#f2f2ed",
  "--space-group": "1rem"
}
```

Save your chosen values as `tokens.json`, then run:

```bash
node .agents/skills/unparalleled-website/scripts/generate-tokens.mjs --input ./tokens.json --output ./tokens.css
```

Those values illustrate the input format; choose your own kit values. There is no bundled palette/font preset. New design contracts use schema `/2`; older `/1` contracts remain readable with a legacy note.

## Update

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset update
npx github:Phantom-Con-Artist/unparalleled-skillset doctor
```

Run the newer repository command to update to the version it contains. Restart the agent session afterward. See [the changelog](../CHANGELOG.md) for changes and [installation recovery](../docs/installation.md#updates-and-recovery) for backups.
