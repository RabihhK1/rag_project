import { useState, useRef } from "react";


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



    const toastTimer = useRef(null);





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



        if(toastTimer.current){

            clearTimeout(
                toastTimer.current
            );

        }



        toastTimer.current =
            setTimeout(()=>{


                setToast(null);


            },4000);



    }









    async function sendMessage(text){



        if(
            loading ||
            !text.trim()
        )
            return;





        setMessages(prev=>[


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
                    "Backend request failed"
                );


            }






            const reader =
                response.body.getReader();



            const decoder =
                new TextDecoder();





            const assistantTempId =
                crypto.randomUUID();






            setMessages(prev=>[


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






                    let event;



                    try{


                        event =
                        JSON.parse(raw);


                    }


                    catch(error){


                        continue;


                    }







                    // TOKEN STREAM


                    if(
                        event.type === "token"
                    ){



                        setMessages(prev=>{


                            const updated =
                                [...prev];



                            const index =
                                updated.findIndex(


                                    msg=>
                                    msg.message_id === assistantTempId


                                );




                            if(index !== -1){



                                updated[index]={


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









                    // FINAL RESPONSE


                    if(
                        event.type === "done"
                    ){



                        setConversationId(

                            event.conversation_id

                        );





                        setMessages(prev=>{


                            const updated =
                                [...prev];



                            const index =
                                updated.findIndex(


                                    msg=>
                                    msg.message_id === assistantTempId


                                );






                            if(index !== -1){



                                updated[index]={



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

                "Backend server unavailable. Please check the connection.",

                "error"

            );






            setMessages(prev=>[



                ...prev,



                {


                    role:"assistant",


                    message_id:null,


                    conversation_id:
                        conversationId,


                    content:
                    "⚠ Unable to connect to the AI server.",



                    sources:[],


                    feedback:null


                }



            ]);



        }






        finally{


            setLoading(false);


        }



    }









    async function loadConversation(id){



        try{



            const response =
                await fetch(

                    `${API}/conversations/${id}/messages`

                );






            if(!response.ok){


                throw new Error(
                    "Failed loading conversation"
                );


            }







            const data =
                await response.json();







            setMessages(

                data.map(message=>({


                    ...message,


                    conversation_id:id



                }))


            );







            setConversationId(id);





        }





        catch(error){



            console.error(

                "Conversation loading error:",

                error

            );




            showToast(

                "Failed loading conversation.",

                "error"

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