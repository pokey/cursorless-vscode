import { zip } from "lodash";
import Range from "../libs/common/ide/Range";
import Selection from "../libs/common/ide/Selection";
import {
  EditableTextEditor,
  TextEditor,
} from "../libs/common/ide/types/TextEditor";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { EditableTarget, Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";
import { groupBy } from "./itertools";

export function ensureSingleEditor(
  targets: EditableTarget[],
): EditableTextEditor {
  if (targets.length === 0) {
    throw new Error("Require at least one target with this action");
  }

  const editors = targets.map((target) => target.editor);

  if (new Set(editors).size > 1) {
    throw new Error("Can only have one editor with this action");
  }

  return editors[0];
}

export function ensureSingleTarget(targets: Target[]) {
  if (targets.length !== 1) {
    throw new Error("Can only have one target with this action");
  }

  return targets[0];
}

export async function runForEachEditor<T, U>(
  targets: T[],
  getEditor: (target: T) => EditableTextEditor,
  func: (editor: EditableTextEditor, editorTargets: T[]) => Promise<U>,
): Promise<U[]> {
  return Promise.all(
    groupForEachEditor(targets, getEditor).map(([editor, editorTargets]) =>
      func(editor, editorTargets),
    ),
  );
}

export async function runOnTargetsForEachEditor<T>(
  targets: EditableTarget[],
  func: (editor: EditableTextEditor, targets: EditableTarget[]) => Promise<T>,
): Promise<T[]> {
  return runForEachEditor(targets, (target) => target.editor, func);
}

export function groupTargetsForEachEditor(targets: EditableTarget[]) {
  return groupForEachEditor(targets, (target) => target.editor);
}

export function groupForEachEditor<T>(
  targets: T[],
  getEditor: (target: T) => EditableTextEditor,
): [EditableTextEditor, T[]][] {
  // Actually group by document and not editor. If the same document is open in multiple editors we want to perform all actions in one editor or an concurrency error will occur.
  const getDocument = (target: T) => getEditor(target).document;
  const editorMap = groupBy(targets, getDocument);
  return Array.from(editorMap.values(), (editorTargets) => {
    // Just pick any editor with the given document open; doesn't matter which
    const editor = getEditor(editorTargets[0]);
    return [editor, editorTargets];
  });
}

/** Get the possible leading and trailing overflow ranges of the outside range compared to the inside range */
export function getOutsideOverflow(
  editor: TextEditor,
  insideRange: Range,
  outsideRange: Range,
): Range[] {
  const { start: insideStart, end: insideEnd } = insideRange;
  const { start: outsideStart, end: outsideEnd } = outsideRange;
  const result = [];
  if (outsideStart.isBefore(insideStart)) {
    result.push(new Range(outsideStart, insideStart));
  }
  if (outsideEnd.isAfter(insideEnd)) {
    result.push(new Range(insideEnd, outsideEnd));
  }
  return result;
}

export function getContentRange(target: Target) {
  return target.contentRange;
}

export function createThatMark(
  targets: Target[],
  ranges?: Range[],
): SelectionWithEditor[] {
  const thatMark =
    ranges != null
      ? zip(targets, ranges).map(([target, range]) => ({
          editor: target!.editor,
          selection: target?.isReversed
            ? new Selection(range!.end, range!.start)
            : new Selection(range!.start, range!.end),
        }))
      : targets.map((target) => ({
          editor: target!.editor,
          selection: target.contentSelection,
        }));
  return thatMark;
}

export function toEditableTarget(target: Target): EditableTarget {
  return {
    ...target,
    editor: ide().getEditableTextEditor(target.editor),
  };
}
