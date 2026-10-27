# Motion graphics, kinetic text and audio synchronization

Use for substantial graphic sequences, kinetic typography, musical timing, explainers, product films and rendered video in either dimensional pipeline. Motion serves actual product meaning. A motion request does not authorize an unsolicited film, song purchase or remote render job.

## Choose output and timing authority

| Output | Route | Timing authority |
| --- | --- | --- |
| Interactive UI/site transitions | CSS/WAAPI, Motion or GSAP | Real UI state, input or native scroll. |
| Audio-led browser sequence | GSAP or chosen renderer with shared cue map | Media/Web Audio clock, including pause, seek and buffering. |
| Deterministic video/kinetic-type film | Remotion React compositions | Composition frame/fps, shared with audio. |
| Real-time spatial graphics | Selected Three.js/R3F or Babylon.js scene | One controlled scene clock with deliberate audio integration. |

Recommend **Remotion** for reproducible video, timed titles, reusable compositions and audio-aligned cuts. Embed its Player only when interactive preview is useful; otherwise deliver optimized video/poster without shipping an authoring stack to the page. Vue/Nuxt can consume rendered video without replacing their UI framework. Check current Remotion APIs, compatibility, license and rendering requirements.

## Score the sequence and type

Write a motion score in the direction record: story beat, truthful claim/image, time/cue, type behavior, transition, stable reading window, audio role and silent/static equivalent. Set aspect ratios, fps, duration, format and safe areas for distribution. Prototype the decisive sequence before extending the film. Fast cuts cannot replace content.

For **kinetic text**, give movement a linguistic reason: emphasize a real contrast, build a phrase, reveal a process or follow speech. Choreograph words/lines/glyphs intentionally; preserve reading order, wrapping, punctuation, language shaping and enough dwell time. Avoid universal letter staggers. Provide accessible full text/transcripts and captions for meaningful speech. On live pages retain semantic text and hide decorative glyph duplicates from assistive technology. Verify actual font loading before rendering.

## Synchronize to the actual song

Use authorized audio; record source, usable excerpt and rights. Song use and reproduction of lyrics are separate permissions; a streaming link is not a reusable asset. If the file is missing, request it/access while building a clearly provisional silent storyboard. Do not claim synchronization from guessed BPM.

Inspect/listen when tools permit. Extract or annotate onset/beat candidates, downbeats, phrase boundaries, accents, rests and tempo changes; verify important cues by playback or waveform inspection. A spectrum/amplitude envelope is not a beat detector. Use analysis for candidates and judgment for emphasis; do not cut on every beat. Keep an editable cue map with seconds, role and confidence, plus audio trim/offset and playback-rate changes.

For a truly constant tempo, begin with `beatTime = firstBeatSeconds + beatIndex * 60 / BPM`, then verify phase against the actual audio. Variable tempo, pickups, syncopation and estimation errors require corrected cues or a tempo map. Convert composition seconds with `round(seconds * fps)` using one canonical fps; account for clip offsets and nested sequence-local frames. Never accumulate rounded beat intervals, which causes drift.

In browsers, use the media playhead or Web Audio clock as authority; derive/seek visuals from it after pause, seek, buffering, rate change and tab return. Do not synchronize independent timers or unintentionally advance music by scrolling. Require intentional play/unmute, expose pause/mute/seek as appropriate and retain a story intelligible without sound.

## Remotion production and checks

Drive rendered visuals from `useCurrentFrame()` and `useVideoConfig()`, with frame-based interpolation/springs and composed sequences. Keep frames deterministic: avoid wall-clock timers, live GSAP loops and unseeded randomness. Explicitly coordinate advanced renderers with the requested frame. Use supported asset/font readiness APIs with bounded failure recovery.

Use audio-data helpers for waveform/spectrum modulation when useful; visualizers do not establish musical phrase alignment. Render a representative segment early, including dense text, the hardest transition and an audio accent. Inspect actual output with sound; Studio preview/stills do not prove successful export/sync.

Deliver source compositions, cue map, authorized assets, required renders, poster and transcript/captions where applicable. Verify start/end, frame cuts, offsets, long-run drift, clipping/levels, interactive seek behavior, dimensions/codec and required crops. On sites/apps, honor reduced motion with a static/simplified baseline and user-controlled playback. Avoid unsafe flashes and maintain contrast through transitions. Record what was rendered/played back and remaining audio/export limits.

## Current primary references

Consult [Remotion APIs](https://www.remotion.dev/docs/api), [audio visualization](https://www.remotion.dev/docs/audio/visualization), [Player](https://www.remotion.dev/docs/player/player) and [license](https://www.remotion.dev/license); use [GSAP](https://gsap.com/docs/v3/) or [Motion](https://motion.dev/docs) for interactive choreography. Check installed versions instead of combining examples from incompatible releases.
