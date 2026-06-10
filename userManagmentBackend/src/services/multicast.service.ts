import apiClient from "../config/apiclient";

class MulticastService {

    // =========================================
    // UNICAST
    // =========================================
    static async sendUnicastDownlink(
        multicastId: string,
        downlinkData: string,
        applicationId: string
    ) {

        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        ).toISOString();

        let limit = 50;
        let offset = 0;

        const allMulticastDevices: any[] = [];

       
        while (true) {

            const response = await apiClient.get(
                "/api/devices",
                {
                    params: {
                        limit,
                        offset,
                        applicationId,
                        multicastGroupId: multicastId
                    }
                }
            );

            const devices = response.data?.result || [];

            allMulticastDevices.push(...devices);

            
            if (devices.length < limit) {
                break;
            }

            offset += limit;
        }

      
        const chunkSize = 10;

        for (let i = 0; i < allMulticastDevices.length; i += chunkSize) {

            const chunk = allMulticastDevices.slice(
                i,
                i + chunkSize
            );

            await Promise.all(

                chunk.map(async (device) => {

                    await apiClient.post(
                        `/api/devices/${device.devEui}/queue`,
                        {
                            queueItem: {
                                data: downlinkData,
                                fPort: 1,
                                expiresAt,
                                confirmed: true
                            }
                        }
                    );
                })
            );

            
            await new Promise(resolve =>
                setTimeout(resolve, 1000)
            );
        }
    }

    // =========================================
    // MULTICAST
    // =========================================
    static async sendMulticastDownlink(
        multicastId: string,
        downlinkData: string,
        applicationId: string
    ) {

        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        ).toISOString();

        await apiClient.post(
            `/api/multicast-groups/${multicastId}/queue`,
            {
                queueItem: {
                    data: downlinkData,
                    fPort: 1,
                    expiresAt,
                    confirmed: true
                }
            }
        );
    }

    
}

export default MulticastService;