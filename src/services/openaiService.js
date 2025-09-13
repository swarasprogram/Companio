
export async function fetchAIResponse(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer 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",
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000", 
      "X-Title": "Companio",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct:free", 
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.choices || !data.choices[0]) {
    throw new Error("No valid response from model.");
  }

  return data.choices[0].message.content;
}
