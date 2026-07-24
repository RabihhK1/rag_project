import { requestApi } from "../services/api";
import { readSseEvents } from "../services/sse";
import {
  isSameResponseSlot,
  normaliseAssistantMessage,
  responseRootId,
  responseVersions,
  selectResponseVersion,
} from "./responseVersions";

function findResponseSlot(messages, messageId) {
  return messages.find(
    (message) =>
      message.role === "assistant" &&
      (message.message_id === messageId ||
        responseRootId(message) === messageId ||
        responseVersions(message).some(
          (version) => version.message_id === messageId,
        )),
  );
}

export function createRegenerateMessage({
  loading,
  messages,
  refreshConversations,
  setLoading,
  setMessages,
  setRegeneratingFor,
  showToast,
}) {
  return async function regenerateMessage(messageId, requestedConversationId) {
    if (loading || !messageId || !requestedConversationId) {
      return;
    }

    const responseSlot = findResponseSlot(messages, messageId);
    if (!responseSlot) {
      showToast("That response is no longer available to regenerate.");
      return;
    }

    const previousSlot = normaliseAssistantMessage(responseSlot);
    const rootMessageId = responseRootId(previousSlot);
    let streamedSources = previousSlot.sources || [];
    let generatedContent = "";
    let completed = false;

    setLoading(true);
    setRegeneratingFor(rootMessageId);
    setMessages((previous) =>
      previous.map((message) =>
        isSameResponseSlot(message, rootMessageId)
          ? { ...normaliseAssistantMessage(message), isRegenerating: true }
          : message,
      ),
    );

    try {
      const response = await requestApi("/chat/regenerate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_id: messageId,
          conversation_id: requestedConversationId,
        }),
      });

      await readSseEvents(response, (event) => {
        if (event.type === "error") {
          throw new Error(event.content || "Regeneration failed.");
        }

        if (event.type === "sources") {
          streamedSources = event.sources || [];
          setMessages((previous) =>
            previous.map((message) =>
              isSameResponseSlot(message, rootMessageId)
                ? { ...message, sources: streamedSources }
                : message,
            ),
          );
        }

        if (event.type === "token") {
          generatedContent += event.content;
          setMessages((previous) =>
            previous.map((message) =>
              isSameResponseSlot(message, rootMessageId)
                ? { ...message, content: generatedContent }
                : message,
            ),
          );
        }

        if (event.type === "done") {
          completed = true;
          setMessages((previous) =>
            previous.map((message) => {
              if (!isSameResponseSlot(message, rootMessageId)) {
                return message;
              }

              const versions = responseVersions(message).filter(
                (version) => version.message_id !== event.message_id,
              );
              const nextVersion = {
                message_id: event.message_id,
                root_message_id: event.root_message_id || rootMessageId,
                content: generatedContent,
                sources: event.sources || streamedSources,
                feedback: null,
                version_number: event.version_number || versions.length + 1,
              };

              return selectResponseVersion(
                {
                  ...message,
                  root_message_id: nextVersion.root_message_id,
                  isRegenerating: false,
                  versions: [...versions, nextVersion],
                },
                versions.length,
              );
            }),
          );
          refreshConversations();
        }
      });

      if (!completed) {
        throw new Error("Regeneration ended before a response was created.");
      }
    } catch (error) {
      showToast(error.message || "Failed to regenerate response.");
      setMessages((previous) =>
        previous.map((message) =>
          isSameResponseSlot(message, rootMessageId)
            ? { ...previousSlot, isRegenerating: false }
            : message,
        ),
      );
    } finally {
      setLoading(false);
      setRegeneratingFor(null);
    }
  };
}
