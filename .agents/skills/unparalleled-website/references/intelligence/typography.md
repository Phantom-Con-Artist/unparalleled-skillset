# Typography intelligence

Most of an interface is text. Typography is the product's voice and its reading infrastructure, so a professional decides the typeface, pairing, scale, spacing, measure, numerals and loading together, then tests them on the product's real words.

## What the discipline decides

- **Typeface selection**: classification (humanist, transitional, geometric, grotesque or neo-grotesque sans; old-style, transitional, didone or slab serif; monospace; display), why its forms fit the personality traits, language and script coverage, available weights and optical sizes, variable axes, licence and source.
- **Pairing**: how many families (one is often enough; two is the usual maximum) and the contrast principle between them: role (display vs text), structure (serif vs sans with compatible x-height and proportions) or a superfamily. Never two families that differ only slightly.
- **Scale**: base size, ratio, number of steps, and fluid endpoints from 320px to the widest layout.
- **Vertical rhythm**: line height per role, paragraph spacing, heading spacing above and below (more above than below, so a heading belongs to what follows).
- **Measure**: line length for reading text.
- **Tracking**: per size. Tighten large display slightly, open small caps and all-caps labels, leave body at the font's default.
- **Numerals and features**: tabular vs proportional, lining vs old-style, fractions, ligatures, small caps (`font-variant-numeric`, `font-feature-settings`).
- **Hierarchy**: which differences signal levels (size, weight, case, color, space). Use the fewest that work.
- **Loading**: formats (WOFF2), subsetting, `font-display`, preloading the critical face, fallback metric overrides (`size-adjust`, `ascent-override`) to limit layout shift.

## Standards and data

| Source | What it settles |
| --- | --- |
| WCAG 2.2 SC 1.4.4 Resize Text (AA) | Text resizes to 200% without loss of content or function. Use `rem`/`em`, never block zoom. |
| WCAG 2.2 SC 1.4.12 Text Spacing (AA) | Layout survives line height 1.5×, paragraph spacing 2×, letter spacing 0.12em, word spacing 0.16em. No fixed-height text boxes. |
| WCAG 2.2 SC 1.4.3 / 1.4.6 | Contrast thresholds depend on size and weight (large = ≥24px regular or ≥18.66px bold). |
| Butterick, *Practical Typography* | Professional defaults: 45–90 characters per line, line spacing 120–145% of point size, restrained emphasis. |
| Utopia fluid type calculator | Fluid modular scales between two viewport endpoints using `clamp()`. |
| MDN `font-display`, `size-adjust`; web.dev font best practices | Loading strategy and layout-shift control. |
| Material 3 and Carbon type sets, Apple HIG typography | Professional role-based type systems (display, headline, body, label). Learn the role logic, not their fonts. |
| Google Fonts Knowledge | Classification, pairing and licensing primers. |

Links: [sources.md](sources.md#typography).

## Calculate the scale

`size(n) = base × ratio^n`; round the final steps, not intermediates. Common ratios: 1.125 (major second, dense UI), 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth), 1.5, 1.618. Use a smaller ratio on narrow screens and a larger one on wide screens.

Fluid step between widths Wmin and Wmax: slope `m = (Smax − Smin) / (Wmax − Wmin)`, intercept `b = Smin − m × Wmin`, emit `clamp(Smin/16 rem, calc(b/16 rem + 100m vw), Smax/16 rem)`. The `rem` term keeps zoom working. Example: 36px at 360px to 84px at 1440px gives `clamp(2.25rem, calc(1.25rem + 4.4444vw), 5.25rem)`.

## Allowed practice

- One family with a clear range of weights, or two families with a stated contrast principle.
- A characterful face whose specific forms (apertures, terminals, width, stress) match recorded personality traits, with a robust system fallback stack while it loads.
- Body text 16px or larger on the web for reading content (dense app UI may use 14px for secondary data with checked contrast); line height about 1.4–1.6 for body and 1.05–1.25 for display, tuned to the face.
- Reading measure of about 45–75 characters (up to ~90 for wide faces), set with `max-width` in `ch` or `rem`.
- 4–7 type sizes for most products; each size has a named role.
- Tabular lining numerals in tables, prices, timers and comparisons; proportional old-style numerals in running prose when the face supports them.
- Expressive display type, custom lettering or a variable-axis animation for a title, when body text stays plainly readable.
- Script and language coverage checked for real strings, including names with diacritics and any right-to-left content.

## Banned practice

- Inter, Geist, Roboto, Arial, Helvetica, `system-ui` or default framework sans as the **authored identity**. They remain valid fallbacks and native-control fonts.
- Swapping one overused face for another (Poppins, Montserrat, Open Sans, Lato) and calling the decision bespoke.
- Stock pairings chosen by genre: luxury serif plus thin sans, developer sans plus mono, "editorial" didone plus grotesque with no product reason.
- Three or more families, or two families too similar to read as a deliberate contrast.
- More than about 9 rendered font sizes on one page, or sizes with no named role.
- Fixed `px` font sizes that block zoom, viewport-only units (`vw` without a `rem` term), `maximum-scale=1` or `user-scalable=no`.
- Light or thin weights (under 400) for body text, low-contrast grey body text, all-caps paragraphs, justified text without hyphenation on the web.
- Tiny tracked uppercase eyebrow labels above every heading (the template rhythm).
- Negative tracking applied to every heading regardless of face and size; faux bold or faux italic from missing files.
- Handwriting or script faces unless the brief literally asks for handwriting or the brand already uses one; never for body, labels, buttons or data.
- Inventing a font name or asserting a licence without checking the foundry or distributor.
- Text set in an image or canvas without an equivalent in the DOM.

## Record in design.md (Typography section)

Families with source, licence, scripts, weights and axes; why each fits named traits; pairing principle; the scale table (role, step, min px, max px, `clamp()`, line height, tracking, weight); measure; numeral and feature settings; loading plan and fallback overrides; a specimen set in the product's real strings (name, longest heading, a body paragraph, a small label, numbers).

## Verify

1. `document.fonts` lists the chosen families as loaded and the page uses them (`node scripts/capture.mjs` reports `families`).
2. Browser zoom 200% and the WCAG text-spacing bookmarklet values produce no clipped or overlapping text.
3. Capture at 320px: no word overflows its container, no heading breaks into a single orphaned word where avoidable.
4. Measure body line lengths in the rendered page; `capture.mjs` flags paragraphs over about 90 characters.
5. Contrast of each text role on each surface it appears on.
