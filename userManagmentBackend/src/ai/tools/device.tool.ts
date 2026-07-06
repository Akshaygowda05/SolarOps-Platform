import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getbatteryvoltage, searchDevEui, sendDownlinkTodevice } from "../../Aifunction/devices.function";

export function serchDeviceDevEui(applicationId: string) {
    return tool(
        async ({ query }) => {
            try {
                const response = await searchDevEui(applicationId, query);

                
                if (!response || response.length === 0) {
                    return JSON.stringify({
                        status: "not_found",
                        message: `No device matching '${query}' was found in this application.`
                    });
                }

                let exactMatch = response.find((d:any) => d.name.toLowerCase() === query.toLowerCase())

                // If found, return the list of devices (contains name and devEui)

                if(exactMatch){
                return JSON.stringify({
                    status: "success",
                    devices: response.map((d: any) => ({ name: d.name, devEui: d.devEui }))
                });
            }
            else{
                return JSON.stringify({
                    status: "not_found",
                    message: `No device matching '${query}' was found in this application.`
                });
            }

            } catch (error: any) {
                return JSON.stringify({
                    status: "error",
                    message: `Failed to search devEui: ${error.message}`
                });
            }
        }, {
            name: "getdeviceDevEui",
            description: "Find the unique devEui hardware ID using a device name or query. Essential before fetching battery info.",
            schema: z.object({
                query: z.string().describe("The name of the device (e.g., 'Robot 20')")
            })
        }
    );
}

export function getDevicebattery(applicationID: string) {
    return tool(
        async ({ devEui }) => {
            try {
                const result = await getbatteryvoltage(applicationID, devEui);

                // 🛑 CASE 2: Handle device exists but battery voltage telemetry data is missing
                if (!result || !result.batteryVoltage) {
                    return JSON.stringify({
                        status: "no_data",
                        devEui: devEui,
                        message: "The device exists but has not reported any battery voltage telemetry data yet."
                    });
                }

                return JSON.stringify({
                    status: "success",
                    devEui: devEui,
                    batteryVoltage: result.batteryVoltage
                });
            } catch (error: any) {
                return JSON.stringify({
                    status: "error",
                    message: `Failed to fetch battery data for devEui ${devEui}: ${error.message}`
                });
            }
        }, {
            name: "getthebatteryVoltage",
            description: "Get the battery voltage of a device using its devEui.",
            schema: z.object({
                devEui: z.string().describe("The unique devEui hardware identifier.")
            })
        }
    );
}


export function sendCommandToDevice(applicationID: string) {
    return tool(
        async ({ devEui, data }) => {
            try {

                 const payloadMap: Record<string, string> = {
          start: "Ag==",
          stop: "Aw==",
          dock: "BA==",
          return: "BQ==",
        };

        let devicepayload = payloadMap[data.toLowerCase()];

        if(!devicepayload){
            return JSON.stringify({
                status: "error",
                message: "Invalid command"
            });
        }
                const result = await sendDownlinkTodevice(applicationID, devEui, devicepayload);
                return JSON.stringify({
                    status: "success",
                    devEui: devEui,
                    message: result?.result || "Command queued successfully"
                });
            } catch (error: any) {
                return JSON.stringify({
                    status: "error",
                    message: `Failed to send downlink command to device ${devEui}: ${error.message}`
                });
            }
        }, {
            name: "sendDownlinkToDevices",
            description: "send downlink to the devices for that we need devEui and data as paramters like start, stop and retrun to dock ",
            schema: z.object({
                devEui: z.string().describe("The unique devEui hardware identifier."),
                data: z.string().describe("The data to be sent to the device")
            })
        }
    );
}

