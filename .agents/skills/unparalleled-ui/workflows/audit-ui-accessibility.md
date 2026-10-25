# Workflow: UI & Accessibility (A11y) Audit

Use this workflow to audit any web application screen or component library against the Unparalleled UI standards.

---

## 1. Contrast & Color Audit
- [ ] Body text contrast ≥ **4.5:1** against the background.
- [ ] Large headings (≥ 24px) contrast ≥ **3.0:1**.
- [ ] Focus rings and active borders contrast ≥ **3.0:1** against adjacent surfaces.
- [ ] Color is never the sole indicator of state (e.g. error states have an icon or text message in addition to red color).

## 2. Keyboard & Focus Audit
- [ ] Can the entire screen be navigated with `Tab`, `Shift+Tab`, `Enter`, `Space`, and `Escape`?
- [ ] Is there any keyboard trap where focus cannot be moved away?
- [ ] Is `:focus-visible` styled prominently on all elements?
- [ ] When dialogs/modals open, does focus move inside and trap properly?
- [ ] Does pressing `Escape` dismiss active popovers, dropdowns, and modals?

## 3. Screen Reader & Semantics Audit
- [ ] No clickable `<div onclick="...">`. Use `<button>` or `<a href="...">`.
- [ ] Form inputs have associated `<label>` tags with matching `for`/`id`.
- [ ] Data tables use proper `<th>` headers with `scope="col"` or `scope="row"`.
- [ ] Dynamic alerts and error toasts use `role="status"` or `aria-live="polite"`.
