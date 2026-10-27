# Research-first 3D production pipeline

Use for any new 3D asset or scene, including procedural geometry and 3D rendered into video. A procedural mesh is model production; it does not bypass research or tool readiness. Hybrid work retains semantic 2D controls and content.

## 1. Define spatial purpose

Record what depth, rotation, material, assembly or simulation helps someone understand or do. Select the engine through [framework-selection.md](framework-selection.md). Define asset roles, verified product details, units/views, states, target devices, download/GPU budgets and a non-WebGL route. Distinguish interactive models from prerendered films/stills. Inspect supplied CAD/models first.

## 2. Research open models and gather visual evidence before modeling

**Before building any model from scratch, research relevant openly licensed models and inspect visual references.** Search product-specific terms, shape/material variants and suitable collections. Starting points include [Poly Haven](https://polyhaven.com/models), [ambientCG](https://ambientcg.com/), [Blendkit (formerly BlenderKit)](https://www.blendkit.com/) and [Sketchfab](https://sketchfab.com/). Check each candidate's actual availability/license. A free download or searchable preview does not establish permission to modify, redistribute or ship it.

Keep a research table in the direction record: query/source URL, candidate/creator, license/attribution, product match, inspected format/scale/material/geometry limitations, and reuse/adapt/reject decision. Inspect candidates rather than deciding from titles. Choose reuse, adaptation, composition or scratch authoring based on evidence. Explain why scratch work is necessary when candidates are rejected; never substitute an unrelated stock product for the real one.

Gather and actually view references covering silhouette, front/side/detail relationships, proportions, materials, light and usage context where available. Prefer verified product imagery for factual geometry; note missing dimensions and uncertain features. Save permitted references or retain source links and viewing notes. Generated concepts supplement evidence and never establish manufacturing truth.

If research or reference viewing is unavailable, disclose the gap and request the required access/source material before scratch modeling. Continue independent page/layout work; do not claim research occurred or quietly replace the requested model with an invented primitive.

## 3. Establish Blender and MCP readiness before production

Use **Blender with MCP for Blender** for asset authoring/adaptation. The community [ahujasid/mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) project was formerly named blender-mcp. Verify current installation instructions and the active client's MCP schema rather than pasting assumed configuration.

Discover existing Blender tools first. Configure the connection when permitted: inspect local Blender/runtime availability and the relevant client configuration; install the compatible add-on/server, merge only the required MCP entry while preserving other servers, enable the add-on and start its connection in Blender, and reconnect the client as its current instructions require. Confirm readiness through read-only add-on/connection status and scene inspection. Record what actually succeeded; configuration text is not proof of a working connection.

If installation, configuration access, a GUI action, network or restart is outside agent access, ask the user for that exact step, link the project instructions and identify the readiness check that follows. **Pause dependent 3D production until the connection is verified.** Continue research, storyboarding, DOM/fallback and independent tasks. Do not bypass the gate by making final geometry in JavaScript; a user-approved alternative workflow must be explicit and recorded. Do not alter global permissions or unrelated MCP configuration to obtain access.

Before mutation, inspect the current scene, protect existing work and use a dedicated collection/file. MCP Python runs in the user's Blender process. Do not delete unrelated objects or overwrite their .blend file. Scope tools to requested assets; paid generation services or external uploads require existing authorization.

## 4. Direct and author

When an Imagen/imagegen skill or equivalent tool is available, follow [image-generation-direction.md](image-generation-direction.md) and generate product-specific cinematic, avant-garde visual studies before final look development. Use them for composition, material/light exploration and honest posters; they are not geometry evidence or a live scene.

Reuse/adapt researched assets when they fit. Author missing geometry in Blender against inspected references. Check silhouette/proportions from several views before details; then resolve topology, normals, UVs, materials, light, camera and animation. Inspect viewport captures/renders and revise against evidence. Retain editable .blend sources and imported mesh/texture provenance. An unseen tool result is not a finished asset.

## 5. Export and integrate

Export a web-appropriate asset, commonly glTF/GLB, and validate it in the chosen runtime. Verify units, orientation, pivot, material/color behavior, animation clips and texture paths. Set geometry/texture budgets from target scenes/devices; optimize with supported compression, instancing and levels of detail where measured results justify them. Confirm decoder support/cost before enabling compression.

Keep browser-only rendering behind the appropriate client boundary and preserve server-rendered content where used. Provide measurable progress where available, error/retry, explicit controls, touch/keyboard alternatives, context-loss recovery and a useful poster/data fallback. A poster does not replace essential spatial editing. Dispose GPU resources, stop unnecessary loops and deliberately share camera/selection state with DOM controls.

## 6. Verify and deliver

Run [visual-review-loop.md](visual-review-loop.md). Inspect the model and complete journey at target sizes, reduced motion, keyboard/touch, slow/failed assets, unsupported graphics and context loss. Measure the heaviest scene against budgets. Deliver model sources, optimized exports, reference/license record, integration and evidence. Disclose incomplete 3D production and tool/research limits precisely.

For new surfaces, obtain specimen approval through [design-collaboration.md](design-collaboration.md) before full integration/production; early 3D work should be the bounded prototype needed to evaluate the direction.
For public 3D experiences read [website-3d-references.md](website-3d-references.md), translating observed intent rather than copying a reference scene.
