from dataclasses import dataclass
from typing import Any, Optional

from talon import Module, app

from .csv_overrides import init_csv_and_watch_changes
from .targets.target_types import (
    CursorlessDestination,
    CursorlessTarget,
    ImplicitDestination,
)


@dataclass
class InsertionSnippet:
    name: str
    destination: CursorlessDestination


mod = Module()

mod.list("cursorless_insert_snippet_action", desc="Cursorless insert snippet action")

# Deprecated tag; we should probably remove this and notify users that they
# should get rid of it, but I don't think it's worth the effort right now
mod.tag(
    "cursorless_experimental_snippets",
    desc="tag for enabling experimental snippet support",
)

mod.list("cursorless_wrapper_snippet", desc="Cursorless wrapper snippet")
mod.list(
    "cursorless_insertion_snippet_no_phrase",
    desc="Cursorless insertion snippets that don't accept a phrase",
)
mod.list(
    "cursorless_insertion_snippet_single_phrase",
    desc="Cursorless insertion snippet that can accept a single phrase",
)
mod.list("cursorless_phrase_terminator", "Contains term used to terminate a phrase")


@mod.capture(
    rule="({user.cursorless_insertion_snippet_no_phrase} | {user.cursorless_insertion_snippet_single_phrase}) [<user.cursorless_destination>]"
)
def cursorless_insertion_snippet(m) -> InsertionSnippet:
    try:
        name = m.cursorless_insertion_snippet_no_phrase
    except AttributeError:
        name = m.cursorless_insertion_snippet_single_phrase.split(".")[0]

    try:
        destination = m.cursorless_destination
    except AttributeError:
        destination = ImplicitDestination()

    return InsertionSnippet(name, destination)


# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
wrapper_snippets = {
    "else": "ifElseStatement.alternative",
    "funk": "functionDeclaration.body",
    "if else": "ifElseStatement.consequence",
    "if": "ifStatement.consequence",
    "try": "tryCatchStatement.body",
    "link": "link.text",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
insertion_snippets_no_phrase = {
    "if": "ifStatement",
    "if else": "ifElseStatement",
    "try": "tryCatchStatement",
}

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
insertion_snippets_single_phrase = {
    "funk": "functionDeclaration.name",
    "link": "link.text",
}


def wrap_with_snippet(snippet_description: dict, target: CursorlessTarget):
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "wrapWithSnippet",
            "snippetDescription": snippet_description,
            "target": target,
        },
    )


def insert_snippet(snippet_description: dict, destination: CursorlessDestination):
    actions.user.private_cursorless_command_and_wait(
        {
            "name": "insertSnippet",
            "snippetDescription": snippet_description,
            "destination": destination,
        },
    )


def insert_named_snippet(
    name: str, destination: CursorlessDestination, substitutions: Optional[dict]
):
    insert_snippet(
        {
            "type": "named",
            "name": name,
            "substitutions": substitutions,
        },
        destination,
    )


def insert_custom_snippet(body: str, destination: CursorlessDestination):
    insert_snippet(
        {
            "type": "custom",
            "body": body,
        },
        destination,
    )


@mod.action_class
class Actions:
    def private_cursorless_insert_snippet(insertion_snippet: InsertionSnippet):
        """Execute Cursorless insert snippet action"""
        insert_named_snippet(
            insertion_snippet.name,
            insertion_snippet.destination,
        )

    def private_cursorless_insert_snippet_with_phrase(
        snippet_description: str, text: str
    ):
        """Cursorless: Insert snippet <snippet_description> with phrase <text>"""
        snippet_name, snippet_variable = snippet_description.split(".")
        insert_named_snippet(
            snippet_name,
            ImplicitDestination(),
            {snippet_variable: text},
        )

    def cursorless_insert_snippet_by_name(name: str):
        """Cursorless: Insert named snippet <name>"""
        insert_named_snippet(
            snippet_name,
            ImplicitDestination(),
        )

    def cursorless_insert_snippet(body: str):
        """Cursorless: Insert custom snippet <body>"""
        insert_custom_snippet(
            body,
            ImplicitDestination(),
        )

    def cursorless_wrap_with_snippet_by_name(
        name: str, variable_name: str, target: CursorlessTarget
    ):
        """Cursorless: Wrap target with a named snippet <name>"""
        wrap_with_snippet(
            {
                "type": "named",
                "name": name,
                "variableName": variable_name,
            },
            target,
        )

    def cursorless_wrap_with_snippet(
        body: str,
        target: CursorlessTarget,
        variable_name: Optional[str] = None,
        scope: Optional[str] = None,
    ):
        """Cursorless: Wrap target with custom snippet <body>"""
        snippet_arg: dict[str, Any] = {
            "type": "custom",
            "body": body,
        }
        if scope is not None:
            snippet_arg["scopeType"] = {"type": scope}
        if variable_name is not None:
            snippet_arg["variableName"] = variable_name
        wrap_with_snippet(
            snippet_arg,
            target,
        )


def on_ready():
    init_csv_and_watch_changes(
        "experimental/wrapper_snippets",
        {
            "wrapper_snippet": wrapper_snippets,
        },
        allow_unknown_values=True,
        default_list_name="wrapper_snippet",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets",
        {
            "insertion_snippet_no_phrase": insertion_snippets_no_phrase,
        },
        allow_unknown_values=True,
        default_list_name="insertion_snippet_no_phrase",
    )
    init_csv_and_watch_changes(
        "experimental/insertion_snippets_single_phrase",
        {
            "insertion_snippet_single_phrase": insertion_snippets_single_phrase,
        },
        allow_unknown_values=True,
        default_list_name="insertion_snippet_single_phrase",
    )
    init_csv_and_watch_changes(
        "experimental/miscellaneous",
        {
            "phrase_terminator": {"over": "phraseTerminator"},
        },
    )


app.register("ready", on_ready)
