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

> Use unparalleled-website for our seed research lab. Visitors should understand the trial process and request the current catalogue. Use the real copy and photography in ./content. The tone should be curious and precise, with illustration explaining the process. Recommend a 2D or hybrid route. Show me design.html before you build, then develop in reviewed milestones.

**Application example**

> Use unparalleled-ui to overhaul the seed trial comparison screen. Researchers compare germination, climate and trial notes before choosing varieties. Preserve the existing React stack, real data and filter behavior. Rounded filter pills suit our current brand. Show a representative comparison and recovery state. Keep keyboard use and narrow-screen reading clear.

**Local change example**

> Use unparalleled-ui to fix the comparison table overflowing at 320px. Keep the current design.md, shapes and stack. Inspect the affected task and retest keyboard use and zoom.

Your explicit choices remain constraints. An ordinary local fix should not trigger a new brand interview or a full redesign.

## 3. Expect a prompt architect handoff

For a new task, the main agent invokes a dedicated prompt architect. It first reads the bundled research guidance, then the exact human prompt and relevant prior choices. It interviews you only for consequential unanswered questions and returns an executable prompt in `prompt-handoff.md`.

The handoff preserves your goal, scope, constraints and approvals, separates facts from assumptions, and names deliverables and acceptance evidence. The main agent checks it against your request before starting design work. You do not need to approve a faithful rewrite as an extra ceremony.

If the host lacks delegation or higher-priority instructions prohibit it, the agent must disclose that limit and perform the same intake itself. It must not claim a subagent was used. Clarification can be relayed through the main agent when the architect cannot contact you directly.

## 4. Review product.md, then design.md and design.html

The main agent first writes `product.md`: what is offered, to whom, the main action, verified proof, your existing brand commitments, the gaps it could not resolve and a **vocabulary** of product terms that will drive design decisions. Correct anything it got wrong; every later choice cites it.

It then writes `design.md` in a fixed order, one professional discipline per section, and renders it as `design.html`:

| Section | What you review |
| --- | --- |
| Premise and brand personality | The one product truth that governs the design; three to five traits written as "X, not Y" |
| Color | Palette from the Color Intelligence Layer, your locked brand colors, roles and measured contrast |
| Typography | Real faces set in your own words, pairing and the size scale from phone to desktop |
| Spatial, layout and negative space | Grid, spacing, one focal point per view, and the "noise budget" the page must stay within |
| Visual assets | Which images, illustrations or 3D models exist or will be made (2D image generation and vector, or Blender), with rights and fallbacks |
| Components, UX, responsive, motion | States of every control, navigation and journey, how layouts change by width, what moves and why |
| Accessibility and conversion | WCAG 2.2 AA plan; the primary action and how friction is removed honestly |

Each discipline follows the standards, allowed practice and banned practice in the skill's `references/intelligence/` folder. Before showing you design.html, the agent runs `check-design-sync.mjs` (the page implements design.md's tokens, fonts and noise budget), captures desktop and phone, opens every image and repairs what it finds.

Give concrete feedback: "The diagram explains the process, but the headings feel too formal; keep the colors and try the second typeface." A "no" sends the agent back to design.md, then to design.html, and it shows you a new revision. Say yes explicitly when ready: "Approve design revision d3; build the comparison flow next." Silence and scores are not approval.

## 5. Review working milestones

After design approval the agent builds in slices from the approved tokens. Before each human review it checks the built product against design.md with Playwright (`check-design-sync.mjs` and the full capture loop). A mismatch means the build drifted, and the agent fixes the build, not the design.

An explicit waiver can authorize autonomous progression: "Build the remaining milestones without waiting for my review; keep the inner checks." Waivers apply to the scope you name; a design-review waiver does not waive later milestones.

`human_reviews` keeps a canonical row per boundary with earlier feedback in `history`. `progression.depends_on` names the decisions needed before the next dependent slice. Material changes to approved identity or behavior return to design review.

## 6. Resume or refine without starting over

Ask the agent to read the existing handoff, product.md, design.md, contract, current diff and latest evidence. It should verify the revision and continue the next milestone rather than repeating discovery or requesting an approval already recorded.

Use [Studio](studio.md) for targeted feedback on a running page. A bounded Studio change inherits the approved design.md; a request to replace the whole direction still needs the corresponding review path.

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

Those values illustrate the input format; choose values from your approved design.md (ideally the Color Intelligence Layer output). There is no bundled palette/font preset. New design contracts use schema `/3` with gates `design`, `build` and `deliver`; older `/1` and `/2` contracts remain readable with a legacy note.

## Update

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset update
npx github:Phantom-Con-Artist/unparalleled-skillset doctor
```

Run the newer repository command to update to the version it contains. Restart the agent session afterward. See [the changelog](../CHANGELOG.md) for changes and [installation recovery](../docs/installation.md#updates-and-recovery) for backups.
