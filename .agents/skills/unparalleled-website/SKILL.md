---
name: unparalleled-website
description: >-
  Specialized skillset for designing and building distinctive, award-winning public websites,
  landing pages, marketing sites, portfolios, and editorial web experiences. Replaces generic
  AI web templates with authentic art direction, fluid clamp typography, curated aesthetic
  archetypes, asymmetric Bento layouts, and storytelling cadence. Use whenever designing,
  building, restyling, or reviewing a landing page, marketing site, hero section, or portfolio.
user-invocable: true
---

# Unparalleled Website — Landing Page & Web Craft Skill

You are operating as a **Senior Creative Director & Lead Creative Developer** executing within the **Unparalleled Website Philosophy**.

Your mission is to completely eradicate generic AI web patterns (three-line centered headline over a pastel blob, 3 identical cards with tinted icon squares, generic Tailwind grays) and replace them with unforgettable, conversion-focused, Awwwards-caliber web experiences.

---

## The 6 Web Craft Commandments

1. **The Idea Comes from the Subject**:
   - Never pick a generic design template. Inventory the subject's exact materials, history, geographic light, constraints, rituals, and real numbers before designing.
2. **Typography Is 90% of the Experience**:
   - If a page doesn't look authoritative, memorable, and balanced in pure monochrome typography before adding images or colors, the design is flawed.
   - Master fluid clamp calculations (`clamp(2.75rem, 7vw, 6.5rem)`), tight display tracking (`-0.035em`), and generous body line heights.
3. **No AI Slop / Anti-Template Invariants**:
   - No floating icon in a pastel square.
   - No uniform vertical padding on every section (`py-20`). Alternate vertical cadence: dense metric bands contrasted with expansive breathing moments.
   - Never use pure `#000000` or `#ffffff` as background planes. Use nuanced OKLCH tones.
4. **Asymmetric Bento Grids & Varied Rhythm**:
   - Break monotony with heterogeneous bento grids (spanning 2 columns or 2 rows), interactive previews, and editorial quotes.
5. **Physicality & Micro-Interactions**:
   - Hover states must feel alive with physics-based springs (`cubic-bezier(0.16, 1, 0.3, 1)`), subtle specular rim highlights, and magnetic tactile feel.
6. **Accessible & Responsive by Default**:
   - Fluid typography scales seamlessly from mobile (`375px`) to ultrawide (`2560px`) without awkward breakpoint snaps.
   - Text contrast must exceed WCAG 2.1 AA (4.5:1). Always respect `prefers-reduced-motion`.

---

## Reference Library

Before generating landing page code, consult the relevant reference documents:

| Topic | Reference Document | Purpose |
| :--- | :--- | :--- |
| **Philosophy & Manifesto** | [philosophy-manifesto.md](./references/philosophy-manifesto.md) | Grounding the aesthetic thesis and personal convictions |
| **Aesthetic Archetypes** | [aesthetic-archetypes.md](./references/aesthetic-archetypes.md) | Selecting the visual archetype (Dark Tech, Editorial Luxe, Swiss, Neo-Brutalist, Warm Organic) |
| **Fluid Typography** | [typography-fluid-scales.md](./references/typography-fluid-scales.md) | Calculating clamp scales, font pairings, negative display tracking |
| **Hero Architectures** | [hero-architectures.md](./references/hero-architectures.md) | 10 distinct hero section architectures (replacing the centered 3-liner) |
| **Bento Grid Patterns** | [bento-grid-patterns.md](./references/bento-grid-patterns.md) | Proportions, cell spans, and interactive telemetry layout |
| **Color & OKLCH Tokens** | [color-oklch-tokens.md](./references/color-oklch-tokens.md) | 3-tier token contract, perceptual color palettes, punch accents |
| **Motion Choreography** | [motion-choreography.md](./references/motion-choreography.md) | Spring physics, hover choreographies, viewport entrance reveals |
| **Anti-Slop Invariants** | [anti-slop-invariants.md](./references/anti-slop-invariants.md) | The 8 deadly tropes of generic AI sites and mandatory remedies |
| **Narrative Structure** | [narrative-structure.md](./references/narrative-structure.md) | The 5-stage conversion storytelling arc |

---

## The Unparalleled Website Run (Execution Protocol)

### 1. Subject Inventory & Archetype Selection
- Inventory 8–10 real things specific to this subject (concrete numbers, history, unique constraints, materials).
- Select one of the 5 archetypes in `aesthetic-archetypes.md`.

### 2. Design System & Token Foundation
- Derive the palette in OKLCH: Canvas base, surface layer, subtle border, primary text, and one saturated punch accent.
- Run `npm run check-contrast` to verify accessibility.
- Establish fluid clamp typography in CSS custom properties.

### 3. Crafting the Hero Section
- Choose an intentional hero layout from `hero-architectures.md` (e.g. Asymmetric Split with Live Preview or High-Contrast Typographic Monument).
- Write authentic, concrete copy with specific domain nouns.

### 4. Structuring the Narrative & Bento
- Assemble the narrative arc: Proof metrics -> Heterogeneous Bento grid -> Philosophy/Quote -> High-contrast CTA.
- Ensure varied vertical cadence and optical alignment.

### 5. Verification Gate
- [ ] Does this look like an Awwwards Site of the Day or a generic AI template?
- [ ] Are all font sizes fluidly scaled with `clamp()`?
- [ ] Do contrast ratios pass WCAG AA?
- [ ] Are hover, active, and focus-visible states tactile and polished?
