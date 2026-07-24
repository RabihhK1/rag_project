export function responseRootId(message) {
  return (
    message.root_message_id || message.response_group_id || message.message_id
  );
}

export function responseVersions(message) {
  const rootMessageId = responseRootId(message);
  const rawVersions =
    Array.isArray(message.versions) && message.versions.length
      ? message.versions
      : [message];

  return rawVersions.map((version, index) => ({
    message_id: version.message_id || message.message_id,
    root_message_id: version.root_message_id || rootMessageId,
    content: version.content ?? message.content ?? "",
    sources: version.sources ?? message.sources ?? [],
    feedback: Object.hasOwn(version, "feedback")
      ? version.feedback
      : (message.feedback ?? null),
    version_number: version.version_number ?? index + 1,
  }));
}

export function selectResponseVersion(message, requestedIndex) {
  const versions = responseVersions(message);
  const matchingIndex = versions.findIndex(
    (version) => version.message_id === message.message_id,
  );
  const selectedIndex = Number.isInteger(requestedIndex)
    ? requestedIndex
    : matchingIndex >= 0
      ? matchingIndex
      : 0;
  const boundedIndex = Math.min(
    Math.max(selectedIndex, 0),
    versions.length - 1,
  );
  const selected = versions[boundedIndex];

  return {
    ...message,
    message_id: selected.message_id,
    root_message_id: selected.root_message_id || responseRootId(message),
    content: selected.content,
    sources: selected.sources,
    feedback: selected.feedback,
    version_number: selected.version_number,
    selected_version_index: boundedIndex,
    versions,
  };
}

export function normaliseAssistantMessage(message) {
  if (
    message.role !== "assistant" ||
    !message.message_id ||
    message.message_id === "welcome"
  ) {
    return message;
  }

  const versions = responseVersions(message);
  const currentIndex = versions.findIndex(
    (version) => version.message_id === message.message_id,
  );
  const requestedIndex =
    currentIndex >= 0 ? currentIndex : message.selected_version_index;

  return selectResponseVersion(
    {
      ...message,
      root_message_id: responseRootId(message),
      versions,
    },
    requestedIndex,
  );
}

export function isSameResponseSlot(message, rootMessageId) {
  return (
    message.role === "assistant" && responseRootId(message) === rootMessageId
  );
}
