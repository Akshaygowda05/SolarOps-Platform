import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getbatteryvoltage, searchDevEui, sendDownlinkTodevice } from "../../Aifunction/devices.function";

export function serchDeviceDevEui(applicationId: string) {
    return tool(
        async ({ query }) => {
            try {

                console.log(" 🦹🏻🦹🏻🦹🏻🦹🏻🦹🏻🦹🏻🦹🏻🦹🏻i need to check where am i current i need to know why i am not getting any response",query)
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
     description: `
Use this tool whenever the user refers to a device by its name.

Input:
- Device name (for example: "Robot 1", "robot-20")

Output:
- The unique devEui for that device.

This tool MUST be called before any tool that requires a devEui, such as:
- getthebatteryVoltage
- sendDownlinkToDevices

Never guess or fabricate a devEui.
`,
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

            console.log("🏹 🏹 🏹 inside sendCommandToDevice tool 🏹 🏹 🏹",{devEui, data,applicationID})
            try {

        const payloadMap: Record<string, string> = {
          start: "Ag==",
          stop: "Aw==",
          "return to dock": "BA==",
          reboot: "BQ==",
        };


       let cleanCommand = data.toLowerCase().trim();
       let devicepayload = payloadMap[cleanCommand];

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
           description:
`Send start, stop, reboot or return-to-dock commands.

IMPORTANT:
This tool ONLY accepts a real devEui.

If the user provides a device name such as "robot-1" or "Robot 20",
you MUST first call getdeviceDevEui to convert the device name into a devEui.
Never pass the device name as the devEui.`,
            schema: z.object({
                devEui: z.string().describe(`
The 16-character LoRaWAN hardware identifier.

Do NOT pass a device name such as "Robot 1" or "robot-1".

If only the device name is available, call getdeviceDevEui first and use the returned devEui.
`),
                data: z.string().describe("The data to be sent to the device like start,stop ,return to dock or reboot ")
            })
        }
    );
}

