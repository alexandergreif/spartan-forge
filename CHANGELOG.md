# Changelog

All notable changes to spartan-forge are documented here.

## [0.5.0] — 2026-04-06

### Added
- **Karpathy Wiki Integration** — first-class knowledge management system based on Andrej Karpathy's LLM Wiki Method
- `global-agents/archivist.md` — new knowledge curator agent; compiles raw notes into structured wiki entries, deduplicates, resolves backlinks, validates integrity; uses context7 MCP for external doc intake
- `commands/wiki.md` — `/wiki` slash command with 5 subcommands: `compile`, `sync`, `query`, `lint`, `intake`
- `templates/wiki/index.md.template` — auto-generated wiki index template
- `templates/wiki/entry.md.template` — wiki entry scaffolding with YAML frontmatter
- `raw/research/`, `raw/drafts/`, `wiki/concepts/`, `wiki/sources/` directories in spartan-forge root (foundry's own wiki)
- `syncRepo()` now creates `raw/` and `wiki/` directories in target repos (first-time-only, with `.gitkeep`)
- `syncRepo()` now deploys `wiki/index.md` from template on first sync
- Wiki-First Protocol section added to `templates/CLAUDE.md.template` — agents check wiki before researching from scratch
- Archivist row added to agent table in `templates/CLAUDE.md.template`

### Changed
- `uninstallRepo()` preservation message now includes `raw/` and `wiki/` (user data — never deleted by uninstall)
- CLI help text updated to reflect wiki directory preservation
- `CLAUDE.md` architecture table updated with archivist agent
- `CLAUDE.md` commands section updated with `/wiki`
- `CLAUDE.md` directory structure updated with `raw/` and `wiki/` trees

---

## [0.4.0] — 2026-03-30

### Fixed
- Removed all references to non-existent `skills/` directory — skills were migrated to `commands/` in 0.3.x but documentation still referenced them
- Renamed `global-agents/architect-review.md` → `architect-reviewer.md` to match internal `name: architect-reviewer` field
- Standardized reviewer handoff protocol: `Verdict:` → `STATUS:` for consistency with all other agents
- Removed stale `NEEDS_DISCUSSION` verdict from README reviewer descriptions
- Fixed Socratic Gate ownership in `leonidas.md` — correctly attributed to Leonidas (orchestrator), not Planner agents
- Fixed command count: "4 Slash Commands" → "7 Slash Commands" (includes repo-recon, mcp-builder, leonidas)

### Changed
- `.claude/leonidas.md` — Deduplicated runtime orchestration protocol; now cross-references `commands/fde-workflow.md` as the authoritative source
- `.claude/leonidas.md` — Updated frontmatter rules: `model` and `tools` are now permitted optional fields (resolves contradiction with actual agent frontmatter)
- `.claude/leonidas.md` — Quality checklist relaxed: description length limit removed, frontmatter rule updated
- `README.md` / `README.en.md` — Removed Section 9 "Skills"; repo-recon and mcp-builder are now documented under Slash Commands; sections renumbered
- `CLAUDE.md` — Architecture table now includes all 11 global specialist agents; Commands section lists all 7 commands

### Added
- `.claude/leonidas.md` — Added `## Example Invocations` section with 3 usage examples
- All 11 `global-agents/*.md` — Added `## File Obligations` section per Leonidas quality checklist

---

## [0.3.2] — 2026-03-09

### Fixed
- `agents/generic/reviewer/agent.md` — Removed `NEEDS_DISCUSSION` verdict from Handoff Protocol template and output format; only `APPROVE` / `REQUEST_CHANGES` remain, eliminating an unhandled verdict that silently broke `fde-workflow` orchestration

### Changed
- `commands/commit.md` — Rewritten in English (functionally equivalent)
- `commands/review.md` — Rewritten in English (functionally equivalent)
- `commands/e2e.md` — Rewritten in English (functionally equivalent)

### Added
- `CLAUDE.md` — Added `setup [path]` and `setup <group> <path>` to CLI Commands section
- `templates/CLAUDE.md.template` — Added re-sync hint under Agents section

---

## [0.3.1] — 2026-03-09

### Added
- `sync.ts uninstall` — Remove spartan-forge global agents and commands from `~/.claude/` without touching user-added files
- `sync.ts uninstall <path>` — Remove spartan-forge agent files from a project, leaving `tasks/`, `CLAUDE.md`, and any user-added agents intact

## [0.3.0] — 2026-03-09

### Changed

- `commands/fde-workflow.md` — Full rewrite from German single-session directive to English
  multi-agent orchestration command. Leonidas now spawns each FDE agent as a real subagent
  (Agent tool) in sequence, validates STATUS lines between phases, and injects specialists
  deterministically based on contract content and handoff outcomes.
- `.claude/leonidas.md` — Added `## Runtime Orchestration Mode` section with sequential
  spawn protocol, handoff block validation rules, specialist injection trigger table,
  and inter-phase status reporting format.
- `agents/generic/planner/agent.md` — Added machine-readable STATUS line to Handoff Protocol:
  `STATUS: READY_FOR_DEVELOPER | BLOCKED`
- `agents/generic/developer/agent.md` — Added machine-readable STATUS line to Handoff Protocol:
  `STATUS: READY_FOR_TESTER | BUILD_FAILED | BLOCKED`
- `agents/generic/tester/agent.md` — Added machine-readable STATUS line to Handoff Protocol:
  `STATUS: TESTS_PASSING | TESTS_FAILING | INFRA_MISSING`
- `CLAUDE.md` — Leonidas row updated to reflect dual "Author + Runtime Orchestrator" role

## [0.2.0] — 2026-03-09

### Added
- `WORKFLOW.md` — Complete workflow guide: setup, agent decision guide, task files, project-specific agents
- `sync.ts install` now installs leonidas to `~/.claude/agents/leonidas.md`
- `sync.ts install` auto-detects git repos and syncs FDE team into current directory

### Improved
- `expert-troubleshooter.md` — Removed stale project-specific references (PSADT, Flask, SQLAlchemy, semgrep, RepoPrompt); rewritten with clean root-cause-analysis methodology; added `tools` and `model` frontmatter
- `security-auditor.md` — Added supply chain security (npm audit, pip-audit, Snyk, Trivy), encryption key management; updated to full model ID
- `test-automator.md` — Added flakiness detection/remediation section, TDD Iron Law integration note; updated `tools` and model
- `architect-review.md` — Added ADR (Architecture Decision Record) template guidance; updated `tools` and model to full ID
- `backend-architect.md` — Added C-DAD contract production (OpenAPI/Zod/Prisma), error handling patterns; updated `tools` and model
- All 11 global agents — Updated to full model IDs (`claude-opus-4-6`, `claude-sonnet-4-6`), added `tools` frontmatter
- `fde-planner` — Improved description; added `model: claude-opus-4-6`
- `fde-developer` — Improved description; added `model: claude-sonnet-4-6`
- `fde-tester` — Improved description; added `model: claude-sonnet-4-6`
- `fde-reviewer` — Improved description; added `model: claude-opus-4-6`
- `fde-documenter` — Improved description; added `model: claude-haiku-4-5-20251001`
- `CLAUDE.md` — Clarified Leonidas invocation rule; updated CLI help to lead with `install`

## [0.1.0] — 2026-03-07

### Added
- Initial repository structure
- `leonidas` meta-agent (sole authority for agent authorship)
- Generic FDE team: `fde-planner`, `fde-developer`, `fde-tester`, `fde-reviewer`, `fde-documenter`
- 11 global specialist agents (copied from ~/.claude/agents/)
- 4 slash commands: `fde-workflow`, `commit`, `review`, `e2e`
- Commands: `repo-recon` (GitHub + local mode), `mcp-builder` (MCP server workflow)
- Templates: `CLAUDE.md.template`, `agent.md.template`, `tasks/todo.md.template`, `tasks/notes.md.template`, `tasks/lessons.md.template`
- `sync.ts` CLI: `sync`, `sync-all`, `install`, `list`, `check`, `lessons-aggregate`
- `foundry-lessons.md` for cross-project knowledge aggregation
- `_shared/file-obligations.md` shared agent obligations
- `CLAUDE.md` foundry operating instructions
- `.repos.conf.example` for team sharing
- Appendix D: Agent Teams integration with `leonidas` as coordinator
