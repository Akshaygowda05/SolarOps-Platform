import loggers  from "../config/logger";
import { prisma } from "../config/primsaConfig";

async function deviceStateSync(payload:any) {

try{
  const now = new Date();
    
    const uplinkTime = payload?.time
    const devEui = payload?.deviceInfo?.devEui;
    const applicationId = payload?.deviceInfo?.applicationId;
    const tenantId = payload?.deviceInfo?.tenantId;
    const gatewayId = payload?.rxInfo[0]?.gatewayId;
    const deviceName = payload?.deviceInfo?.deviceName;

    const result = await prisma.deviceState.upsert({
        where:{

            deviceId:devEui
        },
        update:{
            lastSeen:uplinkTime,
            deviceName:deviceName,
            applicationId:applicationId,
            tenantId:tenantId,
            gatewayId:gatewayId,
            isOnline:true,
            updatedAt:now
        },
        create:{
            deviceId:devEui,
            lastSeen:uplinkTime,
            deviceName:deviceName,
            applicationId:applicationId,
            tenantId:tenantId,
            gatewayId:gatewayId,
            isOnline:true,
            updatedAt:now
        }
    })
    
    
     
}catch(error:any){
    loggers.info(`Error in deviceStateSync function: ${error.message}`);
}
}