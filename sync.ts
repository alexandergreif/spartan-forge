#!/usr/bin/env bun
import { existsSync, mkdirSync, cpSync, copyFileSync, readFileSync, readdirSync, writeFileSync, rmSync } from "fs";
import { resolve, dirname, join } from "path";

const SCRIPT_DIR = dirname(Bun.main);
const REPOS_CONF = resolve(SCRIPT_DIR, ".repos.conf");
const TEMPLATES_DIR = resolve(SCRIPT_DIR, "templates");
const AGENTS_DIR = resolve(SCRIPT_DIR, "agents");
const GLOBAL_AGENTS_DIR = resolve(SCRIPT_DIR, "global-agents");
const COMMANDS_DIR = resolve(SCRIPT_DIR, "commands");
const SKILLS_DIR = resolve(SCRIPT_DIR, "skills");
const LEONIDAS_MD = resolve(SCRIPT_DIR, ".claude", "leonidas.md");

function resolvePath(p: string): string {
  return resolve(p.replace("~", Bun.env.HOME!));
}

// --- SYNC: deploy project agents into a target repo ---
function syncRepo(group: string, targetPath: string) {
  const target = resolvePath(targetPath);
  // Try projects/ first, then generic/
  let source = resolve(AGENTS_DIR, "projects", group);
  if (!existsSync(source)) {
    source = resolve(AGENTS_DIR, "generic");
    console.log(`  ℹ️  No project-specific agents for '${group}', using generic FDE team`);
  }

  console.log(`\n🔄 Syncing '${group}' → ${target}`);

  // Always overwrite agents
  const agentsTarget = resolve(target, ".claude/agents");
  mkdirSync(agentsTarget, { recursive: true });
  cpSync(source, agentsTarget, { recursive: true, force: true });
  console.log("  ✅ Agents synced");

  // Always overwrite skills
  if (existsSync(SKILLS_DIR)) {
    const skillsTarget = resolve(target, ".claude/skills");
    mkdirSync(skillsTarget, { recursive: true });
    cpSync(SKILLS_DIR, skillsTarget, { recursive: true, force: true });
    console.log("  ✅ Skills synced");
  }

  // Always overwrite profile (if exists)
  const resourcesDir = resolve(target, ".claude/resources");
  mkdirSync(resourcesDir, { recursive: true });
  const profileSrc = resolve(SCRIPT_DIR, "repo-profiles", `${group}.md`);
  if (existsSync(profileSrc)) {
    copyFileSync(profileSrc, resolve(resourcesDir, "repo-profile.md"));
    console.log("  ✅ repo-profile.md synced");
  }

  // First-time only: CLAUDE.md
  const claudeMd = resolve(target, "CLAUDE.md");
  if (!existsSync(claudeMd)) {
    copyFileSync(resolve(TEMPLATES_DIR, "CLAUDE.md.template"), claudeMd);
    console.log("  ✅ CLAUDE.md created from template");
  } else {
    console.log("  ⏭️  CLAUDE.md exists, skipping");
  }

  // First-time only: task files
  const tasksDir = resolve(target, "tasks");
  mkdirSync(tasksDir, { recursive: true });
  for (const file of ["todo.md", "notes.md", "lessons.md"]) {
    const dest = resolve(tasksDir, file);
    if (!existsSync(dest)) {
      const tmpl = resolve(TEMPLATES_DIR, "tasks", `${file}.template`);
      if (existsSync(tmpl)) {
        copyFileSync(tmpl, dest);
        console.log(`  ✅ tasks/${file} created`);
      }
    } else {
      console.log(`  ⏭️  tasks/${file} exists, skipping`);
    }
  }
}

// --- SETUP: install globals + optionally sync a repo (all-in-one) ---
function setup(args: string[]) {
  install();

  if (args.length === 0) {
    console.log("\n✅ Global install complete. Run 'bun run sync.ts setup <path>' to also set up a project.");
    return;
  }

  // setup <path>  → sync generic into <path>
  // setup <group> <path>  → sync <group> into <path>
  if (args.length === 1) {
    syncRepo("generic", args[0]);
  } else {
    syncRepo(args[0], args[1]);
  }
}

