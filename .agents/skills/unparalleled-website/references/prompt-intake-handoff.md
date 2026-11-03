# Prompt architect intake and handoff

## Required first step

When this skill activates for a new human task, the main agent invokes one dedicated prompt architect subagent before design or implementation. The architect first reads [prompt-research-guidelines.md](prompt-research-guidelines.md), then reads the exact request and relevant prior choices. Supply this material unchanged, with the applicable skill and existing design record. Do not ask the architect to implement, preselect a visual direction or delegate further.

A continuing turn reuses the handoff rather than restarting intake. A material objective change updates it. A local fix receives a brief architect pass without starting a new brand interview or full design campaign.

## Subagent assignment

```text
Act as the prompt architect for this human task.
First read references/prompt-research-guidelines.md in the active skill.
Then read the exact request, relevant prior decisions and project record below.
Preserve scope and explicit choices. Identify consequential unanswered questions.
Ask only questions needed to avoid changing the intended outcome; relay them to
the main agent if you cannot contact the human. Incorporate actual answers.
Return a faithful executable prompt using the handoff fields below. Report
remaining assumptions or blockers. Do not implement or delegate.
<original_request>…verbatim request…</original_request>
<prior_decisions>…relevant quotes and existing approvals…</prior_decisions>
<project_context>…paths, current revision and verified facts…</project_context>
```

## Interview without friction

Inspect supplied context first. Group the few unanswered questions whose answers change purpose, audience, deliverable, constraints or acceptance. Do not repeat answered questions, ask for a restatement of the brief or turn routine choices into permission requests.

If direct human interaction is unavailable, send the main agent the exact questions and why each matters. The main agent asks through its available user channel and returns answers unchanged. Dependent work waits; independent read-only discovery may continue. Silence is never an answer or approval. Label safe reversible assumptions; mark consequential ambiguity unresolved rather than inventing answers.

This interview resolves the assignment. The main agent later interviews for the remaining design.md decisions. Carry forward answers so the second interview asks only remaining design questions, including 2D/3D/hybrid, motion, audio, illustrative assets and existing brand requirements when relevant. Do not reinterpret product-derived geometry as a blanket ban on pills or rounded components.

## Handoff artifact

Return and save `prompt-handoff.md` beside the existing design record. Keep it specific:

```markdown
# Executable task prompt
Original request: <verbatim text or durable reference preserving it>
Goal: <observable requested end state>
Scope and exclusions: <creation / overhaul / local fix / audit; boundaries>
Explicit choices: <quoted constraints, stack, dimension, brand and waivers>
Known context: <facts, sources, revision; separate assumptions>
Grounded intent: <subject fact -> relationship -> rule -> observable check>
Deliverables and dependencies: <ordered milestones appropriate to scope>
Acceptance evidence: <functional, visual, accessibility and performance checks>
Review boundaries: <design.html review, consequential design choices and progressive milestones; existing approvals or scoped waivers with exact quotes>
Open questions and assumptions: <answers incorporated; unresolved items labeled>
Capabilities and limits: <actual tools, unavailable resources and constraints>
Next action: <main agent's first concrete action>

# Intake record
Architect: <actual agent identifier or truthful fallback mode>
Guidelines read: <reference and available revision>
Questions and answers: <actual exchange or “none needed”>
Fidelity check: <choices preserved; consequential ambiguity resolved/pending>
```

The main agent checks fidelity against the raw request, corrects omissions, records the handoff path and actual delegation outcome in the existing contract, then gathers product information into product.md and prepares design.md. The rewrite is an execution aid, not a new authority level or approval. Do not demand approval of a faithful rewrite when work is clear and authorized. Keep the design.html human review gate for new surfaces and overhauls.

## Capability fallback

Check actual tools before promising delegation. If unavailable or prohibited by higher-priority instructions, briefly disclose the limitation and perform the same research-first intake in the main agent. Record `main-agent-fallback` and the reason; never fabricate a subagent, independent review or completed interview. Continue useful authorized work. If a separate agent is an explicit acceptance requirement, report that exact unmet condition rather than claiming the delegated flow passed.
