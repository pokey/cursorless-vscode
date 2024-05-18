/* eslint-disable @typescript-eslint/naming-convention */

import {
  LanguageScopeSupportFacetMap,
  ScopeSupportFacetLevel,
} from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const cScopeSupport: LanguageScopeSupportFacetMap = {
  ifStatement: supported,
  "comment.line": supported,
  "string.singleLine": supported,

  namedFunction: supported,
  "name.function": supported,
  functionName: supported,

  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.variable": supported,
  "value.variable": supported,
  "name.assignment": supported,
  "value.assignment": supported,

  "value.argument.formal": notApplicable,
  "value.argument.formal.iteration": notApplicable,
};
