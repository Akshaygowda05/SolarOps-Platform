
import { prisma } from "../config/primsaConfig";
import { getDevicesGrpc } from "./getDevicesGrpc.service"

export const syncAlldevices = async (Application:string) => {

    let offset = 0;
    let limit = 100;

    while(true){
        const devices = await getDevicesGrpc(
        Application,
        limit,
        offset
    )

    for(const device of devices.resultList){
  
        
    }


    if(devices.totalCount < offset){
        break
    }


    offset +=limit

   


    }
    
}