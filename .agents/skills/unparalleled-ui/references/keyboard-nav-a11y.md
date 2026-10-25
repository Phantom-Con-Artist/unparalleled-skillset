# Keyboard and focus

Use native buttons, links, inputs, selects, and dialogs first. Every action needs an accessible name, a logical tab position, and a visible focus indicator. Keep native keyboard behavior intact; do not make a clickable div imitate a button unless native markup is genuinely unsuitable.

For modal dialogs, move focus inside, prevent background interaction, support Escape where appropriate, and restore focus to the trigger or a sensible surviving control. Native `dialog.showModal()` handles much of the modal contract; verify actual behavior rather than layering redundant traps blindly.

Composite widgets such as tabs, menus, and toolbars may need roving tabindex and arrow keys appropriate to their orientation and role. Ordinary navigation links should retain normal tab behavior rather than being turned into an application menu. Expose selected, expanded, current, invalid, and disabled state through the appropriate native or ARIA semantics.

Use `role="status"` or a polite live region for nonurgent results and explicit alerts for urgent validation only when needed. Do not announce every animation frame. Keep all meaningful inspection and editing available without hover, and provide touch targets that survive narrow layouts and zoom.

Semantic lists remain available for navigation and grouped options despite the ban on visible bullet-point content. Style markers intentionally without erasing useful grouping. No keyboard trap, color-only state, hidden focused control, or disabled action that still activates is an acceptable imperfection.
