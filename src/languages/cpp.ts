import {
  createPatternMatchers,
  argumentMatcher,
  leadingMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import type { NodeMatcherAlternative } from "../typings/Types";
import type { SimpleScopeTypeType } from "../typings/targetDescriptor.types";

// Generated by the following command:
// >  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-cpp/master/src/node-types.json | jq '[.[] | select(.type == "compound_statement") | .children.types[].type] + [.[] | select(.type == "_statement") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "_statement",
  "_type_specifier",
  "alias_declaration",
  "declaration",
  "function_definition",
  "linkage_specification",
  "namespace_definition",
  "preproc_call",
  "preproc_def",
  "preproc_function_def",
  "preproc_if",
  "preproc_ifdef",
  "preproc_include",
  "static_assert_declaration",
  "template_declaration",
  "template_instantiation",
  "type_definition",
  "using_declaration",
  "break_statement",
  "case_statement",
  "compound_statement",
  "continue_statement",
  "do_statement",
  "expression_statement",
  "for_range_loop",
  "for_statement",
  "goto_statement",
  "if_statement",
  "labeled_statement",
  "return_statement",
  "switch_statement",
  "throw_statement",
  "try_statement",
  "while_statement",
];

// >  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-cpp/master/src/node-types.json | jq '[.[] | select(.type == "_type_specifier") | .subtypes[].type]'
const TYPE_TYPES = [
  "auto",
  "class_specifier",
  "decltype",
  "dependent_type",
  "enum_specifier",
  "primitive_type",
  "scoped_type_identifier",
  "sized_type_specifier",
  "struct_specifier",
  "template_type",
  "type_identifier",
  "union_specifier",
];

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  statement: STATEMENT_TYPES,
  class: [
    "class_specifier",
    "struct_specifier",
    "enum_specifier",
    "union_specifier",
  ],
  className: [
    "class_specifier[name]",
    "struct_specifier[name]",
    "enum_specifier[name]",
    "union_specifier[name]",
    "function_definition[declarator][declarator][namespace]", // void ClassName::method() {}
  ],
  ifStatement: "if_statement",
  string: "string_literal",
  comment: "comment",
  anonymousFunction: "lambda_expression",
  list: "initializer_list",
  functionCall: ["call_expression", "declaration.init_declarator!"],
  functionCallee: [
    "call_expression[function]",
    "declaration.init_declarator[declarator]!",
  ],
  name: [
    "*[declarator][declarator][name]",
    "*[declarator][name]",
    "*[declarator][declarator]",
    "*[declarator]",
    "assignment_expression[left]",
    "*[name]",
  ],
  namedFunction: ["function_definition", "declaration.function_declarator"],
  type: trailingMatcher(TYPE_TYPES.concat(["*[type]"])),
  functionName: [
    "function_definition[declarator][declarator][name]", // void C::funcName() {}
    "function_definition[declarator][declarator]", // void funcName() {}
    "declaration.function_declarator![declarator]", // void funcName();
  ],
  value: leadingMatcher(
    [
      "*[declarator][value]",
      "*[value]",
      "assignment_expression[right]",
      "optional_parameter_declaration[default_value]",
    ],
    [":", "=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>="]
  ),
  argumentOrParameter: argumentMatcher("parameter_list", "argument_list"),
  attribute: "attribute",
};

export default createPatternMatchers(nodeMatchers);
