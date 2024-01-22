# Haskell Support

## Node Types

- `adt`
- `all_names`
- `alt`
- `alts`
- `annotated_type_variable`
- `bind_pattern`
- `calling_convention`
- `char`
- `class`
- `class_body`
- `class_head`
- `class_name`
- `comma`
- `comment`
- `con_list`
- `con_tuple`
- `con_unit`
- `constraint`
- `constructor`
- `constructor_operator`
- `constructors`
- `context`
- `cpp`
- `data_constructor`
- `data_constructor_infix`
- `data_constructor_record`
- `data_family`
- `data_instance`
- `decl_tyfam_sig`
- `decl_type`
- `decls`
- `default_declaration`
- `default_signature`
- `deriving`
- `deriving_declaration`
- `deriving_strategy`
- `do_module`
- `empty_file`
- `equation`
- `exp_apply`
- `exp_arithmetic_sequence`
- `exp_case`
- `exp_cond`
- `exp_do`
- `exp_field`
- `exp_if_guard`
- `exp_in`
- `exp_infix`
- `exp_lambda`
- `exp_lambda_case`
- `exp_let`
- `exp_let_in`
- `exp_list`
- `exp_list_comprehension`
- `exp_literal`
- `exp_name`
- `exp_negation`
- `exp_parens`
- `exp_record`
- `exp_section_left`
- `exp_section_right`
- `exp_sum_empty`
- `exp_th_quoted_name`
- `exp_tuple`
- `exp_type_application`
- `exp_unboxed_sum`
- `exp_unboxed_tuple`
- `expent`
- `export`
- `export_names`
- `exports`
- `field`
- `fixity`
- `float`
- `forall`
- `foreign_export`
- `foreign_import`
- `fun`
- `function`
- `fundep`
- `fundeps`
- `gadt_constructor`
- `gdpat`
- `guard`
- `guard_equation`
- `guards`
- `haskell`
- `head`
- `impent`
- `implicit_param`
- `implicit_parid`
- `import`
- `import_con_names`
- `import_item`
- `import_list`
- `import_package`
- `infix`
- `inst_datainst`
- `inst_tyinst`
- `instance`
- `instance_head`
- `integer`
- `label`
- `let`
- `modifier`
- `module`
- `namespace`
- `newtype`
- `newtype_constructor`
- `operator`
- `pat_apply`
- `pat_as`
- `pat_field`
- `pat_fields`
- `pat_infix`
- `pat_irrefutable`
- `pat_list`
- `pat_literal`
- `pat_name`
- `pat_negation`
- `pat_parens`
- `pat_record`
- `pat_strict`
- `pat_tuple`
- `pat_typed`
- `pat_unboxed_tuple`
- `pat_view`
- `pat_wildcard`
- `pattern`
- `pattern_guard`
- `pattern_synonym`
- `patterns`
- `pragma`
- `promoted`
- `qual`
- `qualified_constructor`
- `qualified_constructor_operator`
- `qualified_module`
- `qualified_operator`
- `qualified_type`
- `qualified_type_operator`
- `qualified_variable`
- `quantifiers`
- `quasiquote`
- `quasiquote_bar`
- `quasiquote_body`
- `quasiquote_start`
- `quoter`
- `rec`
- `record_fields`
- `role_annotation`
- `safety`
- `signature`
- `splice`
- `stmt`
- `strict_type`
- `string`
- `ticked`
- `top_splice`
- `transform`
- `tycon_arrow`
- `type`
- `type_alias`
- `type_apply`
- `type_family`
- `type_infix`
- `type_instance`
- `type_list`
- `type_literal`
- `type_name`
- `type_operator`
- `type_parens`
- `type_role`
- `type_star`
- `type_tuple`
- `type_unboxed_sum`
- `type_unboxed_tuple`
- `type_variable`
- `variable`
- `varop`
- `via`
- `where`
- `wildcard`

## Simple Scope Types

```js
export const simpleScopeTypeTypes = [
  "argumentOrParameter",
  "anonymousFunction",
  "attribute",
  "branch",
  "class",
  "className",
  "collectionItem",
  "collectionKey",
  "comment",
  "functionCall",
  "functionCallee",
  "functionName",
  "ifStatement",
  "instance",
  "list",
  "map",
  "name",
  "namedFunction",
  "regularExpression",
  "statement",
  "string",
  "type",
  "value",
  "condition",
  "selector",
  "unit",
] as const;
```