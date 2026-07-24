function MessageActions({
  copied,
  feedback,
  isRegenerating,
  onCopy,
  onFeedback,
  onOpenFeedback,
  onRegenerate,
  onSelectVersion,
  replyVersions,
  selectedReplyIndex,
}) {
  return (
    <div className="message-actions">
      {replyVersions.length > 1 && (
        <div className="response-versions" aria-label="Response versions">
          <button
            type="button"
            aria-label="Previous response version"
            disabled={isRegenerating || selectedReplyIndex === 0}
            onClick={() => onSelectVersion(selectedReplyIndex - 1)}
          >
            ←
          </button>
          <span>
            {selectedReplyIndex + 1} / {replyVersions.length}
          </span>
          <button
            type="button"
            aria-label="Next response version"
            disabled={
              isRegenerating || selectedReplyIndex === replyVersions.length - 1
            }
            onClick={() => onSelectVersion(selectedReplyIndex + 1)}
          >
            →
          </button>
        </div>
      )}

      <button type="button" disabled={isRegenerating} onClick={onRegenerate}>
        {isRegenerating ? "🔄 Regenerating…" : "🔄 Regenerate"}
      </button>
      <button type="button" onClick={onCopy}>
        {copied ? "Copied ✓" : "📋 Copy"}
      </button>
      <button
        type="button"
        className={feedback === "up" ? "active-feedback" : ""}
        disabled={isRegenerating}
        aria-label="Rate this response helpful"
        aria-pressed={feedback === "up"}
        onClick={() => onFeedback("up")}
      >
        👍
      </button>
      <button
        type="button"
        className={feedback === "down" ? "active-feedback" : ""}
        disabled={isRegenerating}
        aria-label="Rate this response not helpful"
        aria-pressed={feedback === "down"}
        onClick={onOpenFeedback}
      >
        👎
      </button>
    </div>
  );
}

export default MessageActions;
