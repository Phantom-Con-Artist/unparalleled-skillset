# Antigravity / Gemini Workspace Rules

This workspace defines the **Unparalleled Skillset** agentic environment.

- **UI & Software Skill**: [`.agents/skills/unparalleled-ui/SKILL.md`](file:///.agents/skills/unparalleled-ui/SKILL.md)
- **Website & Landing Page Skill**: [`.agents/skills/unparalleled-website/SKILL.md`](file:///.agents/skills/unparalleled-website/SKILL.md)
- **Design Philosophy**: Consult `references/philosophy-manifesto.md` in each skill before writing frontend code.
- **Rules**:
  1. No generic Tailwind/Bootstrap defaults or AI tropes (no generic icon-in-tinted-box cards, no centered 3-line boilerplate headlines without character).
  2. Fluid clamp typography for scales: `clamp(min, preferred, max)`.
  3. Never use pure `#000000` or `#ffffff` backgrounds; use nuanced perceptual values (`oklch`).
  4. Ensure all text passes WCAG AA contrast (minimum 4.5:1).
  5. State completeness: Every interactive element must define 5 states: `default`, `hover`, `active`, `focus-visible`, and `disabled`.
