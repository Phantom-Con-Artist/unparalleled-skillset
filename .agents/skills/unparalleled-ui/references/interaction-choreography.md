# Interaction that preserves understanding

Design a control's behavior before its entrance animation. A repeated task needs immediate acknowledgement, interruptible feedback, and reliable completion. Motion can show where an object went, what changed, or what depends on the current selection. It should not make the user wait for a brand performance before working.

## Continuity

Use a shared spatial or visual anchor when moving from a record to its detail, a selection to its editor, or a comparison to its consequence. Preserve relevant filter, focus, scroll, camera, and edit state. Native navigation, back, Escape, and explicit close or return controls must remain predictable. An animation is not a replacement for state persistence.

Distinguish reversible local changes from actions that write, submit, delete, or otherwise have consequences. Pending, disabled, success, error, retry, and undo behavior must match the actual operation. Do not use a celebratory animation or fake success state before the result is known. Keep control response visible when reduced motion is active.

## Spatial product tools

Use 2D/3D blending for work that is spatial: inspecting a model, aligning a scan, arranging objects, comparing layers, or observing a simulation. Anchor labels, measurements, and selections to the same object identity across views. Supply explicit rotate/pan/zoom/reset controls, discoverable keyboard and touch alternatives, and a useful nonspatial description or data view. State honest limits when a 2D fallback cannot perform an essential 3D task; do not claim equivalent editing capability from a poster.

Keep conventional task controls in semantic DOM even if the work surface uses canvas or WebGL. A failed renderer needs a recoverable state and access to relevant records or alternate inspection; it must not erase the rest of the application. Preserve a user's explicit view selection over delayed observers and automatic camera changes.

## Motion grammar

Choose timings and easing by the operation's meaning and distance, not a universal spring preset. Continuous movement, parallax, autoplay, and camera travel stop or simplify with reduced motion. Short state changes may remain direct or gently crossfade when appropriate. Do not remove meaningful feedback with a global near-zero-duration hack while hidden content or JavaScript motion persists.

Pause offscreen rendering, stop hidden-tab loops, and release listeners/observers/GPU resources on teardown. Avoid forcing layout each frame or stacking animation libraries. Measure the heaviest representative task; low latency and legible state changes are part of the material quality of the product.
