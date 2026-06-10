
import MulticastService from "../services/multicast.service";
import { storeApplicationEvents } from "../config/redis";
import loggers from "../config/logger";

export async function sendUnicastDownlink(
  groupIds:[string],
  payload: string,
  applicationId: string
){

for (const id of groupIds) {
  try{

    await MulticastService.sendUnicastDownlink(
      id,
      payload,
      applicationId
    );
  }catch(groupError){

    loggers.error(
      `Failed group execution: ${id}`
    );
  }
}
}

export async function sendMulticastDownlink(
  groupIds:[string],
  groupNames:[string],
  payload: string,
  applicationId: string
){
  // here i need to send downlink to the  multicast group

  

  for (const id of groupIds) {
          try {
            await MulticastService.sendMulticastDownlink(
                id,
                payload,
                applicationId
              );

          } catch (groupError) {

            loggers.error(
              `Failed group execution: ${id}`
            );

            loggers.error(groupError);
          }
        }

         await storeApplicationEvents(
        applicationId,
        JSON.stringify({
          type: "scheduler_triggered",
          groups: groupNames,
          timeStamp: new Date().toISOString(),
        })
      );
}

export async function sendDownlink(
  groupIds: [string],
  payload: string,
  applicationId: string
){
  for (const id of groupIds) {
    try {
  
      // this has to dont in background thats it i dont want to be done anything
      await MulticastService.sendMulticastDownlink(
        id,
        payload,
        applicationId
      );

      await MulticastService.sendUnicastDownlink(
        id,
        payload,
        applicationId
      )
    }catch(groupError){

      loggers.error(
        `Failed group execution: ${id}`
      );
    }
  }
}