# The Subagent Inspection & Quality Gate Rubric

> *"No website is declared finished until an independent reviewer subagent inspects the rendered output, audits product clarity, evaluates color harmony against the Vocabulary, and rigorously scores the experience."*

---

## 1. The Subagent Review Protocol

Before presenting a finished website to the user or closing a web craft task, the primary agent must invoke a subagent (using `invoke_subagent` with `TypeName: "research"` or `"self"` and role `"Design Quality Reviewer"`).

### The Subagent Review Prompt Template:
```text
Inspect the generated website code and rendered interface at [path-to-file].
Conduct a critical audit evaluating:
1. Product Details & Depth: Does the website provide clear, concrete, and accurate details about what the product/service actually does, its architecture, and its benefits?
2. At-A-Glance Comprehension: Can a first-time visitor viewing this page for 3 seconds immediately and unambiguously know what this product is and who it is for?
3. Color Harmony & Vocabulary Affinity: Does the color palette harmonize with the product's Vocabulary Aesthetic Book? Are there any clashing, jarring, or contradicting colors?
4. Anti-Slop Audit: Does it contain any generic AI tropes (centered 3-line headline over purple blob, 3 identical icon cards)?
5. 2D/3D Subtle Blending: Is depth integrated naturally without feeling like an unanchored gimmick?

Provide a numerical score (out of 100) and actionable critique.
```

---

## 2. The 4 Core Evaluation Pillars

| Pillar | Maximum Points | Passing Threshold | Evaluation Question |
|---|---|---|---|
| **1. At-A-Glance Clarity** | 25 pts | 22 pts | Can a human glance at the hero for 3 seconds and explain what this company or product does? If the headline is vague corporate poetry ("The future of innovation"), deduct 10 points. |
| **2. Product Concrete Depth** | 25 pts | 20 pts | Does the page provide real technical parameters, pricing/metrics, interface fragments, or real capabilities? If it relies on empty lorem ipsum or generic buzzwords, deduct 15 points. |
| **3. Vocabulary & Color Harmony** | 25 pts | 22 pts | Are all hues, materials, and textures derived from the subject's Vocabulary? Are background surfaces and accent colors in tonal harmony (passing WCAG 4.5:1)? Any jarring or conflicting colors? |
| **4. Visual Craft & Anti-Slop** | 25 pts | 22 pts | Does it use fluid clamp typography, asymmetric Bento layout, 2D/3D depth, spring physics, and complete interaction states? Deduct heavily for generic 3-card templates. |

---

## 3. The Quality Gate Rule
- **Minimum Passing Score**: **85 / 100**.
- If the subagent assigns a score below 85, the primary agent must read the critique, address the deficiencies, and re-verify before finalizing the output.

