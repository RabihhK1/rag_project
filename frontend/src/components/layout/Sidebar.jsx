import { forwardRef, useEffect, useState } from "react";
import {
    deleteConversation,
    getConversations,
    renameConversation,
} from "../../services/conversationService";


const Sidebar = forwardRef(function Sidebar(
    {
        newChat,
        loadConversation,
        refreshKey,
        openAnalytics,
        onConversationDeleted,
        loading,
    },
    ref,
) {
    const [conversations, setConversations] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;

        async function loadConversations() {
            try {
                const data = await getConversations();
                if (isCurrent) {
                    setConversations(data);
                    setError("");
                }
            } catch {
                if (isCurrent) {
                    setError("Could not load saved conversations.");
                }
            }
        }

        void loadConversations();
        return () => {
            isCurrent = false;
        };
    }, [refreshKey]);

    function startRenaming(conversation) {
        setEditingId(conversation.conversation_id);
        setTitle(conversation.title);
        setError("");
    }

    async function saveRename(conversationId) {
        const nextTitle = title.trim();
        if (!nextTitle) {
            setError("A conversation title cannot be empty.");
            return;
        }

        try {
            await renameConversation(conversationId, nextTitle);
            setConversations((current) => current.map((conversation) => (
                conversation.conversation_id === conversationId
                    ? { ...conversation, title: nextTitle }
                    : conversation
            )));
            setEditingId(null);
            setError("");
        } catch {
            setError("Could not rename this conversation. Please try again.");
        }
    }

    async function removeConversation(conversationId) {
        if (!window.confirm("Delete this conversation?")) {
            return;
        }

        try {
            await deleteConversation(conversationId);
            setConversations((current) => current.filter((conversation) => (
                conversation.conversation_id !== conversationId
            )));
            onConversationDeleted?.(conversationId);
            setError("");
        } catch {
            setError("Could not delete this conversation. Please try again.");
        }
    }

    function handleRenameKeyDown(event, conversationId) {
        if (event.key === "Enter") {
            void saveRename(conversationId);
        }

        if (event.key === "Escape") {
            setEditingId(null);
            setError("");
        }
    }

    return (
        <aside ref={ref} className="sidebar" data-tour="sidebar" aria-label="Conversation sidebar">
            <div className="logo">⚡ Cyber RAG</div>

            <button className="new-chat" type="button" onClick={newChat} disabled={loading}>
                + New Chat
            </button>

            <button className="analytics-button" type="button" onClick={openAnalytics}>
                📊 Feedback Analytics
            </button>

            <nav className="chat-history" aria-labelledby="chat-history-title">
                <h2 id="chat-history-title">Chats</h2>

                {error && <p className="sidebar-error" role="alert">{error}</p>}

                <ul className="chat-list">
                    {conversations.map((conversation) => (
                        <li className="chat-item" key={conversation.conversation_id}>
                            {editingId === conversation.conversation_id ? (
                                <input
                                    autoFocus
                                    aria-label="Conversation title"
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    onKeyDown={(event) => handleRenameKeyDown(
                                        event,
                                        conversation.conversation_id,
                                    )}
                                    onBlur={() => void saveRename(conversation.conversation_id)}
                                />
                            ) : (
                                <>
                                    <button
                                        className="chat-title"
                                        type="button"
                                        onClick={() => loadConversation(conversation.conversation_id)}
                                    >
                                        {conversation.title}
                                    </button>

                                    <button
                                        className="rename-btn"
                                        type="button"
                                        aria-label={`Rename ${conversation.title}`}
                                        onClick={() => startRenaming(conversation)}
                                    >
                                        ✏
                                    </button>

                                    <button
                                        className="delete-btn"
                                        type="button"
                                        aria-label={`Delete ${conversation.title}`}
                                        onClick={() => void removeConversation(conversation.conversation_id)}
                                        disabled={loading}
                                    >
                                        🗑
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">Cyber RAG</div>
        </aside>
    );
});


export default Sidebar;
