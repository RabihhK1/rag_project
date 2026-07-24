import { forwardRef } from "react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

const ChatWindow = forwardRef(function ChatWindow(
  {
    messages,
    sendMessage,
    loading,
    regenerateMessage,
    regeneratingFor,
    selectResponseVersion,
    onFeedbackSubmitted,
    chatInputRef,
  },
  ref,
) {
  const isWelcomeScreen =
    messages.length === 0 ||
    (messages.length === 1 && messages[0]?.message_id === "welcome");

  return (
    <main
      ref={ref}
      className={`chat-window${isWelcomeScreen ? " chat-window--welcome" : ""}`}
      data-tour="chat-viewport"
    >
      {isWelcomeScreen ? (
        <WelcomeScreen onSelectPrompt={sendMessage} loading={loading} />
      ) : (
        <MessageList
          messages={messages}
          loading={loading}
          regenerateMessage={regenerateMessage}
          regeneratingFor={regeneratingFor}
          selectResponseVersion={selectResponseVersion}
          onFeedbackSubmitted={onFeedbackSubmitted}
        />
      )}

      <ChatInput
        sendMessage={sendMessage}
        loading={loading}
        welcomeMode={isWelcomeScreen}
        inputAreaRef={chatInputRef}
      />
    </main>
  );
});

export default ChatWindow;
