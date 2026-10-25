# Component States & Interaction Contracts

Every interactive software component must be treated as a finite state machine. A component missing any of the 5 primary states fails quality assurance.

---

## 1. The 5 Mandatory Interactive States

```css
/* 1. DEFAULT */
.btn-primary {
  background-color: var(--interactive-primary);
  color: var(--interactive-primary-fg);
  border: 1px solid transparent;
  transition: background-color 150ms cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 80ms ease;
}

/* 2. HOVER */
.btn-primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 3. ACTIVE / PRESSED */
.btn-primary:active:not(:disabled) {
  background-color: var(--interactive-primary-active);
  transform: scale(0.98);
}

/* 4. FOCUS-VISIBLE (Keyboard Only) */
.btn-primary:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

/* 5. DISABLED */
.btn-primary:disabled,
.btn-primary[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## 2. Standard Software Component Variants

### Primary Button
- Used **once per view** for the definitive action (e.g., "Create Deployment", "Save Changes", "Send Invoice").
- Solid high-contrast fill.

### Secondary / Outline Button
- Used for parallel non-destructive actions (e.g., "Cancel", "Export CSV", "Filter").
- Subtle translucent border (`1px solid var(--border-subtle)`), transparent background, background wash on hover.

### Ghost / Sub-action Button
- Used in toolbars, table row actions, or icon buttons.
- No border, no background in default state; subtle tint on hover.

### Destructive Button
- Used exclusively for irreversible actions (e.g., "Delete Cluster", "Revoke Token").
- Deep crimson muted background, crisp contrast text.
