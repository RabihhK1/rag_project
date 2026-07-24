import { describe, expect, it } from "vitest";
import {
  normaliseAssistantMessage,
  selectResponseVersion,
} from "./responseVersions";

const message = {
  role: "assistant",
  message_id: "reply-2",
  root_message_id: "reply-1",
  content: "Second answer",
  sources: [{ id: "source-2" }],
  versions: [
    {
      message_id: "reply-1",
      content: "First answer",
      sources: [{ id: "source-1" }],
      version_number: 1,
    },
    {
      message_id: "reply-2",
      content: "Second answer",
      sources: [{ id: "source-2" }],
      version_number: 2,
    },
  ],
};

describe("response version helpers", () => {
  it("normalises a saved assistant response to its active version", () => {
    const result = normaliseAssistantMessage(message);

    expect(result.selected_version_index).toBe(1);
    expect(result.content).toBe("Second answer");
    expect(result.versions).toHaveLength(2);
  });

  it("switches versions in the same response slot", () => {
    const result = selectResponseVersion(message, 0);

    expect(result.message_id).toBe("reply-1");
    expect(result.root_message_id).toBe("reply-1");
    expect(result.content).toBe("First answer");
    expect(result.selected_version_index).toBe(0);
  });
});
