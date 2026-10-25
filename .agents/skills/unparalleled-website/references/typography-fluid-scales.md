# Typography & Fluid Clamp Scales for Websites

Typography is the structural backbone of web communication. In the **Unparalleled Website Skill**, typography scales continuously with the viewport using CSS `clamp()`.

---

## 1. The Fluid Scale System

```css
:root {
  /* Display Hero: scales smoothly from 44px to 104px */
  --font-display-hero: clamp(2.75rem, 7vw, 6.5rem);
  --leading-hero: 0.95;
  --tracking-hero: -0.035em;

  /* H1 Section Headings: scales from 32px to 60px */
  --font-h1: clamp(2.0rem, 4.5vw, 3.75rem);
  --leading-h1: 1.05;
  --tracking-h1: -0.025em;

  /* H2 Feature Headings: scales from 24px to 36px */
  --font-h2: clamp(1.5rem, 3vw, 2.25rem);
  --leading-h2: 1.15;
  --tracking-h2: -0.015em;

  /* Subtitles & Intro Leads */
  --font-lead: clamp(1.125rem, 1.8vw, 1.35rem);
  --leading-lead: 1.5;
  --tracking-lead: -0.01em;

  /* Body Regular */
  --font-body: clamp(1rem, 1.2vw, 1.125rem);
  --leading-body: 1.6;
  --tracking-body: -0.005em;

  /* Small Labels / Micro-badges */
  --font-badge: 0.75rem;
  --leading-badge: 1;
  --tracking-badge: 0.08em;
  --badge-transform: uppercase;
}
```

---

## 2. Typographic Rules of Craft

1. **Tighten Headline Tracking**: Above `32px`, font tracking must be tightened (`letter-spacing: -0.02em` to `-0.04em`) to prevent loose, disconnected glyphs.
2. **Expand Small Caps**: When setting text in uppercase for badges or category headers, expand tracking (`letter-spacing: 0.08em` to `0.12em`) and keep font-weight at `500` or `600`.
3. **Comfortable Prose Measure**: Limit body paragraphs to `max-width: 60ch` to prevent eye strain when scanning lines.
4. **Leading Proportions**:
   - Giant display: `0.9` to `1.0`
   - Section titles: `1.05` to `1.2`
   - Body copy: `1.5` to `1.7`
