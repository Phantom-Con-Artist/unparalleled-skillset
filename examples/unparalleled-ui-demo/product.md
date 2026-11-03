# Product: Hollow Studio Desk (fictional dispatch screen)

Revision: p2 · Prompt handoff: prompt-handoff.md

## Product
A working dispatch screen for the fictional Hollow ceramics studio (same world as the website example). A person finds a piece that needs packing, checks its destination and collection, changes its packing state, saves locally and returns to the same place in the queue. No order, customer, collection time or shipment is real.

## Audience and tasks
| Audience | Question or job | Success looks like | Cost of a mistake |
| --- | --- | --- | --- |
| Studio member at the packing bench | "Which pieces must leave soonest, and are they packed safely?" | Overdue and due-today pieces are packed and marked before collection | A fragile piece leaves under-protected, or a collection is missed |
| Skill reviewer | "What does the UI skill produce?" | Product truth, design.md and the screen agree | Mistaking sample records for real data |

## Evidence
| Id | Claim | Observation | Status | Source |
| --- | --- | --- | --- | --- |
| F1 | All 24 records are sample data and must be labeled as such | user-stated | verified | Repository example policy; on-screen "A sample studio" |
| F2 | Packing readiness and due date together decide priority | source | verified | `index.html` data model: `due` and `packing` fields drive the "Needs a hand" scope |
| F3 | Counts, scopes and pagination derive from the same 24 records | source | verified | `index.html` script: counts computed from the record array |
| F4 | Changes persist only in session storage, otherwise in memory | source | verified | `index.html` save logic and storage-failure path |
| F5 | The screen shares the website's embedded Bricolage Grotesque (SIL OFL) | source | verified | Embedded @font-face and licence comment in `index.html` |

## Content inventory
| Content | Exists? | Source | Real or stand-in |
| --- | --- | --- | --- |
| 24 order records | Yes | Authored sample array | Stand-in, labeled |
| Packing-layer diagram | Yes | Authored SVG | Illustration of the packing method |

## Brand commitments
Hollow identity from the website example: manganese ink, shelf canvas, kiln-label yellow, the vessel mark and the Hollow font.

## Competitors and references
Generic admin dashboards (KPI cards, sidebar, card grids): the convention this screen deliberately avoids. The queue, not a dashboard, is the work.

## Constraints
Single offline HTML file; JavaScript required for the editing task (stated on screen when absent); WCAG 2.2 AA; keyboard operable; phone use at the bench.

## Gaps
| Question | Impact if unanswered | Proceeding on |
| --- | --- | --- |
| Do drivers get notified on status change? | Would add a confirmation state | No notification; local save only |

## Vocabulary
| Source | Term | Product meaning | Design consequence | Check |
| --- | --- | --- | --- | --- |
| F2 | needs a hand | Due soon and not packed | Default scope and its count; the selected-row yellow is the kiln-label color | Default view shows 8 orders |
| F2 | packing state | Unpacked → cushioned → boxed | Status column with a box mark and text, never color alone | Status has a label and icon |
| F2 | packing bench | Where one piece is inspected | Inspector beside the queue (modal panel on phones) | Selected row and inspector stay in sync |
| F2 | rim, room | Fragile edges need space | Packing diagram shows cushioning around the rim | Diagram caption names the layer |
| F2 | leaving | Collection time | "Leaving" column sorts earliest first | Sort control and aria-sort |
| F3 | queue | The ordered work | Table with row headers, not cards or kanban lanes | Semantic table; no card grid flags |
