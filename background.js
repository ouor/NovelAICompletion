chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "generatePrompt") {
        generatePrompt(message)
            .then(response => sendResponse({ result: response }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

function generatePrompt(message) {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${message.apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message.body)
    };

    return fetch(message.baseUrl, options)
        .then(response => {
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            return response.json();
        });
}
