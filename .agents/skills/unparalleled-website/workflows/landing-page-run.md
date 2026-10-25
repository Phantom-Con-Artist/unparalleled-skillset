# Workflow: The Unparalleled Website Run

Follow this 8-phase protocol sequentially when crafting a landing page or public website:

---

## Phase 1: Codebase Comprehension & Competitor Reconnaissance
1. **Analyze Codebase**:
   - Read workspace files, `README.md`, `package.json`, source files, and docs.
   - Determine: Is this a product, a service, a tool, or an editorial platform?
   - Answer: What is this? Who is it for? Why do people choose it? What is genuinely unique about it?
2. **Competitor Reconnaissance**:
   - If competitors exist in the market, perform web search via `search_web` to inspect 2–3 leading alternatives.
   - Identify their visual aesthetic, typography, and messaging angles so we can intentionally differentiate.

---

## Phase 2: Prospective Design Blueprint (`prospective-design.md`)
1. Author a concise `prospective-design.md` file in the project outlining:
   - The Subject's Identity (product/service definition)
   - Target Audience & Core Value Proposition
   - Competitor Insights & Differentiation Opportunities
   - Preliminary Visual Thesis

---

## Phase 3: Structured User Alignment (With Skip Option)
1. Present structured, simple, and realistic multiple-choice or short questions to the user:
   - *Question 1: Feature Priority* (Which core capability or aspect of the product should take center stage?)
   - *Question 2: Emotional Cadence* (What mood should visitors feel: High-tech precision, timeless luxury, playful energy, calm humanist?)
   - *Question 3: Visual Signature* (Preferred surface treatment: dark obsidian terminal, warm editorial paper, 3D interactive tilt cards, or minimalist Swiss?)
2. **Handle Skip Seamlessly**:
   - Inform the user they can reply "skip" or proceed with defaults.
   - If the user responds with preferences, compile them into `user-design-principle.md`.
   - If the user skips or provides no input, promote `prospective-design.md` as the definitive design principle.

---

## Phase 4: Derive the Vocabulary (The Design Aesthetic Book)
1. Extract 15–25 evocative domain words, physical elements, textures, chromatic pigments, and kinetic verbs (consult `references/vocabulary-generator.md`).
2. Cluster the vocabulary into:
   - Physical Substances & Textures
   - Chromatic Affinities (OKLCH Pigments)
   - Spatial Forms & Geometry
   - Kinetic Motion & Verbs
3. Bind every design choice strictly to this Vocabulary.

---

## Phase 5: Aesthetic Foundation (Typography, OKLCH & 2D/3D Depth)
1. Derive font pairings directly from the Vocabulary (consult `references/typography-fluid-scales.md`).
2. Generate the OKLCH color tokens and verify WCAG AA compliance with `scripts/check-contrast.mjs`.
3. Plan the subtle 2D and 3D depth integration (consult `references/blending-2d-3d.md`):
   - Interactive 3D cursor tilt with specular rim highlights.
   - Subtle depth occlusion between 2D typography and dimensional fragments.

---

## Phase 6: Multi-Specimen Browser Review (`design-specimens.html`)
1. Generate an interactive `design-specimens.html` file that can open directly in Google Chrome or any browser.
2. Provide **at least 5 fundamentally distinct designs** (consult `references/specimen-architectures.md`):
   - Specimen 1: The Monument (Swiss International Typographic)
   - Specimen 2: The Dark Monolith (Linear / Obsidian Precision)
   - Specimen 3: The Editorial Artisan (Warm Literary Luxe)
   - Specimen 4: The Tactile Kinetic (Neo-Brutalism & Kinetic Pop)
   - Specimen 5: The Spatial Atmospheric (Humanist Spatial / Modern Glass)
3. For each specimen, calculate and display:
   - **Product Matching Score (0–100%)**
   - **Creative Rationale & Vocabulary Alignment**
   - **Clear Recommendation Indicator (★ Recommended)**
4. Provide an interactive switcher dock so the user can preview all 5 live designs seamlessly in their browser.

---

## Phase 7: Production Build
1. Once the preferred specimen is selected (or utilizing the recommended specimen):
   - Build the complete, fully responsive production page with fluid clamp typography, heterogeneous Bento grids, and spring physics.

---

## Phase 8: Subagent Quality Gate Review
1. Launch an independent review subagent (using `invoke_subagent` with `TypeName: "research"` or `"self"` and role `"Design Quality Reviewer"`).
2. The subagent evaluates against `references/subagent-review-rubric.md`:
   - [ ] Does the website clearly convey the details of the product/service?
   - [ ] Can a person viewing this website at a 3-second glance know what it is about?
   - [ ] Does the color palette harmonize with the Vocabulary without conflicting/clashing tones?
   - [ ] Is it free of generic AI template tropes?
   - [ ] Does it achieve a score ≥ **85 / 100**?
3. If score < 85, address the critique and re-verify before finalizing.
