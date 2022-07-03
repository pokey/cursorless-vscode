import { ensureSingleTarget } from "../../util/targetUtils";

import { open } from "fs/promises";
import { join } from "path";
import { commands, Range, window, workspace } from "vscode";
import { Offsets } from "../../processTargets/modifiers/surroundingPair/types";
import { Target } from "../../typings/target.types";
import { Graph } from "../../typings/Types";
import { Action, ActionReturnValue } from "../actions.types";
import { constructSnippetBody } from "./constructSnippetBody";
import { editText } from "./editText";
import Substituter from "./Substituter";
import isTesting from "../../testUtil/isTesting";
import { getDocumentRange } from "../../util/range";
import { selectionFromRange } from "../../util/selectionUtils";

/**
 * This action can be used to automatically create a snippet from a target.
 * Any cursor selections inside the target will become placeholders in the final
 * snippet.  This action creates a new file, and inserts a snippet that the
 * user can fill out to construct their desired snippet.
 *
 * Note that there are two snippets involved in this implementation:
 *
 * - The snippet that the user is trying to create.  We refer to this snippet as the user snippet.
 * - The snippet that we insert that the user can use to build their snippet.
 * We refer to this as the meta snippet.
 *
 * We proceed as follows:
 *
 * 1. Ask user for snippet name if not provided as arg
 * 2. Find all cursor selections inside target
 * 3. Extract text of target
 * 4. Replace cursor selections in text with random ids that won't be
 * affected by json serialization.  After serialization we'll replace these
 * id's by snippet placeholders.
 * 4. Construct the user snippet body as a list of strings
 * 5. Construct a javascript object that will be json-ified to become the meta
 * snippet
 * 6. Serialize the javascript object to json
 * 7. Perform replacements on the random id's appearing in this json to get the
 * text we desire.  This modified json output is the meta snippet.
 * 8. Insert the meta snippet so that the user can construct their snippet.
 */
export default class GenerateSnippet implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    snippetName?: string
  ): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);
    const editor = target.editor;

    // NB: We don't await the pending edit decoration so that if they
    // immediately start saying the name of the snippet, we're more likely to
    // win the race and have the input box ready for them
    this.graph.editStyles.displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    if (snippetName == null) {
      snippetName = await window.showInputBox({
        prompt: "Name of snippet",
        placeHolder: "helloWorld",
      });
    }

    // User cancelled; don't do anything
    if (snippetName == null) {
      return {};
    }

    /** The next placeholder index to use for the meta snippet */
    let nextPlaceholderIndex = 1;

    const baseOffset = editor.document.offsetAt(target.contentRange.start);

    /**
     * The variables that will appear in the user snippet. Note that
     * `placeholderIndex` here is the placeholder index in the meta snippet not
     * the user snippet.
     */
    const variables: Variable[] = editor.selections
      .filter((selection) => target.contentRange.contains(selection))
      .map((selection, index) => ({
        offsets: {
          start: editor.document.offsetAt(selection.start) - baseOffset,
          end: editor.document.offsetAt(selection.end) - baseOffset,
        },
        defaultName: `variable${index + 1}`,
        placeholderIndex: nextPlaceholderIndex++,
      }));

    /**
     * Constructs random ids that can be put into the text that won't be
     * modified by json serialization.
     */
    const substituter = new Substituter();

    const linePrefix = editor.document.getText(
      new Range(
        target.contentRange.start.with(undefined, 0),
        target.contentRange.start
      )
    );

    /** The text of the snippet, with placeholders inserted for variables */
    const snippetBodyText = editText(
      editor.document.getText(target.contentRange),
      variables.map(({ offsets, defaultName, placeholderIndex }) => ({
        offsets,
        text: substituter.addSubstitution(
          [
            // This `\$` will end up being a `$` in the final document.  It
            // indicates the start of a variable in the user snippet.  We need
            // the `\` so that the meta-snippet doesn't see it as one of its
            // placeholders.
            // Note that the reason we use the substituter here is primarily so
            // that the `\` here doesn't get escaped upon conversion to json.
            "\\$",

            // The remaining text here is a placeholder in the meta-snippet
            // that the user can use to name their snippet variable that will
            // be in the user snippet.
            "${",
            placeholderIndex,
            ":",
            defaultName,
            "}",
          ].join("")
        ),
      }))
    );

    const snippetLines = constructSnippetBody(snippetBodyText, linePrefix);

    /**
     * Constructs a key-value entry for use in the variable description section
     * of the user snippet definition.  It contains tabstops for use in the
     * meta-snippet.
     * @param variable The variable
     * @returns A [key, value] pair for use in the meta-snippet
     */
    const constructVariableDescriptionEntry = ({
      placeholderIndex,
    }: Variable): [string, string] => {
      // The key will have the same placeholder index as the other location
      // where this variable appears.
      const key = "$" + placeholderIndex;

      // The value will end up being an empty object with a tabstop in the
      // middle so that the user can add information about the variable, such
      // as wrapperScopeType.  Ie the output will look like `{|}` (with the `|`
      // representing a tabstop in the meta-snippet)
      //
      // NB: We use the subsituter here, with `isQuoted=true` because in order
      // to make this work for the meta-snippet, we want to end up with
      // something like `{$3}`, which is not valid json.  So we instead arrange
      // to end up with json like `"hgidfsivhs"`, and then replace the whole
      // string (including quotes) with `{$3}` after json-ification
      const value = substituter.addSubstitution(
        "{$" + nextPlaceholderIndex++ + "}",
        true
      );

      return [key, value];
    };

    /** An object that will be json-ified to become the meta-snippet */
    const snippet = {
      [snippetName]: {
        definitions: [
          {
            scope: {
              langIds: [editor.document.languageId],
            },
            body: snippetLines,
          },
        ],
        description: `$${nextPlaceholderIndex++}`,
        variables:
          variables.length === 0
            ? undefined
            : Object.fromEntries(
                variables.map(constructVariableDescriptionEntry)
              ),
      },
    };

    /**
     * This is the text of the meta-snippet in Textmate format that we will
     * insert into the new document where the user will fill out their snippet
     * definition
     */
    const snippetText = substituter.makeSubstitutions(
      JSON.stringify(snippet, null, 2)
    );

    const userSnippetsDir = workspace
      .getConfiguration("cursorless.experimental")
      .get<string>("snippetsDir");

    if (!userSnippetsDir) {
      throw new Error("User snippets dir not configured.");
    }

    if (isTesting()) {
      // If we're testing, we just overwrite the current document
      editor.selections = [
        selectionFromRange(false, getDocumentRange(editor.document)),
      ];
    } else {
      // Otherwise, we create a new document for the snippet in the user
      // snippets dir
      const path = join(userSnippetsDir, `${snippetName}.cursorless-snippets`);
      await touch(path);
      const snippetDoc = await workspace.openTextDocument(path);
      await window.showTextDocument(snippetDoc);
    }

    await commands.executeCommand("editor.action.insertSnippet", {
      snippet: snippetText,
    });

    return {
      thatMark: targets.map(({ editor, contentSelection }) => ({
        editor,
        selection: contentSelection,
      })),
    };
  }
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}

interface Variable {
  /**
   * The start an end offsets of the variable relative to the text of the
   * snippet that contains it
   */
  offsets: Offsets;

  /**
   * The default name for the given variable that will appear as the placeholder
   * text in the meta snippet
   */
  defaultName: string;

  /**
   * The placeholder to use when filling out the name of this variable in the
   * meta snippet.
   */
  placeholderIndex: number;
}
