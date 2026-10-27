# Review a working product, not a decorative screen

For a full new UI or overhaul, ask an independent reviewer to inspect the rendered surface, its brief, real or labeled demo data, and a complete task path. Use available delegation tools. If only self-review or source inspection is possible, disclose that limitation and do not claim independent visual verification. Scale narrow refinements to the affected surface and behavior.

| Criterion | Points | Evidence |
| --- | --- | --- |
| Product and task clarity | 25 | The screen answers the main question and makes the correct next action legible, with complete useful content. |
| Distinctive system craft | 25 | A specific identity, purposeful hierarchy, readable type, bespoke meaningful marks, consistent detail, and no banned recipe. |
| Operational integrity | 25 | Correct data, scope, complete states, selection/edit continuity, feedback, recovery, and an end-to-end working path. |
| Inclusive delivery | 25 | Keyboard/touch use, real contrast, responsive composition, motion preference, asset/runtime failure, and reliable performance. |

At least 85/100 is the minimum review gate. A flagship brief should aim materially higher through evidence, not score inflation. Broken main actions, false data/claims, inaccessible essential tasks, and unresolved explicit user-ban violations are hard failures regardless of the total. A tidy generic dashboard can meet many checks and still lose substantial points in distinctive system craft, including any unjustified card grid, kanban lane, pill shape, or stock SaaS/neon palette.

Review the first substantive version, apply a focused correction pass, and verify the changed task and states. Fix concrete remaining hard failures. When the direction is coherent, checks pass, and the remaining alternatives are subjective taste, finish. Do not add effects or disguise data to chase a number.

## What to hand the reviewer

Give the reviewer the latest round of screenshots and `report.json` from [visual-review-loop.md](visual-review-loop.md), the direction contract or surface brief, and the URL or file so they can capture their own views. Ask them to open the images, not summarize the report. Ask for at most seven ranked findings, each with location, severity, evidence and the smallest fix, not a transcript. Begin by having the reviewer write the strongest case that the work is generic or unsupported, then test that case against what they see.

## Reviewer request

“Inspect the supplied UI against its product/task brief and Unparalleled UI references. Walk the main task and inspect relevant states at narrow, intermediate, and short-height desktop sizes. Score the four rubric areas with evidence and report hard failures separately. Check the generic shapes in generic-tells.md, data consistency, continuity, writing, type, palette, icons, and accessible operation. Identify the smallest consequential fixes without substituting your preferred visual genre.”

## Score calibration

Score each 25-point criterion by the behavior observed, then explain it. Pick the highest band whose every anchor you actually saw. A band does not certify an outcome, and a state you did not open scores as unverified, not as passing.

| Criterion | 0–9 | 10–17 | 18–21 | 22–25 |
| --- | --- | --- | --- | --- |
| Product and task clarity | The screen does not show what it decides; data is fabricated or unlabeled. | The task is visible but needs hunting; labels are generic; demo data is labeled. | The main question is answered and the next action is clear; secondary states are thin. | A user states the main question and next action in seconds; all content is real or labeled demo data; hierarchy follows the task. |
| Distinctive system craft | KPI-card shell, stock palette, default type, generic icons. | Identity in the shell, defaults in the components. | Type, colour and marks derive from the product; one component family is inconsistent. | The signature repeatedly improves the task; tokens trace to facts; swapping the product name breaks the screen. |
| Operational integrity | The primary task cannot be completed, or totals disagree with the data shown. | The happy path completes; empty, error or stale states are missing or unlabeled. | Selection and edit context survive; recovery works; one state untested. | The task completes with undo, error recovery, and busy, sparse and long data; counts derive from the data shown. |
| Inclusive delivery | The primary task fails by keyboard or touch, or at a size; contrast unmeasured or failing. | Works at desktop; keyboard, narrow, zoom or failure paths unchecked or flawed. | Required captures opened, measured pairs pass, keyboard path walked; one gap named. | Keyboard, touch, 320px, text zoom, reduced motion and asset failure exercised; measured pairs pass; performance measured or honestly labeled estimate. |

Do not score uninspected states as verified. Distinguish a requested integration that remains blocked from a deliberately frontend-only scope with a tested adapter. State the scope and remaining delivery limit; never conceal an unconfigured service behind a polished success screen. Hard failures remain authoritative regardless of arithmetic.

## Regression and approval evidence

Review against the approved specimen revision and decisions in [design-collaboration.md](design-collaboration.md). Request the findings ledger and matched before/after captures. Inspect palette/gradient provenance, actual loaded fonts, spacing relationships, shapes, icon purpose, claim-specific copy, keyboard focus and motion meaning using [anti-slop-invariants.md](anti-slop-invariants.md). A generic direction or drift from the approved experiment is a major finding; clean DOM heuristics do not erase it. Report blockers/majors separately and require their retest before sign-off. A score never supplies user approval or proves an uninspected state.
