import {
  SimpleSurroundingPairName,
  isString,
  type ComplexSurroundingPairName,
  type SurroundingPairName,
} from "@cursorless/common";
import { concat, uniq } from "lodash-es";
import { complexDelimiterMap, getSimpleDelimiterMap } from "./delimiterMaps";
import { IndividualDelimiter } from "./types";

/**
 * Given a list of delimiters, returns a list where each element corresponds to
 * a single right or left delimiter.  Each item contains information such as a
 * reference to delimiter name, the text to expect, etc.
 *
 * @param delimiter The delimiter name
 * @param languageId The language id, or `undefined` if in a text fragment
 * @returns A list of information about all possible left / right delimiter
 * instances
 */
export function getIndividualDelimiters(
  delimiter: SurroundingPairName,
  languageId: string,
) {
  const delimiters = complexDelimiterMap[
    delimiter as ComplexSurroundingPairName
  ] ?? [delimiter];
  return getSimpleIndividualDelimiters(languageId, delimiters);
}

function getSimpleIndividualDelimiters(
  languageId: string | undefined,
  delimiters: SimpleSurroundingPairName[],
): IndividualDelimiter[] {
  const delimiterToText = getSimpleDelimiterMap(languageId);
  return delimiters.flatMap((delimiter) => {
    const [leftDelimiter, rightDelimiter, isSingleLine] =
      delimiterToText[delimiter];

    // Allow for the fact that a delimiter might have multiple ways to indicate
    // its opening / closing
    const leftDelimiters = isString(leftDelimiter)
      ? [leftDelimiter]
      : leftDelimiter;
    const rightDelimiters = isString(rightDelimiter)
      ? [rightDelimiter]
      : rightDelimiter;

    const allDelimiterTexts = uniq(concat(leftDelimiters, rightDelimiters));

    return allDelimiterTexts.map((text) => {
      const isLeft = leftDelimiters.includes(text);
      const isRight = rightDelimiters.includes(text);

      return {
        text,
        // If delimiter text is the same for left and right, we say it's side
        // is "unknown", so must be determined from context.
        side:
          isLeft && !isRight
            ? "left"
            : isRight && !isLeft
              ? "right"
              : "unknown",
        delimiter,
        isSingleLine: isSingleLine ?? false,
      };
    });
  });
}
