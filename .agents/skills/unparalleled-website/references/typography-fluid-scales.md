# Distinctive typography without a genre preset

Choose type for the product's voice, actual words, language coverage, reading lengths, numerals, and physical forms. Typography must do more than make the page look expensive. Neither a high-contrast serif nor oversized condensed capitals automatically makes a design distinctive.

## The generic sans-serif ban

Do not use Inter, Geist, Roboto, Arial, Helvetica, system-ui, default Tailwind sans, or interchangeable geometric/neo-grotesque pairs as the authored visual identity. Do not substitute another fashionable sans and call the decision bespoke. System fonts remain valid fallbacks during loading and in native controls; this ban is not a ban on fault tolerance.

Investigate less habitual, characterful type, including humanist forms, expressive serifs, unusual widths, variable axes, restrained slab constructions, or commissioned lettering. A distinctive sans is acceptable only when its particular forms materially fit the product and the rationale is documented. Serif and monospace are not automatic escape routes. Avoid stock luxury serif-plus-sans and developer sans-plus-mono combinations.

## Selection record

Record the actual family, source or provided asset, license status, supported scripts, available weights, loading plan, and what its forms contribute. Never invent a font name or assert a license without checking. Use existing local assets first. If a candidate is unavailable, choose an available alternative with the same relevant characteristics and disclose the substitution.

Test the product name, longest heading, small control label, body paragraph, and any technical or multilingual content. Custom lettering can anchor a title; running text must remain legible. Adjust tracking for the chosen font, rather than imposing negative tracking on every heading. Do not turn readable copy into all-caps microtype.

## Calculate the fluid scale

For viewport endpoints Wmin and Wmax in pixels, and desired text sizes Smin and Smax in pixels, compute slope m = (Smax - Smin) / (Wmax - Wmin), then intercept b = Smin - m × Wmin. With a 16px reference root, emit `clamp(Smin/16 rem, b/16 rem + 100m vw, Smax/16 rem)` using `calc()` for the middle expression.

For example, 36px at 360px and 84px at 1440px yields `clamp(2.25rem, calc(1.25rem + 4.4444vw), 5.25rem)`. This is a calculation example, not a mandatory display size. Use actual content and layout bounds. Include a rem term in the preferred value, keep browser zoom enabled, and test text enlargement and narrow screens. Clamp alone does not guarantee accessible zoom behavior.

Use a comfortable reading measure and font-specific leading. Test fallback metrics, layout shift, missing glyphs, and wrapping at 320px. Never shrink navigation or body text to preserve an ornamental composition.
