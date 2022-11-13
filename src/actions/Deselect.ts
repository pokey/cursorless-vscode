import { Selection } from "../libs/common/ide";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Deselect implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    await runOnTargetsForEachEditor(targets, async (editor, targets) => {
      // Remove selections with a non-empty intersection
      const newSelections = editor.selections.filter(
        (selection) =>
          !targets.some((target) => {
            const intersection = target.contentRange.intersection(selection);
            return intersection && (!intersection.isEmpty || selection.isEmpty);
          }),
      );
      // The editor requires at least one selection. Keep "primary" selection active
      setSelectionsWithoutFocusingEditor(
        ide().getEditableTextEditor(editor),
        newSelections.length > 0
          ? newSelections
          : [new Selection(editor.selections[0].active)],
      );
    });

    return {
      thatTargets: targets,
    };
  }
}
