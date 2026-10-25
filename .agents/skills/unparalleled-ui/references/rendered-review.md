# Review what actually ships

Rendered review and task verification are separate obligations. A screenshot can reveal hierarchy, crop, rhythm, and overlap; it cannot prove keyboard behavior, a correct total, a working action, or a smooth transition. Source inspection cannot prove that the final page looks the way its author expects.

## Evidence to collect

Use the project's existing browser/test tools or an equivalent available tool. Do not require a particular vendor, package, shell permission mode, or GPU. If the runtime cannot render, report a source-only review and the missing visual evidence; do not invent screenshots or claim visual sign-off.

| Capture or walk-through | What it resolves |
| --- | --- |
| First settled frame and full page/work surface | Immediate identity, purpose, focal hierarchy, complete content, and whether later sections retreat into defaults. |
| A representative middle state and final action | Continuity of objects, actual functionality, completion feedback, and an honest exit. |
| Narrow phone around 320–390px, an intermediate width, and desktop | Recomposition, long-label wrapping, focus visibility, working controls, and unintended overflow. Use actual project targets when known. |
| A short laptop viewport around 1366×768 and a shorter height when pinning | Sticky content and controls fit together; headers and scenes do not trap the next action below the viewport. |
| Reduced motion and scene/media failure | Essential information and the primary action survive without the effect or asset. |
| Keyboard and touch task path | Names, focus order, activation, discoverability, manual control, and restoration of context. |
| Realistic content extremes | Long names, sparse or busy data, empty results, errors, loading, stale state, and zoom. |

Capture enough stable states to assess the concept; do not screenshot after every cosmetic change. Keep a short record of actual evidence and any blockers in the existing project artifact, rather than generating reports for their own sake. Private records and screenshots stay within the user's authorized workspace.

## Two kinds of critique

First judge the experience: can someone identify this product, understand what to do, and name a specific visual or behavioral idea that belongs to it? Does the composition have conviction? Is there enough real content? Does the same hand carry through later sections and work states? A generic result can pass accessibility checks and still fail this review.

Then judge reliability: does the task work, is data consistent, are actual composited colors readable, does motion preserve control, do media failures recover, and do the heaviest scenes behave on target devices? An impressive result can still fail this review.

## Corrections and finish

Rank concrete findings by impact. Correct a weak governing idea before tuning button radii; fix an inaccessible action before adding another transition. Apply a focused batch at the correct system level, then revisit the affected captures and task states. Do not repeatedly broaden testing once relevant checks pass without a new concern.

Scores are reviewer judgments with evidence, not conversion measurements, official award ratings, or proof that the work surpasses every reference. A high total cannot override a hard failure. Preserve discreet intentional irregularity when it adds character; defects in reading, state, facts, and functionality still require correction.

## Measurable access checks

Use [WCAG 2.2 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html): pointer targets should be at least 24×24 CSS pixels or satisfy its spacing/equivalent-control exceptions; aim around 44×44 for frequent touch controls when space permits. Tiny icon artwork can sit inside a larger hit area. Exceptions need a real reason, not a dense-screen excuse.

Verify [200% text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) without loss of content or function, and [reflow at 320 CSS pixels](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) without two-directional page scrolling except where meaning genuinely needs a two-dimensional layout, such as a data table. Keep that content in its own accessible region rather than making the entire page overflow. These checks complement, rather than replace, the applicable project's full accessibility requirements.
