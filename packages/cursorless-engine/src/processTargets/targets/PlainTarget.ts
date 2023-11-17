import { BaseTarget, CommonTargetParameters } from ".";
import type { Target } from "../../typings/target.types";
import { createContinuousRangeOrUntypedTarget } from "../targetUtil/createContinuousRange";

interface PlainTargetParameters extends CommonTargetParameters {
  readonly isToken?: boolean;
  readonly insertionDelimiter?: string;
}

/**
 * A target that has no leading or trailing delimiters so it's removal range
 * just consists of the content itself. Its insertion delimiter is empty string,
 * unless specified.
 */
export class PlainTarget extends BaseTarget<PlainTargetParameters> {
  type = "PlainTarget";
  insertionDelimiter: string;

  constructor(parameters: PlainTargetParameters) {
    super(parameters);
    this.isToken = parameters.isToken ?? true;
    this.insertionDelimiter = parameters.insertionDelimiter ?? "";
  }

  getLeadingDelimiterTarget = () => undefined;
  getTrailingDelimiterTarget = () => undefined;
  getRemovalRange = () => this.contentRange;

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target {
    return createContinuousRangeOrUntypedTarget(
      isReversed,
      this,
      this.getCloneParameters(),
      endTarget,
      includeStart,
      includeEnd,
    );
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      isToken: this.isToken,
      insertionDelimiter: this.insertionDelimiter,
    };
  }
}
