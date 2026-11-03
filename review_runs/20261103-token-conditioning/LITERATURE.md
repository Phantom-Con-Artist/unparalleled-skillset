# Literature review before implementation

Research date: 2026-11-03. The local `sources/pdfs` directory contains nine downloaded PDFs, with text extracts in `sources/text`. Acquisition manifests record URLs and SHA-256 hashes. Full source copies remain local; these notes and source metadata are versioned.

## Findings and their limits

1. **Text2Colors (ECCV 2018).** [Paper](https://arxiv.org/abs/1804.04128), sections 3–5 and table 1. A conditional generator models the one-to-many mapping from text to five-color palettes. PAT contains 10,183 pairs screened by human annotators; diversity alone is inadequate because unrelated colors can inflate it. Its user study tests text/palette matching. This supports learning from whole palettes and separating color diversity from semantic agreement. It does not establish WCAG compliance, named aesthetic probabilities, or weighted concept blending.

2. **Cognitive color palette creation (IBM, 2019).** [Author institution's summary](https://research.ibm.com/publications/cognitive-color-palette-creation-using-client-message-and-color-psychology). The described method builds a graph of messages and color categories and applies personalized PageRank from message nodes, followed by palette ranking. This is close to the proposed signal-passing concept. The full IEEE publication was inaccessible; only the institution's abstract was available. Therefore no quantitative result, implementation detail, or reproduction claim is inferred from it.

3. **Multimodal Color Recommendation (ACM MM 2023).** [Paper](https://arxiv.org/abs/2308.04118), sections 3–5 and tables 2–5; [official implementation](https://github.com/CyberAgentAILab/text2palette). Attention incorporates text and color context, with experiments on document palettes and PAT. The paper compares textual representations, ordering, and postprocessing. Its conclusion explicitly identifies gaps in evaluating aesthetics and textual relevance. Its palette-distance values are reference-matching measures, not probabilities of human approval. We obtained actual PAT CSVs from a pinned revision of this repository.

4. **ColorGPT (ICDAR 2025).** [Paper](https://arxiv.org/abs/2508.08987), sections 4–5, tables 4–5. This compares prompted LLM outputs with earlier generators using palette distance and diversity. It gives evidence that a large bespoke generator is not the only plausible approach. The results are specific to models, prompts, data, and metrics. They do not establish that more diverse outputs are better interfaces or that a similarity score predicts human preference. We do not reproduce its paid model calls or compare our different metric numerically with its reported DCCW results.

5. **Generating Compositional Color Representations (CIKM 2021).** [Paper](https://arxiv.org/abs/2109.10477), sections 3–5. The method studies attribute/object combinations, constructs graph-derived data, and uses held-out compositions. Its experiments show that different losses can favor different metrics. This motivates an unseen-description holdout and comparison of simple models with neural methods. Its image color histograms and attribute/object phrases differ from UI role tokens; transfer cannot be assumed.

6. **Color Compatibility From Large Datasets (SIGGRAPH 2011).** [Paper and project](https://www.dgp.toronto.edu/~donovan/color/), sections 3–8. It learns from ratings of complete five-color themes and questions broad claims about hue templates. Preference depends on combinations and context; dataset ratings can contain community and selection biases. This supports independent palette-level evaluation rather than using a model's own score as proof of beauty. We downloaded the paper but did not incorporate its separately licensed dataset or model into the runtime.

7. **Accessible Color Sequences (2024 revision).** [Paper](https://arxiv.org/abs/2107.02270), sections 3–6 and discussion. Learned preferences are combined with explicit perceptual-distance and accessibility restrictions. Its validation investigates disagreement and inconsistent individual preferences, and its discussion describes competing objectives. It supports constraint-aware ranking and honest uncertainty. The application is data visualization, so its accessibility criteria and reported preference accuracy cannot be transferred directly to text/button usage.

8. **ColorA11Y (ASSETS 2026).** [Paper](https://arxiv.org/abs/2608.23852), sections 4–7. Its preference and workflow studies compare multiple accessible corrections in context, including complex backgrounds. Findings motivate preserving several compliant options rather than claiming one universal correction. Our experiment is limited to opaque, solid sRGB backgrounds and cannot reproduce its workflow/user-study claims.

9. **Culture-inspired palette generation (2021).** [Paper](https://arxiv.org/abs/2102.05231), dataset, experiment, and user-study sections. Culture-specific examples support a narrower style domain; the study is small and does not establish a universal semantic mapping. This reinforces the need for data representing the actual requested concepts. We use it as a scope warning, not as evidence that our missing cyberpunk/maximalism labels have been learned.

10. **Deep Sets (NeurIPS 2017).** [Paper](https://arxiv.org/abs/1703.06114), sections 2–3. Set-based representations address invariance to arbitrary item permutations. For an unordered palette, changing storage order should not change its descriptor. This motivates deterministic, permutation-invariant palette features and a regression test. Our fixed feature encoder is not a reproduction of the Deep Sets architecture; declared roles and layout areas would require additional context.

## Technical posts and standards

- [Stripe: Designing accessible color systems](https://stripe.com/blog/accessible-color-systems). The engineering account uses perceptual spaces and explicit contrast relationships, and explains why unconstrained darkening can undermine intended color character. Implication: measure emitted colors and report perceptual changes introduced by repairs. This is an engineering example, not evidence for a particular neural architecture.
- [Ottosson: A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/). The original derivation and numerical behavior support using OKLab for this experiment's palette-distance proxy. Its discussion distinguishes modeled predictions from human experimental validation. OKLab distance alone is not an aesthetic score.
- [Adobe Leonardo](https://github.com/adobe/leonardo). Contrast-driven generation and discrete sRGB outcomes support starting with explicit targets and verifying actual output values. The project describes a method and implementation, not a guarantee for arbitrary use of generated colors.
- [WCAG 2.2 text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The benchmark evaluates declared pairings at applicable numerical thresholds without rounding for pass/fail. A palette-level result cannot establish whole-page WCAG conformance.
- [APCA general typography guidance](https://github.com/Myndex/SAPC-APCA/blob/master/documentation/APCA_in_a_Nutshell.md). Report APCA separately and retain explicit font assumptions; it is not substituted for WCAG 2.2.

## Evidence available locally

The official 2023 repository provides 8,147 training, 1,018 validation, and 1,018 test pairs. Initial audit finds 187 test descriptions and three test palettes also represented in training. A stricter description/palette-disjoint filter leaves 794 validation and 820 test rows before within-split deduplication.

Concept coverage is uneven across all 10,183 rows: neon 53, calm 25, bold 12, modern 35, minimal 5, minimalism 1, cyberpunk 0, maximalism 0. These data can test text-conditioned palette association for represented language. They cannot establish a validated network for every proposed aesthetic token or a probability of human aesthetic agreement.

## Decision before coding

Use these sources to test, rather than assume, the proposed graph/network advantage. Keep the prototype outside the installed engine until there is evidence supporting promotion. Separate three questions: held-out palette association, numerical accessibility of declared usages, and whether internal similarity predicts any external measure. The next document fixes the experimental protocol before training.
