function processScript() {
  const script = document.getElementById("scriptInput").value.trim();
  const format = document.getElementById("formatSelect").value;
  const output = document.getElementById("output");

  if (!script) {
    alert("Please paste your script first.");
    return;
  }

  // Пример простого разделения по предложениям (можно заменить на сцены)
  const lines = script.split(/\n\n+|\.\s+/); // деление по абзацам или точкам
  output.innerHTML = "";

  lines.forEach((line, index) => {
    if (line.trim().length === 0) return;

    const sceneDiv = document.createElement("div");
    sceneDiv.className = "scene-block";
    sceneDiv.innerHTML = `
      <h3>Scene ${index + 1}</h3>
      <p><strong>EN:</strong> ${line}</p>
      <p><strong>RU:</strong> ${translateToRussian(line)}</p>
      <p><strong>Prompt:</strong> <em>${generatePrompt(line, format)}</em></p>
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
  // Заглушка — "перевод" вручную (можно заменить на API или ChatGPT)
  return "🔄 (перевод будет здесь)";
}
