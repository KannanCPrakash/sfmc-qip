import { commands, ExtensionContext, Uri, window } from "vscode";
import { DEGraphPanel } from "./panels/DEGraphPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showDEGraphCommand = commands.registerCommand("sfmc-qip.showGraph", async (uri?: Uri) => {
    const targetUri = uri || window.activeTextEditor?.document.uri;
    
    if (!targetUri) {
      window.showWarningMessage('Open a file or right-click one in the Explorer');
      return;
    }

    //window.showInformationMessage(targetUri.fsPath);

    DEGraphPanel.render(context.extensionUri);
    
  });

  // Add command to the extension context
  context.subscriptions.push(showDEGraphCommand);
}

