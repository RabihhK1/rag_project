import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";


function MessageList({
    messages,
    regenerateMessage,
    regeneratingFor,
    selectResponseVersion,
    onFeedbackSubmitted,
}) {
    const bottomRef = useRef(null);
    const previousMessageCount = useRef(messages.length);

    useEffect(() => {
        const latestMessage = messages.at(-1);
        const appendedMessage = messages.length > previousMessageCount.current;

        // Follow the newest streamed response, but do not jump to the bottom
        // when regenerating an older reply in place.
        if (appendedMessage || latestMessage?.isStreaming) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        previousMessageCount.current = messages.length;
    }, [messages]);

    return (
        <div className="messages">
            {messages.map((message, index) => (
                <MessageBubble
                    key={message.root_message_id || message.message_id || index}
                    message={message}
                    onRegenerate={regenerateMessage}
                    regeneratingFor={regeneratingFor}
                    onSelectVersion={selectResponseVersion}
                    onFeedbackSubmitted={onFeedbackSubmitted}
                />
            ))}

            <div ref={bottomRef} />
        </div>
    );
}


export default MessageList;
