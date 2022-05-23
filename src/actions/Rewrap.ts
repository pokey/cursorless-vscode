import { flatten } from "lodash";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { weakContainingSurroundingPairStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Rewrap implements Action {
  getFinalStages = () => [weakContainingSurroundingPairStage];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const boundaryTargets = targets.flatMap((target) => {
      const boundary = target.getBoundaryStrict();

      if (boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return boundary;
    });

    await displayPendingEditDecorations(
      boundaryTargets,
      this.graph.editStyles.pendingModification0
    );

    const thatMark = flatten(
      await runOnTargetsForEachEditor(
        boundaryTargets,
        async (editor, boundaryTargets) => {
          const edits = boundaryTargets.map((target, i) => ({
            editor,
            range: target.contentRange,
            text: i % 2 === 0 ? left : right,
          }));

          const [updatedThatRanges] = await performEditsAndUpdateRanges(
            this.graph.rangeUpdater,
            editor,
            edits,
            [targets.map((target) => target.contentRange)]
          );

          return createThatMark(targets, updatedThatRanges);
        }
      )
    );

    return { thatMark };
  }
}
