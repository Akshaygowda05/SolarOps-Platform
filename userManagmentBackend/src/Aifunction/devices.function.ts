import apiClient from "../config/apiclient";
import { getRedisClient, storeApplicationEvents } from "../config/redis";
const THIRTY_MINUTES = 30 * 60 * 1000; 

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

        console.log("this is somethung i am confused with 🙎🏻‍♂️🙎🏻‍♂️🙎🏻‍♂️🙎🏻‍♂️🙎🏻‍♂️🙎🏻‍♂️ ",applicationId,devEui)
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

        console.info("i am here at the sendDonwlink to devices to check 🤸🏻🤸🏻🤸🏻🤸🏻🤸🏻",applicationID,devEui,data)
  const now = new Date()
        const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
              const downlinkresponse = await apiClient.post(
            `/api/devices/${devEui}/queue`,{
              queueItem: {
                data,
                fPort: 1,
                expiresAt,
                confirmed: true,

            }
        }
        );

        console.log("this is the response from the downlink",downlinkresponse.data)

        const deviceResponse = await apiClient.get(`/api/devices/${devEui}`);

        console.log(
            "this is the response from the device",
            deviceResponse.data 
        )
        const name = deviceResponse.data.name;


          await storeApplicationEvents(applicationID, JSON.stringify({ type: 'DOWNLINK_QUEUED',name, timeStamp: new Date().toISOString() })); 
        return downlinkresponse.data
    } catch (error) {
        
    }
}