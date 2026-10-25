# Workflow: Scaffolding a Production Software Screen

Follow this checklist whenever designing or implementing an application screen:

---

## Step 1: Clarify Information Architecture & Tasks
- [ ] Determine the screen category: Dashboard, Settings, Data Table, Detail View, or Multi-Step Form.
- [ ] List the primary user actions (max 1 primary CTA, up to 3 secondary actions).
- [ ] List the key metrics or status values required at a glance.

## Step 2: Establish the App Shell
- [ ] Setup the outer layout: navigation rail/sidebar, top header with user profile & breadcrumbs, main scrollable content area.
- [ ] Implement responsive behavior: sidebar collapses gracefully below `1024px`.

## Step 3: Implement Surface & Components
- [ ] Bind all colors, font sizes, and borders to the semantic token variables (`ui-tokens.md`).
- [ ] Build data tables or metric cards using standard table architecture (`data-density-tables.md`).
- [ ] Ensure all tabular numbers have `tabular-nums` enabled.

## Step 4: Validate State Completeness
- [ ] Check every button and interactive link for `default`, `hover`, `active`, and `:focus-visible`.
- [ ] Verify form validation messages and `aria-invalid` bindings.

## Step 5: Verification & Accessibility Gate
- [ ] Run `npm run check-contrast` to ensure colors pass WCAG AA.
- [ ] Test keyboard navigation: `Tab` through all interactive elements; verify focus order is logical and visible.
