# spartan-forge — Foundry Operating Instructions

spartan-forge is a personal agent foundry combining FDE methodology (Socratic Gate,
C-DAD, TDD Iron Law, PIV-Loop) with structured agent infrastructure (5-role teams,
Meta-Agent, Repo Recon, Sync CLI, cross-session memory).

## Agent Architecture

| Agent | File | Jurisdiction |
|-------|------|-------------|
| **leonidas** | `.claude/leonidas.md` | Sole authority for creating/modifying all agents, skills, commands |
| **fde-planner** | `agents/generic/planner/agent.md` | Feature design, contracts, task planning |
| **fde-developer** | `agents/generic/developer/agent.md` | Implementation against contracts |
| **fde-tester** | `agents/generic/tester/agent.md` | TDD enforcement, test writing |
| **fde-reviewer** | `agents/generic/reviewer/agent.md` | Adversarial code review |
| **fde-documenter** | `agents/generic/documenter/agent.md` | Post-approval documentation |

Global specialists in `global-agents/` are cross-cutting agents invoked by name as needed.

## Rules

1. **Never edit agents without going through leonidas** — use `/leonidas` to create/modify agents
2. **Never patch agents in target repos** — always edit in spartan-forge and re-sync
3. **Run repo-recon before creating project-specific agents** — no guessing at repo structure
4. **Update CLAUDE.md architecture table after every agent change**
5. **Update CHANGELOG.md with every modification**

## Skills

- `/repo-recon` — Repository intelligence gathering (GitHub + local mode)
- `/mcp-builder` — Complete MCP server development workflow

## CLI Commands

```bash
bun run sync.ts sync <agent-group> <path>   # Sync agents into a repo
bun run sync.ts sync-all                    # Sync all repos in .repos.conf
bun run sync.ts install                     # Install global agents to ~/.claude/
bun run sync.ts list                        # List available agent groups
bun run sync.ts check <agent-group>         # Check agent staleness vs repo profile
bun run sync.ts lessons-aggregate           # Aggregate lessons from all repos
```

## Directory Structure

```
spartan-forge/
├── .claude/
│   ├── leonidas.md          # Meta-agent
│   └── skills/              # Foundry-local skills
│       ├── repo-recon.md
│       └── mcp-builder.md
├── agents/
│   ├── _shared/             # Shared obligations
│   ├── generic/             # Generic FDE team (5 roles)
│   └── projects/            # Repo-specific agent groups (authored by Leonidas)
├── global-agents/           # Cross-cutting specialists
├── commands/                # Slash commands
├── skills/                  # Skills (source of truth, mirrored from .claude/skills/)
├── repo-profiles/           # Intel per target repo
├── templates/               # Bootstrap templates
├── foundry-lessons.md       # Cross-project learnings
├── sync.ts                  # CLI
└── CHANGELOG.md
```
