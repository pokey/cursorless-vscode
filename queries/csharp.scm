(if_statement) @ifStatement
(class_declaration
name: (identifier) @className) @class
(
  (string_literal) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)
(comment) @comment @textFragment
