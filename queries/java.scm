;; Generated by the following command:
;; > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-java/master/src/node-types.json | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
[
    (annotation_type_declaration)
    (class_declaration)
    (enum_declaration)
    (import_declaration)
    (interface_declaration)
    (module_declaration)
    (package_declaration)
    (assert_statement)
    (break_statement)
    (continue_statement)
    (declaration)
    (do_statement)
    (enhanced_for_statement)
    (expression_statement)
    (for_statement)
    (if_statement)
    (labeled_statement)
    (local_variable_declaration)
    (return_statement)
    (switch_expression)
    (synchronized_statement)
    (throw_statement)
    (try_statement)
    (try_with_resources_statement)
    (while_statement)
    (yield_statement)

    ;; exceptions
    ;; ";",
    ;; "block",
    (method_declaration)
    (constructor_declaration)
    (field_declaration)
] @statement

(class_declaration
    name: (_) @name @className
) @class @_.domain

;;!! void myFunk() {}
;;!  ^^^^^^^^^^^^^^^^
(method_declaration
    name: (_) @name @functionName
) @namedFunction @_.domain
(constructor_declaration
    name: (_) @name @functionName
) @namedFunction @_.domain

;;!! ((value) -> true)
;;!   ^^^^^^^^^^^^^^^
(lambda_expression) @anonymousFunction

