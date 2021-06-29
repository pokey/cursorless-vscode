import { SyntaxNode } from "web-tree-sitter";

export const getValueNode = (node: SyntaxNode) =>
  node.childForFieldName("value");

export const getTypeAnnotationNode = (node: SyntaxNode) =>
  node.childForFieldName("type_annotation");

export const getKeyNode = (node: SyntaxNode) => node.childForFieldName("key");

export const getDefinitionNode = (node: SyntaxNode) =>
  node.childForFieldName("definition");

export const getDeclarationNode = (node: SyntaxNode) =>
  node.childForFieldName("declaration");
