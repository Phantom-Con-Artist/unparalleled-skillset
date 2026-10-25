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

The report flags template tells it can measure in the rendered DOM: pill shapes, groups of similar framed cards, kanban columns, default typefaces, tiny tracked uppercase labels, ornamental status dots, stock SaaS hues and dark-slate-plus-neon palettes, emoji, em-dash density, horizontal overflow, and runtime errors. Each flag is a question. Remove the pattern, or write one sentence in the direction record explaining why this product needs it. The script cannot see composition, mood, or whether the page belongs to the product; that judgment is yours.

## 3. Read the screenshots in this order

Open the images. Do not review from the report alone.

1. **Stranger test.** Cover the logo mentally. Could this first frame belong to a competitor, or to an unrelated product with the copy swapped? If yes, the governing idea is not visible yet, and that outranks every other fix.
2. **Template test.** Compare against [generic-tells.md](generic-tells.md). Look for the shapes, not class names: a text-left/visual-right split with a framed widget, a row of three boxes, rounded everything, badge pills in the nav, an eyebrow over every heading.
3. **Hierarchy.** Where does the eye land first, second, third? Is that the order the product needs?
4. **Continuity.** Scroll the full-page shot. Does the hand that made the first frame still show in the last section, the form, the footer?
5. **Reflow.** On phone and narrow, is it recomposed or merely squeezed? Any clipped words, overlapping layers, or a sideways scroll?
6. **Reliability.** Runtime errors, failed requests, missing fonts, unreadable contrast on real backgrounds.

## 4. Fix one batch, then look again

Rank what you found. Fix the highest-impact problems in one focused batch, at their source: a token, a shared component, the composition. Then capture the next round to a new folder and compare it with the previous round side by side. Say what changed and whether it worked; a fix that made something else worse gets reverted or corrected before moving on.

| Round | Focus |
| --- | --- |
| 1 | Does the concept show? Fix the governing idea, the first-frame composition, and any template structure. |
| 2 | Continuity and reflow. Fix later sections, phone composition, overflow, and states. |
| 3 | Craft. Type fit, spacing rhythm, crop, contrast, motion-off stills, remaining report flags. |

Stop when a round produces no consequential findings, every remaining report flag is removed or justified in writing, and the checks in [rendered-review.md](rendered-review.md) pass. Five rounds without convergence means the direction itself is weak; go back to the direction contract rather than polishing further. Never loop on taste alone: each round needs a named problem it solves.

Keep the round folders in the session's scratch or output area, not in the user's source tree, unless the project already keeps visual baselines.
