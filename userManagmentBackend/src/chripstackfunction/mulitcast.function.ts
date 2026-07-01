import apiClient from "../config/apiclient";

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

export async function serachMulticastSerach(applicationId:string,query:string){


    try {
        const result = await apiClient.get('/api/multicast-groups',{
             params: {
        limit: 100,
        applicationId: applicationId
      }
        })

        const groups = result.data.result;

          const matches = groups.filter((group: any) =>
    group.name.toLowerCase().includes(query.toLowerCase())
  );

  return matches

    } catch (error) {
        return  []
    }
}