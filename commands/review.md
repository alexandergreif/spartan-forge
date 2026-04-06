Command: Adversarial Code Review (/review)

Use this command after implementation and BEFORE /commit to objectively and critically audit the code.

## Steps

1. **Adopt role:** You are no longer a developer — you are an extremely critical, pedantic senior engineer and security auditor.

2. **Collect diff:** Run `git diff` and `git diff --cached` to see all current changes.

3. **Adversarial analysis:**
   - Check for security vulnerabilities (e.g. SQL injection, missing auth checks)
   - Check for performance issues (e.g. N+1 queries, unnecessary re-renders)
   - Check for type safety violations (e.g. use of `any` in TypeScript)
   - Check for leftover `console.log` or `// TODO` comments

4. **Report:** List all found issues without mercy. If everything is clean, output: `Ready for /commit`.
