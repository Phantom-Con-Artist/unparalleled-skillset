# Unparalleled Agent Workspace Guidelines

Welcome to the **Unparalleled Skillset** workspace. This repository houses an agentic skillset designed to produce distinctive, high-craft web interfaces, software dashboards, and design systems, discarding cookie-cutter templates in favor of authentic personal philosophy and aesthetic conviction.

## The Two Specialized Skills

1. **`unparalleled-ui` (Software UI/UX & Dashboards)**:
   - Resides at [`.agents/skills/unparalleled-ui/SKILL.md`](file:///.agents/skills/unparalleled-ui/SKILL.md)
   - Specialized for application screens people work in: SaaS dashboards, analytics suites, multi-pane productivity tools, data tables, modals, settings, form validation, and complete interaction states (`default`, `hover`, `active`, `focus-visible`, `disabled`).

2. **`unparalleled-website` (Landing Pages & Web Craft)**:
   - Resides at [`.agents/skills/unparalleled-website/SKILL.md`](file:///.agents/skills/unparalleled-website/SKILL.md)
   - Specialized for public-facing experiences: landing pages, marketing sites, portfolios, editorial storytelling, bento grids, and Awwwards Site of the Day caliber craft.
   - **The 8-Phase Website Pipeline**:
     1. Analyze codebase & perform competitor reconnaissance via web search (`search_web`).
     2. Author `prospective-design.md`.
     3. Ask structured user alignment questions (with skip option -> fallback to prospective).
     4. Extract the **Vocabulary** (15-25 domain words) as the **Design Aesthetic Book**.
     5. Derive fonts, OKLCH colors, and subtle 2D/3D blending from Vocabulary.
     6. Generate `design-specimens.html` (opens directly in browser) with **at least 5 radically distinct designs**, Product Matching Scores, and recommendation.
     7. Build production site.
     8. Subagent Quality Gate Review (Product clarity, at-a-glance comprehension, color harmony, anti-slop).

## Core Directives for Agents

- **No AI Slop / Anti-Template Invariant**: Never default to generic AI web patterns: centered three-line hero over soft purple gradient, 3-card grid with generic icons, slate-gray backgrounds, and placeholder copy.
- **Philosophy-First Design**: Consult each skill's `references/philosophy-manifesto.md` before generating interface code.
- **Fluid Clamp Typography**: Always calculate continuous mathematical scales using `clamp(min, preferred, max)`.
- **Deterministic Validation**:
  - Run `npm run check-contrast` to verify color contrast against WCAG AA standards (minimum 4.5:1).
  - Run `npm run validate-all` to ensure both skill configurations remain well-formed.
