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
      <p><strong>Prompt:</strong> <em>${prompt}</em></p>
      <img src="https://via.placeholder.com/400x700.png?text=Scene+${index + 1}" alt="Generated Image" style="width:100%; max-width:400px; border-radius:8px; margin-top:10px;" />
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
