# Product: Hollow (fictional ceramics studio)

Revision: p2 · Prompt handoff: the website prompt in `bin/cli.js` ("update the website example")

## Product
Hollow is an **invented** neighborhood ceramics studio used as the website example. The page explains how a pot is made (shape, trim, fire) and invites a first visit. It offers no real classes, schedules, bookings, payments, customer stories or glaze recipes. The main action is local: follow the making process, then read how to begin.

## Audience and tasks
| Audience | Question or job | Success looks like | Cost of a mistake |
| --- | --- | --- | --- |
| Curious adult who has never thrown a pot | "Could I make something here, and what happens to the clay?" | Understands the three stages and feels a first piece is possible | Leaves thinking pottery needs talent or equipment they lack |
| Skill reviewer reading the example | "What does the website skill produce?" | Sees product truth, design.md and the built page agree | Mistakes the fictional studio for a real business |

## Evidence
| Id | Claim | Observation | Status | Source |
| --- | --- | --- | --- | --- |
| F1 | Hollow is fictional and must be disclosed in the first view and the footer | user-stated | verified | Repository example policy (README, `bin/cli.js` prompt) |
| F2 | Wheel pottery proceeds through shaping, trimming and firing with glaze | inferred | assumed | General wheel-throwing practice; written as technique, never as a claim about a real studio |
| F3 | Comparable studios organize pages by class type and membership | source | verified | Same two sites, page content only |
| F4 | The example must work from a local file with no external requests | user-stated | verified | Repository example policy |
| F5 | Bricolage Grotesque is available under the SIL Open Font License | source | verified | Google Fonts METADATA.pb and OFL.txt |

## Content inventory
| Content | Exists? | Source | Real or stand-in |
| --- | --- | --- | --- |
| Vessel illustration (SVG + canvas) | Yes | Authored in code | Illustration of a fictional piece, labeled as such |
| Process copy (shape, trim, fire) | Yes | Written from F2 | General technique, no studio-specific claims |
| Class times, prices, testimonials | No | — | Deliberately absent (F1) |

## Brand commitments
None: a new fictional identity. The wordmark geometry comes from the vessel's rim.

## Competitors and references
| Reference | What was inspected | Shared convention | How this product differs |
| --- | --- | --- | --- |
| Turning Earth | Page content | Classes and membership lists | One vessel explains the making instead of a class catalogue |
| Clay Kiln Craft | Page content | Course-type navigation | The process is the navigation |

## Constraints
2D only (no WebGL); single HTML file; offline; English; WCAG 2.2 AA; native scroll.

## Gaps
| Question | Impact if unanswered | Proceeding on |
| --- | --- | --- |
| Real class schedule and prices | Conversion would be a booking | Fictional: action stays "follow the clay" and "a place to begin" |

## Vocabulary
| Source | Term | Product meaning | Design consequence | Check |
| --- | --- | --- | --- | --- |
| F2 | profile | The line that defines a wall | The flat profile is drawn beside the revolved vessel; the annotation is the profile | Profile and vessel share geometry in design.html |
| F2 | hollow | The space a wall holds | Name, wordmark and the hero's one focal object | Wordmark path derived from the rim |
| F2 | trim | Clay removed from the foot | Stage 2 changes the base geometry, not a decoration | Stage button alters the foot |
| F2 | kiln | Firing changes the surface | Stage 3 changes surface color; kiln-test yellow is the stage ground | Color role `stage` traced to "kiln-test label" |
| F2 | manganese glaze | A dark plum glaze | Ink and action color | Role `ink` / `action` |
| F2 | shelf | Where pieces dry | Cool grey-blue canvas | Role `canvas` |
| F2 | wobble, toolmark | Marks of the hand | Slightly uneven rim and a rotated hand note, never in controls or text blocks | Irregularity limited to the illustration and one note |
| F2 | settle | Glaze pooling in grooves | Motion ends in a settled state, no loops | No infinite animations |
