# Application Screen Patterns & Layout Architectures

This guide specifies structural layouts for software applications, dashboards, settings consoles, and multi-pane productivity tools.

---

## 1. The Standard Three-Pane Shell

The gold standard for multi-level SaaS applications (inboxes, project management, code repositories, analytics):

```
┌──────────────┬──────────────────────────────┬────────────────────────────┐
│ Global Rail  │ Context Pane / List View     │ Detail Surface / Work Area │
│ (W: 64-240px)│ (W: 280-380px)               │ (Flex 1)                   │
├──────────────┼──────────────────────────────┼────────────────────────────┤
│ • Workspace  │ • Filter / Search Bar        │ • Detail Header & Actions  │
│   Selector   │ • Density-Optimized List     │ • Main Data / Editor Form  │
│ • Navigation │ • Unread / Active Indicator  │ • Tabbed Panels            │
│ • User Menu  │ • Sorting Controls           │ • Telemetry / Activity Log │
└──────────────┴──────────────────────────────┴────────────────────────────┘
```

### Key Rules for Rails & Panes:
- **Left Navigation Rail**: Collapsible on smaller viewports (`<1024px`), persistent on desktop.
- **Top Utility Header**: Height `48px–56px`. Contains breadcrumb trail, global search trigger (`Cmd+K`), notification badge, and profile dropdown.
- **Panels & Dividers**: Use 1px hairline dividers (`var(--border-subtle)`). Never use blurred drop shadows between adjacent structural panes.

---

## 2. Dashboard KPI & Telemetry Grid

For metrics consoles, analytics dashboards, and status centers:

- **Top KPI Row**: 3 to 4 metric cards displaying:
  1. Primary metric (large tabular number, e.g. `$128,430.00`).
  2. Relative delta pill (e.g. `+12.4% vs last week` with green/red indicator).
  3. Micro sparkline or historical cadence chart.
- **Main Content Row**:
  - 60% width: Primary timeseries chart or high-density activity stream.
  - 40% width: Secondary distribution breakdown or recent incidents log.
- **Bottom Section**: Full-width data table with filter bar and pagination.

---

## 3. Settings & Form Layouts

- **Two-Column Split**:
  - Left column (`30%–35%`): Section Title, detailed explanation, and context help.
  - Right column (`65%–70%`): Input fields, switches, and explicit "Save Changes" action with dirty-state awareness.
- **Destructive Actions**: Placed at the bottom in a dedicated "Danger Zone" with red muted borders and two-step confirmation dialogs.
