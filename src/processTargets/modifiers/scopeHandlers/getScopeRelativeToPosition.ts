import { Position, TextEditor } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { OutOfRangeError } from "../targetSequenceUtils";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default function getScopeRelativeToPosition(
  scopeHandler: ScopeHandler,
  editor: TextEditor,
  position: Position,
  offset: number,
  direction: Direction,
): TargetScope {
  let scopeCount = 0;
  for (const scope of scopeHandler.generateScopes(editor, position, direction, {
    containment: "disallowedIfStrict",
  })) {
    scopeCount += 1;

    if (scopeCount === offset) {
      return scope;
    }
  }

  throw new OutOfRangeError();
}
