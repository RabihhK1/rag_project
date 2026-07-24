import {
  ArrowUpRight,
  BookOpen,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const starterPrompts = [
  {
    title: "Prioritize safeguards",
    description:
      "Find the controls that should come first for your organization.",
    prompt:
      "Which CIS Controls should a 100-person organization prioritize first, and why?",
  },
  {
    title: "Assess a control",
    description: "Review whether an existing security practice is aligned.",
    prompt:
      "How can I assess whether our multi-factor authentication implementation aligns with CIS Controls?",
  },
  {
    title: "Investigate a gap",
    description: "Identify the safeguards to review after a security event.",
    prompt:
      "What CIS Controls gaps should we investigate after a phishing incident?",
  },
  {
    title: "Build an implementation plan",
    description: "Turn CIS guidance into a practical, phased roadmap.",
    prompt:
      "Create a phased CIS Controls implementation plan for a growing organization.",
  },
];

const capabilities = [
  { icon: BookOpen, label: "CIS-grounded guidance" },
  { icon: FileText, label: "Inline source citations" },
  { icon: MessageSquare, label: "Feedback-informed answers" },
];

function WelcomeScreen({ onSelectPrompt, loading }) {
  return (
    <section className="welcome-screen" aria-labelledby="welcome-title">
      <div className="welcome-panel">
        <div className="welcome-eyebrow">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>CIS Controls knowledge assistant</span>
          <span className="welcome-trust">RAG grounded</span>
        </div>

        <div className="welcome-heading">
          <div className="welcome-mark" aria-hidden="true">
            <Sparkles size={25} />
          </div>
          <h1 id="welcome-title">
            Start with the security question that matters.
          </h1>
          <p>
            Explore CIS Controls with clear, source-backed guidance built for
            practical security decisions.
          </p>
        </div>

        <div
          className="starter-prompts"
          aria-label="Suggested CIS Controls questions"
        >
          {starterPrompts.map((item) => (
            <button
              key={item.title}
              type="button"
              className="starter-prompt"
              disabled={loading}
              onClick={() => onSelectPrompt(item.prompt)}
            >
              <span className="starter-prompt-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <ArrowUpRight
                className="starter-prompt-icon"
                size={18}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        <ul
          className="welcome-capabilities"
          aria-label="Assistant capabilities"
        >
          {capabilities.map(({ icon: Icon, label }) => (
            <li key={label}>
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WelcomeScreen;
