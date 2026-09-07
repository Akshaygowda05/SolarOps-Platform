import Groq from "groq-sdk";
import envconfig from "../config/envConfig";
import { MessageRole } from "@prisma/client";

export enum ChatMessageRole {
  system = "system",
  user = "user",
  assistant = "assistant"
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



export async function classifyIntent(
    messages: ChatMessagePayload[],
    model: string = "openai/gpt-oss-20b"
) {

    const systemPrompt: ChatMessagePayload = {
        role: ChatMessageRole.system,

        content: `
You are an intent classifier for AegeusConnect JARVIS.

Return ONLY one of these values:

DEVICE_STATUS
DEVICE_ANALYTICS
DEVICE_TRIGGERING
GATEWAY_STATUS
SYSTEM_HEALTH
REPORTS
TELEMETRY
PLATFORM_HELP
OUT_OF_SCOPE
`
    };

    const response = await client.chat.completions.create({
        model,

        messages: [
            systemPrompt,
            ...messages
        ],

        temperature: 0
    });

    return response.choices[0].message.content;
}

export async function createAgenticResponse(){
    
}




