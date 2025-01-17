import type { SimpleScopeTypeType } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import type { NodeMatcherAlternative } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  ancestorChainNodeMatcher,
  argumentMatcher,
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  leadingMatcher,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";

// Generated by the following command:
// curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-ruby/1ebfdb288842dae5a9233e2509a135949023dd82/src/node-types.json  \
// | jq '[.[] | select((.type == "_statement" or .type == "_simple_statement") and .type != "_expression") | .subtypes[] | select(.type != "_expression") | .type ]'
const STATEMENT_TYPES = [
  "alias",
  "begin_block",
  "end_block",
  "if_modifier",
  "rescue_modifier",
  "undef",
  "unless_modifier",
  "until_modifier",
  "while_modifier",
];

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-ruby/1ebfdb288842dae5a9233e2509a135949023dd82/src/node-types.json \
//   | jq '[.[] | select(.type == _expression or .type == _arg or .type == _primary or .type == _lhs or .type == _simple_numeric or .type == _variable or .type == _nonlocal_variable) | .subtypes[].type | select(startswith(_) | not)] | sort | unique'
const EXPRESSION_TYPES = [
  "array",
  "assignment",
  "begin",
  "binary",
  "break",
  "call",
  "case",
  "case_match",
  "chained_string",
  "character",
  "class",
  "class_variable",
  "complex",
  "conditional",
  "constant",
  "delimited_symbol",
  "element_reference",
  "false",
  "float",
  "for",
  "global_variable",
  "hash",
  "heredoc_beginning",
  "identifier",
  "if",
  "instance_variable",
  "integer",
  "lambda",
  "method",
  "module",
  "next",
  "nil",
  "operator_assignment",
  "parenthesized_statements",
  "range",
  "rational",
  "redo",
  "regex",
  "retry",
  "return",
  "scope_resolution",
  "self",
  "simple_symbol",
  "singleton_class",
  "singleton_method",
  "string",
  "string_array",
  "subshell",
  "super",
  "symbol_array",
  "true",
  "unary",
  "unless",
  "until",
  "while",
  "yield",
];

const EXPRESSION_STATEMENT_PARENT_TYPES = [
  "begin_block",
  "begin",
  "block_body",
  "block",
  "body_statement",
  "do_block",
  "do",
  "else",
  "end_block",
  "ensure",
  "heredoc_beginning",
  "interpolation",
  "lambda",
  "method",
  "parenthesized_statements",
  "program",
  "singleton_class",
  "singleton_method",
  "then",
];

const assignmentOperators = [
  "=",
  "+=",
  "-=",
  "*=",
  "**=",
  "/=",
  "||=",
  "|=",
  "&&=",
  "&=",
  "%=",
  ">>=",
  "<<=",
  "^=",
];
const mapKeyValueSeparators = [":", "=>"];

function blockFinder(node: SyntaxNode) {
  if (node.type !== "call") {
    return null;
  }

  const receiver = node.childForFieldName("receiver");
  const method = node.childForFieldName("method");
  const block = node.childForFieldName("block");

  if (
    (receiver?.text === "Proc" && method?.text === "new") ||
    (receiver == null && method?.text === "lambda")
  ) {
    return node;
  }

  return block;
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  statement: cascadingMatcher(
    patternMatcher(...STATEMENT_TYPES),
    ancestorChainNodeMatcher(
      [
        patternFinder(...EXPRESSION_STATEMENT_PARENT_TYPES),
        patternFinder(...EXPRESSION_TYPES),
      ],
      1,
    ),
  ),
  anonymousFunction: cascadingMatcher(
    patternMatcher("lambda", "do_block"),
    matcher(blockFinder),
  ),
  condition: conditionMatcher("*[condition]"),
  argumentOrParameter: argumentMatcher(
    "lambda_parameters",
    "method_parameters",
    "block_parameters",
    "argument_list",
  ),
  collectionKey: trailingMatcher(["pair[key]"], [":"]),
  value: leadingMatcher(
    [
      "pair[value]",
      "assignment[right]",
      "operator_assignment[right]",
      "return.argument_list!",
    ],
    assignmentOperators.concat(mapKeyValueSeparators),
  ),
};
export const patternMatchers = createPatternMatchers(nodeMatchers);
