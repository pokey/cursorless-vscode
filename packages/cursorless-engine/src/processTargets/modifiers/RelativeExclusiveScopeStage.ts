import type { RelativeScopeModifier } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import {
  constructScopeRangeTarget,
  constructTargetsFromScopes,
} from "./constructScopeRangeTarget";
import { runLegacy } from "./relativeScopeLegacy";
import { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import { TargetScope } from "./scopeHandlers/scope.types";
import type {
  ContainmentPolicy,
  ScopeHandler,
} from "./scopeHandlers/scopeHandler.types";
import { OutOfRangeError } from "./targetSequenceUtils";

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
export class RelativeExclusiveScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.create(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifierStageFactory, this.modifier, target);
    }

    const scopes = this.getsScopes(scopeHandler, target);
    const { isReversed } = target;

    if (this.modifier.isEvery) {
      return constructTargetsFromScopes(isReversed, scopes);
    }

    // Then make a range when we get the desired number of scopes
    return constructScopeRangeTarget(
      isReversed,
      scopes[0],
      scopes[scopes.length - 1],
    );
  }

  private getsScopes(
    scopeHandler: ScopeHandler,
    target: Target,
  ): TargetScope[] {
    const { editor, contentRange: inputRange } = target;
    const { length: desiredScopeCount, direction, offset } = this.modifier;

    const initialPosition =
      direction === "forward" ? inputRange.end : inputRange.start;

    // If inputRange is empty, then we skip past any scopes that start at
    // inputRange.  Otherwise just disallow any scopes that start strictly
    // before the end of input range (strictly after for "backward").
    const containment: ContainmentPolicy | undefined = inputRange.isEmpty
      ? "disallowed"
      : "disallowedIfStrict";

    const scopes: TargetScope[] = [];
    let scopeCount = 0;
    for (const scope of scopeHandler.generateScopes(
      editor,
      initialPosition,
      direction,
      { containment, skipAncestorScopes: true },
    )) {
      scopeCount += 1;

      if (scopeCount < offset) {
        // Skip until we hit `offset`
        continue;
      }

      if (scopeCount === offset) {
        // When we hit offset, that becomes proximal scope
        if (desiredScopeCount === 1) {
          // Just return it if we only want 1 scope
          return [scope];
        }

        scopes.push(scope);

        continue;
      }

      if (scopeCount === offset + desiredScopeCount - 1) {
        scopes.push(scope);

        // Then make a range when we get the desired number of scopes
        return scopes;
      }
    }

    throw new OutOfRangeError();
  }
}
