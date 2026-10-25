---
name: Poterie Céleste
description: A spotlit plaster studio where one stoneware vessel breaks and mends, and every collection lives in its own glaze field.
colors:
  putty: "#efebe5"
  putty-2: "#e5e0d8"
  putty-3: "#d6d0c6"
  ink: "#2b1f19"
  ink-2: "#554740"
  iron: "#7a5a42"
  night: "#221915"
  line: "rgb(43 31 25 / 0.16)"
  line-strong: "rgb(43 31 25 / 0.32)"
  gold-lip: "rgb(214 190 150 / 0.55)"
  studio-chalk: "#f4eee6"
  studio-amber: "#e9cfa8"
  studio-ground: "#6f675e"
  studio-scrim: "rgb(28 21 17 / 0.66)"
  colophon-ink: "#eae3d9"
  colophon-muted: "#c9bfb2"
  quote-gold: "#c9a77c"
  error-oxide: "#8a2a1a"
  placeholder: "#6f625a"
  desk-ground: "#e6e1d9"
  alexanderia-field: "#1e2a55"
  alexanderia-ink: "#f1e8d8"
  gilt-accent: "#d9b673"
  elegancy-field: "#ebe4d6"
  ymir-field: "#d3dbde"
  ymir-ink: "#1f1d1c"
  ymir-accent: "#4c5b63"
  heritage-field: "#2a1712"
  heritage-ink: "#f2e6d8"
  bespoke-field: "#3a120d"
  bespoke-ink: "#f5e9dc"
  bespoke-accent: "#e0b9a6"
