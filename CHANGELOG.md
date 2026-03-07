# Changelog

All notable changes to spartan-forge are documented here.

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
