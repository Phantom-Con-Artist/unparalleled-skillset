# Antigravity / Gemini Workspace Rules

This workspace defines the **Unparalleled Skillset** agentic environment.

- **UI & Software Skill**: [`.agents/skills/unparalleled-ui/SKILL.md`](file:///.agents/skills/unparalleled-ui/SKILL.md)
- **Website & Landing Page Skill**: [`.agents/skills/unparalleled-website/SKILL.md`](file:///.agents/skills/unparalleled-website/SKILL.md)
- **Design Philosophy**: Consult `references/philosophy-manifesto.md` and `references/cinematic-direction.md` in each skill before writing frontend code.
- **Rules**:
  1. No generic Tailwind/Bootstrap defaults or AI tropes.
  2. **Do not hard-set specimens!** Dynamically understand the situation, product, and Vocabulary to establish 5 radically divergent specimens.
  3. Master the 5 Pillars of Cinematic Craft: **Cinematic Grade Light, Color Palettes, Atmosphere, Typography, and Artistic Blend (2D/3D)**.
  4. Fluid clamp typography for scales: `clamp(min, preferred, max)`.
  5. Never use pure `#000000` or `#ffffff` backgrounds; use nuanced perceptual values (`oklch`).
  6. Ensure all text passes WCAG AA contrast (minimum 4.5:1).
  7. State completeness: Every interactive element must define 5 states: `default`, `hover`, `active`, `focus-visible`, and `disabled`.
