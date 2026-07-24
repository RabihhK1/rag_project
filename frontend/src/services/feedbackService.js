import { getJson, requestApi } from "./api";


export function getFeedbackStats() {
    return getJson("/feedback/stats");
}


export function getFeedbackList() {
    return getJson("/feedback");
}


export async function submitFeedback(payload) {
    await requestApi("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}
