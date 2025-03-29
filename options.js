function loadOptions() {
    chrome.storage.sync.get(["apiKey", "baseUrl", "model"], s => {
        document.getElementById("apiKey").value = s.apiKey || '';
        document.getElementById("baseUrl").value = s.baseUrl || 'https://api.openai.com/v1/chat/completions';
        document.getElementById("model").value = s.model || 'chatgpt-4o-latest';
    });
}

function saveOptions() {
    const [apiKey, baseUrl, model] = ['apiKey', 'baseUrl', 'model'].map(id => document.getElementById(id).value);
    chrome.storage.sync.set({ apiKey, baseUrl, model }, () => alert("Settings saved"));
}

document.addEventListener("DOMContentLoaded", loadOptions);
document.getElementById("save").addEventListener("click", saveOptions);
