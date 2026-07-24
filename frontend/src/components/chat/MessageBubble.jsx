import { useState } from "react";
import FeedbackModal from "../common/FeedbackModal";
import { submitFeedback } from "../../services/feedbackService";
import AssistantMarkdown from "./AssistantMarkdown";
import MessageActions from "./MessageActions";
import SourceDrawer from "./SourceDrawer";

function MessageBubble({
  message,
  onRegenerate,
  regeneratingFor,
  onSelectVersion,
  onFeedbackSubmitted,
}) {
  const [showSources, setShowSources] = useState(false);
  const [feedbackOverrides, setFeedbackOverrides] = useState({});
  const [copied, setCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [activeCitationIndex, setActiveCitationIndex] = useState(null);
  const [actionError, setActionError] = useState("");

  const replyVersions =
    Array.isArray(message.versions) && message.versions.length
      ? message.versions
      : [message];
  const rootMessageId = message.root_message_id || message.message_id;
  const selectedReplyIndex = Math.min(
    Math.max(message.selected_version_index ?? 0, 0),
    replyVersions.length - 1,
  );
  const isRegenerating = regeneratingFor === rootMessageId;
  const feedback =
    feedbackOverrides[message.message_id] ?? message.feedback ?? null;
  const isWelcome = message.message_id === "welcome";
  const isThinking =
    message.role === "assistant" && message.content === "" && !isWelcome;
  const canShowActions =
    message.role === "assistant" && !isWelcome && message.content !== "";

  async function copyToClipboard(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      setActionError("");
      if (successMessage) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      setActionError("Unable to copy this content. Please try again.");
    }
  }

  async function sendFeedback(type, reason = null, comment = null) {
    try {
      await submitFeedback({
        conversation_id: message.conversation_id,
        message_id: message.message_id,
        rating: type,
        reasons: reason ? [reason] : [],
        comment,
      });
      setFeedbackOverrides((previous) => ({
        ...previous,
        [message.message_id]: type,
      }));
      onFeedbackSubmitted?.(message.message_id, type);
      setActionError("");
      return true;
    } catch {
      setActionError("Unable to save feedback. Please try again.");
      return false;
    }
  }

  async function submitNegativeFeedback() {
    const submitted = await sendFeedback(
      "down",
      feedbackReason,
      feedbackComment,
    );
    if (!submitted) {
      return;
    }

    setShowFeedbackModal(false);
    setFeedbackReason("");
    setFeedbackComment("");
  }

  return (
    <div className={`message ${message.role}`}>
      <div className="bubble">
        <div className="message-content">
          {isThinking ? (
            <div className="typing" aria-label="Assistant is thinking">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          ) : message.role === "assistant" ? (
            <AssistantMarkdown
              content={message.content}
              sources={message.sources || []}
              activeCitationIndex={activeCitationIndex}
              setActiveCitationIndex={setActiveCitationIndex}
              onCopyCode={(code) => copyToClipboard(code)}
            />
          ) : (
            message.content
          )}
        </div>

        {actionError && (
          <p className="message-action-error" role="alert">
            {actionError}
          </p>
        )}

        {canShowActions && (
          <MessageActions
            copied={copied}
            feedback={feedback}
            isRegenerating={isRegenerating}
            replyVersions={replyVersions}
            selectedReplyIndex={selectedReplyIndex}
            onCopy={() => copyToClipboard(message.content, true)}
            onFeedback={sendFeedback}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            onRegenerate={() =>
              onRegenerate?.(message.message_id, message.conversation_id)
            }
            onSelectVersion={(versionIndex) =>
              onSelectVersion?.(rootMessageId, versionIndex)
            }
          />
        )}

        <SourceDrawer
          sources={message.sources}
          showSources={showSources}
          onToggle={() => setShowSources((current) => !current)}
        />
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        reason={feedbackReason}
        setReason={setFeedbackReason}
        comment={feedbackComment}
        setComment={setFeedbackComment}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={submitNegativeFeedback}
      />
    </div>
  );
}

export default MessageBubble;
