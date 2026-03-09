# Changelog

All notable changes to spartan-forge are documented here.

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
- `sync.ts install` now installs skills to `~/.claude/skills/` and leonidas to `~/.claude/agents/leonidas.md`
- `sync.ts install` auto-detects git repos and syncs FDE team + skills into current directory
- `sync.ts sync` now also copies skills into target repo's `.claude/skills/`

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
- Skills: `repo-recon` (GitHub + local mode), `mcp-builder` (MCP server workflow)
- Templates: `CLAUDE.md.template`, `agent.md.template`, `tasks/todo.md.template`, `tasks/notes.md.template`, `tasks/lessons.md.template`
- `sync.ts` CLI: `sync`, `sync-all`, `install`, `list`, `check`, `lessons-aggregate`
- `foundry-lessons.md` for cross-project knowledge aggregation
- `_shared/file-obligations.md` shared agent obligations
- `CLAUDE.md` foundry operating instructions
- `.repos.conf.example` for team sharing
- Appendix D: Agent Teams integration with `leonidas` as coordinator
