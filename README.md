# Unparalleled Skillset

> **Agentic skillset for designing distinctive, award-winning UI and websites integrating bespoke philosophy and aesthetic choices.**

`unparalleled-skillset` is an agentic design ecosystem built for autonomous AI pair programmers (Google Antigravity, Gemini CLI, Claude Code, Cursor). It replaces generic "AI Slop" — three-line centered headlines over pastel gradients, three identical icon cards, and generic Tailwind slate grays — with opinionated, high-craft digital experiences.

---

## 🌟 The Two Specialized Skillsets

This repository provides two dedicated skills:

### 1. `unparalleled-ui` (Software UI/UX & Dashboards)
- **Scope**: Screens people **work in** — SaaS platforms, cloud consoles, data-dense analytics dashboards, settings panels, and complex form workflows.
- **Invariants**:
  - High data density with visual calm (tabular numerals with `tabular-nums`, optical row heights).
  - 5-state completeness for every interactive element (`default`, `hover`, `active`, `focus-visible`, `disabled`).
  - Strict WCAG 2.1 AA accessibility (minimum 4.5:1 text contrast, complete keyboard navigation, ARIA live regions).
  - Location: [`.agents/skills/unparalleled-ui/SKILL.md`](file:///.agents/skills/unparalleled-ui/SKILL.md)

### 2. `unparalleled-website` (Landing Pages & Web Craft)
- **Scope**: Experiences people **read and scroll** — landing pages, marketing sites, brand portfolios, and editorial web experiences.
- **Invariants**:
  - Authentic art direction derived from the subject's reality, materials, and concrete numbers.
  - 10 distinct hero architectures replacing the centered 3-liner.
  - Mathematical fluid clamp typography (`clamp()`) scaling continuously across viewports without breakpoint jumping.
  - Asymmetric Bento grids with 2-column/2-row spans.
  - Nuanced OKLCH color palettes with a singular punch accent.
  - Location: [`.agents/skills/unparalleled-website/SKILL.md`](file:///.agents/skills/unparalleled-website/SKILL.md)

---

## 🚀 Quick Download & Installation via NPX

Anyone can download and install these skills directly into their projects or global agent environments using `npx`:

### Interactive Installer:
```bash
npx unparalleled-skillset
```
The interactive installer will ask:
1. Which skillset to install (`unparalleled-ui`, `unparalleled-website`, or both)
2. Where to install (`.agents/skills/` in local project, or global `~/.gemini/config/skills/`)

### Direct Command Flags:
```bash
# Install both skills into current project (.agents/skills/)
npx unparalleled-skillset --all --local

# Install software UI skill globally across all Antigravity workspaces
npx unparalleled-ui --global

# Install website skill into a custom directory
npx unparalleled-website --dest ./my-project/.agents/skills

# Scaffold a showcase project
npx unparalleled-skillset --scaffold website
npx unparalleled-skillset --scaffold ui
```

---

## 🧭 Repository Structure

```
unparalleled-skillset/
├── .git/                               # Initialized Git repository
├── .gitignore                          # Tailored ignore rules
├── package.json                        # NPX binaries & verification scripts
├── README.md                           # Documentation
├── AGENTS.md                           # Hierarchical agent workspace directives
├── GEMINI.md                           # Antigravity/Gemini rule file
│
├── bin/
│   └── cli.js                          # Zero-dependency NPX CLI installer
│
├── .agents/skills/
│   ├── unparalleled-ui/                # Software UI/UX Skill
│   │   ├── SKILL.md                    # Core runbook & triggers
│   │   ├── references/                 # In-depth architectural guides
│   │   │   ├── philosophy-manifesto.md # Software design convictions
│   │   │   ├── app-screen-patterns.md  # Multi-pane shells, consoles, KPI grids
│   │   │   ├── component-states-contracts.md # 5 mandatory interactive states
│   │   │   ├── data-density-tables.md  # High-density data table architecture
│   │   │   ├── keyboard-nav-a11y.md    # ARIA, focus traps, roving tabindex
│   │   │   ├── ui-tokens.md            # Semantic token contract in OKLCH
│   │   │   └── form-engineering.md     # Input validation, errors & labels
│   │   ├── workflows/                  # Step-by-step execution workflows
│   │   ├── scripts/                    # Contrast & validation scripts
│   │   └── templates/                  # Golden accessible component templates
│   │
│   └── unparalleled-website/           # Landing Pages & Web Craft Skill
│       ├── SKILL.md                    # Core runbook & triggers
│       ├── references/                 # In-depth architectural guides
│       │   ├── philosophy-manifesto.md # Web design philosophy & choices
│       │   ├── aesthetic-archetypes.md # 5 curated archetypes (Dark Tech, Editorial, etc.)
│       │   ├── hero-architectures.md   # 10 distinctive hero layout patterns
│       │   ├── typography-fluid-scales.md # Fluid clamp equations & pairings
│       │   ├── bento-grid-patterns.md  # Asymmetric Bento grid structures
│       │   ├── color-oklch-tokens.md   # OKLCH palettes & punch accents
│       │   ├── motion-choreography.md  # Spring physics & scroll stagger
│       │   ├── anti-slop-invariants.md # 8 AI template tropes & mandatory fixes
│       │   └── narrative-structure.md  # 5-stage conversion storytelling arc
│       ├── workflows/                  # Landing page run & audit checklists
│       ├── scripts/                    # Contrast & validation scripts
│       └── templates/                  # Bento grids, heroes & token templates
│
├── examples/                           # Standalone reference implementations
│   ├── unparalleled-ui-demo/           # Cloud console / dashboard example
│   └── unparalleled-website-demo/      # Awwwards-caliber landing page example
│
└── unparalleled-website/               # Starter showcase website repository
```

---

## 🎨 Integrating Your Own Philosophy & Choices

The skillset is intentionally designed to be extended with your personal design voice:

1. **Codify Your Values**: Edit `references/philosophy-manifesto.md` in each skill to add your favorite typefaces, signature border styles, color pigments, or micro-interaction rules.
2. **Deterministic Checks**:
   - Verify color contrast against WCAG AA standards:
     ```bash
     npm run check-contrast
     ```
   - Validate skill schemas and frontmatter:
     ```bash
     npm run validate-all
     ```

---

## 🤖 Using with AI Agents

When collaborating with Antigravity, Gemini CLI, Claude, or Cursor:
- Type:
  > *"Design a telemetry monitoring dashboard adhering to `/unparalleled-ui`"*
- Or:
  > *"Craft a high-converting, Awwwards-caliber landing page using `/unparalleled-website`"*

The agent automatically pulls the relevant references, enforces fluid clamp typography, selects an aesthetic archetype, and checks contrast compliance.
