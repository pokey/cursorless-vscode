import { Position, Range, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { LineTarget } from "../../targets";
import type { TargetScope } from "./scope.types";
import type { ScopeHandler, ScopeIteratorHints } from "./scopeHandler.types";

export default class LineScopeHandler implements ScopeHandler {
  public readonly scopeType = { type: "line" } as const;
  public readonly iterationScopeType = { type: "document" } as const;

  constructor(_scopeType: ScopeType, _languageId: string) {
    // Empty
  }

  *generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorHints | undefined = {},
  ): Iterable<TargetScope> {
    const { mustStartBefore, containment } = hints;

    if (containment === "required") {
      yield lineNumberToScope(editor, position.line);
      return;
    }

    if (direction === "forward") {
      for (let i = position.line; i < editor.document.lineCount; i++) {
        if (mustStartBefore != null && i > mustStartBefore.line) {
          break;
        }

        yield lineNumberToScope(editor, i);
      }
    } else {
      for (let i = position.line; i >= 0; i--) {
        yield lineNumberToScope(editor, i);
      }
    }
  }
}

function lineNumberToScope(
  editor: TextEditor,
  lineNumber: number,
): TargetScope {
  const { range } = editor.document.lineAt(lineNumber);

  return {
    editor,
    domain: range,
    getTarget: (isReversed) => createLineTarget(editor, isReversed, range),
  };
}

export function createLineTarget(
  editor: TextEditor,
  isReversed: boolean,
  range: Range,
) {
  return new LineTarget({
    editor,
    isReversed,
    contentRange: fitRangeToLineContent(editor, range),
  });
}

export function fitRangeToLineContent(editor: TextEditor, range: Range) {
  const startLine = editor.document.lineAt(range.start);
  const endLine = editor.document.lineAt(range.end);
  const endCharacterIndex =
    endLine.range.end.character -
    (endLine.text.length - endLine.text.trimEnd().length);

  return new Range(
    startLine.lineNumber,
    startLine.firstNonWhitespaceCharacterIndex,
    endLine.lineNumber,
    endCharacterIndex,
  );
}
