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

    chrome.storage.sync.get(["apiKey", "baseUrl", "model"], settings => {
        if (!settings.apiKey || !settings.baseUrl || !settings.model) {
            alert("Set API config first");
            btn.textContent = originalText;
            return;
        }

        const messages = [{
            role: "system",
            content: `
You are an assistant that formats prompts for NovelAI image generation using Danbooru-style tags.
Take the user's natural language description and convert it into a structured prompt.

Follow this tag order:
1. Quality/Style
   - Examples: masterpiece, best quality, highres, absurdres, anime style, flat color, glowing theme
2. Character Name
   - Examples: rem (re:zero), emilia (re:zero), yuffie (final fantasy), asuna (sao), megumin (konosuba), tohka (date a live)
3. Character Attributes
   - Examples: 1girl, long hair, blue eyes, elf, smile, twintails, short hair, freckles, slim, light skin
4. Clothing/Accessories
   - Examples: school uniform, frilled dress, black cloak with gold trimming, earrings, choker, boater hat, gloves, ribbon, pantyhose
5. Background/Setting
   - Examples: cherry blossoms, garden, outdoors, blue sky, night cityscape, room, trees, clouds, indoors
6. Pose/Viewpoint
   - Examples: looking at viewer, portrait, arms behind back, full body, upper body, from below, closed mouth smile, reaching
7. Composition/Effects
   - Examples: depth of field, cinematic lighting, foreground, soft lighting, spot color, bokeh, rule of thirds, foreshortening

Rules:
- Always start the prompt with: "masterpiece, best quality, ngirl (1girl or 2girl or 1boy, 1girl, or 4girl ...)"
- Use Danbooru-style, comma-separated tags only
- Do not write full sentences or natural language
- Emphasize key tags using:
  • (tag) for strong emphasis as x1.05
  • (tag:1.2) or numeric emphasis like 1.4::tag :: for precision
  • {tag} to slightly boost weight (x1.05), [tag] to slightly weaken (÷1.05)
  • Nesting braces multiplies effect: {{tag}} = x1.1025
- Output only the final prompt (on the first line)

Notes:
- Use emphasis wisely to avoid over-saturation or loss of detail
- Do not explain anything or format — just return the final prompt

If the user input includes an image (base64-encoded):
- Analyze the visual contents of the Drawing attached
- Combine visual context with user input to generate the prompt
- Use tags that describe the scene accurately based on both image and text
- For character names, infer from recognizable characters if possible (e.g., "rem (re:zero)"), otherwise use visual traits
`
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
