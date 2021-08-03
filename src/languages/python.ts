import { SyntaxNode } from "web-tree-sitter";
import {
  matcher,
  createPatternMatchers,
  argumentMatcher,
  valueMatcher,
} from "../nodeMatchers";
import { NodeMatcherAlternative, ScopeType } from "../Types";
import { nodeFinder } from "../nodeFinders";
import { delimitedSelector } from "../nodeSelectors";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
//   | jq '[.[] | select(.type == primary_expression or .type == expression) | .subtypes[].type]'
const EXPRESSION_TYPES = [
  "attribute",
  "await",
  "binary_operator",
  "boolean_operator",
  "call",
  "comparison_operator",
  "concatenated_string",
  "conditional_expression",
  "dictionary",
  "dictionary_comprehension",
  "ellipsis",
  "false",
  "float",
  "generator_expression",
  "identifier",
  "integer",
  "lambda",
  "list",
  "list_comprehension",
  "named_expression",
  "none",
  "not_operator",
  "parenthesized_expression",
  "primary_expression",
  "set",
  "set_comprehension",
  "string",
  "subscript",
  "true",
  "tuple",
  "unary_operator",
];

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
//   | jq '[.[] | select(.type == "_simple_statement" or .type == "_compound_statement") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "assert_statement",
  "break_statement",
  "class_definition",
  "continue_statement",
  "decorated_definition",
  "delete_statement",
  "exec_statement",
  "expression_statement",
  "for_statement",
  "function_definition",
  "future_import_statement",
  "global_statement",
  "if_statement",
  "import_from_statement",
  "import_statement",
  "nonlocal_statement",
  "pass_statement",
  "print_statement",
  "raise_statement",
  "return_statement",
  "try_statement",
  "while_statement",
  "with_statement",
];

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/d6210ceab11e8d812d4ab59c07c81458ec6e5184/src/node-types.json \
//   | jq '[.[] | select(.type == "parameter") | .subtypes[].type]'
const PARAMETER_TYPES = [
  "default_parameter",
  "dictionary_splat_pattern",
  "identifier",
  "list_splat_pattern",
  "tuple_pattern",
  "typed_default_parameter",
  "typed_parameter",
];

const PARAMETER_LIST_TYPES = ["lambda_parameters", "parameters"];

// TODO: Don't hard code this
const ARGUMENT_TYPES = [
  ...EXPRESSION_TYPES,
  "list_splat",
  "dictionary_splat",
  "parenthesized_expression",
  "keyword_argument",
];

export const getTypeNode = (node: SyntaxNode) =>
  node.children.find((child) => child.type === "type") ?? null;

const dictionaryTypes = ["dictionary", "dictionary_comprehension"];
const listTypes = ["list", "list_comprehension", "set"];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  dictionary: dictionaryTypes,
  list: listTypes,
  statement: STATEMENT_TYPES,
  string: "string",
  collectionKey: "pair[key]",
  ifStatement: "if_statement",
  arrowFunction: "lambda",
  functionCall: "call",
  comment: "comment",
  class: "decorated_definition?.class_definition",
  className: "class_definition[name]",
  namedFunction: "decorated_definition?.function_definition",
  functionName: "function_definition[name]",
  type: ["function_definition[return_type]", "*[type]"],
  name: [
    "assignment[left]",
    "typed_parameter.identifier!",
    "parameters.identifier!",
    "*[name]",
  ],
  collectionItem: argumentMatcher(...dictionaryTypes, ...listTypes),
  value: valueMatcher("assignment[right]", "*[value]"),
  argumentOrParameter: matcher(
    nodeFinder(
      (node) =>
        (node.parent?.type === "argument_list" &&
          ARGUMENT_TYPES.includes(node.type)) ||
        (PARAMETER_LIST_TYPES.includes(node.parent?.type ?? "") &&
          PARAMETER_TYPES.includes(node.type))
    ),
    delimitedSelector(
      (node) => node.type === "," || node.type === "(" || node.type === ")",
      ", "
    )
  ),
};

export default createPatternMatchers(nodeMatchers);
