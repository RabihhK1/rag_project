import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function linkifyCitations(content, sources) {
  return content.replace(/\[(\d+)\]/g, (citation, sourceNumber) => {
    const sourceIndex = Number(sourceNumber) - 1;
    return sources[sourceIndex]
      ? `[${sourceNumber}](https://citation.local/${sourceNumber})`
      : citation;
  });
}

function AssistantMarkdown({
  content,
  sources,
  activeCitationIndex,
  setActiveCitationIndex,
  onCopyCode,
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href, children, ...props }) {
          const citationMatch = href?.match(
            /^https:\/\/citation\.local\/(\d+)$/,
          );

          if (!citationMatch) {
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          }

          const sourceNumber = Number(citationMatch[1]);
          const sourceIndex = sourceNumber - 1;
          const source = sources[sourceIndex];
          const isOpen = activeCitationIndex === sourceIndex;

          return (
            <span
              className="citation-wrapper"
              onMouseEnter={() => setActiveCitationIndex(sourceIndex)}
              onMouseLeave={() => setActiveCitationIndex(null)}
            >
              <button
                type="button"
                className="inline-citation"
                aria-label={`View source ${sourceNumber}`}
                aria-expanded={isOpen}
                onFocus={() => setActiveCitationIndex(sourceIndex)}
                onBlur={() => setActiveCitationIndex(null)}
                onClick={() =>
                  setActiveCitationIndex(isOpen ? null : sourceIndex)
                }
              >
                [{sourceNumber}]
              </button>
              {isOpen && source && (
                <span className="citation-tooltip" role="tooltip">
                  <strong>Source {sourceNumber}</strong>
                  <span>
                    {source.section || "CIS Controls"}
                    {source.page ? ` · Page ${source.page}` : ""}
                  </span>
                  <span className="citation-snippet">
                    {source.snippet || "Open source details below for context."}
                  </span>
                </span>
              )}
            </span>
          );
        },
        code({ inline, className, children, ...props }) {
          const codeText = String(children).replace(/\n$/, "");

          if (inline) {
            return (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          }

          return (
            <div className="code-block">
              <div className="code-header">
                <span>Code</span>
                <button type="button" onClick={() => onCopyCode(codeText)}>
                  Copy
                </button>
              </div>
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },
      }}
    >
      {linkifyCitations(content, sources)}
    </ReactMarkdown>
  );
}

export default AssistantMarkdown;
