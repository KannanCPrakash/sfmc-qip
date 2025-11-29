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

