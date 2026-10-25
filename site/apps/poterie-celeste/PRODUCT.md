# Product

<!-- impeccable:product-schema 1 -->

Scope: this record covers the Poterie Céleste specimen, source in `apps/poterie-celeste/`, built to `public/poterie-celeste/`. The Unparalleled homepage at `public/` will need its own record when it is built.

Source of truth: the user's brief ("ultra luxurious", "make it look real", "specimen email with the brand name") and the supplied photography. No interview round was run; the repository's CLAUDE.md asks for a sufficient brief to proceed without one. Every fact below marked *(inferred)* came from the photographs or the brand name, not from the user.

## Platform

web

## Stack

React 19 with Vite, React Router, React Three Fiber and drei for 3D, GSAP ScrollTrigger for scroll, and Motion for interface transitions (chosen by the user). Built into `site/public/poterie-celeste/` and served by Cloudflare Pages. Fonts self-hosted. The centrepiece pot, its 36 fracture pieces, the plinth and the studio backdrop are modelled in Blender (`design/poterie-celeste/source/poterie-celeste-pot.blend`) and exported as a Draco GLB.

## Users

People who buy or commission one-off decorative ceramics at the top of the market: collectors furnishing a house, interior designers sourcing a statement piece for a client, and people commissioning a gift or a piece for a particular room. *(inferred)* They arrive from a referral, a magazine credit, or a designer's recommendation, look at the work slowly, and want to know whether a piece can be acquired or made for them.

## Product Purpose

Poterie Céleste is a ceramics atelier run by its owner, Christie Wallace. It makes vases, amphorae, and lidded vessels in named collections and takes private commissions. The site exists to show the work at the scale and finish it deserves and to start a conversation: an acquisition enquiry, a commission brief, or a studio appointment.

## Positioning

*(inferred)* The atelier's mark is an amphora holding a crescent moon under a single star, and its name means "heavenly". Every collection is a glaze world with its own room: Alexanderia in black and burnished gold with papyrus relief, Elegancy in fluted ivory, Ymir in glacial white beside dark stone, and the commissions in kintsugi ivory, ribboned rose, and a deep teal wave. Single pieces carry classic glaze names: celadon, cobalt, oxblood, ivory and gold.

## Operating Context

Acquisition at this level is conversational. Pieces are shown with price on request, enquiries go to the atelier by email, commissions begin with a brief about the room, form, glaze, and occasion, and visits happen by appointment. *(inferred)*

## Capabilities and Constraints

- Confirmed by the assets: four collections (Alexanderia, Elegancy, Ymir, Bespoke), grouped on the site with the heritage glaze pieces as a fifth,, four named single pieces (Celadon Peony Vase, Cobalt Crane Lidded Pot, Oxblood Amphora Vase, the Ivory and Gold pair), an owner portrait, a logo, and a wordmark.
- Contact: specimen address `atelier@poterieceleste.com`, as the user requested. No real mailbox exists, so forms compose an email rather than claiming delivery.
- Undecided and not to be invented: prices, street address, opening hours, press, awards, stockists, client names, dimensions beyond honest approximations, firing temperatures, clay bodies.

## Brand Commitments

- Name set as **Poterie Céleste** with the acute accent; the supplied wordmark and amphora-and-moon logo are the identity marks.
- Owner: Christie Wallace.
- Collection names exactly as supplied: Alexanderia (this spelling), Elegancy, Ymir, Bespoke.

## Evidence on Hand

WebP renditions and dimensions in `public/poterie-celeste/assets/manifest.json`, converted from the user's source PNGs. All photography appears to be generated imagery, so the page must not present it as documentary evidence of a real studio, real rooms, or real clients. No testimonials, press, prices, or sales figures exist.

## Product Principles

- The piece leads. Interface, type, and motion exist to frame the object and get out of its way.
- Every glaze is a world. A collection is presented in the colour and light of its own room, never on a neutral grid.
- Conversation over checkout. The primary action is a personal enquiry, never a cart.
- Honesty is part of the luxury. No invented scarcity, prices, praise, or provenance; the page states plainly that it is a specimen.

## Accessibility & Inclusion

WCAG 2.2 AA: readable contrast on every glaze-coloured field, full keyboard path through the collections and commission form, reduced-motion equivalents, and alt text that describes each piece the way a curator would.
