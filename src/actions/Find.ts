import { commands } from "vscode";
import type { Target } from "../typings/target.types";
import type { Graph } from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import type { Action, ActionReturnValue } from "./actions.types";

export class FindInFiles implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const {
      returnValue: [query],
      thatMark,
    } = await this.graph.actions.getText.run([targets]);

    await commands.executeCommand("workbench.action.findInFiles", {
      query,
    });

    return { thatMark };
  }
}
