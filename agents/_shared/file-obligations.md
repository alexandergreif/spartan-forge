# Shared File Obligations

All agents in spartan-forge MUST follow these obligations at session start and end.

## Session Start (MANDATORY — no exceptions)

1. Read `tasks/lessons.md` — apply every rule found there
2. Read `tasks/todo.md` — understand current state before acting
3. Read `tasks/notes.md` — check for active architecture decisions and handoff notes

## During Session

- After any user correction: append new rule to `tasks/lessons.md` immediately
- After discovering a pattern: append to `tasks/lessons.md`
- After architecture decisions: write to `tasks/notes.md`
- After completing a task: mark `[x]` in `tasks/todo.md`

## Before Shutdown (when receiving shutdown_request)

Before responding to shutdown_request:
1. Write session learnings to `tasks/notes.md`
2. Write any new rules to `tasks/lessons.md`
3. Mark completed tasks in `tasks/todo.md`
THEN respond to the shutdown_request.

## File Format Rules

### tasks/todo.md entries
```
[ ] Description (~N min) (added YYYY-MM-DD)
[x] Description (completed YYYY-MM-DD)
```

### tasks/lessons.md entries
```
## YYYY-MM-DD — <Agent> — <Short title>
What went wrong / what was discovered, what the rule is going forward.
```

### tasks/notes.md handoff entries
```
## Handoff: <From> → <To> (YYYY-MM-DD)
- Key info: ...
- Watch out for: ...
```
