# Design measurements: calculate, inspect, refine

Numbers support judgment. Distinguish **hard acceptance criteria**, **project budgets** and **starting heuristics**. Record sources and actual values. No mathematical ratio guarantees beauty, legal compliance, usability or universal harmony.

## Palette generation and evaluation

Start with product/brand evidence, assign semantic roles, then explore a supported harmony: analogous, complementary, triadic or monochromatic. Inspect hue relationships in a named color space; equal numeric hue angles across HSL, CIELAB and OKLCH are not interchangeable. Tune perceptual lightness/chroma in OKLCH, check gamut, and measure final composited sRGB colors for WCAG.

Consider these named models as research methods, not authorities that override the task:

| Method | Proper use and limits |
| --- | --- |
| Ou–Luo two-color harmony model | Consult the original 2006 paper linked in [sources](professional-design-sources.md). It models pairwise judgments under specific experimental conditions. To claim its score, obtain the actual equations, coefficients, CIELAB conversion and viewing assumptions; verify a reference case. Never replace it with hue distance and call that Ou–Luo. If equations are inaccessible, report `not computed` and use clearly labeled local diagnostics. |
| Matsuda templates / Cohen-Or et al. harmonization | Explore rotating hue-template constraints for an image/palette. Record template, hue space, rotation, chroma weighting and fitting error. This is not a universal website preference score; preserving source/brand colors may matter more. |
| Munsell and Moon–Spencer | Explore hue/value/chroma relationships and historical harmony hypotheses. Identify the exact source and coordinate system. Do not treat Munsell notation as HSL or invent a combined formula. |

Evaluate and refine the selected candidate using `node scripts/score-palette.mjs --input <palette.json>` from the skill directory. Its output is a **local target-fit score**, not any published harmony formula. Input has `colors: [{name, hex, weight}]`, `pairs: [{name, fg, bg, req}]` and project-specific `targets: {luminanceRange: [min,max], saturationMean: [min,max], hueDiversity: [min,max], hueSeparation: [min,max]}`. Use nonnegative area estimates summing to one for weights; pairs use final opaque `#RGB`/`#RRGGBB` and req 3, 4.5 or 7. Define targets before optimizing and explain their product rationale. Luminance is WCAG relative luminance (0–1), saturation is HSL S (0–1, a limited diagnostic), hue diversity is area-weighted circular dispersion (0–1) of chromatic HSL hues, and hue separation is mean pairwise shortest angle (0–180 degrees). Achromatic colors have no useful hue and are excluded from hue metrics. Monochrome does not need high diversity.

Record raw diagnostics alongside scores for harmony-hypothesis fit, luminance range, saturation balance and hue diversity. Each fit score is 100 in its declared target interval and decreases with distance outside it; all metrics have equal weight. The aggregate is only a local comparison aid. Set a justified target in the kit rather than using a universal beauty threshold. All contrast pairs must pass independently; a high fit score cannot compensate. The tool cannot measure semantic differentiation, palette area in screenshots, perceptual preference or full accessibility.

Loop: render candidate on actual content -> measure pairs and diagnose role/area/lightness/chroma conflicts -> change the responsible token -> rerun and recapture the same states. Compare with the approved kit. Stop when hard checks pass, the agreed target fits and rendered review supports the choice. If targets push the palette away from brand/task or repeated edits stop improving it, reconsider targets or the palette with evidence and return to human review when identity changes. Never loop indefinitely or silently weaken hard criteria.

60–30–10 is an optional starting area distribution, not perfect balance. Dominant backgrounds need not be neutral; secondary roles and accent allocations follow actual content and states. Avoid forcing warning/error/focus into the CTA hue. Estimate visible areas from representative views; do not claim a token count measures proportions.

## Typography

Calculate candidate steps with `size(n) = base * ratio**n`; round final steps, not intermediates. Golden ratio 1.618 is a desktop candidate, not a universal requirement. At 16px, steps 0–3 round to 16, 26, 42, 68px; at 18px they round to 18, 29, 47, 76px. A 20/22px subtitle from `base*1.25` is an intentional intermediate step, not a golden-ratio step. Semantic heading levels follow document structure, not a mandated size mapping.

For narrow screens evaluate 1.333 (perfect fourth): 16, 21, 28, 38px at steps 0–3. Dense UI may need closer steps at every width. Record chosen endpoints, base, ratios and optical exceptions from real strings. Interpolate with a rem-based `clamp()` including a rem term; inspect zoom and wraps rather than shrinking essential copy. Start body leading around 1.5–1.6 and display leading around 1.1–1.2; tune to the actual face/script and prevent collisions. Start long reading copy near 45–75 characters per line; labels, tables and non-Latin scripts have different needs.

Hard AA text contrast: 4.5:1 ordinarily, 3:1 for at least 24 CSS px regular or about 18.67 CSS px bold. Bold alone never qualifies. Meaningful control boundaries/graphics need applicable 3:1 non-text contrast; color must not be the only signal. WCAG is a technical standard, not a blanket statement about the law in every jurisdiction. Test actual compositing, focus, hover, selection and worst image/video frames. Do not round a failing contrast ratio up to a pass.

## Layout, responsiveness and hierarchy

Use an 8px macro-spacing scale as a candidate; 4/2px substeps and justified optical corrections support small controls and glyphs. Define relational tokens for inside a group, between groups and sections. Do not force every height/margin onto 8px when text growth, accessibility or the product requires otherwise.

A 12-column grid is one useful divisible structure, not the universal industry standard. Choose columns and breakpoints from actual content; CSS Grid, flex and subgrid can express intrinsic layouts. [Malven Grid](https://grid.malven.co/) is a visual property reference, not evidence for a compulsory grid. F-shaped scanning is an observed behavior in certain text contexts, not a layout goal. Z is a compositional hypothesis; test the actual attention/action path, including right-to-left reading. Do not position a CTA solely at an imagined letter endpoint.

Start new responsive work at about 375px, also test 320px, then expand to real tablet/desktop/short-height tasks. Existing desktop-heavy software still needs its main working situation tested early. Keep useful orientation and a primary action visible when feasible; 700–800px is a test viewport range, not a universal fold. Never crush content to make an arbitrary hero fit. Preserve reading and keyboard order when rearranging visually.

## Motion and performance

Start feedback around 100–300ms and tune to distance/task; immediate acknowledgement may be appropriate. Decelerating entry and accelerating exit are useful candidates; record actual Bezier curves or spring parameters and test interruption/reversal. Linear motion is valid for constant-speed progress, a clock or intentional mechanical movement. Avoid `transition: all` and unsupported claims that Disney principles prescribe one web timing. Narrative transitions and kinetic-text reading holds may take longer than control feedback.

Replace a vague three-second guarantee with budgets and measurement: good Core Web Vitals targets are LCP <=2.5s, INP <=200ms and CLS <=0.1 at the 75th percentile of field visits, assessed separately. Label local lab results as lab results; a Lighthouse run is not field INP. Choose image/video/geometry/JS/font budgets for the actual audience. Use responsive AVIF/WebP when suitable (including alpha if supported), preserve necessary transparency and compare quality/bytes. Reserve media dimensions, avoid lazy-loading the LCP asset, and lazy-load suitable below-fold media. Include reduced-motion/static and renderer-failure paths.
