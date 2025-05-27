document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("scriptInput").value = localStorage.getItem("script") || "";
  document.getElementById("formatSelect").value = localStorage.getItem("format") || "9:16";
  document.getElementById("styleInput").value = localStorage.getItem("style") || "";
});

function processScript() {
  const script = document.getElementById("scriptInput").value.trim();
  const format = document.getElementById("formatSelect").value;
  const style = document.getElementById("styleInput").value.trim();
  const output = document.getElementById("output");

  if (!script) {
    alert("Please paste your script first.");
    return;
  }

  localStorage.setItem("script", script);
  localStorage.setItem("format", format);
  localStorage.setItem("style", style);

  const sceneBlocks = splitIntoScenes(script, 3);
  output.innerHTML = "";

  sceneBlocks.forEach((line, index) => {
    const prompt = generatePrompt(line, format);
    const sceneDiv = document.createElement("div");
    sceneDiv.className = "scene-block";
    sceneDiv.setAttribute("draggable", "true");
    sceneDiv.dataset.index = index;

    sceneDiv.innerHTML = `
      <h3>Scene ${index + 1}</h3>
      <p><strong>EN:</strong> ${line}</p>
      <p><strong>RU:</strong> ${translateToRussian(line)}</p>
      <label><strong>Prompt:</strong></label>
      <input type="text" id="prompt-${index}" value="${prompt}" style="width: 100%; padding: 6px; margin-top: 5px;" oninput="savePrompt(${index}, this.value)" />
      <button onclick="generateImage(${index})" style="margin-top: 10px;">🎨 Сгенерировать изображение</button>
      <input type="file" accept="image/*" onchange="uploadCustomImage(event, ${index})" style="margin-top: 10px;" />
      <div id="image-${index}" style="margin-top: 10px;"></div>
    `;
    output.appendChild(sceneDiv);
  });

  enableDragDrop();
}

function savePrompt(index, value) {
  localStorage.setItem(`prompt-${index}`, value);
}

function splitIntoScenes(text, secondsPerScene = 3) {
  const words = text.split(/\s+/).length;
  const wordsPerSecond = 2.2;
  const totalSeconds = words / wordsPerSecond;
  const totalScenes = Math.ceil(totalSeconds / secondsPerScene);

  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const scenes = [];
  let currentScene = "";
  let avgSentencesPerScene = Math.max(1, Math.floor(sentences.length / totalScenes));

  for (let i = 0; i < sentences.length; i++) {
    currentScene += sentences[i].trim() + " ";
    if ((i + 1) % avgSentencesPerScene === 0 || i === sentences.length - 1) {
      scenes.push(currentScene.trim());
      currentScene = "";
    }
  }

  return scenes;
}

function generatePrompt(text, format) {
  const base = "Cinematic scene, storytelling,";
  const aspect = format === "9:16" ? "vertical frame" : "landscape format";
  const globalStyle = document.getElementById("styleInput").value.trim();
  const stylePart = globalStyle ? `, ${globalStyle}` : "";
  return `${base} ${text}, ${aspect}${stylePart}`;
}

function translateToRussian(text) {
  return "Автоперевод: " + text.split(" ").reverse().join(" ");
}

function uploadCustomImage(event, index) {
  const file = event.target.files[0];
  const imageContainer = document.getElementById(`image-${index}`);
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    imageContainer.innerHTML = `<img src="${e.target.result}" alt="Custom Upload" style="max-width:100%; border-radius:10px;" />`;
  };
  reader.readAsDataURL(file);
}

async function generateImage(index) {
  const promptInput = document.getElementById(`prompt-${index}`);
  const prompt = promptInput.value;
  const imageContainer = document.getElementById(`image-${index}`);

  imageContainer.innerHTML = "⏳ Генерация изображения...";

  const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1?wait_for_model=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!response.ok) {
    imageContainer.innerHTML = "❌ Ошибка генерации изображения.";
    return;
  }

  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated" style="max-width:100%; border-radius:10px;" />`;
}

function downloadPDF() {
  const element = document.getElementById("output");
  const opt = {
    margin: 0.5,
    filename: 'storyboard.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

function enableDragDrop() {
  const container = document.getElementById("output");
  let dragged;

  container.querySelectorAll(".scene-block").forEach(block => {
    block.addEventListener("dragstart", e => {
      dragged = block;
      e.dataTransfer.effectAllowed = "move";
    });

    block.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    block.addEventListener("drop", e => {
      e.preventDefault();
      if (dragged && dragged !== block) {
        container.insertBefore(dragged, block.nextSibling);
      }
    });
  });
}

function exportJSON() {
  const script = document.getElementById("scriptInput").value;
  const format = document.getElementById("formatSelect").value;
  const style = document.getElementById("styleInput").value;

  const prompts = [];
  const blocks = document.querySelectorAll(".scene-block");
  blocks.forEach((block, index) => {
    const en = block.querySelector("p:nth-of-type(1)").textContent.replace("EN:", "").trim();
    const ru = block.querySelector("p:nth-of-type(2)").textContent.replace("RU:", "").trim();
    const prompt = document.getElementById(`prompt-${index}`)?.value || "";
    prompts.push({ en, ru, prompt });
  });

  const jsonData = {
    script,
    format,
    style,
    scenes: prompts
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "storyboard-project.json";
  link.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const json = JSON.parse(e.target.result);

    document.getElementById("scriptInput").value = json.script || "";
    document.getElementById("formatSelect").value = json.format || "9:16";
    document.getElementById("styleInput").value = json.style || "";

    localStorage.setItem("script", json.script || "");
    localStorage.setItem("format", json.format || "9:16");
    localStorage.setItem("style", json.style || "");

    const output = document.getElementById("output");
    output.innerHTML = "";

    json.scenes.forEach((scene, index) => {
      const sceneDiv = document.createElement("div");
      sceneDiv.className = "scene-block";
      sceneDiv.setAttribute("draggable", "true");

      sceneDiv.innerHTML = `
        <h3>Scene ${index + 1}</h3>
        <p><strong>EN:</strong> ${scene.en}</p>
        <p><strong>RU:</strong> ${scene.ru}</p>
        <label><strong>Prompt:</strong></label>
        <input type="text" id="prompt-${index}" value="${scene.prompt}" style="width: 100%; padding: 6px; margin-top: 5px;" oninput="savePrompt(${index}, this.value)" />
        <button onclick="generateImage(${index})" style="margin-top: 10px;">🎨 Сгенерировать изображение</button>
        <input type="file" accept="image/*" onchange="uploadCustomImage(event, ${index})" style="margin-top: 10px;" />
        <div id="image-${index}" style="margin-top: 10px;"></div>
      `;
      output.appendChild(sceneDiv);
    });

    enableDragDrop();
  };

  reader.readAsText(file);
}
