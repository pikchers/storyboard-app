// Файл script.js — Storyboard Generator с генерацией через Hugging Face

document.getElementById("upload").addEventListener("change", handleFileUpload);
document.getElementById("generate-scenes").addEventListener("click", generateScenes);

let scenes = [];

function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    document.getElementById("script").value = text;
  };
  reader.readAsText(file);
}

function generateScenes() {
  const scriptText = document.getElementById("script").value.trim();
  if (!scriptText) return;

  const words = scriptText.split(/\s+/);
  const wordsPerScene = 40; // Примерно 3 секунды
  const sceneCount = Math.ceil(words.length / wordsPerScene);

  scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    const sceneWords = words.slice(i * wordsPerScene, (i + 1) * wordsPerScene);
    const sceneText = sceneWords.join(" ");
    scenes.push({ text: sceneText, prompt: sceneText, image: null });
  }

  renderScenes();
}

function renderScenes() {
  const container = document.getElementById("scenes");
  container.innerHTML = "";

  scenes.forEach((scene, index) => {
    const sceneBlock = document.createElement("div");
    sceneBlock.className = "scene-block";

    const title = document.createElement("h3");
    title.innerText = `Scene ${index + 1}`;

    const text = document.createElement("p");
    text.innerText = scene.text;

    const image = document.createElement("img");
    image.id = `image-${index}`;
    image.src = scene.image || "";
    image.alt = "Scene image";
    image.style.maxWidth = "100%";

    const promptInput = document.createElement("textarea");
    promptInput.value = scene.prompt;
    promptInput.addEventListener("input", (e) => {
      scenes[index].prompt = e.target.value;
    });

    const generateBtn = document.createElement("button");
    generateBtn.innerText = "🎨 Сгенерировать изображение";
    generateBtn.onclick = () => generateImage(scene.prompt, index);

    sceneBlock.appendChild(title);
    sceneBlock.appendChild(text);
    sceneBlock.appendChild(promptInput);
    sceneBlock.appendChild(generateBtn);
    sceneBlock.appendChild(image);
    container.appendChild(sceneBlock);
  });
}

async function generateImage(prompt, sceneIndex) {
  const apiUrl = "https://Bezuh-storyboard-generator.hf.space/run/predict";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data: [prompt] })
    });

    const result = await response.json();

    if (result && result.data && result.data[0]) {
      const imageData = result.data[0];
      const imageUrl = `data:image/png;base64,${imageData}`;

      scenes[sceneIndex].image = imageUrl;
      document.getElementById(`image-${sceneIndex}`).src = imageUrl;
    } else {
      alert("Ошибка генерации изображения.");
    }
  } catch (error) {
    alert("Ошибка связи с генератором.");
    console.error(error);
  }
}
