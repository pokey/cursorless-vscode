import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import { Range, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../updateSelections";
import displayPendingEditDecorations, {
  displayPendingEditDecorationsForSelection,
} from "../editDisplayUtils";
import { runOnTargetsForEachEditor } from "../targetUtils";
import { flatten } from "lodash";
import unifyRanges from "../unifyRanges";
import expandToContainingLine from "./expandToContainingLine";

class CopyLines implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph, private isUp: boolean) {
    this.run = this.run.bind(this);
  }

  private getRanges(editor: TextEditor, targets: TypedSelection[]) {
    const ranges = targets.map((target) =>
      expandToContainingLine(editor, target.selection.selection)
    );

    return unifyRanges(ranges);
  }

  private getEdits(editor: TextEditor, ranges: Range[]) {
    return ranges.map((range) => {
      let text = editor.document.getText(range);
      text = this.isUp ? `${text}\n` : `\n${text}`;
      const newRange = this.isUp
        ? new Range(range.start, range.start)
        : new Range(range.end, range.end);
      return {
        editor,
        range: newRange,
        text,
      };
    });
  }

  async run([targets]: [TypedSelection[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, async (editor, targets) => {
        const ranges = this.getRanges(editor, targets);
        const edits = this.getEdits(editor, ranges);

        const [updatedSelections, copySelections] =
          await performEditsAndUpdateSelections(editor, edits, [
            targets.map((target) => target.selection.selection),
            ranges.map((range) => new Selection(range.start, range.end)),
          ]);

        editor.revealRange(updatedSelections[0]);

        return {
          thatMark: updatedSelections.map((selection) => ({
            editor,
            selection,
          })),
          copySelections: copySelections.map((selection) => ({
            editor,
            selection,
          })),
        };
      })
    );

    await displayPendingEditDecorationsForSelection(
      results.flatMap((result) => result.copySelections),
      this.graph.editStyles.justAdded
    );

    const thatMark = results.flatMap((result) => result.thatMark);

    return { returnValue: null, thatMark };
  }
}

export class CopyLinesUp extends CopyLines {
  constructor(graph: Graph) {
    super(graph, false);
  }
}

export class CopyLinesDown extends CopyLines {
  constructor(graph: Graph) {
    super(graph, true);
  }
}
