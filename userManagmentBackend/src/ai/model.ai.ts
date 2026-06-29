import { ChatOllama } from "@langchain/ollama";

export const llm = new ChatOllama({
  model: "qwen3:1.7b",
  temperature: 0,
});

