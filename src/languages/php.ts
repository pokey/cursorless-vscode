import { SyntaxNode } from "web-tree-sitter";
import {
  argumentMatcher,
  createPatternMatchers,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import { getNodeRange } from "../util/nodeSelectors";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-php/0ce134234214427b6aeb2735e93a307881c6cd6f/src/node-types.json \
//   | jq '[.[] | select(.type == "_statement") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "break_statement",
  "class_declaration",
  "compound_statement",
  "const_declaration",
  "continue_statement",
  "declare_statement",
  "do_statement",
  "echo_statement",
  "empty_statement",
  "enum_declaration",
  "expression_statement",
  "for_statement",
  "foreach_statement",
  "function_definition",
  "function_static_declaration",
  "global_declaration",
  "goto_statement",
  "if_statement",
  "interface_declaration",
  "named_label_statement",
  "namespace_definition",
  "namespace_use_declaration",
  "return_statement",
  "switch_statement",
  "trait_declaration",
  "try_statement",
  "unset_statement",
  "while_statement"
];

// Taken from https://www.php.net/manual/en/language.operators.assignment.php
const assignmentOperators = [
  "=",
  // Arithmetic
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  // Bitwise
  "&=",
  "|=",
  "^=",
  "<<=",
  ">>=",
  // Other
  ".=",
  "??=",
];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  statement: STATEMENT_TYPES,
  ifStatement: "if_statement",
  class: "class_declaration",
  className: "class_declaration[name]",
  name: [
    "assignment_expression[left]",
    "class_declaration[name]",
    "function_definition[name]",
    "method_declaration[name]",
  ],
  comment: "comment",
  string: "string",

  functionCall: "function_call_expression",
  functionName: [
    "function_definition[name]",
    "method_declaration[name]",
  ],

  value: leadingMatcher(
    [
      "array_element_initializer[1]",
      "assignment_expression[right]",
      "augmented_assignment_expression[right]",
      "return_statement[0]",
    ],
    assignmentOperators.concat(["=>"]),
  ),

  collectionKey: trailingMatcher(["array_element_initializer[0]"], ["=>"]),
  collectionItem: argumentMatcher("array_creation_expression"),

  argumentOrParameter: argumentMatcher("arguments", "formal_parameters"),
};
export default createPatternMatchers(nodeMatchers);

export function stringTextFragmentExtractor(
  node: SyntaxNode,
  _selection: SelectionWithEditor
) {
  if (node.type === "string") {
    return getNodeRange(node);
  }

  return null;
}
