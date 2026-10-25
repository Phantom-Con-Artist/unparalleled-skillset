# Reading the words in a brief

Some brief words describe how carefully the work is made. Others describe what it literally looks like. Mixing them up produces the wrong thing confidently. Read the brief, sort its words with the tables below, and write the interpretation into the direction contract so the user can correct it.

## Quality words versus literal-material words

| The brief says | It means | It does not mean |
| --- | --- | --- |
| bespoke, handcrafted, crafted, artisanal (about the work), custom, authored, one-of-a-kind, tailored | Every decision is made for this product: custom composition, drawn icons, chosen type, product-derived color, considered details. Precise and finished. | Sketchy lines, paper textures, handwriting fonts, wobbly borders, scribbles, rough edges, a "homemade" look. |
| handmade, handwritten, hand-drawn, hand-lettered, sketched, doodled, scribbled, paper, crayon, ink, scrapbook | A literal visual material. Show real marks of a hand: drawn strokes, lettering, imperfect fills, scanned or drawn texture. | A license to skip craft. Hand-drawn marks still need a consistent tool, weight, and rhythm, and body text stays readable type. |
| human, warm, personal, friendly | Voice, pacing, and specific detail that sound like people. Real photography or drawn marks only if the subject supports them. | Automatically adding handwriting or hand-drawn decoration. |
| imperfect, organic, irregular | Discreet authored irregularity where it says something true (see [craft-foundation.md](craft-foundation.md)). | Random jitter, distressed filters, or broken alignment in forms, data, and controls. |

Rules that follow from the table:

1. A product that is itself handmade (a ceramics studio, a bakery) can have handcrafted presentation without any handwritten type. Show the craft through photography, material, and precise layout; use a drawn mark only where it carries meaning.
2. Use a handwriting or script typeface only when the brief asks for handwritten or hand-lettered work, or the brand already uses one. Never for body copy, labels, buttons, or data.
3. When both kinds of word appear ("bespoke and hand-drawn"), the literal word decides the material and the quality word decides the finish: real drawn marks, executed with a consistent hand and exact placement.
4. When unsure, choose the quality reading and state it. A hand-drawn treatment the user did not ask for is harder to undo than a precise one.

## 2D, 3D, or both

The user may name a dimension. Treat that as a constraint, not a suggestion.

| The brief says | Build | Avoid |
| --- | --- | --- |
| 2D, flat, graphic, illustrative, print-like, vector | Flat composition, drawn shapes, typographic structure, SVG and CSS motion in the plane: paths drawing, layers sliding, masks revealing. | WebGL scenes, perspective tilts, faux-3D extrusions, depth-of-field blur, rotating objects. A drop shadow for legibility is fine. |
| 3D, spatial, immersive, depth, WebGL, three.js, model | A real spatial representation the visitor can read or control: an object that turns to show a hidden side, a space to move through, layers that separate along a real axis. Consistent camera, light, scale. | A token rotating blob, a tilt-on-hover card, particles, or a 3D hero followed by flat template sections. Mandatory WebGL with no static path. |
| 2D and 3D, blended, mixed, 2.5D | One explanation that changes dimension at a meaningful moment: a flat diagram that lifts into space to show structure, then settles back into a readable flat state. Plan the hand-off. | Two unrelated layers, a 3D model pasted over flat cards. |
| Nothing about dimension | Choose from the product relationship. Most products explain better in 2D; use 3D when form, volume, assembly, or place is the point. | Defaulting to 3D because "immersive" sounds premium. |

Whatever the dimension, keep native scroll, keyboard and touch control, a reduced-motion state, and a static fallback that carries the same meaning. Read [blending-2d-3d.md](blending-2d-3d.md) for technique and performance rules.

## Other words that get misread

| Word | Read it as | Not as |
| --- | --- | --- |
| premium, luxury, high-end | Coherence, confidence, generous useful content, personal detail, flawless behavior. | Black and gold, cream and serif, thin type, empty space. |
| minimal, clean | Fewer, better decisions. Every remaining element earns its place. | A sparse page with little content and default type. |
| modern, sleek | Current technique and precise execution. | Dark slate, gradients, glass, and pills. |
| futuristic, techy, AI | The product's actual mechanism made visible. | Neon, HUD overlays, terminal windows, fake telemetry (see [generic-tells.md](generic-tells.md)). |
| bold | A strong single idea and a clear hierarchy. | Everything large and heavy. |
| playful | Behavior and voice that reward attention. | Bouncing elements, pastel candy, emoji. |
