# UI Design Tokens for Web Applications

This file provides the standard semantic token schema for software UI screens, configured for dark and light application interfaces in the OKLCH color space.

---

## 1. Dark Mode Application Tokens (Default)

```css
:root {
  /* Surface Layers */
  --surface-app-bg: oklch(0.12 0.012 260);          /* Deep app background canvas */
  --surface-panel: oklch(0.16 0.015 260);           /* Sidebars, toolbars */
  --surface-card: oklch(0.18 0.018 260);            /* Content cards, table surface */
  --surface-card-hover: oklch(0.22 0.02 260);       /* Interactive row/card hover */
  --surface-elevated: oklch(0.24 0.025 260);        /* Modals, popovers, dropdowns */

  /* Text & Foreground */
  --text-primary: oklch(0.96 0.005 260);           /* Primary titles & table data */
  --text-secondary: oklch(0.72 0.015 260);         /* Column headers, descriptions */
  --text-tertiary: oklch(0.52 0.02 260);           /* Placeholders, disabled text */
  --text-inverse: oklch(0.12 0.012 260);           /* Dark text on light accent */

  /* Borders & Dividers */
  --border-subtle: oklch(1 0 0 / 0.08);            /* Hairline structural dividers */
  --border-medium: oklch(1 0 0 / 0.14);            /* Card borders, input outlines */
  --border-focus: oklch(0.75 0.18 150);            /* High-contrast focus state */

  /* Interactive Accents */
  --interactive-primary: oklch(0.68 0.22 145);      /* Electric Emerald / Primary CTA */
  --interactive-primary-hover: oklch(0.72 0.22 145);
  --interactive-primary-active: oklch(0.64 0.22 145);
  --focus-ring: oklch(0.72 0.22 145);

  /* Status Colors */
  --status-success: oklch(0.68 0.22 145);
  --status-warning: oklch(0.78 0.18 80);
  --status-danger: oklch(0.62 0.24 25);
  --status-info: oklch(0.68 0.18 240);

  /* Elevation Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 12px 32px 0 rgba(0, 0, 0, 0.6);
  --inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

---

## 2. Light Mode Application Tokens

```css
[data-theme="light"] {
  --surface-app-bg: oklch(0.98 0.005 85);          /* Architectural warm paper */
  --surface-panel: oklch(0.95 0.008 85);           /* Sidebars, toolbars */
  --surface-card: oklch(1 0 0);                    /* Pure card container */
  --surface-card-hover: oklch(0.96 0.01 85);
  --surface-elevated: oklch(1 0 0);

  --text-primary: oklch(0.18 0.015 260);
  --text-secondary: oklch(0.45 0.02 260);
  --text-tertiary: oklch(0.65 0.015 260);
  --text-inverse: oklch(0.98 0.005 85);

  --border-subtle: oklch(0 0 0 / 0.06);
  --border-medium: oklch(0 0 0 / 0.12);
  --border-focus: oklch(0.45 0.20 145);

  --interactive-primary: oklch(0.48 0.20 145);
  --interactive-primary-hover: oklch(0.42 0.20 145);
  --interactive-primary-active: oklch(0.38 0.20 145);
  --focus-ring: oklch(0.48 0.20 145);

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 12px 32px 0 rgba(0, 0, 0, 0.1);
  --inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```
