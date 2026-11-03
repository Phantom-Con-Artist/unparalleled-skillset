# Website run

Follow the state machine in [SKILL.md](../SKILL.md) in order: intake, product, design, design review, build, verify, human review, deliver. Keep state in `design-contract.json`, check each transition with `node scripts/check-contract.mjs --gate design|build|deliver`, and use the [checkpoint note](../templates/execution-checkpoint.template.md) for what the record cannot hold. Full rules: [execution-contract.md](../references/execution-contract.md). A local refinement inherits product.md and design.md and starts at build.

## 1. Intake

Invoke the prompt architect subagent with the exact request ([prompt-intake-handoff.md](../references/prompt-intake-handoff.md)). Check its high-performance prompt against the raw words; `node scripts/structure-prompt.mjs` assists extraction only.

## 2. Product

Write [product.md](../references/product-md.md): what is offered, to whom, the main action, verified proof, real content and assets, brand commitments, the closest competitors, gaps and vocabulary. Read [brief-vocabulary.md](../references/brief-vocabulary.md) to sort quality words from literal ones.

## 3. Design

Write design.md in the fixed order with [design-md.md](../references/design-md.md) and the [intelligence files](../references/intelligence/README.md):

1. **Premise**: the product truth and the experimental relationship that makes it tangible ([experimental-direction.md](../references/experimental-direction.md)); swap test and counter-argument.
2. **Brand personality**: trait pairs and tone, mapped to every discipline.
3. **Color**: through the Color Intelligence Layer; certificate and measured pairs.
4. **Typography**: faces, pairing and the fluid scale in real strings.
5. **Spatial, layout and negative space**: grid, spacing scale, proximity ratio, one focal point per view, noise budget.
6. **Visual assets**: [2D](../references/pipeline-2d.md) and [image generation](../references/image-generation-direction.md), or [3D](../references/pipeline-3d.md) with [3D website references](../references/website-3d-references.md) and verified Blender MCP; [motion graphics](../references/pipeline-motion-graphics.md) when used.
7. **Components, UX/IA, responsive, motion, accessibility, conversion**, then **stack** ([framework-selection.md](../references/framework-selection.md)).

Build design.html: the system plus a representative first frame and later segment with the decisive interaction working. Run the inner loop: `check-design-sync.mjs`, `capture.mjs`, measured pairs, repair.

## 4. Design review

Present design.html per [design-collaboration.md](../references/design-collaboration.md). No → refine design.md, tokens, design.html. Yes → record the human's words; `--gate build` must exit 0.

## 5. Build

Carry the approved grammar through real content, navigation, supporting segments, complete states and the final action ([experience-engineering.md](../references/experience-engineering.md), [narrative-structure.md](../references/narrative-structure.md)). Preserve native scrolling, semantics, input alternatives and static fallbacks. Never retreat silently to a conventional layout; a material change returns to design.

## 6. Verify

`check-design-sync.mjs --out` against the built site; the full [visual-review-loop.md](../references/visual-review-loop.md) (all widths, short laptop, reduced motion, every image opened, real scroll stops and actions); measured pairs ([rendered-review.md](../references/rendered-review.md)); independent review ([subagent-review-rubric.md](../references/subagent-review-rubric.md)). A mismatch with design.md means the build drifted: fix the build and recheck. No unresolved blocker or major may be scored away.

## 7. Human review and delivery

Present the complete journey at the current revision. Feedback returns to build. Deliver when `--gate deliver` passes, reporting with [client-report.template.md](../templates/client-report.template.md) and honest limits.
