import { getJson, requestApi } from "./api";

export function getConversations() {
  return getJson("/conversations");
}

export function getConversationMessages(conversationId) {
  return getJson(`/conversations/${conversationId}/messages`);
}

export async function renameConversation(conversationId, title) {
  await requestApi(`/conversations/${conversationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(conversationId) {
  await requestApi(`/conversations/${conversationId}`, {
    method: "DELETE",
  });
}
