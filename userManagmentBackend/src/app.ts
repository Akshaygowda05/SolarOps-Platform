import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
  try {
    console.log("Connecting to Groq API...\n");

    const stream = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "user",
          content: "Hello! Reply with a short message confirming you are working.",
        },
      ],
      temperature: 1,
      max_completion_tokens: 100,
      stream: true,
    });

    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }

    console.log("\n\nTest succeeded!");
  } catch (error:any) {
    console.error("Test failed:", error.message);
  }
}

testGroq();