# d2-mcp

MCP server for the [D2 diagram language](https://d2lang.com/). Compile, validate, and explore D2 diagrams from any MCP-compatible AI assistant.

Uses the official `@terrastruct/d2` WASM package — no CLI binary needed.

## Tools

| Tool | Description |
|------|-------------|
| `compile` | D2 source code → SVG. Supports layout engines, themes, sketch mode, dark themes, multi-board targeting, and more. |
| `validate` | Check D2 syntax without rendering. Returns validity status and error details. |
| `list_themes` | List all available D2 themes with IDs (light and dark). |
| `list_layouts` | List available layout engines (`dagre`, `elk`). |
| `list_icons` | Browse icons from icons.terrastruct.com by category (AWS, GCP, Azure, K8s, dev, essentials, tech). |

## Resources

| Resource | Description |
|----------|-------------|
| `d2://syntax-reference` | Complete D2 language syntax reference in markdown. |

## Local Development

```bash
npm install
npm run build
npm start
```

The server starts on port 3000 by default (override with `PORT` env var).

- Health check: `GET /health`
- MCP endpoint: `POST /mcp` (Streamable HTTP transport)

## Deployment (Render)

This project includes a `Dockerfile` and `render.yaml` blueprint for one-click deployment to [Render](https://render.com/).

1. Push this repo to GitHub
2. In Render, create a new **Blueprint** and connect your repo
3. Render will auto-detect `render.yaml` and deploy

Or manually create a **Web Service** with:
- **Environment:** Docker
- **Health Check Path:** `/health`
- **Plan:** Free

## Connecting to the MCP Server

Once deployed, configure your MCP client to connect via Streamable HTTP:

```json
{
  "mcpServers": {
    "d2": {
      "url": "https://your-service.onrender.com/mcp"
    }
  }
}
```

Replace the URL with your actual Render service URL (or `http://localhost:3000/mcp` for local).

## Compile Tool Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | D2 source code (required) |
| `layout` | `"dagre"` \| `"elk"` | Layout engine (default: dagre) |
| `sketch` | boolean | Hand-drawn sketch mode |
| `themeID` | integer | Theme ID (see `list_themes`) |
| `darkThemeID` | integer | Dark mode theme ID |
| `pad` | integer | Padding in pixels (default: 100) |
| `center` | boolean | Center SVG in viewbox |
| `scale` | number | Scale factor (default: fit to screen) |
| `target` | string | Target board for multi-board diagrams |
| `animateInterval` | integer | Animation interval (ms) for multi-board SVGs |
| `noXMLTag` | boolean | Omit XML declaration for HTML embedding |

## License

MIT
