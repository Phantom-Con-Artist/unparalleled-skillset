# Bespoke icon grammar

Use icons only when they improve recognition, navigation, explanation, or spatial continuity. An icon is not a replacement for every banned bullet point. Some sections should contain no icons.

Derive a small visual grammar from a real product operation or material: how a hinge closes, a route branches, a layer separates, or a signal resolves. Choose a consistent viewBox, stroke behavior, corner treatment, optical weight, and filled-versus-outline rule. Draw actual SVG paths or use repo-native vector assets. Do not reskin a stock icon pack into product-defining art, use emoji, or hide a generic sparkle inside a custom frame. React Icons or an existing coherent library may supply familiar utility controls when appropriate to the stack; import only used icons, verify the constituent license, and preserve the product-specific grammar for authored marks.

Give every meaningful icon an accessible label through its containing control or image. Use `aria-hidden="true"` and `focusable="false"` for decorative SVG, and keep icon-only controls named. Pair unfamiliar action marks with visible text. Preserve familiar interaction meanings and official brand marks rather than inventing cryptic replacements for close, back, search, or external identity.

Animate an icon only when its transformation expresses real state, such as two pieces joining after a successful operation. Supply the final static state for reduced motion. Test at its smallest actual size, in both themes if present, at high zoom, and beside text. A slight asymmetry can belong to the grammar; inconsistent alignment and unreadable details do not.
