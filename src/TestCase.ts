import * as path from "path";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as vscode from "vscode";
import NavigationMap from "./NavigationMap";
import { ThatMark } from "./ThatMark";
import { ActionType, PartialTarget, Target } from "./Types";
import { extractTargetedMarks } from "./extractTargetedMarks";
import { marksToPlainObject, SerializedMarks } from "./toPlainObject";
import { takeSnapshot, TestCaseSnapshot } from "./takeSnapshot";

type TestCaseCommand = {
  actionName: ActionType;
  partialTargets: PartialTarget[];
  extraArgs: any[];
};

type TestCaseContext = {
  talonCommand: string;
  thatMark: ThatMark;
  targets: Target[];
  navigationMap: NavigationMap;
};

export type TestCaseFixture = {
  talonCommand: string;
  command: TestCaseCommand;
  languageId: string;
  marks: SerializedMarks;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
  returnValue: unknown;
  /** Inferred full targets added for context; not currently used in testing */
  fullTargets: Target[];
};

export class TestCase {
  talonCommand: string;
  command: TestCaseCommand;
  languageId: string;
  fullTargets: Target[];
  marks: SerializedMarks;
  context: TestCaseContext;
  initialState: TestCaseSnapshot | null = null;
  finalState: TestCaseSnapshot | null = null;
  returnValue: unknown = null;

  constructor(command: TestCaseCommand, context: TestCaseContext) {
    const activeEditor = vscode.window.activeTextEditor!;
    const { navigationMap, targets, talonCommand } = context;
    const targetedMarks = extractTargetedMarks(targets, navigationMap);

    this.talonCommand = talonCommand;
    this.command = command;
    this.languageId = activeEditor.document.languageId;
    this.marks = marksToPlainObject(targetedMarks);
    this.fullTargets = targets;
    this.context = context;
  }

  private includesThatMark(target: Target) {
    if (target.type === "primitive" && target.mark.type === "that") {
      return true;
    } else if (target.type === "list") {
      return target.elements.some(this.includesThatMark, this);
    } else if (target.type === "range") {
      return [target.start, target.end].some(this.includesThatMark, this);
    }
    return false;
  }

  private getExcludedFields(context?: { initialSnapshot?: boolean }) {
    const excludableFields = {
      clipboard: !["copy", "paste"].includes(this.command.actionName),
      thatMark:
        context?.initialSnapshot &&
        !this.fullTargets.some(this.includesThatMark, this),
      visibleRanges: ![
        "fold",
        "unfold",
        "scrollToBottom",
        "scrollToCenter",
        "scrollToTop",
      ].includes(this.command.actionName),
    };

    return Object.keys(excludableFields).filter(
      (field) => excludableFields[field]
    );
  }

  private toYaml() {
    if (this.initialState == null || this.finalState == null) {
      throw Error("Two snapshots must be taken before serializing");
    }
    const fixture: TestCaseFixture = {
      talonCommand: this.talonCommand,
      languageId: this.languageId,
      command: this.command,
      marks: this.marks,
      initialState: this.initialState,
      finalState: this.finalState,
      returnValue: this.returnValue,
      fullTargets: this.fullTargets,
    };
    return yaml.dump(fixture, { noRefs: true, quotingType: '"' });
  }

  async recordInitialState() {
    const excludeFields = this.getExcludedFields({ initialSnapshot: true });
    this.initialState = await takeSnapshot(
      this.context.thatMark,
      excludeFields
    );
  }

  async recordFinalState(returnValue: unknown) {
    const excludeFields = this.getExcludedFields();
    this.returnValue = returnValue;
    this.finalState = await takeSnapshot(this.context.thatMark, excludeFields);
  }

  async writeFile(outPath: string) {
    const fixture = this.toYaml();
    fs.writeFileSync(outPath, fixture);
    vscode.window
      .showInformationMessage("Cursorless test case saved.", "View")
      .then(async (action) => {
        if (action === "View") {
          const document = await vscode.workspace.openTextDocument(outPath);
          await vscode.window.showTextDocument(document);
        }
      });
  }

  async showFixture() {
    const fixture = this.toYaml();
    const document = await vscode.workspace.openTextDocument({
      language: "yaml",
      content: fixture,
    });
    await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Beside,
    });
  }
}
