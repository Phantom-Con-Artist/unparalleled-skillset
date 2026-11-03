# Visual asset intelligence

Images, illustrations, icons, video and 3D models explain what words cannot: the product itself, how it works, where it lives, who uses it. A professional decides which assets the story or task needs, how each is made, and how it is delivered fast and accessibly. Assets come after color, type and space so they are made for the system, not the other way round.

## What the discipline decides

- **Need**: for each section or screen, whether an asset explains better than text, and what exactly it must show.
- **Route**, following the design flow:
  - **2D**: photography, generated raster images ([image-generation-direction.md](../image-generation-direction.md), use an available imagegen or imagen skill), vector illustration and diagrams in SVG ([pipeline-2d.md](../pipeline-2d.md)), bespoke icons ([bespoke-icons.md](../bespoke-icons.md)).
  - **3D**: Blender through MCP with open-model research first ([pipeline-3d.md](../pipeline-3d.md)), exported glTF/GLB for the web.
  - **Motion media**: Remotion or rendered video ([pipeline-motion-graphics.md](../pipeline-motion-graphics.md)).
- **Art direction**: framing, crop, subject, lighting, color grading to the palette roles, consistent illustration style (stroke weight, corner logic, fill rules), icon grid and stroke.
- **Delivery**: format, dimensions, responsive sources, compression, loading priority, fallbacks.
- **Rights and truth**: source, licence, attribution, and whether an image is evidence or look-development.
- **Accessibility**: text alternatives by purpose (informative, decorative, functional, complex).

## Standards and data

| Source | What it settles |
| --- | --- |
| W3C WAI images tutorial and alt decision tree; WCAG 2.2 SC 1.1.1 Non-text Content (A) | Alt text by image purpose; decorative images get `alt=""`. |
| WCAG 2.2 SC 1.4.5 Images of Text (AA) | Real text instead of text baked into images, except logos. |
| web.dev Learn Images, Optimize LCP; MDN responsive images | `srcset`/`sizes`, `<picture>`, AVIF/WebP, intrinsic dimensions, `fetchpriority` for the LCP image, lazy-loading below the fold. |
| MDN SVG | Accessible inline SVG (`role="img"`, `<title>`), `currentColor` theming. |
| Creative Commons licences | What reuse, adaptation and attribution a licence permits. |

Links: [sources.md](sources.md#visual-assets). Process detail: [asset-direction.md](../asset-direction.md).

## Allowed practice

- The product's own object, output or interface as the main visual subject.
- Generated images for mood and look-development, clearly labeled as such and never presented as product evidence.
- One illustration grammar per product (stroke, corner, fill, palette roles), applied to icons, diagrams and spot illustrations.
- SVG for icons, diagrams and line illustration; raster for photography; video or Lottie only with a reason and a poster frame.
- Explicit `width`/`height` or `aspect-ratio` on every image, responsive `srcset`, AVIF or WebP with fallback, the LCP image not lazy-loaded.
- 3D only when form, volume, assembly or place is the point, with a static image fallback and a scene budget.
- Transparent backgrounds when compositing over varied surfaces; contrast checked over the worst frame.

## Banned practice

- Stock photos of people pointing at screens, handshakes, generic offices, or any image that would fit a competitor unchanged.
- Decorative 3D primitives, floating blobs, orbiting logos, random particles, abstract gradients standing in for the product.
- Mixed icon packs, mismatched stroke weights, emoji as icons, sparkle/rocket/bolt identity motifs, icon tiles beside every sentence.
- Fake dashboards, fake telemetry, fake testimonials or logos presented as real; generated product shots presented as the actual product.
- Text baked into images (except logos), missing alt text, alt text that repeats adjacent captions or says "image of".
- Unsized images causing layout shift, multi-megabyte hero images, autoplaying video with sound, lazy-loading the hero.
- Assets with unknown licence or source.
- Adding imagery to fill space the negative-space budget reserved for emptiness.

## Record in design.md (Visual assets section)

Asset inventory (purpose, route 2D/3D, source or generator, licence, status: existing/new/stand-in); art direction rules (crop, light, grade, style grammar); icon grid and stroke; formats, dimensions and budgets; alt-text policy; fallbacks for each heavy asset.

## Verify

1. Open every generated or edited asset at its placement size; reject artifacts, wrong anatomy, unreadable text and off-palette grading.
2. Check the network panel or capture report for image weight, format and failed requests; the LCP element is identified and prioritized.
3. Remove images (or block them) and confirm the page still makes sense with alt text.
4. For 3D, a scene readback from Blender MCP and a static fallback render exist before dependent work.
