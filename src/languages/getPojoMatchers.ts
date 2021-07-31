import { getValueNode } from "../treeSitterUtils";
import { selectWithLeadingDelimiter } from "../nodeSelectors";
import { matcher, argumentMatcher } from "../nodeMatchers";

// Matchers for "plain old javascript objects", like those found in JSON
export function getPojoMatchers(
  dictionaryTypes: string[],
  listTypes: string[]
) {
  return {
    dictionary: dictionaryTypes,
    list: listTypes,
    string: "string",
    collectionKey: "pair[key]",
    collectionItem: argumentMatcher(...dictionaryTypes, ...listTypes),
    value: matcher(getValueNode, selectWithLeadingDelimiter),
  };
}
