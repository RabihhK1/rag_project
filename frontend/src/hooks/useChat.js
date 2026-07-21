import { useState } from "react";


function useChat(){


const [messages,setMessages] = useState([

{
    role:"assistant",
    content:
    "Hello, I am your cybersecurity assistant. Ask me anything about CIS Controls.",
    sources:[]
}

]);



const [loading,setLoading] = useState(false);



async function sendMessage(text){


setMessages(prev => [

    ...prev,

    {
        role:"user",
        content:text
    }

]);



setLoading(true);



try{


const response = await fetch(
"http://127.0.0.1:8000/chat",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

message:text

})

}

);



const data = await response.json();



setMessages(prev => [

    ...prev,

    {

        role:"assistant",

        content:data.answer,

        sources:data.sources || []

    }

]);



}

catch(error){


setMessages(prev => [

    ...prev,

    {

        role:"assistant",

        content:"Backend connection failed.",

        sources:[]

    }

]);


}



setLoading(false);


}



return {

messages,

sendMessage,

loading

};


}


export default useChat;