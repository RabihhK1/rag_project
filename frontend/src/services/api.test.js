import { afterEach, describe, expect, it, vi } from "vitest";
import { getJson, postJson, requestApi } from "./api";

describe("API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the configured API URL", async () => {
    const response = { ok: true };
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestApi("/conversations")).resolves.toBe(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/conversations",
      {},
    );
  });

  it("returns parsed JSON for successful GET requests", async () => {
    const payload = [{ conversation_id: "conversation-1" }];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(payload),
      }),
    );

    await expect(getJson("/conversations")).resolves.toEqual(payload);
  });

  it("sends JSON payloads for POST requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ accepted: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await postJson("/feedback", { rating: "up" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/feedback",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: "up" }),
      }),
    );
  });

  it("surfaces an API error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ detail: "Conversation not found" }),
      }),
    );

    await expect(requestApi("/conversations/missing")).rejects.toThrow(
      "Conversation not found",
    );
  });
});
