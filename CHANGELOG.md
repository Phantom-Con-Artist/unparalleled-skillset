# Changelog

Changes to Unparalleled's public package and design workflow are recorded here. Version entries describe repository changes; they do not imply a registry publication or Git tag exists.

## 1.3.0 — 2026-11-03

### Fixed design flow

- Both skills now follow one fixed state machine: intake (prompt architect subagent) → product → design → design review → build → verify → human review → deliver. A "no" at any review returns to refinement.
- New artifacts replace the brand kit, prospective direction, surface brief and specimen viewer: `product.md` (product truth and vocabulary), `design.md` (the written design system in a fixed order) and `design.html` (its live rendering and representative design).
- Contract schema `/3` with gates `design`, `build` and `deliver` checks product.md vocabulary, every design.md section in order, the design-tokens block, Color Intelligence evidence, design approval at the current revision, and a passing built-product sync report. `/1` and `/2` records remain readable; `contract` and `execute` are accepted gate aliases.

### Design intelligence

- Added `references/intelligence/` to both skills: brand personality, color, typography, spatial and layout, negative space, visual assets, components, UX and information architecture, responsive, motion, accessibility and conversion. Each lists standards to fetch, allowed practice, banned practice, what to record and how to verify.
- Negative space is the governing discipline, with a measurable noise budget.
- Added `sources.md`: primary sources (WCAG 2.2, WAI-ARIA APG, CSS specifications, NN/g, professional design systems, Baymard, EAA/EN 301 549) each checked to load on 2026-11-03.
- Added a sloppy-prompt to high-performance-prompt worked example to the prompt research guidelines.

### Tools

- Vendored the Color Intelligence Layer (`packages/color-intelligence`, Apache-2.0) with `npm run color:setup`, `color:doctor` and `test:color`; setup registers its MCP server in `.mcp.json`.
- Added `check-design-sync.mjs`: compares a rendered page with design.md's tokens, fonts and noise budget.
- `capture.mjs` now reports a `noise` block (font sizes, text colors, radii, shadows, spacing values, first-view focal points, actions and ink coverage) and flags small targets and long measures.

### Removed (merged into the intelligence files or new artifacts)

- Website: `color-oklch-tokens`, `typography-fluid-scales`, `motion-choreography`, `design-measurements`, `professional-design-sources`, `design-brand-kit`, `vocabulary-generator`, `specimen-architectures`, `philosophy-manifesto`; templates `brand-kit`, `prospective-design`, `user-design-principle`, `design-specimens.html`.
- UI: `ui-tokens`, `keyboard-nav-a11y`, `form-engineering`, `component-states-contracts`, `design-measurements`, `professional-design-sources`, `design-brand-kit`, `philosophy-manifesto`, `app-screen-patterns`; templates `brand-kit`, `surface-brief`.
- Anti-slop invariants and generic tells no longer repeat discipline-specific bans.

## 1.2.0 — 2026-11-03

### Design workflow

- Added research-first prompt architect delegation, consequential clarification interviews and faithful executable handoffs to both independently installable skills.
- Added a binding, vocabulary-led Design/Brand Kit covering philosophy, typography, semantic color, component geometry, spacing, illustration/assets, UX states and production pipelines.
- Added nested inner Playwright inspection/repair and outer human review for brand kits, consequential choices, live specimens and progressive development milestones.
- Added current-revision review records, milestone dependencies, feedback history and scoped waivers to contract schema `/2`; retained legacy `/1` reading with a diagnostic note.
- Replaced blanket anti-pill instructions with dynamic product/task/brand-derived geometry. Pills, rounded forms and square edges remain available.

### Measurement and guidance

- Added project-specific palette diagnostics for luminance range, saturation, hue dispersion and separation, with independent contrast acceptance.
- Added primary-source design research and explicit limits for harmony models, typography ratios, spacing, scanning patterns, motion and performance heuristics.
- Expanded rendered review guidance for zoom, device scale, alpha edges, foreground/background states and actual media frames.

### Documentation and release maintenance

- Rebuilt the README with an original SVG mark, version badges, workflow diagram, Studio screenshot and focused navigation.
- Added separate Unparalleled and Studio manuals, including brand review, progressive work, page picking, Vite, MCP, references, guarded patches and recovery.
- Standardized download commands on the GitHub repository, including CLI help and recovery messages.
- Documented existing Studio capabilities accurately, including MCP and atomic multi-file patches; removed obsolete claims that they were unavailable.
- Set package and bundled Studio component versions to 1.2.0 and synchronized release metadata.
- Removed unused legacy layout fragments and retired catalog stubs. Preserved the runnable scaffold and Studio examples.
- Excluded local Impeccable state, handoff notes and generated review artifacts from tracking/package output.

### Fixes

- Fixed direct Studio, agent and MCP executables silently exiting when launched through npm global symlinks.

### Verification

- Added behavioral coverage for palette diagnostics and prompt/kit/progressive review gates.
- Kept skill structure/link checks and reference contrast fixtures separate from actual product design/accessibility verification.

## Earlier history

See the [commit history](https://github.com/Phantom-Con-Artist/unparalleled-skillset/commits/main/) for earlier installer, skill, Studio and showcase changes. Earlier work was not retroactively assigned release dates or fabricated version entries.
