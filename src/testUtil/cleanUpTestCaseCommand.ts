import { TestCaseCommand } from "./TestCase";

export function cleanUpTestCaseCommand(
  command: TestCaseCommand
): TestCaseCommand {
  const { extraArgs, usePrePhraseSnapshot, ...rest } = command;

  return {
    extraArgs:
      extraArgs == null
        ? undefined
        : extraArgs.length === 0
        ? undefined
        : extraArgs,
    ...rest,
  };
}
