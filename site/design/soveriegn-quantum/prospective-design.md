# Soveriegn Quantum: direction contract

## Product truth, purpose, and scope

Soveriegn Quantum is a fictional company that builds superconducting quantum computers end to end: its own processor (Basilisk 2), its own cryogenic wiring and attenuator lines, its own dilution-refrigerator integration, its own cleanroom and measurement lab. The spelling "Soveriegn" is the brand's own and is kept everywhere (per `ASSET-GUIDE.md`).

The site is a public company site shown as a demo at `unparalleled.pages.dev/soveriegn-quantum/`. Readers: research partners, public funders, engineers considering a job, journalists. Primary actions: understand what the company makes and why, read about Basilisk 2, contact the partnerships office.

Facts in hand (all fictional, from the asset guide): the four leaders and their roles, the eight-person staff photo, headquarters, cleanroom, measurement lab, cryogenic systems, data center, office, the two-system installation, Basilisk 2 as the flagship processor in a gold-plated copper package. The guide forbids inventing a qubit count, benchmarks, or production readiness, and treats "Frontier" as positioning only. The site respects that: it publishes no fidelity or qubit-count claim, and says why.

Assumptions (marked as such in copy where it matters): founding year 2019, a Cambridgeshire research campus, the milestone list below, a partnerships email at the brand's own domain.

## Particular inventory

- The dilution refrigerator as a stack of temperature stages: 300 K top plate, 50 K and 4 K pulse-tube stages, still (about 0.8 K), cold plate (about 0.1 K), mixing chamber (about 10 mK).
- What sits on each stage: G10 fibreglass supports, attenuators on the input lines (4 K, still, cold plate, mixing chamber), HEMT amplifiers at 4 K, circulators at the mixing chamber, the still pumping line and still pot, the continuous and step heat exchangers, DC looms, the outer vacuum can and the 50 K and 4 K radiation shields.
- Basilisk 2: package with SMA and SMP launches, interposer traces, aluminium wedge bonds, a 10 mm silicon die; on the die cross-shaped transmons, λ/4 meander readout resonators, shared feedlines, coupling buses, drive and flux lines, airbridges, flux-trapping holes, and SQUIDs whose Al/AlOx/Al junctions overlap in a square about 0.2 µm across.
- Photography: sober institutional, white labs, real cable management (`soveriegn-quantum-*.png`, `hardware-expansion-*`, `research-expansion-*`, `basilisk-2.png`).

The 3D machine is our own Blender build (`source/soveriegn-cryostat.blend`), modelled from the architecture above, using a CC BY Sketchfab model by Scimitar2.0 only as a visual density reference. No third-party geometry ships.

## Governing idea

**A machine you can open, all the way down.** Sovereignty, for this company, means knowing every layer of the machine you depend on. So the home page opens the machine. Scrolling lowers the vacuum can, then each radiation shield, then separates the cooling stages, then lifts the lid of the processor package and keeps going into the die, through the circuit, to a single Josephson junction. Every layer that opens carries the company's argument: motive at the vacuum can, philosophy at the shields, achievements on the stages, the processor at the bottom.

A thermometer is the page's instrument. The right edge carries a logarithmic scale from 300 K to 10 mK; the reading falls as the camera descends, and the page itself cools from lab-white toward the logo's midnight navy. Inside the chip the temperature stops changing and a second instrument takes over, a length scale from 60 mm to 0.2 µm.

Swap test: another quantum company's name on this page breaks it, because the copy is tied to Soveriegn's claim that it builds every one of these layers itself, and the closing refusal to publish an unverified number is this company's stance, not a category habit.

What a visitor should remember: the moment the gold package opens and the camera falls into the chip until the streets of the circuit become one junction you could hold between two fingers if you were 200 nanometres tall.

## Direction contract

