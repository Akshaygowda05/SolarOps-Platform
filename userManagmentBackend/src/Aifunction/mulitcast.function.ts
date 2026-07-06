import { Blocktriggering } from "@prisma/client";
import apiClient from "../config/apiclient";
import { prisma } from "../config/primsaConfig";

export async function getmulticastgroups(applicationId:string,limit:Number) {

    try {
        const response = await apiClient.get('/api/multicast-groups', {
      params: {
        limit: limit || 100,
        applicationId: applicationId,
      }
    });

    return response.data
    } catch (error) {
        return error
    }
}

export async function serachMulticastSerach(applicationId: string) {
  try {
    const result = await apiClient.get('/api/multicast-groups', {
      params: {
        limit: 100,
        applicationId: applicationId
      }
    });

    const groups = result.data?.result || [];

   console.log("this is something i need to work oin🥇🥇🥇🥇🥇🥇🥇 ",groups)

   const simplifiedGroups = groups.map((group: any) => ({
  id: group.id,
  name: group.name,
}));

console.log("this is something i need to check on what kind of data i am getting ",simplifiedGroups)

return simplifiedGroups
  

  } catch (error: any) {
    console.error("❌ CHIRPSTACK API ERROR:", error.response?.data || error.message);
    throw new Error(`Chirpstack API communication failed: ${error.response?.data?.message || error.message}`);
  }
}

export async function downlinkMulticast(applicationId:string,multicastID:string,data:string){
  try {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const siteConfiguration = await prisma.siteConfiguration.findFirst({
      where:{
        applicationId
      },
      select:{
        triggeringAction:true,
        sendTwiceAday:true,
        isConfigured:true
      },
      orderBy:{
        createdAt:"desc"
      }
    })

    let triggering = Blocktriggering.MULTICAST

    if(triggering == Blocktriggering.MULTICAST){
    const response = await apiClient.post(`/api/multicast-groups/${multicastID}/queue`, {
                queueItem: {
                    data,
                    fPort: 1,
                    expiresAt,
                    confirmed: true,
                }
    });
     return response.data;
  }else{
    return {
      success:false,
      message:"i cannot able to send unicast to all devices ,please do it manually in the group triggering section"
    }
  }

   
  } catch (error: any) {
    console.error("❌ CHIRPSTACK API ERROR:", error.response?.data || error.message);
    throw new Error(`Chirpstack API communication failed: ${error.response?.data?.message || error.message}`);
  }
}