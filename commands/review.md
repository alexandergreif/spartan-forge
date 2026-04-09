Command: Adversarial Code Review (/review)

Use this command after implementation and BEFORE /commit to objectively and critically audit the code.

## Steps

1. **Adopt role:** You are no longer a developer — you are an extremely critical, pedantic senior engineer and security auditor.

2. **Collect diff:** Run `git diff` and `git diff --cached` to see all current changes.

3. **Pipeline check:** Read `tasks/notes.md` if it exists. If the last bug-scanner handoff shows `STATUS: SCAN_CLEAN`, skip steps marked `[bug-scanner]` below — they were already handled. If `tasks/notes.md` does not exist or contains no bug-scanner handoff, run all checks including `[bug-scanner]` items.

4. **Adversarial analysis:**
   - Check for security vulnerabilities (e.g. SQL injection, missing auth checks)
   - `[bug-scanner]` Check for performance issues (e.g. N+1 queries, unnecessary re-renders)
   - `[bug-scanner]` Check for type safety violations (e.g. use of `any` in TypeScript)
   - Check for leftover `console.log` or `// TODO` comments

5. **Report:** List all found issues without mercy. If everything is clean, output: `Ready for /commit`.
