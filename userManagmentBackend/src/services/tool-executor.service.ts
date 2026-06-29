import { ToolResponse } from "../types/ai.types"
import { SchedulerServiceInstance } from "./schedular.service"

export async function toolExecuter(tool:ToolResponse){

    console.log("i need to decide which fucntion i need to run ",tool)
    console.log("this is where iam getting error ",tool.tool);
    
    switch(tool.tool){
        case "getSchedular":
            return SchedulerServiceInstance.getDummySchedularForAi()
        default:
            return{
                sucess:false,
                error:tool.error
            }
    }
}