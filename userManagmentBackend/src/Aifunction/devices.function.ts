import apiClient from "../config/apiclient";
import { getRedisClient, storeApplicationEvents } from "../config/redis";

const redis = getRedisClient()
export async function searchDevEui(applicationId:string,query:string){
    try {

        //console.log("i need to check what name i got here",query)
        const result = await apiClient.get("/api/devices",{
            params:{
                search:query,
                applicationId:applicationId,
                limit:100

            }
        })

        const response = result.data.result || [];
        console.group("to get battery of the devices",response)
        

        return response
    } catch (error:any) {
    console.error("❌ CHIRPSTACK API ERROR:", error.response?.data || error.message);
     throw new Error(`Chirpstack API communication failed: ${error.response?.data?.message || error.message}`);
        
    }
}


export async function getbatteryvoltage(applicationId:string,devEui:string){
    try {
        const data = await redis.hgetall(`device:${devEui}`);
        console.log("😎this is to get the data for the particular devie",data)

        const battery = data?.["CH5"] || null;

        return {
            devEui,
            batteryVoltage: battery
        };
    } catch (error) {
        
    }
}


export async function sendDownlinkTodevice(applicationID:string,devEui:string,data:string) {
    try {
        const downlinkresponse = await apiClient.post(
            `api/devies/${devEui}/queue`,
            {
                downlink:{
                    data,
                    fPort:1,    
                    confirmed:false
                }
            }
        )

        const deviceResponse = await apiClient.get(`/api/devices/${devEui}`);
        const name = deviceResponse.data.name;


          await storeApplicationEvents(applicationID, JSON.stringify({ type: 'DOWNLINK_QUEUED',name, timeStamp: new Date().toISOString() })); 
        return downlinkresponse.data
    } catch (error) {
        
    }
}