;;!! if (value) {}
;;!  ^^^^^^^^^^^^^
(
    (if_statement) @ifStatement
    (#not-parent-type? @ifStatement "if_statement")
)

;;!! "string"
;;!  ^^^^^^^^
(string_literal) @string @textFragment

;;!! // comment
;;!  ^^^^^^^^^^
[
    (line_comment)
    (block_comment)
] @comment @textFragment

;;!! int[] values = {1, 2, 3};
;;!                 ^^^^^^^^^
(array_initializer) @list

;;!! List<String> value = new ArrayList() {{ add("a"); }};
;;!                                       ^^^^^^^^^^^^^^^
(object_creation_expression
    (class_body
        (block) @map
    )
)

;;!! foo(1);
;;!  ^^^^^^
;;!! new Foo(1);
;;!  ^^^^^^^^^^
;;!! super(1);
;;!  ^^^^^^^^
[
    (method_invocation)
    (object_creation_expression)
    (explicit_constructor_invocation)
] @functionCall

;;!! case "0": return "zero";
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^
;;!! case "0" -> "zero";
;;!  ^^^^^^^^^^^^^^^^^^^
[
    (switch_block_statement_group)
    (switch_rule)
] @branch

;;!! case "0": return "zero";
;;!       ^^^
;;!  ------------------------
(switch_block_statement_group
    (switch_label
        (_) @condition
    )
) @condition.domain

;;!! case "0" -> "zero";
;;!       ^^^
;;!  -------------------
(switch_rule
    (switch_label
        (_) @condition
    )
) @condition.domain

(switch_expression) @branch.iteration @condition.iteration

;;!! if () {}
;;!  ^^^^^^^^
(
    (if_statement
        "if" @branch.start @branch.removal.start
        condition: (_) @condition
        consequence: (block) @branch.end @branch.removal.end
        alternative: (if_statement)? @branch.removal.end.startOf
    ) @condition.domain
    (#not-parent-type? @condition.domain "if_statement")
    (#child-range! @condition 0 -1 true true)
)

;;!! else if () {}
;;!  ^^^^^^^^^^^^^
(if_statement
    "else" @branch.start @condition.domain.start
    alternative: (if_statement
        condition: (_) @condition
        consequence: (block) @branch.end @condition.domain.end
        (#child-range! @condition 0 -1 true true)
    )
)

;;!! else {}
;;!  ^^^^^^^
(if_statement
    "else" @branch.start
    alternative: (block) @branch.end
)

;;!! for (int i = 0; i < 5; ++i) {}
;;!                  ^^^^^
;;!  ------------------------------
(for_statement
    condition: (_) @condition
) @_.domain

;;!! while (value) {}
;;!         ^^^^^
;;!  ----------------
(while_statement
    condition: (_) @condition
    (#child-range! @condition 0 -1 true true)
) @_.domain

(do_statement
    condition: (_) @condition
    (#child-range! @condition 0 -1 true true)
) @_.domain

;;!! switch (value) {}
;;!          ^^^^^
;;!  -----------------
(switch_expression
    condition: (_) @switchStatementSubject
    (#child-range! @switchStatementSubject 0 -1 true true)
) @_.domain

;;!! true ? 1 : 2
(ternary_expression
    condition: (_) @condition
    consequence: (_) @branch
) @condition.domain
(ternary_expression
    alternative: (_) @branch
)

;;!! true ? 1 : 2
;;!  ^^^^^^^^^^^^
(ternary_expression) @branch.iteration

;;!! void myFunk(int value) {}
;;!                  ^^^^^
;;!  -------------------------
(formal_parameters
    (formal_parameter
        (identifier) @name
    ) @_.domain
) @_.iteration

;;!! int value = 0;
;;!      ^^^^^
;;!  --------------
(_
    (assignment_expression
        left: (_) @name
    ) @_.domain.start
    ";"? @_.domain.end
)

;;!! Map<String, String>
;;!     ^^^^^^^  ^^^^^^
(type_arguments
    (type_identifier) @type
)

;;!! List<String> list = value;
;;!  ^^^^^^^^^^^^
;;!  --------------------------
(local_variable_declaration
    type: (_) @type
) @_.domain

;;!! name = new ArrayList<String>();
;;!             ^^^^^^^^^^^^^^^^^
;;!         -----------------------
(object_creation_expression
    type: (_) @type
) @_.domain

;;!! name = new int[5];
;;!             ^^^
;;!         ----------
(array_creation_expression
    type: (_) @type
) @_.domain

;;!! void myFunk(int value) {}
;;!              ^^^
;;!              ---------
(formal_parameter
    type: (_) @type
) @_.domain

;;!! int size() {}
;;!  ^^^
;;!  -------------
(method_declaration
    type: (_) @type
) @_.domain

;;!! new test();
;;!  ^^^^^^^^
;;!  -----------
(_
    (object_creation_expression
        (argument_list) @functionCallee.end.startOf
    ) @functionCallee.start.startOf @_.domain.start
    ";"? @_.domain.end
)

;;!! new test().bar();
;;!  ^^^^^^^^^^^^^^
;;!  -----------------
(_
    (method_invocation
        (argument_list) @functionCallee.end.startOf
    ) @functionCallee.start.startOf @_.domain.start
    ";"? @_.domain.end
)

;;!! super();
;;!  ^^^^^
;;!  --------
(explicit_constructor_invocation
    (argument_list) @functionCallee.end.startOf
) @functionCallee.start.startOf @_.domain

;;!! for (int value : values) {}
;;!                   ^^^^^^
;;!  ---------------------------
(enhanced_for_statement
    type: (_) @type
    name: (_) @name
    value: (_) @value
) @_.domain

;;!! int value = 1;
;;!              ^
;;!           xxxx
;;!  --------------
(local_variable_declaration
    (variable_declarator
        name: (_) @name @value.removal.start.endOf
        value: (_)? @value @value.removal.end
    )
) @_.domain
(field_declaration
    (variable_declarator
        name: (_) @name @value.removal.start.endOf
        value: (_)? @value @value.removal.end
    )
) @_.domain

;;!! value = 1;
;;!          ^
;;!       xxxx
;;!  ----------
(_
    (assignment_expression
        left: (_) @value.removal.start.endOf
        right: (_) @value @value.removal.end
    ) @_.domain.start
    ";"? @_.domain.end
)

;;!! return value;
;;!         ^^^^^
;;!  -------------
(
    (return_statement) @value @_.domain
    (#child-range! @value 1 -2)
)
