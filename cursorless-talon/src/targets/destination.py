from typing import Union

from talon import Context, Module, actions

from .target_types import ListDestination, PrimitiveDestination

mod = Module()

mod.list("cursorless_insertion_mode_pos", desc="Cursorless insertion mode before/after")
mod.list("cursorless_insertion_mode_to", desc="Cursorless insertion mode to")
mod.tag(
    "cursorless_disable_legacy_destination",
    desc="Disabled the Cursorless legacy destination(to after) support",
)

ctx = Context()
ctx.matches = r"""
tag: user.cursorless_disable_legacy_destination
"""


# DEPRECATED @ 2023-08-01
@mod.capture(
    rule="([{user.cursorless_insertion_mode_to}] {user.cursorless_insertion_mode_pos}) | {user.cursorless_insertion_mode_to}"
)
def cursorless_insertion_mode(m) -> str:
    try:
        pos = m.cursorless_insertion_mode_pos
        if hasattr(m, "cursorless_insertion_mode_to"):
            actions.app.notify(
                "'to before' and 'to after' is deprecated. Please just say 'before' or 'after'"
            )
        return pos
    except AttributeError:
        return "to"


@ctx.capture(
    "user.cursorless_insertion_mode",
    rule="{user.cursorless_insertion_mode_pos} | {user.cursorless_insertion_mode_to}",
)
def cursorless_insertion_mode_ctx(m) -> str:
    try:
        return m.cursorless_insertion_mode_pos
    except AttributeError:
        return "to"


@mod.capture(
    rule=(
        "<user.cursorless_insertion_mode> <user.cursorless_target> "
        "({user.cursorless_list_connective} <user.cursorless_insertion_mode> <user.cursorless_target>)*"
    )
)
def cursorless_destination(m) -> Union[ListDestination, PrimitiveDestination]:
    destinations = [
        PrimitiveDestination(insertion_mode, target)
        for insertion_mode, target in zip(
            m.cursorless_insertion_mode_list, m.cursorless_target_list
        )
    ]

    if len(destinations) == 1:
        return destinations[0]

    return ListDestination(destinations)
