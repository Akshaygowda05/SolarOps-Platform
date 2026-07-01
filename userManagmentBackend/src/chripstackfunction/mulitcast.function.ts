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

export async function serachMulticastSerach(applicationId: string, query: string) {
  try {
    const result = await apiClient.get('/api/multicast-groups', {
      params: {
        limit: 100,
        applicationId: applicationId
      }
    });

    const groups = result.data?.result || [];

    const matches = groups.filter((group: any) =>
      group.name?.toLowerCase().includes(query.toLowerCase())
    );

    console.log("👉 MATCHES FOUND IN SERVICE:", matches);

    // ✅ Correct check: An empty array has a length of 0
    if (matches.length === 0) {
      return {
        success: false,
        message: `No multicast groups found matching the query "${query}". Please check the name.`
      };
    }

    return matches;

  } catch (error: any) {
    console.error("❌ CHIRPSTACK API ERROR:", error.response?.data || error.message);
    throw new Error(`Chirpstack API communication failed: ${error.response?.data?.message || error.message}`);
  }
}