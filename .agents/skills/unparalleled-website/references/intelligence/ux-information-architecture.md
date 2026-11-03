# UX and information architecture intelligence

Information architecture (IA) is how content is organized, labeled and connected so people can find it and understand where they are. UX is whether they can complete what they came for. A professional starts from the people and their tasks, builds a structure from real content, then designs navigation and flows on top of it.

## What the discipline decides

- **Audience and tasks**: who arrives, with what question or job, and what counts as success (from product.md).
- **Content inventory**: what content exists or is needed, and its priority per audience.
- **Organization scheme**: by task, audience, topic, time, location or alphabet; the hierarchy depth.
- **Labeling**: words people actually use (from product.md vocabulary and user language), consistent across navigation, headings and buttons.
- **Navigation**: global, local and contextual; breadcrumbs, search, skip links; how people return.
- **Page and screen structure**: landmarks, heading outline, reading order, progressive disclosure.
- **Flows**: the primary journey step by step, including error, empty, loading and recovery states.
- **Wayfinding**: where am I, where can I go, how do I get back.
- **Website**: the narrative arc (arrival, orientation, proof, action, exit). **App UI**: the shell from the task (list-detail, canvas-inspector, wizard, single form).

## Standards and data

| Source | What it settles |
| --- | --- |
| ISO 9241-210 (human-centred design) | The design cycle: understand context, specify requirements, produce, evaluate. |
| NN/g ten usability heuristics | Status visibility, match with the real world, user control, consistency, error prevention, recognition over recall, flexibility, minimalism, error recovery, help. |
| NN/g IA vs navigation, progressive disclosure, card sorting | Structure first, then navigation; reveal complexity gradually; test labels with users. |
| Laws of UX (Hick's law, Fitts's law, cognitive load) | Fewer, clearer choices decide faster; important targets large and close; reduce memory load. |
| WCAG 2.2 SC 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks, 2.4.2 Page Titled, 2.4.6 Headings and Labels, 3.2.3 Consistent Navigation, 3.2.4 Consistent Identification, 3.2.6 Consistent Help | Structure exposed in markup; skip links; consistent navigation and help placement. |
| W3C WAI page structure tutorial | Landmarks (`header`, `nav`, `main`, `footer`), heading hierarchy, regions. |

Links: [sources.md](sources.md#ux-and-information-architecture).

## Allowed practice

- A written sitemap or screen map and the primary flow before visual design.
- Navigation labels in the users' words; one label per concept everywhere.
- Shallow, broad hierarchies when users scan; deeper ones when they must narrow down.
- Progressive disclosure: essentials first, detail on demand, with the control's state visible.
- One clear primary action per view; secondary actions visually quieter.
- Landmarks and one `h1` per page with an unbroken heading outline.
- Empty states that say what goes here and how to start; error messages that say what happened and what to do.
- Preserving user context (filters, scroll, selection, form input) across navigation and errors.
- Semantic lists, tables and description lists where the content has that shape.

## Banned practice

- Navigation organized by the company's internal structure instead of user tasks.
- Mystery-meat navigation (icon-only or clever labels with no plain meaning).
- More than about 7 top-level navigation items without grouping or search.
- Hiding essential content behind hover, carousels, tabs or accordions by default when people need it to decide.
- Content structure faked with styled `div`s: headings chosen by size instead of level, skipped levels, multiple `h1`s.
- Dead ends: no route back, no next step after success or failure.
- Marketing or explanatory copy delivered as bullet inventories and icon rows instead of connected explanation; a real list of choices hidden in a paragraph.
- Forcing users to re-enter information they already gave in the same flow (WCAG 3.3.7).
- Changing context on focus or input without warning (WCAG 3.2.1, 3.2.2).
- A different navigation order or help location on each page.

## Record in design.md (UX and IA section)

Audiences and their top tasks; sitemap or screen map; primary flow with every state; navigation model; label glossary; heading outline for key pages; landmark map; progressive-disclosure decisions.

## Verify

1. Perform the primary task end to end in the browser, including one failure and recovery.
2. Check the heading outline and landmarks (browser accessibility tree or a screen reader's headings list).
3. Five-second test on the first view: can a stranger say what this is and what to do next?
4. Tab through the page: the skip link works, focus order follows the reading order, nothing traps focus.
