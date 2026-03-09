# Spartan-Forge Workflow Guide

## First-Time Setup (once per machine)

```bash
cd /path/to/spartan-forge
bun run sync.ts install
```

This single command:
- Installs all 11 global specialist agents → `~/.claude/agents/`
- Installs Leonidas meta-agent → `~/.claude/agents/leonidas.md`
- Installs skills → `~/.claude/skills/`
- Installs commands → `~/.claude/commands/`
- Auto-syncs FDE team agents + skills into the current directory (if it's a git repo)

---

## Syncing Into a Project

```bash
# Sync generic FDE team into an existing project
bun run sync.ts sync generic ~/my-project

# Sync all repos listed in .repos.conf
bun run sync.ts sync-all
```

---

## Typical Feature Workflow

### Option A: Fully Automated (recommended)

```
/fde-workflow
```

The FDE orchestrator runs the full pipeline: Socratic Gate → Planner → Developer → Tester → Reviewer → Documenter.

### Option B: Manual Agent-by-Agent

| Step | When | Agent |
|------|------|-------|
| 1 | Feature starts, requirements unclear | `fde-planner` |
| 2 | Contracts exist in `tasks/todo.md` | `fde-developer` |
| 3 | Developer done, no tests yet | `fde-tester` |
| 4 | Tests pass, pre-merge gate | `fde-reviewer` |
| 5 | Reviewer approved | `fde-documenter` |

---

## Agent Decision Guide

### FDE Team (sequential pipeline)

- **fde-planner** — Start here for any new feature. Clarifies requirements (Socratic Gate), writes C-DAD contracts (Zod/OpenAPI/Prisma), creates time-boxed task checklist in `tasks/todo.md`.
- **fde-developer** — Use when contracts/specs exist. Implements strictly against the contract. Does NOT design.
- **fde-tester** — Use immediately after developer finishes. Enforces Red → Green → Refactor. Blocks if tests don't pass.
- **fde-reviewer** — Last gate before commit. Adversarial — actively looks for OWASP issues, contract violations, N+1 queries, missing error handling.
- **fde-documenter** — After reviewer approves. Updates README, CHANGELOG, API docs. Documents observed reality only.

### Global Specialists (invoke any time, cross-cutting)

- **leonidas** — Create or modify any agent, skill, or command. Invoke with `/leonidas`.
- **expert-troubleshooter** — Any bug, test failure, error message, or regression. Provides root-cause analysis.
- **security-auditor** — Auth flows, input validation, dependency scanning, OWASP compliance.
- **performance-engineer** — Latency issues, memory usage, profiling, load testing.
- **architect-reviewer** — Architecture decisions, SOLID violations, ADR production.
- **backend-architect** — API design, service boundaries, database schemas, C-DAD contracts.
- **frontend-developer** — React components, responsive layouts, accessibility.
- **typescript-pro** — Advanced types, generics, strict TypeScript patterns.
- **test-automator** — Test infrastructure setup, CI pipelines, flakiness remediation.
- **code-reviewer** — Pre-commit code quality review, configuration change risk assessment.
- **database-admin** — DB operations, backups, replication, performance monitoring.
- **ui-ux-designer** — Design systems, wireframes, user flows, accessibility.

---

## Task Files (auto-managed by agents)

All FDE agents read and write these files automatically:

| File | Purpose |
|------|---------|
| `tasks/todo.md` | Current task checklist with status and time estimates |
| `tasks/notes.md` | Architecture decisions, handoff notes between agents |
| `tasks/lessons.md` | Cross-session learnings, patterns, rules discovered |

---

## Creating Project-Specific Agents

```
1. Invoke Leonidas: /leonidas
2. Tell Leonidas which repo to target
3. Leonidas runs /repo-recon against the target
4. Leonidas writes project-specific agents to agents/projects/<name>/
5. Sync into the target repo:
   bun run sync.ts sync <name> ~/path/to/repo
```

---

## Aggregating Lessons Across Projects

```bash
bun run sync.ts lessons-aggregate
```

Scans `tasks/lessons.md` in all repos from `.repos.conf` and aggregates new entries into `foundry-lessons.md`.
