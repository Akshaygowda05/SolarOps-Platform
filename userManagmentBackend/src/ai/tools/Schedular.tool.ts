import {tool} from "langchain"

import {z} from "zod"
import { SchedulerServiceInstance } from "../../services/schedular.service"


export const getschedulartool =(applicationId:string) =>{
    return tool(
        async () =>{

            const schedular = await SchedulerServiceInstance.getScheduler(applicationId);
            return JSON.stringify(schedular)
        },{
         name:"getSchedular",
        description:"returns all schedulars for the current application",
        schema: z.object({}),
        }
    )
}

export const createSchedular =(applicationId:string) =>{
    
}
// const schedular: Promise<{
//     id: number;
//     createdAt: Date;
//     updatedAt: Date;
//     time: Date;
//     data: string;
//     groupName: string[];
//     groupId: string[];
//     jobType: $Enums.JobType;
//     applicationId: string;
// }[]>





