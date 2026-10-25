# Readable data surfaces

Use a table when people compare values across records. Use another structure when relationships are not tabular. Keep text columns aligned with their labels and numeric columns aligned for comparison, using tabular numerals and consistent units. Do not invent rows or metrics to fill a screen.

## Semantics and controls

Use a caption or an accessible table name, proper header scopes, and a button inside a sortable column header. Put `aria-sort` on the currently sorted header and update it when sorting changes. Label every selection checkbox, row action, filter, and pagination control. Mark mixed select-all state accurately.

Choose density from real content and input needs rather than a mandatory row-height preset. Keep row actions discoverable without hover, distinguish selection from keyboard focus, and pair status color with words. Allow horizontal scrolling when data genuinely needs it, with a named region and an obvious narrow-screen cue. Sticky headers need opaque, contrast-tested surfaces.

## Data states

Design initial loading, refresh-in-progress, empty data, no filter results, partial failure, and full error states with useful next steps. Keep filter and sort state stable during refresh. For large datasets, choose pagination or virtualization according to actual scale and verify keyboard and assistive technology behavior.

Use connected explanation and useful comparisons around the table, not bullet-point feature inventories. A real data table is allowed under the bullet presentation ban; rows are records, not marketing bullets in disguise.
