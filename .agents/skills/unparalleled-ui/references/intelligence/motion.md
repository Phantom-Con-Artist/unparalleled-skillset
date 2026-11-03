# Motion intelligence

Motion explains change: where something came from, where it went, what caused it, what depends on it. A professional writes down why each animation exists, chooses timing and easing for its meaning and distance, keeps it fast and interruptible, and provides an equivalent for people who reduce motion.

## What the discipline decides

- **Purpose** of each animation: feedback (an action registered), orientation (where something moved), relationship (what is connected), state change (what is different now), narrative (**Website**: a story beat tied to scroll or time).
- **Trigger**: user action, native scroll position, system event, time. Never motion with no trigger and no meaning.
- **Timing**: by distance and importance. Feedback roughly 100–200ms, small transitions 150–300ms, larger spatial moves 300–500ms, narrative sequences longer with stable reading windows.
- **Easing**: decelerate on entry (ease-out), accelerate on exit (ease-in), standard ease-in-out for on-screen moves, linear for constant processes (progress, clocks). Springs only when a physical response fits. Record the actual curves.
- **Choreography**: order and stagger between elements; one focus of motion at a time.
- **Interruption and reversal**: what happens when the user acts mid-animation or scrolls back.
- **Reduced motion**: the static or crossfade equivalent that carries the same information.
- **Performance**: compositor-only properties, frame budget, offscreen pausing.

## Standards and data

| Source | What it settles |
| --- | --- |
| WCAG 2.2 SC 2.2.2 Pause, Stop, Hide (A) | Auto-moving content lasting over 5 seconds can be paused, stopped or hidden. |
| WCAG 2.2 SC 2.3.1 Three Flashes or Below Threshold (A) | Nothing flashes more than three times per second. |
| WCAG 2.2 SC 2.3.3 Animation from Interactions (AAA) | Motion triggered by interaction can be disabled; honor `prefers-reduced-motion`. |
| MDN `prefers-reduced-motion`, View Transitions API | Implementation of reduced motion and state-to-state transitions. |
| Material 3 motion, IBM Carbon motion, Apple HIG motion | Professional duration and easing tokens by purpose. Learn the method. |
| NN/g animation purpose in UX | Animation should explain, give feedback or guide attention; otherwise it slows people down. |
| web.dev animations guide | Animate `transform` and `opacity`; avoid layout-triggering properties. |

Links: [sources.md](sources.md#motion). Detailed scroll and narrative technique: [pipeline-motion-graphics.md](../pipeline-motion-graphics.md) for Remotion, kinetic type and audio sync.

## Allowed practice

- Motion tokens (durations and easings by purpose) defined once and reused.
- Animating `transform` and `opacity`; `will-change` used sparingly and removed after.
- Shared-element or View Transitions that carry an object from list to detail.
- Scroll-driven animation (CSS `animation-timeline` where supported, or IntersectionObserver) that leaves native scrolling intact and keeps required copy visible without the animation.
- Immediate feedback on press (within about 100ms), even when the result takes longer.
- Kinetic type that follows the language's meaning and holds long enough to read.
- Under `prefers-reduced-motion: reduce`: remove parallax, camera travel, autoplay and large spatial moves; keep short fades and state feedback.
- Pausing animations and render loops offscreen and in hidden tabs.

## Banned practice

- The same fade-up reveal on every section; per-letter staggers on every heading.
- Idle loops with no meaning: levitating objects, spinning logos, pulsing dots, breathing gradients.
- Scroll hijacking: overriding wheel, touch or keyboard scrolling, forced snap through a story, preventing skip.
- Animating `width`, `height`, `top`, `left`, `margin` or `box-shadow` on large areas; `transition: all`.
- Making people wait for an animation before they can act; theatrical preloaders on pages that load quickly.
- Fake loaders, counters or progress that do not reflect real work.
- Cursor-follow spectacle, custom cursors that hide the system cursor, parallax on every layer.
- Motion that is the only carrier of information.
- A global `0.01ms` duration override as the whole reduced-motion strategy while JavaScript motion or hidden content remains.
- Flashing content or rapid strobing.

## Record in design.md (Motion section)

Motion tokens (duration and easing per purpose); a motion score table (moment, trigger, what changes and why, duration/easing, interruption, reduced-motion equivalent); performance budget; libraries and their responsibility.

## Verify

1. Exercise each animation; interrupt it and reverse it.
2. Capture with `capture.mjs --reduced-motion`; it flags continuous loops still running. Confirm all information remains available.
3. Record a performance trace for the heaviest scene: no long frames during scroll, no layout thrash.
4. `capture.mjs` flags repeated identical animations across many elements; justify or remove.
