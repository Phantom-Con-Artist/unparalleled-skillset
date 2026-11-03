# Design/Brand Kit: the governing design specification

A kit is the revisioned set of aesthetic and experience rules that confines this product's website/UI. It is not a moodboard, an asset folder or a generic theme. The main agent owns it after accepting the prompt architect's handoff. Every consequential design choice must trace to the kit; material changes update the kit and return to human review before dependent development.

## Discover and interview

Read the product, existing brand, code, content and supplied references first. Ask only unanswered questions that change the result: audience and task, offer and evidence, brand philosophy and desired impression, existing commitments, examples liked/disliked and why, preferred 2D/3D/hybrid route, motion graphics/kinetic text/audio, illustrative emphasis, assets, device constraints and performance needs. Recommend concrete choices when the human has no preference. Do not make them invent an aesthetic genre or repeat the intake interview. Record facts, assumptions and unresolved decisions separately. Resolve consequential ambiguity before locking the kit.

## Build the vocabulary first

Collect relevant objects, processes, materials, verbs, relationships, environments and user language from actual evidence. For each useful term record `source -> product meaning -> design consequence -> check`. Select only terms that change composition, imagery, geometry, color, type or behavior. No quota or fabricated product lore. A competitor-name swap should expose where the vocabulary is interchangeable.

## Required kit decisions

Use [the kit template](../templates/brand-kit.template.md) inside the existing direction document, or `brand-kit.md` when it has no suitable home. Keep one canonical kit and link it from `design-contract.json`.

| Area | Binding decisions and evidence |
| --- | --- |
| Product and philosophy | Audience, offer/task, main action, truthful proof, brand commitments, vocabulary and governing relationship. |
| Typography | Actual licensed/available families, scripts, weights, fallbacks, real-string specimens, calculated responsive scale, leading, tracking, reading measure and numeral behavior. |
| Color and backgrounds | Product sources, source/semantic/component tokens, harmony hypothesis, proportions, hue/chroma/lightness diagnostics, actual contrast pairs, foreground/background behavior on image/video/gradient frames. |
| Geometry and components | Choose pills, rounded, square, circular, cut or asymmetric forms dynamically from brand, product, control meaning and content. Define per-role shape/radius, border, depth, hit area, focus and state rules. No universal pill ban, square default or compulsory novel geometry. |
| Layout and spacing | Structure of each meaningful component/section, alignment, grouping, reading order, density, responsive transformations, named spacing tokens and optical exceptions. |
| UX and content | Complete journey/task, navigation, action and recovery, keyboard/touch, empty/error/pending/disabled states, honest human copy and visual explanation. Prefer illustration/demonstration where it explains better; keep essential instructions, labels and accessible text. |
| Assets and illustration | Needed/existing/new assets, purpose, placement, composition, dimensions, crop, transparent background when needed, rights/source, delivery formats and fallback. Invoke an available imagegen or imagen skill for required generated raster assets; inspect outputs at placement size. Use SVG/code for suitable vector work. Never present generated product details as verified truth. |
| Pipelines | Explicit 2D/3D/hybrid and framework recommendation with one credible alternative; user choice wins. Link the applicable 2D, 3D, image and motion-graphics references. Respect Blender research/MCP prerequisites. |
| Motion | Trigger, meaning, timings/easing, interruption/reversal, animation states, kinetic text reading windows, real audio cue map when used, reduced-motion/static equivalents and media/runtime budgets. |
| Acceptance | Project-specific palette score targets, hard accessibility checks, representative scenes, viewport/DPR/zoom tests, performance budget, review milestones and evidence locations. |

Read [design measurements](design-measurements.md) before choosing numbers and [professional sources](professional-design-sources.md) when researching methods. A palette or spacing scale is never selected solely to satisfy a score.

## Constrain execution without freezing correction

First create a small live kit preview showing actual words, color roles, component shapes/states, spacing, background/foreground and a representative illustration/motion sample. Run the inner Playwright review before presenting it. This preview supports brand decisions; the later task/site specimen still proves the decisive relationship. Mark experimental or missing assets honestly.

Run the outer human review on the kit and consequential design choices. Record exact feedback, revised choices, artifact/revision and explicit approval or a scoped waiver. Do not treat a compliment, silence or a score as approval. Keep refining affected choices until approved; continue independent research while waiting. Build the representative specimen from that approved kit, then progressively develop approved slices through the same two loops in [design collaboration](design-collaboration.md).

Routine implementation/accessibility fixes within approved rules do not require another brand interview. If measurement reveals an inaccessible approved pair, repair it and explain the smallest visual change; human approval cannot waive access failures. If the identity changes materially, revise the kit and show it before dependent work. Local fixes inherit the current kit and check only affected rules.
