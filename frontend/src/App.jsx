import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import Toast from "./components/common/Toast";

import useChat from "./hooks/useChat";



function App(){


const {

messages,

sendMessage,

loading,

newChat,

loadConversation,

refreshKey,

refreshConversations,

toast

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


<Header />



<ChatWindow

messages={messages}

sendMessage={sendMessage}

loading={loading}

/>


</div>



<Toast message={toast}/>



</div>


);


}


export default App;