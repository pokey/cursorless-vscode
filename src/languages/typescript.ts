import { SyntaxNode } from "web-tree-sitter";
import {
  matcher,
  cascadingMatcher,
  patternMatcher,
  createPatternMatchers,
  argumentMatcher,
} from "../nodeMatchers";
import {
  NodeMatcherAlternative,
  ScopeType,
  SelectionWithEditor,
} from "../Types";
import { selectWithLeadingDelimiter } from "../nodeSelectors";
import { patternFinder } from "../nodeFinders";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/4c20b54771e4b390ee058af2930feb2cd55f2bf8/typescript/src/node-types.json \
//   | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "abstract_class_declaration",
  "ambient_declaration",
  "break_statement",
  "class_declaration",
  "continue_statement",
  "debugger_statement",
  "declaration",
  "do_statement",
  "empty_statement",
  "enum_declaration",
  "export_statement",
  "expression_statement",
  "for_in_statement",
  "for_statement",
  "function_declaration",
  "function_signature",
  "generator_function_declaration",
  "if_statement",
  "import_alias",
  "import_statement",
  "interface_declaration",
  "internal_module",
  "labeled_statement",
  "lexical_declaration",
  "module",
  "return_statement",
  "statement_block",
  "switch_statement",
  "throw_statement",
  "try_statement",
  "type_alias_declaration",
  "variable_declaration",
  "while_statement",
  "with_statement",
];

const getStartTag = patternMatcher("jsx_element.jsx_opening_element!");
const getEndTag = patternMatcher("jsx_element.jsx_closing_element!");

const getTags = (selection: SelectionWithEditor, node: SyntaxNode) => {
  const startTag = getStartTag(selection, node);
  const endTag = getEndTag(selection, node);
  return startTag != null && endTag != null ? startTag.concat(endTag) : null;
};

const findTypeNode = (node: SyntaxNode) => {
  const typeAnnotationNode = node.children.find((child) =>
    ["type_annotation", "opting_type_annotation"].includes(child.type)
  );
  return typeAnnotationNode?.lastChild ?? null;
};

function valueMatcher() {
  const pFinder = patternFinder("assignment_expression[right]", "*[value]");
  return matcher(
    (node: SyntaxNode) =>
      node.type === "jsx_attribute" ? node.lastChild : pFinder(node),
    selectWithLeadingDelimiter
  );
}

const dictionaryTypes = ["object", "object_pattern"];
const listTypes = ["array", "array_pattern"];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  dictionary: dictionaryTypes,
  list: listTypes,
  string: ["string", "template_string"],
  collectionKey: ["pair[key]", "jsx_attribute.property_identifier!"],
  collectionItem: argumentMatcher(...dictionaryTypes, ...listTypes),
  value: valueMatcher(),
  ifStatement: "if_statement",
  arrowFunction: "arrow_function",
  name: [
    "*[name]",
    "optional_parameter.identifier!",
    "required_parameter.identifier!",
  ],
  comment: "comment",
  regex: "regex",
  className: ["class_declaration[name]", "class[name]"],
  functionCall: ["call_expression", "new_expression"],
  statement: STATEMENT_TYPES.map((type) => `export_statement?.${type}`),
  class: [
    "export_statement?.class_declaration", // export class | class
    "export_statement.class", // export default class
  ],
  functionName: [
    // function
    "function_declaration[name]",
    // class method
    "method_definition[name]",
    // class arrow method
    "public_field_definition[name].arrow_function",
    // const foo = () => { }
    "variable_declarator[name].arrow_function",
    // foo = () => { }
    "assignment_expression[left].arrow_function",
  ],
  namedFunction: [
    // export function | function
    "export_statement?.function_declaration",
    // export default function
    "export_statement.function",
    // class method
    "method_definition",
    // class arrow method
    "public_field_definition.arrow_function",
    // const foo = () => { }
    "lexical_declaration.variable_declarator.arrow_function",
    // foo = () => { }
    "assignment_expression.arrow_function",
  ],
  type: cascadingMatcher(
    // Typed parameters, properties, and functions
    matcher(findTypeNode, selectWithLeadingDelimiter),
    // Type alias/interface declarations
    patternMatcher(
      "export_statement?.type_alias_declaration",
      "export_statement?.interface_declaration"
    )
  ),
  argumentOrParameter: argumentMatcher("formal_parameters", "arguments"),
  // XML, JSX
  xmlAttribute: ["jsx_attribute"],
  xmlElement: ["jsx_element", "jsx_self_closing_element"],
  xmlBothTags: getTags,
  xmlStartTag: getStartTag,
  xmlEndTag: getEndTag,
};

export default createPatternMatchers(nodeMatchers);
