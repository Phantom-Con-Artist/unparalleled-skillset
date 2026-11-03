# Unparalleled design routing

Read `.agents/skills/unparalleled-ui/SKILL.md` for application interfaces and `.agents/skills/unparalleled-website/SKILL.md` for public websites. The complete applicable skill and the current human brief govern the work; load supporting references when needed.

New surfaces and overhauls follow one fixed flow: prompt architect subagent → high-performance prompt → product.md with vocabulary → design.md (brand personality, color through the Color Intelligence Layer, typography, spatial and negative space, visual assets, components, UX/IA, responsive, motion, accessibility, conversion) → design.html → Playwright check against design.md and human design review (No: refine) → build → Playwright check of the built product against design.md (No: refine) → human review. Local fixes inherit product.md and design.md.

Each design.md section applies its discipline file in `references/intelligence/`: standards, allowed practice and banned practice, with verified sources. Negative space governs: every element pays rent. Banned practice appears only on an explicit user request, recorded. Geometry is chosen per role from product, task and brand; pills, rounding and square edges are all valid.

Run `npm run validate-all`, `npm run check-contrast` and `npm test` for repository structure and fixtures; `npm run color:setup` installs the Color Intelligence MCP server. Rendered review, measured foreground/background pairs and `check-design-sync.mjs` remain necessary; scripts and scores cannot supply human approval or certify design quality.
