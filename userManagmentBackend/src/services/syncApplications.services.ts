import { getApplicationByGrpc } from "./getApplicatonGrpc.services"

const getApplicationId = async(tenantId:string) =>{
    const application = await getApplicationByGrpc(tenantId)
    for(const  app of application.resultList){
          
    }
}