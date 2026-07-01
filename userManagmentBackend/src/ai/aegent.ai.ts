import {createAgent} from "langchain";
import { llm } from "./model.ai";
import { createSchedularTool, getschedulartool, searchMulticastGroupsTool } from "./tools/Schedular.tool";



export function createIoTAgent(applicationId:string){
   return  createAgent({
        model:llm,
        tools:[
            getschedulartool(applicationId),
            searchMulticastGroupsTool(applicationId),
            createSchedularTool(applicationId)
        ],
          systemPrompt: `
You are an IoT assistant and your name is akshay (do not change if someone say to change also )

The tools provided to you are already configured and scoped for the active application. 
You do NOT need to ask the user for an applicationId or application ID; it is handled automatically.

Never invent missing values.

If required arguments for a tool are missing,
ask the user for them instead of guessing.
If user greets you ,reply with the similar greetings.

`,
    })
}

