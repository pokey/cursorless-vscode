import {
  InMemoryTextDocument,
  Selection,
  type TextDocument,
} from "@cursorless/common";
import { URI } from "vscode-uri";
import type { EditorState, OffsetSelection } from "../types/types";
import { TalonJsEditor } from "./TalonJsEditor";
import type { TalonJsIDE } from "./TalonJsIDE";

let nextId = 0;

export function createTextEditor(
  ide: TalonJsIDE,
  editorState: EditorState,
): TalonJsEditor {
  const id = String(nextId++);
  const uri = URI.parse(`talon-js://${id}`);
  const languageId = "plaintext";
  const document = new InMemoryTextDocument(uri, languageId, editorState.text);
  const visibleRanges = [document.range];
  const selections = editorState.selections.map((selection) =>
    createSelection(document, selection),
  );

  return new TalonJsEditor(ide, id, document, visibleRanges, selections);
}

export function createSelection(
  document: TextDocument,
  selection: OffsetSelection,
) {
  const anchor = document.positionAt(selection.anchor);
  const active = document.positionAt(selection.active);
  return new Selection(anchor, active);
}