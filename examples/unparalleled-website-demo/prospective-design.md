# Hollow: a ceramics story

## Scope and truth

Replace the old website example with a fictional neighborhood ceramics studio, matching the website prompt in `bin/cli.js`. Hollow is an invented example identity, disclosed on the first screen and in the footer. It offers no real classes, schedules, bookings, payments, customer stories, or glaze recipes. The primary action explores the making process locally. This is a code-native illustration, not photography of real work.

## Research and differentiation

[Turning Earth](https://www.turningearth.org/) describes classes, studio access, and membership. [Clay Kiln Craft](https://claykilncraft.com/) organizes its teaching around course types and access. Their page content was reviewed on 25 October 2026, without making claims about uninspected visual details. This demo instead uses a single vessel to explain a making process; it does not reproduce their businesses, copy, class data, or layouts.

## Vocabulary

Clay, hollow, rim, wall, foot, profile, turn, open, lift, trim, toolmark, dry, kiln, fire, groove, glaze, weight, hold, wobble, settle. The profile becomes the annotation; the wall becomes the revolved mesh; the rim supplies the wordmark geometry. Toolmarks and a slightly uneven rim preserve character without sacrificing legibility.

## Visual language

The cool shelf color is a drawn studio surface, the yellow is an imagined kiln-test label, and the plum is an illustrated manganese-colored glaze. These are authored fictional scene colors, not samples extracted from absent photographs. They form a light, material-specific environment without the cream/sage/terracotta craft preset or frosted interface panels. Product shading is confined to the vessel itself.

Bricolage Grotesque was chosen for its irregular, open counters and compressed, hand-shaped character, rather than a neutral sans default. Its particular forms relate to the uneven rim and compact studio marks. The embedded Latin WOFF2 subset supports the English example and weights 400–800. The [Google Fonts metadata](https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/METADATA.pb) and [SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/OFL.txt) were checked; the license is included inside `index.html`. Georgia/serif is a loading fallback, not the authored identity. The whole example works from a local file without external requests.

## Alignment and alternatives

The user's request to update the example provides sufficient alignment; no interview is necessary. `design-specimens.html` records five live product-specific explorations. Fit scores are explained design judgments using product clarity /30, audience fit /25, vocabulary originality /25, and feasibility/access /20. They are not measured conversion predictions. The selected direction is the profile becoming a hollow because it puts the product's process inside the main interaction while keeping copy direct.

## Motion score

| Beat | Product explanation | Trigger and change | Stable reading and fallback |
| --- | --- | --- | --- |
| Shape | A profile describes the wall and the space it holds. | A projected revolved mesh sits beside its flat profile; a labeled range turns the piece. | Caption and full process text stay readable; an inline SVG works without canvas or JavaScript. |
| Trim | Removing clay changes the foot. | Native desktop scroll or a stage button changes the base geometry. | A visible selection and caption explain the stage; keyboard and touch buttons work. |
| Fire | A glazed surface catches light differently. | Scroll or a stage button changes the illustrated surface color. | No flashing, heat simulation, or recipe claim; reduced motion changes directly to the selected state. |

## Delivery

Native scrolling is preserved. Small screens use a normal-flow workbench and manual stage controls instead of a pinned, extended scroll story. Reduced motion removes interpolation and scroll-driven changes. The canvas uses projected geometry without dependencies or WebGL; frames render only after input, resizing, or a brief stage transition, and stop while the document is hidden. Every process paragraph is present without scripting. Controls enhance only after the first successful rendering.

Check desktop and 320px/375px reading, keyboard stage/rotation controls, primary anchor actions, native scroll stage changes, reduced motion, font failure, canvas failure, JavaScript-off fallback, and actual computed text colors. An independent reviewer must inspect the source and available screenshots against the skill rubric before delivery.

## Verification outcome

Browser checks passed at 320px, 375px, 768px, and 1440px widths, including the primary anchor action, stage buttons, keyboard rotation, native scroll stage changes, reduced motion, JavaScript disabled, canvas unavailable, and font fallback. Short laptop viewports at 1366×768 and 1280×720 retain visible workbench controls; very short viewports return the workbench to normal flow. Eleven actual computed text/background pairs passed 4.5:1, with the lowest measured ratio 6.29:1.

Independent source, screenshot, and browser review scored the result 92/100 with no hard failures. Its nonblocking limitation is that the five specimen mechanisms diverge more strongly than their shared type family and utility viewer. The repository's nine tooling tests, skill validation, and reference contrast checks also passed. These checks describe the inspected example, not a certification of every browser or assistive technology.
