import { getApplicationByGrpc } from "./getApplicatonGrpc.services"
import { syncAllDevices } from "./SyncDevies.services"

export const getApplicationId = async(tenantId:string) =>{
    const application = await getApplicationByGrpc(tenantId)
    for(const  app of application.resultList){
        console.log(app)
          syncAllDevices(app.id,tenantId)
    }
}