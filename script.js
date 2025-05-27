function processScript() {
  const script = document.getElementById("scriptInput").value.trim();
  const format = document.getElementById("formatSelect").value;
  const output = document.getElementById("output");

  if (!script) {
    alert("Please paste your script first.");
    return;
  }

  const lines = script.split(/\n\n+|\.\s+/);
  output.innerHTML = "";

  lines.forEach((line, index) => {
    if (line.trim().length === 0) return;

    const prompt = generatePrompt(line, format);
    const sceneDiv = document.createElement("div");
    sceneDiv.className = "scene-block";
    sceneDiv.innerHTML = `
      <h3>Scene ${index + 1}</h3>
      <p><strong>EN:</strong> ${line}</p>
      <p><strong>RU:</strong> ${translateToRussian(line)}</p>
      <label><strong>Prompt:</strong></label>
      <input type="text" id="prompt-${index}" value="${prompt}" style="width: 100%; padding: 6px; margin-top: 5px;" />
      <button onclick="generateImage(${index})" style="margin-top: 10px;">🎨 Сгенерировать изображение</button>
      <div id="image-${index}" style="margin-top: 10px;"></div>
    `;
    output.appendChild(sceneDiv);
  });
}

function generatePrompt(text, format) {
  const base = "Cinematic scene, storytelling,";
  const aspect = format === "9:16" ? "vertical frame" : "landscape format";
  return `${base} ${text}, ${aspect}`;
}

function translateToRussian(text) {
  return "Автоперевод: " + text.split(" ").reverse().join(" ");
}

// 🧠 Картинка через Hugging Face API
async function generateImage(index) {
  const promptInput = document.getElementById(`prompt-${index}`);
  const prompt = promptInput.value;
  const imageContainer = document.getElementById(`image-${index}`);

  imageContainer.innerHTML = "⏳ Генерация изображения... (10–20 секунд)";

  const response = await fetch("https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer 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"
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!response.ok) {
    imageContainer.innerHTML = "❌ Ошибка генерации изображения.";
    return;
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image" style="max-width:100%; border-radius: 10px;" />`;
}
