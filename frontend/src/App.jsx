import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatWindow from "./components/chat/ChatWindow";
import Toast from "./components/common/Toast";
import GuidedTour from "./components/common/GuidedTour";
import AppRouter from "./routes/AppRouter";
import { APP_ROUTES } from "./routes/routeConfig";
import useAppRoute from "./routes/useAppRoute";
import useChat from "./hooks/useChat";
import Login from "./pages/Login";
import { useAuth } from "./auth/AuthContext";

const Analytics = lazy(() => import("./pages/Analytics"));
const TOUR_STORAGE_KEY = "cyber-rag-tour-completed";

function shouldShowTour() {
  try {
    return !window.localStorage.getItem(TOUR_STORAGE_KEY);
  } catch {
    return false;
  }
}

function AuthCallback({ refresh, navigate }) {
  useEffect(() => {
    refresh().then((ok) => navigate(ok ? APP_ROUTES.chat : APP_ROUTES.login));
  }, [navigate, refresh]);
  return <main className="page-loading">Completing sign-in…</main>;
}

function App() {
  const { user, initializing, login, logout, refresh } = useAuth();
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

  if (initializing) return <main className="page-loading">Restoring your secure session…</main>;
  if (path === APP_ROUTES.authCallback) {
    return <AuthCallback refresh={refresh} navigate={navigate} />;
  }
  if (!user) return <Login onLogin={login} />;

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
        <Header onStartTour={() => setShowTour(true)} user={user} onLogout={logout} />
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
