import * as vscode from "vscode";
import { Graph } from "../typings/Types";

export default class StatusBarItem {
  private disposables: vscode.Disposable[] = [];

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
  }

  init() {
    const commandId = "cursorless.showQuickPick";
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = commandId;
    statusBarItem.text = "$(cursorless-icon) Cursorless";
    statusBarItem.show();

    this.disposables.push(
      vscode.commands.registerCommand(commandId, this.showQuickPick),
      statusBarItem
    );
  }

  private showQuickPick = () =>
    vscode.commands.executeCommand("workbench.action.quickOpen", ">Cursorless");

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
