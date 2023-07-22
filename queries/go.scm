;; @statement generated by the following command:
;;  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-go/master/src/node-types.json | jq '[.[] | select(.type == "_statement" or .type == "_simple_statement") | .subtypes[].type]' | grep -v '\"_' | sed -n '1d;p' | sed '$d' | sort
;; and then cleaned up.
[
  (assignment_statement)
  ;; omit block for now, as it is not clear that it matches Cursorless user expectations
  ;; (block)
  (break_statement)
  (const_declaration)
  (continue_statement)
  (dec_statement)
  (defer_statement)
  (empty_statement)
  (expression_statement)
  (expression_switch_statement)
  (fallthrough_statement)
  (for_statement)
  (go_statement)
  (goto_statement)
  (if_statement)
  (inc_statement)
  (labeled_statement)
  (return_statement)
  (select_statement)
  (send_statement)
  (short_var_declaration)
  (type_declaration)
  (type_switch_statement)
  (var_declaration)
] @statement

[
  (interpreted_string_literal)
  (raw_string_literal)
] @string @textFragment

(comment) @comment @textFragment

;; What should map and list refer to in Go programs?
;;
;; The obvious answer is that map should refer to map and struct composite literals,
;; and that list should refer to slice and array composite literals.
;;
;; There are two problems with this answer.
;;
;;   * The type of a composite literal is a semantic, not a syntactic property of a program.
;;       - What is the type of T{1: 2}? It could be array, map, or slice.
;;       - What about T{a: 1}? It could be map or struct.
;;       - What about T{1, 2}? It could be struct, array, or slice.
;;     Cursorless only has syntactic information available to it.
;;
;;   * The user might not know the type either. With a named type, the type definition might be far away.
;;     Or it might just be offscreen. Either way, the user needs to be able to make a decision about
;;     what scope to use using only locally available, syntactic information.
;;     Note that this also means that has-a predicates work better than has-no predicates.
;;     The user can locally confirm that there is a keyed element.
;;     She cannot confirm locally that there is no keyed element; it might just not be visible.
;;
;; Combining all these constraints suggests the following simple rules:
;;
;;   * If there is a keyed element present, then it is a map.
;;   * If there is a non-keyed element present, then it is a list.
;;   * If there are both or neither, then it is both a map and a list.
;; Conveniently, this is also simple to implement.
;;
;; This guarantees that a user always knows how to refer to any composite literal.
;; There are cases in which being overgenerous in matching is not ideal,
;; but they are rarer, so let's optimize for the common case.
;; Mixed keyed and non-keyed elements are also rare in practice.
;; The main ambiguity is with {}, but there's little we can do about that.
;;
;; Go users also expect that the map and list scopes will include the type definition,
;; as well as any & before the type. (Strictly speaking it is not part of the literal,
;; but that's not how most humans think about it.)
;;
;; If you are considering changing the map and list scopes, here is a list of sample literals to consider.
;; Many of these are also covered by the tests, but it is helpful to have it all written down
;; in one place for unified consideration.
;;
;; T{}
;; T{1}
;; T{1, 2}
;; T{1: 1}
;; T{a: 1}
;; T{"a": 1}
;; T{"a": 1, 1: 1}
;; T{{}}
;; T{{1}}
;; T{{a: 1}}
;; T{{1}, {a: 1}}
;; T{{1}, {}, {a: 1}}
;; &T{}
;; &T{1}
;; &T{a: 1}
;; &T{1: 1}
;;
;; (Remember in all of these that types can be `any`, `a` might be a variable name or a struct field,
;; 1 might be a map key or an array/slice index, etc. There's a remarkable number of possibilities.)

;; maps

;; &T{a: 1}
(unary_expression
  operator: "&"
  (composite_literal body: (literal_value (keyed_element)))
) @map

;; T{a: 1}
(
  (composite_literal body: (literal_value (keyed_element))) @_comp_lit
  (#not-parent-type? @_comp_lit unary_expression)
) @map

;; {a: 1}
(
  (literal_value (keyed_element)) @_lit_val
  (#not-parent-type? @_lit_val composite_literal)
) @map

;; lists

;; &T{1}
(unary_expression
  operator: "&"
  (composite_literal body: (literal_value (literal_element)))
) @list

;; T{1}
(
  (composite_literal body: (literal_value (literal_element))) @_comp_lit
  (#not-parent-type? @_comp_lit unary_expression)
) @list

;; {1}
(
  (literal_value (literal_element)) @_lit_elem
  (#not-parent-type? @_lit_elem composite_literal)
) @list

;; empty composite literals

;; &T{}
(unary_expression
  operator: "&"
  (composite_literal body: (literal_value . "{" . "}" . ))
) @list @map

;; T{}
(
  (composite_literal body: (literal_value . "{" . "}" . )) @_comp_lit
  (#not-parent-type? @_comp_lit unary_expression)
) @list @map

;; {}
(
  (literal_value . "{" . "}" . ) @_lit_elem
  (#not-parent-type? @_lit_elem composite_literal)
) @list @map

;; keys
;; this has the identical structure to values within a map (see below)
;; it is separated out because it is easier to reason about
;; and because treesitter queries limit you to three class names per node
(literal_value
  ["," "{"] @collectionKey.leading.start.after
  .
  (keyed_element
    (_) @collectionKey @collectionKey.leading.end.before @collectionKey.trailing.start.after
    ":"
    (_) @collectionKey.trailing.end.before
  ) @collectionKey.domain
  .
  ["," "}"]
) @collectionKey.iteration

;; values within a map
;; see comment about keys (above)
(literal_value
  ["," "{"]
  .
  (keyed_element
    (_) @value.leading.start.after
    ":"
    (_) @value @value.leading.end.before @value.trailing.start.after
  ) @value.domain
  .
  ["," "}"] @value.trailing.end.before
) @value.iteration

;; values within a list
(literal_value (literal_element) @value) @value.iteration 

;; values within a return statement
(return_statement (expression_list) @value) @value.domain
