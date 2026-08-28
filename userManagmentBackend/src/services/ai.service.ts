import Groq from "groq-sdk";
import envconfig from "../config/envConfig";
import { MessageRole } from "@prisma/client";

export enum ChatMessageRole {
  system = "system",
  user = "user",
  assistant = "assistant"
}


 export async function checkModels() {
    const models = await client.models.list();

    console.log(
        models.data.map((model) => model.id)
    );
}

const client = new Groq({
    apiKey:envconfig.getLllmApiKey()
})

export function  toChatMessageRole(role:MessageRole):ChatMessageRole {
    switch(role) {
        case MessageRole.USER:
            return ChatMessageRole.user
        case MessageRole.SYSTEM:
            return ChatMessageRole.system;
        case MessageRole.ASSISTANT:
            return ChatMessageRole.assistant

        default:
            throw new Error(`Unsupported message role: ${role}`);
    }
}


export interface ChatMessagePayload{
    role:ChatMessageRole,
    content:string
}



export async function createChatStream(messages:ChatMessagePayload[],model:string = "openai/gpt-oss-20b") {

    // this si the another message it will help to llm to think about it what kind of answer llm has to give with old messages
  const systemPrompt: ChatMessagePayload = {
  role: ChatMessageRole.system,
  content:
    "You are an IoT expert familiar with ChirpStack Network Server and its APIs. Your name is JARVIS.",
};



   return await client.chat.completions.create({
   model,
   messages:[systemPrompt, ...messages],
   stream:true
   })
}

