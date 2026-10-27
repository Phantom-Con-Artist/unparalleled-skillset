# Context before frameworks

Read before scaffolding a new build, changing the stack, or adding a renderer or motion dependency. For local refinements, inspect and retain the existing stack; recommend a change only when the request exposes a concrete limitation. User choices and deployment constraints take precedence. Do not migrate a product merely to match a preferred tool.

## Required decision

Inspect the repository, manifest/lockfile, routes, content/data sources, hosting, team conventions, supported devices and assets. Determine indexing and initial-content needs, server/auth requirements, interaction density, spatial requirements, output format and performance constraints. A public page does not automatically need a server; a dashboard does not automatically need Next.js.

Before implementation, tell the user the recommended stack with a short product-specific rationale, one credible alternative and its tradeoff, and the chosen pipeline. Record these in the existing direction document. Unless the user requested a framework choice or a consequential constraint remains unresolved, state the working stack recommendation and proceed with research/prototyping. This technical recommendation does not waive the specimen approval gate for a new visual direction in [design-collaboration.md](design-collaboration.md). A user-selected stack is the decision: explain and accommodate actual limitations rather than overriding it.

Distinguish the layers: Node.js is a runtime/tooling choice; React and Vue supply UI; Next.js and Nuxt supply application architecture; GSAP and Motion animate; Three.js and Babylon.js render spatial scenes; Blender authors assets; Remotion produces frame-based motion graphics. These decisions can complement each other.

## Choose by the actual need

| Scenario/layer | Candidate | Decision criterion |
| --- | --- | --- |
| Existing product | Current stack | Preserve its contracts and deployment unless an authorized change requires more. |
| Small static experience | HTML/CSS/JavaScript, or Astro for content-led pages | Consider when content and interactive islands do not need a full application runtime. |
| Client application | React with Vite, Vue with Vite, or Svelte | Useful with a separate backend/static hosting; plan routes, initial content and data explicitly. |
| React full-stack application/site | Next.js | Consider when React plus server rendering, routing/data or server capabilities fit the host. |
| Vue full-stack application/site | Nuxt | Consider for Vue with server rendering, prerendering or hybrid route needs. |
| Other established ecosystems | SvelteKit, Astro, or the project's supported framework | Compare content, interaction, server, maintenance and deployment needs; avoid novelty-driven swaps. |
| Runtime | Node.js where supported; hosting-native runtime where required | Development tooling does not imply a production Node server. Check adapters and APIs. |
| Small 2D state transitions | CSS or Web Animations API | Use native tools when they express the complete behavior. |
| Coordinated timelines/scroll | GSAP; ScrollTrigger when needed | Scope, reverse and clean up timelines and triggers. Preserve native scrolling. |
| Component layout/gestures/enter-exit | Motion for React or ecosystem equivalent | Useful for state-led interactions; avoid competing animation owners. |
| Dense 2D graphics | SVG, Canvas 2D, PixiJS | Choose by semantics, object count, manipulation and measured cost. |
| Bespoke real-time 3D | Three.js; React Three Fiber in React; TresJS in Vue where suitable | Direct scene control versus a binding that shares UI and scene state. |
| Engine-oriented spatial application | Babylon.js | Evaluate integrated scene tooling, physics, XR and renderer support against the actual task. |
| Simple model inspection | A glTF viewer such as model-viewer | Consider when inspection is sufficient and a custom engine adds no useful behavior. |
| Rendered motion graphics | Remotion | React compositions for deterministic video, kinetic text and timed audio. |
| Familiar utility icons | React Icons when React fits | Use a coherent set for recognizable controls, import only used icons, check the constituent set's license. Product-defining marks remain bespoke SVG. |

“React Frame” is ambiguous. Do not invent a package or silently equate it with React Three Fiber or Framer Motion (now Motion for React). Check the repository and brief; state a provisional interpretation, or ask a focused clarification if it changes the build.

## Declare the pipeline

Choose **2D**, **3D**, or **hybrid** deliberately. 2D includes flat graphic motion and rendered video. 3D requires genuine spatial content; a tilt or cinematic still does not fulfill a requested interactive model. Hybrid assigns a responsibility to each layer. Also state whether motion is interactive, scroll-driven, audio-driven or rendered. Honor a named dimension; do not add a 3D engine to a flat brief.

Read [pipeline-2d.md](pipeline-2d.md) for the 2D layer, [pipeline-3d.md](pipeline-3d.md) for any 3D production, and [pipeline-motion-graphics.md](pipeline-motion-graphics.md) for substantial timeline, kinetic-type, audio or video work. Hybrid uses both dimensional pipelines with one content/state model.

Record packages and responsibilities, rejected alternative, asset route, browser/server boundaries, target budgets and fallback. Check current official docs, peer dependencies, licenses and deployment support before installation; keep the project's package manager/lockfile. Choose one primary 3D engine. Do not install every candidate or run two animation systems against one property.

## Current official sources

Consult relevant [Node.js](https://nodejs.org/en/learn), [React](https://react.dev/learn), [Next.js](https://nextjs.org/docs), [Nuxt](https://nuxt.com/docs), [Vite](https://vite.dev/guide/), [Astro](https://docs.astro.build/), [SvelteKit](https://svelte.dev/docs/kit), [GSAP](https://gsap.com/docs/v3/), [Motion](https://motion.dev/docs), [Three.js](https://threejs.org/manual/), [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction), [TresJS](https://docs.tresjs.org/), [Babylon.js](https://www.babylonjs.com/specifications/), [PixiJS](https://pixijs.com/), [model-viewer](https://modelviewer.dev/) and [React Icons](https://react-icons.github.io/react-icons/) documentation. This is a decision aid, not a claim that every tool is compatible with every host/version.
