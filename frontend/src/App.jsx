import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import useChat from "./hooks/useChat";


function App(){


const {

messages,

sendMessage,

loading,

newChat,

loadConversation,

refreshKey,

refreshConversations


}=useChat();



return (

<div className="app">


<Sidebar

newChat={newChat}

loadConversation={loadConversation}

refreshKey={refreshKey}

refreshConversations={refreshConversations}

/>



<div className="main">


<Header/>


<ChatWindow

messages={messages}

sendMessage={sendMessage}

loading={loading}

/>


</div>


</div>

);


}


export default App;