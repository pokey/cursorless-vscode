import { HatStability } from "@cursorless/common";
import { get } from "lodash";
import * as vscode from "vscode";
import {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "../../libs/common/ide/types/Configuration";
import { HatComparisonPolicy } from "../../libs/common/ide/types/HatStability";
import { GetFieldType, Paths } from "../../libs/common/ide/types/Paths";
import { Notifier } from "../../libs/common/util/Notifier";
import type VscodeIDE from "./VscodeIDE";

const translators = {
  experimental: {
    hatStability(value: Record<keyof HatStability, string>) {
      return {
        keepingPolicy:
          HatComparisonPolicy[
            value.keepingPolicy as keyof typeof HatComparisonPolicy
          ],
        stealingPolicy:
          HatComparisonPolicy[
            value.stealingPolicy as keyof typeof HatComparisonPolicy
          ],
      };
    },
  },
};

export default class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();

  constructor(ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners),
    );
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    const rawValue = vscode.workspace
      .getConfiguration("cursorless", scope)
      .get<GetFieldType<CursorlessConfiguration, Path>>(path)!;

    return get(translators, path)?.(rawValue) ?? rawValue;
  }

  onDidChangeConfiguration = this.notifier.registerListener;
}
