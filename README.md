# spartan-forge

Persönliche Agent-Foundry, die die **FDE-Methodik** (Socratic Gate, C-DAD, TDD Iron Law, PIV-Loop) mit einer strukturierten Agent-Infrastruktur (5-Rollen-Teams, Meta-Agent, Repo Recon, Sync-CLI) kombiniert.

Kurz gesagt: spartan-forge ist eine Sammlung von KI-Agenten, Slash-Commands und Skills, die du in beliebige Projekte deployen kannst — damit Claude Code in jedem Repo nach denselben Qualitätsstandards arbeitet.

---

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Installation](#2-installation)
3. [Was passiert bei der Installation?](#3-was-passiert-bei-der-installation)
4. [Die FDE-Methodik](#4-die-fde-methodik)
5. [Das Spartan Team — die 5 FDE-Agenten](#5-das-spartan-team--die-5-fde-agenten)
6. [Leonidas — der Meta-Agent](#6-leonidas--der-meta-agent)
7. [Global Specialists](#7-global-specialists)
8. [Slash Commands](#8-slash-commands)
9. [Skills](#9-skills)
10. [Der FDE Workflow im Detail](#10-der-fde-workflow-im-detail)
11. [CLI-Referenz (sync.ts)](#11-cli-referenz-syncts)
12. [Team-Workflow: mehrere Repos verwalten](#12-team-workflow-mehrere-repos-verwalten)
13. [Eigene Agenten erstellen (via Leonidas)](#13-eigene-agenten-erstellen-via-leonidas)
14. [Verzeichnisstruktur](#14-verzeichnisstruktur)
15. [Glossar](#15-glossar)

---

## 1. Voraussetzungen

| Tool | Mindestversion | Installieren |
|------|---------------|-------------|
| **Claude Code** | aktuell | `npm install -g @anthropic-ai/claude-code` |
| **Bun** | 1.x | `curl -fsSL https://bun.sh/install \| bash` |
| **Git** | beliebig | system package manager |
| **gh CLI** | beliebig (optional) | nur für `/repo-recon` im GitHub-Modus |

---

## 2. Installation

### Option A — Schnellstart (empfohlen)

```bash
# 1. Repo klonen
git clone https://github.com/dein-user/spartan-forge.git
cd spartan-forge

# 2. Alles auf einmal installieren und ein Projekt einrichten
bun run sync.ts setup ~/pfad/zu/deinem-projekt

# Oder nur global installieren (ohne Projekt-Setup)
bun run sync.ts setup
```

### Option B — Schritt für Schritt

```bash
# Schritt 1: Globale Agenten und Commands nach ~/.claude/ installieren
bun run sync.ts install

# Schritt 2: FDE-Team in ein spezifisches Projekt deployen
bun run sync.ts sync generic ~/pfad/zu/deinem-projekt
```

Das war's. Claude Code kennt jetzt alle Agenten und Commands.

---

## 3. Was passiert bei der Installation?

### `bun run sync.ts install` installiert global:

```
~/.claude/
├── agents/          ← 11 Global Specialist Agents
└── commands/        ← 4 Slash Commands (fde-workflow, commit, review, e2e)
```

Diese stehen dir danach **in jedem Projekt** zur Verfügung.

### `bun run sync.ts sync generic <pfad>` deployt ins Zielprojekt:

```
dein-projekt/
├── .claude/
│   ├── agents/          ← Die 5 FDE-Agenten (planner, developer, tester, reviewer, documenter)
│   └── resources/       ← Repo-Profil (wenn vorhanden)
├── tasks/
│   ├── todo.md          ← Aufgaben-Checkliste (aus Template)
│   ├── notes.md         ← Architektur-Entscheidungen und Handoff-Notes
│   └── lessons.md       ← Gelernte Muster und Regeln
└── CLAUDE.md            ← Projektspezifische Claude-Anweisungen (aus Template)
```

> `CLAUDE.md` und `tasks/*.md` werden nur beim ersten Mal erstellt — bestehende Dateien werden nie überschrieben.

---

## 4. Die FDE-Methodik

FDE steht für **Forward Deployed Engineer**. Die Methodik erzwingt, dass Claude Code wie ein erfahrener Senior-Engineer arbeitet — nicht als Code-Generator, der einfach drauflosschreibt.

### Die 5 Iron Laws

Alle Agenten halten sich zwingend an diese Regeln:

#### 1. Socratic Gate (Sokratisches Tor)
> Niemals Code schreiben, bevor die Anforderungen geklärt sind.

Claude stellt zuerst 3–5 gezielte Fragen zu Edge Cases, Tech-Stack-Constraints und Non-Functional Requirements. Erst nach Beantwortung wird implementiert.

#### 2. C-DAD — Contract-Driven AI Development
> Vertrag zuerst, Code danach.

Bei Features mit APIs, Datenmodellen oder Integrationen wird **zuerst der Vertrag** geschrieben (Zod-Schema, OpenAPI-Spec, Prisma-Schema) — bevor eine einzige Zeile Implementierungscode entsteht. Der Vertrag ist die Source of Truth für alle anderen Agenten.

#### 3. TDD Iron Law
> Red → Green → Refactor. Kein Code gilt als "fertig" ohne Tests.

Tests werden **vor** der Implementierung geschrieben. Der Test muss zuerst fehlschlagen (Red), dann wird implementiert (Green), dann ggf. refaktoriert.

#### 4. Planning-with-Files
> "Read Before Decide" — Kontext aus Dateien lesen, nicht aus dem Gedächtnis.

Jeder Agent liest `tasks/todo.md` und `tasks/lessons.md` zu Beginn jeder Session. Entscheidungen werden in `tasks/notes.md` dokumentiert. Nichts wird aus dem Gedächtnis gemacht.

#### 5. PIV-Loop
> Plan → Implement → Validate → (Iterate)

Kein Agent deklariert eine Aufgabe als fertig, ohne das Ergebnis verifiziert zu haben (Tests laufen, Build grün, Reviewer bestätigt).

---

## 5. Das Spartan Team — die 5 FDE-Agenten

Diese Agenten werden ins Zielprojekt deployt und arbeiten als Team zusammen. Jeder hat eine klar abgegrenzte Rolle.

### fde-planner

**Trigger:** Claude Code wählt diesen Agenten automatisch bei Feature-Design, Aufgabenzerlegung oder Contract-Definition.

**Was er tut:**
- Führt das Socratic Gate durch (stellt klärende Fragen)
- Schreibt den maschinenlesbaren Vertrag (Zod, OpenAPI, Prisma) zuerst
- Zerlegt Anforderungen in 2–5-Minuten-Arbeitspakete
- Schreibt alle Tasks als Checkboxen in `tasks/todo.md`
- Dokumentiert Architektur-Entscheidungen in `tasks/notes.md`

**Output:** Vertrag + Task-Checkliste + Handoff-Note für Developer

**Was er nicht tut:** Implementierungscode schreiben

---

### fde-developer

**Trigger:** Automatisch bei der Implementierung von Features, Bugfixes oder Produktionscode gegen eine bestehende Spec.

**Was er tut:**
- Liest den Vertrag aus `tasks/notes.md`
- Implementiert autonom gegen den Vertrag — fragt nicht den User, sondern den Planner bei Unklarheiten
- Führt nach der Implementierung die Projekt-QA-Commands aus (type-check, lint, build)
- Markiert Aufgaben in `tasks/todo.md` als erledigt

**Output:** Code-Änderungen + QA-Ergebnisse + Handoff-Note für Tester

**Was er nicht tut:** APIs/Datenmodelle designen, Tests schreiben

---

### fde-tester

**Trigger:** Automatisch nach der Implementierung — schreibt und verifiziert Tests.

**Was er tut:**
- Liest den Planner-Vertrag als Basis für Tests (nicht die Implementierung)
- Schreibt zuerst den fehlschlagenden Test (Red)
- Führt ihn aus, bestätigt den Fehlschlag
- Lässt die Developer-Implementierung den Test bestehen (Green)
- Schlägt Refactoring vor (Refactor)
- Prüft ob Test-Infrastruktur fehlt und schlägt Setup vor

**Output:** Test-Dateien (`*.test.ts`) + TDD-Log (Red → Green) + Coverage-Summary

**Was er nicht tut:** Implementierungsdetails testen, Tests ohne Vertrag schreiben, Tests ohne Ausführung als "fertig" deklarieren

---

### fde-reviewer

**Trigger:** Automatisch nach Tests — adversariale Code-Review vor dem Merge.

**Was er tut:**
- Prüft Code-Änderungen gegen den Vertrag (Spec-Compliance)
- Führt die adversariale Checkliste aus:
  - Keine rohen `any`-Typen
  - Keine `console.log` in Produktion
  - Keine offenen `// TODO` ohne Task
  - Keine N+1-Query-Patterns
  - Keine hardcodierten Secrets
  - Kein fehlendes Error Handling bei externen Calls
  - Kein OWASP Top 10 Vulnerability
  - Tests existieren und laufen durch

**Output:** Drei Sektionen — **Blocking** / **Warnings** / **Suggestions** — mit Datei+Zeile, Beschreibung, Schweregrad, empfohlenem Fix. Abschlussverdikt: `APPROVE`, `REQUEST_CHANGES` oder `NEEDS_DISCUSSION`.

**Was er nicht tut:** Code umschreiben (nur berichten), Stilpräferenzen blockieren

---

### fde-documenter

**Trigger:** Automatisch nach Reviewer-Approval — dokumentiert was tatsächlich gebaut wurde.

**Was er tut:**
- Liest den tatsächlich implementierten Code (nicht den Plan)
- Updated README.md, API-Docs, Inline-Docs
- Schreibt verwendbare Code-Beispiele und testet sie
- Updated CHANGELOG.md
- Markiert restliche Tasks in `tasks/todo.md` als erledigt

**Output:** Geänderte Doku-Dateien + Änderungs-Summary

**Was er nicht tut:** Vor dem Reviewer-Approval dokumentieren, neue Doku-Dateien erstellen wenn bestehende existieren

---

### Handoff-Protokoll zwischen den Agenten

```
fde-planner
    |  Vertrag + tasks/todo.md + Handoff-Note in tasks/notes.md
    v
fde-developer
    |  Code-Änderungen + QA-Ergebnis + Handoff-Note in tasks/notes.md
    v
fde-tester
    |  Tests (Red→Green) + Handoff-Note in tasks/notes.md
    v
fde-reviewer
    |  Verdict (APPROVE/REQUEST_CHANGES) + Handoff-Note
    v
fde-documenter
```

Jeder Agent schreibt beim Übergeben eine strukturierte Handoff-Note in `tasks/notes.md`, damit der nächste Agent sofort weiß, wo er ansetzen soll.

---

## 6. Leonidas — der Meta-Agent & Runtime Orchestrator

Leonidas hat zwei Aufgaben:

1. **Autor** — der einzige Agent, der Agenten erstellen oder modifizieren darf. Qualitätskontrolle für die gesamte Foundry.
2. **Runtime Orchestrator** — wenn `/fde-workflow` aufgerufen wird, spawnt Leonidas jeden FDE-Agenten als sequenziellen Subagenten, validiert STATUS-Zeilen zwischen den Phasen und injiziert Global-Spezialisten deterministisch.

**Aufrufen:** Der Leonidas-Agent ist in `.claude/leonidas.md` definiert und wird in Claude Code als Agent verfügbar wenn du in spartan-forge arbeitest.

**Was er tut:**
- Erstellt neue projekt-spezifische Agent-Gruppen
- Führt zuerst `/repo-recon` gegen das Ziel-Repo aus
- Prüft jeden Agenten gegen eine 12-Punkte-Quality-Checklist
- Updated `CLAUDE.md` und `CHANGELOG.md` nach jeder Änderung
- Orchestriert die FDE-Pipeline via sequenzieller Agent-Tool-Calls

**Die 12-Punkte-Checklist (alle müssen grün sein):**
1. Frontmatter: genau `name` + `description`, beide vorhanden
2. Description: ein Satz, imperativ, ≤ 120 Zeichen, beginnt mit "Use this agent when"
3. System-Prompt öffnet mit "You are..."
4. File Obligations Section ist die erste Sektion
5. FDE Principles Section vorhanden mit rollenspezifischen Laws
6. Keine impliziten Abhängigkeiten auf andere Dateien
7. CLAUDE.md Architektur-Tabelle updated
8. Verzeichnis kebab-case, Datei `agent.md` (Team) oder `<name>.md` (global)
9. Bei Projekt-Agenten: `## Target repository` mit ≥ 4 repo-spezifischen Fakten
10. Bei Projekt-Agenten: Recon wurde durchgeführt, Profil existiert
11. Bei Planners: C-DAD-Mandat vorhanden (Verträge, keine Prosa-Specs)
12. Bei Testern: TDD Iron Law vorhanden (Red → Green → Refactor)

---

## 7. Global Specialists

Diese 11 Agenten stehen nach `install` global in jedem Projekt zur Verfügung. Sie werden situativ nach Bedarf aufgerufen:

| Agent | Wofür aufrufen |
|-------|---------------|
| **architect-review** | High-level Architektur-Analyse und Empfehlungen |
| **backend-architect** | Backend-Design (APIs, Services, Datenbank-Schema) |
| **code-reviewer** | Ad-hoc Code-Review einzelner Dateien oder Diffs |
| **database-admin** | Datenbank-Optimierung, Query-Performance, Migrations |
| **expert-troubleshooter** | Systematisches Debugging (Hypothese → Fix → Verify) |
| **frontend-developer** | React/UI-Implementierung, State Management, Styling |
| **performance-engineer** | Profiling, Bottlenecks, N+1-Queries, Bundle-Size |
| **security-auditor** | OWASP Top 10, Auth-Flows, Secrets-Scanning |
| **test-automator** | Komplexe Test-Setups, E2E-Frameworks, CI-Integration |
| **typescript-pro** | TypeScript-Typensystem, generics, strict mode |
| **ui-ux-designer** | UX-Analyse, Accessibility, Design-Entscheidungen |

**Wie aufrufen:** In Claude Code einfach den Agent-Namen verwenden oder Claude bitten, diesen Spezialisten hinzuzuziehen.

---

## 8. Slash Commands

Slash Commands sind vordefinierte Workflows, die du direkt in Claude Code eingeben kannst.

### `/fde-workflow`

**Was es ist:** Der Haupt-Orchestrator. Leonidas führt die komplette FDE-Pipeline aus, indem er **jeden FDE-Agenten als echten Subagenten** sequenziell spawnt — keine Rollensimulation, keine Abkürzungen.

**Wie es funktioniert:**

```
Leonidas (aktuelle Session, Orchestrator)
  ├── Phase 0: Socratic Gate (inline — Leonidas stellt Klärungsfragen)
  ├── Phase 1: Anforderungen in tasks/notes.md schreiben
  ├── Phase 2: @fde-planner spawnen → STATUS: READY_FOR_DEVELOPER validieren
  ├── Phase 3: [Optional: security-auditor / database-admin / ui-ux-designer]
  ├── Phase 4: @fde-developer spawnen → STATUS: READY_FOR_TESTER validieren
  ├── Phase 5: [Optional: expert-troubleshooter bei BUILD_FAILED]
  ├── Phase 6: @fde-tester spawnen → STATUS: TESTS_PASSING validieren
  ├── Phase 7: [Optional: test-automator bei INFRA_MISSING]
  ├── Phase 8: @fde-reviewer spawnen → Verdict: APPROVE validieren
  └── Phase 9: @fde-documenter spawnen → finales Cleanup
```

Jeder Agent schreibt eine maschinenlesbare **STATUS-Zeile** in `tasks/notes.md`. Leonidas liest diese, bevor er den nächsten Agenten spawnt — meldet ein Agent `BLOCKED` oder `BUILD_FAILED`, hält die Pipeline an und zeigt das Problem dem User. Ein `REQUEST_CHANGES`-Verdict vom Reviewer pausiert immer für eine menschliche Entscheidung; Leonidas fixt niemals automatisch.

**Automatische Spezialist-Injektion** basierend auf dem Vertrags-Inhalt:
- Auth/JWT/OAuth im Vertrag → `security-auditor` nach dem Planner
- DB-Operationen → `database-admin` nach dem Planner
- UI/React-Arbeit → `ui-ux-designer` nach dem Planner

**Wann nutzen:** Wenn du ein neues Feature starten willst und die vollständige Qualitäts-Pipeline mit echter Agenten-Trennung durchlaufen möchtest.

---

### `/review`

**Was es ist:** Adversariale Code-Review vor dem Commit.

**Was es tut:**
- Nimmt die Rolle eines kritischen Senior FDE + Security Auditor ein
- Holt alle aktuellen Änderungen via `git diff`
- Prüft auf: Security-Lücken, Performance-Probleme, Typensicherheit, console.logs, offene TODOs
- Gibt klares Urteil: "Ready for /commit" oder Liste der Probleme

**Wann nutzen:** Nach der Implementierung, **vor** `/commit`.

---

### `/commit`

**Was es ist:** Sicherer, strukturierter Git-Commit.

**Was es tut:**
- Analysiert `git status` und `git diff`
- Prüft auf offensichtliche Fehler
- Formatiert Commit-Message nach **Conventional Commits**: `type(scope): beschreibung`
  - Erlaubte Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- Führt `git add` und `git commit` autonom aus
- Meldet Hash und Bestätigung

**Wann nutzen:** Nach `/review` wenn das Urteil "Ready for /commit" lautet.

---

### `/e2e`

**Was es ist:** Visuelles End-to-End-Testing via Headless-Browser.

**Was es tut:**
- Stellt sicher, dass der Dev-Server läuft (startet ihn wenn nötig)
- Nutzt das Vercel Agent Browser CLI (`agent-browser`)
- Navigiert durch User Journeys, macht Screenshots, analysiert das UI
- Behebt Fehler und testet erneut bis der Flow fehlerfrei läuft

**Voraussetzung:** `agent-browser` CLI muss installiert sein.

**Wann nutzen:** Nach der Implementierung von UI-Features.

---

## 9. Skills

Skills sind autonome, längere Workflows die als eigene Unteraufgaben laufen.

### `/repo-recon`

**Aufruf:**
```bash
/repo-recon owner/repo        # GitHub-Modus
/repo-recon --local ~/pfad    # Lokaler Modus
```

**Was es tut:** Sammelt strukturierte Informationen über ein Repository und schreibt ein Profil nach `repo-profiles/<name>.md`.

**GitHub-Modus** analysiert via `gh` CLI:
- QA-Commands und Dependencies aus `package.json`
- Commit-Stil (letzte 50 Commits)
- Branch-Naming (letzte 20 closed PRs)
- PR-Review-Patterns (Konversationen, Entscheidungen, Inline-Kommentare)
- Code, Config und CI-Konfiguration

**Lokaler Modus** analysiert das Dateisystem:
- Stack-Erkennung (package.json, pyproject.toml, Cargo.toml)
- Package-Manager-Erkennung (Bun, pnpm, Yarn, npm)
- Framework-Erkennung (React, Next.js, Express, Hono, FastAPI, MCP SDK, etc.)
- Monorepo-Erkennung (nx, turbo, moon, lerna)
- QA-Commands aus Scripts
- tsconfig / .eslintrc / biome.json
- Git-History-Analyse (50 Commits, 20 Branches)
- CI/CD-Pipeline aus `.github/workflows`
- Code-Pattern-Analyse (2–3 größte Source-Dateien)

**Wann nutzen:** Immer **bevor** Leonidas projekt-spezifische Agenten erstellt. Die Recon ist die Grundlage für gute Agenten.

---

### `/mcp-builder`

**Aufruf:**
```bash
/mcp-builder <projekt-name>   # Neues MCP-Server-Projekt starten
/mcp-builder --resume         # Unterbrochenen Workflow fortsetzen
```

**Was es tut:** Vollständiger Workflow zum Bauen eines MCP (Model Context Protocol) Servers nach FDE-Methodik.

**Phasen:**
1. **Discovery (Socratic Gate)** — Welches System wird exponiert? Welcher Client? Transport (stdio/HTTP)? Auth-Modell?
2. **Contract (C-DAD)** — Tool-Definitionen mit Zod-Schemas, Resource-Definitionen — alles in `tasks/notes.md`
3. **Scaffold** — Projekt-Struktur: `src/tools/`, `src/resources/`, `src/lib/`, Tests
4. **Implementation** — Server-Entry-Point, Tool-Registration, Error-Handling-Patterns
5. **Testing** — Unit-Tests, MCP Inspector, Claude-Desktop-Integration
6. **Client Configuration** — Fertige Config für Claude Desktop und Claude Code

**Wann nutzen:** Wenn du einen neuen MCP-Server bauen willst — der Skill führt dich durch den gesamten Prozess.

---

## 10. Der FDE Workflow im Detail

So sieht ein typischer Entwicklungs-Session aus:

### Für ein neues Feature

```
1. Du: "/fde-workflow — Ich möchte eine User-Authentifizierung mit JWT bauen"

2. fde-planner (Socratic Gate):
   → Stellt Fragen: Welcher Tech-Stack? Refresh Tokens? OAuth? Session-Länge?

3. Du: beantwortest die Fragen

4. fde-planner (Contract):
   → Schreibt Zod-Schema für User, Token, Auth-Endpoints
   → Erstellt tasks/todo.md mit Checkboxen:
      [ ] POST /auth/register (~3 min)
      [ ] POST /auth/login (~3 min)
      [ ] JWT Middleware (~2 min)
      ...

5. fde-developer:
   → Liest Vertrag aus tasks/notes.md
   → Implementiert jeden Task autonom
   → Führt type-check und lint aus

6. fde-tester:
   → Schreibt failing Tests (Red)
   → Verifiziert Green-Phase
   → Schreibt Coverage-Report

7. fde-reviewer:
   → Adversariale Checkliste
   → Verdict: APPROVE (oder REQUEST_CHANGES mit konkreten Punkten)

8. fde-documenter:
   → Updated README.md mit Auth-Doku
   → Updated CHANGELOG.md

9. Du: "/commit"
   → Conventional Commit wird erstellt
```

### Die tasks/-Dateien verstehen

```
tasks/
├── todo.md      ← Aktive und abgeschlossene Aufgaben
│                   [ ] Neue Aufgabe (~3 min) (added 2026-03-07)
│                   [x] Erledigte Aufgabe (completed 2026-03-07)
├── notes.md     ← Verträge + Architektur-Entscheidungen + Handoff-Notes
│                   ## Handoff: Planner → Developer (2026-03-07)
│                   ## Zod-Schema: AuthUser { id, email, ... }
└── lessons.md   ← Gelernte Regeln und Muster (wächst mit der Zeit)
                    ## 2026-03-07 — fde-developer — Prisma-Transaktionen
```

---

## 11. CLI-Referenz (sync.ts)

```bash
# SETUP — Alles in einem Schritt (empfohlen)
bun run sync.ts setup                              # Nur global installieren
bun run sync.ts setup ~/pfad/zu/projekt            # Global + generisches FDE-Team deployen
bun run sync.ts setup mein-projekt ~/pfad/projekt  # Global + spezifische Agent-Gruppe deployen

# INSTALL — Nur globale Installation (agents + commands → ~/.claude/)
bun run sync.ts install

# UNINSTALL — spartan-forge aus ~/.claude/ entfernen (nur eigene Dateien)
bun run sync.ts uninstall

# UNINSTALL — spartan-forge-Dateien aus einem Projekt entfernen (tasks/, CLAUDE.md bleiben)
bun run sync.ts uninstall ~/pfad/zum/projekt

# SYNC — FDE-Team in ein Projekt deployen
bun run sync.ts sync generic ~/pfad/zu/projekt         # Generisches FDE-Team
bun run sync.ts sync mein-projekt ~/pfad/zu/projekt    # Projekt-spezifische Agenten

# SYNC-ALL — Alle Repos aus .repos.conf synchronisieren
bun run sync.ts sync-all

# LIST — Verfügbare Agent-Gruppen anzeigen
bun run sync.ts list

# CHECK — Prüfen ob Agenten veraltet sind vs. Repo-Profil
bun run sync.ts check generic
bun run sync.ts check mein-projekt

# LESSONS-AGGREGATE — Learnings aus allen Repos in foundry-lessons.md sammeln
bun run sync.ts lessons-aggregate
```

### Was `sync` deployt (Übersicht)

| Quelle (spartan-forge) | Ziel (dein Projekt) | Verhalten |
|------------------------|---------------------|-----------|
| `agents/generic/` oder `agents/projects/<gruppe>/` | `.claude/agents/` | Immer überschreiben |
| `repo-profiles/<gruppe>.md` | `.claude/resources/repo-profile.md` | Immer überschreiben |
| `templates/CLAUDE.md.template` | `CLAUDE.md` | Nur beim ersten Mal |
| `templates/tasks/todo.md.template` | `tasks/todo.md` | Nur beim ersten Mal |
| `templates/tasks/notes.md.template` | `tasks/notes.md` | Nur beim ersten Mal |
| `templates/tasks/lessons.md.template` | `tasks/lessons.md` | Nur beim ersten Mal |

---

## 12. Team-Workflow: mehrere Repos verwalten

Wenn du mit mehreren Projekten arbeitest, nutze `.repos.conf`:

```bash
# .repos.conf aus Beispiel-Datei erstellen
cp .repos.conf.example .repos.conf
```

Datei befüllen:
```
# Format: <agent-gruppe>  <pfad-zum-repo>
generic              ~/projects/mein-side-projekt
mein-kunde           ~/work/kunde/ihr-repo
api-backend          ~/projects/api-server
```

Dann alle Repos auf einmal synchronisieren:
```bash
bun run sync.ts sync-all
```

> `.repos.conf` ist gitignored — committe sie nie, sie enthält lokale Pfade.

### Learnings aggregieren

Jedes Projekt sammelt in `tasks/lessons.md` gelernte Muster. Diese kannst du foundry-weit aggregieren:

```bash
bun run sync.ts lessons-aggregate
```

Das schreibt alle neuen Einträge aus allen Repos nach `foundry-lessons.md` — das institutionelle Gedächtnis der gesamten Foundry.

---

## 13. Eigene Agenten erstellen (via Leonidas)

Projekt-spezifische Agenten kennzeichnen sich durch tiefes Wissen über die Ziel-Codebasis. Der Prozess:

```
1. Repo-Recon durchführen:
   /repo-recon owner/repo     (GitHub)
   /repo-recon --local ~/pfad (lokal)

2. Leonidas beauftragen:
   "Erstelle eine Agenten-Gruppe für das Projekt 'mein-projekt'"

3. Leonidas:
   → Liest das Recon-Profil aus repo-profiles/
   → Erstellt agents/projects/mein-projekt/ mit allen 5 Rollen
   → Bettet ≥ 4 repo-spezifische Fakten in jeden Agenten ein
   → Führt die 12-Punkte-Checklist aus
   → Updated CLAUDE.md und CHANGELOG.md

4. Deployen:
   bun run sync.ts sync mein-projekt ~/pfad/zum-repo
```

**Regel:** Agenten **nie** direkt bearbeiten. Immer über Leonidas.

---

## 14. Verzeichnisstruktur

```
spartan-forge/
├── .claude/
│   ├── leonidas.md          # Meta-Agent (Autor aller Agenten)
│   └── skills/              # Lokal verfügbare Skills
│       ├── repo-recon.md
│       └── mcp-builder.md
│
├── agents/
│   ├── _shared/
│   │   └── file-obligations.md   # Geteilte Pflichten aller Agenten
│   ├── generic/                  # Generisches FDE-Team (5 Rollen)
│   │   ├── planner/agent.md
│   │   ├── developer/agent.md
│   │   ├── tester/agent.md
│   │   ├── reviewer/agent.md
│   │   └── documenter/agent.md
│   └── projects/                 # Repo-spezifische Gruppen (von Leonidas erstellt)
│       └── <projekt-name>/
│           └── <rolle>/agent.md
│
├── global-agents/               # 11 Cross-cutting Specialists
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
├── commands/                    # Slash Commands (→ ~/.claude/commands/)
│   ├── fde-workflow.md
│   ├── commit.md
│   ├── review.md
│   └── e2e.md
│
├── skills/                      # Skills (Source of Truth, gespiegelt in .claude/skills/)
│   ├── repo-recon.md
│   └── mcp-builder.md
│
├── repo-profiles/               # Recon-Ergebnisse pro Repo (von /repo-recon erstellt)
│   └── <projekt-name>.md
│
├── templates/                   # Bootstrap-Templates für Zielprojekte
│   ├── CLAUDE.md.template
│   ├── agent.md.template
│   └── tasks/
│       ├── todo.md.template
│       ├── notes.md.template
│       └── lessons.md.template
│
├── foundry-lessons.md           # Foundry-weites institutionelles Gedächtnis
├── sync.ts                      # CLI-Tool
├── package.json
├── .repos.conf.example          # Beispiel für Team-Konfiguration
├── CLAUDE.md                    # Foundry-Betriebsanweisungen
├── CHANGELOG.md
└── README.md                    # Diese Datei
```

---

## 15. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **FDE** | Forward Deployed Engineer — Arbeitsweise eines KI-Agenten als Senior-Engineer |
| **Foundry** | spartan-forge selbst — die "Fabrik" die Agenten produziert und deployt |
| **Agent Group** | Eine Sammlung von Agenten für ein spezifisches Projekt (z.B. 5 FDE-Rollen) |
| **Generic** | Die Standard-FDE-Gruppe ohne Projekt-spezifisches Wissen |
| **Sync** | Deploy von spartan-forge in ein Ziel-Repo |
| **Install** | Globale Installation von Agents + Commands nach `~/.claude/` |
| **Recon** | Repository-Intelligence-Gathering via `/repo-recon` |
| **Repo Profile** | Ergebnis der Recon — Profil-Datei in `repo-profiles/` |
| **C-DAD** | Contract-Driven AI Development — Vertrag vor Code |
| **Socratic Gate** | Klärungsphase — Fragen stellen bevor Code geschrieben wird |
| **PIV-Loop** | Plan → Implement → Validate → (Iterate) |
| **Iron Law** | Unverhandelbare Regel die alle Agenten einhalten müssen |
| **Handoff-Note** | Strukturierte Übergabe-Notiz in `tasks/notes.md` zwischen Agenten |
| **Leonidas** | Meta-Agent — einzige Autorität für Agenten-Erstellung |
| **MCP** | Model Context Protocol — Standard für Tool-Integration in KI-Clients |
