import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MessageBubble from "./MessageBubble";

describe("MessageBubble", () => {
  it("regenerates the selected response in its current conversation", async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();

    render(
      <MessageBubble
        message={{
          role: "assistant",
          message_id: "reply-1",
          root_message_id: "reply-1",
          conversation_id: "conversation-1",
          content: "Use CIS safeguards.",
          sources: [],
        }}
        onRegenerate={onRegenerate}
      />,
    );

    await user.click(screen.getByRole("button", { name: /regenerate/i }));

    expect(onRegenerate).toHaveBeenCalledWith("reply-1", "conversation-1");
  });
});
