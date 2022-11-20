import type {
  Position,
  Range,
  RevealLineAt,
  Selection,
  TextDocument,
  TextEditorDecorationType,
  TextEditorEdit,
  TextEditorOptions,
} from "@cursorless/common";

/**
 * Represents a read-only reference to a text editor.  If you need to modify the
 * editor, use {@link IDE.getEditableTextEditor}.
 */
export interface TextEditor {
  /**
   * Unique identifier for this text editor
   */
  readonly id: string;

  /**
   * The document associated with this text editor. The document will be the same for the entire lifetime of this text editor.
   */
  readonly document: TextDocument;

  /**
   * The current visible ranges in the editor (vertically).
   * This accounts only for vertical scrolling, and not for horizontal scrolling.
   */
  readonly visibleRanges: Range[];

  /**
   * The selections in this text editor.
   */
  readonly selections: Selection[];

  /**
   * Text editor options.
   */
  readonly options: TextEditorOptions;

  /**
   * True if this text editor is active.
   */
  readonly isActive: boolean;

  /**
   * Check if this text editor is equal to `other`.
   *
   * @param other A text editor.
   * @return `true` if the this text editor is equal to `other`.
   */
  isEqual(other: TextEditor): boolean;
}

export interface EditableTextEditor extends TextEditor {
  selections: Selection[];

  options: TextEditorOptions;

  /**
   * Scroll to reveal the given range.
   *
   * @param range A {@link Range range}.
   */
  revealRange(range: Range): Promise<void>;

  /**
   * Scroll to reveal the given line.
   *
   * @param lineNumber A line number.
   * @param at Were to reveal the line at: top|center|bottom.
   */
  revealLine(lineNumber: number, at: RevealLineAt): Promise<void>;

  /**
   * Focus the editor.
   */
  focus(): Promise<void>;

  /**
   * Adds a set of decorations to the text editor. If a set of decorations already exists with
   * the given {@link TextEditorDecorationType decoration type}, they will be replaced. If
   * `ranges` is empty, the existing decorations with the given {@link TextEditorDecorationType decoration type}
   * will be removed.
   *
   * @param decorationType A decoration type.
   * @param ranges  {@link Range ranges}
   */
  setDecorations(
    decorationType: TextEditorDecorationType,
    ranges: readonly Range[],
  ): Promise<void>;

  /**
   * Perform an edit on the document associated with this text editor.
   *
   * The given callback-function is invoked with an {@link TextEditorEdit edit-builder} which must
   * be used to make edits. Note that the edit-builder is only valid while the
   * callback executes.
   *
   * @param callback A function which can create edits using an {@link TextEditorEdit edit-builder}.
   * @param options The undo/redo behavior around this edit. By default, undo stops will be created before and after this edit.
   * @return A promise that resolves with a value indicating if the edits could be applied.
   */
  edit(
    callback: (editBuilder: TextEditorEdit) => void,
    options?: { undoStopBefore: boolean; undoStopAfter: boolean },
  ): Promise<boolean>;

  /**
   * Executes the command denoted by the given command identifier.
   *
   * @param command Identifier of the command to execute.
   * @param rest Parameters passed to the command function.
   * @return A promise that resolves to the returned value of the given command. `undefined` when
   * the command handler function doesn't return anything.
   */
  executeCommand<T>(command: string, ...rest: any[]): Promise<T | undefined>;

  /**
   * Insert new notebook cell above.
   * @return A promised that resolves to a boolean indicating if this was a jupyter notebook
   */
  insertNotebookCellAbove(): Promise<boolean>;

  /**
   * Insert new notebook cell below.
   * @return A promised that resolves to a boolean indicating if this was a jupyter notebook
   */
  insertNotebookCellBelow(): Promise<boolean>;

  /**
   * Open link at location.
   * @param location Position or range
   * @return True if a link was opened
   */
  openLink(location?: Position | Range): Promise<boolean>;

  /**
   * Fold lines
   * @param lineNumbers Lines to fold
   */
  fold(lineNumbers?: number[]): Promise<void>;

  /**
   * Unfold lines
   * @param lineNumbers Lines to unfold
   */
  unfold(lineNumbers?: number[]): Promise<void>;

  /**
   * Copy to clipboard
   * @param ranges A list of {@link Range ranges}
   */
  clipboardCopy(ranges?: Range[]): Promise<void>;

  /**
   * Paste clipboard content
   * @param ranges A list of {@link Range ranges}
   */
  clipboardPaste(ranges?: Range[]): Promise<void>;

  /**
   * Toggle breakpoints
   * @param ranges A list of {@link Range ranges}
   */
  toggleBreakpoint(ranges?: Range[]): Promise<void>;

  /**
   * Toggle line comments
   * @param ranges A list of {@link Range ranges}
   */
  toggleLineComment(ranges?: Range[]): Promise<void>;

  /**
   * Indent lines
   * @param ranges A list of {@link Range ranges}
   */
  indentLines(ranges?: Range[]): Promise<void>;

  /**
   * Outdent lines
   * @param ranges A list of {@link Range ranges}
   */
  outdentLines(ranges?: Range[]): Promise<void>;

  /**
   * Insert line after
   * @param ranges A list of {@link Range ranges}
   */
  insertLineAfter(ranges?: Range[]): Promise<void>;

  /**
   * Insert snippet
   * @param snippet A snippet string
   * @param ranges A list of {@link Range ranges}
   */
  insertSnippet(snippet: string, ranges?: Range[]): Promise<void>;

  /**
   * Rename
   * @param range A {@link Range range}
   */
  rename(range?: Range): Promise<void>;

  /**
   * Show references
   * @param range A {@link Range range}
   */
  showReferences(range?: Range): Promise<void>;

  /**
   * Show quick fixed dialogue
   * @param range A {@link Range range}
   */
  quickFix(range?: Range): Promise<void>;

  /**
   * Reveal definition
   * @param range A {@link Range range}
   */
  revealDefinition(range?: Range): Promise<void>;

  /**
   * Reveal type definition
   * @param range A {@link Range range}
   */
  revealTypeDefinition(range?: Range): Promise<void>;

  /**
   * Show hover
   * @param range A {@link Range range}
   */
  showHover(range?: Range): Promise<void>;

  /**
   * Show debug hover
   * @param range A {@link Range range}
   */
  showDebugHover(range?: Range): Promise<void>;

  /**
   * Extract variable
   * @param range A {@link Range range}
   */
  extractVariable(range?: Range): Promise<void>;
}
