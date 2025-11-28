import { commands, ExtensionContext } from "vscode";
import { DEGraphPanel } from "./panels/DEGraphPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showDEGraphCommand = commands.registerCommand("sfmc-qip.showGraph", () => {
    DEGraphPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showDEGraphCommand);
}


// import * as vscode from 'vscode';
// import * as path from 'path';
// import * as fs from 'fs';
// import { glob } from 'glob';

// interface Field { Name: string; FieldType: string; MaxLength?: number; IsPrimaryKey?: boolean; }
// interface DE { Name: string; CustomerKey?: string; Fields: Field[]; }

// let panel: vscode.WebviewPanel | undefined;

// function normalize(name: string): string {
//   return name.toLowerCase()
//     .replace(/[_-\s\[\]]+/g, '')
//     .replace(/de$/i, '')
//     .replace(/^ent\.|_de$/gi, '')
//     .trim();
// }

// export function activate(context: vscode.ExtensionContext) {
//   const cmd = vscode.commands.registerCommand('sfmc-qip.showGraph', async () => {
//     // Load all DEs
//     const deFiles = await glob(path.join(context.extensionPath, 'data', 'des', '*.json'), { windowsPathsNoEscape: true });
//     const des: DE[] = deFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));

//     // Load and parse SQLs for edges
//     const sqlFiles = glob.sync(path.join(context.extensionPath, 'data', 'queries', '*.sql'), { windowsPathsNoEscape: true });
//     const edges: any[] = [];

//     sqlFiles.forEach(file => {
//       const sql = fs.readFileSync(file, 'utf8').toLowerCase();
//       const tables: string[] = [];
//       const from = [...sql.matchAll(/from\s+[\[\]`"]?([^,\s\]\]`"]+)[\]\]`"]?/gi)];
//       const join = [...sql.matchAll(/join\s+[\[\]`"]?([^,\s\]\]`"]+)[\]\]`"]?/gi)];
//       [...from, ...join].forEach(m => tables.push(normalize(m[1])));

//       for (let i = 0; i < tables.length; i++) {
//         for (let j = i + 1; j < tables.length; j++) {
//           const a = des.find(d => normalize(d.Name) === tables[i]);
//           const b = des.find(d => normalize(d.Name) === tables[j]);
//           if (a && b) {
//             edges.push({
//               id: `${a.Name}-${b.Name}`,
//               source: a.CustomerKey || a.Name,
//               target: b.CustomerKey || b.Name,
//               animated: true,
//               style: { stroke: '#8b5cf6' }
//             });
//           }
//         }
//       }
//     });

//     // Create panel once
//     if (panel) { panel.reveal(); return; }
//     panel = vscode.window.createWebviewPanel(
//       'sfmcQip',
//       'QIP: DE Graph',
//       vscode.ViewColumn.One,
//       { enableScripts: true, retainContextWhenHidden: true }
//     );

//     panel.webview.html = `
// <!DOCTYPE html>
// <html><head>
//   <meta charset="UTF-8">
//   <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src https://unpkg.com 'unsafe-inline'; style-src https://unpkg.com 'unsafe-inline';">
//   <style>body,html,#root{margin:0;padding:0;height:100%;background:#1a1a1a}</style>
// </head><body>
//   <div id="root"></div>

//   <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
//   <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
//   <script src="https://unpkg.com/reactflow@11/dist/umd/ReactFlow.js"></script>
//   <link rel="stylesheet" href="https://unpkg.com/reactflow@11/dist/style.css"/>

//   <script>
//     const { React, ReactDOM } = window;
//     const { ReactFlow, MiniMap, Controls, Background } = ReactFlow;

//     const nodes = ${JSON.stringify(
//       des.map(de => ({
//         id: de.CustomerKey || de.Name,
//         data: { label: de.Name },
//         position: { x: Math.random() * 800, y: Math.random() * 600 }
//       }))
//     )};

//     const edges = ${JSON.stringify(edges)};

//     const App = () => (
//       <ReactFlow nodes={nodes} edges={edges} fitView>
//         <MiniMap nodeColor="#8b5cf6"/>
//         <Controls />
//         <Background color="#333" gap={16}/>
//       </ReactFlow>
//     );

//     ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
//   </script>
//   <h1>SFMC QIP DE Graph</h1>
// </body></html>`;

//     panel.onDidDispose(() => panel = undefined);
//   });

//   context.subscriptions.push(cmd);
// }

// export function deactivate() {}