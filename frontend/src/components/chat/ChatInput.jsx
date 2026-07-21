export default function ChatInput({

input,
setInput,
sendMessage

}){


return (

<div
className="
border-t
bg-white
p-4
flex
gap-3
"
>


<input

value={input}

onChange={(e)=>setInput(e.target.value)}

onKeyDown={(e)=>{

if(e.key==="Enter")
sendMessage();

}}

className="
flex-1
border
rounded-xl
px-4
py-3
outline-none
"

placeholder="Ask your question..."

/>



<button

onClick={sendMessage}

className="
bg-black
text-white
px-6
rounded-xl
hover:bg-neutral-800
"

>

Send

</button>


</div>

)

}