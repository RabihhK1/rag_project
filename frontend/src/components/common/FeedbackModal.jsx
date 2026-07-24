const reasons = [
  "Incorrect answer",
  "Missing information",
  "Wrong source",
  "Not relevant",
  "Other",
];

function FeedbackModal({
  isOpen,
  reason,
  setReason,
  comment,
  setComment,
  onClose,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-description"
      >
        <h2 id="feedback-title">Tell us what went wrong</h2>
        <p id="feedback-description">
          Help improve the cybersecurity assistant.
        </p>

        <div className="feedback-reasons" aria-label="Feedback reason">
          {reasons.map((item) => (
            <button
              key={item}
              type="button"
              className={reason === item ? "selected-reason" : ""}
              aria-pressed={reason === item}
              onClick={() => setReason(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="feedback-comment">
          Additional comments
        </label>
        <textarea
          id="feedback-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Additional comments (optional)"
        />

        <div className="modal-actions">
          <button className="cancel-btn" type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="submit-btn"
            type="button"
            disabled={!reason}
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </section>
    </div>
  );
}

export default FeedbackModal;
