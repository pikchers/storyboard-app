function processScript() {
  const script = document.getElementById("scriptInput").value.trim();
  const format = document.getElementById("formatSelect").value;
  const output = document.getElementById("output");

  if (!script) {
    alert("Please paste your script first.");
    return;
  }

  const sceneBlocks = splitIntoScenes(script, 3); // 3 секунды на сцену
  output.innerHTML = "";

  sceneBlocks.forEach((line, index) => {
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
      <input type="file" accept="image/*" onchange="uploadCustomImage(event, ${index})" style="margin-top: 10px;" />
      <div id="image-${index}" style="margin-top: 10px;"></div>
    `;
    output.appendChild(sceneDiv);
  });
}

// 🧠 Авторазбиение на сцены (учитывает длительность речи)
function splitIntoScenes(text, secondsPerScene = 3) {
  const words = text.split(/\s+/).length;
  const wordsPerSecond = 2.2; // средняя скорость речи (~130 слов/мин)
  const totalSeconds = words / wordsPerSecond;
  const totalScenes = Math.ceil(totalSeconds / secondsPerScene);

  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text]; // делим по предложениям
  const scenes = [];
  let currentScene = "";
  let sceneCount = 0;
  let avgSentencesPerScene = Math.max(1, Math.floor(sentences.length / totalScenes));

  for (let i = 0; i < sentences.length; i++) {
    currentScene += sentences[i].trim() + " ";
    if ((i + 1) % avgSentencesPerScene === 0 || i === sentences.length - 1) {
      scenes.push(currentScene.trim());
      currentScene = "";
      sceneCount++;
    }
  }

  return scenes;
}

function generatePrompt(text, format) {
  const base = "Cinematic scene, storytelling,";
  const aspect = format === "9:16" ? "vertical frame" : "landscape format";
  return `${base} ${text}, ${aspect}`;
}

function translateToRussian(text) {
  return "Автоперевод: " + text.split(" ").reverse().join(" ");
}

function uploadCustomImage(event, index) {
  const file = event.target.files[0];
  const imageContainer = document.getElementById(`image-${index}`);

  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    imageContainer.innerHTML = `<img src="${e.target.result}" alt="Custom Upload" style="max-width:100%; border-radius:10px;" />`;
  };
  reader.readAsDataURL(file);
}

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

function downloadPDF() {
  const element = document.getElementById("output");
  const opt = {
    margin:       0.5,
    filename:     'storyboard.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}
