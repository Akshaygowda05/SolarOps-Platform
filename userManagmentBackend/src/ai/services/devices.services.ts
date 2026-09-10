import { getDevicesByNameGrpc } from "../../services/getDevicesGrpc.service";
import { getRedisClient } from "../../config/redis";

interface FindDeviceInput {
    applicationId: string;
    deviceName: string;
}

interface DeviceOutput {
    found: boolean;
    deviceName: string;
    devEui: string;
    error?: string;
}

export interface DeviceTelemetryOutput {
    found: boolean;
    deviceName: string;
    devEui: string;
    batteryLevel?: string;
    batteryVoltage?: string;
    rssi?: string;
    snr?: string;
    lastSeen?: string;
    allTelemetry?: Record<string, string>;
    message?: string;
    error?: string;
}

/**
 * Check if a string is a 16-character hex DevEUI
 */
function isDevEui(identifier: string): boolean {
    return /^[0-9a-fA-F]{16}$/.test(identifier.trim());
}

/**
 * Search for a device by its display name in ChirpStack / App
 */
export async function findDevEuiByNameInApp(
    input: FindDeviceInput
): Promise<DeviceOutput> {
    const { applicationId, deviceName } = input;

    try {
        const result = await getDevicesByNameGrpc(
            applicationId,
            deviceName
        );

        if (!result || !result.resultList || result.resultList.length === 0) {
            return {
                found: false,
                deviceName,
                devEui: "",
                error: `No device found matching name "${deviceName}"`
            };
        }

        const device = result.resultList[0];

        return {
            found: true,
            deviceName: device.name,
            devEui: device.devEui
        };
    } catch (err: any) {
        return {
            found: false,
            deviceName,
            devEui: "",
            error: err?.message || "Failed to search device in ChirpStack"
        };
    }
}

/**
 * Composite tool: Resolves device by name or DevEUI and fetches current battery & connectivity status
 */
export async function getDeviceBatteryAndStatus(input: {
    applicationId: string;
    deviceIdentifier: string;
}): Promise<DeviceTelemetryOutput> {
    const { applicationId, deviceIdentifier } = input;
    const redis = getRedisClient();

    let devEui = deviceIdentifier.trim();
    let deviceName = deviceIdentifier.trim();

    // If identifier is not a 16-char hex DevEUI, resolve it by name first
    if (!isDevEui(devEui)) {
        const resolved = await findDevEuiByNameInApp({ applicationId, deviceName });
        if (!resolved.found || !resolved.devEui) {
            return {
                found: false,
                deviceName,
                devEui: "",
                error: resolved.error || `Could not find device "${deviceName}"`
            };
        }
        devEui = resolved.devEui;
        deviceName = resolved.deviceName;
    }

    try {
        const redisData = await redis.hgetall(`device:${devEui}`);

        if (!redisData || Object.keys(redisData).length === 0) {
            return {
                found: true,
                deviceName,
                devEui,
                message: `Device "${deviceName}" (${devEui}) was found, but has no live telemetry in Redis (inactive or offline for over 30 minutes).`
            };
        }

        return {
            found: true,
            deviceName: redisData.robotName || deviceName,
            devEui,
            batteryVoltage: redisData.CH5 || "N/A",
            batteryLevel: redisData.CH5 ? `${redisData.CH5}V` : "Unknown",
            rssi: redisData.rssi || "N/A",
            snr: redisData.snr || "N/A",
            lastSeen: redisData.updatedAt || "Recently"
        };
    } catch (err: any) {
        return {
            found: true,
            deviceName,
            devEui,
            error: `Failed to fetch live status from Redis: ${err?.message}`
        };
    }
}

/**
 * Fetch full device telemetry channels from Redis
 */
export async function getDeviceTelemetry(input: {
    applicationId: string;
    deviceIdentifier: string;
}): Promise<DeviceTelemetryOutput> {
    const { applicationId, deviceIdentifier } = input;
    const redis = getRedisClient();

    let devEui = deviceIdentifier.trim();
    let deviceName = deviceIdentifier.trim();

    if (!isDevEui(devEui)) {
        const resolved = await findDevEuiByNameInApp({ applicationId, deviceName });
        if (!resolved.found || !resolved.devEui) {
            return {
                found: false,
                deviceName,
                devEui: "",
                error: resolved.error || `Could not find device "${deviceName}"`
            };
        }
        devEui = resolved.devEui;
        deviceName = resolved.deviceName;
    }

    try {
        const redisData = await redis.hgetall(`device:${devEui}`);

        if (!redisData || Object.keys(redisData).length === 0) {
            return {
                found: true,
                deviceName,
                devEui,
                message: `No active telemetry found in Redis for ${deviceName} (${devEui}).`
            };
        }

        return {
            found: true,
            deviceName: redisData.robotName || deviceName,
            devEui,
            batteryVoltage: redisData.CH5,
            rssi: redisData.rssi,
            snr: redisData.snr,
            lastSeen: redisData.updatedAt,
            allTelemetry: redisData
        };
    } catch (err: any) {
        return {
            found: true,
            deviceName,
            devEui,
            error: `Failed to fetch telemetry from Redis: ${err?.message}`
        };
    }
}