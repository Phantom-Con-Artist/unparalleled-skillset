# Verified sources for design decisions

Primary standards, original research and official documentation, grouped by discipline. Every link here returned HTTP 200 on 2026-11-03 except where noted. Fetch the page when a decision depends on it, and record the access date and what it settled in `design.md`. If a fetch fails, say so; do not quote it from memory as if read. Design systems are evidence of method, not identities to copy.

## Color

- [WCAG 2.2 Understanding 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html), [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [APCA in a Nutshell](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/APCA_in_a_Nutshell.md): supplementary perceptual contrast guidance, not WCAG 2.2 conformance
- [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/) and [Björn Ottosson, "A perceptual color space for image processing" (OKLab)](https://bottosson.github.io/posts/oklab/)
- [Material 3 color system](https://m3.material.io/styles/color/system/overview), [Material Theme Builder](https://material-foundation.github.io/material-theme-builder/), [IBM Carbon color](https://carbondesignsystem.com/elements/color/overview/), [Apple HIG color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Design Tokens Community Group format](https://www.designtokens.org/tr/drafts/format/)
- [Schloss and Palmer, aesthetic response to color combinations](https://pmc.ncbi.nlm.nih.gov/articles/PMC3037488/): preference, harmony and similarity are different measures
- [colour-science](https://www.colour-science.org/): the library under the Color Intelligence Layer
- Harmony research used by the engine (obtain full papers before quoting equations): [Ou and Luo, 2006](https://onlinelibrary.wiley.com/doi/abs/10.1002/col.20208), [Cohen-Or et al., Color Harmonization, 2006](https://doi.org/10.1145/1179352.1141933) (not re-checked this revision)

## Typography

- [WCAG 2.2 Understanding 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [Butterick's Practical Typography](https://practicaltypography.com/), [line length](https://practicaltypography.com/line-length.html), [line spacing](https://practicaltypography.com/line-spacing.html)
- [Utopia fluid type calculator](https://utopia.fyi/type/calculator/)
- [CSS Fonts Level 4](https://www.w3.org/TR/css-fonts-4/), MDN [`font-display`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display), [`size-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust), [`font-variant-numeric`](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)
- [web.dev font best practices](https://web.dev/articles/font-best-practices)
- [Google Fonts Knowledge](https://fonts.google.com/knowledge), [Typography Handbook](https://typographyhandbook.com/)
- [Material 3 typography](https://m3.material.io/styles/typography/overview), [IBM Carbon typography](https://carbondesignsystem.com/elements/typography/overview/), [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [W3C: structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)

## Spatial and layout

- [NN/g Gestalt proximity](https://www.nngroup.com/articles/gestalt-proximity/), [principles of visual design](https://www.nngroup.com/articles/principles-visual-design/), [visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [Laws of UX: proximity](https://lawsofux.com/law-of-proximity/), [common region](https://lawsofux.com/law-of-common-region/)
- [IBM Carbon spacing](https://carbondesignsystem.com/elements/spacing/overview/), [Material 3 spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing), [Adobe Spectrum spacing](https://spectrum.adobe.com/page/spacing/), [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Utopia space calculator](https://utopia.fyi/space/calculator/), [Every Layout](https://every-layout.dev/)
- [CSS Grid Level 2](https://www.w3.org/TR/css-grid-2/), [MDN grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
- [NN/g F-shaped reading pattern](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/): an observed behavior, not a template

## Negative space

- [NN/g signal-to-noise ratio](https://www.nngroup.com/articles/signal-noise-ratio/), [minimize cognitive load](https://www.nngroup.com/articles/minimize-cognitive-load/), [aesthetic-usability effect](https://www.nngroup.com/articles/aesthetic-usability-effect/), [white space in form design](https://www.nngroup.com/articles/form-design-white-space/), [cards component](https://www.nngroup.com/articles/cards-component/) (when cards help and when they add noise)
- [Laws of UX: cognitive load](https://lawsofux.com/cognitive-load/), [aesthetic-usability effect](https://lawsofux.com/aesthetic-usability-effect/)
- [Mark Boulton, "Whitespace", A List Apart](https://alistapart.com/article/whitespace/)
- [Edward Tufte on chartjunk](https://www.edwardtufte.com/notebook/chartjunk/)
- [Interaction Design Foundation: white space](https://www.interaction-design.org/literature/topics/white-space)

## Visual assets

- [W3C WAI images tutorial](https://www.w3.org/WAI/tutorials/images/decision-tree/) (alt decision tree)
- [web.dev Learn Images](https://web.dev/learn/images), [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [MDN SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [Creative Commons licences](https://creativecommons.org/licenses/)

## Components

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/), [APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [WCAG 2.2 Understanding 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)
- [GOV.UK Design System components](https://design-system.service.gov.uk/components/), [patterns](https://design-system.service.gov.uk/patterns/)
- [Open UI](https://open-ui.org/), [Material 3 components](https://m3.material.io/components), [Apple HIG buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
- [W3C WAI forms tutorial](https://www.w3.org/WAI/tutorials/forms/), [NN/g web form design](https://www.nngroup.com/articles/web-form-design/)

## UX and information architecture

- [ISO 9241-210 human-centred design](https://www.iso.org/standard/77520.html) (summary page; full standard is paid)
- [NN/g ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/), [IA vs navigation](https://www.nngroup.com/articles/ia-vs-navigation/), [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/), [card sorting](https://www.nngroup.com/articles/card-sorting-definition/)
- [Laws of UX](https://lawsofux.com/), [Hick's law](https://lawsofux.com/hicks-law/), [Fitts's law](https://lawsofux.com/fittss-law/)
- [WCAG 2.2 Understanding 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html), [2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html), [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html), [3.2.3 Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html), [3.2.6 Consistent Help](https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html)
- [W3C WAI page structure tutorial](https://www.w3.org/WAI/tutorials/page-structure/)

## Responsive

- [WCAG 2.2 Understanding 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [1.3.4 Orientation](https://www.w3.org/WAI/WCAG22/Understanding/orientation.html)
- [web.dev Learn Responsive Design](https://web.dev/learn/design), [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [web.dev Core Web Vitals](https://web.dev/articles/vitals)

## Motion

- [WCAG 2.2 Understanding 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html), [2.3.1 Three Flashes](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- MDN [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Material 3 motion](https://m3.material.io/styles/motion/overview), [IBM Carbon motion](https://carbondesignsystem.com/elements/motion/overview/), [Apple HIG motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [NN/g animation purpose](https://www.nngroup.com/articles/animation-purpose-ux/), [web.dev animations guide](https://web.dev/articles/animations-guide)

## Accessibility

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [quick reference](https://www.w3.org/WAI/WCAG22/quickref/), [what's new in 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WAI evaluation resources](https://www.w3.org/WAI/test-evaluate/), [axe-core](https://github.com/dequelabs/axe-core)
- [EN 301 549 v3.2.1 (PDF)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf), [European Accessibility Act overview](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en)
- [ADA web guidance](https://www.ada.gov/resources/web-guidance/), [Section508.gov](https://www.section508.gov/)

## Brand personality

- Aaker, J. L. (1997), "Dimensions of Brand Personality", *Journal of Marketing Research* 34(3), [doi:10.1177/002224379703400304](https://doi.org/10.1177/002224379703400304) (publisher blocks automated fetches; cite, do not claim to have read it unless opened)
- [NN/g four dimensions of tone of voice](https://www.nngroup.com/articles/tone-of-voice-dimensions/)
- [Mailchimp Content Style Guide: voice and tone](https://styleguide.mailchimp.com/voice-and-tone/)

## Conversion

- [Baymard Institute research](https://baymard.com/research)
- [NN/g trustworthy design](https://www.nngroup.com/articles/trustworthy-design/), [how long users stay on web pages](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/), [deceptive patterns](https://www.nngroup.com/articles/deceptive-patterns/)
- [Deceptive patterns catalogue](https://www.deceptive.design/types)
- [EU Digital Services Act (Regulation 2022/2065)](https://eur-lex.europa.eu/eli/reg/2022/2065/oj), Article 25
- [WCAG 2.2 Understanding 3.3.7 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [3.3.8 Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), [2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [web.dev Vodafone case study](https://web.dev/case-studies/vodafone): measured link between LCP and sales