// --- INSTALL: deploy global agents + commands to ~/.claude/ ---
function install() {
  const home = Bun.env.HOME!;
  const claudeDir = resolve(home, ".claude");

  // Global agents
  const agentsDir = resolve(claudeDir, "agents");
  mkdirSync(agentsDir, { recursive: true });
  const agents = readdirSync(GLOBAL_AGENTS_DIR).filter(f => f.endsWith(".md"));
  for (const agent of agents) {
    copyFileSync(resolve(GLOBAL_AGENTS_DIR, agent), resolve(agentsDir, agent));
  }
  console.log(`✅ ${agents.length} global agents installed to ~/.claude/agents/`);

  // Commands
  const commandsDir = resolve(claudeDir, "commands");
  mkdirSync(commandsDir, { recursive: true });
  const commands = readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".md"));
  for (const cmd of commands) {
    copyFileSync(resolve(COMMANDS_DIR, cmd), resolve(commandsDir, cmd));
  }
  console.log(`✅ ${commands.length} commands installed to ~/.claude/commands/`);

  // Skills global
  const skillsDir = resolve(claudeDir, "skills");
  mkdirSync(skillsDir, { recursive: true });
  if (existsSync(SKILLS_DIR)) {
    const skillFiles = readdirSync(SKILLS_DIR).filter(f => f.endsWith(".md"));
    for (const s of skillFiles) {
      copyFileSync(resolve(SKILLS_DIR, s), resolve(skillsDir, s));
    }
    console.log(`✅ ${skillFiles.length} skills installed to ~/.claude/skills/`);
  }

  // Leonidas as global agent
  if (existsSync(LEONIDAS_MD)) {
    copyFileSync(LEONIDAS_MD, resolve(agentsDir, "leonidas.md"));
    console.log("✅ leonidas installed to ~/.claude/agents/leonidas.md");
  }

  // Auto-sync into current repo if it's a git repo (and not spartan-forge itself)
  const cwd = process.cwd();
  const isGitRepo = existsSync(resolve(cwd, ".git"));
  if (isGitRepo && cwd !== SCRIPT_DIR) {
    console.log(`\n🔍 Git repo detected at ${cwd} — auto-syncing...`);
    syncRepo("generic", cwd);
  }
}

