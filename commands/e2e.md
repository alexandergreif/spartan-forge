Command: Visual E2E Testing (/e2e)

Use this command to visually test the frontend through a headless browser.

## Steps

1. **Verify server:** Ensure the local dev server is running (e.g. `localhost:3000`). If not, start it in the background.

2. **Initialize Agent Browser:** Use the Vercel Agent Browser CLI (`agent-browser`).

3. **Work through user journeys:**
   - Open the URL of the new feature.
   - Take a screenshot: `agent-browser snapshot -i`
   - Analyze the image: Does the UI look correct? Are buttons reachable?
   - Click through the flow (e.g. login, fill form, submit).

4. **Fix and retest:** If elements overlap or logic errors occur, fix the code and retest until the flow runs cleanly end-to-end.
