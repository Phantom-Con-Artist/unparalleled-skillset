# Anti-Slop Invariants for Websites

This document lists the 8 deadly sins of AI-generated website templates and their mandatory remedies.

---

| Trope | Why It Fails | Mandatory Remedy |
|---|---|---|
| **Centered 3-Line Headline Over Soft Gradient** | Every AI template produces a centered 48px heading over a blurry purple radial blob. | Choose an intentional hero from `hero-architectures.md` (Asymmetric Split, Typographic Monument, or Bento Mosaic). |
| **The 3-Card Row with Tinted Icon Squares** | A repetitive row of 3 identical cards with SVG icons inside rounded pastel squares. | Heterogeneous Bento grid with varied column/row spans and interactive previews. |
| **Generic Tailwind Slate Grays** | Defaulting to `bg-slate-900 text-slate-100` without nuance or warmth. | Bespoke OKLCH palettes: deep obsidian (`oklch(0.12 0.015 255)`) or warm alabaster (`#faf7f2`). |
| **Uniform Section Padding (`py-20`)** | Every section has identical height and padding, dulling reader attention. | Varied vertical cadence: compact metric banners contrasted against expansive negative space. |
| **Generic Marketing Buzzwords** | "Supercharge your workflow with next-gen synergy." | Specific domain nouns, real numbers, and concrete capabilities. |
| **Missing Interaction States** | Only basic `:hover` opacity changes, no active or focus rings. | 5 complete states with physics spring feedback and WCAG focus rings. |
| **Breakpoint Font Snapping** | Text jumps awkwardly across arbitrary media queries. | Mathematical CSS `clamp()` fluid scales for typography and gutters. |
| **Floating Decorative Blobs** | Aimless blurry colored circles behind cards. | Subtle directional lighting, hairline specular rims, and crisp borders. |
