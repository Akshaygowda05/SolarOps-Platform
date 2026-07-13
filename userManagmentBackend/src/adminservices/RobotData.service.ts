import { Status } from "@prisma/client";
import { prisma } from "../config/primsaConfig";
import { fillMissingDates } from "../utils/date.util";

interface DashboardCountsRow {
  total: bigint;
  online: bigint;
}

interface HistoryPanelsCleanedRow {
  date: Date;
  panelsCleaned: number;
}

class DashboardService {
  static async getDashboardCounts() {
    const rows = await prisma.$queryRaw<DashboardCountsRow[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ds."isOnline" = true) AS online
      FROM "DeviceState" ds
      JOIN "ChirpstackApplication" ca ON ca."chirpstackId" = ds."applicationId"
      WHERE ca."status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status");
    `;
    console.log("this is how prisma with raw query gives the output ", rows);

    const totalDevices = Number(rows[0]?.total ?? 0);
    const onlineDevices = Number(rows[0]?.online ?? 0);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
    };
  }

  static async getHistoryPannelsCleand(){
    const panelsCleaned = await prisma.$queryRaw<HistoryPanelsCleanedRow[]>`
   SELECT
    DATE(rb."createdAt") AS date,
    SUM(rb."panelsCleaned")::int AS "panelsCleaned"
FROM "RobotData" rb
JOIN "ChirpstackApplication" ca
    ON ca."chirpstackId" = rb."applicationId"
WHERE ca."status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status")
  AND rb."createdAt" >= CURRENT_DATE - INTERVAL '5 days'
  AND rb."createdAt" < CURRENT_DATE
GROUP BY DATE(rb."createdAt")
ORDER BY DATE(rb."createdAt") DESC;

    `;

    console.log("this is how prisma with raw query gives the output ", panelsCleaned);

    const missingDates = fillMissingDates(panelsCleaned, 5, "panelsCleaned");

    return missingDates;
  }


  static async getTodayPannelsCleaned(){
    const result = await prisma.$queryRaw<HistoryPanelsCleanedRow[]>`
    SELECT
      DATE(rb."createdAt") AS date,
      SUM(rb."panelsCleaned")::int AS "panelsCleaned"
    FROM "RobotData" rb
    JOIN "ChirpstackApplication" ca ON ca."chirpstackId" = rb."applicationId"
    WHERE ca."status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status")
      AND rb."createdAt" >= CURRENT_DATE
      AND rb."createdAt" < CURRENT_DATE + INTERVAL '1 day'
    GROUP BY DATE(rb."createdAt")
    ORDER BY DATE(rb."createdAt") DESC;
  `;
    return result;
  }

  static async getGatewayData(){

    const gatewayData = await  prisma.gatewayState.findMany({
      
    })
    

    return gatewayData

  }

  static async getTrueApplication(){
    const trueApplication = await prisma.$queryRaw`
    select * from "ChirpstackApplication" where  "status" = ${Status.ACTIVE}::"Status" or "status" = ${Status.PENDING}::"Status"
     
    
    `
    return trueApplication;
  }
}

export default DashboardService;