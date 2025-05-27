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
