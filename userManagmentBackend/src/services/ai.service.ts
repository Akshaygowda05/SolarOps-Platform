

import axios from "axios";

export class AIService {
  static async ask(prompt: string) {
    const { data } = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "qwen3:1.7b",
        prompt,
        stream: false,
      }
    );

    return data.response;
  }
}