import { useState } from "react";

function ChatInput({
  sendMessage,
  loading,
  welcomeMode = false,
}) {

  const [text, setText] = useState("");


  function submit() {

    if (!text.trim() || loading)
      return;


    sendMessage(text);

    setText("");

  }


  return (

    <div
      className={`input-area${welcomeMode ? " input-area--welcome" : ""}`}
      data-tour="chat-input"
    >

      <input

        value={text}

        disabled={loading}

        onChange={(e) => setText(e.target.value)}

        onKeyDown={(e) => {

          if (e.key === "Enter")
            submit();

        }}

        placeholder={
          loading
            ? "AI is thinking..."
            : "Ask anything about CIS Controls..."
        }

      />


      <button

        className="send"

        disabled={loading}

        onClick={submit}

      >

        {loading ? "Thinking..." : "Send"}

      </button>


    </div>

  );

}

export default ChatInput;
