import MessageBubble from "./MessageBubble";


function MessageList({
messages,
loading
}){


return (

<div className="messages">


{
messages.map((msg,index)=>(

<MessageBubble
key={index}
message={msg}
/>

))
}



{
loading &&

<div className="message assistant">

<div className="bubble typing">

<span className="dot"></span>
<span className="dot"></span>
<span className="dot"></span>

</div>

</div>

}


</div>

)

}


export default MessageList;