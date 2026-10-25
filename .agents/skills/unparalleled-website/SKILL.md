---
name: unparalleled-website
description: >-
  Design, build, and review public websites, landing pages, portfolios, and product stories.
  Derive original visual worlds from the product rather than mainstream design genres.
  Use bespoke icons, distinctive typography, human writing, and purposeful interactive
  2D/3D motion with accessible fallbacks. Includes five situational specimens and review.
  For operational dashboards and application workflows, use unparalleled-ui instead.
---

# Unparalleled Website

Work as a creative director who understands the product and a developer who can make its story tangible. Make something specific enough that another company could not reuse it by swapping a logo. Read the subject before choosing its appearance.

## The design contract

Follow the user's prompt, real product capabilities, existing brand commitments, and explicit preferences. These take precedence over this skill. Default to original, product-derived direction. Do not silently replace an established brand or inflate a small requested edit into a complete redesign.

No emoji decoration, emoji icons, Unicode pictogram substitutes, visible bullet-point layouts, stock icon tiles, buzzword copy, em-dash spam, generic sans-serif defaults, or preset palettes. These bans apply to rendered work and authored copy; semantic lists remain available for navigation, true sequences, and assistive technology without decorative bullet markers. Write skill artifacts in connected prose, meaningful headings, and comparison tables. See [anti-slop-invariants.md](references/anti-slop-invariants.md).

Do not select or blend mainstream design genres: glassmorphism, neumorphism, skeuomorphism, claymorphism, other named morphisms, editorial/luxury magazine layouts, Swiss grids, brutalism, neo-brutalism, bento-first SaaS, minimalist template kits, or Linear/Vercel clones. Renaming a familiar genre does not make it original. Derive composition, physical behavior, and atmosphere from the product's own process. Foundational tools such as grids, shadows, serif type, and perspective remain available; use them to explain the subject rather than recreate a banned genre.

Give the work a human hand. Allow a justified off-axis annotation, uneven rhythm, custom contour, or slightly irregular timing when it adds character. Do not chase mathematical sameness or endless polish. Readability, honest claims, working controls, contrast, and access are firm requirements. See [cinematic-direction.md](references/cinematic-direction.md).

## Execution

### Phase 1: Understand the subject

Read the codebase and existing assets. Establish what the product does, who needs it, its real differentiators, the primary action, and available evidence. Research two or three relevant competitors using the environment's available web tool when useful. Record sources and separate facts from assumptions. Do not fabricate research if browsing is unavailable.

### Phase 2: Write the prospective direction

Create `prospective-design.md` using the [prospective template](templates/prospective-design.template.md). Describe the product truth, audience, evidence, preliminary story, palette origins, typography criteria, and implementation constraints. Describe a mechanism or experience, never an aesthetic genre.

### Phase 3: Align with the user

Ask a compact set of questions about priority, feeling, exclusions, and available assets only when these are missing. Offer a skip option. Honor earlier answers and requests to proceed. Use the prospective direction when the user skips or the brief is already sufficient; do not interpret silence as approval for actions that require permission. Record answered preferences in `user-design-principle.md` using the [principles template](templates/user-design-principle.template.md).

### Phase 4: Extract the vocabulary

Create a 15–25 word vocabulary from the product's materials, actions, people, geometry, pigments, and consequences. Translate it into concrete design decisions using [vocabulary-generator.md](references/vocabulary-generator.md). Avoid merely substituting poetic names for stock treatments.

### Phase 5: Establish the experience

Choose distinctive type through [typography-fluid-scales.md](references/typography-fluid-scales.md), derive colors through [color-oklch-tokens.md](references/color-oklch-tokens.md), and define a bespoke icon grammar through [bespoke-icons.md](references/bespoke-icons.md). Write copy through [human-writing.md](references/human-writing.md). Map the story into meaningful changes of state with [narrative-structure.md](references/narrative-structure.md) and [motion-choreography.md](references/motion-choreography.md). Read [blending-2d-3d.md](references/blending-2d-3d.md) before implementing depth.

### Phase 6: Explore five situational specimens

Invent at least five fundamentally different product-specific hypotheses. Vary narrative mechanism, spatial behavior, composition, type, palette, and motion rather than recoloring one layout. Follow [specimen-architectures.md](references/specimen-architectures.md). Use [design-specimens.html](templates/design-specimens.html) as an unstyled viewer shell; populate it with live specimens, evidence-based fit scores, rationales, and a text recommendation. No prefilled worlds or fake scores. Use the recommended direction if the user has authorized proceeding without selection.

### Phase 7: Build the story

Develop the selected direction as a responsive, usable website. Integrate 2D graphic elements and meaningful 3D spatial change, interactivity, motion graphics, and scroll-driven storytelling in proportion to the prompt and product. A small product may need a single purposeful transition; complexity is not a quality metric. Preserve native scrolling, direct navigation, and a complete static reading path. Do not force cards, shaders, particles, grain, parallax, or tilt into every section.

Use semantic tokens, calculated fluid `clamp()` typography, accessible names, visible focus, usable touch targets, and complete control states. Render the primary message and action before optional heavy media. Keep content and conversion usable without WebGL, animation, hover, or JavaScript where practical.

### Phase 8: Inspect and finish

Run repository checks and inspect the rendered site at narrow and wide sizes. Test keyboard use, touch alternatives, reduced motion, loading failures, and the primary action. Contrast scripts check only their supplied color pairs; they do not certify a rendered site. Verify actual computed foreground/background pairs, including overlays and motion states.

Request an independent review with the environment's available subagent tool using [subagent-review-rubric.md](references/subagent-review-rubric.md). If delegation is unavailable, disclose a self-review. Fix functional, factual, accessibility, and ban violations before delivery. Aim for at least 85/100, with no hard failures. Stop after a final focused review when remaining changes are subjective taste; do not inflate scores or loop indefinitely. Report the outcome and material limitations honestly.

## Supporting resources

Use [landing-page-run.md](workflows/landing-page-run.md) for a compact execution route and [art-direction-audit.md](workflows/art-direction-audit.md) for review. Legacy filenames [aesthetic-archetypes.md](references/aesthetic-archetypes.md), [hero-architectures.md](references/hero-architectures.md), and [bento-grid-patterns.md](references/bento-grid-patterns.md) now explain how to avoid preset directions; none is a catalog to choose from.
