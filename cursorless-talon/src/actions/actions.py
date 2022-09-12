from talon import Module, actions, app

from ..csv_overrides import init_csv_and_watch_changes
from .actions_callback import callback_action_defaults, callback_action_map
from .actions_custom import custom_action_defaults
from .actions_simple import (
    no_wait_actions,
    no_wait_actions_post_sleep,
    positional_action_defaults,
    simple_action_defaults,
)

mod = Module()


@mod.capture(
    rule=(
        "{user.cursorless_simple_action} |"
        "{user.cursorless_callback_action} |"
        "{user.cursorless_custom_action}"
    )
)
def cursorless_action_or_vscode_command(m) -> dict:
    try:
        value = m.cursorless_custom_action
        type = "vscode_command"
    except AttributeError:
        value = m[0]
        type = "cursorless_action"
    return {
        "value": value,
        "type": type,
    }


@mod.action_class
class Actions:
    def cursorless_command(action_id: str, target: dict):
        """Perform cursorless command on target"""
        if action_id in callback_action_map:
            return callback_action_map[action_id](target)
        elif action_id in no_wait_actions:
            actions.user.cursorless_single_target_command_no_wait(action_id, target)
            if action_id in no_wait_actions_post_sleep:
                actions.sleep(no_wait_actions_post_sleep[action_id])
        else:
            return actions.user.cursorless_single_target_command(action_id, target)

    def cursorless_vscode_command(command_id: str, target: dict):
        """Perform vscode command on cursorless target"""
        return vscode_command(command_id, target)

    def cursorless_action_or_vscode_command(instruction: dict, target: dict):
        """Perform cursorless action or vscode command on target (internal use only)"""
        type = instruction["type"]
        value = instruction["value"]
        if type == "cursorless_action":
            return actions.user.cursorless_command(value, target)
        elif type == "vscode_command":
            return actions.user.cursorless_vscode_command(value, target)


def vscode_command(command_id: str, target: dict, command_options: dict = {}):
    return actions.user.cursorless_single_target_command(
        "executeCommand", target, command_id, command_options
    )


def vscode_command_no_wait(command_id: str, target: dict, command_options: dict = {}):
    return actions.user.cursorless_single_target_command_no_wait(
        "executeCommand", target, command_id, command_options
    )


default_values = {
    "simple_action": simple_action_defaults,
    "positional_action": positional_action_defaults,
    "callback_action": callback_action_defaults,
    "custom_action": custom_action_defaults,
    "swap_action": {"swap": "swapTargets"},
    "move_bring_action": {"bring": "replaceWithTarget", "move": "moveToTarget"},
    "wrap_action": {"wrap": "wrapWithPairedDelimiter", "repack": "rewrap"},
    "insert_snippet_action": {"snippet": "insertSnippet"},
    "reformat_action": {"format": "applyFormatter"},
}


ACTION_LIST_NAMES = default_values.keys()


def on_ready():
    init_csv_and_watch_changes("actions", default_values)


app.register("ready", on_ready)
