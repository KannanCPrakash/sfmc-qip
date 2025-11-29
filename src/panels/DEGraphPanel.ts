import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getNonce } from "../utilities/getNonce";
import { getUri } from "../utilities/getUri";
import { globSync } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

interface DE { Name: string; CustomerKey?: string; Fields: Field[]; }
interface Field { Name: string; FieldType: string; MaxLength?: number; IsPrimaryKey?: boolean; }

/**
 * This class manages the state and behavior of DEGraphPanel webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering DEGraphPanel webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class DEGraphPanel {
    public static currentPanel: DEGraphPanel | undefined;
    private readonly _panel: WebviewPanel;
    private _disposables: Disposable[] = [];
    private _extensionUri: Uri;

    /**
       * The DEGraphPanel class private constructor (called only from the render method).
       *
       * @param panel A reference to the webview panel
       * @param extensionUri The URI of the directory containing the extension
       */
    private constructor(panel: WebviewPanel, extensionUri: Uri) {
        this._panel = panel;

        // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
        // the panel or when the panel is closed programmatically)
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Set the HTML content for the webview panel
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

        // Set an event listener to listen for messages passed from the webview context
        this._setWebviewMessageListener(this._panel.webview);
        this._extensionUri = extensionUri;
    }

    /**
     * Renders the current webview panel if it exists otherwise a new webview panel
     * will be created and displayed.
     *
     * @param extensionUri The URI of the directory containing the extension.
     */
    public static render(extensionUri: Uri) {
        if (DEGraphPanel.currentPanel) {
            // If the webview panel already exists reveal it
            DEGraphPanel.currentPanel._panel.reveal(ViewColumn.One);
        } else {
            // If a webview panel does not already exist create and show a new one
            const panel = window.createWebviewPanel(
                // Panel view type
                "sfmcQip",
                // Panel title
                "QIP: DE Graph",
                // The editor column the panel should be displayed in
                ViewColumn.One,
                // Extra panel configurations
                {
                    // Enable JavaScript in the webview
                    enableScripts: true,
                    // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
                    localResourceRoots: [
                        Uri.joinPath(extensionUri, "out"),
                        Uri.joinPath(extensionUri, "webview-ui/build")
                    ],
                }
            );

            DEGraphPanel.currentPanel = new DEGraphPanel(panel, extensionUri);
        }
    }

    /**
     * Cleans up and disposes of webview resources when the webview panel is closed.
     */
    public dispose() {
        DEGraphPanel.currentPanel = undefined;

        // Dispose of the current webview panel
        this._panel.dispose();

        // Dispose of all disposables (i.e. commands) for the current webview panel
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    /**
     * Defines and returns the HTML that should be rendered within the webview panel.
     *
     * @remarks This is also the place where references to the React webview build files
     * are created and inserted into the webview HTML.
     *
     * @param webview A reference to the extension webview
     * @param extensionUri The URI of the directory containing the extension
     * @returns A template string literal containing the HTML that should be
     * rendered within the webview panel
     */
    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        // The CSS file from the React build output
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        // The JS file from the React build output
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);

        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>QIP: DE Graph</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    private normalize(name: string): string {
        return name.toLowerCase()
            .replace(/[_-\s\[\]'"]/g, '')
            .replace(/de$/i, '')
            .replace(/^ent\.|_de$|_dataview$/gi, '')
            .replace(/dataextension/gi, '')
            .trim();
    }

    private extractTables(sql: string): string[] {
        const lower = sql.toLowerCase();
        const tables = new Set<string>();

        // FROM and JOIN
        const fromJoin = [...lower.matchAll(/(?:from|join)\s+[\[\]`"]?([^,\s\]\]`"]+)[\]\]`"]?/gi)];
        fromJoin.forEach(m => tables.add(this.normalize(m[1])));

        // Subqueries in WHERE/EXISTS
        const subqueries = [...lower.matchAll(/exists\s*\(\s*select.*?from\s+[\[\]`"]?([^,\s\]\]`"]+)[\]\]`"]?/gi)];
        subqueries.forEach(m => tables.add(this.normalize(m[1])));

        // Any word that matches a known DE (aggressive fallback)
        const words = lower.match(/[\w\._]+/g) || [];
        words.forEach(word => {
            if (word.length > 2 && !['select', 'from', 'join', 'where', 'and', 'or', 'inner', 'left', 'on'].includes(word)) {
                tables.add(this.normalize(word));
            }
        });

        return Array.from(tables);
    }

    /**
     * Sets up an event listener to listen for messages passed from the webview context and
     * executes code based on the message that is recieved.
     *
     * @param webview A reference to the extension webview
     * @param context A reference to the extension context
     */
    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "hello":
                        // Code that should run in response to the hello message command
                        window.showInformationMessage(text);
                        return;
                    case 'nodeClick':
                        window.showInformationMessage(`Clicked: ${JSON.stringify(message.label)}\n${message.sql || ''}`);
                        return;
                    case "refreshNodesAndEdges":
                        // Code that should run in response to the refreshNodes message command
                        window.showInformationMessage("Refresh nodes command received.");
                        const deFiles = globSync(path.join(this._extensionUri.fsPath, 'data', 'des', '*.json'), { windowsPathsNoEscape: true });
                        const des: DE[] = deFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));

                        //Obsolete
                        // const nodes = des.map((d, index) => ({
                        //     id: d.CustomerKey || d.Name,
                        //     data: { label: d.Name, isDataView: d.Fields.some(f => f.FieldType.toLowerCase() === 'dataview') },
                        //     position: { x: (index % 10) * 200, y: Math.floor(index / 10) * 100 },
                        // }));

                        const sqlFiles = globSync(path.join(this._extensionUri.fsPath, 'data', 'queries', '*.sql'), { windowsPathsNoEscape: true });

                        const deNodes: any[] = [];
                        const queryNodes: any[] = [];
                        const edges: any[] = [];

                        // === DE NODES (Purple) ===
                        des.forEach(de => {
                            deNodes.push({
                                id: `de-${de.CustomerKey || de.Name}`,
                                type: 'default',
                                data: { label: de.Name, type: 'DE' },
                                position: { x: Math.random() * 1000, y: Math.random() * 800 },
                                style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6' }
                            });
                        });

                        // === QUERY NODES + EDGES (Orange) ===
                        sqlFiles.forEach((file, idx) => {
                            const sql = fs.readFileSync(file, 'utf8');
                            const queryName = path.basename(file, '.sql').replace(/_/g, ' ').slice(0, 30);

                            const queryId = `query-${idx}`;
                            queryNodes.push({
                                id: queryId,
                                type: 'default',
                                data: { label: `Query: ${queryName}`, sql, type: 'Query' },
                                position: { x: Math.random() * 1000, y: Math.random() * 800 },
                                style: { background: '#ea580c', color: 'white', border: '2px solid #f97316' }
                            });

                            // Connect this query to every DE it touches
                            const tables = this.extractTables(sql);
                            tables.forEach(tableNorm => {
                                const de = des.find(d => this.normalize(d.Name) === tableNorm);
                                if (de) {
                                    edges.push({
                                        id: `${queryId}→de-${de.Name}`,
                                        source: queryId,
                                        target: `de-${de.CustomerKey || de.Name}`,
                                        animated: true,
                                        style: { stroke: '#f97316', strokeWidth: 2 },
                                        label: 'uses',
                                        labelStyle: { fill: '#fff', fontSize: 10 }
                                    });
                                }
                            });
                        });

                        // === DE-to-DE edges (from JOINs) ===
                        sqlFiles.forEach(file => {
                            const sql = fs.readFileSync(file, 'utf8').toLowerCase();
                            const tables = this.extractTables(sql);
                            for (let i = 0; i < tables.length; i++) {
                                for (let j = i + 1; j < tables.length; j++) {
                                    const a = des.find(d => this.normalize(d.Name) === tables[i]);
                                    const b = des.find(d => this.normalize(d.Name) === tables[j]);
                                    if (a && b) {
                                        const edgeId = `de-${a.Name}---de-${b.Name}`;
                                        if (!edges.some(e => e.id === edgeId)) {
                                            edges.push({
                                                id: edgeId,
                                                source: `de-${a.CustomerKey || a.Name}`,
                                                target: `de-${b.CustomerKey || b.Name}`,
                                                style: { stroke: '#8b5cf6', strokeWidth: 3 },
                                                animated: false
                                            });
                                        }
                                    }
                                }
                            }
                        });

                        const allNodes = [...deNodes, ...queryNodes];
                        webview.postMessage({ command: 'updateNodesAndEdges', nodes: allNodes, edges: edges });
                        return;

                    // Add more switch case statements here as more webview message commands
                    // are created within the webview context (i.e. inside media/main.js)
                }
            },
            undefined,
            this._disposables
        );
    }
}


