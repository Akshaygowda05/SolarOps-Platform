import apiClient from "../config/apiclient";

export async function getmulticastgroups(applicationId:string,limit:Number) {

  console.log("i am here at getting id by name")
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

   // hrere i need ot retrun all the repsone let llm devide it 

   const simplifiedGroups = groups.map((group: any) => ({
  id: group.id,
  name: group.name,
}));

console.log("this is somrthing i need to check on what kind of data i am getting ",simplifiedGroups)

return simplifiedGroups
  

  } catch (error: any) {
    console.error("❌ CHIRPSTACK API ERROR:", error.response?.data || error.message);
    throw new Error(`Chirpstack API communication failed: ${error.response?.data?.message || error.message}`);
  }
}