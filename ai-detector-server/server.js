import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "5mb" }));

app.post("/aiclassify", async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "Missing image" });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [{ role: "user", content: [{ type: "input_image", image_url: image }] }],
        response_format: { type: "json_schema", json_schema: {
          name: "ai_classification",
          schema: {
            type: "object",
            properties: {
              label: { type: "string", enum: ["AI", "Real"] },
              confidence: { type: "number" }
            },
            required: ["label", "confidence"]
          }
        }}
      })
    });

    const data = await response.json();
    res.json(data.output[0].content[0].json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Classification failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));