import {
    useEffect,
    useState
}
from "react";


const API="http://127.0.0.1:8000";



function Sidebar({

newChat,

loadConversation,

refreshKey

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


const response = await fetch(
`${API}/conversations`
);


const data = await response.json();


setConversations(data);


}

catch(error){

console.error(error);

}


}





useEffect(()=>{

fetchConversations();

},[refreshKey]);







async function renameChat(id){


if(!title.trim())
return;



await fetch(

`${API}/conversations/${id}`,

{

method:"PATCH",

headers:{

"Content-Type":"application/json"

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


const confirmDelete =
window.confirm(
"Delete this conversation?"
);



if(!confirmDelete)
return;



await fetch(

`${API}/conversations/${id}`,

{

method:"DELETE"

}

);



fetchConversations();


}






return (

<div className="sidebar">


<div className="logo">

⚡ Cyber RAG

</div>




<button

className="new-chat"

onClick={newChat}

>

+ New Chat

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
renameChat(chat.conversation_id)

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


)


}


export default Sidebar;