import { useEffect, useRef, useState } from "react";
import { requestApi } from "../services/api";
import { getConversationMessages } from "../services/conversationService";
import { readSseEvents } from "../services/sse";
import { createRegenerateMessage } from "../utils/createRegenerateMessage";
import {
  isSameResponseSlot,
  normaliseAssistantMessage,
  responseVersions,
  selectResponseVersion as selectVersion,
} from "../utils/responseVersions";

const initialMessage = {
  role: "assistant",
  message_id: "welcome",
  conversation_id: null,
  content:
    "Hello, I am your cybersecurity assistant. Ask me anything about CIS Controls.",
  sources: [],
  feedback: null,
};

function useChat() {
  const [messages, setMessages] = useState([initialMessage]);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regeneratingFor, setRegeneratingFor] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function refreshConversations() {
    setRefreshKey((previous) => previous + 1);
  }

  function showToast(message, type = "error") {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }

  async function sendMessage(text) {
    if (loading || !text.trim()) {
      return;
    }

    const assistantTempId = crypto.randomUUID();
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        client_id: crypto.randomUUID(),
        content: text,
        sources: [],
        feedback: null,
      },
      {
        role: "assistant",
        message_id: assistantTempId,
        root_message_id: assistantTempId,
        conversation_id: conversationId,
        content: "",
        sources: [],
        feedback: null,
        isStreaming: true,
      },
    ]);
    setLoading(true);

    try {
      const response = await requestApi("/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
        }),
      });

      await readSseEvents(response, (event) => {
        if (event.type === "token") {
          setMessages((previous) =>
            previous.map((message) =>
              message.message_id === assistantTempId
                ? { ...message, content: message.content + event.content }
                : message,
            ),
          );
        }

        if (event.type === "done") {
          setConversationId(event.conversation_id);
          setMessages((previous) =>
            previous.map((message) =>
              message.message_id !== assistantTempId
                ? message
                : normaliseAssistantMessage({
                    ...message,
                    message_id: event.message_id,
                    root_message_id: event.root_message_id || event.message_id,
                    conversation_id: event.conversation_id,
                    sources: event.sources || [],
                    version_number: event.version_number || 1,
                    isStreaming: false,
                  }),
            ),
          );
          refreshConversations();
        }
      });
    } catch {
      showToast("Backend server unavailable. Please check the connection.");
      setMessages((previous) =>
        previous.map((message) =>
          message.message_id === assistantTempId
            ? {
                ...message,
                message_id: null,
                content: "⚠ Unable to connect to the AI server.",
                isStreaming: false,
              }
            : message,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadConversation(id) {
    if (loading) {
      showToast("Please wait for the current response to finish.");
      return;
    }

    setLoading(true);
    try {
      const data = await getConversationMessages(id);
      setMessages(
        data.map((message) =>
          normaliseAssistantMessage({ ...message, conversation_id: id }),
        ),
      );
      setConversationId(id);
    } catch {
      showToast("Failed loading conversation.");
    } finally {
      setLoading(false);
    }
  }

  function selectResponseVersion(rootMessageId, versionIndex) {
    setMessages((previous) =>
      previous.map((message) =>
        isSameResponseSlot(message, rootMessageId)
          ? selectVersion(message, versionIndex)
          : message,
      ),
    );
  }

  function updateMessageFeedback(messageId, rating) {
    setMessages((previous) =>
      previous.map((message) => {
        if (message.role !== "assistant") {
          return message;
        }

        const versions = responseVersions(message).map((version) =>
          version.message_id === messageId
            ? { ...version, feedback: rating }
            : version,
        );

        return {
          ...message,
          feedback:
            message.message_id === messageId ? rating : message.feedback,
          versions,
        };
      }),
    );
  }

  function regenerateMessage(messageId, requestedConversationId) {
    return createRegenerateMessage({
      loading,
      messages,
      refreshConversations,
      setLoading,
      setMessages,
      setRegeneratingFor,
      showToast,
    })(messageId, requestedConversationId);
  }

  function newChat() {
    if (loading) {
      showToast("Please wait for the current response to finish.");
      return;
    }

    setMessages([initialMessage]);
    setConversationId(null);
    setRegeneratingFor(null);
  }

  function handleConversationDeleted(deletedConversationId) {
    if (conversationId !== deletedConversationId) {
      return;
    }

    setMessages([initialMessage]);
    setConversationId(null);
    setRegeneratingFor(null);
  }

  return {
    messages,
    sendMessage,
    loading,
    newChat,
    loadConversation,
    refreshKey,
    refreshConversations,
    toast,
    regenerateMessage,
    regeneratingFor,
    selectResponseVersion,
    updateMessageFeedback,
    handleConversationDeleted,
  };
}

export default useChat;
