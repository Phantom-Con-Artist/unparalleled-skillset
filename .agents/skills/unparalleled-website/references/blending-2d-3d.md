# Blending 2D and 3D through product behavior

Start from a relationship the product changes: separate layers becoming a whole, a route taking shape, a scan exposing hidden structure, or a signal gaining clarity. Design the flat labels, marks, imagery, and three-dimensional representation as parts of one explanation. Examples describe reasoning, not a preset menu.

## Respect a named dimension

If the brief says 2D, stay in the plane: no WebGL, perspective tilt, or faux extrusion. If it says 3D, build a real spatial representation the visitor can read or control, not a token rotating object. If it says both, plan the moment and reason the explanation changes dimension. If it says nothing, choose from the product relationship. [brief-vocabulary.md](brief-vocabulary.md) has the full table.

## Choose the lightest useful technique

Use SVG and CSS transforms for diagrams, depth ordering, sliced imagery, paths, and modest perspective. Use canvas or WebGL only when geometry, lighting, simulation, or a genuinely spatial interaction needs it. A hover-tilted card alone is not a 2D/3D experience. A real glass product may be rendered; frosted interface panels remain a banned morphism recipe.

Keep lighting, scale, occlusion, and perspective consistent. Never obscure essential text with geometry. Let a 2D diagram become a spatial explanation and return to a clear final reading state. Keep the action and its consequence connected. Do not add an unrelated rotating object, particle cloud, cursor trail, or perpetual orbit as evidence of craft.

## Input and fallback contract

Make every meaningful inspection operable by labeled buttons, keyboard, and touch. Hover may enhance information that is already available. Preserve native scroll and visible navigation. Give the scene a useful poster or SVG fallback and a text explanation when WebGL fails. With reduced motion, show meaningful static stages or explicit previous/next controls instead of continuous parallax.

Load optional scenes after essential content. Pause rendering when offscreen, stop when hidden, cap rendering resolution according to device capability, and release listeners and GPU resources on teardown. Do not promote every surface with persistent `will-change`. A lightweight 2D approximation on a small device should preserve the same product explanation.
