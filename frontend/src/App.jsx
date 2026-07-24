import { useState } from "react";


import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import Toast from "./components/common/Toast";

import Analytics from "./pages/Analytics";

import useChat from "./hooks/useChat";




function App() {

    const {
        messages,
        sendMessage,
        loading,
        newChat,
        loadConversation,
        refreshKey,
        refreshConversations,
        toast,
        regenerateMessage,
        regeneratingFor,
        selectResponseVersion,
        updateMessageFeedback,
        handleConversationDeleted,
    } = useChat();







    const [page,setPage] =
        useState("chat");









    if(page === "analytics"){


        return (

            <Analytics

                goBack={()=>
                    setPage("chat")
                }

            />

        );


    }









    return (
        <div className="app">

            <Sidebar
                newChat={newChat}
                loadConversation={loadConversation}
                refreshKey={refreshKey}
                refreshConversations={refreshConversations}
                onConversationDeleted={handleConversationDeleted}
                loading={loading}
                openAnalytics={() => setPage("analytics")}
            />

            <div className="main">

                <Header />

                <ChatWindow
                    messages={messages}
                    sendMessage={sendMessage}
                    loading={loading}
                    regenerateMessage={regenerateMessage}
                    regeneratingFor={regeneratingFor}
                    selectResponseVersion={selectResponseVersion}
                    onFeedbackSubmitted={updateMessageFeedback}
                />

            </div>

            <Toast toast={toast} />

        </div>
    );
}



export default App;
