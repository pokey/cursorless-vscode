import {
  HatRange,
  Hats,
  HatStyleMap,
  Listener,
  Notifier,
} from "@cursorless/common";
// import { toVscodeRange, VscodeApi } from "@cursorless/vscode-common";
// import * as vscode from "vscode";
import { ExtensionContext } from "../../../types/ExtensionContext";
import { Disposable } from "vscode";
// import { VscodeHatStyleName } from "../hatStyles.types";
// import VscodeEnabledHatStyleManager from "../VscodeEnabledHatStyleManager";
import type { NeovimIDE } from "../NeovimIDE";
// import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
// import { FontMeasurements } from "./FontMeasurements";
// import VscodeHatRenderer from "./VscodeHatRenderer";

export class NeovimHats implements Hats {
  enabledHatStyles: HatStyleMap;
  isEnabled: boolean;
  private enabledHatStyleNotifier: Notifier<[HatStyleMap]> = new Notifier();
  private isEnabledNotifier: Notifier<[boolean]> = new Notifier();

  constructor(
    private ide: NeovimIDE,
    ExtensionContext: ExtensionContext,
  ) {
    this.enabledHatStyles = {};
    // TODO: we don't support hats yet
    this.isEnabled = false;
  }

  async init() {}

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {}

  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this.enabledHatStyleNotifier.registerListener(listener);
  }

  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable {
    return this.isEnabledNotifier.registerListener(listener);
  }
}

function dummyEvent() {
  return {
    [Symbol.dispose]() {
      // empty
    },
  };
}
