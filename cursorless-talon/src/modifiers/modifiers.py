from talon import Module, app

from ..csv_overrides import init_csv_and_watch_changes
from .head_tail import head_tail_modifiers
from .interior import interior_modifiers
from .range_type import range_types

mod = Module()

# NOTE: Please do not change these dicts.  Use the CSVs for customization.
# See https://www.cursorless.org/docs/user/customization/
simple_modifiers = {
    "bounds": "excludeInterior",
    "just": "toRawSelection",
    "leading": "leading",
    "trailing": "trailing",
}

mod.list(
    "cursorless_simple_modifier",
    desc="Simple cursorless modifiers that only need to specify their type",
)


@mod.capture(rule="{user.cursorless_simple_modifier}")
def cursorless_simple_modifier(m) -> dict[str, str]:
    """Simple cursorless modifiers that only need to specify their type"""
    return {
        "type": m.cursorless_simple_modifier,
    }

# These are all modifiers that can be trailing head/tail modifier. Interior excluded.
head_tail_trailing_modifiers = [
    "<user.cursorless_simple_modifier>",  # bounds, just, leading, trailing
    "<user.cursorless_containing_scope>",  # funk, state, class
    "<user.cursorless_subtoken_scope>",  # first past second word
    "<user.cursorless_surrounding_pair>",  # matching/pair [curly, round]
]

modifiers = [
    "<user.cursorless_position>",  # before, end of
    "<user.cursorless_interior_modifier>",  # inside
    "<user.cursorless_head_tail_modifier>",  # head, tail
    *head_tail_trailing_modifiers
]


@mod.capture(rule="|".join(modifiers))
def cursorless_modifier(m) -> str:
    """Cursorless modifier"""
    return m[0]


def on_ready():
    init_csv_and_watch_changes(
        "modifiers",
        {
            "simple_modifier": simple_modifiers,
            "interior_modifier": interior_modifiers,
            "head_tail_modifier": head_tail_modifiers,
            "range_type": range_types,
        },
    )


app.register("ready", on_ready)
