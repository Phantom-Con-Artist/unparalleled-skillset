# Review the authored experience

Ask an independent reviewer to inspect the actual rendered result, source, product brief, direction contract, and verified evidence. Use the environment's available delegation tool rather than a fixed tool name. Request specific findings, locations, severity, score reasoning, and the smallest useful remedies. Read [rendered-review.md](rendered-review.md) for the evidence set. If visual or independent review is unavailable, disclose the actual review mode; do not claim a rendered sign-off.

| Criterion | Points | Evidence |
| --- | --- | --- |
| Product clarity and honest substance | 25 | The opening identifies the product, content answers real questions, the action is relevant, claims are supported, and writing feels human without banned habits. |
| Original visual world and craft | 25 | A particular idea shapes composition, substantial authored assets, distinctive readable type, palette, marks, and small details. No banned genre recipe. A merely tidy generic page loses points, and so does any unjustified card grid, kanban lane, pill shape, or stock SaaS/neon palette. |
| Journey, agency, and spatial continuity | 25 | The signature interaction belongs to the product, motion/2D/3D relations carry meaning, and identity persists after the opening through useful actions and return states. |
| Inclusive production delivery | 25 | The primary path works across input, responsive and short-height views, actual contrast, motion preference, loading/failure, and representative performance. |

At least 85/100 is the minimum gate. A flagship ambition should aim materially higher through actual evidence, not score inflation. A broken primary action, fabricated claim, inaccessible essential content, or unresolved explicit user-ban violation is a hard failure regardless of total. Do not invent per-category thresholds that contradict the overall gate.

Make the first substantive review about the experience and complete action path. Apply a focused correction batch and verify what changed. Fix concrete remaining hard failures; if the target is still missed, report the shortfall honestly rather than relabeling it a pass. When the direction is clear, relevant evidence passes, and remaining changes are matters of taste, finish. Do not add effects or smooth away all irregularity to chase a number.

## What to hand the reviewer

Give the reviewer the latest round of screenshots and `report.json` from [visual-review-loop.md](visual-review-loop.md), the direction contract or surface brief, and the URL or file so they can capture their own views. Ask them to open the images, not summarize the report. Ask for at most seven ranked findings, each with location, severity, evidence and the smallest fix, not a transcript. Begin by having the reviewer write the strongest case that the work is generic or unsupported, then test that case against what they see.

## Reviewer request

“Inspect this website against the brief, direction contract, and Unparalleled Website references. Review the actual opening, complete journey and action, narrow/intermediate/desktop and short-height states, and input/motion/failure paths where tools permit. Score the four criteria with evidence and report hard failures separately. Check originality beyond the hero, the generic shapes in generic-tells.md, writing, type, palette, icons, assets, and truthful capabilities. Do not replace the concept with your favorite genre. Identify the smallest consequential corrections.”

## Score calibration

Score each 25-point criterion by the behavior observed, then explain it. Pick the highest band whose every anchor you actually saw. A band does not certify an outcome, and a state you did not open scores as unverified, not as passing.

| Criterion | 0–9 | 10–17 | 18–21 | 22–25 |
| --- | --- | --- | --- | --- |
| Product clarity and honest substance | With the wordmark hidden, the opening does not say what is sold or done; claims are invented or unsourced. | Product identifiable; copy is interchangeable or leans on buzzwords; some numbers, names or quotes have no source in the record. | Every claim traces to a recorded fact; copy answers real questions; one named gap, such as thin later segments. | A stranger states the product and the next action from the first frame; every claim traces to a fact id; copy is specific throughout; limits are stated plainly. |
| Original visual world and craft | A template or genre recipe: card rows, pill kit, stock palette, default sans identity. | Some choices cite facts, the rest are defaults; swapping in a competitor's name leaves composition and behavior intact. | The premise shapes composition and tokens, and the swap breaks the opening; later segments drift back toward a template. | The swap breaks composition, content and behavior throughout; major tokens trace to facts; loaded fonts match the specified ones; assets are authored or honestly sourced. |
| Journey, agency and continuity | The interaction is decorative or missing; the premise disappears after the opening; scroll is hijacked. | The decisive interaction works with a pointer only, or persists into one later segment only. | Works by pointer, keyboard and touch and persists into a later segment; one failure or return state untested. | Persists to the final action; interruptible and reversible; the static path carries the same information; failure and return states were exercised. |
| Inclusive production delivery | The primary path fails at a viewport or input; contrast unmeasured or failing. | Works on desktop; narrow, short-height, reduced-motion or failure paths unchecked or flawed. | Required captures opened and measured pairs pass; one performance or state gap named. | All viewports, inputs, reduced motion and asset failure exercised; measured pairs pass; budgets measured on a representative device or honestly estimated and labeled. |

Do not score uninspected states as verified. Distinguish a requested integration that remains blocked from a deliberately frontend-only scope with a tested adapter. State the scope and remaining delivery limit; never conceal an unconfigured service behind a polished success screen. Hard failures remain authoritative regardless of arithmetic.

## Regression and approval evidence

Review against the approved specimen revision and decisions in [design-collaboration.md](design-collaboration.md). Request the findings ledger and matched before/after captures. Inspect palette/gradient provenance, actual loaded fonts, spacing relationships, shapes, icon purpose, claim-specific copy, keyboard focus and motion meaning using [anti-slop-invariants.md](anti-slop-invariants.md). A generic direction or drift from the approved experiment is a major finding; clean DOM heuristics do not erase it. Report blockers/majors separately and require their retest before sign-off. A score never supplies user approval or proves an uninspected state.
