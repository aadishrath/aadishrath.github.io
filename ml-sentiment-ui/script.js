
/**
 * script.js
 *
 * Frontend logic for the ML Sentiment Analysis card.
 * Demonstrates:
 *  - Clean async/await API calls
 *  - Error handling
 *  - DOM manipulation
 *  - Separation of UI and backend logic
 */

const API_URL = "http://127.0.0.1:8000/predict"; 
// Update this if you deploy your FastAPI app elsewhere

document.getElementById("ml-analyze-btn").addEventListener("click", async () => {
  const text = document.getElementById("ml-input").value.trim();
  const resultBox = document.getElementById("ml-result");

  if (!text) {
    resultBox.textContent = "Please enter some text first.";
    return;
  }

  try {
    // Send POST request to FastAPI
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error("Server returned an error");
    }

        const data = await response.json();

    const sentiment = data.sentiment;
    const confidence = data.confidence;

    // Clear previous content
    resultBox.innerHTML = "";

    // Create badge element
    const badge = document.createElement("span");
    badge.classList.add("sentiment-badge");

    if (sentiment.toLowerCase().includes("pos")) {
      badge.classList.add("sentiment-positive");
    } else if (sentiment.toLowerCase().includes("neg")) {
      badge.classList.add("sentiment-negative");
    } else {
      badge.classList.add("sentiment-neutral");
    }

    const confidenceText =
      typeof confidence === "number"
        ? ` (confidence: ${(confidence * 100).toFixed(1)}%)`
        : "";

    badge.textContent = `${sentiment}${confidenceText}`;

    resultBox.appendChild(badge);

  } catch (err) {
    resultBox.textContent = "Error: Could not reach ML API.";
    console.error(err);
  }
});
