# GitHub Copilot Instructions — Unparalleled Skillset

When generating frontend code, user interfaces, or web pages in this repository, follow these design system invariants:

## 1. Application UI & Dashboards (`unparalleled-ui`)
- For SaaS dashboards, telemetry consoles, and data tables:
  - Every interactive component must define 5 states: `default`, `hover`, `active`, `focus-visible`, and `disabled`.
  - Never remove `:focus` outlines without providing a visible high-contrast `:focus-visible` ring.
  - Use `font-variant-numeric: tabular-nums` for all metrics, currency, timestamps, and table numbers.
  - Adhere to WCAG 2.1 AA (minimum 4.5:1 text contrast).

## 2. Landing Pages & Marketing Sites (`unparalleled-website`)
- For landing pages, heroes, and marketing websites:
  - Never generate generic AI tropes: no centered 3-line headline over soft purple gradients; choose an intentional layout (Asymmetrical Split, Typographic Monument, Bento Mosaic).
  - Never create rows of 3 identical cards with tinted icon squares. Use heterogeneous Bento grids with 2-column or 2-row spans.
  - Always use fluid clamp typography (`clamp(min, preferred, max)`) — no breakpoint font snapping.
  - Use nuanced OKLCH colors; avoid pure `#000000` or `#ffffff` backgrounds.
  - Motion must follow spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
