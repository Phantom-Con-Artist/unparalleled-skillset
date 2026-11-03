# Conversion intelligence

Conversion is the share of people who complete the action the page or screen exists for: enquire, buy, sign up, book, download, finish a task. A professional makes that action clear, easy and trustworthy, and removes friction, without manipulating people. In an app (**App UI**), conversion is task completion: the person finishes the job correctly and confidently.

## What the discipline decides

- **The primary action** per page or screen, and the secondary actions that support it.
- **Value proposition**: what the visitor gets, for whom, and why this product, stated in the first view in concrete terms from product.md.
- **Decision support**: the information a person needs before acting (price, process, time, requirements, risk), placed before the ask.
- **Proof**: verified evidence (real customers, numbers, reviews, certifications, demonstrations) and where it sits relative to the action.
- **Friction**: every field, step, click, wait and surprise between intent and completion, and which can be removed.
- **CTA design**: label (verb plus outcome), placement, visual weight, repetition along long pages.
- **Forms and checkout**: field count, order, input types, autofill, inline validation timing, guest paths, error recovery.
- **Measurement**: what event counts as success and how it will be measured (analytics, A/B testing when traffic allows).

## Standards and data

| Source | What it settles |
| --- | --- |
| Baymard Institute research | Large-scale checkout and form usability findings (field count, guest checkout, error handling). |
| NN/g web form design, trustworthy design, how long users stay on pages | Form layout and labels; trust signals; people decide in the first seconds whether to stay. |
| GOV.UK Design System patterns | Question pages, one thing per page, validation and error summaries tested at scale. |
| WCAG 2.2 SC 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication, 1.3.5 Identify Input Purpose | Accessibility rules that also reduce friction. |
| Deceptive patterns catalogue (deceptive.design), NN/g deceptive patterns | Named manipulative patterns to avoid. |
| EU Digital Services Act Art. 25; consumer-protection law | Deceptive interface design is regulated in several jurisdictions. Record applicable law; do not give legal advice. |
| web.dev case studies, Core Web Vitals | Faster pages convert better; performance is part of conversion. |

Links: [sources.md](sources.md#conversion).

## Allowed practice

- One primary action per view, visually dominant, labeled with a specific verb and outcome ("Book a fitting", "Download the 2026 report").
- The value proposition in plain words in the first view, with the product shown doing its job.
- Answering objections (price, time, risk, process) near the action.
- Real proof with source: named customers with permission, actual figures, linked reviews, verifiable certifications.
- Short forms: ask only what is needed now; correct input types and `autocomplete`; inline validation after a field is left; preserved input on error.
- Guest paths, clear pricing including fees, visible return and cancellation terms.
- Repeating the primary action at natural decision points on long pages.
- Progress indication in multi-step flows; summary before commitment; confirmation with next steps after.
- Experiment ideas recorded as hypotheses with a success metric, not shipped as claims.

## Banned practice

- Fake urgency or scarcity: countdown timers that reset, "only 2 left" without stock data, fake "X people viewing".
- Fabricated proof: invented testimonials, logos, ratings, user counts or press mentions.
- Confirmshaming ("No thanks, I prefer paying more"), pre-checked opt-ins, sneaking items into baskets, hidden costs revealed at the last step.
- Roach motels: easy to sign up, hard to cancel; forced account creation before necessary.
- Disguised ads, trick questions, misdirection that makes the decline option hard to see.
- Several equally weighted CTAs competing in one view; vague labels ("Submit", "Learn more", "Get started" with no destination meaning).
- Pop-ups and interstitials that block content on arrival, especially on mobile.
- Asking for information not needed for the action (phone number for a newsletter).
- Sacrificing accessibility, performance or honesty for a conversion lift.

## Record in design.md (Conversion section)

Primary and secondary actions per key view; value proposition statement; objection map (question → where it is answered); proof inventory with sources; friction audit of the primary flow (step, removable?, decision); CTA label rules; form rules; success metric and measurement plan.

## Verify

1. Complete the primary action as a first-time visitor on phone and desktop; count steps, fields and seconds.
2. Five-second test on the first view: value and next action understood.
3. Check every claim and proof point against product.md facts; unsupported claims are removed.
4. Scan the flow against the banned list; any deceptive pattern is a blocker.
