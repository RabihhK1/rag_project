export const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";


export async function requestApi(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, options);

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
