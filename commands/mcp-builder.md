# Skill: mcp-builder

Invocation: `/mcp-builder <project-name>` or `/mcp-builder --resume`

Complete workflow for building an MCP (Model Context Protocol) server.
Follows FDE methodology: Socratic Gate → Contract → Implement → Test → Deploy.

---

## Phase 1: Discovery (Socratic Gate for MCP)

Ask these questions before writing ANY code:

### Required Questions
1. **What system/API are we exposing?** (e.g., "Jira API", "internal database",
   "file system operations")
2. **Who is the client?** (Claude Desktop, Claude Code, Cursor, custom agent)
3. **Transport?** (stdio for CLI tools, HTTP+SSE for remote servers)
4. **Auth model?** (API key via env var, OAuth2 flow, no auth for local tools)

### Follow-up Questions (based on answers)
5. **What operations should be tools vs. resources?**
   - Rule of thumb: Actions = Tools, Data lookups = Resources
6. **What data does the user need to provide per-call?**
   (This defines Zod input schemas)
7. **Are there rate limits, pagination, or large response concerns?**
8. **Should the server run locally or be deployed?**

## Phase 2: Contract (C-DAD for MCP)

Before writing any server code, define:

### Tool Definitions (one per tool)
```typescript
// Contract: every tool must have this structure BEFORE implementation
{
  name: "kebab-case-action-noun", // e.g., "search-issues", "create-document"
  description: "Clear, specific description for the AI client",
  inputSchema: z.object({
    // Zod schema — this IS the contract
  }),
  outputSchema: "text | structured JSON", // What the tool returns
}
```

### Resource Definitions (if applicable)
```typescript
{
  uri: "protocol://path/{param}",
  name: "Human-readable name",
  mimeType: "application/json",
}
```

Write these contracts to `tasks/notes.md`. They are the source of truth.

## Phase 3: Scaffold

### Project Structure
```
<project-name>/
├── src/
│   ├── index.ts          # Server entry point
│   ├── tools/            # One file per tool or tool group
│   │   └── <domain>.ts   # e.g., issues.ts, documents.ts
│   ├── resources/        # One file per resource (if any)
│   │   └── <domain>.ts
│   ├── lib/              # Shared utilities
│   │   ├── client.ts     # API client wrapper
│   │   └── errors.ts     # Error handling utilities
│   └── types.ts          # Shared Zod schemas and types
├── tests/
│   └── tools/
│       └── <domain>.test.ts
├── package.json
├── tsconfig.json
├── README.md             # Client configuration instructions
└── .env.example          # Required environment variables
```

### package.json Template
```json
{
  "name": "@alex/<project-name>",
  "version": "0.1.0",
  "type": "module",
  "bin": { "<project-name>": "./src/index.ts" },
  "scripts": {
    "start": "bun run src/index.ts",
    "dev": "bun --watch run src/index.ts",
    "test": "bun test",
    "type-check": "bunx tsc --noEmit",
    "inspect": "npx @modelcontextprotocol/inspector bun run src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/bun": "^1.x",
    "typescript": "^5.x"
  }
}
```

## Phase 4: Implementation

### Server Entry Point Pattern
```typescript
#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// OR for HTTP:
// import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Validate env vars FIRST
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("ERROR: API_KEY environment variable is required");
  process.exit(1);
}

const server = new McpServer({
  name: "<project-name>",
  version: "0.1.0",
});

// Register tools (from tools/ directory)
import { registerTools } from "./tools/index.js";
registerTools(server);

if (import.meta.main) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

### Tool Registration Pattern
```typescript
import { z } from "zod";

// This MUST match the contract from Phase 2
const InputSchema = z.object({
  query: z.string().describe("Search query"),
  limit: z.number().optional().default(10).describe("Max results"),
});

server.tool(
  "search-items",
  "Search for items matching a query",
  InputSchema.shape, // Pass .shape, not the schema itself
  async ({ query, limit }) => {
    try {
      const results = await apiClient.search(query, limit);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);
```

### Implementation Rules
- Every tool handler MUST have try/catch with descriptive error messages
- NEVER return raw error objects — always return human-readable text
- NEVER log to stdout (it's the MCP transport!) — use stderr: `console.error()`
- ALWAYS validate env vars at startup, not per-request
- For paginated APIs: implement cursor-based pagination in the tool input schema
- For large responses: truncate and indicate "showing N of M results"
- ALWAYS use `import.meta.main` guard for server start

## Phase 5: Testing

### How to Test MCP Servers

1. **Unit tests** — Test tool handlers directly by importing and calling them
2. **MCP Inspector** — `npx @modelcontextprotocol/inspector bun run src/index.ts`
3. **Claude Desktop integration** — Add to `~/Library/Application Support/Claude/claude_desktop_config.json`

### Unit Test Pattern
```typescript
import { describe, it, expect } from "bun:test";
// Import the tool handler function directly
import { searchItems } from "../src/tools/items.ts";

describe("search-items tool", () => {
  it("returns results for valid query", async () => {
    const result = await searchItems({ query: "test", limit: 5 });
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });
});
```

## Phase 6: Client Configuration

### Claude Desktop (stdio)
```json
{
  "mcpServers": {
    "<project-name>": {
      "command": "bun",
      "args": ["run", "/path/to/<project-name>/src/index.ts"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

### Claude Code (stdio)
Add to `.claude/settings.json`:
```json
{
  "mcpServers": {
    "<project-name>": {
      "command": "bun",
      "args": ["run", "/path/to/<project-name>/src/index.ts"],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

## Common MCP Gotchas

| # | Pitfall | Prevention |
|---|---------|------------|
| 1 | `console.log()` breaks stdio transport | Use `console.error()` for all logging |
| 2 | Returning raw error objects | Always catch and return `{ content: [{ type: "text", text: "Error: ..." }], isError: true }` |
| 3 | Passing Zod schema instead of `.shape` to `server.tool()` | Always use `InputSchema.shape` |
| 4 | Missing `#!/usr/bin/env bun` shebang | Add to index.ts for direct execution |
| 5 | Env vars not validated at startup | Check all required env vars in index.ts before registering tools |
| 6 | Vague tool descriptions | AI clients use descriptions to decide when to call tools — be specific |
| 7 | Not handling API rate limits | Implement exponential backoff in API client wrapper |
| 8 | Returning too much data | Always paginate or truncate. MCP messages have practical size limits |
| 9 | Missing `import.meta.main` guard | Wrap server start: `if (import.meta.main) { ... }` so files can be imported for tests |
| 10 | Missing `.env.example` | Clients need to know which env vars to set |
