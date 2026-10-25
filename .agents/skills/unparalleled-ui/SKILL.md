---
name: unparalleled-ui
description: >-
  Design and engineer application screens, SaaS dashboards, data tables, forms, settings,
  and component systems with task clarity, distinctive type, bespoke icons, semantic tokens,
  accessible keyboard use, and complete interaction states. Use for software people work in;
  for public websites and scroll-driven product stories, use unparalleled-website instead.
---

# Unparalleled UI

Build an instrument people can work in for hours. Begin with the user's task, actual data, information hierarchy, and existing component system. Preserve established brand and interaction conventions unless the user asks to change them.

## Design and writing contract

No emoji decoration, visible bullet-point feature inventories, stock icon tiles, buzzword writing, em-dash spam, or generic sans-serif visual identities. Use meaningful bespoke SVG marks, humane product-specific language, and distinctive readable type. Keep native symbols and familiar control meanings recognizable. Semantic lists remain appropriate for navigation, options, and assistive technology; the ban concerns visible bullet presentation and lazy inventories, not HTML semantics.

Do not introduce glassmorphism, neumorphism, skeuomorphism, claymorphism, editorial/luxury styling, brutalism, bento-first SaaS, or a clone of another application's aesthetic. Do not apply stock purple/blue gradients, slate/neon kits, cream/terracotta/sage kits, or arbitrary fashionable color scales. Derive roles from the product, real data, and existing identity. Explicit user and established brand requirements take precedence. Tools such as grids, shadows, serif type, and perspective remain available without adopting a genre recipe.

Read [human-writing.md](references/human-writing.md), [bespoke-icons.md](references/bespoke-icons.md), and [ui-tokens.md](references/ui-tokens.md) for the shared craft requirements. Permit deliberate, discreet irregularity in noncritical decoration when it adds character; keep controls, data alignment, contrast, and reading order precise. Do not pursue endless cosmetic perfection.

## Workflow

### Understand the task

Identify what the user must accomplish, which information matters, and which states the system can occupy. Read existing code and assets. Choose a shell suited to this task rather than automatically adding a sidebar, KPI row, and table. Consult [app-screen-patterns.md](references/app-screen-patterns.md) as structural guidance, not a visual template.

### Establish the language

Choose a documented typeface with product-specific character rather than Inter, Geist, Roboto, Arial, Helvetica, or a system stack as the authored identity. A distinctive sans requires a specific rationale; robust system fallbacks remain valid. Verify availability, license, scripts, numerals, small labels, and loading behavior. Derive semantic colors and spacing from the product and readable information density. Use calculated `clamp()` scales where responsive type is useful without shrinking dense data below readable sizes.

### Build complete interactions

Every interactive control must handle default, hover, pressed/active, focus-visible, and disabled states where meaningful, plus selected, loading, error, empty, and success states required by the workflow. Use native disabled behavior where appropriate; `aria-disabled` alone does not block activation. Honor reduced motion and make useful feedback visible without motion or color alone. Read [component-states-contracts.md](references/component-states-contracts.md).

Use [data-density-tables.md](references/data-density-tables.md) for alignment and numerical reading, [form-engineering.md](references/form-engineering.md) for validation, and [keyboard-nav-a11y.md](references/keyboard-nav-a11y.md) for focus and input. Blend 2D/3D only when it helps a real spatial task; long scroll stories belong in the website workflow, not in routine application actions.

### Verify and finish

Use semantic HTML, accessible names, logical focus, keyboard operation, and touch alternatives. Test the real primary workflow, actual contrast, loading and failure states, and responsive behavior. Body text needs at least 4.5:1; qualifying large text and meaningful UI boundaries need 3:1. Sample contrast fixtures are not proof of a screen's accessibility. Use `scripts/check-contrast.mjs --pairs <pairs.json>` for measured opaque sRGB pairs and inspect compositing in the browser.

Run `npm run validate-all` and `npm run check-contrast` when working in this repository. Review the actual screen with [audit-ui-accessibility.md](workflows/audit-ui-accessibility.md). Fix concrete defects, make one focused craft pass, and finish when the workflow is usable and coherent.
