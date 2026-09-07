import Groq from "groq-sdk";
import { MessageRole } from "@prisma/client";
import envconfig from "../../config/envConfig";
import { jarvisTypes } from "../ai.types";
import { ChatMessagePayload, ChatMessageRole } from "../../services/ai.service";
import { devicetools } from "../tools/device.tool";

const client = new Groq({
    apiKey:envconfig.getLllmApiKey()
})



export class IntetnService {
    async classify (message:string){
        const response = await client.chat.completions.create({
            model:"openai/gpt-oss-20b",
            temperature:0,
            messages:[{
                role:"system",
                content:`
                You are an intent classifier for AegeusConnect JARVIS.

Your job is ONLY to classify the user's message.

Return exactly one of the following values:

DEVICE_STATUS
DEVICE_ANALYTICS
GATEWAY_STATUS
SCHEDULARS
REPORTS
TELEMETRY
PLATFORM_HELP
OUT_OF_SCOPE

Classification rules:

DEVICE_STATUS:
Questions about robot or device online/offline status,
battery status, current device state.

SCHEDULARS:
Question about the setting the schedular ,edititng ,deleting ,
either with Block wise or Robot wise.

DEVICE_ANALYTICS:
Questions about device performance, trends,
statistics, historical device analysis.

GATEWAY_STATUS:
Questions about LoRaWAN gateways,
gateway connectivity or gateway information.


REPORTS:
Questions about panels cleaned,
daily reports, historical reports,
analytics summaries.

TELEMETRY:
Questions about telemetry values,
sensor data, odometer, battery voltage,
device messages.

PLATFORM_HELP:
Questions about how to use AegeusConnect
and its features.

OUT_OF_SCOPE:
Everything unrelated to AegeusConnect.

Return ONLY the intent name.
                
                
               
                
                `
        },
    
    {
        role:"user",
        content:message
    }]
        })

        const intent = response.choices[0]?.message?.content?.trim()

        if(intent && Object.values(jarvisTypes).includes(intent as jarvisTypes)){
            return intent as jarvisTypes
        }

        return jarvisTypes.OUT_OF_SCOPE



    }
}
export async function createChatStream(messages:ChatMessagePayload[],model:string = "openai/gpt-oss-20b") {


  const systemPrompt: ChatMessagePayload = {
  role: ChatMessageRole.system,
  content:
    `You are JARVIS for AegeusConnect.

When the user mentions a specific robot or device,
use the available tool to extract the device name.

Do not invent a device name.
`
};



   return await client.chat.completions.create({
   model,
   messages:[systemPrompt, ...messages],
   stream:true,
   tools:devicetools,
   tool_choice: "auto"
   })
}


