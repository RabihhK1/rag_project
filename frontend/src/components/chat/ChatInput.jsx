import { useState } from "react";

function ChatInput({
  sendMessage,
  loading,
  welcomeMode = false,
  inputAreaRef,
}) {
  const [text, setText] = useState("");

  function submit() {
    if (!text.trim() || loading) return;

    sendMessage(text);

    setText("");
  }

  return (
    <form
      ref={inputAreaRef}
      className={`input-area${welcomeMode ? " input-area--welcome" : ""}`}
      data-tour="chat-input"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="chat-message">
        Ask a question about CIS Controls
      </label>

      <input
        id="chat-message"
        value={text}

        disabled={loading}

        onChange={(e) => setText(e.target.value)}

        placeholder={
          loading ? "AI is thinking..." : "Ask anything about CIS Controls..."
        }
      />

      <button
        className="send"

        type="submit"

        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;
