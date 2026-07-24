import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

function ChatWindow({
    messages,
    sendMessage,
    loading,
    regenerateMessage,
    regeneratingFor,
    selectResponseVersion,
    onFeedbackSubmitted,
}) {

    return (
        <div className="chat-window">

            <MessageList
                messages={messages}
                loading={loading}
                regenerateMessage={regenerateMessage}
                regeneratingFor={regeneratingFor}
                selectResponseVersion={selectResponseVersion}
                onFeedbackSubmitted={onFeedbackSubmitted}
            />

            <ChatInput
                sendMessage={sendMessage}
                loading={loading}
            />
        </div>
    );
}

export default ChatWindow;
