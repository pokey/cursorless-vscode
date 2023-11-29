;;!! <aaa>
;;!   ^^^
;;!  -----
(STag
    (Name) @name
) @_.domain

;;!! </aaa>
;;!    ^^^
;;!  ------
(ETag
    (Name) @name
) @_.domain

;;!! <aaa id="me">
;;!       ^^^^^^^
(Attribute) @attribute

;;!! <aaa id="me">
;;!       ^^ ^^^^
(Attribute
    (Name) @collectionKey @collectionKey.trailing.start.endOf @value.leading.start.endOf
    (AttValue) @value @collectionKey.trailing.end.startOf @value.leading.end.startOf
) @_.domain

;;!! <aaa>
;;!  ^^^^^
(STag) @attribute.iteration @collectionKey.iteration @value.iteration

;;!! <!-- comment -->
;;!  ^^^^^^^^^^^^^^^^
(Comment) @comment @textFragment

;;!! <aaa id="me">
;;!          ^^^^
(AttValue) @string @textFragment

;;!! <aaa>text</aaa>
;;!       ^^^^
(CharData) @textFragment

;;!! <aaa>text</aaa>
;;!  ^^^^^^^^^^^^^^^
;;!       ^^^^
(element
    (STag) @xmlElement.interior.start.endOf
    (ETag) @xmlElement.interior.end.startOf
) @xmlElement

;;!! <aaa>text</aaa>
;;!  ^^^^^    ^^^^^^
;;!  ---------------
(element
    (STag) @xmlStartTag
    (ETag) @xmlEndTag
) @_.domain

(element
    [
        (STag)
        (ETag)
    ] @xmlBothTags
    (#allow-multiple! @xmlBothTags)
) @_.domain

(element
    (STag) @xmlElement.iteration.start.endOf @xmlBothTags.iteration.start.endOf
    (content
        (element)
    )
    (ETag) @xmlElement.iteration.end.startOf @xmlBothTags.iteration.end.startOf
)
