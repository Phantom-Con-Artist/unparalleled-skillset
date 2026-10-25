# Product

<!-- impeccable:product-schema 1 -->

Scope: the public Unparalleled website at the root of the Pages site (`/`), source in `site/apps/unparalleled/`. Demo sites live beside it at their own paths: `/poterie-celeste/`, `/soveriegn-quantum/` and `/claude/`.

Source of truth: the repository README, `docs/installation.md`, the two skills in `.agents/skills/`, the installer in `bin/` and `lib/`, and the user's request to build "the actual Unparalleled website" in this monorepo. No interview round was run; the repository's CLAUDE.md asks for a sufficient brief to proceed without one. Facts marked *(inferred)* are not stated in those sources.

## Platform

web

## Stack

React 19 with Vite, matching the monorepo's other app; GSAP and Motion available. Built into `site/public/` by `site/scripts/build.mjs` and served by Cloudflare Pages. Fonts self-hosted.

## Users

Developers and designers who build interfaces with AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI and the other supported tools) and are tired of the same generated look. They arrive from GitHub, a shared demo, or a recommendation, skim to see whether the output is actually different, and leave with an install command or a demo to send to someone. *(audience inferred from the README and supported agents)*

## Product Purpose

Unparalleled is two agent skills, `unparalleled-website` for public sites and `unparalleled-ui` for application screens, plus a dependency-free installer that copies them into every detected agent's native skill folder. The skills make an agent research the product, write a direction contract, explore five product-specific hypotheses for a website, build one, then screenshot its own work at five widths and fix what it sees. Success: a visitor understands what changes in their agent's output, sees proof, and installs it.

## Positioning

Its mechanism is evidence over taste presets: every design choice must trace back to the product, and a capture script flags measurable template tells (pill shapes, card groups, kanban columns, default typefaces, eyebrow labels, status dots, stock SaaS hues, neon-on-slate, emoji, em-dash density, overflow) so the agent removes or justifies each one. It names and bans the generated look precisely rather than offering another style.

## Operating Context

Installed from a terminal with `npx github:Phantom-Con-Artist/unparalleled-skillset install all` (or `website`, `ui`, `--global`, `--agent`, `--dry-run`), with Node 20 or newer. Twelve integrations: Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI, Antigravity, Windsurf, Devin, OpenCode, Cline, Roo Code, Kiro. The installer never prompts, backs up changed files, and is idempotent. MIT licensed, by Subhradeep Sarkar.

## Capabilities and Constraints

- Verified: two skills, the installer and its flags, `agents` detection report, `scaffold ui|website` examples, `capture.mjs` screenshot loop with `report.json` flags, `check-contrast.mjs`, `generate-tokens.mjs`, `validate-all`.
- Shorter `npx unparalleled` only after npm publication; the GitHub form is the working command today.
- Not to be invented: user counts, stars, testimonials, company logos, benchmarks, award claims, or "better than" comparisons.

## Brand Commitments

Name: Unparalleled (package `unparalleled`, repository `unparalleled-skillset`). No existing logo, palette or type. The site must obey the skills' own bans: no emoji decoration, bullet-point marketing, card grids, kanban lanes, pills, generic SaaS colour, neon, generic sans identity, buzzwords or em-dash spam.

## Evidence on Hand

The Poterie Céleste demo at `/poterie-celeste/` (a full React and Blender site built with these skills in this repository); the Soveriegn Quantum demo at `/soveriegn-quantum/` (a scroll-driven descent through a Blender-built dilution refrigerator into its processor, source `site/apps/soveriegn-quantum/`); the Claude page at `/claude/`, built by Claude Code from the single prompt "Create a website introducing you as Claude AI using unparalleled-website skill. You are the product. Sell Yourself!" (source `site/demos/claude/`, direction notes `site/design/claude/`); the generic-page dissection in `references/generic-tells.md`; the capture report format; the README's installation and agent table.

## Product Principles

- Show the output, not the promise. Proof is a real page built with the skills.
- Name the generic precisely. The skill's value is recognising the template look; the site should make that recognisable too.
- Install in one line. The command is always one copy away.
- Practise what it preaches. The site itself must pass its own capture flags.

## Accessibility & Inclusion

WCAG 2.2 AA, full keyboard path, reduced-motion equivalents, and a static reading path that does not depend on any scene.
