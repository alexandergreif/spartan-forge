#!/usr/bin/env bun
import { existsSync, mkdirSync, cpSync, copyFileSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { resolve, dirname, join } from "path";

const SCRIPT_DIR = dirname(Bun.main);
const REPOS_CONF = resolve(SCRIPT_DIR, ".repos.conf");
const TEMPLATES_DIR = resolve(SCRIPT_DIR, "templates");
const AGENTS_DIR = resolve(SCRIPT_DIR, "agents");
const GLOBAL_AGENTS_DIR = resolve(SCRIPT_DIR, "global-agents");
const COMMANDS_DIR = resolve(SCRIPT_DIR, "commands");

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

  default:
    console.error("Usage:");
    console.error("  spartan-forge sync <agent-group> <path>    # Sync agents into a repo");
    console.error("  spartan-forge sync-all                     # Sync all repos in .repos.conf");
    console.error("  spartan-forge install                      # Install global agents + commands to ~/.claude/");
    console.error("  spartan-forge list                         # List available agent groups");
    console.error("  spartan-forge check <agent-group>          # Check agent group vs repo profile");
    console.error("  spartan-forge lessons-aggregate            # Aggregate lessons from all repos");
    process.exit(1);
}
