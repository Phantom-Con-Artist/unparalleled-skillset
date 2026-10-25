# Data Density & High-Performance Tables

Data tables are the engine of operational software. A table that fails in layout or legibility renders software ineffective.

---

## 1. Table Architecture & Spatial Invariants

```html
<div class="table-container" role="region" aria-label="Active Deployments" tabindex="0">
  <table class="data-table">
    <thead>
      <tr>
        <th scope="col" class="th-checkbox"><input type="checkbox" aria-label="Select all rows"></th>
        <th scope="col" aria-sort="descending" class="th-sortable">Service <span class="sort-icon">↓</span></th>
        <th scope="col">Status</th>
        <th scope="col" class="th-numeric">Latency</th>
        <th scope="col" class="th-numeric">Uptime</th>
        <th scope="col" class="th-actions">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><input type="checkbox" aria-label="Select auth-service"></td>
        <td class="font-medium">auth-service</td>
        <td><span class="status-pill status-healthy">Healthy</span></td>
        <td class="tabular-nums text-right">18ms</td>
        <td class="tabular-nums text-right">99.98%</td>
        <td class="text-right"><button class="btn-ghost-sm">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 2. Table Craft Rules

1. **Alignment Principles**:
   - **Text columns**: Left-aligned (`text-align: left`).
   - **Numeric / Financial / Metric columns**: Right-aligned (`text-align: right`) with `font-variant-numeric: tabular-nums`.
   - **Status pills**: Left-aligned or centered with a colored dot indicator.
   - **Action buttons / menus**: Right-aligned in the trailing column.

2. **Row Height & Padding**:
   - Compact density: `36px` height, `8px` vertical padding.
   - Standard density: `44px` height, `12px` vertical padding.
   - Spacious density: `52px` height, `16px` vertical padding.

3. **Row Selection & Hover**:
   - On row hover, apply a subtle background highlight (`var(--surface-row-hover)`).
   - On selected row, apply a distinct background tint (`var(--surface-selected)`) and a 2px left border accent.

4. **Sticky Headers**:
   - For scrollable datasets, make table headers sticky (`position: sticky; top: 0; z-index: 10;`) with background matching the table container to prevent text overlap.
