import MessageList from "./MessageList";
import ChatInput from "./ChatInput";


function ChatWindow({
messages,
sendMessage,
loading
}){


return (

<div className="chat-window">


<MessageList
messages={messages}
loading={loading}
/>



<ChatInput
  sendMessage={sendMessage}
  loading={loading}
/>

</div>

)

}


export default ChatWindow;