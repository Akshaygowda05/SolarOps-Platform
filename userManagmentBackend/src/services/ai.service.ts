import Groq from "groq-sdk";
import envconfig from "../config/envConfig";
import { MessageRole } from "@prisma/client";

const client = new Groq({
    apiKey:envconfig.getLllmApiKey()
})


export interface ChatMessagePayload{
    role:MessageRole,
    content:String
}



export async function createChatStream(mesage:ChatMessagePayload,model:string = "llama-3.1-8b-instant") {
   const sys 
}

