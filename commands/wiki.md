Command: Wiki Knowledge Management (/wiki)

Invocation: `/wiki <subcommand> [args]`

Manage the project's wiki knowledge base using the Karpathy LLM Wiki Method.
Delegates execution to the **archivist** agent.

---

## Subcommands

### /wiki compile [path]

Compile raw notes into structured wiki entries.

1. If `path` given: compile only that raw file. Otherwise: compile all unprocessed files in `raw/`.
2. "Unprocessed" = raw files whose content has not yet been absorbed into any wiki entry (check by scanning wiki entries' `sources:` frontmatter for the raw file path).
3. For each raw file: create or update a wiki entry in `wiki/concepts/` (general knowledge) or `wiki/sources/` (library/API docs).
4. Every created entry MUST have full YAML frontmatter: `title`, `aliases`, `sources`, `tags`, `references`, `created`, `updated`.
5. Resolve `[[ ]]` backlinks: scan body for `[[term]]`, match against existing wiki entry `title` or `aliases` (case-insensitive).
6. Regenerate `wiki/index.md` after all entries are written.
7. Output: list of created/updated entries with file paths.

### /wiki sync

Deduplicate and refresh the wiki.

1. Scan all entries in `wiki/concepts/` and `wiki/sources/`.
2. Detect semantic duplicates (same title, overlapping aliases).
3. Merge duplicates: keep the richer entry, redirect aliases, update all `[[ ]]` references.
4. Validate and refresh all backlinks across all entries.
5. Regenerate `wiki/index.md`.
6. Output: sync report (merged, updated, orphaned).

### /wiki query <search-term>

Search the wiki for knowledge.

1. Search wiki entries by: title, aliases, tags, body content.
2. Return matching entries as a structured list with: path, title, tags, first-paragraph excerpt.
3. Designed for consumption by other agents (e.g., fde-developer looking up a pattern before implementing).
4. If no matches: suggest related entries or offer to run `/wiki intake` with context7.

### /wiki lint

Validate wiki integrity.

1. Validate every wiki entry in `wiki/`:
   - Required frontmatter fields present: `title`, `tags`, `created`, `updated`
   - All `[[ ]]` backlinks resolve to an existing wiki entry (by title or alias)
   - No orphaned entries (entries with no backlinks pointing to them — WARNING, not ERROR)
   - `references:` paths exist in the codebase (if populated)
   - No duplicate titles or aliases across entries
2. Output: validation report grouped by severity (ERROR / WARNING / INFO).

### /wiki intake <library-name>

Pull external documentation via context7 MCP and distill into the wiki.

1. Use `mcp__context7__resolve-library-id` to find the library.
2. Use `mcp__context7__query-docs` to pull documentation for the resolved library.
3. Distill pulled docs into a wiki entry at `wiki/sources/<library-name>.md`.
4. If entry already exists: update it, bump `updated:` date.
5. Add relevant `[[ ]]` backlinks to existing concept entries.
6. Output: created/updated entry path.

---

## Wiki File Format

Every file in `wiki/concepts/` and `wiki/sources/` MUST begin with YAML frontmatter:

```yaml
---
title: "Human-readable title"
aliases:
  - "Alternative name 1"
sources:
  - "raw/research/original-note.md"
  - "https://docs.example.com/page"
tags:
  - architecture
  - typescript
references:
  - "src/lib/router.ts"
created: 2026-04-06
updated: 2026-04-06
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `title` | YES | Canonical entry name. Must be unique across all wiki entries. |
| `aliases` | no | Alternative names for backlink resolution. |
| `sources` | no | Where the knowledge came from: raw file paths, URLs, context7 doc refs. |
| `tags` | YES | Categorization tags. Lowercase, kebab-case. |
| `references` | no | Read-only source code file paths this entry relates to. |
| `created` | YES | ISO date when entry was first created. |
| `updated` | YES | ISO date of last modification. |

## Backlink Rules

- `[[ ]]` backlinks resolve ONLY within `wiki/` directories (concepts + sources).
- `[[Term]]` matches against `title` or any `aliases` value (case-insensitive).
- Source code references go in `references:` frontmatter, NOT as `[[ ]]` links in body.

## Index Generation

`wiki/index.md` is auto-generated. Structure:

1. **Recently Updated** table: sorted by `updated` descending, max 20 entries.
2. **By Tag** sections: one section per unique tag, entries sorted alphabetically. Each entry line includes a relative link and the first-sentence excerpt.
3. Entries with no tags appear under `(orphaned)`.
