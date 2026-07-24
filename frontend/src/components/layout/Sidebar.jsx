import {
    useEffect,
    useState
}
from "react";
import { API_URL } from "../../services/api";


function Sidebar({

newChat,

loadConversation,

refreshKey,

openAnalytics,

onConversationDeleted,

loading

}){


const [
conversations,
setConversations
]=useState([]);



const [
editing,
setEditing
]=useState(null);



const [
title,
setTitle
]=useState("");






async function fetchConversations(){


try{


const response =
await fetch(
`${API_URL}/conversations`
);


const data =
await response.json();


setConversations(data);


}

catch(error){

console.error(
"Conversation loading failed",
error
);

}


}






useEffect(()=>{


const timer = window.setTimeout(() => {

void fetchConversations();

}, 0);


return () => window.clearTimeout(timer);


},[refreshKey]);








async function renameChat(id){


if(!title.trim())
return;



await fetch(

`${API_URL}/conversations/${id}`,

{

method:"PATCH",

headers:{

"Content-Type":
"application/json"

},

body:JSON.stringify({

title:title

})

}

);



setEditing(null);

fetchConversations();


}







async function deleteChat(id){


if(!window.confirm(
"Delete this conversation?"
))
return;



const response = await fetch(

`${API_URL}/conversations/${id}`,

{

method:"DELETE"

}

);


if(!response.ok){

throw new Error("Failed deleting conversation");

}


onConversationDeleted?.(id);



fetchConversations();


}








return (


<div className="sidebar" data-tour="sidebar">


<div className="logo">

⚡ Cyber RAG

</div>





<button

className="new-chat"

onClick={newChat}

disabled={loading}

>

+ New Chat

</button>






<button

className="analytics-button"

onClick={openAnalytics}

>

📊 Feedback Analytics

</button>








<div className="chat-history">


<h4>
Chats
</h4>




<div className="chat-list">


{

conversations.map(chat=>(


<div

className="chat-item"

key={chat.conversation_id}

>




{

editing === chat.conversation_id


?


<input

autoFocus

value={title}

onChange={
e=>setTitle(e.target.value)
}


onKeyDown={
e=>{

if(e.key==="Enter")

renameChat(
chat.conversation_id
)

}

}


/>



:


<>


<span

className="chat-title"

onClick={()=>loadConversation(
chat.conversation_id
)}

>

{chat.title}

</span>





<button

className="rename-btn"

onClick={()=>{

setEditing(
chat.conversation_id
);

setTitle(
chat.title
);

}}

>

✏

</button>





<button

className="delete-btn"

onClick={()=>deleteChat(
chat.conversation_id
)}

disabled={loading}

>

🗑

</button>


</>


}



</div>


))


}



</div>


</div>







<div className="sidebar-footer">

Cyber RAG

</div>



</div>


);


}


export default Sidebar;
