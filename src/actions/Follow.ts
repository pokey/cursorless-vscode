import { commands, DocumentLink, env, Uri, window, workspace } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { ensureSingleTarget } from "../util/targetUtils";

export default class Follow implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);

    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    const link = await this.findLink(target);
    if (link) {
      await this.openUri(link.target!);
    } else {
      await this.graph.actions.executeCommand.run(
        [targets],
        "editor.action.revealDefinition",
        { restoreSelection: false }
      );
    }

    return {
      thatMark: targets.map((target) => target.selection),
    };
  }

  private async findLink(target: TypedSelection) {
    const links = <DocumentLink[]>(
      await commands.executeCommand(
        "vscode.executeLinkProvider",
        target.selection.editor.document.uri
      )
    );
    return links.find((link) =>
      link.range.contains(target.selection.selection)
    );
  }

  private async openUri(uri: Uri) {
    switch (uri.scheme) {
      case "http":
      case "https":
        await env.openExternal(uri);
        break;
      case "file":
        await window.showTextDocument(uri);
        break;
      default:
        throw Error(`Unknown uri scheme '${uri.scheme}'`);
    }
  }
}
