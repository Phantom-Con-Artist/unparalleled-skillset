# Engineer the experience, not an effects reel

The browser is the medium, but the product's relationship is the concept. Choose HTML/SVG/CSS, canvas, WebGL, pre-rendered media, or a hybrid because of the behavior needed. A simple implementation may be excellent; a complex implementation may be justified. Neither simplicity nor complexity is a substitute for a strong idea.

## Prototype the decisive relationship

Build an early vertical slice with real-scale type, representative assets or honest stand-ins, one difficult transition, and a working input. Establish whether the idea can remain convincing on the target phone and with the available assets. A gray-box prototype may resolve camera and timing; it is not the final visual quality promise. Replace stand-ins before calling production complete.

## Scene contract

| Concern | Decision required before the scene is complete |
| --- | --- |
| Meaning | What new understanding, useful inspection, or story consequence the scene makes possible. |
| Composition | Focal object, text planes, light, scale, depth order, camera limits, and the stable reading window. |
| Input | Native scroll or explicit controls, touch and keyboard alternatives, discoverable affordances, and user override. |
| Lifecycle | Loading, ready, interacting, settled, offscreen, suspended, failed, and teardown. |
| Navigation | Direct links, back/return state, scene exit, and content accessible outside the rendering engine. |
| Performance | Asset transfer, shader/material complexity, rendering resolution, frame cost, main-thread work, and how the scene degrades. |
| Fallback | A poster, static diagram, sequence of stills, or direct interface that preserves the same essential meaning. |

Design sound only when it strengthens the product. It starts off, requires an explicit control, has a clear mute state, and never carries essential information alone. Keep the system pointer; any supplementary pointer response must not replace the cursor, obscure content, or become necessary to operate the page.

## Time and motion

Choreograph arrival, orientation, discovery, proof, and action as distinct attention states, with quiet reading between major changes. A substantial flagship may use several interlocking scenes under one idea. Vary behavior according to meaning rather than giving every section the same reveal or every card a hover lift. Preserve object identity when passing between flat and spatial states.

A scene can scrub with native scroll, but it needs a bounded route, a legible endpoint, and a way to jump to content. Do not capture wheel/touch scrolling, require a secret hold gesture, make reading depend on a particular speed, or force a long entrance gate. Interrupted, reversed, rapid, and resumed motion must reach a valid state. A user's explicit stage selection should not be immediately overwritten by a pending scroll observer.

## Engineering discipline

Use one rendering/animation responsibility per layer. Do not install several overlapping motion libraries to cover indecision. Feature-detect browser capabilities. Keep repeated layout measurement out of per-frame rendering, cap pixel ratio appropriately, suspend offscreen/hidden work, and release listeners, observers, workers, and GPU resources when the scene leaves the application. Detect context loss where relevant and restore or fall back cleanly.

Measure the scene that actually ships. If it stutters, simplify the rendering or asset route while preserving the concept. Do not reduce readability, accessibility, or input response to protect decorative fidelity. Never report a universal frame rate or load time without a target device, condition, and measurement.

## Baseline first, ambition intact

The semantic DOM contains the real content and links. The heavy scene enhances a complete reading path; it does not hold the first useful screen hostage. Reduced motion removes continuous camera movement, travel, parallax, autoplay, and unnecessary spatial interpolation, while preserving explicit inspection and meaningful final states. Touch should receive a deliberate composition and controls, not a shrunken desktop viewport. A static equivalent can retain the visual idea without running the same simulation.

## Action integrity and integration limits

A quote request, checkout, registration, or publishing action needs truthful behavior beyond its animation. Verify the actual endpoint, recipient, permissions, and response path when integration is in scope and configured. Never invent an address, silently discard a submission, simulate success in production, or send a test message externally without the required authorization.

For a frontend-only scope, complete the interface, validation, pending/error handling, and documented integration adapter; a development-only test double can verify client behavior when clearly labeled and excluded from production success claims. Report client implementation separately from real delivery verification. If a full working integration is requested but required service details are missing, keep that delivery requirement unresolved, complete independent work, and request only the missing information needed to connect it. A missing optional scene is not a broken primary task; an unconfigured requested delivery path is not a verified success.
