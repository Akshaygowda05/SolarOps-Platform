
import logger from "../config/logger";
import { prisma } from "../config/primsaConfig";
import { getGatewayGrpcServices } from "./gatewayGrpc.service";

const ONLINE_THRESHOLD_MS = 30 * 60 * 1000;

export const syncAllGateway = async (tenantId: string) => {
    logger.info(`Starting gateway sync for tenant: ${tenantId}`);
    const gatewayResponse = await getGatewayGrpcServices(tenantId);

    for (const gateway of gatewayResponse.resultList) {

        const lastSeen = protobufTimestampToDate(gateway.lastSeenAt);
        const isOnline = checkOnline(gateway.lastSeenAt);

        const gatewayData = {
            gatewayId: gateway.gatewayId,
            gatewayName: gateway.name,
            latitude: gateway.location?.latitude ?? null,
            longitude: gateway.location?.longitude ?? null,
            lastSeen,
            isOnline,
        };

       const result = await prisma.gatewayState.upsert({
            where: {
                gatewayId:String(gateway.gatewayId),
            },
            update: gatewayData,
            create: gatewayData,
        });

        logger.info(`Gateway sync completed for gateway: ${gateway.gatewayId}, result: ${JSON.stringify(result)}`);
    }
};


function protobufTimestampToDate(
    timestamp?: { seconds: number; nanos: number }
): Date | null {
    if (!timestamp) {
        return null;
    }

    const milliseconds =
        Number(timestamp.seconds) * 1000 +
        Math.floor(timestamp.nanos / 1_000_000);

    return new Date(milliseconds);
}


function checkOnline(
    timestamp?: { seconds: number; nanos: number }
): boolean {
    if (!timestamp) {
        return false;
    }

    const lastSeenMilliseconds =
        Number(timestamp.seconds) * 1000 +
        Math.floor(timestamp.nanos / 1_000_000);

    return Date.now() - lastSeenMilliseconds <= ONLINE_THRESHOLD_MS;
}