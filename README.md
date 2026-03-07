# spartan-forge

Personal agent foundry combining **FDE methodology** (Socratic Gate, C-DAD, TDD Iron Law) with **structured agent infrastructure** (5-role teams, Meta-Agent, Repo Recon, Sync CLI).

## Quick Start

```bash
# Install global agents and commands to ~/.claude/
bun run sync.ts install

# Sync generic FDE team into a project
bun run sync.ts sync generic ~/path/to/your/project

# Or list what's available
bun run sync.ts list
```

## How It Works

spartan-forge has two modes:

**Generic Mode** — Use the FDE team at any repo without setup:
```bash
bun run sync.ts sync generic ~/projects/any-project
```
Then use `/fde-workflow` to start a development session.

**Foundry Mode** — Deep integration for long-term projects:
```bash
# 1. Gather repo intelligence
/repo-recon owner/repo        # GitHub
/repo-recon --local ~/path    # Local

# 2. Leonidas creates project-specific agents
# (Use the leonidas agent to author the group)

# 3. Sync into the target repo
bun run sync.ts sync my-project ~/path/to/project

# 4. Work with the team
/fde-workflow
```

## The Spartan Team

| Role | Agent | Responsibility |
|------|-------|---------------|
| Architect | **fde-planner** | Socratic Gate → C-DAD contracts → task planning |
| Builder | **fde-developer** | Implements against contracts autonomously |
| Verifier | **fde-tester** | TDD: Red → Green → Refactor |
| Gate | **fde-reviewer** | Adversarial review: security, performance, correctness |
| Scribe | **fde-documenter** | Post-approval documentation |

Coordinated by **leonidas** (meta-agent, sole authority for agent authorship).

## FDE Iron Laws

All agents enforce these laws:

1. **Socratic Gate** — Clarify before implementing. Ask 3-5 questions.
2. **C-DAD** — Write Zod/OpenAPI/Prisma contracts before code.
3. **TDD** — Red → Green → Refactor. No code ships without tests.
4. **Planning-with-Files** — Plans in `tasks/todo.md`, decisions in `tasks/notes.md`.
5. **Lessons-First** — Read `tasks/lessons.md` every session. Write to it after corrections.

## CLI Reference

```bash
bun run sync.ts sync <group> <path>     # Deploy agents into a repo
bun run sync.ts sync-all                # Deploy to all repos in .repos.conf
bun run sync.ts install                 # Install global agents to ~/.claude/
bun run sync.ts list                    # List agent groups
bun run sync.ts check <group>           # Check if agents are stale vs repo
bun run sync.ts lessons-aggregate       # Collect lessons from all repos
```

## For Teammates

1. Clone this repo
2. Copy `.repos.conf.example` to `.repos.conf` and fill in your paths
3. Run `bun run sync.ts install` to get global agents + commands
4. Run `bun run sync.ts sync generic ~/your/project` to set up a project

## Structure

```
spartan-forge/
├── .claude/leonidas.md          # Meta-agent
├── .claude/skills/              # repo-recon, mcp-builder
├── agents/generic/              # 5 FDE team agents
├── agents/projects/             # Project-specific groups (created by leonidas)
├── global-agents/               # 11 cross-cutting specialists
├── commands/                    # fde-workflow, commit, review, e2e
├── skills/                      # Source of truth for skills
├── repo-profiles/               # Intel per target repo
├── templates/                   # Bootstrap files for target repos
├── foundry-lessons.md           # Cross-project institutional memory
└── sync.ts                      # CLI
```
