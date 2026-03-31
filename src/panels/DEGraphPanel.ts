import {
    Disposable, ExtensionContext, ProgressLocation,
    Webview, WebviewPanel, window, Uri, ViewColumn, workspace,
} from "vscode";
import { getNonce } from "../utilities/getNonce";
import { getUri } from "../utilities/getUri";
import { SFMCClient, SFMCDataExtension, SFMCField } from "../sfmc/SFMCClient";
import { globSync } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

interface Field { Name: string; FieldType: string; MaxLength?: number; IsPrimaryKey?: boolean; }
interface DE { Name: string; CustomerKey?: string; Fields: Field[]; }
interface Query { name: string; sql: string; }

export class DEGraphPanel {
    public static currentPanel: DEGraphPanel | undefined;
    private readonly _panel: WebviewPanel;
    private _disposables: Disposable[] = [];
    private readonly _context: ExtensionContext;

    private get _extensionUri(): Uri { return this._context.extensionUri; }

    private constructor(panel: WebviewPanel, context: ExtensionContext) {
        this._panel = panel;
        this._context = context;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview);
        this._setWebviewMessageListener(this._panel.webview);
    }

    public static render(context: ExtensionContext) {
        if (DEGraphPanel.currentPanel) {
            DEGraphPanel.currentPanel._panel.reveal(ViewColumn.One);
        } else {
            const panel = window.createWebviewPanel(
                "sfmcQip",
                "QIP: DE Graph",
                ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [
                        Uri.joinPath(context.extensionUri, "out"),
                        Uri.joinPath(context.extensionUri, "webview-ui/build"),
                    ],
                }
            );
            DEGraphPanel.currentPanel = new DEGraphPanel(panel, context);
        }
    }

    public dispose() {
        DEGraphPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            this._disposables.pop()?.dispose();
        }
    }

    private _getWebviewContent(webview: Webview) {
        const stylesUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        const scriptUri = getUri(webview, this._extensionUri, ["webview-ui", "build", "assets", "index.js"]);
        const nonce = getNonce();

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

    // ── Normalisation / SQL parsing ───────────────────────────────────────────

    private normalize(name: string): string {
        return name.toLowerCase()
            .replace(/[_\-\s\[\]'"]/g, '')
            .replace(/de$/i, '')
            .replace(/^ent\.|_de$|_dataview$/gi, '')
            .replace(/dataextension/gi, '')
            .trim();
    }

    private extractTables(sql: string): string[] {
        const lower = sql.toLowerCase();
        const tables = new Set<string>();

        const fromJoin = [...lower.matchAll(/(?:from|join)\s+[\[\]`"]?([^,\s\[\]`"]+)[\[\]`"]?/gi)];
        fromJoin.forEach(m => tables.add(this.normalize(m[1])));

        const subqueries = [...lower.matchAll(/exists\s*\(\s*select.*?from\s+[\[\]`"]?([^,\s\[\]`"]+)[\[\]`"]?/gi)];
        subqueries.forEach(m => tables.add(this.normalize(m[1])));

        const words = lower.match(/[\w._]+/g) ?? [];
        words.forEach(word => {
            if (word.length > 2 && !['select', 'from', 'join', 'where', 'and', 'or', 'inner', 'left', 'on'].includes(word)) {
                tables.add(this.normalize(word));
            }
        });

        return Array.from(tables);
    }

    // ── Graph builder (shared by sample data + live SFMC) ────────────────────

    private _buildGraph(des: DE[], queries: Query[]): { nodes: any[]; edges: any[] } {
        const deNodes: any[] = [];
        const queryNodes: any[] = [];
        const edges: any[] = [];

        // Query nodes + query→DE edges
        queries.forEach((q, idx) => {
            const queryId = `query-${idx}`;
            queryNodes.push({
                id: queryId,
                type: 'default',
                data: { label: `Query: ${q.name}`, sql: q.sql, type: 'Query' },
                position: { x: 0, y: 0 },
                style: { background: '#ea580c', color: 'white', border: '2px solid #f97316' },
            });

            const tables = this.extractTables(q.sql);
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
                        labelStyle: { fill: '#fff', fontSize: 10 },
                    });
                }
            });
        });

        // DE→DE edges (co-occurrence in the same SQL)
        queries.forEach(q => {
            const tables = this.extractTables(q.sql);
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
                                animated: false,
                            });
                        }
                    }
                }
            }
        });

        // FK count per DE
        const pkConnections = new Map<string, string[]>();
        des.forEach(de => {
            const pkField = de.Fields.find(f =>
                f.IsPrimaryKey ||
                f.Name.toLowerCase().includes('subscriberkey') ||
                f.Name.toLowerCase() === 'contactkey' ||
                f.Name.toLowerCase() === 'subscriberid'
            );
            if (pkField) {
                if (!pkConnections.has(pkField.Name)) { pkConnections.set(pkField.Name, []); }
                pkConnections.get(pkField.Name)!.push(de.Name);
            }
        });

        const deToFkCount = new Map<string, number>();
        des.forEach(de => {
            let count = 0;
            de.Fields.forEach(field => {
                if (pkConnections.has(field.Name)) {
                    count += pkConnections.get(field.Name)!.filter(src => src !== de.Name).length;
                }
            });
            deToFkCount.set(de.Name, count);
        });

        // DE nodes
        des.forEach(de => {
            deNodes.push({
                id: `de-${de.CustomerKey || de.Name}`,
                type: 'default',
                data: {
                    label: de.Name,
                    type: 'DE',
                    pkField: de.Fields.find(f => f.IsPrimaryKey)?.Name ?? null,
                    fkCount: deToFkCount.get(de.Name) ?? 0,
                    fields: de.Fields,
                },
                position: { x: 0, y: 0 },
                style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6' },
            });
        });

        return { nodes: [...deNodes, ...queryNodes], edges };
    }

    // ── SFMC live fetch ───────────────────────────────────────────────────────

    private async _loadFromSFMC(webview: Webview): Promise<void> {
        const config = workspace.getConfiguration('sfmcQip');
        const subdomain = config.get<string>('subdomain');
        const clientId = config.get<string>('clientId');
        const accountId = config.get<string>('accountId') || undefined;
        const clientSecret = await this._context.secrets.get('sfmcQip.clientSecret');

        if (!subdomain || !clientId || !clientSecret) {
            const pick = await window.showErrorMessage(
                'SFMC credentials not configured. Run "QIP: Configure SFMC Connection" first.',
                'Configure Now'
            );
            if (pick === 'Configure Now') {
                await import("vscode").then(vsc =>
                    vsc.commands.executeCommand('sfmc-qip.configure')
                );
            }
            return;
        }

        try {
            await window.withProgress(
                { location: ProgressLocation.Notification, title: 'QIP: Connecting to SFMC', cancellable: false },
                async progress => {
                    progress.report({ message: 'Authenticating...' });
                    const client = new SFMCClient({ subdomain: subdomain!, clientId: clientId!, clientSecret: clientSecret!, accountId });

                    // Validate credentials
                    await client.getToken();

                    progress.report({ message: 'Fetching Data Extensions and fields...', increment: 20 });
                    const sfmcDEs = await client.getDataExtensions();

                    progress.report({ message: `Fetched ${sfmcDEs.length} DEs. Loading Query Activities...`, increment: 50 });
                    const sfmcQueries = await client.getQueryActivities();

                    progress.report({ message: 'Building graph...', increment: 20 });

                    // Map to internal types
                    const des: DE[] = sfmcDEs.map(d => ({
                        Name: d.Name,
                        CustomerKey: d.CustomerKey,
                        Fields: d.Fields as Field[],
                    }));
                    const queries: Query[] = sfmcQueries.map(q => ({
                        name: q.Name.slice(0, 40),
                        sql: q.QueryText,
                    }));

                    const { nodes, edges } = this._buildGraph(des, queries);
                    webview.postMessage({ command: 'updateNodesAndEdges', nodes, edges });

                    progress.report({ increment: 10 });
                    window.showInformationMessage(
                        `QIP: Loaded ${des.length} Data Extensions and ${queries.length} Query Activities.`
                    );
                }
            );
        } catch (err: any) {
            window.showErrorMessage(`QIP: SFMC connection failed — ${err.message}`);
        }
    }

    // ── Message listener ──────────────────────────────────────────────────────

    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage(
            async (message: any) => {
                switch (message.command) {
                    case "hello":
                        window.showInformationMessage(message.text);
                        return;

                    case 'nodeClick':
                        window.showInformationMessage(`Clicked: ${JSON.stringify(message.label)}\n${message.sql || ''}`);
                        return;

                    case "refreshNodesAndEdges": {
                        window.showInformationMessage("Loading sample DE and Query nodes...");
                        const deFiles = globSync(
                            path.join(this._extensionUri.fsPath, 'data', 'des', '*.json'),
                            { windowsPathsNoEscape: true }
                        );
                        const des: DE[] = deFiles.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));

                        const sqlFiles = globSync(
                            path.join(this._extensionUri.fsPath, 'data', 'queries', '*.sql'),
                            { windowsPathsNoEscape: true }
                        );
                        const queries: Query[] = sqlFiles.map(f => ({
                            name: path.basename(f, '.sql').replace(/_/g, ' ').slice(0, 40),
                            sql: fs.readFileSync(f, 'utf8'),
                        }));

                        const { nodes, edges } = this._buildGraph(des, queries);
                        webview.postMessage({ command: 'updateNodesAndEdges', nodes, edges });
                        return;
                    }

                    case "refreshFromSFMC":
                        await this._loadFromSFMC(webview);
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }
}
