import { useState } from "react";


export function useChat(){

    const [messages,setMessages] = useState([
        {
            role:"assistant",
            text:"Hello 👋 I am your RAG assistant. Ask me anything about the security documents."
        }
    ]);


    const [input,setInput] = useState("");

    const [loading,setLoading] = useState(false);



    const sendMessage = async()=>{

        if(!input.trim()) return;


        const userMessage={
            role:"user",
            text:input
        };


        setMessages(prev=>[
            ...prev,
            userMessage
        ]);


        setInput("");


        // temporary AI response
        setLoading(true);


        setTimeout(()=>{

            setMessages(prev=>[
                ...prev,
                {
                    role:"assistant",
                    text:"I received your question. Backend connection will be added next."
                }
            ]);

            setLoading(false);


        },1200);


    };


    return {

        messages,
        input,
        setInput,
        sendMessage,
        loading

    };

}