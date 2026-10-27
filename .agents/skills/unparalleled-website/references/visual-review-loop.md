# Look, correct, look again

Source code describes what the author intended. Screenshots show what a visitor receives. Every substantial build in this skill runs a screenshot loop: render the real page, look at it as a stranger would, fix the most consequential problem at its source, and render again. Do not hand over a design you have not seen.

## 1. Make sure you can see

Use the first route that works and say which one you used.

| Route | How to check | How to get it when missing |
| --- | --- | --- |
| A Playwright browser tool already connected to the agent | Tool names containing `playwright` or `browser_take_screenshot` are listed. | Claude Code: `/plugin install playwright@claude-plugins-official`, or `claude mcp add playwright -- npx @playwright/mcp@latest`. Codex: `codex mcp add playwright -- npx @playwright/mcp@latest`. Cursor, Gemini CLI, Windsurf, Copilot: add an MCP server with command `npx` and args `["@playwright/mcp@latest"]` to that tool's MCP config. A newly added MCP server usually needs a session restart, so continue with the next route in the meantime. |
| The bundled capture script | `node scripts/capture.mjs --url <page> --out <dir>` from the skill directory exits 0. Exit code 2 means Playwright is missing. | `node scripts/capture.mjs --install --url <page> --out <dir>` installs Playwright and Chromium into `~/.cache/unparalleled/playwright`, leaving the project's dependencies untouched. If the project already has Playwright, the script uses it. |
| Any other browser automation the session has | A browser tool that can navigate and screenshot. | None needed. |

Installing downloads packages, so it needs network permission. Ask only if the session requires approval for installs; otherwise proceed and mention it. If every route fails, report a source-only review, list what remains unseen, and never describe screenshots you did not take.

Serve the page the way it will run. A static file can be opened by path. A framework project needs its dev server running first; start it in the background and capture its local URL.

## 2. Capture a round

`node scripts/capture.mjs --url <url-or-file> --out <dir> --round <n>` writes, for each viewport, a first-frame and a full-page screenshot plus `report.json`.

| Viewport | Size | What it is for |
| --- | --- | --- |
| desktop | 1440×900 | The composition as designed. |
| laptop | 1366×768 | Whether the first frame survives a short screen. |
| tablet | 834×1112 | The awkward middle width where layouts often collapse badly. |
| phone | 390×844 | The real mobile composition. |
| narrow | 320×640 | Reflow, long words, overflow. |

Add `--reduced-motion` for the motion-off pass. Narrow the set with `--viewports desktop,phone` between rounds when only one area changed. With a Playwright MCP tool instead of the script, resize to the same sizes and take the same two shots per size.

The report flags template tells it can measure in the rendered DOM: pill shapes, groups of similar framed cards, kanban columns, default typefaces, tiny tracked uppercase labels, ornamental status dots, stock SaaS hues and dark-slate-plus-neon palettes, emoji, em-dash density, horizontal overflow, runtime errors, stock/placeholder copy, repeated large section padding, repeated gradient surfaces, identical transform/opacity motion and continuous animations under reduced motion. Each flag requires an evidenced disposition: fix and retest, demonstrate a false positive, or cite the explicit user/brand requirement and verify functional/access behavior. A generic claim of intentionality is insufficient. The script cannot see composition, mood, or whether the page belongs to the product; that judgment is yours.

## Two loops with different completion gates

**Direction loop:** before full development of a new surface/overhaul, follow [design-collaboration.md](design-collaboration.md). Render a representative specimen, self-review, show the current revision, incorporate feedback and repeat until the user approves or explicitly waives review. There is no five-specimen quota. A technically clean specimen is not user approval. Do not stop iterating on a requested revision merely because a fixed number of rounds elapsed.

**Production loop:** after approval, inspect the complete experience against that exact direction and the real task. A user-approved hero does not certify later sections, states or mobile behavior. Return material direction changes to specimen review; fix ordinary implementation defects without repeatedly asking for approval.

## Review evidence and findings ledger

