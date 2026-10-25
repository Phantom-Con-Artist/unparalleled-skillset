# Color Tokens & OKLCH for Websites

Websites require nuanced, atmospheric color systems with strong foreground contrast and high-energy punch accents.

---

## 1. Perceptually Uniform Palettes in OKLCH

```css
:root {
  /* Canvas Backgrounds */
  --canvas-bg: oklch(0.12 0.015 255);        /* Deep Obsidian Dark */
  --surface-card: oklch(0.16 0.02 255);      /* Elevated Content Card */
  --surface-overlay: oklch(0.20 0.025 255);  /* Floating Popovers */

  /* Text Colors (Passing WCAG AA) */
  --text-hero: oklch(0.98 0.005 255);        /* Maximum contrast heading */
  --text-body: oklch(0.78 0.012 255);        /* Readable prose (contrast > 6:1) */
  --text-subtle: oklch(0.55 0.015 255);      /* Captions, labels, timestamps */

  /* Hairline Borders */
  --border-subtle: oklch(1 0 0 / 0.08);
  --border-medium: oklch(1 0 0 / 0.16);
  --border-glow: oklch(0.75 0.22 145 / 0.4);

  /* The Singular Punch Accent (e.g. Electric Emerald or Solar Flare) */
  --accent-punch: oklch(0.72 0.22 145);
  --accent-contrast: oklch(0.12 0.015 255);
}
```

---

## 2. Invariants for Website Color Craft

1. **No Pure Black or White Canvasses**: Pure `#000000` feels harsh and unrendered; pure `#ffffff` causes eye strain on large displays. Use nuanced values (`oklch(0.12 ...)` or `#faf7f2`).
2. **One Punch Accent**: Limit vivid saturated colors to a single accent color across the landing page. Avoid rainbow carousels.
3. **WCAG Compliance**: Verify contrast using `npm run check-contrast`.