- First frame: a seamless light-grey studio sweep (the studio photograph's world, not a black void). The closed machine in its white frame stands right of centre at full height. Left: the wordmark, the headline "A machine you can open." and one sentence. Right edge: the thermometer at 296 K.
- Attention path: headline, machine, thermometer, the first scroll hint, which is the vacuum can beginning to lower.
- Type: Newsreader (variable, optical sizes) for headlines and reading text, set large and light with tight tracking at display sizes. Azeret Mono for instrument readings, labels, navigation and data. Two families only. No uppercase tracked eyebrows; readings are sentence case or units.
- Palette: temperature drives it. Room: warm lab white `oklch(96.5% 0.005 85)` with ink in the logo navy `rgb(21 39 58)`. Cold: midnight navy `oklch(19% 0.035 252)` with paper-white ink. Accent: the gold of plated copper `oklch(78% 0.11 80)` for readings and the active stage, copper `oklch(62% 0.12 50)` sparingly. No cyan, no indigo, no glow.
- Marks: the given Q emblem and wordmark; bespoke stage glyphs (a plate seen edge-on with its temperature), the thermometer rail, leader lines from labels to parts.
- Material logic: real metals with brushed grain, handling marks, tarnish and lathe rings; studio lighting; nothing emits light.
- After the descent the page "warms up": the sections below return to lab white. Secondary pages (Basilisk 2, Company, Facilities, Contact) use the same type, rail glyphs and photography on the light ground, with the instrument motif as figure captions and data tables.
- Phone: the canvas stays full-bleed and pinned; copy sits in a lower panel on the paper colour; the thermometer becomes a thin top rule with the reading.

## Assets, voice, and signature

- Models: `public/models/cryostat.glb` (about 290k triangles, Draco) and `basilisk-2.glb` (die circuit at real lateral scale, heights exaggerated ten times and labelled so).
- Images: the supplied PNGs as WebP renditions at 640/1200/1920.
- Fonts: `@fontsource-variable/newsreader`, `@fontsource-variable/azeret-mono`, OFL 1.1, self-hosted by Vite.
- Voice: plain, exact, a little dry. Names parts correctly. Never "revolutionary", never "unlock".
- Signature: the scroll-driven opening of the machine continuous from the closed cryostat to one junction. Keyboard: the thermometer marks are links to each layer. Reduced motion: each layer is a still frame with its text, no camera travel. No WebGL: stills rendered from the same scene.

## Five hypotheses and decision

1. The opening machine with a thermometer (chosen). Fit: 9/10. Uses the model, carries every content beat, scientific by construction.
2. A cooldown log: the page as a 36-hour cooldown chart with photos pinned to events. Fit 6: strong data voice, weak use of the 3D.
3. A wafer map index: every page section is a die on a wafer. Fit 5: clever, but turns the company into a grid.
4. A plan-view campus: the site as a floor plan of the headquarters. Fit 5: good for facilities, poor for the processor.
5. A cross-section poster: one huge static cutaway with annotations. Fit 6: precise, but no descent and no scale change.

## Story and motion score

| Beat | Content | Transformation | Stable reading | Static equivalent | Failure |
| --- | --- | --- | --- | --- | --- |
| Room, 296 K | Wordmark, headline, sentence | Closed machine in studio | Hero text | Still of closed machine | Poster image if WebGL fails |
| Motive | Why sovereign hardware | Vacuum can lowers away | Motive paragraph | Still with can lowered | Same |
| Philosophy | Three principles | 50 K then 4 K shield lower | One principle at a time | Three stills | Same |
| Stages | Milestones 2019 to 2026 | Stages separate; camera descends 50 K to 10 mK | Milestone beside its plate | Exploded still + list | List stays readable |
| Basilisk 2 | The processor | Shield lowers, camera turns to package, lid lifts | Package caption | Package photo | Photo |
| Into the die | Parts of the circuit | Log zoom die, lattice, qubit, SQUID, junction | Label per scale | Die macro + diagram stills | Stills |
| Warm-up | People, facilities, contact | Canvas releases, page returns to white | Normal page | Same | Same |

## Engineering and acceptance

React 19, Vite, three.js via React Three Fiber, GSAP ScrollTrigger for the pinned story (native scroll), drei for the loader. One canvas, demand-driven frame loop while pinned, paused off-screen. Logarithmic depth buffer; the world re-centres on the die before the micro zoom so float precision holds down to the junction. Semantic sections in the DOM for every beat. Captures at 1440, 1280×720, 834, 390, 320 and a reduced-motion pass; contrast measured on the real colour pairs at both temperature extremes; independent review before documentation.

## Source files

- `source/soveriegn-cryostat.blend`: the cryostat, frame and Basilisk 2 package, built in Blender 5.2. Export with the settings in this file's history: Draco, position quantisation 14 for `cryostat.glb` and 20 for `basilisk-2.glb` (the die needs the precision).
- `textures/gen_textures.py`: regenerates the tileable brushed-steel, aluminium, gold, copper, powder-coat and G10 maps the `.blend` links to. The PNGs are not committed.
- `source/basilisk_layout.py`: the die layout (transmons, resonators, feedlines, drive and flux lines, airbridges, flux-trapping holes) as polygons for extrusion in Blender.
