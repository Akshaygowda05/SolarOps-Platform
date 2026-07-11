import pLimit from "p-limit";
import { prisma } from "../config/primsaConfig";
import { getDevicesGrpc } from "./getDevicesGrpc.service";
import loggers from "../config/logger";

const PAGE_SIZE = 100;
const CONCURRENCY = Number(process.env.DEVICE_SYNC_CONCURRENCY ?? 20);
const ONLINE_THRESHOLD_MS = 30 * 60 * 1000;

const limitConcurrency = pLimit(CONCURRENCY);

export const syncAllDevices = async (
    applicationId: string,
    tenantId: string
) => {
    let offset = 0;
    let synced = 0;

    try {
        while (true) {
            const devices = await getDevicesGrpc(
                applicationId,
                PAGE_SIZE,
                offset
            );

            await Promise.all(
                devices.resultList.map((device) =>
                    limitConcurrency(async () => {
                        try {
                            const lastSeen = protobufTimestampToDate(
                                device.lastSeenAt
                            );
                            const isOnline = checkOnline(device.lastSeenAt);

                            await prisma.deviceState.upsert({
                                where: {
                                    deviceId: device.devEui,
                                },
                                update: {
                                    deviceName: device.name,
                                    applicationId,
                                    tenantId,
                                    lastSeen,
                                    isOnline,
                                },
                                create: {
                                    deviceId: device.devEui,
                                    deviceName: device.name,
                                    applicationId,
                                    tenantId,
                                    lastSeen,
                                    isOnline,
                                },
                            });
                        } catch (error) {
                            console.error(
                                `Failed to sync device ${device.devEui}`,
                                error
                            );
                        }
                    })
                )
            );

            synced += devices.resultList.length;

            console.log(
                `Processed ${synced} of ${devices.totalCount} devices`
            );

            offset += PAGE_SIZE;

            if (offset >= devices.totalCount) {
                break;
            }
        }

        loggers.info(
            `✅ Device sync completed successfully. Synced ${synced} devices.`
        );

        return {
            success: true,
            synced,
        };
    } catch (error) {
        console.error("❌ Device sync failed:", error);
        throw error;
    }
};

function protobufTimestampToDate(
    timestamp?: { seconds: number; nanos: number }
): Date | null {
    if (!timestamp) {
        return null;
    }

    return new Date(timestamp.seconds * 1000);
}

function checkOnline(
    timestamp?: { seconds: number; nanos: number }
): boolean {
    if (!timestamp) {
        return false;
    }

    const deviceTime = timestamp.seconds * 1000;

    return Date.now() - deviceTime < ONLINE_THRESHOLD_MS;
}