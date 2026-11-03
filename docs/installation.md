# Installing and updating Unparalleled

[README](../README.md) · [Skill manual](../guides/unparalleled.md) · [Studio manual](../guides/studio.md)

Requires Node.js 20+ and npm. All download examples use the GitHub repository. Run them inside the project where your coding agent works.

## Quick start

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset setup
npx github:Phantom-Con-Artist/unparalleled-skillset doctor
```

Start a new agent session or refresh its skills afterward. `setup` installs both design skills for detected integrations and reports readiness; `doctor` reports missing/outdated pieces and suggested fixes without installing them.

## Choose skills and integrations

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset install ui
npx github:Phantom-Con-Artist/unparalleled-skillset install website
npx github:Phantom-Con-Artist/unparalleled-skillset install all --agent claude,codex
npx github:Phantom-Con-Artist/unparalleled-skillset agents
npx github:Phantom-Con-Artist/unparalleled-skillset install all --dry-run
```

| Option | Behavior |
| --- | --- |
| `--local` | Install into the current project; the default |
| `--global` | Install into user-level discovery paths across projects |
| `--project <path>` | Choose another project directory |
| `--agent <names>` | Select supported integrations, comma-separated or repeated |
| `--all-agents` | Configure every supported integration, including undetected ones |
| `--no-config` | Copy shared skills without native agent integration configuration |
| `--dest <path>` | Custom canonical skill directory for project installs |
| `--dry-run` | Preview writes without applying them |
| `--json` | Machine-readable output for supported commands |

`--global` cannot be combined with `--dest` or `--local`. Explicit agent selection cannot be combined with `--all-agents` or `--no-config`. Use `--help` for the full command reference.

Detection checks local executable/configuration paths and editor integrations; it does not execute agent binaries or verify login. Select an agent explicitly if its detection is stale or incomplete.

## Where the skills go

The project canonical directory is `.agents/skills/`. Native copies and managed routing notes make the full skills discoverable to the selected integrations. The following paths describe this installer's routing; host policies and skill discovery settings still apply.

| Agent | Project discovery | User discovery |
| --- | --- | --- |
| Codex | `.agents/skills` | `~/.agents/skills` |
| Claude Code | `.claude/skills` | `~/.claude/skills` |
| Cursor | `.cursor/skills` | `~/.cursor/skills` |
| GitHub Copilot | `.github/skills` | `~/.copilot/skills` |
| Gemini CLI | `.gemini/skills` | `~/.gemini/skills` |
| Antigravity | `.agents/skills` | `~/.gemini/config/skills` and `~/.gemini/antigravity-cli/skills` |
| Windsurf | `.windsurf/skills` | `~/.codeium/windsurf/skills` |
| Devin | `.devin/skills` | `~/.config/devin/skills` |
| OpenCode | `.opencode/skills` | `~/.config/opencode/skills` |
| Cline | `.cline/skills` | `~/.cline/skills` |
| Roo Code | `.roo/skills` | `~/.roo/skills` |
| Kiro | `.kiro/skills` | `~/.kiro/skills` |

OpenCode and Devin user paths respect `XDG_CONFIG_HOME`. If no integration is detected, the installer still creates the shared skills and project routing note. It does not change credentials, trust, permissions or unrelated instructions.

For manual installation, copy the entire `unparalleled-ui` and/or `unparalleled-website` directory from `.agents/skills/` into your agent's skill discovery location. Include references, templates and scripts, not just `SKILL.md`.

## Browser and production capabilities

Rendered review needs a connected browser tool or the bundled capture script. From a project with an installed skill:

```bash
node .agents/skills/unparalleled-website/scripts/capture.mjs --install --url http://127.0.0.1:5173 --out ./review
```

`--install` downloads Playwright/Chromium to `~/.cache/unparalleled/playwright` (or the corresponding XDG cache) without modifying project dependencies. Existing project Playwright can also be used. The skill installer does not install a browser by itself.

Blender/MCP, image generation and video/motion runtimes are task-specific. The agent checks actual availability and follows the selected pipeline. A visible Blender binary is not proof of a working Blender MCP connection. A missing optional tool should not block unrelated work.

## Optional Claude Code extraction hook

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset hook
npx github:Phantom-Con-Artist/unparalleled-skillset hook --write
```

Without `--write`, the command prints the suggested `UserPromptSubmit` configuration. With it, the command merges a keyword-extraction hook into the project's `.claude/settings.json`, preserving existing configuration and refusing malformed input. It is idempotent. `setup --hook` explicitly requests the same addition.

The hook adds context for design prompts. It does not replace the research-first prompt architect, the brand interview or human review. Remove its entry from the settings file to disable it.

## Updates and recovery

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset update --dry-run
npx github:Phantom-Con-Artist/unparalleled-skillset update
npx github:Phantom-Con-Artist/unparalleled-skillset doctor
```

`update` reinstalls the recorded skill selection, integrations and destination from the repository version you run. It uses this project's installation when present, otherwise the user-level installation. Pass `--global` to explicitly target the latter. It does not add unrequested integrations. Restart the agent session after updating.

Before overwriting differing files, installation saves their bytes and locations under `.agents/unparalleled/backups/<run>/`, or `~/.agents/unparalleled/backups/<run>/` for user scope. The backup manifest maps original paths. A failed write restores attempted changes; empty directories may remain. Malformed routing markers and linked destinations are refused.

Installation state is `.agents/unparalleled/install.json` at the selected scope. Repeated unchanged installs write nothing. Additional unknown files in an installed skill directory are retained, so updating is not a general deletion command for old custom files.

## Examples and Studio

```bash
npx github:Phantom-Con-Artist/unparalleled-skillset scaffold ui
npx github:Phantom-Con-Artist/unparalleled-skillset scaffold website
npx github:Phantom-Con-Artist/unparalleled-skillset studio --demo
```

Scaffolds copy the fictional Hollow examples; they are starting references, not prescribed visual identities. Studio's fictional Fieldwork page is a separate local practice surface. See the [Studio manual](../guides/studio.md) for real projects, Vite and agent connection.

## Reproducible installs and package checks

To pin a checkout, append `#<commit>` or an existing tag to the GitHub package spec. Replace the placeholder with a real repository revision; this guide does not assume a release tag has been published.

From a local clone:

```bash
node bin/cli.js --version
node bin/cli.js install all --project /tmp/unparalleled-example --dry-run
npm test
npm run validate-all
npm run check-contrast
npm pack --pack-destination /tmp
```

The package allowlist includes the installer, complete skills, Studio packages, examples, public manuals, README assets, changelog and license. Local research, handoff notes, Impeccable state, captures and agent credentials are excluded. Packing or preparing version 1.2.0 does not itself publish a tag or registry release.
