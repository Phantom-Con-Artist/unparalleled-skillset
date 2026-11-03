# product.md: gather the product truth and its vocabulary

After intake, the main agent gathers information on the product and writes `product.md` ([template](../templates/product.template.md)). Every later decision in `design.md` cites it. Nothing is designed in this step.

## Gather

Read in this order and stop when the remaining questions would not change the design:

1. The high-performance prompt (`prompt-handoff.md`) and the user's exact words.
2. The repository: existing code, content, copy, assets, brand files, analytics or research the user supplied.
3. The live product or existing site, if any (record what you actually loaded).
4. Public sources the user names: the company site, documentation, app store pages, press.
5. Two or three closest competitors or references, as evidence of the category's conventions to differ from.

Record each fact with its observation type: `live`, `screenshot`, `creator-account`, `source`, `user-stated`, `inferred`. An inference is never `verified`. A client's description of a file you have not opened is a fact about the description only. A listed-but-missing asset is a fact about its absence.

## Required sections

| Section | Content |
| --- | --- |
| Product | What it is, what it does, what is offered, the main action, in plain words. |
| Audience and tasks | Who arrives or works here, their question or job, what success means, what a mistake costs. |
| Evidence | Facts table (id, claim, observation, status, source). Proof that may appear on the page. |
| Content inventory | Existing and needed content; what is real, what is a stand-in. |
| Brand commitments | Logo, colors, fonts, guidelines, tone the user already has. These are constraints. |
| Competitors and references | What was inspected, the conventions they share, what this product does differently. |
| Constraints | Stack, dimension (2D/3D/hybrid) if named, devices, performance, legal or accessibility requirements, deadlines. |
| Gaps | Open questions and the impact if each stays unanswered. |
| Vocabulary | See below. |

## Vocabulary

The vocabulary is the bridge from product truth to design. Collect specific nouns and verbs from the evidence: objects, materials, processes, places, outputs, data relationships, and the words users actually use. Aim for about 15–25 terms when evidence supports them; a sparse brief keeps a smaller honest core instead of invented lore.

For each term record: **source → product meaning → design consequence → check**. A design consequence names a discipline (color term, type form, geometry, spacing rhythm, image subject, motion behavior, label wording). Keep only terms that change a decision.

| Source | Term | Product meaning | Design consequence | Check |
| --- | --- | --- | --- | --- |
| Client photo set F3 | kiln-fired glaze | Each piece's color is unique and slightly uneven | Color: an accent family sampled from glaze photos, not a flat brand swatch | Accent values traced to photo samples |

Generic adjectives (premium, modern, clean, seamless) are not vocabulary. They are grounded later as rules (see [brief-vocabulary.md](brief-vocabulary.md)).

## Guard

`product.md` exists, at least one fact is `verified`, gaps are written, and the vocabulary has at least one term with a design consequence. When no verified fact says what is offered or what the person must do, stop here, ask the questions that change the work, and say what you will proceed on meanwhile.
