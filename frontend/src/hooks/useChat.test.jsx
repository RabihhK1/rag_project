import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const requestApi = vi.fn();
const getConversationMessages = vi.fn();

vi.mock("../services/api", () => ({ requestApi }));
vi.mock("../services/conversationService", () => ({
  getConversationMessages,
}));

const { default: useChat } = await import("./useChat");

function streamResponse(events) {
  const encoder = new TextEncoder();
  let hasRead = false;

  return {
    body: {
      getReader: () => ({
        read: vi.fn(async () => {
          if (hasRead) {
            return { done: true };
          }

          hasRead = true;
          return {
            done: false,
            value: encoder.encode(
              events
                .map((event) => `data: ${JSON.stringify(event)}\n\n`)
                .join(""),
            ),
          };
        }),
      }),
    },
  };
}

describe("useChat", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("streams a reply and regenerates it in the same response slot", async () => {
    requestApi
      .mockResolvedValueOnce(
        streamResponse([
          { type: "token", content: "Original " },
          {
            type: "done",
            conversation_id: "conversation-1",
            message_id: "reply-1",
            root_message_id: "reply-1",
            sources: [],
            version_number: 1,
          },
        ]),
      )
      .mockResolvedValueOnce(
        streamResponse([
          { type: "token", content: "Alternative answer" },
          {
            type: "done",
            message_id: "reply-2",
            root_message_id: "reply-1",
            sources: [],
            version_number: 2,
          },
        ]),
      );
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("How should we prioritize safeguards?");
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2]).toEqual(
      expect.objectContaining({
        message_id: "reply-1",
        content: "Original ",
        conversation_id: "conversation-1",
      }),
    );

    await act(async () => {
      await result.current.regenerateMessage("reply-1", "conversation-1");
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[2]).toEqual(
      expect.objectContaining({
        message_id: "reply-2",
        root_message_id: "reply-1",
        content: "Alternative answer",
        selected_version_index: 1,
      }),
    );
    expect(result.current.messages[2].versions).toHaveLength(2);
  });

  it("returns to the welcome state when the active conversation is deleted", async () => {
    getConversationMessages.mockResolvedValue([
      { role: "user", content: "How do I start?" },
      {
        role: "assistant",
        message_id: "assistant-1",
        content: "Start with CIS Implementation Group 1.",
        sources: [],
      },
    ]);
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.loadConversation("conversation-1");
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
    });

    act(() => {
      result.current.handleConversationDeleted("conversation-1");
    });

    expect(result.current.messages).toEqual([
      expect.objectContaining({ message_id: "welcome", role: "assistant" }),
    ]);
  });
});
