# Interaction state contracts

Each interactive component needs a truthful default, hover, pressed/active, focus-visible, and disabled treatment where applicable. Persistent selected state is different from a momentary press. Add loading, validation, empty, error, and success behavior when the task needs them. Static content is not obliged to look interactive.

## Native button recipe

These tokens must be supplied by the project's own system; this fragment is not a palette.

```css
.action {
  color: var(--action-text);
  background: var(--action-bg);
  border: 1px solid var(--action-border);
}
.action:hover:not(:disabled):not([aria-disabled="true"]) {
  background: var(--action-hover-bg);
}
.action:active:not(:disabled):not([aria-disabled="true"]) {
  background: var(--action-pressed-bg);
}
.action:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
.action:disabled,
.action[aria-disabled="true"] {
  color: var(--action-disabled-text);
  background: var(--action-disabled-bg);
  cursor: not-allowed;
}
```

Prefer `<button disabled>` when the action should be removed from interaction and tab order. Use `aria-disabled="true"` only when discoverability requires the control to remain focusable, and explicitly block activation in the event handler for both keyboard and pointer paths. Styling or `pointer-events: none` alone does not disable a control. Recheck disabled/loading state inside asynchronous submission code to prevent duplicate requests.

Use primary, secondary, quiet, and destructive variants according to task hierarchy, not a fixed count of buttons per viewport. Keep destructive intent clear and use confirmation proportional to the actual consequence. Preserve readable state labels and visible focus instead of relying on opacity or color alone. Motion feedback should be optional and respect reduced motion.
