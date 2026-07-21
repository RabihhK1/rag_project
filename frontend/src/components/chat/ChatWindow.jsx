import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import {useChat} from "../../hooks/useChat";


export default function ChatWindow(){


const chat = useChat();


return (

<section className="flex flex-col flex-1">


<MessageList
messages={chat.messages}
loading={chat.loading}
/>


<ChatInput

input={chat.input}

setInput={chat.setInput}

sendMessage={chat.sendMessage}

/>


</section>

)

}