# Accessibility intelligence

Accessibility means people with visual, hearing, motor, cognitive and situational limitations can perceive, operate and understand the product. It is a floor that every other discipline respects from the first decision, not a final audit. **WCAG 2.2 Level AA** is the target unless the user or a law requires more.

## What the discipline decides

- **Conformance target**: WCAG 2.2 AA by default; AAA criteria where the audience needs them (for example 7:1 contrast for low-vision audiences).
- **Legal context** when relevant: European Accessibility Act (applies from 28 June 2025, via EN 301 549), US ADA Title II rule and Section 508, and local equivalents. Record which apply; do not give legal advice.
- **Semantics**: native HTML, landmarks, headings, lists, tables, form labels; ARIA only where HTML cannot express the role or state.
- **Perception**: contrast, non-color cues, text alternatives, captions and transcripts, text resize and spacing.
- **Operation**: keyboard access, visible and unobscured focus, target size, no keyboard traps, alternatives to dragging and complex gestures, enough time.
- **Understanding**: plain language, predictable behavior, error prevention and recovery, consistent help, accessible authentication.
- **Robustness**: valid name, role and value for every control; status messages announced.

## WCAG 2.2 AA criteria that most often fail in design

| Criterion | Requirement |
| --- | --- |
| 1.1.1 Non-text Content (A) | Text alternatives by purpose; decorative images hidden from assistive tech. |
| 1.3.1 Info and Relationships (A) | Structure (headings, lists, tables, labels) in markup, not just styling. |
| 1.4.1 Use of Color (A) | Color never the only signal. |
| 1.4.3 Contrast (AA) | 4.5:1 text, 3:1 large text. |
| 1.4.10 Reflow (AA) | Works at 320 CSS px without two-dimensional scrolling. |
| 1.4.11 Non-text Contrast (AA) | 3:1 for meaningful UI boundaries, focus indicators and graphics. |
| 1.4.12 Text Spacing (AA) | Survives user spacing overrides. |
| 1.4.13 Content on Hover or Focus (AA) | Hover/focus popups dismissible, hoverable, persistent. |
| 2.1.1 Keyboard (A), 2.1.2 No Keyboard Trap (A) | Everything operable by keyboard; focus never trapped. |
| 2.4.3 Focus Order (A), 2.4.7 Focus Visible (AA) | Logical order; visible focus. |
| 2.4.11 Focus Not Obscured (Minimum) (AA, new in 2.2) | Focused element not fully hidden by sticky headers, banners or overlays. |
| 2.5.7 Dragging Movements (AA, new in 2.2) | A single-pointer alternative to every drag. |
| 2.5.8 Target Size (Minimum) (AA, new in 2.2) | 24×24 CSS px or sufficient spacing. |
| 3.2.6 Consistent Help (A, new in 2.2) | Help mechanisms in the same relative place across pages. |
| 3.3.1–3.3.3 Error identification, labels, suggestions | Errors described in text with a fix. |
| 3.3.7 Redundant Entry (A, new in 2.2) | Do not ask for the same information twice in a process. |
| 3.3.8 Accessible Authentication (Minimum) (AA, new in 2.2) | No cognitive function test (puzzle, memorized transcription) without an alternative; allow paste and password managers. |
| 4.1.2 Name, Role, Value (A); 4.1.3 Status Messages (AA) | Custom controls expose state; results announced without moving focus. |

WCAG 2.2 removed 4.1.1 Parsing. Fetch the Understanding page for any criterion before deciding an edge case.

## Standards and data

WCAG 2.2 and its quick reference, "What's new in 2.2", WAI-ARIA APG, WAI tutorials (images, forms, page structure), WAI evaluation resources, axe-core rules, EN 301 549, EAA overview, ADA web guidance, Section 508. Links: [sources.md](sources.md#accessibility).

## Allowed practice

- Native elements and semantics first; ARIA to fill real gaps, following APG patterns.
- A skip link to `main`; landmarks; one `h1`; logical heading levels.
- Focus indicators designed as part of the brand (color, offset, thickness) with 3:1 contrast.
- Visible labels, `autocomplete` tokens on personal-data fields, errors in text tied to fields.
- Captions for video with speech, transcripts for audio, audio description or a text equivalent for visual-only information.
- `lang` on the page and on passages in other languages.
- Live regions (`role="status"`) for non-urgent results; `role="alert"` only for urgent errors.
- Testing with keyboard only, a screen reader (VoiceOver, NVDA or TalkBack), 200% zoom, forced colors and an automated scanner.

## Banned practice

- Shipping without a keyboard pass, or removing focus outlines.
- ARIA that contradicts native semantics (`role="button"` on a link, `aria-hidden` on focusable content), or ARIA added instead of fixing HTML.
- Accessibility overlays or widgets presented as conformance.
- Color-only status, placeholder-only labels, icon-only buttons without names.
- Auto-playing media with sound; carousels or animations over 5 seconds with no pause.
- CAPTCHAs or puzzles without an accessible alternative; blocking paste in password fields.
- Content that only exists in canvas, WebGL or images with no DOM equivalent.
- Modal dialogs that do not move, contain and restore focus.
- Claiming "WCAG compliant" or "fully accessible" from an automated scan alone.
- Waiving an accessibility failure because a human approved the visual design.

## Record in design.md (Accessibility section)

Conformance target and legal context; focus indicator design; target size policy; landmark and heading plan; keyboard model per custom component; text-alternative policy; reduced-motion and forced-colors handling; test plan (tools, assistive technologies, browsers).

## Verify

1. Keyboard-only run of the primary task; record focus order and any obscured focus.
2. Automated scan (axe-core through Playwright or browser devtools) on each key view; every violation fixed or justified.
3. Screen reader run of the primary task on at least one platform when available; otherwise record `unverified`.
4. Measured contrast pairs (`check-contrast.mjs`), 320px reflow and 200% zoom captures, `capture.mjs` small-target findings.
5. Report results by criterion; never claim conformance for criteria you did not test.
