import { commands, ConfigurationTarget, ExtensionContext, Uri, window, workspace } from "vscode";
import { DEGraphPanel } from "./panels/DEGraphPanel";

export function activate(context: ExtensionContext) {
  const showDEGraphCommand = commands.registerCommand("sfmc-qip.showGraph", async (uri?: Uri) => {
    const targetUri = uri || window.activeTextEditor?.document.uri;
    if (!targetUri) {
      window.showWarningMessage('Open a file or right-click one in the Explorer');
      return;
    }
    DEGraphPanel.render(context);
  });

  const configureCommand = commands.registerCommand("sfmc-qip.configure", async () => {
    const config = workspace.getConfiguration('sfmcQip');

    const subdomain = await window.showInputBox({
      title: 'SFMC Subdomain',
      prompt: 'Enter your tenant subdomain — found in the installed package Auth Base URI (e.g. mc563885gzs27c5t9-63k636ttgm)',
      value: config.get<string>('subdomain') ?? '',
      ignoreFocusOut: true,
    });
    if (subdomain === undefined) { return; }

    const clientId = await window.showInputBox({
      title: 'SFMC Client ID',
      prompt: 'Installed package → API Integration → Client ID',
      value: config.get<string>('clientId') ?? '',
      ignoreFocusOut: true,
    });
    if (clientId === undefined) { return; }

    const clientSecret = await window.showInputBox({
      title: 'SFMC Client Secret',
      prompt: 'Installed package → API Integration → Client Secret',
      password: true,
      ignoreFocusOut: true,
    });
    if (clientSecret === undefined) { return; }

    const accountId = await window.showInputBox({
      title: 'SFMC Account ID / MID (optional)',
      prompt: 'Leave blank to use the top-level BU, or enter the MID of a child BU',
      value: config.get<string>('accountId') ?? '',
      ignoreFocusOut: true,
    });
    if (accountId === undefined) { return; }

    await config.update('subdomain', subdomain, ConfigurationTarget.Global);
    await config.update('clientId', clientId, ConfigurationTarget.Global);
    await config.update('accountId', accountId || undefined, ConfigurationTarget.Global);
    await context.secrets.store('sfmcQip.clientSecret', clientSecret);

    window.showInformationMessage('SFMC connection saved. Click "Load from SFMC" in the graph panel.');
  });

  context.subscriptions.push(showDEGraphCommand, configureCommand);
}
