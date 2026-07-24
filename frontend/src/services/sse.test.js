import { describe, expect, it, vi } from "vitest";
import { readSseEvents } from "./sse";

function streamResponse(chunks) {
  const encoder = new TextEncoder();
  let index = 0;

  return {
    body: {
      getReader: () => ({
        read: vi.fn(async () => {
          if (index === chunks.length) {
            return { done: true };
          }

          const value = encoder.encode(chunks[index]);
          index += 1;
          return { value, done: false };
        }),
      }),
    },
  };
}

describe("readSseEvents", () => {
  it("parses events split across stream chunks and ignores malformed events", async () => {
    const onEvent = vi.fn();
    const response = streamResponse([
      'data: {"type":"token","content":"Hello"}',
      '\n\ndata: invalid-json\n\ndata: {"type":"done","message_id":"m1"}\n\n',
    ]);

    await readSseEvents(response, onEvent);

    expect(onEvent).toHaveBeenCalledTimes(2);
    expect(onEvent).toHaveBeenNthCalledWith(1, {
      type: "token",
      content: "Hello",
    });
    expect(onEvent).toHaveBeenNthCalledWith(2, {
      type: "done",
      message_id: "m1",
    });
  });

  it("rejects responses without a readable stream", async () => {
    await expect(readSseEvents({}, vi.fn())).rejects.toThrow(
      "Streaming response is unavailable.",
    );
  });
});
