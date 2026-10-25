---
name: unparalleled-ui
description: >-
  Use when building, redesigning, or polishing application UI people work in: dashboards,
  editors, data tables, forms, settings, inboxes, admin views, or complex workflows, and
  whenever an app screen looks generic, templated, card-heavy, or AI-made. Use
  unparalleled-website instead for public pages and marketing stories.
---

# Unparalleled UI

Design a product instrument with a recognizable point of view and exceptional everyday use. Premium software earns its character through precise information, well-judged density, trustworthy response, personal detail, and a coherent system. A beautiful empty shell, a cinematic dashboard entrance, or a themed component kit is not the outcome.

## One prompt, complete working UI

A sufficient brief authorizes analysis, reversible design decisions, implementation, and verification within scope. Ask only for missing information that materially affects a real workflow, truthful data, or a fixed constraint. Otherwise record assumptions and proceed. Do not require an interview, aesthetic tournament, or extra “proceed” to make the work concrete.

For refinement, preserve the established identity and workflow. For an authorized overhaul, replace the visual world while retaining product truth, useful behavior, accessible conventions, and explicit brand commitments. A missing design document does not erase an existing identity. Do not turn a local change into a redesign of unrelated surfaces.

## Shared craft contract

Read [craft-foundation.md](references/craft-foundation.md) for the synthesis of Impeccable, Awwwards, and Taste. Classify each surface by purpose. Most application screens are worked in; onboarding, previews, documentation, and a spatial canvas may need different attention rules. Express ambition through the work itself rather than importing marketing choreography.

No emoji decoration, visible bullet-point content inventories, stock icon tiles, buzzword writing, em-dash spam, generic sans-serif identities, or stock palettes. Use [human-writing.md](references/human-writing.md), [bespoke-icons.md](references/bespoke-icons.md), and [ui-tokens.md](references/ui-tokens.md). Keep semantic lists for navigation, options, records, and assistive technology. Familiar control meanings remain recognizable.

Do not impose glassmorphism, neumorphism, skeuomorphism, claymorphism, other genre recipes, editorial/luxury styling, brutalism, bento-first SaaS, or a recognizable competitor clone. No default purple/blue AI gradients, indigo primary buttons, slate/neon kits, cream/terracotta/sage kits, or fashionable color scales, and no neon aesthetics unless the user asks. Explicit user choices and established identity take precedence.

Do not compose screens from cards, kanban lanes, or pills. A KPI-card row, a grid of bordered rounded tiles, columns of stacked cards used as decoration, and fully rounded buttons, badges, chips, and filters are the shapes of a generated dashboard. Group information by alignment, rules, type, and space; frame a region only when it is a genuinely separate object, such as one record's detail beside its list. Build a real board only when the product is a board tool and the user wants one. [generic-tells.md](references/generic-tells.md) shows the pattern in a real example. Grids, shadows, serif type, and spatial rendering remain useful primitives; their relationship must serve the product.

A discreet irregularity may add character in a noncritical mark or illustration. Data alignment, measurements, control semantics, contrast, and focus stay dependable. Do not pursue endless cosmetic perfection or confuse an empty, quiet screen with a crafted one.

## Execution

### Understand the person, task, and evidence

Read the brief's words with [brief-vocabulary.md](references/brief-vocabulary.md): "bespoke" and "handcrafted" mean precise product-specific craft, not handwriting or sketch textures, and a named 2D or 3D dimension is a constraint. Read existing code, representative screens, real records, constraints, and assets. State the screen's main question, primary task path, important decisions, data scope, and consequences of errors. Identify information that must be visible without interaction. Use [app-screen-patterns.md](references/app-screen-patterns.md) to derive a task-specific shell rather than automatically adding a sidebar, KPI row, chart, and table.

### Commit a product-specific direction

For a new surface or overhaul, write a compact surface brief using [surface-brief.template.md](templates/surface-brief.template.md), or extend the existing project design record. Specify composition, information hierarchy, type behavior, palette evidence, bespoke marks, useful interaction, complete states, and phone behavior. Read [premium-workflows.md](references/premium-workflows.md). Compare materially different structures when the task is open; preserve a settled structure for a narrow refinement. A full specimen gallery is not a gate for ordinary UI work.

Choose a particular advantage in using this product: a comparison that preserves context, an editing tool that shows consequences, a selection that makes related data intelligible, or a genuinely spatial inspection. The signature must improve the task and stay useful on repeated use. Do not add a quirky gesture merely to be unique. Apply the competitor-swap test to the hierarchy and behavior as well as appearance.

### Establish and build the language

Choose distinctive readable type for actual labels, paragraphs, languages, figures, and long values. Do not author the identity with Inter, Geist, Roboto, Arial, Helvetica, or a default system stack. A distinctive sans needs a rationale based on its forms; serif and monospace are not automatic substitutes. Preserve explicit brand fonts and keep robust loading fallbacks. Use [asset-direction.md](references/asset-direction.md) when real product imagery, models, or other authored material contributes to the task.

Use semantic roles and shared components, data-driven counts and totals, a consistent numerical reading system, and density matched to the actual account. Do not present missing, stale, zero, empty, loading, and error data as interchangeable. Read [data-density-tables.md](references/data-density-tables.md) and [data-visualization.md](references/data-visualization.md) when applicable.

### Engineer the complete interaction

Controls need default, hover, pressed/active, focus-visible, and disabled behavior where applicable, plus the loading, selected, expanded, error, success, and recovery states required by the workflow. Preserve filter, selection, scroll, editing, and undo context where the task warrants it. Read [component-states-contracts.md](references/component-states-contracts.md), [form-engineering.md](references/form-engineering.md), and [keyboard-nav-a11y.md](references/keyboard-nav-a11y.md).

Make state changes feel connected and immediate; animate only when it clarifies identity, hierarchy, progress, or consequence. Keep feedback interruptible. Use [interaction-choreography.md](references/interaction-choreography.md) for 2D/3D inspection, transitions, and input alternatives. Spatial tools can be ambitious; ordinary forms must not inherit a long cinematic journey. If building a public page and app together, share the product's identity while using the website skill for its story and this skill for its working internals.

### Inspect the complete work and finish

Run the screenshot loop in [visual-review-loop.md](references/visual-review-loop.md) as soon as one complete task path renders, and again after each correction batch. Use a connected Playwright tool or `node scripts/capture.mjs`, which installs Playwright for itself with `--install`. Open every screenshot, fix the most consequential findings at their source, recapture, and compare. Stop when a round finds nothing consequential and every flag in the capture report is removed or justified in writing.

Walk the primary task with real or explicitly labeled, internally consistent demo data. Inspect the actual rendered opening, busy work surface, important states, phone, intermediate width, short laptop screen, long labels, and text zoom. Test keyboard, touch, motion preference, loading failures, stale data, and recovery. Use [rendered-review.md](references/rendered-review.md) and [audit-ui-accessibility.md](workflows/audit-ui-accessibility.md).

Measure actual text/background pairs at 4.5:1 for ordinary text and 3:1 for qualifying large text and meaningful UI graphics. The supplied contrast fixtures do not certify a screen. Run relevant product tests and the skill checks when working in this repository. For a full original surface or overhaul, obtain independent review through [quality-review.md](references/quality-review.md); for a narrow refinement, review the affected path proportionally. Fix concrete issues at their system source, perform a focused craft pass, reinspect changes, and finish with honest evidence.
