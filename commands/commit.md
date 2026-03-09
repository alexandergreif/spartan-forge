Command: Git Commit & Memory (/commit)

Use this command to safely record completed, validated work into the git history.

## Steps

1. **Analyze changes:** Run `git status` and `git diff` to capture all modifications precisely.

2. **Verify quality:** Confirm the code runs and no obvious errors (e.g. linter warnings) are present.

3. **Format commit message** following Conventional Commits strictly:
   - Format: `type(scope): short description in English`
   - Allowed types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
   - Include a body explaining **why** the change was made, not just what.

4. **Execute:** Run `git add .` followed by `git commit -m "..."` autonomously.

5. **Report:** Confirm the successful commit and the generated hash to the user.
