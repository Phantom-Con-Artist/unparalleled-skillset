# Keyboard Navigation, Focus & Accessibility (A11y)

In software interfaces, keyboard accessibility is not an afterthought; it is a primary input modality for power users and an accessibility mandate (WCAG 2.1 AA).

---

## 1. Focus Management Laws

1. **Never Remove Focus Outlines Without Replacement**:
   - `outline: none` is forbidden unless immediately followed by a custom `:focus-visible` ring.
   - Recommended focus ring:
     ```css
     :focus-visible {
       outline: 2px solid var(--focus-ring);
       outline-offset: 2px;
     }
     ```
2. **Modal Dialogs & Focus Traps**:
   - When a `<dialog>` or modal opens:
     - Shift focus immediately to the first interactive field or close button.
     - Trap `Tab` and `Shift+Tab` within the dialog boundaries.
     - Pressing `Escape` must close the dialog and return focus to the trigger button.
3. **Roving tabindex for Menus & Toolbars**:
   - For a set of tabs, menu items, or toolbar buttons, use `tabindex="0"` on the currently selected item and `tabindex="-1"` on all others.
   - Use `ArrowLeft` / `ArrowRight` (or `ArrowUp` / `ArrowDown`) to move active focus between them.

---

## 2. ARIA Roles & Living Regions

- Use native semantic HTML elements first (`<button>`, `<input>`, `<select>`, `<dialog>`, `<details>`).
- If custom components are required:
  - Dropdown menu: `role="menu"` on list, `role="menuitem"` on items, `aria-haspopup="true"`, `aria-expanded="true|false"` on trigger.
  - Tabs: `role="tablist"`, `role="tab"` (`aria-selected="true|false"`), `role="tabpanel"`.
  - Notification toast: `role="status"` or `aria-live="polite"` so screen readers announce dynamic alerts without interrupting reading.
