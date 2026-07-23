import { useState } from "react";

function ChatInput({
  sendMessage,
  loading
}) {

  const [text, setText] = useState("");


  function submit() {

    if (!text.trim() || loading)
      return;


    sendMessage(text);

    setText("");

  }


  return (

    <div className="input-area">

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