// --- LIST: show available agent groups ---
function list() {
  console.log("Available agent groups:");
  console.log("\n  Generic (FDE team):");
  console.log("    generic/");

  const projectsDir = resolve(AGENTS_DIR, "projects");
  if (existsSync(projectsDir)) {
    const projects = readdirSync(projectsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    if (projects.length > 0) {
      console.log("\n  Project-specific:");
      for (const p of projects) console.log(`    ${p}/`);
    }
  }
}

// --- CHECK: verify agent group is not stale vs target repo ---
function check(group: string) {
  const projectsDir = resolve(AGENTS_DIR, "projects", group);
  const genericDir = resolve(AGENTS_DIR, "generic");
  const sourceDir = existsSync(projectsDir) ? projectsDir : genericDir;

  console.log(`\n🔍 Checking agent group '${group}'...`);

  const profileSrc = resolve(SCRIPT_DIR, "repo-profiles", `${group}.md`);
  if (!existsSync(profileSrc)) {
    console.warn(`  ⚠️  No repo-profile found for '${group}'. Run /repo-recon first.`);
    return;
  }

  // Read the profile and look for stack info
  const profile = readFileSync(profileSrc, "utf-8");
  const packageManagerMatch = profile.match(/Package manager:\s*(\w+)/i);
  const frameworkMatch = profile.match(/Framework:\s*([\w,\s]+)/i);

  console.log(`  Profile found: repo-profiles/${group}.md`);
  if (packageManagerMatch) console.log(`  Package manager: ${packageManagerMatch[1]}`);
  if (frameworkMatch) console.log(`  Framework: ${frameworkMatch[1]}`);

  // Check each agent file for outdated references
  const agentFiles = readdirSync(sourceDir, { recursive: true, withFileTypes: true })
    .filter((f): f is { isFile(): true; name: string; parentPath: string } & ReturnType<typeof readdirSync>[0] =>
      typeof f === 'object' && 'name' in f && f.name.endsWith(".md"))
    .map((f: any) => join(f.parentPath, f.name));

  console.log(`  Checking ${agentFiles.length} agent files...`);
  console.log("  ✅ Check complete (manual review recommended for outdated tech references)");
}

// --- LESSONS-AGGREGATE: collect cross-project learnings ---
function lessonsAggregate() {
  const repos = loadRepos();
  if (repos.length === 0) {
    console.error("❌ No repos in .repos.conf");
    process.exit(1);
  }

  const foundryLessons = resolve(SCRIPT_DIR, "foundry-lessons.md");
  const existing = existsSync(foundryLessons) ? readFileSync(foundryLessons, "utf-8") : "";
  const newEntries: string[] = [];

  for (const { repo, path } of repos) {
    const lessonsPath = resolve(resolvePath(path), "tasks/lessons.md");
    if (!existsSync(lessonsPath)) {
      console.log(`  ⏭️  No lessons.md in ${repo}`);
      continue;
    }
    const content = readFileSync(lessonsPath, "utf-8");
    const entries = content.split(/^## /m).filter(e => e.trim() && !e.startsWith("#"));
    for (const entry of entries) {
      const entryFull = `## ${entry.trim()}`;
      if (!existing.includes(entry.split("\n")[0])) {
        newEntries.push(`<!-- from: ${repo} -->\n${entryFull}`);
      }
    }
    console.log(`  ✅ Scanned ${repo}: ${entries.length} entries`);
  }

  if (newEntries.length > 0) {
    const append = `\n\n${newEntries.join("\n\n")}`;
    writeFileSync(foundryLessons, existing + append);
    console.log(`\n✅ Aggregated ${newEntries.length} new lessons into foundry-lessons.md`);
  } else {
    console.log("\n✅ No new lessons to aggregate");
  }
}

// --- UNINSTALL: remove spartan-forge files from ~/.claude/ or a project ---
function uninstall(args: string[]) {
  if (args.length === 0) {
    uninstallGlobal();
  } else {
    uninstallRepo(args[0]);
  }
}

function uninstallGlobal() {
  const home = Bun.env.HOME!;
  const claudeDir = resolve(home, ".claude");
  console.log("🗑️  Uninstalling spartan-forge from ~/.claude/\n");

  // Remove global agents (only files spartan-forge installed)
  const agentsDir = resolve(claudeDir, "agents");
  let agentsRemoved = 0;
  if (existsSync(agentsDir)) {
    const toRemove = [
      ...readdirSync(GLOBAL_AGENTS_DIR).filter(f => f.endsWith(".md")),
      "leonidas.md",
    ];
    for (const file of toRemove) {
      const target = resolve(agentsDir, file);
      if (existsSync(target)) { rmSync(target); agentsRemoved++; }
    }
  }
  console.log(`  ✅ Removed ${agentsRemoved} agents from ~/.claude/agents/`);

  // Remove commands (only files spartan-forge installed)
  const commandsDir = resolve(claudeDir, "commands");
  let cmdsRemoved = 0;
  if (existsSync(commandsDir)) {
    for (const file of readdirSync(COMMANDS_DIR).filter(f => f.endsWith(".md"))) {
      const target = resolve(commandsDir, file);
      if (existsSync(target)) { rmSync(target); cmdsRemoved++; }
    }
  }
  console.log(`  ✅ Removed ${cmdsRemoved} commands from ~/.claude/commands/`);

  // Remove skills (only files spartan-forge installed)
  const skillsDir = resolve(claudeDir, "skills");
  let skillsRemoved = 0;
  if (existsSync(skillsDir) && existsSync(SKILLS_DIR)) {
    for (const file of readdirSync(SKILLS_DIR).filter(f => f.endsWith(".md"))) {
      const target = resolve(skillsDir, file);
      if (existsSync(target)) { rmSync(target); skillsRemoved++; }
    }
  }
  console.log(`  ✅ Removed ${skillsRemoved} skills from ~/.claude/skills/`);

  console.log("\n✅ Global uninstall complete.");
  console.log("   ~/.claude/CLAUDE.md and any user-added agents were left intact.");
}

function uninstallRepo(targetPath: string) {
  const target = resolvePath(targetPath);
  console.log(`🗑️  Uninstalling spartan-forge from ${target}\n`);

  // Remove agent files that spartan-forge installed (match generic agent filenames)
  const agentsTarget = resolve(target, ".claude/agents");
  if (existsSync(agentsTarget)) {
    const genericDir = resolve(AGENTS_DIR, "generic");
    const genericEntries = readdirSync(genericDir, { recursive: true, withFileTypes: true }) as any[];
    let removed = 0;
    for (const entry of genericEntries) {
      if (typeof entry === "object" && entry.name?.endsWith(".md")) {
        const rel = entry.parentPath
          ? join(entry.parentPath, entry.name).replace(genericDir + "/", "")
          : entry.name;
        const agentPath = resolve(agentsTarget, rel);
        if (existsSync(agentPath)) { rmSync(agentPath); removed++; }
      }
    }
    // Remove empty subdirectories left behind
    for (const sub of readdirSync(agentsTarget, { withFileTypes: true })) {
      if (sub.isDirectory()) {
        const subPath = resolve(agentsTarget, sub.name);
        if (readdirSync(subPath).length === 0) rmSync(subPath);
      }
    }
    console.log(`  ✅ Removed ${removed} agent files from .claude/agents/`);
  } else {
    console.log("  ⏭️  .claude/agents/ not found — skipping");
  }

  // Remove skills installed by spartan-forge
  const skillsTarget = resolve(target, ".claude/skills");
  if (existsSync(skillsTarget) && existsSync(SKILLS_DIR)) {
    let skillsRemoved = 0;
    for (const file of readdirSync(SKILLS_DIR).filter(f => f.endsWith(".md"))) {
      const p = resolve(skillsTarget, file);
      if (existsSync(p)) { rmSync(p); skillsRemoved++; }
    }
    console.log(`  ✅ Removed ${skillsRemoved} skill files from .claude/skills/`);
  } else {
    console.log("  ⏭️  .claude/skills/ not found — skipping");
  }

  // Remove repo-profile installed by spartan-forge
  const profileTarget = resolve(target, ".claude/resources/repo-profile.md");
  if (existsSync(profileTarget)) {
    rmSync(profileTarget);
    console.log("  ✅ Removed .claude/resources/repo-profile.md");
  }

  console.log("\n✅ Project uninstall complete.");
  console.log("   Left intact (contain your data — remove manually if no longer needed):");
  console.log("     tasks/todo.md, tasks/notes.md, tasks/lessons.md, CLAUDE.md");
}

// --- LOAD REPOS ---
function loadRepos(): Array<{ repo: string; path: string }> {
  if (!existsSync(REPOS_CONF)) return [];
  return readFileSync(REPOS_CONF, "utf-8")
    .split("\n")
    .filter(line => line.trim() && !line.startsWith("#"))
    .map(line => {
      const [repo, path] = line.trim().split(/\s+/);
      return { repo, path };
    });
}

// --- CLI ---
const [,, command, ...args] = process.argv;

switch (command) {
  case "setup":
    setup(args);
    break;

  case "sync":
    if (args.length !== 2) {
      console.error("Usage: spartan-forge sync <agent-group> <path>");
      process.exit(1);
    }
    syncRepo(args[0], args[1]);
    break;

  case "sync-all": {
    const repos = loadRepos();
    if (repos.length === 0) {
      console.error("❌ No repos in .repos.conf");
      process.exit(1);
    }
    for (const { repo, path } of repos) syncRepo(repo, path);
    break;
  }

  case "install":
    install();
    break;

  case "list":
    list();
    break;

  case "check":
    if (args.length !== 1) {
      console.error("Usage: spartan-forge check <agent-group>");
      process.exit(1);
    }
    check(args[0]);
    break;

  case "lessons-aggregate":
    lessonsAggregate();
    break;

  case "uninstall":
    uninstall(args);
    break;

  default:
    console.error("Usage:");
    console.error("  sync.ts install                            # Everything: global agents + skills + leonidas + auto-sync current repo");
    console.error("  sync.ts uninstall                          # Remove spartan-forge agents/commands/skills from ~/.claude/");
    console.error("  sync.ts uninstall <path>                   # Remove spartan-forge files from a project (leaves tasks/, CLAUDE.md)");
    console.error("  sync.ts sync <agent-group> <path>          # Sync agents + skills into a specific repo");
    console.error("  sync.ts sync-all                           # Sync all repos in .repos.conf");
    console.error("  sync.ts setup [path]                       # Install global + optionally sync generic into <path>");
    console.error("  sync.ts setup <agent-group> <path>         # Install global + sync specific group into <path>");
    console.error("  sync.ts list                               # List available agent groups");
    console.error("  sync.ts check <agent-group>                # Check agent group vs repo profile");
    console.error("  sync.ts lessons-aggregate                  # Aggregate lessons from all repos");
    process.exit(1);
}
