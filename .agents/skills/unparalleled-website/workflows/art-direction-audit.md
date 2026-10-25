# Workflow: Art Direction & Quality Audit

Use this checklist to grade any landing page or website before marking the task complete:

---

## 1. Visual Distinction (Anti-Slop)
- [ ] Does this page look like a custom-designed Awwwards Site of the Day, or does it look like an AI template?
- [ ] Is there an absence of generic 3-card icon rows and blurry purple gradients?
- [ ] Is the primary accent color applied with restraint?

## 2. Typographic Craft
- [ ] Are headlines scaling fluidly with `clamp()` on all viewport widths?
- [ ] Is display headline tracking tight (`-0.03em`)?
- [ ] Do body paragraphs respect readability boundaries (`max-width: 60ch`)?

## 3. Layout & Pacing
- [ ] Does the page alternate between dense information and expansive breathing space?
- [ ] Is the Bento grid heterogeneous with intentional span variances?

## 4. Accessibility & Responsiveness
- [ ] Does all text pass WCAG AA contrast (≥ 4.5:1)?
- [ ] Do buttons and interactive controls provide visible `:focus-visible` rings?
- [ ] Is `prefers-reduced-motion` fully implemented?
