# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sfmc-qip** is a VS Code extension that provides interactive Data Extension (DE) relationship graphs and SQL query validation for Salesforce Marketing Cloud. It works 100% offline using sample data files.

## Commands

### Root (extension)
```bash
npm run install:all      # Install deps for both extension and webview-ui
npm run compile          # Compile TypeScript → out/
npm run watch            # Watch mode for extension TypeScript
npm run lint             # ESLint src/
npm run build:webview    # Build React webview → webview-ui/build/assets/
npm run pretest          # compile + lint (runs automatically before test)
npm run test             # Run VS Code extension tests (Electron-based)
```

### Webview UI (cd webview-ui/)
```bash
npm run dev              # Vite dev server (http://localhost:5173)
npm run build            # TypeScript + Vite build → build/assets/
```

After modifying either side, a full rebuild requires: `npm run compile && npm run build:webview`.

## Architecture

The project has two distinct layers that communicate via VS Code's message-passing API:

### Extension Backend (`src/`)
- `extension.ts` — Entry point. Registers the `sfmc-qip.showGraph` command (triggered by right-clicking `.sql`, `.json`, or `.txt` files).
- `panels/DEGraphPanel.ts` — Core logic. Creates the WebviewPanel, loads sample data from `/data/`, parses SQL via regex, constructs nodes/edges, and routes messages to/from the React app.
- `utilities/` — `getNonce.ts` (CSP nonce), `getUri.ts` (path → webview URI conversion).

### Webview Frontend (`webview-ui/src/`)
- `components/DEGraph.tsx` — Main graph component. Uses ReactFlow for rendering and ELK.js for layered layout. Manages search/filter state and handles the message listener for extension data.
- `components/FlyoutPanel.tsx` — Right sidebar that opens on node click. Shows SQL, validation results, and impact analysis.
- `components/DENode.tsx` / `QueryNode.tsx` — Custom ReactFlow node types (purple for DEs, orange for Queries).
- `components/SQLEditor.tsx` — Read-only CodeMirror SQL viewer.
- `components/ImpactList.tsx` — Upstream/downstream dependency analysis and DE metadata.
- `model/NodeData.tsx`, `model/NodeField.tsx` — TypeScript types for graph data.
- `utilities/vscode.ts` — Singleton wrapper around `acquireVsCodeApi()` for `postMessage`/`getState`/`setState`. Handles graceful degradation in browser dev mode.

### Message Flow
```
User right-clicks → "sfmc-qip.showGraph" command
  → DEGraphPanel creates WebviewPanel with React build
  → React renders; user clicks "Load Sample Data"
  → React: postMessage({ command: "refreshNodesAndEdges" })
  → DEGraphPanel: loads /data/des/*.json + /data/queries/*.sql
      normalizes DE names, extracts SQL table references via regex
      builds nodes[] and edges[]
  → DEGraphPanel: postMessage({ command: "updateNodesAndEdges", nodes, edges })
  → React: ELK layout → ReactFlow render
  → User clicks node → FlyoutPanel opens
```

### Sample Data (`/data/`)
- `/data/des/` — ~20 JSON files defining DE schemas (fields, types, PKs, FKs, metadata)
- `/data/queries/` — ~15 `.sql` files used to derive query→DE relationships

### Build Outputs
- Extension compiles to `out/` (excluded from git)
- Webview builds to `webview-ui/build/assets/` — the `index.js` and `index.css` files here are committed and loaded by the webview HTML at runtime

## Key Technical Details

- **SQL parsing** is regex-based in `DEGraphPanel.ts` (no AST parser) — extracts table names from `FROM`, `JOIN`, and `EXISTS` clauses.
- **DE name normalization** strips common prefixes (e.g., `DE_`, tenant codes) and underscores for fuzzy matching between SQL table references and DE JSON filenames.
- **ELK layout** runs asynchronously with a loading spinner; layout direction is `DOWN` with orthogonal edge routing.
- **ReactFlow** version is 11.x (not v12) — API differences matter if upgrading.
- The webview uses a strict **Content Security Policy** enforced via nonce; all script/style URIs must be passed through `getUri()`.
