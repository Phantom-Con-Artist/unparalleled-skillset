# Poterie Céleste: prospective direction

## Product truth, purpose, and scope

A ceramics atelier run by Christie Wallace, showing four collections (Alexanderia, Elegancy, Ymir, Bespoke) and three single heritage pieces, and taking commissions. Surface purpose: Choose. A collector or designer should understand what the atelier makes, want a piece, and write to it. Primary action: a commission brief or enquiry composed as an email to the specimen address `atelier@poterieceleste.com`. Scope: one public page, static HTML on Cloudflare Pages at `/poterie-celeste/`.

Facts come from the supplied photography and brand marks, recorded in `site/apps/poterie-celeste/PRODUCT.md`. Assumptions: the audience, the conversational sales model, and the absence of prices, address, and press. Nothing commercial is invented; pieces read "Price on request" and the footer states the atelier and its photography are a specimen.

## Particular inventory and research

The amphora-and-crescent logo under one star; the umber wordmark with calligraphic flourishes; Alexanderia's black glaze with papyrus relief in burnished gold, set against lapis tile and a Mediterranean shore; Elegancy's fluted ivory porcelain on travertine in curtained daylight; Ymir's folded white vessel and pitted basalt jar beside a winter window and birch trees; the cobalt lidded jar with gold cranes; the celadon vase with carved peonies; the oxblood amphora with gold leaf scrolls; the kintsugi ivory vase, the rose amphora with ribbon handles, and the teal wave moon jar from the commissions; the owner's portrait in linen.

Research limit: no live competitor browsing was run for this specimen. Category knowledge (gallery and atelier sites showing price on request, enquiry by email, visits by appointment) is general and unverified for any named house.

## Governing idea

Glaze is a dull powder until it is fired. The page shows colour arriving from heat: the house piece cools out of white heat on arrival, three classic high-fire glazes mature as the reader scrolls past them, and the commission preview stays chalky until the visitor fires it. A competitor could not swap names into this, because the colour fields, the cooling, and the firing control are taken from these exact glazes and photographs.

## Direction contract

First frame: the ivory and gold pair, full bleed, cooling from white heat to true colour. The wordmark, a two-sentence offer, and "Commission a piece" sit on the dark panelling at left. A heat scale along the bottom edge settles at room temperature.

Attention path: piece, name, offer, action, then the heat scale as the cue for what the page does.

Spatial rules: every collection is a full-width field in its own glaze, with a different composition per room: Alexanderia as a wide scene with the single piece overlapping the field edge; Elegancy as a tall narrow column echoing the fluting; Ymir as a split between winter light and dark stone; commissions as a working desk.

Type: Brygada 1918 (OFL, self-hosted, variable 400 to 700 with italics) for display and reading, its calligraphic stress matching the wordmark; Familjen Grotesk (OFL, self-hosted) for labels, controls, and captions. Fluid scale calculated with clamp.

Palette evidence and proportions: the incandescence ramp is used only for heat (the cooling, the scale, the firing control). Section fields take 100% of their band: lapis `#1E2A55` from the Alexanderia tile panels, porcelain `#EAE3D6` from the Elegancy glaze, glacier `#D3DBDE` from the Ymir vessel, oxblood `#3A120D` from the amphora, celadon `#A3AB92` from the peony vase, soot umber `#17110E` from the wordmark ink darkened toward kiln black. Gold `#C9A15F` from the burnished relief carries emphasis on dark fields only.

Marks: the supplied logo and wordmark, recoloured through CSS masks. Controls are square with a gilt hairline inset, like a gold lip on a rim. No icon set; text labels do the work.

Irregularity: the heritage frieze sets three pieces at different heights and sizes, like objects placed on a long mantel rather than in a grid.

## Assets, voice, and signature prototype

Imagery: the user's photography, converted to WebP at 640, 1200, and full width (`assets/manifest.json`). It appears to be generated imagery, so captions describe pieces, not places or people as documentary fact.

Voice: the atelier speaking plainly about forms, glazes, and how a commission works. No biography details for Christie Wallace beyond her name and role.

Signature: the commission desk. The visitor chooses form, glaze, gold finish, and height; a drawn vessel updates in raw glaze; "Fire the preview" runs the heat ramp over it and settles into the fired colour; "Write to the atelier" opens an email with the brief written out, and "Copy the brief" covers webmail. Keyboard: native radio groups and buttons. Reduced motion: firing switches state without the ramp. Hard relationship to prototype: generating believable vessel silhouettes from profiles.

## Five hypotheses and decision

See `design-specimens.html`. Chosen: The kiln firing (assigned by the impeccable concept roll). The daylight section stays the competitive alternate.

## Story and motion score

| Beat | Real content or proof | Trigger and transformation | Stable reading or action | Touch/keyboard/static equivalent | Failure and interruption |
| --- | --- | --- | --- | --- | --- |
| Arrival | Ivory and gold pair | Load: heat overlay cools through the ramp in 2.6s; scale marker slides to room temperature | Text and action visible from the first paint | Reduced motion shows the cooled frame | If the image fails, the umber field and copy stand |
| Heritage glazes | Celadon, cobalt, oxblood pieces with captions | Scroll: each image moves from chalky raw to fired as it crosses the viewport | Captions always visible | "Show unfired" control toggles state; reduced motion shows fired | No scroll-timeline support: IntersectionObserver class |
| Collections | Three glaze rooms | None beyond native scroll | Full | Static | Image failure leaves the field colour and text |
| Commission | Form, glaze, finish, height, room notes | Visitor fires the preview | Summary sentence always current | Native radios and buttons; reduced motion skips the ramp | Email app missing: copy fallback with status message |
| Close | Visits, letters, email | None | Full | Static | None |

## Engineering and acceptance

Static HTML, one CSS block, one small script, no dependencies. Fonts preloaded, `font-display: swap`. Only transforms, opacity, and one-shot filters animate. Acceptance: all five viewports plus reduced motion captured and inspected; real contrast pairs measured per field; keyboard path through the commission desk; mailto and copy behaviour checked; asset failure checked by blocking images.

## Revision, 26 October 2026: user-pinned direction

The user replaced the kiln-firing direction and the single static page with their own brief: a multi-page React site whose centrepiece is a 3D pot made in Blender, white and minimal with a light texture, on a pedestal in a spotlit studio with a cracked white putty wall, that shatters into floating pieces on scroll; images and words on either side; the owner's portrait with a quote in the footer; and the same pot inverted like a reflection near the bottom, with the same effect. Later feedback: an original pot rather than a copy of the reference, photorealistic and non-repeating wall texture, a rough pot surface, worn pedestal edges, no bento grids, and a pot and pedestal that stand out from the wall.

The live contract is the surface brief in `site/apps/poterie-celeste/.impeccable/surfaces/public-poterie-celeste-index-html.md`. Asset provenance: wall, plinth and pot surface maps are CC0 scans from Poly Haven (`concrete_wall_003`, `white_stucco_02`, `white_stucco`), graded locally; the speckle albedo and all geometry were authored in this session; product photography was supplied by the user; the poster still is a capture of the live scene.
