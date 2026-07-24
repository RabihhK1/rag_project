import { lazy, Suspense, useMemo, useRef, useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import Toast from "./components/common/Toast";
import GuidedTour from "./components/common/GuidedTour";
import AppRouter from "./routes/AppRouter";
import { APP_ROUTES } from "./routes/routeConfig";
import useAppRoute from "./routes/useAppRoute";
import useChat from "./hooks/useChat";

const Analytics = lazy(() => import("./pages/Analytics"));
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
    toast,
    regenerateMessage,
    regeneratingFor,
    selectResponseVersion,
    updateMessageFeedback,
    handleConversationDeleted,
  } = useChat();
  const { path, navigate } = useAppRoute();
  const [showTour, setShowTour] = useState(shouldShowTour);
  const sidebarRef = useRef(null);
  const chatViewportRef = useRef(null);
  const chatInputRef = useRef(null);
  const tourTargets = useMemo(
    () => ({
      sidebar: sidebarRef,
      chatViewport: chatViewportRef,
      chatInput: chatInputRef,
    }),
    [],
  );

  function completeTour() {
    try {
      window.localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // The tour still closes if browser storage is unavailable.
    }

    setShowTour(false);
  }

  const chatWorkspace = (
    <div className="app">
      <Sidebar
        ref={sidebarRef}
        newChat={newChat}
        loadConversation={loadConversation}
        refreshKey={refreshKey}
        onConversationDeleted={handleConversationDeleted}
        loading={loading}
        openAnalytics={() => navigate(APP_ROUTES.analytics)}
      />

      <div className="main">
        <Header onStartTour={() => setShowTour(true)} />
        <ChatWindow
          ref={chatViewportRef}
          messages={messages}
          sendMessage={sendMessage}
          loading={loading}
          regenerateMessage={regenerateMessage}
          regeneratingFor={regeneratingFor}
          selectResponseVersion={selectResponseVersion}
          onFeedbackSubmitted={updateMessageFeedback}
          chatInputRef={chatInputRef}
        />
      </div>

      <Toast toast={toast} />

      {showTour && (
        <GuidedTour
          isOpen={showTour}
          onComplete={completeTour}
          targets={tourTargets}
        />
      )}
    </div>
  );

  const analyticsPage = (
    <Suspense
      fallback={<main className="page-loading">Loading analytics…</main>}
    >
      <Analytics goBack={() => navigate(APP_ROUTES.chat)} />
    </Suspense>
  );

  return (
    <AppRouter path={path} chat={chatWorkspace} analytics={analyticsPage} />
  );
}

export default App;
