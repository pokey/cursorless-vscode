import { SyntaxNode } from "web-tree-sitter";
import {
  createPatternMatchers,
  argumentMatcher,
  valueMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative, ScopeType } from "../typings/Types";

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
  argumentOrParameter: argumentMatcher("parameters", "argument_list"),
};

export default createPatternMatchers(nodeMatchers);
