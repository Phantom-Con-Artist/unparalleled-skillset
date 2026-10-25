# Workflow: Art Direction & Subagent Quality Audit

Use this checklist and prompt to audit any landing page or website with an independent reviewer subagent before delivery.

---

## 1. The 4 Subagent Evaluation Questions

When the subagent reviews the website, it must answer:

1. **Product Details & Depth**:
   - Does the website give clear, concrete, and accurate details of what the product/service actually is, its features, and how it works?
   - Is it free of generic corporate fluff and lorem ipsum?
2. **At-A-Glance Comprehension**:
   - Can a person seeing this website at a 3-second glance immediately know what this product is and who it is for?
   - Is the core hook sharp, unambiguous, and authoritative?
3. **Color Harmony & Vocabulary Affinity**:
   - Are all colors, textures, and surfaces drawn directly from the Vocabulary Aesthetic Book?
   - Are there any contradicting, clashing, or jarring colors?
   - Do contrast ratios satisfy WCAG AA (minimum 4.5:1)?
4. **Subtle 2D/3D Blending & Anti-Slop**:
   - Is there subtle 2D and 3D depth (interactive tilt, specular highlights, depth occlusion) that feels grounded rather than gimmicky?
   - Is the site 100% free of AI slop (no centered 3-line headline over purple blob, no 3-card rows with tinted icon boxes)?

---

## 2. Subagent Execution Command

Run via `invoke_subagent`:
```json
{
  "TypeName": "research",
  "Role": "Design Quality Reviewer",
  "Prompt": "Perform an uncompromising art direction and product clarity audit on [path to file]. Evaluate: 1) Product Details & Depth, 2) At-A-Glance Comprehension, 3) Color Harmony & Vocabulary Affinity, 4) Subtle 2D/3D Blending & Anti-Slop. Provide a numerical score (0-100) and actionable critique. Minimum passing score is 85/100."
}
```

If the score is below 85, resolve all cited weaknesses and re-audit before marking the task complete.
