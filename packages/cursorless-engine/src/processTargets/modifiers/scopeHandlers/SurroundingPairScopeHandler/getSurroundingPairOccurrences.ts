import type { TargetScope } from "../scope.types";
import type {
  DelimiterOccurrence,
  IndividualDelimiter,
  SurroundingPairOccurrence,
} from "./types";

export function getSurroundingPairOccurrences(
  disqualifiedDelimiterScopes: TargetScope[],
  individualDelimiters: IndividualDelimiter[],
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];

  const disqualifiedRanges = disqualifiedDelimiterScopes.flatMap(
    (disqualifyDelimiters) => disqualifyDelimiters.domain,
  );

  const openDelimiters = new Map<string, DelimiterOccurrence[]>(
    individualDelimiters.map((individualDelimiter) => [
      individualDelimiter.delimiter,
      [],
    ]),
  );

  for (const occurrence of delimiterOccurrences) {
    const occurrenceIsDisqualified = disqualifiedRanges.some(
      (range) =>
        range.start.isEqual(occurrence.start) &&
        range.end.isEqual(occurrence.end),
    );

    if (occurrenceIsDisqualified) {
      continue;
    }

    const side: "left" | "right" = (() => {
      if (occurrence.side === "unknown") {
        return openDelimiters.get(occurrence.delimiter)!.length % 2 === 0
          ? "left"
          : "right";
      }
      return occurrence.side;
    })();

    if (side === "left") {
      openDelimiters.get(occurrence.delimiter)!.push(occurrence);
    } else {
      const openDelimiter = openDelimiters.get(occurrence.delimiter)!.pop();

      if (openDelimiter == null) {
        continue;
      }

      if (
        occurrence.isSingleLine &&
        openDelimiter.start.line !== occurrence.start.line
      ) {
        if (occurrence.side === "unknown") {
          openDelimiters.get(occurrence.delimiter)!.push(occurrence);
        }
        continue;
      }

      result.push({
        delimiter: occurrence.delimiter,
        leftStart: openDelimiter.start,
        leftEnd: openDelimiter.end,
        rightStart: occurrence.start,
        rightEnd: occurrence.end,
      });
    }
  }

  return result;
}
