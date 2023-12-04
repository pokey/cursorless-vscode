import { Range, SimpleScopeTypeType, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import {
  NodeFinder,
  NodeMatcherAlternative,
  SelectionWithContext,
} from "../typings/Types";
import { getMatchesInRange } from "../util/getMatchesInRange";
import { leadingSiblingNodeFinder, patternFinder } from "../util/nodeFinders";
import { createPatternMatchers, matcher } from "../util/nodeMatchers";
import {
  extendUntilNextMatchingSiblingOrLast,
  selectWithLeadingDelimiter,
} from "../util/nodeSelectors";
import { shrinkRangeToFitContent } from "../util/selectionUtils";

const HEADING_MARKER_TYPES = [
  "atx_h1_marker",
  "atx_h2_marker",
  "atx_h3_marker",
  "atx_h4_marker",
  "atx_h5_marker",
  "atx_h6_marker",
] as const;
type HeadingMarkerType = (typeof HEADING_MARKER_TYPES)[number];

/**
 * Returns a node finder that will only accept nodes of heading level at least
 * as high as the given heading level type
 * @param headingType The heading type of the node we'll be starting at
 * @returns A node finder that will return the next node that is of the same
 * marker level or higher than the original type
 */
function makeMinimumHeadingLevelFinder(
  headingType: HeadingMarkerType,
): NodeFinder {
  const markerIndex = HEADING_MARKER_TYPES.indexOf(headingType);
  return (node: SyntaxNode) => {
    return node.type === "atx_heading" &&
      HEADING_MARKER_TYPES.indexOf(
        node.firstNamedChild?.type as HeadingMarkerType,
      ) <= markerIndex
      ? node
      : null;
  };
}

function sectionExtractor(editor: TextEditor, node: SyntaxNode) {
  const finder = makeMinimumHeadingLevelFinder(
    node.firstNamedChild?.type as HeadingMarkerType,
  );

  const { context, selection } = extendUntilNextMatchingSiblingOrLast(
    editor,
    node,
    finder,
  );
  return {
    context,
    selection: shrinkRangeToFitContent(editor, selection).toSelection(
      selection.isReversed,
    ),
  };
}

function sectionMatcher(...patterns: string[]) {
  const finder = patternFinder(...patterns);

  return matcher(leadingSiblingNodeFinder(finder), sectionExtractor);
}

const itemLeadingDelimiterExtractor = selectWithLeadingDelimiter(
  "list_marker_parenthesis",
  "list_marker_dot",
  "list_marker_star",
  "list_marker_minus",
  "list_marker_plus",
);

function excludeTrailingNewline(editor: TextEditor, range: Range) {
  const matches = getMatchesInRange(/\r?\n\s*$/g, editor, range);

  if (matches.length > 0) {
    return new Range(range.start, matches[0].start);
  }

  return range;
}

function itemExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  const { selection } = itemLeadingDelimiterExtractor(editor, node);
  const line = editor.document.lineAt(selection.start);
  const leadingRange = new Range(line.range.start, selection.start);
  const indent = editor.document.getText(leadingRange);

  return {
    context: {
      containingListDelimiter: `\n${indent}`,
      leadingDelimiterRange: leadingRange,
    },
    selection: excludeTrailingNewline(editor, selection).toSelection(
      selection.isReversed,
    ),
  };
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  collectionItem: matcher(patternFinder("list_item.paragraph!"), itemExtractor),
  section: sectionMatcher("atx_heading"),
  sectionLevelOne: sectionMatcher("atx_heading.atx_h1_marker"),
  sectionLevelTwo: sectionMatcher("atx_heading.atx_h2_marker"),
  sectionLevelThree: sectionMatcher("atx_heading.atx_h3_marker"),
  sectionLevelFour: sectionMatcher("atx_heading.atx_h4_marker"),
  sectionLevelFive: sectionMatcher("atx_heading.atx_h5_marker"),
  sectionLevelSix: sectionMatcher("atx_heading.atx_h6_marker"),
};

export default createPatternMatchers(nodeMatchers);
