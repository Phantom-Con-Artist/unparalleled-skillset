# Responsive intelligence

Responsive design is not shrinking a desktop layout. A professional designs how every decision (type, space, components, assets, motion) transforms across widths, heights, input methods, zoom levels and user preferences, so each context gets a composition that works on its own terms.

## What the discipline decides

- **Strategy**: mobile-first CSS with content-driven breakpoints (where the layout breaks, not device names).
- **Breakpoints and containers**: viewport media queries for page layout; container queries for components that live in several contexts.
- **Transformations per component**: reflow, stack, collapse, reveal, swap (for example a comparison table becomes stacked cards only if comparison is preserved).
- **Fluid systems**: fluid type and space between endpoints (`clamp()` with a `rem` term).
- **Input**: touch, mouse, keyboard, stylus; hover availability (`@media (hover: hover)`), pointer precision (`pointer: coarse`).
- **Viewport units and safe areas**: `dvh`/`svh` instead of `100vh` for full-height regions, `env(safe-area-inset-*)` on notched devices.
- **Short heights**: laptops at 700–800px tall and landscape phones.
- **User preferences**: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors`.
- **Performance per context**: lighter assets and scenes for mobile networks and devices.

## Standards and data

| Source | What it settles |
| --- | --- |
| WCAG 2.2 SC 1.4.10 Reflow (AA) | Content works at 320 CSS px wide (400% zoom of 1280px) without two-dimensional scrolling, except for content that needs it (maps, data tables). |
| WCAG 2.2 SC 1.3.4 Orientation (AA) | No lock to portrait or landscape unless essential. |
| WCAG 2.2 SC 1.4.4 Resize Text, 1.4.12 Text Spacing | Zoom and spacing overrides must not break layout. |
| WCAG 2.2 SC 2.5.8 Target Size | Touch targets usable on small screens. |
| web.dev Learn Responsive Design; MDN container queries | Modern responsive techniques. |
| Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at the 75th percentile) | Performance thresholds, assessed on mobile and desktop separately. |

Links: [sources.md](sources.md#responsive).

## Allowed practice

- Starting the design at about 375px and also testing 320px, then expanding.
- A deliberate phone composition for the hero, navigation and primary action, not a squeezed desktop.
- Container queries for components reused in sidebars, grids and full-width contexts.
- Collapsing navigation behind a labeled menu button on small screens, with focus management.
- Horizontal scrolling only for content that is inherently two-dimensional (data tables, timelines), inside a labeled, keyboard-scrollable region.
- Hover enhancements only within `@media (hover: hover)`, with the same information available on tap or focus.
- Reducing 3D, video and decorative motion on small or low-power devices, with a static equivalent.

## Banned practice

- Designing only at 1440px and letting the rest fall out.
- Breakpoints named after devices ("iPhone") with fixed widths that break between them.
- `100vh` full-screen sections that hide content behind mobile browser chrome.
- Hiding essential content or actions on mobile ("desktop-only" information).
- Horizontal page overflow at any tested width.
- `user-scalable=no`, `maximum-scale=1` or orientation locks.
- Hover-dependent menus or reveals with no touch or keyboard equivalent.
- Shrinking text, targets or spacing below their minimums to fit a composition.
- Sticky headers or footers that cover focused elements or most of a short viewport.
- Shipping the desktop hero video or full 3D scene to every phone.

## Record in design.md (Responsive section)

Breakpoints and why each exists; per key component and section, its transformation at each range; fluid endpoints for type and space; input and hover rules; short-height rules; asset and scene variants per context; user-preference handling.

## Verify

Capture with `node scripts/capture.mjs` at desktop, short laptop, tablet, phone and 320px, plus reduced motion (see [visual-review-loop.md](../visual-review-loop.md)). Open every image. Check no horizontal overflow, the primary action visible without hunting, 200% zoom on desktop, landscape phone, and a real touch run where available.
