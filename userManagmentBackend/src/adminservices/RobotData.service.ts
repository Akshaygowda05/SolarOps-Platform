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
      WHERE ca."status" = ${Status.ACTIVE || Status.PENDING}::"Status"
      WHERE ca."chirpstackId" IS NULL;
    `;

    console.log("this is how primsa with raw query gives the output ",rows)

    const totalDevices = Number(rows[0]?.total ?? 0);
    const onlineDevices = Number(rows[0]?.online ?? 0);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
    };
  }

  static async getHistoryPannelsCleand(){
    const pannelsCleaned = await prisma.$queryRaw`
   SELECT
    DATE(rb."createdAt") AS date,
    SUM(rb."panelsCleaned")::int AS "panelsCleaned"
FROM "RobotData" rb
JOIN "ChirpstackApplication" ca
    ON ca."chirpstackId" = rb."applicationId"
WHERE ca."chirpstackId" IS NULL;
WHERE ca."status" IN (
    ${Status.ACTIVE}::"Status",
    ${Status.PENDING}::"Status"
)
  AND rb."createdAt" >= CURRENT_DATE - INTERVAL '5 days'
  AND rb."createdAt" < CURRENT_DATE
GROUP BY DATE(rb."createdAt")
ORDER BY DATE(rb."createdAt") DESC;


    `
  }
}

export default DashboardService;