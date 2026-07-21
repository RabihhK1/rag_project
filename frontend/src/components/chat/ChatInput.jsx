import { useState } from "react";


function ChatInput({ sendMessage }) {

    const [text, setText] = useState("");


    function submit() {

        if (!text.trim()) return;

        sendMessage(text);

        setText("");

    }


    return (

        <div className="input-area">

            <input

                value={text}

                onChange={(e) => setText(e.target.value)}

                onKeyDown={(e) => {

                    if (e.key === "Enter") {

                        submit();

                    }

                }}

                placeholder="Ask about CIS Controls..."

            />


            <button
                className="send"
                onClick={submit}
            >
                Send
            </button>


        </div>

    );

}


export default ChatInput;