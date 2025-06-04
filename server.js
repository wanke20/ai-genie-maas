import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const endpoint = "https://ssrvcs-apim-dev-use-01.azure-api.net";
const subscriptionKey = "d1c3b9ea73ca43c9b06bb1c01117c845";
const apiVersion = "2025-01-01-preview";

const deployments = [
  "claude-3-7-sonnet-20250219", 
  "gpt-4o", 
  "gpt-4o-mini"
];

app.use(express.static("public"));
app.use(bodyParser.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const results = {};

  await Promise.all(deployments.map(async (model) => {
    try {
      let url, payload;

      url = `${endpoint}/openai/deployments/${model}/chat/completions?api-version=${apiVersion}`;
      if (model.startsWith("claude")) {
        payload = {
          model: model,
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 1024
        };
      } else {
        payload = {
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userMessage }
          ],
          max_tokens: 200,
          temperature: 1.0,
          top_p: 1.0
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "api-key": subscriptionKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      results[model] = content;

    } catch (err) {
      results[model] = `Error: ${err.message}`;
    }
  }));

  res.json(results);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