typography:
  display:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(2.75rem, calc(1.5rem + 5.5556vw), 6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(2.5rem, calc(1.6667rem + 3.7037vw), 5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  title-section:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(2rem, calc(1.4167rem + 2.5926vw), 3.75rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(1.375rem, calc(1.2083rem + 0.7407vw), 1.875rem)"
    fontWeight: 500
    lineHeight: 1.1
  lede:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(1.1875rem, calc(1.0833rem + 0.463vw), 1.5rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(1.0625rem, calc(1.0208rem + 0.1852vw), 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"onum\" 1, \"pnum\" 1"
  quote:
    fontFamily: "Brygada 1918, Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif"
    fontSize: "clamp(1.75rem, calc(1.2rem + 2.2vw), 3.25rem)"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Familjen Grotesk, Gill Sans, Gill Sans MT, Trebuchet MS, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.01em"
  label-small:
    fontFamily: "Familjen Grotesk, Gill Sans, Gill Sans MT, Trebuchet MS, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1rem, calc(0.3333rem + 2.963vw), 3rem)"
  section: "clamp(4.5rem, calc(2.5rem + 8.8889vw), 10.5rem)"
  head-gap: "clamp(2.5rem, 5vw, 4.5rem)"
  row: "1.75rem"
  control-x: "1.4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.putty}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.4rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.iron}"
    textColor: "{colors.putty}"
  button-small:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.putty}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
    height: "2.75rem"
  button-light:
    backgroundColor: "{colors.putty}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.4rem"
    height: "3rem"
  button-studio:
    backgroundColor: "{colors.studio-chalk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.6rem 1rem"
    height: "2.75rem"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "2.75rem"
  text-link-hover:
    textColor: "{colors.iron}"
  input-field:
    backgroundColor: "rgb(255 255 255 / 0.55)"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.85rem 0.9rem"
  choice:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.55rem 0.95rem"
    height: "2.75rem"
  choice-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.putty}"
  masthead-solid:
    backgroundColor: "{colors.putty}"
    textColor: "{colors.ink}"
    padding: "1rem {spacing.gutter}"
  masthead-studio:
    textColor: "{colors.studio-chalk}"
  visit-strip:
    backgroundColor: "{colors.night}"
    textColor: "{colors.putty}"
  colophon:
    backgroundColor: "{colors.night}"
    textColor: "{colors.colophon-ink}"
---

# Design System: Poterie Céleste

## Overview

**Creative North Star: "The Plaster Studio"**

The site is a single room in a stone studio, lit once. A cracked putty wall, a worn stucco plinth one step darker than the pot, and a matte speckled stoneware vessel as the brightest thing in frame. The home page is that room rendered live in WebGL, pinned for 520vh of scroll while the vessel goes whole, breaks, hangs in the light, and mends. At the foot of the page the same studio comes back turned upside down like a reflection on stone, then hands over to the owner's portrait and quote. Everything else, from inner pages to forms, is the same room in daylight: putty plaster, umber ink taken from the wordmark, and iron taken from the clay speckle.

Collections leave the studio palette behind on purpose. Each one is a glaze field (field, ink and accent), and its hero, its row in the collections index and the "next room" band at the foot of the previous collection all flood with that colour. The interface stays sparse. Square controls with an inner gold rim, ruled lists instead of boxes, Brygada 1918 for anything read and Familjen Grotesk for anything you operate or file.

Where the build differs from the direction contract, the build is recorded here. The contract asked for "light Brygada" on the opening line. The shipped stage title is weight 500 (the display role below), which reads better over the dark scrim.

**Key Characteristics:**
- One warm key light, one wall pool, and the pot as the brightest object; the interface never outshines it.
- Putty, umber ink and iron on every non-collection page; a dedicated glaze field on every collection.
- Zero radius everywhere; the gold lip (a 1px rim set 3px inside) is the control signature.
- Structure comes from 1px hairlines and ruled lists, never from cards or tiles.
- Brygada 1918 carries the voice and Familjen Grotesk carries labels, with old-style proportional numerals in body text.
- A shatter curve on scroll does the storytelling, and every chapter has a static, reduced-motion equivalent.

## Colors

A warm, low-chroma plaster palette with one iron accent, and saturated glaze fields reserved for the collection rooms.

### Primary
- **Iron Speckle** (iron): The clay's speckle, and the only accent on putty pages. It covers hover fills on primary buttons, link hover colour and underline, focus outlines (2px, offset 3px), the current-room marker in the collections index (an inset 2px left rule), "Price on request" terms lines, process numerals, the journal drop cap, form `accent-color` and caret.

### Secondary
- **Gold Lip** (gold-lip): The inner rim on every dark control and on the selected commission choice. It shows up only as a 1px line, never as a fill or a text colour.
- **Quote Gold** (quote-gold): The large opening quotation mark over the owner's quote in the footer.

### Tertiary: glaze fields
Each collection carries a triple of field, ink and accent, applied as `--field`, `--field-ink` and `--accent` on the page or row.
- **Alexanderia Lapis** (alexanderia-field) with **Papyrus Ink** (alexanderia-ink) and **Burnished Gilt** (gilt-accent).
- **Elegancy Ivory** (elegancy-field), using the house umber ink and iron as its ink and accent.
- **Ymir Drift Ice** (ymir-field) with **Basalt Ink** (ymir-ink) and **Fold Shadow** (ymir-accent).
- **Heritage Kiln Brown** (heritage-field) with **Heritage Ink** (heritage-ink) and **Burnished Gilt** (gilt-accent).
- **Bespoke Oxblood Room** (bespoke-field) with **Bespoke Ink** (bespoke-ink) and **Rose Slip** (bespoke-accent).

### Neutral
- **Putty Plaster** (putty): The page ground, the solid masthead, the mobile menu sheet, and the light button.
- **Second Coat** (putty-2): Recessed bands such as the heritage mantel, the mark panel, the letters sign-up, and cutout plates behind product photographs.
- **Third Coat** (putty-3): Scrollbar thumb and the deepest plaster step.
- **Umber Ink** (ink): All text on putty, primary button fill, the selected choice, and the selection background.
- **Worn Umber** (ink-2): Ledes, captions, dates, form intros and secondary prose.
- **Kiln Night** (night): The visit band and the colophon. It is the only dark band on a putty page.
- **Hairline** (line) and **Strong Hairline** (line-strong): Row dividers and the top rule of every ruled list, respectively. Form fields also use the strong hairline as their bottom border.
- **Studio Chalk** (studio-chalk): Text, links and the light masthead CTA wherever the live studio is behind them. It is the light ink of the studio, and it is not white.
- **Studio Amber** (studio-amber): Link hover over the studio.
- **Studio Ground** (studio-ground): The canvas clear colour and poster backing while the scene loads.
- **Studio Scrim** (studio-scrim): The dark umber gradient behind stage copy. It runs from 0.66 at the left edge to 0 by 48% on desktop, and on mobile rises from the bottom (0.9 down to 0 by 56%).
- **Colophon Ink** (colophon-ink) and **Colophon Muted** (colophon-muted): Footer text, plus the specimen disclaimer and the role line.
- **Desk Plaster** (desk-ground): Background of the commission desk's 3D canvas.
- **Oxide Red** (error-oxide): Form error text only.
- **Placeholder Umber** (placeholder): Input placeholders at full opacity.

### Named Rules
**The Brightest Thing Rule.** In the studio, the pot is the brightest object in frame. Interface ink over the scene is studio chalk with a soft umber text-shadow, never pure white.

**The Glaze Field Rule.** A collection is always shown in its own field, ink and accent. It never sits on putty or on a neutral grid. A new collection needs a new triple that passes AA for ink on field before it ships.

**The One Iron Rule.** On putty pages, iron is the only accent. It marks state (hover, focus, current) and terms, and it is never used as a section background.

## Typography

**Display Font:** Brygada 1918 (with Iowan Old Style, Palatino, Georgia)
**Body Font:** Brygada 1918
**Label Font:** Familjen Grotesk (with Gill Sans, Trebuchet MS)

**Character:** Brygada is a restored Polish book serif. Its italics and old-style figures give the atelier a voice that reads like a catalogue raisonné. Familjen Grotesk is a narrow, slightly quirky grotesque that handles controls, dates, terms and specs, so it reads as the museum label beside the object.

### Hierarchy
- **Display** (500, 2.75rem to 6rem, line-height 0.98, -0.02em): The stage chapter titles, the atelier heading, and the 404.
- **Headline** (500, 2.5rem to 5rem, 1.04): Page H1s, the journal lead and the "next room" name. Collection titles use a near-identical clamp (2.5rem to 5rem) and wrap anywhere.
- **Title, section** (500, 2rem to 3.75rem, 1.04): Section H2s and collection names in the index list.
- **Title** (500, 1.375rem to 1.875rem, 1.1): Room names, piece names, journal titles and process steps. The current room switches to italic.
- **Lede** (400, 1.1875rem to 1.5rem, 1.45): Page and section introductions in worn umber, kept to about 30 to 44ch.
- **Body** (400, 1.0625rem to 1.1875rem, 1.6, old-style proportional numerals): Running text. Journal bodies sit at 38rem wide with 1.7 leading and an iron drop cap 3.6em tall.
- **Quote** (italic 400, 1.75rem to 3.25rem, 1.18): The owner's quote only.
- **Label** (Familjen 500 to 600, 0.9375rem): Buttons, navigation, captions, stage labels and contact lines.
- **Label small** (Familjen 500 to 600, 0.875rem): Dates, terms, field labels, spec terms, crumbs and the scroll cue. Sentence case, never uppercase-tracked.

### Named Rules
**The Read or Operate Rule.** Brygada for anything a visitor reads. Familjen for anything they press, scan or file. The one crossover is the mobile menu, which sets its links in Brygada at 1.75rem because there it is the page.

**The Balanced Head Rule.** Headings use `text-wrap: balance` and paragraphs use `pretty`. Headings track slightly tight (-0.012em) and display tracks tighter (-0.02em).

## Layout

The layout is asymmetric and gutter-bound, with no centred container. The page gutter is fluid (1rem to 3rem), and section rhythm is fluid too (4.5rem to 10.5rem vertically). Two-column splits are deliberately uneven (0.9fr to 1.3fr, 1.2fr to 1fr, 1.55fr to 1fr) and collapse to one column at 900px. Images bleed to the gutter edge where the room calls for it: the collection hero, the "next room" band and the owner portrait use negative gutter margins.

The home stage is a 520vh section with a 100svh sticky viewport. Its overlay grid is three columns (copy, a 16rem-to-34vw clear centre for the pot, and the label). Below 900px it becomes one column, with copy at the bottom and the label tucked top-right. Media-and-text pairs pin with `position: sticky; top: 6rem` on desktop (room view, piece visual, commission desk) and unpin on mobile. The heritage mantel steps three pieces at different heights (5rem, 0 and 8rem offsets) on a shared baseline rule.

Breakpoints are 1100px (the index list folds its thumbnail), 900px (single column and the menu sheet), 560px (single piece column and a smaller wordmark), and short phones at 480 by 720 (a compressed stage).

## Elevation & Depth

Depth comes from cast light, not from interface elevation. The studio is lit by a real spot key with soft PCF shadows, a wall pool and a low rim, all tone-mapped with AgX at exposure 1.18. Off the stage, the system is flat and tonal: putty, then a second coat, then kiln night. The only shadows describe objects sitting in light: drop-shadows under cut-out vessels, a deep falloff under the stage aside photograph, and text-shadows that seat studio copy on the scrim. Controls use inset shadows only to draw the gold lip, which is a line, not a lift.

### Shadow Vocabulary
- **Cutout cast** (`filter: drop-shadow(0 20px 18px rgb(43 31 25 / 0.25))`, ranging from 18px to 26px blur and 0.25 to 0.28 alpha): Under every background-free vessel photograph, on plates, shelves and the piece page.
- **Stage print** (`box-shadow: 0 30px 50px -24px rgb(0 0 0 / 0.55)`): The framed photograph beside a stage chapter.
- **Stage seat** (`text-shadow: 0 2px 30px rgb(28 21 17 / 0.35)` on titles, `0 1px 14px rgb(28 21 17 / 0.55)` on body): Copy over the live scene.
- **Gold lip** (`box-shadow: inset 0 0 0 3px <fill>, inset 0 0 0 4px rgb(214 190 150 / 0.55)`): The control rim. See Shapes.
- **Masthead hairline** (`box-shadow: 0 1px 0 var(--line)`): The solid header once the page scrolls.

### Named Rules
**The Cast Light Rule.** A shadow has to be one the studio light could cast on an object. Interface panels never float.

## Shapes

Every corner is square (0px). Form is drawn with 1px lines. Ruled lists open with a strong hairline and close each row with a soft one. The stage label is a 1px chalk rule on its left edge. Form fields have a bottom border only. The signature shape is the gold lip, a 1px rim set 3px inside a square control, like the gilt lip on a pot. Image crops use fixed vessel-friendly ratios: 4:5 for pieces and portraits, 3:2 for rooms and journal leads, and 4:3 for visit images and mobile collection scenes. The marks (amphora logo and wordmark) are CSS masks over `currentColor`, so they take whatever ink the surface uses.

## Components

### Buttons
Square, weighty and quiet, like a gilt-rimmed lid.
- **Shape:** Square corners (0px), at least 3rem tall (2.75rem for the small size).
- **Primary:** Umber ink fill with putty Familjen 600 at 0.9375rem, padded 0.8rem by 1.4rem, with a gold-lip rim inside.
- **Hover / Focus:** The fill eases to iron and the rim brightens to `rgb(240 222 190 / 0.7)` over 0.3s on the house ease-out. Pressing nudges the button down 1px. Focus is the global 2px iron outline.
- **Light:** A putty fill with an iron rim, used over the studio and on dark bands. Over the studio, the masthead CTA switches to a studio-chalk fill.
- **Text link / text button:** Familjen 500, underlined 1px with a 0.35em offset, at least 2.75rem tall. It turns iron on hover, or studio amber over the scene.

### Chips (commission choices)
- **Style:** A square option with a 1px inset strong-hairline ring, set in Brygada 1rem, at least 2.75rem tall. The input stays native and transparent on top of the label.
- **State:** Hovering lifts the background to translucent white. When selected, the option takes the primary button's treatment (ink fill, putty text, gold lip). Glaze options carry a 1rem square swatch of the glaze colour.

### Cards / Containers
There are no cards. Containers are bands (putty-2 or night) with fluid padding, and media plates have no border. Product photographs sit on a putty-2 plate with 1.5rem of padding when they are cutouts.

### Inputs / Fields
- **Style:** Bottom border only, using the strong hairline, over a 55% white wash, set in Brygada at body size, with square corners.
- **Focus:** A 2px iron outline at zero offset, with the wash going fully opaque. Labels are Familjen 600 at 0.875rem.
- **Error:** Oxide-red Familjen 500. Status lines reserve 1.4em so the layout never jumps.

### Navigation
- **Masthead:** Fixed, with three tones. "Page" is transparent with ink text. "Solid" is putty with a hairline underneath, after 12px of scroll. "Studio" is transparent with chalk text and a chalk CTA, whenever a `data-header="light"` region sits under the bar. Links are Familjen 500 at 0.9375rem, and the current link carries an iron underline at a 0.45em offset.
- **Mobile (900px and below):** A square "Menu" toggle with a 1px strong-hairline border opens a putty sheet below the bar, with links in Brygada at 1.75rem. Escape closes it.

### The Studio Stage (signature)
A live React Three Fiber scene built from one Draco GLB: a cyclorama wall, a worn plinth, the pot, and 36 fracture shards. Its poster still covers loading, no-WebGL and context loss, then crossfades to the canvas over 1.2s. Scroll progress drives a shatter curve. The pot stays whole until 20%, breaks along an ease-out cubic from 20% to 44%, drifts to 1.2 times that spread by 72%, mends on an ease-in-out cubic by 93%, and is whole again after that. The wall pool dims from 18 to 12 while the pieces hang. Only the vessel turns towards the pointer (up to 0.12 rad of yaw), and the room stays still. Reduced motion holds the pot whole. Chapters crossfade with an 18px rise and a 4px blur, and hidden chapters stay in the DOM. A rail of 2px bars (2.25rem wide, 3.5rem when current) marks the chapter.

### Museum Label
A grid set off by a 1px chalk rule on its left. The name is in Brygada 500 at 1.25rem, the lines are Familjen at 0.9375rem in 82% chalk, and a closing link follows. It is the model for any caption beside an object.

### Ruled Index Row
The collections index, journal list, rooms index and specs all share one pattern: a strong top rule, soft row rules, and generous row padding. A collection row floods with its glaze field on hover or focus and gains 1.25rem of inline padding over 0.5s. A journal row indents 0.75rem.

### Commission Desk
A sticky square canvas on desk plaster, lit by a key spot, a warm fill and a hemisphere light. A lathe-spun vessel (amphora, moon jar, fluted bottle or lidded jar) moves from raw clay to fired glaze. The colour runs through a heat ramp, roughness drops from 0.95 to the glaze's own value, and clearcoat rises. Gold goes from a matte `#a99d88` to a metallic `#d4ad62`. A Brygada italic state line under the canvas says where the piece is in the process.

## Do's and Don'ts

### Do:
- **Do** keep every corner at 0px and draw controls with the gold lip (`inset 0 0 0 3px <fill>, inset 0 0 0 4px rgb(214 190 150 / 0.55)`).
- **Do** give every collection its own field, ink and accent triple, and flood its hero, index row and next-room band with it.
- **Do** use iron for state and terms on putty pages: hover, the 2px focus outline, the current marker, "Price on request".
- **Do** set reading text in Brygada 1918 with old-style proportional figures, and set labels in Familjen Grotesk in sentence case.
- **Do** separate content with 1px hairlines: a strong rule on top of a list, soft rules between rows.
- **Do** cast drop-shadows under cut-out vessels (`0 20px 18px rgb(43 31 25 / 0.25)`). They are the studio light on the object.
- **Do** ship a poster still, a static chapter sequence and a reduced-motion path with any live 3D scene.

### Don't:
- **Don't** round corners or use pill controls. The build has no radius anywhere.
- **Don't** box content into cards or tile grids. Use ruled rows, stepped mantels and bands.
- **Don't** put a collection on putty or on a neutral grid.
- **Don't** set interface ink over the studio in pure white. Use studio chalk with a stage-seat text-shadow.
- **Don't** add floating panel shadows or elevation tiers. A shadow has to be one a light could cast on an object.
- **Don't** add uppercase tracked labels or small category lines above headings. Labels sit beside or under their object.
