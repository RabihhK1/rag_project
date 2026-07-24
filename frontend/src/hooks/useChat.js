import { useEffect, useRef, useState } from "react";
import { requestApi } from "../services/api";
import { getConversationMessages } from "../services/conversationService";


const initialMessage = {
    role: "assistant",
    message_id: "welcome",
    conversation_id: null,
    content: "Hello, I am your cybersecurity assistant. Ask me anything about CIS Controls.",
    sources: [],
    feedback: null,
};


function responseRootId(message) {
    return (
        message.root_message_id ||
        message.response_group_id ||
        message.message_id
    );
}


function responseVersions(message) {
    const rootMessageId = responseRootId(message);
    const rawVersions = Array.isArray(message.versions) && message.versions.length
        ? message.versions
        : [message];

    return rawVersions.map((version, index) => ({
        message_id: version.message_id || message.message_id,
        root_message_id: version.root_message_id || rootMessageId,
        content: version.content ?? message.content ?? "",
        sources: version.sources ?? message.sources ?? [],
        feedback: Object.hasOwn(version, "feedback")
            ? version.feedback
            : message.feedback ?? null,
        version_number: version.version_number ?? index + 1,
    }));
}


function selectVersion(message, requestedIndex) {
    const versions = responseVersions(message);
    const matchingIndex = versions.findIndex(
        (version) => version.message_id === message.message_id
    );
    const selectedIndex = Number.isInteger(requestedIndex)
        ? requestedIndex
        : matchingIndex >= 0
            ? matchingIndex
            : 0;
    const boundedIndex = Math.min(
        Math.max(selectedIndex, 0),
        versions.length - 1
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


function normaliseAssistantMessage(message) {
    if (message.role !== "assistant" || !message.message_id || message.message_id === "welcome") {
        return message;
    }

    const versions = responseVersions(message);
    const currentIndex = versions.findIndex(
        (version) => version.message_id === message.message_id
    );
    const requestedIndex = currentIndex >= 0
        ? currentIndex
        : message.selected_version_index;

    return selectVersion(
        {
            ...message,
            root_message_id: responseRootId(message),
            versions,
        },
        requestedIndex
    );
}


function isSameResponseSlot(message, rootMessageId) {
    return (
        message.role === "assistant" &&
        responseRootId(message) === rootMessageId
    );
}


async function readSseEvents(response, onEvent) {
    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("Streaming response is unavailable.");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    const processEvent = (block) => {
        const data = block
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n")
            .trim();

        if (!data || data === "[DONE]") {
            return;
        }

        let event;
        try {
            event = JSON.parse(data);
        } catch {
            // Ignore malformed/incomplete server-sent events and continue the stream.
            return;
        }

        onEvent(event);
    };

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? "";
        blocks.forEach(processEvent);
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
        processEvent(buffer);
    }
}


function useChat() {
    const [messages, setMessages] = useState([initialMessage]);
    const [conversationId, setConversationId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [regeneratingFor, setRegeneratingFor] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [toast, setToast] = useState(null);
    const toastTimer = useRef(null);

    useEffect(() => () => {
        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }
    }, []);

    function refreshConversations() {
        setRefreshKey((previous) => previous + 1);
    }

    function showToast(message, type = "error") {
        setToast({ message, type });

        if (toastTimer.current) {
            clearTimeout(toastTimer.current);
        }

        toastTimer.current = setTimeout(() => {
            setToast(null);
        }, 4000);
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
                    setMessages((previous) => previous.map((message) => (
                        message.message_id === assistantTempId
                            ? { ...message, content: message.content + event.content }
                            : message
                    )));
                }

                if (event.type === "done") {
                    setConversationId(event.conversation_id);
                    setMessages((previous) => previous.map((message) => {
                        if (message.message_id !== assistantTempId) {
                            return message;
                        }

                        return normaliseAssistantMessage({
                            ...message,
                            message_id: event.message_id,
                            root_message_id: event.root_message_id || event.message_id,
                            sources: event.sources || [],
                            version_number: event.version_number || 1,
                            isStreaming: false,
                        });
                    }));
                    refreshConversations();
                }
            });
        } catch {
            showToast("Backend server unavailable. Please check the connection.", "error");
            setMessages((previous) => previous.map((message) => (
                message.message_id === assistantTempId
                    ? {
                        ...message,
                        message_id: null,
                        content: "⚠ Unable to connect to the AI server.",
                        isStreaming: false,
                    }
                    : message
            )));
        } finally {
            setLoading(false);
        }
    }

    async function loadConversation(id) {
        if (loading) {
            showToast("Please wait for the current response to finish.", "error");
            return;
        }

        setLoading(true);
        try {
            const data = await getConversationMessages(id);
            setMessages(data.map((message) => normaliseAssistantMessage({
                ...message,
                conversation_id: id,
            })));
            setConversationId(id);
        } catch {
            showToast("Failed loading conversation.", "error");
        } finally {
            setLoading(false);
        }
    }

    function selectResponseVersion(rootMessageId, versionIndex) {
        setMessages((previous) => previous.map((message) => (
            isSameResponseSlot(message, rootMessageId)
                ? selectVersion(message, versionIndex)
                : message
        )));
    }

    function updateMessageFeedback(messageId, rating) {
        setMessages((previous) => previous.map((message) => {
            if (message.role !== "assistant") {
                return message;
            }

            const versions = responseVersions(message).map((version) => (
                version.message_id === messageId
                    ? { ...version, feedback: rating }
                    : version
            ));

            return {
                ...message,
                feedback: message.message_id === messageId
                    ? rating
                    : message.feedback,
                versions,
            };
        }));
    }

    async function regenerateMessage(messageId, requestedConversationId) {
        if (loading || !messageId || !requestedConversationId) {
            return;
        }

        const responseSlot = messages.find((message) => (
            message.role === "assistant" &&
            (
                message.message_id === messageId ||
                responseRootId(message) === messageId ||
                responseVersions(message).some((version) => version.message_id === messageId)
            )
        ));

        if (!responseSlot) {
            showToast("That response is no longer available to regenerate.", "error");
            return;
        }

        const previousSlot = normaliseAssistantMessage(responseSlot);
        const rootMessageId = responseRootId(previousSlot);
        let streamedSources = previousSlot.sources || [];
        let generatedContent = "";
        let completed = false;

        setLoading(true);
        setRegeneratingFor(rootMessageId);
        setMessages((previous) => previous.map((message) => (
            isSameResponseSlot(message, rootMessageId)
                ? { ...normaliseAssistantMessage(message), isRegenerating: true }
                : message
        )));

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
                    setMessages((previous) => previous.map((message) => (
                        isSameResponseSlot(message, rootMessageId)
                            ? { ...message, sources: streamedSources }
                            : message
                    )));
                }

                if (event.type === "token") {
                    generatedContent += event.content;
                    setMessages((previous) => previous.map((message) => {
                        if (!isSameResponseSlot(message, rootMessageId)) {
                            return message;
                        }

                        return { ...message, content: generatedContent };
                    }));
                }

                if (event.type === "done") {
                    completed = true;
                    setMessages((previous) => previous.map((message) => {
                        if (!isSameResponseSlot(message, rootMessageId)) {
                            return message;
                        }

                        const versions = responseVersions(message).filter(
                            (version) => version.message_id !== event.message_id
                        );
                        const nextVersion = {
                            message_id: event.message_id,
                            root_message_id: event.root_message_id || rootMessageId,
                            content: generatedContent,
                            sources: event.sources || streamedSources,
                            feedback: null,
                            version_number: event.version_number || versions.length + 1,
                        };

                        return selectVersion(
                            {
                                ...message,
                                root_message_id: nextVersion.root_message_id,
                                isRegenerating: false,
                                versions: [...versions, nextVersion],
                            },
                            versions.length
                        );
                    }));
                    refreshConversations();
                }
            });

            if (!completed) {
                throw new Error("Regeneration ended before a response was created.");
            }
        } catch (error) {
            showToast(error.message || "Failed to regenerate response.", "error");
            setMessages((previous) => previous.map((message) => (
                isSameResponseSlot(message, rootMessageId)
                    ? { ...previousSlot, isRegenerating: false }
                    : message
            )));
        } finally {
            setLoading(false);
            setRegeneratingFor(null);
        }
    }

    function newChat() {
        if (loading) {
            showToast("Please wait for the current response to finish.", "error");
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
