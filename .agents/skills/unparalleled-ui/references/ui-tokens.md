# Product-derived UI tokens

Keep three levels: source values, semantic roles, and component aliases. Preserve an existing project's token contract rather than inventing a parallel system. A new system needs intentional surface, text, boundary, focus, selection, action, status, spacing, and typography roles, with a documented source for its colors and type.

Do not author the visual identity with generic sans-serif defaults, stock dark slate/neon, indigo primary buttons, purple/blue AI gradients, cyan or emerald "live" accents, or cream/terracotta/sage kits. Neon glow is out unless the user asks for it.

Shape tokens are identity too. Do not define a pill radius (`9999px`, `999px`, `100vmax`, or `rounded-full` on non-circular controls) as the default for buttons, badges, chips, or inputs, and do not make a bordered, rounded, shadowed panel the default container. Choose corner and edge treatment from the product and record why. Honor explicit user colors and existing brand commitments. A distinctive sans may be used when its actual forms fit the product; system fonts remain valid loading fallbacks. Verify font availability, licensing, script coverage, and readable numerical alignment. Neither a serif nor monospace is an automatic design solution.

## Generation

Use `node scripts/generate-tokens.mjs --input <tokens.json> --output <tokens.css>` from the skill directory. Supply a nonempty JSON object mapping CSS custom properties to project-specific CSS values. No built-in palette or font pairing is emitted. Define every variable your components consume, including hover, active, focus, inverse text, status, and disabled treatments. Choose theme roles for actual contrast, not equal numerical lightness steps.

Use source pigments as inputs, semantic names such as `--surface-panel` and `--text-primary` as roles, and component names only where an override is needed. Bind component colors and spacing to tokens instead of scattering unrelated literals. Tabular numerals and aligned decimal places matter more than decorative type in data surfaces.

## Verification

Test computed color pairs on actual surfaces, including composited hover and selection states, rather than substituting the script's sample values. For `check-contrast.mjs --pairs <pairs.json>`, supply an array of objects with `name`, opaque hex `fg` and `bg`, and `req` set to 4.5 for ordinary text or 3 for qualifying large text and meaningful UI graphics. The no-argument command tests reference fixtures only.

Do not lower a caption's threshold to make a failing color pass. Keep status understandable through text or shape, and inspect both themes if the product offers them. Disabled appearance must match actual behavior; it is not a reason to make other secondary text unreadable.
