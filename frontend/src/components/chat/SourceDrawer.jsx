function sourceKey(source) {
  return (
    source.document_id ||
    source.id ||
    source.url ||
    [source.section, source.page, source.snippet].filter(Boolean).join("-") ||
    JSON.stringify(source)
  );
}

function SourceDrawer({ sources, showSources, onToggle }) {
  if (!sources?.length) {
    return null;
  }

  return (
    <div className="sources-wrapper">
      <button type="button" className="sources-button" onClick={onToggle}>
        {showSources ? "Hide Sources" : `View Sources (${sources.length})`}
      </button>
      {showSources && (
        <div className="sources-drawer">
          {sources.map((source, sourceIndex) => (
            <div className="source-item" key={sourceKey(source)}>
              <strong>Source {sourceIndex + 1}</strong>
              <p>📄 Page: {source.page || "Not specified"}</p>
              <p>📌 {source.section || "CIS Controls"}</p>
              <p>🔎 Score: {Number(source.score || 0).toFixed(3)}</p>
              {source.snippet && (
                <p className="source-snippet">{source.snippet}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SourceDrawer;
