import {createAgent} from "langchain";
import { llm } from "./model.ai";
import { getschedulartool } from "./tools/Schedular.tool";



export function createIoTAgent(applicationId:string){
   return  createAgent({
        model:llm,
        tools:[
            getschedulartool(applicationId)
        ],
          systemPrompt: `
You are an IoT assistant.

Never invent missing values.

If required arguments for a tool are missing,
ask the user for them instead of guessing.
`,
    })
}

