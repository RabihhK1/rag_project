import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function MessageList({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <MessageBubble
          key={index}
          message={message}
        />
      ))}

      {loading && (
        <div className="message assistant">
          <div className="bubble typing">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      )}

      <div ref={bottomRef}></div>
    </div>
  );
}

export default MessageList;