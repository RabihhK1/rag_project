import MessageBubble from "./MessageBubble";


export default function MessageList({
messages,
loading
}){


return (

<div
className="
flex-1
overflow-y-auto
p-8
space-y-5
"
>


{
messages.map((msg,index)=>(

<MessageBubble

key={index}

role={msg.role}

text={msg.text}

/>

))
}



{
loading &&

<MessageBubble

role="assistant"

text="Thinking..."

/>

}



</div>

)

}