import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const endpoint = "https://ssrvcs-apim-dev-use-01.azure-api.net";
const apiKey = "d1c3b9ea73ca43c9b06bb1c01117c845";
const apiVersion = "2025-01-01-preview";

const deployments = ["gpt-4o", "gpt-4o-mini"]; // Add "claude-..." if supported

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const results = {};

  await Promise.all(deployments.map(async (model) => {
    try {
      const response = await fetch(
        `${endpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`,
        {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: userMessage }],
            max_tokens: 200,
            temperature: 1.0,
            top_p: 1.0
          })
        }
      );
      const data = await response.json();
      results[model] = data.choices[0].message.content;
    } catch (err) {
      results[model] = `Error: ${err.message}`;
    }
  }));

  res.json(results);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
