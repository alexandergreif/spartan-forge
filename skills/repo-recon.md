# Skill: repo-recon

Invocation: `/repo-recon <owner/repo>` or `/repo-recon --local <path>`

Run the Repository Recon Protocol against a GitHub repository or local project
and write gathered intel to `repo-profiles/<project-name>.md`.

---

## Mode Detection

- If argument contains `/`: treat as GitHub repo (`owner/repo`). Use `gh` CLI.
- If argument starts with `--local` or is a file path: scan local filesystem.
- If ambiguous: ask.

## Steps (GitHub mode)

1. Check existing intel (CONVENTIONS.md, repo-profile.md in target)
2. QA commands & dependencies from package.json
3. Commit style from last 50 commits
4. Branch naming from last 20 closed PRs
5. PR review patterns (3 layers: conversation, decisions, inline comments)
6. Code, config, and CI scanning
7. Write profile to repo-profiles/
8. Report

## Steps (Local mode — NEW)

1. Read package.json / pyproject.toml / Cargo.toml for stack detection
2. Detect package manager: bun.lockb → Bun, pnpm-lock.yaml → pnpm, yarn.lock → Yarn, else npm
3. Detect framework: check dependencies for React, Next, Express, Hono,
   FastAPI, MCP SDK, Lit, Svelte, Vue, etc.
4. Detect monorepo: check for nx.json, turbo.json, moon.yml, lerna.json
5. Extract QA commands from scripts
6. Read tsconfig.json / .eslintrc / biome.json for config
7. If .git exists: analyze last 50 commits for style, last 20 branches
8. If .github/workflows exists: map CI pipeline
9. Read 2-3 largest source files for code patterns
10. If CLAUDE.md exists: extract existing conventions
11. If tasks/lessons.md exists: extract learned patterns
12. Write profile to repo-profiles/
13. Report

## Profile Format (same for both modes)

1. **Identity** (repo/path, branch, stack, output type, package manager, framework)
2. **QA Commands** (table: command → purpose → when to run)
3. **CI Pipeline** (table — if applicable)
4. **Branch Naming** (observed vs. documented)
5. **Commit Style** (observed vs. documented)
6. **PR Review Patterns** (GitHub mode only — skip for local)
7. **Detected Patterns** (base classes, import ordering, key utilities)
8. **MCP Server Detection** (if @modelcontextprotocol/sdk found: list tools, transports)
9. **Monorepo Structure** (if detected: workspace packages, dependency graph)
10. **Gotchas & Known Pitfalls** (numbered table: # | Pitfall | Prevention)
11. **Recon Metadata** (date, mode, sampled files, analyst: spartan-forge/repo-recon)
