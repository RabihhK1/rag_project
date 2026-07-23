import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";



function MessageList({ messages }) {


    const bottomRef = useRef(null);




    useEffect(()=>{


        bottomRef.current?.scrollIntoView({

            behavior:"smooth"

        });


    },[messages]);





    return (

        <div className="messages">


            {
            messages.map((message,index)=>(


                <MessageBubble

                    key={
                        message.message_id || index
                    }

                    message={message}

                />


            ))
            }



            <div ref={bottomRef}></div>


        </div>

    );


}



export default MessageList;