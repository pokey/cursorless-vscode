import type { Target } from "../../typings/target.types";
import type { SourceMark } from "../../typings/targetDescriptor.types";
import type { ProcessedTargetsContext } from "../../typings/Types";
import { isReversed } from "../../util/selectionUtils";
import type { MarkStage } from "../PipelineStages.types";
import WeakTarget from "../targets/WeakTarget";

export default class implements MarkStage {
  constructor(private modifier: SourceMark) {}

  run(context: ProcessedTargetsContext): Target[] {
    if (context.sourceMark.length === 0) {
      throw Error("No available source marks");
    }
    return context.sourceMark.map((selection) => {
      return new WeakTarget({
        editor: selection.editor,
        isReversed: isReversed(selection.selection),
        contentRange: selection.selection,
      });
    });
  }
}
