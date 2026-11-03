# One-prompt application run

Follow the state machine in [SKILL.md](../SKILL.md) in order: intake, product, design, design review, build, verify, human review, deliver. Keep state in `design-contract.json`, check each transition with `node scripts/check-contract.mjs --gate design|build|deliver`, and use the [checkpoint note](../templates/execution-checkpoint.template.md) for what the record cannot hold. Full rules: [execution-contract.md](../references/execution-contract.md). A local fix inherits product.md and design.md and starts at build.

## 1. Intake

Invoke the prompt architect subagent with the exact request ([prompt-intake-handoff.md](../references/prompt-intake-handoff.md)). Check its high-performance prompt against the raw words; `node scripts/structure-prompt.mjs` assists extraction only.

## 2. Product

Write [product.md](../references/product-md.md): the real person, task, main question, data scope (with representative real or labeled demo records), error consequences, existing identity, gaps and vocabulary.

## 3. Design

Write design.md in the fixed order with [design-md.md](../references/design-md.md) and the [intelligence files](../references/intelligence/README.md). For app screens, weight these decisions:

- **Color**: run the Color Intelligence Layer with the real body size; extend roles to selection, focus, status and disabled, and certify every pair with `analyze_palette` usages.
- **Typography**: tabular numerals for data, a compact scale, labels that stay readable at density.
- **Spatial and negative space**: shell from the task (list-detail, canvas-inspector, form), not a reflexive dashboard; density per surface with a noise budget ([tables and density](../references/data-density-tables.md)).
- **Components**: full state tables; forms with visible labels, linked errors and preserved input.
- **UX/IA**: the primary task, its recovery path, and context preserved across navigation ([premium-workflows.md](../references/premium-workflows.md)).
- **Stack**: [framework-selection.md](../references/framework-selection.md); declare 2D/3D/hybrid and pipelines.

Build design.html with the primary task working on consistent data and one failure state. Run the inner loop: `check-design-sync.mjs`, `capture.mjs`, measured pairs, repair.

## 4. Design review

Present design.html per [design-collaboration.md](../references/design-collaboration.md). No → refine design.md, tokens, design.html. Yes → record the human's words; `--gate build` must exit 0.

## 5. Build

Implement in slices on shared tokens and components: primary task and recovery first, then selection and edit continuity, truthful counts and charts ([visualization](../references/data-visualization.md)), complete states, keyboard and touch. Motion follows [interaction choreography](../references/interaction-choreography.md) and [motion.md](../references/intelligence/motion.md). Do not turn ordinary tasks into marketing choreography.

## 6. Verify

`check-design-sync.mjs --out` against the built screens; [visual-review-loop.md](../references/visual-review-loop.md) at narrow, intermediate, desktop and short-height sizes and reduced motion; busy, sparse, long and failed data; text zoom; keyboard task runs; measured pairs ([rendered-review.md](../references/rendered-review.md)); independent review ([quality-review.md](../references/quality-review.md)). `npm run check-contrast` tests reference fixtures only. A mismatch with design.md means the build drifted: fix the build and recheck.

## 7. Human review and delivery

Present the complete task at the current revision. Feedback returns to build. Deliver when `--gate deliver` passes, reporting with [client-report.template.md](../templates/client-report.template.md). A tidy empty shell is not a crafted product, and a high score cannot excuse false data or a broken task.
