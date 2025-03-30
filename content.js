let encodedImage = null;

const createButton = (id, text, bottom, bgColor = '#191B31') => {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    btn.style.cssText = `
        position: absolute;
        right: 5px;
        bottom: ${bottom}px;
        z-index: 1000;
        background-color: ${bgColor};
        color: #fff;
    `;
    return btn;
};

function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        encodedImage = e.target.result.replace(/^data:image\/\w+;base64,/, "");
        document.getElementById("upload-image-button").textContent = "Image Uploaded";
    };
    reader.readAsDataURL(file);
}

function insertButtons() {
    const container = document.querySelector('.prompt-input-box-prompt .ProseMirror')?.parentElement;
    if (!container) return;

    const buttons = [
        createButton("upload-image-button", "Upload Image", 40),
        createButton("clear-image-button", "Clear Image", 75, '#555'),
        createButton("completion-button", "Completion", 5)
    ];

    buttons.forEach(btn => {
        if (!document.getElementById(btn.id)) {
            container.appendChild(btn);
            container.style.position = "relative";
        }
    });

    document.getElementById("upload-image-button").onclick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = handleImageUpload;
        fileInput.click();
    };

    document.getElementById("clear-image-button").onclick = () => {
        encodedImage = null;
        document.getElementById("upload-image-button").textContent = "Upload Image";
    };

    document.getElementById("completion-button").onclick = handleCompletion;
}

function handleCompletion() {
    const promptInput = document.querySelector('.prompt-input-box-prompt .ProseMirror');
    const userInput = promptInput?.innerText.trim() || '';
    
    if (!userInput && !encodedImage) {
        alert("Please enter prompt or upload image");
        return;
    }

    const btn = document.getElementById("completion-button");
    const originalText = btn.textContent;
    btn.textContent = "Loading...";

    chrome.storage.sync.get(["apiKey", "baseUrl", "model", "systemPrompt"], settings => {
        if (!settings.apiKey || !settings.baseUrl || !settings.model) {
            alert("Set API config first");
            btn.textContent = originalText;
            return;
        }
        if (!settings.systemPrompt) {
            alert("System prompt is missing in the configuration");
            btn.textContent = originalText;
            return;
        }

        const messages = [{
            role: "system",
            content: settings.systemPrompt
        }, {
            role: "user",
            content: encodedImage ? [
                { type: "text", text: userInput },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${encodedImage}` } }
            ] : userInput
        }];

        chrome.runtime.sendMessage({
            type: "generatePrompt",
            ...settings,
            body: {
                model: settings.model,
                messages: messages,
                max_tokens: 300
              }
        }, response => {
            btn.textContent = originalText;
            if (response.error) alert(`Error: ${response.error}`);
            else promptInput.innerText = response.result.choices[0].message.content;
        });
    });
}

function init() {
    const interval = setInterval(() => {
        const input = document.querySelector('.prompt-input-box-prompt .ProseMirror');
        if (input) {
            clearInterval(interval);
            insertButtons();
            input.addEventListener("keydown", e => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleCompletion();
            });
        }
    }, 500);
}

document.addEventListener("DOMContentLoaded", init);
