# spartan-forge — Foundry Operating Instructions

spartan-forge is a personal agent foundry combining FDE methodology (Socratic Gate,
C-DAD, TDD Iron Law, PIV-Loop) with structured agent infrastructure (5-role teams,
Meta-Agent, Repo Recon, Sync CLI, cross-session memory).

## Agent Architecture

| Agent | File | Jurisdiction |
|-------|------|-------------|
| **leonidas** | `.claude/leonidas.md` | Author + Runtime Orchestrator — sole authority for agent authorship; orchestrates FDE pipeline via sequential Agent tool calls |
| **fde-planner** | `agents/generic/planner/agent.md` | Feature design, contracts, task planning |
| **fde-developer** | `agents/generic/developer/agent.md` | Implementation against contracts |
| **fde-tester** | `agents/generic/tester/agent.md` | TDD enforcement, test writing |
| **fde-reviewer** | `agents/generic/reviewer/agent.md` | Adversarial code review |
| **fde-documenter** | `agents/generic/documenter/agent.md` | Post-approval documentation |
| **archivist** | `global-agents/archivist.md` | Wiki knowledge management — compile, sync, query, lint, intake |
| **architect-reviewer** | `global-agents/architect-reviewer.md` | Architectural consistency, SOLID, ADRs |
| **backend-architect** | `global-agents/backend-architect.md` | API design, microservices, DB schema |
| **code-reviewer** | `global-agents/code-reviewer.md` | Ad-hoc code review |
| **database-admin** | `global-agents/database-admin.md` | DB optimization, migrations, queries |
| **expert-troubleshooter** | `global-agents/expert-troubleshooter.md` | Root-cause debugging, build failures |
| **frontend-developer** | `global-agents/frontend-developer.md` | React/UI, state management |
| **performance-engineer** | `global-agents/performance-engineer.md` | Profiling, bottlenecks, optimization |
| **security-auditor** | `global-agents/security-auditor.md` | OWASP, auth flows, secrets scanning |
| **test-automator** | `global-agents/test-automator.md` | Test infrastructure, E2E, CI |
| **typescript-pro** | `global-agents/typescript-pro.md` | TypeScript types, generics, strict mode |
| **ui-ux-designer** | `global-agents/ui-ux-designer.md` | UX analysis, accessibility, design |

## Rules

1. **Never edit agents without going through leonidas** — invoke Leonidas with `/leonidas` to create or modify any agent, skill, or command
2. **Never patch agents in target repos** — always edit in spartan-forge and re-sync
3. **Run repo-recon before creating project-specific agents** — no guessing at repo structure
4. **Update CLAUDE.md architecture table after every agent change**
5. **Update CHANGELOG.md with every modification**

## Commands

- `/fde-workflow` — Full FDE pipeline orchestrated by Leonidas
- `/repo-recon` — Repository intelligence gathering (GitHub + local mode)
- `/mcp-builder` — Complete MCP server development workflow
- `/leonidas` — Create, modify, or review agents/commands
- `/wiki` — Wiki knowledge management (compile, sync, query, lint, intake)
- `/commit` — Structured git commit (Conventional Commits)
- `/review` — Adversarial code review before commit
- `/e2e` — Visual end-to-end testing via headless browser

## CLI Commands

```bash
bun run sync.ts install                     # Everything: global agents + commands + leonidas + auto-sync current repo
bun run sync.ts setup [path]                # install + optionally sync generic into <path>
bun run sync.ts setup <group> <path>        # install + sync specific group into <path>
bun run sync.ts uninstall                   # Remove spartan-forge agents/commands from ~/.claude/
bun run sync.ts uninstall <path>            # Remove spartan-forge files from a project (leaves tasks/, CLAUDE.md, raw/, wiki/)
bun run sync.ts sync <agent-group> <path>   # Sync agents into a specific repo
bun run sync.ts sync-all                    # Sync all repos in .repos.conf
bun run sync.ts list                        # List available agent groups
bun run sync.ts check <agent-group>         # Check agent staleness vs repo profile
bun run sync.ts lessons-aggregate           # Aggregate lessons from all repos
```

## Directory Structure

```
spartan-forge/
├── .claude/
│   └── leonidas.md          # Meta-agent
├── agents/
│   ├── _shared/             # Shared obligations
│   ├── generic/             # Generic FDE team (5 roles)
│   └── projects/            # Repo-specific agent groups (authored by Leonidas)
├── global-agents/           # Cross-cutting specialists
├── commands/                # 8 Slash commands (fde-workflow, commit, review, e2e, repo-recon, mcp-builder, leonidas, wiki)
├── repo-profiles/           # Intel per target repo
├── templates/               # Bootstrap templates
├── raw/                     # Raw knowledge intake
│   ├── research/            # Research notes for wiki compilation
│   └── drafts/              # Draft notes for wiki compilation
├── wiki/                    # Structured wiki (Karpathy method)
│   ├── concepts/            # General knowledge entries
│   └── sources/             # Library/API documentation entries
├── foundry-lessons.md       # Cross-project learnings
├── sync.ts                  # CLI
└── CHANGELOG.md
```
