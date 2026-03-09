# spartan-forge

Personal agent foundry combining **FDE methodology** (Socratic Gate, C-DAD, TDD Iron Law, PIV-Loop) with structured agent infrastructure (5-role teams, Meta-Agent, Repo Recon, Sync CLI).

In short: spartan-forge is a collection of AI agents, slash commands, and skills that you can deploy into any project — so Claude Code works to the same quality standards in every repo.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [What happens during installation?](#3-what-happens-during-installation)
4. [The FDE Methodology](#4-the-fde-methodology)
5. [The Spartan Team — the 5 FDE Agents](#5-the-spartan-team--the-5-fde-agents)
6. [Leonidas — the Meta-Agent](#6-leonidas--the-meta-agent)
7. [Global Specialists](#7-global-specialists)
8. [Slash Commands](#8-slash-commands)
9. [Skills](#9-skills)
10. [The FDE Workflow in Detail](#10-the-fde-workflow-in-detail)
11. [CLI Reference (sync.ts)](#11-cli-reference-syncts)
12. [Team Workflow: managing multiple repos](#12-team-workflow-managing-multiple-repos)
13. [Creating custom agents (via Leonidas)](#13-creating-custom-agents-via-leonidas)
14. [Directory Structure](#14-directory-structure)
15. [Glossary](#15-glossary)

---

## 1. Prerequisites

| Tool | Minimum version | Install |
|------|----------------|---------|
| **Claude Code** | latest | `npm install -g @anthropic-ai/claude-code` |
| **Bun** | 1.x | `curl -fsSL https://bun.sh/install \| bash` |
| **Git** | any | system package manager |
| **gh CLI** | any (optional) | only for `/repo-recon` in GitHub mode |

---

## 2. Installation

### Option A — Quick Start (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/alexandergreif/spartan-forge.git
cd spartan-forge

# 2. Install everything and set up a project in one step
bun run sync.ts setup ~/path/to/your-project

# Or install globally only (without project setup)
bun run sync.ts setup
```

### Option B — Step by step

```bash
# Step 1: Install global agents and commands to ~/.claude/
bun run sync.ts install

# Step 2: Deploy the FDE team into a specific project
bun run sync.ts sync generic ~/path/to/your-project
```

That's it. Claude Code now knows all agents and commands.

---

## 3. What happens during installation?

### `bun run sync.ts install` installs globally:

```
~/.claude/
├── agents/          <- 11 Global Specialist Agents
└── commands/        <- 4 Slash Commands (fde-workflow, commit, review, e2e)
```

These are then available in **every project**.

### `bun run sync.ts sync generic <path>` deploys into the target project:

```
your-project/
├── .claude/
│   ├── agents/          <- The 5 FDE agents (planner, developer, tester, reviewer, documenter)
│   └── resources/       <- Repo profile (if available)
├── tasks/
│   ├── todo.md          <- Task checklist (from template)
│   ├── notes.md         <- Architecture decisions and handoff notes
│   └── lessons.md       <- Learned patterns and rules
└── CLAUDE.md            <- Project-specific Claude instructions (from template)
```

> `CLAUDE.md` and `tasks/*.md` are only created the first time — existing files are never overwritten.

---

## 4. The FDE Methodology

FDE stands for **Forward Deployed Engineer**. The methodology ensures that Claude Code works like an experienced senior engineer — not as a code generator that just starts writing.

### The 5 Iron Laws

All agents strictly follow these rules:

#### 1. Socratic Gate
> Never write code before requirements are clarified.

Claude first asks 3–5 targeted questions about edge cases, tech stack constraints, and non-functional requirements. Implementation only begins after answers are provided.

#### 2. C-DAD — Contract-Driven AI Development
> Contract first, code second.

For features involving APIs, data models, or integrations, the **contract is written first** (Zod schema, OpenAPI spec, Prisma schema) — before a single line of implementation code exists. The contract is the source of truth for all other agents.

#### 3. TDD Iron Law
> Red → Green → Refactor. No code is "done" without tests.

Tests are written **before** implementation. The test must fail first (Red), then implementation happens (Green), then refactoring if needed.

#### 4. Planning-with-Files
> "Read Before Decide" — read context from files, not from memory.

Every agent reads `tasks/todo.md` and `tasks/lessons.md` at the start of each session. Decisions are documented in `tasks/notes.md`. Nothing is done from memory.

#### 5. PIV-Loop
> Plan → Implement → Validate → (Iterate)

No agent declares a task done without verifying the result (tests passing, build green, reviewer confirmed).

---

## 5. The Spartan Team — the 5 FDE Agents

These agents are deployed into the target project and work as a team. Each has a clearly defined role.

### fde-planner

**Trigger:** Claude Code automatically selects this agent for feature design, task decomposition, or contract definition.

**What it does:**
- Runs the Socratic Gate (asks clarifying questions)
- Writes the machine-readable contract (Zod, OpenAPI, Prisma) first
- Breaks requirements into 2–5 minute work packages
- Writes all tasks as checkboxes in `tasks/todo.md`
- Documents architecture decisions in `tasks/notes.md`

**Output:** Contract + task checklist + handoff note for Developer

**What it does NOT do:** Write implementation code

---

### fde-developer

**Trigger:** Automatically for implementing features, bug fixes, or production code against an existing spec.

**What it does:**
- Reads the contract from `tasks/notes.md`
- Implements autonomously against the contract — asks the Planner (not the user) for clarifications
- Runs the project's QA commands after implementation (type-check, lint, build)
- Marks tasks as complete in `tasks/todo.md`

**Output:** Code changes + QA results + handoff note for Tester

**What it does NOT do:** Design APIs/data models, write tests

---

### fde-tester

**Trigger:** Automatically after implementation — writes and verifies tests.

**What it does:**
- Reads the planner's contract as the basis for tests (not the implementation)
- Writes the failing test first (Red)
- Runs it, confirms the failure
- Verifies the developer's implementation passes the test (Green)
- Suggests refactoring (Refactor)
- Checks if test infrastructure is missing and proposes setup

**Output:** Test files (`*.test.ts`) + TDD log (Red → Green) + coverage summary

**What it does NOT do:** Test implementation details, write tests without a contract, declare tests "done" without running them

---

### fde-reviewer

**Trigger:** Automatically after tests — adversarial code review before merge.

**What it does:**
- Reviews code changes against the contract (spec compliance)
- Runs the adversarial checklist:
  - No raw `any` types
  - No `console.log` in production
  - No open `// TODO` without an associated task
  - No N+1 query patterns
  - No hardcoded secrets
  - No missing error handling on external calls
  - No OWASP Top 10 vulnerabilities
  - Tests exist and pass

**Output:** Three sections — **Blocking** / **Warnings** / **Suggestions** — with file+line, description, severity, recommended fix. Final verdict: `APPROVE`, `REQUEST_CHANGES`, or `NEEDS_DISCUSSION`.

**What it does NOT do:** Rewrite code (report only), block on style preferences

---

### fde-documenter

**Trigger:** Automatically after Reviewer approval — documents what was actually built.

**What it does:**
- Reads the actually implemented code (not the plan)
- Updates README.md, API docs, inline docs
- Writes working code examples and verifies them
- Updates CHANGELOG.md
- Marks remaining tasks as complete in `tasks/todo.md`

**Output:** Changed documentation files + change summary

**What it does NOT do:** Document before reviewer approval, create new doc files when existing ones can be updated

---

### Handoff Protocol between agents

```
fde-planner
    |  Contract + tasks/todo.md + handoff note in tasks/notes.md
    v
fde-developer
    |  Code changes + QA results + handoff note in tasks/notes.md
    v
fde-tester
    |  Tests (Red → Green) + handoff note in tasks/notes.md
    v
fde-reviewer
    |  Verdict (APPROVE/REQUEST_CHANGES) + handoff note
    v
fde-documenter
```

Each agent writes a structured handoff note to `tasks/notes.md` when passing work on, so the next agent immediately knows where to start.

---

## 6. Leonidas — the Meta-Agent & Runtime Orchestrator

Leonidas has two responsibilities:

1. **Author** — the only agent permitted to create or modify agents. Quality gate for the entire foundry.
2. **Runtime Orchestrator** — when `/fde-workflow` is invoked, Leonidas spawns each FDE agent as a sequential subagent, validates STATUS lines between phases, and injects global specialists deterministically.

**How to invoke:** The Leonidas agent is defined in `.claude/leonidas.md` and becomes available in Claude Code when working in spartan-forge.

**What it does:**
- Creates new project-specific agent groups
- Runs `/repo-recon` against the target repo first
- Validates every agent against a 12-point quality checklist
- Updates `CLAUDE.md` and `CHANGELOG.md` after every change
- Orchestrates the FDE pipeline via sequential Agent tool calls

**The 12-point checklist (all must pass):**
1. Frontmatter: exactly `name` + `description`, both present
2. Description: one sentence, imperative, ≤ 120 chars, starts with "Use this agent when"
3. System prompt opens with "You are..."
4. File Obligations section is the first section
5. FDE Principles section present with role-appropriate laws
6. No implicit dependencies on other files
7. CLAUDE.md architecture table updated
8. Directory is kebab-case, file is `agent.md` (team) or `<name>.md` (global)
9. For project agents: `## Target repository` with ≥ 4 repo-specific facts
10. For project agents: recon has been run, profile exists
11. For planners: C-DAD mandate present (contracts, not just prose specs)
12. For testers: TDD Iron Law present (Red → Green → Refactor)

---

## 7. Global Specialists

These 11 agents are available globally in every project after `install`. They are invoked situationally as needed:

| Agent | When to use |
|-------|-------------|
| **architect-review** | High-level architecture analysis and recommendations |
| **backend-architect** | Backend design (APIs, services, database schema) |
| **code-reviewer** | Ad-hoc code review of individual files or diffs |
| **database-admin** | Database optimization, query performance, migrations |
| **expert-troubleshooter** | Systematic debugging (hypothesis → fix → verify) |
| **frontend-developer** | React/UI implementation, state management, styling |
| **performance-engineer** | Profiling, bottlenecks, N+1 queries, bundle size |
| **security-auditor** | OWASP Top 10, auth flows, secrets scanning |
| **test-automator** | Complex test setups, E2E frameworks, CI integration |
| **typescript-pro** | TypeScript type system, generics, strict mode |
| **ui-ux-designer** | UX analysis, accessibility, design decisions |

**How to invoke:** In Claude Code simply use the agent name or ask Claude to bring in this specialist.

---

## 8. Slash Commands

Slash commands are predefined workflows you can enter directly in Claude Code.

### `/fde-workflow`

**What it is:** The main orchestrator. Leonidas runs the complete FDE pipeline by **spawning each FDE agent as a real subagent** in sequence — no role simulation, no shortcuts.

**How it works:**

```
Leonidas (current session, orchestrator)
  ├── Phase 0: Socratic Gate (inline — Leonidas asks clarifying questions)
  ├── Phase 1: Write clarified requirements to tasks/notes.md
  ├── Phase 2: Spawn @fde-planner → validate STATUS: READY_FOR_DEVELOPER
  ├── Phase 3: [Optional: security-auditor / database-admin / ui-ux-designer]
  ├── Phase 4: Spawn @fde-developer → validate STATUS: READY_FOR_TESTER
  ├── Phase 5: [Optional: expert-troubleshooter if BUILD_FAILED]
  ├── Phase 6: Spawn @fde-tester → validate STATUS: TESTS_PASSING
  ├── Phase 7: [Optional: test-automator if INFRA_MISSING]
  ├── Phase 8: Spawn @fde-reviewer → validate Verdict: APPROVE
  └── Phase 9: Spawn @fde-documenter → final cleanup
```

Each agent writes a machine-readable **STATUS line** to `tasks/notes.md` when done. Leonidas reads this before spawning the next agent — if an agent reports `BLOCKED` or `BUILD_FAILED`, the pipeline halts and surfaces the problem to the user. A `REQUEST_CHANGES` verdict from the reviewer always pauses for human decision; Leonidas never auto-fixes.

**Specialist injection** is automatic based on contract content:
- Auth/JWT/OAuth in contract → `security-auditor` injected after planner
- DB operations → `database-admin` injected after planner
- UI/React work → `ui-ux-designer` injected after planner

**When to use:** When starting a new feature and you want the full quality pipeline with real agent separation.

---

### `/review`

**What it is:** Adversarial code review before committing.

**What it does:**
- Takes on the role of a critical Senior FDE + Security Auditor
- Fetches all current changes via `git diff`
- Checks for: security vulnerabilities, performance issues, type safety, console.logs, open TODOs
- Gives a clear verdict: "Ready for /commit" or a list of issues

**When to use:** After implementation, **before** `/commit`.

---

### `/commit`

**What it is:** Safe, structured git commit.

**What it does:**
- Analyzes `git status` and `git diff`
- Checks for obvious errors
- Formats commit message following **Conventional Commits**: `type(scope): description`
  - Allowed types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- Runs `git add` and `git commit` autonomously
- Reports hash and confirmation

**When to use:** After `/review` when the verdict is "Ready for /commit".

---

### `/e2e`

**What it is:** Visual end-to-end testing via headless browser.

**What it does:**
- Ensures the dev server is running (starts it if needed)
- Uses the Vercel Agent Browser CLI (`agent-browser`)
- Navigates through user journeys, takes screenshots, analyzes the UI
- Fixes issues and retests until the flow runs without errors

**Prerequisite:** `agent-browser` CLI must be installed.

**When to use:** After implementing UI features.

---

## 9. Skills

Skills are autonomous, longer-running workflows that run as their own subtasks.

### `/repo-recon`

**Invocation:**
```bash
/repo-recon owner/repo        # GitHub mode
/repo-recon --local ~/path    # Local mode
```

**What it does:** Gathers structured information about a repository and writes a profile to `repo-profiles/<name>.md`.

**GitHub mode** analyzes via `gh` CLI:
- QA commands and dependencies from `package.json`
- Commit style (last 50 commits)
- Branch naming (last 20 closed PRs)
- PR review patterns (conversations, decisions, inline comments)
- Code, config, and CI configuration

**Local mode** analyzes the filesystem:
- Stack detection (package.json, pyproject.toml, Cargo.toml)
- Package manager detection (Bun, pnpm, Yarn, npm)
- Framework detection (React, Next.js, Express, Hono, FastAPI, MCP SDK, etc.)
- Monorepo detection (nx, turbo, moon, lerna)
- QA commands from scripts
- tsconfig / .eslintrc / biome.json
- Git history analysis (50 commits, 20 branches)
- CI/CD pipeline from `.github/workflows`
- Code pattern analysis (2–3 largest source files)

**When to use:** Always **before** Leonidas creates project-specific agents. The recon is the foundation for good agents.

---

### `/mcp-builder`

**Invocation:**
```bash
/mcp-builder <project-name>   # Start a new MCP server project
/mcp-builder --resume         # Resume an interrupted workflow
```

**What it does:** Complete workflow for building an MCP (Model Context Protocol) server following FDE methodology.

**Phases:**
1. **Discovery (Socratic Gate)** — What system is being exposed? Which client? Transport (stdio/HTTP)? Auth model?
2. **Contract (C-DAD)** — Tool definitions with Zod schemas, resource definitions — all in `tasks/notes.md`
3. **Scaffold** — Project structure: `src/tools/`, `src/resources/`, `src/lib/`, tests
4. **Implementation** — Server entry point, tool registration, error handling patterns
5. **Testing** — Unit tests, MCP Inspector, Claude Desktop integration
6. **Client Configuration** — Ready-to-use config for Claude Desktop and Claude Code

**When to use:** When building a new MCP server — the skill guides you through the entire process.

---

## 10. The FDE Workflow in Detail

Here is what a typical development session looks like:

### For a new feature

```
1. You: "/fde-workflow — I want to build user authentication with JWT"

2. fde-planner (Socratic Gate):
   → Asks questions: Which tech stack? Refresh tokens? OAuth? Session length?

3. You: answer the questions

4. fde-planner (Contract):
   → Writes Zod schema for User, Token, Auth endpoints
   → Creates tasks/todo.md with checkboxes:
      [ ] POST /auth/register (~3 min)
      [ ] POST /auth/login (~3 min)
      [ ] JWT Middleware (~2 min)
      ...

5. fde-developer:
   → Reads contract from tasks/notes.md
   → Implements each task autonomously
   → Runs type-check and lint

6. fde-tester:
   → Writes failing tests (Red)
   → Verifies Green phase
   → Writes coverage report

7. fde-reviewer:
   → Adversarial checklist
   → Verdict: APPROVE (or REQUEST_CHANGES with specific items)

8. fde-documenter:
   → Updates README.md with auth docs
   → Updates CHANGELOG.md

9. You: "/commit"
   → Conventional commit is created
```

### Understanding the tasks/ files

```
tasks/
├── todo.md      <- Active and completed tasks
│                   [ ] New task (~3 min) (added 2026-03-07)
│                   [x] Completed task (completed 2026-03-07)
├── notes.md     <- Contracts + architecture decisions + handoff notes
│                   ## Handoff: Planner → Developer (2026-03-07)
│                   ## Zod Schema: AuthUser { id, email, ... }
└── lessons.md   <- Learned rules and patterns (grows over time)
                    ## 2026-03-07 — fde-developer — Prisma transactions
```

---

## 11. CLI Reference (sync.ts)

```bash
# SETUP — Everything in one step (recommended)
bun run sync.ts setup                              # Global install only
bun run sync.ts setup ~/path/to/project            # Global + deploy generic FDE team
bun run sync.ts setup my-project ~/path/project    # Global + deploy specific agent group

# INSTALL — Global installation only (agents + commands → ~/.claude/)
bun run sync.ts install

# UNINSTALL — Remove spartan-forge from ~/.claude/ (only spartan-forge's own files)
bun run sync.ts uninstall

# UNINSTALL — Remove spartan-forge files from a project (leaves tasks/, CLAUDE.md intact)
bun run sync.ts uninstall ~/path/to/project

# SYNC — Deploy FDE team into a project
bun run sync.ts sync generic ~/path/to/project         # Generic FDE team
bun run sync.ts sync my-project ~/path/to/project      # Project-specific agents

# SYNC-ALL — Synchronize all repos from .repos.conf
bun run sync.ts sync-all

# LIST — Show available agent groups
bun run sync.ts list

# CHECK — Check if agents are stale vs. repo profile
bun run sync.ts check generic
bun run sync.ts check my-project

# LESSONS-AGGREGATE — Collect learnings from all repos into foundry-lessons.md
bun run sync.ts lessons-aggregate
```

### What `sync` deploys (overview)

| Source (spartan-forge) | Target (your project) | Behavior |
|------------------------|-----------------------|----------|
| `agents/generic/` or `agents/projects/<group>/` | `.claude/agents/` | Always overwrite |
| `repo-profiles/<group>.md` | `.claude/resources/repo-profile.md` | Always overwrite |
| `templates/CLAUDE.md.template` | `CLAUDE.md` | First time only |
| `templates/tasks/todo.md.template` | `tasks/todo.md` | First time only |
| `templates/tasks/notes.md.template` | `tasks/notes.md` | First time only |
| `templates/tasks/lessons.md.template` | `tasks/lessons.md` | First time only |

---

## 12. Team Workflow: managing multiple repos

When working with multiple projects, use `.repos.conf`:

```bash
# Create .repos.conf from the example file
cp .repos.conf.example .repos.conf
```

Fill in the file:
```
# Format: <agent-group>  <path-to-repo>
generic              ~/projects/my-side-project
my-client            ~/work/client/their-repo
api-backend          ~/projects/api-server
```

Then sync all repos at once:
```bash
bun run sync.ts sync-all
```

> `.repos.conf` is gitignored — never commit it, it contains local paths.

### Aggregating learnings

Each project collects learned patterns in `tasks/lessons.md`. You can aggregate these foundry-wide:

```bash
bun run sync.ts lessons-aggregate
```

This writes all new entries from all repos into `foundry-lessons.md` — the institutional memory of the entire foundry.

---

## 13. Creating custom agents (via Leonidas)

Project-specific agents are characterized by deep knowledge of the target codebase. The process:

```
1. Run Repo Recon:
   /repo-recon owner/repo     (GitHub)
   /repo-recon --local ~/path (local)

2. Commission Leonidas:
   "Create an agent group for the project 'my-project'"

3. Leonidas:
   → Reads the recon profile from repo-profiles/
   → Creates agents/projects/my-project/ with all 5 roles
   → Embeds >= 4 repo-specific facts into each agent
   → Runs the 12-point checklist
   → Updates CLAUDE.md and CHANGELOG.md

4. Deploy:
   bun run sync.ts sync my-project ~/path/to-repo
```

**Rule:** Never edit agents directly. Always go through Leonidas.

---

## 14. Directory Structure

```
spartan-forge/
├── .claude/
│   ├── leonidas.md          # Meta-agent (author of all agents)
│   └── skills/              # Locally available skills
│       ├── repo-recon.md
│       └── mcp-builder.md
│
├── agents/
│   ├── _shared/
│   │   └── file-obligations.md   # Shared obligations for all agents
│   ├── generic/                  # Generic FDE team (5 roles)
│   │   ├── planner/agent.md
│   │   ├── developer/agent.md
│   │   ├── tester/agent.md
│   │   ├── reviewer/agent.md
│   │   └── documenter/agent.md
│   └── projects/                 # Repo-specific groups (created by Leonidas)
│       └── <project-name>/
│           └── <role>/agent.md
│
├── global-agents/               # 11 Cross-cutting specialists
│   ├── architect-review.md
│   ├── backend-architect.md
│   ├── code-reviewer.md
│   ├── database-admin.md
│   ├── expert-troubleshooter.md
│   ├── frontend-developer.md
│   ├── performance-engineer.md
│   ├── security-auditor.md
│   ├── test-automator.md
│   ├── typescript-pro.md
│   └── ui-ux-designer.md
│
├── commands/                    # Slash commands (-> ~/.claude/commands/)
│   ├── fde-workflow.md
│   ├── commit.md
│   ├── review.md
│   └── e2e.md
│
├── skills/                      # Skills (source of truth, mirrored in .claude/skills/)
│   ├── repo-recon.md
│   └── mcp-builder.md
│
├── repo-profiles/               # Recon results per repo (created by /repo-recon)
│   └── <project-name>.md
│
├── templates/                   # Bootstrap templates for target projects
│   ├── CLAUDE.md.template
│   ├── agent.md.template
│   └── tasks/
│       ├── todo.md.template
│       ├── notes.md.template
│       └── lessons.md.template
│
├── foundry-lessons.md           # Foundry-wide institutional memory
├── sync.ts                      # CLI tool
├── package.json
├── .repos.conf.example          # Example for team configuration
├── CLAUDE.md                    # Foundry operating instructions
├── CHANGELOG.md
└── README.md                    # German documentation
```

---

## 15. Glossary

| Term | Meaning |
|------|---------|
| **FDE** | Forward Deployed Engineer — how an AI agent works like a senior engineer |
| **Foundry** | spartan-forge itself — the "factory" that produces and deploys agents |
| **Agent Group** | A collection of agents for a specific project (e.g. 5 FDE roles) |
| **Generic** | The standard FDE group without project-specific knowledge |
| **Sync** | Deploy from spartan-forge into a target repo |
| **Install** | Global installation of agents + commands to `~/.claude/` |
| **Recon** | Repository intelligence gathering via `/repo-recon` |
| **Repo Profile** | Result of the recon — profile file in `repo-profiles/` |
| **C-DAD** | Contract-Driven AI Development — contract before code |
| **Socratic Gate** | Clarification phase — ask questions before writing code |
| **PIV-Loop** | Plan → Implement → Validate → (Iterate) |
| **Iron Law** | Non-negotiable rule that all agents must follow |
| **Handoff Note** | Structured transition note in `tasks/notes.md` between agents |
| **Leonidas** | Meta-agent — sole authority for agent creation |
| **MCP** | Model Context Protocol — standard for tool integration in AI clients |
