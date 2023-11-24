import { pick } from "lodash";
import { Grammar, Parser } from "nearley";
import * as vscode from "vscode";
import { KeyboardCommandsModalLayer } from "./KeyboardCommandsModalLayer";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import { KeyDescriptor } from "./TokenTypeHelpers";
import { TokenTypeKeyMapMap } from "./TokenTypeHelpers";
import KeyboardHandler from "./KeyboardHandler";
import grammar from "./grammar/generated/grammar";
import { getAcceptableTokenTypes } from "./grammar/getAcceptableTokenTypes";
import { KeyboardCommandHandler } from "./KeyboardCommandHandler";
import { getTokenTypeKeyMaps } from "./getTokenTypeKeyMaps";

/**
 * Defines a mode to use with a modal version of Cursorless keyboard.
 */
export default class KeyboardCommandsModal {
  /**
   * This disposable is returned by {@link KeyboardHandler.pushListener}, and is
   * used to relinquich control of the keyboard.  If this disposable is
   * non-null, then our mode is active.
   */
  private inputDisposable: vscode.Disposable | undefined;

  /**
   * Merged map from all the different sections of the key map (eg actions,
   * colors, etc).
   */
  private currentLayer!: KeyboardCommandsModalLayer<KeyDescriptor>;
  private parser!: Parser;
  private sections!: TokenTypeKeyMapMap;
  private keyboardCommandHandler: KeyboardCommandHandler;
  private compiledGrammar = Grammar.fromCompiled(grammar);

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private targeted: KeyboardCommandsTargeted,
    private keyboardHandler: KeyboardHandler,
  ) {
    this.modeOn = this.modeOn.bind(this);
    this.modeOff = this.modeOff.bind(this);
    this.handleInput = this.handleInput.bind(this);

    this.keyboardCommandHandler = new KeyboardCommandHandler(targeted);

    this.processKeyMap();
  }

  init() {
    this.extensionContext.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (
          event.affectsConfiguration(
            "cursorless.experimental.keyboard.modal.keybindings",
          )
        ) {
          if (this.isModeOn()) {
            this.modeOff();
            this.modeOn();
          }
          this.processKeyMap();
        }
      }),
    );
  }

  private processKeyMap() {
    this.sections = getTokenTypeKeyMaps();
    this.resetParser();
  }

  private resetParser() {
    this.parser = new Parser(this.compiledGrammar);
    this.computeLayer();
  }

  /**
   * Given the current state of the parser, computes a keyboard layer containing
   * only the keys that are currently valid.
   */
  private computeLayer() {
    const acceptableTokenTypes = getAcceptableTokenTypes(this.parser);
    // FIXME: Here's where we'd update sidebar
    const sections = pick(
      this.sections,
      acceptableTokenTypes.map(({ type }) => type),
    );
    this.currentLayer = new KeyboardCommandsModalLayer(
      this.keyboardHandler,
      Object.values(sections),
    );
  }

  modeOn = async () => {
    if (this.isModeOn()) {
      return;
    }

    this.inputDisposable = this.keyboardHandler.pushListener({
      handleInput: this.handleInput,
      displayOptions: {
        cursorStyle: vscode.TextEditorCursorStyle.BlockOutline,
        whenClauseContext: "cursorless.keyboard.modal.mode",
        statusBarText: "Listening...",
      },
      handleCancelled: this.modeOff,
    });

    // Set target to current selection when we enter the mode
    await this.targeted.targetSelection();
  };

  async handleInput(text: string) {
    try {
      let currentText: string | undefined = text;
      while (true) {
        const token = await this.currentLayer.handleInput(currentText);
        if (token == null) {
          throw new KeySequenceCancelledError();
        }

        this.parser.feed([token]);

        if (this.parser.results.length > 0) {
          // We've found a valid parse
          break;
        }

        currentText = undefined;
        this.computeLayer();
      }

      if (this.parser.results.length > 1) {
        console.error("Ambiguous parse:");
        console.error(JSON.stringify(this.parser.results, null, 2));
        throw new Error("Ambiguous parse");
      }

      const nextTokenTypes = getAcceptableTokenTypes(this.parser);
      if (nextTokenTypes.length > 0) {
        // Because we stop as soon as a valid parse is found, there shouldn't
        // be any way to continue
        console.error(
          "Ambiguous whether parsing is complete. Possible following tokens:",
        );
        console.error(JSON.stringify(nextTokenTypes, null, 2));
        throw new Error("Ambiguous parse");
      }

      const [{ type, arg }] = this.parser.results;

      // Run the command
      this.keyboardCommandHandler[type as keyof KeyboardCommandHandler](arg);
    } catch (err) {
      if (!(err instanceof KeySequenceCancelledError)) {
        vscode.window.showErrorMessage((err as Error).message);
        throw err;
      }
    } finally {
      // Always reset the parser when we're done
      this.resetParser();
    }
  }

  modeOff = async () => {
    if (!this.isModeOn()) {
      return;
    }

    this.inputDisposable?.dispose();
    this.inputDisposable = undefined;

    // Clear target upon exiting mode; this will remove the highlight
    await this.targeted.clearTarget();
  };

  modeToggle = () => {
    if (this.isModeOn()) {
      this.modeOff();
    } else {
      this.modeOn();
    }
  };

  private isModeOn() {
    return this.inputDisposable != null;
  }
}

class KeySequenceCancelledError extends Error {
  constructor() {
    super("Key sequence cancelled");
  }
}