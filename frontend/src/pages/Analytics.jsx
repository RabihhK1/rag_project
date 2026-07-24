import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getFeedbackList, getFeedbackStats } from "../services/feedbackService";
import { exportFeedbackCSV } from "../services/exportService";

const tooltipStyle = {
  background: "#171717",
  border: "1px solid #333",
  borderRadius: "12px",
  color: "white",
};

function feedbackKey(item) {
  return (
    item.feedback_id ||
    item.id ||
    item.message_id ||
    [item.created_at, item.rating, item.comment, item.reasons?.join("-")]
      .filter(Boolean)
      .join("-")
  );
}

function Analytics({ goBack }) {
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsData, feedbackData] = await Promise.all([
        getFeedbackStats(),
        getFeedbackList(),
      ]);
      setStats(statsData);
      setFeedback(feedbackData);
    } catch {
      setError("We could not load feedback analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAnalytics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const filteredFeedback = useMemo(
    () =>
      filter === "all"
        ? feedback
        : feedback.filter((item) => item.rating === filter),
    [feedback, filter],
  );
  const chartData = useMemo(
    () => [
      { name: "Positive", value: stats?.positive || 0 },
      { name: "Negative", value: stats?.negative || 0 },
    ],
    [stats],
  );

  if (loading) {
    return (
      <main className="dashboard-page" aria-busy="true">
        <div className="dashboard-header">
          <h1>Loading analytics…</h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-header" role="alert">
          <h1>{error}</h1>
          <div className="analytics-error-actions">
            <button type="button" className="back-button" onClick={goBack}>
              Back to chat
            </button>
            <button
              type="button"
              className="export-btn"
              onClick={loadAnalytics}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const cards = [
    { label: "Total Feedback", value: stats?.total_feedback || 0 },
    { label: "Positive", value: stats?.positive || 0, tone: "positive" },
    { label: "Negative", value: stats?.negative || 0, tone: "negative" },
    { label: "Satisfaction", value: `${stats?.satisfaction_rate || 0}%` },
  ];

  return (
    <main className="dashboard-page">
      <header className="analytics-topbar">
        <button
          type="button"
          className="icon-back"
          onClick={goBack}
          aria-label="Back to chat"
        >
          ←
        </button>
        <h1>Feedback Analytics</h1>
      </header>

      <div className="dashboard-content">
        <section className="analytics-cards" aria-label="Feedback summary">
          {cards.map((card) => (
            <article
              className={`analytics-card${card.tone ? ` ${card.tone}` : ""}`}
              key={card.label}
            >
              <h2>{card.label}</h2>
              <p>{card.value}</p>
            </article>
          ))}
        </section>

        <section className="charts-container" aria-label="Feedback charts">
          <article className="chart-box">
            <h2>Ratings Overview</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>

          <article className="chart-box">
            <h2>Feedback Ratio</h2>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={5}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={40} />
              </PieChart>
            </ResponsiveContainer>
          </article>
        </section>

        <section
          className="feedback-table"
          aria-labelledby="feedback-history-title"
        >
          <div className="table-toolbar">
            <div className="filters" aria-label="Filter feedback">
              {["all", "up", "down"].map((filterOption) => (
                <button
                  type="button"
                  key={filterOption}
                  aria-pressed={filter === filterOption}
                  onClick={() => setFilter(filterOption)}
                >
                  {filterOption === "all"
                    ? "All"
                    : filterOption === "up"
                      ? "👍 Positive"
                      : "👎 Negative"}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="export-btn"
              onClick={() => exportFeedbackCSV(feedback)}
            >
              Export CSV
            </button>
          </div>

          <h2 id="feedback-history-title">Feedback History</h2>
          <table>
            <thead>
              <tr>
                <th>Rating</th>
                <th>Comment</th>
                <th>Reasons</th>
                <th>Date</th>
                <th>
                  <span className="sr-only">View details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedback.length ? (
                filteredFeedback.map((item) => (
                  <tr key={feedbackKey(item)}>
                    <td>{item.rating === "up" ? "👍" : "👎"}</td>
                    <td>{item.comment || "No comment"}</td>
                    <td>{item.reasons?.join(", ") || "-"}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="feedback-details-button"
                        onClick={() => setSelectedFeedback(item)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No feedback matches this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {selectedFeedback && (
        <div className="modal-overlay">
          <section
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-details-title"
          >
            <h2 id="feedback-details-title">Feedback Details</h2>
            <p>Rating: {selectedFeedback.rating}</p>
            <p>Comment: {selectedFeedback.comment || "No comment"}</p>
            <p>Reasons: {selectedFeedback.reasons?.join(", ") || "-"}</p>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setSelectedFeedback(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default Analytics;
