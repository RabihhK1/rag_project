"""Helpers for treating regenerated assistant answers as one chat turn."""

from collections import defaultdict
from typing import Any


AssistantMessage = dict[str, Any]


def get_root_message_id(
    message: AssistantMessage,
    messages_by_id: dict[str, AssistantMessage],
) -> str:
    """Return the stable v1 id for a response, including legacy chains."""

    root_message_id = (
        message.get("root_message_id")
        or message.get("response_group_id")
    )
    if root_message_id:
        return root_message_id

    current = message
    visited: set[str] = set()

    while current:
        current_id = current.get("message_id")
        if not current_id or current_id in visited:
            return message["message_id"]

        visited.add(current_id)
        parent_message_id = current.get("parent_message_id")

        if not parent_message_id:
            return current_id

        if parent_message_id in visited:
            return current_id

        parent = messages_by_id.get(parent_message_id)
        if parent is None:
            # The parent may have been excluded from the current query, but it
            # is still the best stable group id we have.
            return parent_message_id

        current = parent

    return message["message_id"]


def _version_number(message: AssistantMessage) -> int:
    try:
        return int(message.get("version_number", 0))
    except (TypeError, ValueError):
        return 0


def _created_at_timestamp(message: AssistantMessage) -> float:
    created_at = message.get("created_at")
    try:
        return created_at.timestamp()
    except (AttributeError, OSError, OverflowError, ValueError):
        return 0


def order_response_versions(
    versions: list[AssistantMessage],
    root_message_id: str,
) -> list[AssistantMessage]:
    """Order v1 first, followed by later versions and a time tiebreaker."""

    return sorted(
        versions,
        key=lambda message: (
            0 if message.get("message_id") == root_message_id else 1,
            _version_number(message),
            _created_at_timestamp(message),
        ),
    )


def group_assistant_messages(
    messages: list[AssistantMessage],
) -> dict[str, list[AssistantMessage]]:
    """Group assistant documents by their original answer id."""

    assistants = [message for message in messages if message.get("role") == "assistant"]
    messages_by_id = {
        message["message_id"]: message
        for message in assistants
        if message.get("message_id")
    }
    groups: dict[str, list[AssistantMessage]] = defaultdict(list)

    for message in assistants:
        root_message_id = get_root_message_id(message, messages_by_id)
        groups[root_message_id].append(message)

    return {
        root_message_id: order_response_versions(versions, root_message_id)
        for root_message_id, versions in groups.items()
    }
