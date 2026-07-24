import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChatInput from "./ChatInput";

describe("ChatInput", () => {
  it("submits a typed message once and clears the input", async () => {
    const user = userEvent.setup();
    const sendMessage = vi.fn();

    render(<ChatInput loading={false} sendMessage={sendMessage} />);

    const input = screen.getByLabelText("Ask a question about CIS Controls");
    await user.type(input, "How should we prioritize safeguards?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(sendMessage).toHaveBeenCalledWith(
      "How should we prioritize safeguards?",
    );
    expect(input).toHaveValue("");
  });

  it("disables input while a response is loading", () => {
    render(<ChatInput loading sendMessage={vi.fn()} />);

    expect(
      screen.getByLabelText("Ask a question about CIS Controls"),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Thinking..." })).toBeDisabled();
  });
});
