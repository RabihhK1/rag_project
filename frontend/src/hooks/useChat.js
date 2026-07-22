import { useState } from "react";


const API = "http://127.0.0.1:8000";



const initialMessage = {

    role: "assistant",

    message_id: "welcome",

    conversation_id: null,

    content:
        "Hello, I am your cybersecurity assistant. Ask me anything about CIS Controls.",

    sources: [],

    feedback: null

};





function useChat(){


    const [messages,setMessages] = useState(
        [
            initialMessage
        ]
    );


    const [conversationId,setConversationId] = useState(null);


    const [loading,setLoading] = useState(false);


    const [refreshKey,setRefreshKey] = useState(0);


    const [toast,setToast] = useState(null);






    function refreshConversations(){

        setRefreshKey(
            prev => prev + 1
        );

    }





    function showToast(
        message,
        type="error"
    ){


        setToast({

            message,

            type

        });



        setTimeout(()=>{

            setToast(null);

        },3000);


    }









    async function sendMessage(text){


        if(loading)
            return;



        setMessages(prev => [

            ...prev,

            {

                role:"user",

                content:text,

                sources:[],

                feedback:null

            }

        ]);



        setLoading(true);





        try{


            const response = await fetch(

                `${API}/chat/stream`,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "application/json"

                    },


                    body:JSON.stringify({

                        message:text,

                        conversation_id:
                            conversationId

                    })

                }

            );




            if(!response.ok){

                throw new Error(
                    "Streaming failed"
                );

            }





            const reader =
                response.body.getReader();


            const decoder =
                new TextDecoder();



            const assistantTempId =
                crypto.randomUUID();





            setMessages(prev => [


                ...prev,


                {

                    role:"assistant",

                    message_id:
                        assistantTempId,


                    conversation_id:
                        conversationId,


                    content:"",


                    sources:[],


                    feedback:null

                }


            ]);







            while(true){


                const {
                    value,
                    done
                } =
                await reader.read();




                if(done)
                    break;




                const chunk =
                    decoder.decode(
                        value,
                        {
                            stream:true
                        }
                    );




                const lines =
                    chunk.split("\n");





                for(const line of lines){


                    if(
                        !line.startsWith("data:")
                    )
                        continue;



                    const raw =
                        line
                        .replace(
                            "data:",
                            ""
                        )
                        .trim();





                    if(
                        raw === "[DONE]"
                    )
                        continue;





                    const event =
                        JSON.parse(raw);





                    if(
                        event.type === "token"
                    ){


                        setMessages(prev => {


                            const updated =
                                [...prev];


                            const index =
                                updated.findIndex(

                                    msg =>
                                    msg.message_id === assistantTempId

                                );



                            if(index !== -1){


                                updated[index] = {


                                    ...updated[index],


                                    content:

                                    updated[index].content
                                    +
                                    event.content


                                };


                            }



                            return updated;


                        });


                    }






                    if(
                        event.type === "done"
                    ){



                        setConversationId(
                            event.conversation_id
                        );



                        setMessages(prev => {


                            const updated =
                                [...prev];



                            const index =
                                updated.findIndex(

                                    msg =>
                                    msg.message_id === assistantTempId

                                );



                            if(index !== -1){


                                updated[index] = {


                                    ...updated[index],


                                    message_id:
                                        event.message_id,


                                    conversation_id:
                                        event.conversation_id,


                                    sources:
                                        event.sources || []


                                };


                            }



                            return updated;


                        });




                        refreshConversations();


                    }



                }



            }




        }


        catch(error){



            console.error(
                "Streaming error:",
                error
            );



            showToast(
                "Streaming connection failed"
            );



            setMessages(prev => [


                ...prev,


                {

                    role:"assistant",

                    message_id:null,

                    conversation_id:
                    conversationId,


                    content:
                    "Sorry, something went wrong while generating the response.",


                    sources:[],


                    feedback:null

                }


            ]);



        }





        setLoading(false);


    }









    async function loadConversation(id){


        try{


            const response =
                await fetch(

                    `${API}/conversations/${id}/messages`

                );



            const data =
                await response.json();





            setMessages(

                data.map(message => ({

                    ...message,

                    conversation_id:id

                }))

            );



            setConversationId(id);



        }



        catch(error){


            console.error(
                "Failed loading conversation:",
                error
            );


            showToast(
                "Failed loading conversation"
            );


        }


    }









    function newChat(){


        setMessages(

            [

                initialMessage

            ]

        );



        setConversationId(null);


    }








    return {


        messages,


        sendMessage,


        loading,


        newChat,


        loadConversation,


        refreshKey,


        refreshConversations,


        toast


    };


}



export default useChat;