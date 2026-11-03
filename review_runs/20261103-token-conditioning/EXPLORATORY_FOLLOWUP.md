# Exploratory follow-up after experiment 01

Experiment 01 is complete and its outputs are frozen. Its results are confirmatory only for the fixed protocol; subsequent work is labeled exploratory.

The foreground-only gate returned some infeasible palettes. This is a correct rejection, not a passing result: the requested APCA Lc90 body target can be impossible on a background whose lightness satisfies the broad theme prior. The gate must not silently relax the requested typography contrast.

Follow-up hypothesis: when background changes are explicitly permitted, moving both neutral backgrounds toward the theme's white/black endpoint and re-running all foreground checks can improve feasibility. We will retain the original assigned roles, search fractions 0.125, 0.25, 0.5, and 1.0 toward the endpoint, and accept the first candidate passing all five declared usages. If none passes, retain an infeasible result. Every changed output is remeasured.

Use exactly the same 200 sample IDs, themes, models, and first-seed predictions from experiment 01. Do not change models, selection, similarity metrics, or the semantic test set. Report additional background adjustments, all pass counts, actual color movement, and reference-fidelity changes. This is an exploratory constraint-handling improvement, not evidence that the neural model or graph is better.

The experimental request interface will reject unsupported token maps by default, distinguish an uncalibrated internal similarity from confidence, disclose uncertainty, and return only verified candidates as approved. Missing concept data will not be filled with invented labels.

## Additional diagnostic analyses

After the primary results, report a represented-aesthetic-word subset using the concept list from the initial coverage audit, excluding descriptions containing basic literal color names. This addresses the limitation that general text/palette matching can be driven by explicit color words. The subset is exploratory, potentially small, and does not replace the fixed primary result.

Also measure the prototype's common palette-to-text cosine on first-seed raw outputs and constrained outputs. This scorer differs from the primary retrieval scores. Its association with reference error is a diagnostic, not a calibrated probability or a new model-selection rule. No model is fitted or tuned in these analyses.

A final posthoc representation audit distinguishes unseen full captions from unseen unigram/IDF vectors. It reports seen/novel representation subsets without fitting, selecting, or replacing any model.
