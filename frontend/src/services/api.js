export const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7184/api/v1";

let accessToken = null;
let refreshSession = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function setRefreshSession(handler) {
  refreshSession = handler;
}

export async function requestApi(path, options = {}, retried = false) {
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 && !retried && refreshSession) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestApi(path, options, true);
    }
  }

  if (!response.ok) {
    let message = "The request could not be completed.";

    try {
      const payload = await response.json();
      message = payload.detail || payload.message || message;
    } catch {
      // Some endpoints return an empty or non-JSON error response.
    }

    throw new Error(message);
  }

  return response;
}

export async function getJson(path, options) {
  const response = await requestApi(path, options);
  return response.json();
}

export async function postJson(path, payload) {
  return getJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function sendChatMessage(message) {
  return postJson("/chat", { message });
}
