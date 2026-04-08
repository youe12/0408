/**
 * 火山方舟 OpenAI 兼容接口 — 流式 chat completions 解析
 * 文档：https://www.volcengine.com/docs/82379/1298454
 */

export interface ArkChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function* streamArkChatCompletions(options: {
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ArkChatMessage[];
  temperature: number;
}): AsyncGenerator<string, void, undefined> {
  const url = `${options.baseUrl.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`火山方舟 API ${res.status}: ${text.slice(0, 800)}`);
  }

  if (!res.body) {
    throw new Error("火山方舟 API 未返回 body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const piece = json.choices?.[0]?.delta?.content;
          if (piece) yield piece;
        } catch {
          /* 跳过非 JSON 行 */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
