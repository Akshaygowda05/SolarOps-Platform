import logger from "../config/logger";
import { getApplicationByGrpc } from "./getApplicatonGrpc.services"
import { syncAllDevices } from "./SyncDevies.services"

export const getApplicationId = async(tenantId:string) =>{
    const application = await getApplicationByGrpc(tenantId)
    for(const  app of application.resultList){
        logger.info(`Processing application: ${app.id}`);
        await syncAllDevices(app.id,tenantId)
    }
}