# Motion as an explanation

Motion should show a cause, a change, or a consequence drawn from the prompt and product. Do not apply a universal reveal preset or call every easing curve “spring physics.” Use true spring behavior only when a physical response fits; CSS easing is often enough.

## Write the motion score before coding

| Story beat | Required description |
| --- | --- |
| Intent | What the visitor learns or can do at this moment. |
| Trigger | Native scroll position, a visible control, focus, or an actual system event. |
| Transformation | Which 2D/3D elements change and why their relationship matters. |
| Reading window | When text and controls stay stable long enough to read and use. |
| End state | A comprehensible final composition, including reversal or revisiting. |
| Fallback | The same meaning through static content, reduced motion, touch, and keyboard. |

Design scroll-driven sequences around meaningful changes, not arbitrary percentages. A visitor should be able to skip, reverse, or scroll quickly without losing the explanation. Keep required copy in the DOM and visible in the baseline rendering. Pin only a scene whose duration earns the extra scroll distance; release it promptly on narrow screens or short viewports.

## Engineering

Use progressive CSS scroll-driven animation where supported, or an IntersectionObserver/animation-frame approach matched to the complexity. Feature-detect capabilities. Keep DOM measurement out of per-frame layout loops, favor transforms and opacity, and pause offscreen work. Avoid giant continuously filtered surfaces and unnecessary dependencies. Never suppress native wheel, touch, or keyboard scrolling to drive a timeline.

With `prefers-reduced-motion: reduce`, remove continuous camera travel, parallax, autoplay, and spatial interpolation. Present all important stages as readable static content or user-controlled changes. A global 0.01ms duration override alone is insufficient when code keeps moving objects or content remains hidden. Also respect pointer capability and visibility changes.

Inspect the actual page with motion disabled, JavaScript unavailable where practical, and media failing. Measure the heaviest scene in a real browser before claiming performance. If it stutters, simplify geometry or effects before reducing legibility or navigation quality.
