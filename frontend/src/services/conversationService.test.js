import { afterEach, describe, expect, it, vi } from "vitest";

const getJson = vi.fn();
const requestApi = vi.fn();

vi.mock("./api", () => ({ getJson, requestApi }));

const {
  deleteConversation,
  getConversationMessages,
  getConversations,
  renameConversation,
} = await import("./conversationService");

describe("conversation service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads the conversation list and its messages", () => {
    getConversations();
    getConversationMessages("conversation-1");

    expect(getJson).toHaveBeenNthCalledWith(1, "/conversations");
    expect(getJson).toHaveBeenNthCalledWith(
      2,
      "/conversations/conversation-1/messages",
    );
  });

  it("renames a conversation with a JSON PATCH request", async () => {
    await renameConversation("conversation-1", "Security review");

    expect(requestApi).toHaveBeenCalledWith(
      "/conversations/conversation-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ title: "Security review" }),
      }),
    );
  });

  it("deletes a conversation", async () => {
    await deleteConversation("conversation-1");

    expect(requestApi).toHaveBeenCalledWith(
      "/conversations/conversation-1",
      { method: "DELETE" },
    );
  });
});
