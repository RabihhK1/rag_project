export async function readSseEvents(response, onEvent) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming response is unavailable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  const processEvent = (block) => {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n")
      .trim();

    if (!data || data === "[DONE]") {
      return;
    }

    try {
      onEvent(JSON.parse(data));
    } catch (error) {
      if (error instanceof SyntaxError) {
        return;
      }

      throw error;
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? "";
    blocks.forEach(processEvent);
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    processEvent(buffer);
  }
}
