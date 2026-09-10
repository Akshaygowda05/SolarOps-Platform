import { toolRegistry } from "../tool.register";
import { jarvisTypes } from "../ai.types";
import {
    findDevEuiByNameInApp,
    getDeviceBatteryAndStatus,
    getDeviceTelemetry
} from "../services/devices.services";

// 1. Tool: Find device DevEUI by name
toolRegistry.register({
    name: "find_device_by_name",
    description: `Find a robot or device DevEUI using the name mentioned by the user. Use this when you only need to identify the device or resolve its DevEUI.`,
    intents: [
        jarvisTypes.DEVICE_STATUS,
        jarvisTypes.DEVICE_ANALYTICS,
        jarvisTypes.TELEMETRY,
        jarvisTypes.DEVICE_TRIGGERING
    ],
    parameters: {
        type: "object",
        properties: {
            deviceName: {
                type: "string",
                description: "The exact robot or device name mentioned by the user, e.g. 'Robot-01'"
            }
        },
        required: ["deviceName"]
    },
    execute: async (args: { deviceName: string }, context) => {
        return await findDevEuiByNameInApp({
            applicationId: context.applicationId,
            deviceName: args.deviceName
        });
    }
});

// 2. Tool: Get battery, online state and connection quality
toolRegistry.register({
    name: "get_device_battery_and_status",
    description: `Get the current battery voltage/level, online/offline status, and signal quality (RSSI/SNR) for a robot. Accepts either the robot name (e.g. 'Robot-01') or devEui.`,
    intents: [
        jarvisTypes.DEVICE_STATUS,
        jarvisTypes.TELEMETRY,
        jarvisTypes.DEVICE_ANALYTICS
    ],
    parameters: {
        type: "object",
        properties: {
            deviceIdentifier: {
                type: "string",
                description: "The robot name (e.g., 'Robot-01') or DevEUI (16-char hex string)"
            }
        },
        required: ["deviceIdentifier"]
    },
    execute: async (args: { deviceIdentifier: string }, context) => {
        return await getDeviceBatteryAndStatus({
            applicationId: context.applicationId,
            deviceIdentifier: args.deviceIdentifier
        });
    }
});

// 3. Tool: Get full telemetry
toolRegistry.register({
    name: "get_device_telemetry",
    description: `Get complete telemetry values, sensor data, and channel readings for a robot or device by its name or DevEUI.`,
    intents: [
        jarvisTypes.TELEMETRY,
        jarvisTypes.DEVICE_ANALYTICS
    ],
    parameters: {
        type: "object",
        properties: {
            deviceIdentifier: {
                type: "string",
                description: "The robot name or DevEUI"
            }
        },
        required: ["deviceIdentifier"]
    },
    execute: async (args: { deviceIdentifier: string }, context) => {
        return await getDeviceTelemetry({
            applicationId: context.applicationId,
            deviceIdentifier: args.deviceIdentifier
        });
    }
});

// Backwards compatibility export
export const devicetools = toolRegistry.getToolsForIntent(jarvisTypes.DEVICE_STATUS);