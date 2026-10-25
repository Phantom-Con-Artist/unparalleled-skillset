# Bento Grid Patterns & Asymmetric Layouts

The Bento grid organizes heterogeneous features and social proof into an asymmetric visual hierarchy.

---

## 1. Bento Grid Architecture

A generic 3-card layout bores the reader because every element carries equal visual weight. A Bento grid intentionally elevates one or two primary features while nesting supporting telemetry around them.

```
┌──────────────────────────────────────────────┬──────────────────────────────┐
│ Cell 1: The Hero Feature (Col-Span 2)        │ Cell 2: Live Telemetry Metric│
│ • Large title & narrative                    │ • Real-time stats & sparkline│
│ • High-fidelity interactive preview          │ • Status indicator           │
├──────────────────────────────┬───────────────┴──────────────────────────────┤
│ Cell 3: Technical Integrity  │ Cell 4: Integration Ecosystem (Col-Span 2)   │
│ • Monospace terminal snippet │ • Micro-grid of supported providers/tools    │
│ • Copyable code snippet      │ • Interactive hover previews                 │
└──────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. CSS Grid Implementation

```css
.bento-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .bento-container {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .bento-col-2 {
    grid-column: span 2;
  }
  .bento-row-2 {
    grid-row: span 2;
  }
}

.bento-cell {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  box-shadow: var(--shadow-card);
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 200ms ease;
  overflow: hidden;
  position: relative;
}

.bento-cell:hover {
  transform: translateY(-2px);
  border-color: var(--border-medium);
}
```
