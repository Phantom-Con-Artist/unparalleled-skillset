# Executable task prompt
Original request: the website example prompt in `bin/cli.js`, plus the maintainer's request to "update the examples with the exact updated skills".
Goal: a working public-website example for a fictional ceramics studio that follows the 1.3 flow end to end (product.md, design.md, design.html, built index.html), with every artifact consistent and checked.
Scope and exclusions: overhaul of the existing example's records; keep the existing page's premise and identity, correct it where the 1.3 checks find defects. No real business data.
Explicit choices: fictional studio disclosed in the first view and footer; single offline HTML file; 2D only.
Known context: existing index.html and its prior direction notes; repository example policy.
Grounded intent: "clean" → noise budget measured by capture.mjs; "crafted" → product-specific type and illustration, no handwriting fonts.
Deliverables and dependencies: product.md → design.md (fixed order, Color Intelligence evidence) → design.html → sync checks → index.html corrections → sync check of index.html.
Acceptance evidence: check-contract design gate exit 0; check-design-sync PASS on design.html and index.html; captures opened at desktop, phone, 320px and reduced motion.
Review boundaries: design.html review by a human is required before a real build; none exists for this fictional example and none is recorded.
Open questions and assumptions: none consequential; the studio is fictional by design.
Capabilities and limits: Playwright available; Color Intelligence CLI available; no human client.
Next action: write product.md.

# Intake record
Architect: main-agent-fallback (maintenance of a repository example inside an authoring session; no separate delegation was run)
Guidelines read: references/prompt-research-guidelines.md (1.3.0)
Questions and answers: none needed
Fidelity check: choices preserved; no consequential ambiguity
