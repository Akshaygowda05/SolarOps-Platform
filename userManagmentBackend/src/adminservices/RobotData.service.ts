import { Status } from "@prisma/client";
import { prisma } from "../config/primsaConfig";

interface DashboardCountsRow {
  total: bigint;
  online: bigint;
}

class DashboardService {
  static async getDashboardCounts() {
    const rows = await prisma.$queryRaw<DashboardCountsRow[]>`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ds."isOnline" = true) as online
      FROM "DeviceState" ds
      JOIN "ChirpstackApplication" ca ON ca."chirpstackId" = ds."applicationId"
      WHERE ca."status" = ${Status.ACTIVE}::"Status"
    `;

    const totalDevices = Number(rows[0]?.total ?? 0);
    const onlineDevices = Number(rows[0]?.online ?? 0);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
    };
  }
}

export default DashboardService;