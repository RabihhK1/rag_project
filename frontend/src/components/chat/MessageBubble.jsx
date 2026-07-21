export default function MessageBubble({
role,
text
}){


const user = role==="user";


return (

<div
className={`
flex
${user ? "justify-end":"justify-start"}
`}
>


<div
className={`
max-w-xl
rounded-2xl
px-5
py-3

${user
?
"bg-black text-white"
:
"bg-white border"
}

`}
>

{text}

</div>


</div>

)

}