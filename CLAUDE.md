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
     - Follow the 8-phase pipeline:
       1. Codebase analysis & competitor search via `search_web`.
       2. Author `prospective-design.md`.
       3. Ask structured user alignment questions (skip supported -> fallback to prospective).
       4. Extract the **Vocabulary** as the **Design Aesthetic Book**.
       5. Subtle 2D/3D depth blending (interactive 3D tilt, specular highlights).
       6. Generate `design-specimens.html` (opens directly in browser) with at least 5 fundamentally distinct designs, Product Matching Scores, and recommendation.
       7. Build production site.
       8. Subagent Quality Gate Review (Product clarity, at-a-glance comprehension, color harmony, anti-slop).

## Commands & Verification
- Check contrast compliance: `npm run check-contrast`
- Validate skill integrity: `npm run validate-all`
