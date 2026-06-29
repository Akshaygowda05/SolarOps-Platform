// here i have create this temparvary map tp test it out 


import axios from "axios";
import { Message,ToolResponse } from "../types/ai.types";
import { systemPrompt } from "../prompts/system.prompt";

const conversation = new Map<string, Message[]>();


export class AIService {
  static async generate(prompt:string,applicationId:string):Promise<ToolResponse> {

    let history = conversation.get(applicationId) || [];
    console.log("this is what i send to it", prompt)

    history.push({
      role:"user",
      content:prompt
   } )


    const airesponse = await axios.post(
      "http://127.0.0.1:11434/api/chat",
      {
        model: "qwen3:1.7b",
        messages:[

          {
            role:"system",
            content:systemPrompt,
          },

          ...history
      
        ],
        stream: false,
        
      }
    );

   history.push({
  role: "assistant",
  content: airesponse.data.message.content
});


console.log(airesponse.data.message.content)

console.log(airesponse.data.message.thinking)

    return airesponse.data.message.content
  }
}