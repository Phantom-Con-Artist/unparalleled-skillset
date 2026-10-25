# Data that answers a question

Start with what someone needs to decide, then choose the table, chart, map, timeline, or diagram that makes the relevant relationship visible. Do not add a trend line, donut, sparkline, or KPI strip because the layout has an empty slot.

## Evidence and computation

Use the real records when available. If demonstration data is necessary, label it as such and keep it internally consistent. Compute displayed totals, counts, percentages, filters, deltas, and usage from the same source. Do not invent business proof, customers, financial results, or benchmark claims. Distinguish a measured zero, absent value, stale record, partial result, and loading placeholder.

## Encode meaning deliberately

| Decision | Required discipline |
| --- | --- |
| Comparison | Align values, units, precision, and periods. State the reference for a delta. |
| Scale | Choose and label a truthful axis and domain. Do not silently clip an outlier or imply a zero baseline where one is absent. |
| Color | Use consistent semantic assignments and text/shape redundancy. Do not assign a new decorative hue to every record. |
| Annotation | Explain the finding or consequential event without covering the data or repeating obvious labels. |
| Interaction | Make inspection, filtering, selection, and reset discoverable and operable beyond hover. |
| Access | Provide a useful text summary or equivalent data table for meaning that a chart alone cannot expose. |

Color should help compare or identify something. There is no universal number of hues or colored-pixel quota; use only the distinctions the data needs. Gridlines, borders, ticks, and labels should support reading rather than disappear to satisfy a minimalist aesthetic. A single-series chart may need direct labels instead of a redundant legend, while multiple series need an understandable key.

## States and devices

Keep selection and scope clear as filters change. Show the current result count and preserve a useful reference when a refresh is in progress. Empty charts should not invent a trend; missing data must not become zero. A failed source should expose the failure and a recoverable action, not a smooth fabricated line.

On phones, reduce label density or choose a clearer representation without dropping essential fields or changing the conclusion. Test large numbers, negative values, long names, zero denominators, and narrow ranges. A 3D chart is justified only when the actual spatial relationship needs it, not as premium decoration.
