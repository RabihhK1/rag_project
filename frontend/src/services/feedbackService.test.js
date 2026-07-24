import { afterEach, describe, expect, it, vi } from "vitest";

const getJson = vi.fn();
const requestApi = vi.fn();

vi.mock("./api", () => ({ getJson, requestApi }));

const { getFeedbackList, getFeedbackStats, submitFeedback } =
  await import("./feedbackService");

describe("feedback service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads feedback analytics data", () => {
    getFeedbackStats();
    getFeedbackList();

    expect(getJson).toHaveBeenNthCalledWith(1, "/feedback/stats");
    expect(getJson).toHaveBeenNthCalledWith(2, "/feedback");
  });

  it("submits the complete feedback payload", async () => {
    const payload = {
      conversation_id: "conversation-1",
      message_id: "message-1",
      rating: "down",
      reasons: ["Incomplete"],
      comment: "Please add implementation details.",
    };

    await submitFeedback(payload);

    expect(requestApi).toHaveBeenCalledWith(
      "/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });
});
