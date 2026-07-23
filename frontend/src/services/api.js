const API_URL = "http://localhost:8000";


export async function sendChatMessage(message) {

    const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: message,
        }),
    });


    if (!response.ok) {
        throw new Error("Failed to get response from server");
    }


    return await response.json();
}