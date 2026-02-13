import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { randomUUID } from "node:crypto";

import {
  compileToolName,
  compileToolDescription,
  compileToolSchema,
  handleCompile,
} from "./tools/compile.js";
import {
  validateToolName,
  validateToolDescription,
  validateToolSchema,
  handleValidate,
} from "./tools/validate.js";
import {
  listThemesToolName,
  listThemesToolDescription,
  listThemesToolSchema,
  handleListThemes,
} from "./tools/themes.js";
import {
  listLayoutsToolName,
  listLayoutsToolDescription,
  listLayoutsToolSchema,
  handleListLayouts,
} from "./tools/layouts.js";
import {
  listIconsToolName,
  listIconsToolDescription,
  listIconsToolSchema,
  handleListIcons,
} from "./tools/icons.js";
import { D2_SYNTAX_REFERENCE } from "./resources/syntax.js";

function createServer(): McpServer {
  const server = new McpServer({
    name: "d2-mcp",
    version: "1.0.0",
  });

  // Register tools
  server.tool(
    compileToolName,
    compileToolDescription,
    compileToolSchema.shape,
    async (input) => handleCompile(input)
  );

  server.tool(
    validateToolName,
    validateToolDescription,
    validateToolSchema.shape,
    async (input) => handleValidate(input)
  );

  server.tool(
    listThemesToolName,
    listThemesToolDescription,
    listThemesToolSchema.shape,
    async () => handleListThemes()
  );

  server.tool(
    listLayoutsToolName,
    listLayoutsToolDescription,
    listLayoutsToolSchema.shape,
    async () => handleListLayouts()
  );

  server.tool(
    listIconsToolName,
    listIconsToolDescription,
    listIconsToolSchema.shape,
    async (input) => handleListIcons(input)
  );

  // Register resources
  server.resource(
    "d2-syntax-reference",
    "d2://syntax-reference",
    {
      description:
        "Complete D2 diagram language syntax reference. Covers shapes, connections, containers, styling, icons, SQL tables, UML classes, sequence diagrams, grid diagrams, variables, layers, imports, and globs.",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "d2://syntax-reference",
          mimeType: "text/markdown",
          text: D2_SYNTAX_REFERENCE,
        },
      ],
    })
  );

  return server;
}

async function main() {
  const app = express();
  app.use(express.json());

  // Store transports by session ID for Streamable HTTP
  const transports = new Map<string, StreamableHTTPServerTransport>();

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "d2-mcp" });
  });

  // MCP Streamable HTTP endpoint
  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports.has(sessionId)) {
      transport = transports.get(sessionId)!;
    } else if (!sessionId) {
      // New session - create transport and server
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports.set(id, transport);
        },
      });

      const server = createServer();
      await server.connect(transport);

      // Clean up on close
      transport.onclose = () => {
        if (transport.sessionId) {
          transports.delete(transport.sessionId);
        }
      };
    } else {
      // Invalid session ID
      res.status(400).json({ error: "Invalid or expired session ID" });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  });

  // Handle GET for SSE streams
  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports.has(sessionId)) {
      res.status(400).json({ error: "Invalid or missing session ID" });
      return;
    }

    const transport = transports.get(sessionId)!;
    await transport.handleRequest(req, res);
  });

  // Handle DELETE for session termination
  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.close();
      transports.delete(sessionId);
    }
    res.status(200).end();
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  app.listen(port, "0.0.0.0", () => {
    console.log(`D2 MCP server running on http://0.0.0.0:${port}`);
    console.log(`MCP endpoint: http://0.0.0.0:${port}/mcp`);
    console.log(`Health check: http://0.0.0.0:${port}/health`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
