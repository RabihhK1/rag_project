import { useState } from "react";


const API = "http://127.0.0.1:8000";



const initialMessage = {

    role: "assistant",

    content:
    "Hello, I am your cybersecurity assistant. Ask me anything about CIS Controls.",

    sources: []

};





function useChat(){



const [messages,setMessages] = useState([
    initialMessage
]);



const [conversationId,setConversationId] = useState(null);



const [loading,setLoading] = useState(false);



const [refreshKey,setRefreshKey] = useState(0);





function refreshConversations(){

    setRefreshKey(prev => prev + 1);

}







async function sendMessage(text){


    if(loading)
        return;



    setMessages(prev => [

        ...prev,

        {

            role:"user",

            content:text,

            sources:[]

        }

    ]);



    setLoading(true);




    try{


        const response = await fetch(

            `${API}/chat`,

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },


                body:JSON.stringify({

                    message:text,

                    conversation_id:conversationId

                })

            }

        );




        const data = await response.json();




        if(data.conversation_id){

            setConversationId(
                data.conversation_id
            );

        }






        setMessages(prev => [

            ...prev,


            {

                role:"assistant",

                content:data.answer,

                sources:data.sources || []

            }

        ]);




        // refresh sidebar chats

        refreshConversations();



    }

    catch(error){



        console.error(error);



        setMessages(prev => [

            ...prev,


            {

                role:"assistant",

                content:
                "Backend connection failed.",

                sources:[]

            }

        ]);

    }



    setLoading(false);


}









async function loadConversation(id){


    try{


        const response = await fetch(

            `${API}/conversations/${id}/messages`

        );



        const data = await response.json();




        setMessages(data);



        setConversationId(id);



    }


    catch(error){


        console.error(
            "Failed loading conversation:",
            error
        );


    }


}










function newChat(){


    setMessages([

        initialMessage

    ]);



    setConversationId(null);



}








return {


    messages,


    sendMessage,


    loading,


    newChat,


    loadConversation,


    refreshConversations,


    refreshKey



};


}



export default useChat;