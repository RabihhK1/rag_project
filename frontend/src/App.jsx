import { useState } from "react";


import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import Toast from "./components/common/Toast";
import GuidedTour from "./components/common/GuidedTour";

import Analytics from "./pages/Analytics";

import useChat from "./hooks/useChat";


const TOUR_STORAGE_KEY = "cyber-rag-tour-completed";


function shouldShowTour() {
    try {
        return !window.localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
        return false;
    }
}



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

    const [showTour, setShowTour] =
        useState(shouldShowTour);

    function completeTour() {
        try {
            window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
        } catch {
            // The tour still closes if browser storage is unavailable.
        }

        setShowTour(false);
    }









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

                <Header onStartTour={() => setShowTour(true)} />

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

            {showTour && (
                <GuidedTour isOpen={showTour} onComplete={completeTour} />
            )}

        </div>
    );
}



export default App;
