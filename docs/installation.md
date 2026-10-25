# Install Unparalleled

The npm package and primary executable are both named `unparalleled`. Node.js 20 or newer and npm are required.

```bash
npx unparalleled install ui
npx unparalleled install website
npx unparalleled install all
```

Installation is noninteractive. The selected skill is copied into the project's `.agents/skills/` directory, then into the native discovery directories of supported agents detected on the machine or configured for the project. A short managed instruction block routes relevant work to the full skill. Existing project guidance and unrelated skills are retained.

```bash
npx unparalleled agents
npx unparalleled install website --global
npx unparalleled install ui --agent claude,codex
npx unparalleled install all --all-agents
npx unparalleled install website --project ./my-app --dry-run
```

`agents` reports detection evidence without changing anything. Detection checks executable files on PATH, known configuration/application paths, project-specific agent directories, and recognized editor extension names. It does not execute agent binaries, scan credentials, inspect private chats, or prove that a configured tool is currently installed, logged in, or running. Stale configuration can be detected; use `--agent` to select the targets explicitly when needed.

`--global` installs in user-level skill discovery directories across projects. It does not write to the current project or change global instruction files. `--dest <path>` chooses a custom canonical directory for a project install; native copies and instruction routes still make it discoverable. Use `--project <path>` to select the project. `--global` and `--dest` are mutually exclusive.

`--all-agents` opts into every supported integration, including ones not detected. `--no-config` copies only the shared skills. If no supported agent is detected, the installer creates the shared skills and project `AGENTS.md`; it reports that native integrations were not found. Unknown agents are not claimed as configured. Shared `.agents/skills` discovery may also be useful to other tools that implement that convention.

## Native discovery paths

Paths were checked against the linked vendor documentation on 25 October 2026. User-level paths are local-machine discovery, not a promise of cloud synchronization. Existing agent trust, feature, enterprise, or skill-disable policies remain authoritative. Start a new session or refresh the agent's skill list after installation.

| Agent | Project skills | User skills | Documentation |
| --- | --- | --- | --- |
| Codex | `.agents/skills` | `~/.agents/skills` | [Build skills](https://learn.chatgpt.com/docs/build-skills) |
| Claude Code | `.claude/skills` | `~/.claude/skills` | [Skills](https://code.claude.com/docs/en/skills) |
| Cursor | `.cursor/skills` | `~/.cursor/skills` | [Skills](https://cursor.com/help/customization/skills) |
| GitHub Copilot | `.github/skills` | `~/.copilot/skills` | [Agent skills](https://docs.github.com/en/copilot/concepts/customizations/agent-skills) |
| Gemini CLI | `.gemini/skills` | `~/.gemini/skills` | [Discovery tiers](https://geminicli.com/docs/cli/using-agent-skills/) |
| Antigravity | `.agents/skills` | `~/.gemini/config/skills` and `~/.gemini/antigravity-cli/skills` | [IDE skills](https://antigravity.google/docs/skills?app=antigravity-ide), [CLI migration](https://antigravity.google/docs/cli/gcli-migration/) |
| Windsurf | `.windsurf/skills` | `~/.codeium/windsurf/skills` | [Cascade skills and legacy compatibility](https://docs.devin.ai/desktop/cascade/skills) |
| Devin | `.devin/skills` | `~/.config/devin/skills` | [Cascade skills](https://docs.devin.ai/desktop/cascade/skills) |
| OpenCode | `.opencode/skills` | `~/.config/opencode/skills` | [Agent skills](https://opencode.ai/docs/skills/) |
| Cline | `.cline/skills` | `~/.cline/skills` | [Skills](https://docs.cline.bot/customization/skills) |
| Roo Code | `.roo/skills` | `~/.roo/skills` | [Skills](https://roocodeinc.github.io/Roo-Code/features/skills/) |
| Kiro | `.kiro/skills` | `~/.kiro/skills` | [Agent skills](https://kiro.dev/docs/skills/) |

OpenCode and Devin user paths respect `XDG_CONFIG_HOME` when set. PATH suffix detection supports Windows command wrappers; app detection includes macOS application bundles and common Windows/Linux application configuration locations. These detection paths do not replace each agent's documented skill loader.

## Browser for the screenshot loop

The skills ask agents to screenshot and review their own work. The installer does not install a browser or change agent permissions. Agents use the first route available:

| Agent | Playwright as a tool |
| --- | --- |
| Claude Code | `/plugin install playwright@claude-plugins-official`, or `claude mcp add playwright -- npx @playwright/mcp@latest` |
| Codex | `codex mcp add playwright -- npx @playwright/mcp@latest` |
| Cursor, Gemini CLI, Windsurf, Copilot, others | Add an MCP server with command `npx` and args `["@playwright/mcp@latest"]` to the agent's MCP configuration. |

Without an MCP tool, each skill's `scripts/capture.mjs` works on its own. If the project already depends on Playwright it uses that copy; otherwise `--install` puts Playwright and Chromium in `~/.cache/unparalleled/playwright` (or `$XDG_CACHE_HOME/unparalleled/playwright`) without touching the project's `package.json`. On Linux distributions Playwright does not officially support, it downloads a fallback build; missing system libraries can be added with `npx playwright install-deps chromium`.

## Updates and recovery

Installing `ui` and then `website` retains both skills in the instruction routes and selected native integrations. Repeating an unchanged installation writes nothing. Only the named Unparalleled skill folders are updated; unrelated skills are left alone. Additional files inside an existing skill are retained.

Before overwriting different content, the installer saves original file bytes and their locations under `.agents/unparalleled/backups/<run>/` in the project, or `~/.agents/unparalleled/backups/<run>/` for a global install. The backup manifest maps each saved file to its original location. A failed write restores attempted file changes. Empty directories created during a failed install may remain. Malformed managed instruction markers stop the plan before installation writes. Linked destinations are refused rather than followed silently.

Installation state is stored under `.agents/unparalleled/install.json` at the selected scope. It records installed skills and integrations, not authentication data. No agent permissions, trust settings, or API keys are changed.

## Examples and legacy aliases

```bash
npx unparalleled scaffold ui
npx unparalleled scaffold website
```

Both copy a self-contained, fictional Hollow example into the current project. Existing differing demo files are backed up before replacement. Use `--project` to choose another project. The root `unparalleled-website/` directory has been removed; examples live only under `examples/`.

The binary aliases `unparalleled-skillset`, `unparalleled-ui`, and `unparalleled-website` remain in this package, along with legacy selection/agent flags. A binary alias is not a separately published npm package. To use an alias directly without installing globally:

```bash
npx --package unparalleled unparalleled-ui --local
```

## Package verification and publication

```bash
npm test
npm run validate-all
npm run check-contrast
npm pack --pack-destination /tmp
npx --yes --package=/tmp/unparalleled-1.0.0.tgz unparalleled install ui --agent codex --project /tmp/example-project
```

Packing includes both complete skills, the installer modules, documentation, license, and both examples. It excludes installation state/backups and unrelated root assistant configuration. `prepack` validates the skill resources; `prepublishOnly` runs the tooling tests and repository checks.

The short public command requires the `unparalleled` package to be published to npm by its authorized maintainer. Preparing or packing this repository does not publish it. Before publication, use the local archive command above; after publication, use `npx unparalleled install ui` or `npx unparalleled install website`.
