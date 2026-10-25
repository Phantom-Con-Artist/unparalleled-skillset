# Claude Code Instructions — Unparalleled Skillset

This project is governed by the **Unparalleled Skillset** architecture for crafting high-fidelity digital interfaces without generic AI tropes.

## Available Agentic Skills

1. **`unparalleled-ui` (Software UI/UX & Dashboards)**:
   - Location: `.agents/skills/unparalleled-ui/SKILL.md`
   - Use whenever designing or implementing software screens people work in: SaaS dashboards, cloud consoles, data tables, modals, settings, form validation, and complex component libraries.
   - Core Directives:
     - 5-state completeness on all interactive elements (`default`, `hover`, `active`, `focus-visible`, `disabled`).
     - Tabular numbers (`font-variant-numeric: tabular-nums`) for metrics, financial data, and timestamps.
     - Strict WCAG 2.1 AA accessibility (minimum 4.5:1 text contrast).
     - Semantic token contract (`var(--surface-app-bg)`, `var(--text-primary)`, etc.).

2. **`unparalleled-website` (Landing Pages & Web Craft)**:
   - Location: `.agents/skills/unparalleled-website/SKILL.md`
   - Use whenever building public-facing experiences: landing pages, marketing sites, brand portfolios, and editorial web experiences.
   - Core Directives:
     - Anti-Slop: No generic centered 3-line headlines over soft gradients; choose an intentional layout from `references/hero-architectures.md`.
     - No 3-card rows with tinted icon boxes; use asymmetric Bento grids.
     - Fluid clamp typography (`clamp(min, preferred, max)`) — no breakpoint font snapping.
     - Nuanced OKLCH color palettes with a single punch accent.

## Commands & Verification
- Check contrast compliance: `npm run check-contrast`
- Validate skill integrity: `npm run validate-all`