For every round, record the revision/commit, route, viewport, scenario, motion setting, content/data source and screenshots opened. Keep captures in round folders in scratch/output unless the project uses committed baselines. Record actual inspected behavior, not planned checks. A full-page screenshot does not activate lazy content, traverse pinned scenes, expose menus or test a task: scroll through meaningful stops and exercise states separately.

| Finding | Severity | Location/state | Evidence and product consequence | Source-level remedy | Retest result |
| --- | --- | --- | --- | --- | --- |

Use **blocker** for false product/data claims, broken primary paths, inaccessible essential content or explicit user-ban violations; **major** for a generic/unsupported direction, unreadable hierarchy, material reflow failure, identity drift or lost state; **minor** for bounded polish. Do not average blockers/majors away with fit scores. “Feels off” needs an observed cause before another edit.

Open every produced screenshot, compare the same route/state/viewport between rounds and inspect both the focal region and the whole journey. A source diff or green report does not prove an improvement. Record whether the intended problem was fixed, whether the approved direction survived, and whether another viewport/state regressed.

## Review the design grammar, not just overflow

Read [anti-slop-invariants.md](anti-slop-invariants.md). Review these in order:

1. **Truth and recognition.** Can a stranger identify the real product and next step? Trace claims to evidence; do the competitor-name swap test beyond the opening.
2. **Palette and gradients.** Compare computed roles and proportions with their product sources. Inspect text/focus/selection on the lightest and darkest actual scene frames. Remove stock combinations and unrelated gradient decoration.
3. **Type and content.** Verify actual font loading, glyphs, numerals, line breaks and smallest labels. Read headings, captions, CTA, errors and empty states. Replace buzzwords, interchangeable promises and repeated sentence templates with useful facts or omit them.
4. **Spacing and shape.** Check relationships inside groups, between groups and between sections; density must follow the content. Remove repeated oversized section padding, dead whitespace hiding thin content, arbitrary gaps, universal corner radii, card/pill recipes and mobile “shrink everything” layouts. A consistent spacing scale and functional target sizes remain valid.
5. **Icons and focus.** Check every icon has a purpose, correct meaning, consistent optical grammar and a named control. Remove decorative icon inventories. Walk keyboard focus, visible focus indication, overlay order and return focus; never confuse the visual focal point with keyboard focus.
6. **Motion and spatial meaning.** Watch the motion, including middle/end/reversal states, rapid input, audio offsets when relevant and reduced motion. Reject universal fade/slide staggers, idle floats/spins, arbitrary parallax and fake progress. Test the signature as an explanation or task tool.
7. **Continuity and reliability.** Inspect later sections, task completion, return/navigation, loading/empty/error/busy states, long content, phone/intermediate/short-height screens and failed assets. For spatial work inspect camera controls, labels and renderer failure independently.

## Fix, recapture, compare

Choose one ranked batch by impact and fix its cause in tokens, content, layout, components or timing. Re-render affected states, then check adjacent widths and shared consumers. A typography change requires wrap/zoom checks; a palette change requires new contrast measurements; a motion change requires playback and reduced-motion checks. Keep one stable comparison baseline. Avoid simultaneous unrelated cosmetic edits that make the result impossible to assess.

If the same major finding survives two correction attempts, change the hypothesis or structure instead of nudging values indefinitely. If several rounds do not converge, revisit the direction with evidence; do not declare failure solely from a round count or keep looping on ungrounded taste.

## Acceptance and honest limits

Finish production when a fresh inspection finds no unresolved blockers or majors, the agreed direction holds, the full task/action and relevant states pass, all required viewport and reduced-motion captures have been opened, measured contrast passes and relevant tests pass. Record any bounded minor items or genuinely unverified paths. Independent review uses the skill's review rubric and the same evidence set; no score can override a hard failure.

Every automated finding needs a disposition: **fixed and retested**, **evidenced false positive**, or **explicit user/brand requirement with functional/access checks**. “Intentional,” “premium” or “the palette is product-specific” without a source and observed role is not a waiver. Automated signals cannot establish intent, identify every stock animation, read canvas content or prove overall originality; zero flags is not sign-off.
