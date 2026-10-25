# Hollow Studio Desk

This fictional ceramics-workshop dispatch screen belongs to the same product world as the Hollow website. It is an operational example: find a piece that needs packing, inspect its destination and collection context, change the packing state, save locally, and return to the same queue. No order, customer, collection time, or shipment is real.

The governing relationship is the protection of a made object on its way out of the studio. The queue connects due date and packing readiness; the inspector keeps the piece and its packing layers visible while a proposed state changes. The queue changes only after saving. Counts, scopes, pagination, and the attention view are computed from the same 24 sample records.

The visual language shares Hollow's embedded Bricolage Grotesque, plum ink, cool shelf surface, kiln-label yellow, and bespoke vessel mark. The working screen uses compact type, aligned data, restrained grouping, clear control boundaries, and a packing diagram instead of marketing scenes. The embedded font's SIL Open Font License is retained in the HTML. This is a deliberate shared product identity, not a default palette or type pairing for other projects.

Search, collection filters, date sorting, pagination, scope switches, row inspection, packing-state preview, local save, undo, and reset work. Session storage is used when available; otherwise changes remain in memory until reload. Failed writes preserve the previous record and expose retry. On mobile, the inspector is a modal panel with focus containment, Escape, a visible close control, and return to the currently visible selected row or search when it has left the view. Mobile sorting has its own visible control.

The sidebar-free layout keeps the queue central. Short desktop viewports use a normal-flow inspector. Long labels and phone rows retain key information, with full collection/context available in the inspector. Motion only connects the packing preview states and respects reduced motion. The example needs JavaScript for its actual data-editing task and states that requirement honestly when scripting is unavailable.

Verification covers 320px, 390px, 768px, and desktop reading, short-height layout, search and empty states, sorting, pagination, computed counts, packing save/undo, filtered-out selection context, keyboard controls, mobile focus/close, reduced motion, storage failure, and actual contrast pairs. Independent review checks source and rendered screenshots against the UI quality rubric.
