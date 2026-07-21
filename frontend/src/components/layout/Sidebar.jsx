export default function Sidebar(){

return (

<aside className="
w-72
bg-neutral-900
text-white
flex
flex-col
p-5
">


<h1 className="text-xl font-semibold">
RAG Security Assistant
</h1>


<p className="
text-sm
text-neutral-400
mt-2
">
Local LLM + Retrieval Augmented Generation
</p>


<button
className="
mt-8
rounded-lg
bg-white
text-black
py-2
hover:bg-neutral-200
"
>
+ New Chat
</button>


<div className="mt-8 space-y-4 text-neutral-300">

<div>
History
</div>

<div>
Documents
</div>

<div>
Settings
</div>

</div>


</aside>

)

}