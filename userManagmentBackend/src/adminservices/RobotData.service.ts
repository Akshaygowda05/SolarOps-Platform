import { Status } from "@prisma/client";
import { prisma } from "../config/primsaConfig";
import { fillMissingDates } from "../utils/date.util";

interface DashboardCountsRow {
  total: bigint;
  online: bigint;
}

interface PanelsCleanedHistoryRow {
  date: Date;
  panelsCleaned: number;
}

class DashboardService {

  // =========================================================
  // Dashboard (All Active & Pending Applications)
  // =========================================================

  /**
   * Returns total, online and offline device counts.
   */
  static async getDashboardDeviceCounts() {
    const rows = await prisma.$queryRaw<DashboardCountsRow[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ds."isOnline" = true) AS online
      FROM "DeviceState" ds
      JOIN "ChirpstackApplication" ca
        ON ca."chirpstackId" = ds."applicationId"
      WHERE ca."status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status");
    `;

    const totalDevices = Number(rows[0]?.total ?? 0);
    const onlineDevices = Number(rows[0]?.online ?? 0);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
    };
  }

  /**
   * Last 5 days panels cleaned (Dashboard)
   */
  static async getDashboardDailyPanelsCleaned() {
    const result = await prisma.$queryRaw<PanelsCleanedHistoryRow[]>`
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
      ORDER BY DATE(rb."createdAt");
    `;

    return fillMissingDates(result, 5, "panelsCleaned");
  }

  /**
   * Current day's panels cleaned (Dashboard)
   */
  static async getDashboardTodayPanelsCleaned() {
    return prisma.$queryRaw<PanelsCleanedHistoryRow[]>`
      SELECT
        DATE(rb."createdAt") AS date,
        SUM(rb."panelsCleaned")::int AS "panelsCleaned"
      FROM "RobotData" rb
      JOIN "ChirpstackApplication" ca
        ON ca."chirpstackId" = rb."applicationId"
      WHERE ca."status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status")
        AND rb."createdAt" >= CURRENT_DATE
        AND rb."createdAt" < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY DATE(rb."createdAt");
    `;
  }

  /**
   * Last 6 months panels cleaned (Dashboard)
   */
  static async getDashboardMonthlyPanelsCleaned() {
    return prisma.$queryRaw`
      SELECT
        month.month,
        COALESCE(SUM(rb."panelsCleaned"), 0)::int AS "panelsCleaned"
      FROM generate_series(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
        DATE_TRUNC('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month

      LEFT JOIN "RobotData" rb
        ON DATE_TRUNC('month', rb."createdAt") = month.month

      GROUP BY month.month
      ORDER BY month.month;
    `;
  }

  // =========================================================
  // Application Specific
  // =========================================================

  /**
   * Device counts for one application.
   */
  static async getApplicationDeviceCounts(applicationId: string) {
    const rows = await prisma.$queryRaw<DashboardCountsRow[]>`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ds."isOnline" = true) AS online
      FROM "DeviceState" ds
      WHERE ds."applicationId" = ${applicationId};
    `;

    const totalDevices = Number(rows[0]?.total ?? 0);
    const onlineDevices = Number(rows[0]?.online ?? 0);

    return {
      totalDevices,
      onlineDevices,
      offlineDevices: totalDevices - onlineDevices,
    };
  }

  /**
   * Last 5 days panels cleaned for one application.
   */
  static async getApplicationDailyPanelsCleaned(applicationId: string) {
    return prisma.$queryRaw<PanelsCleanedHistoryRow[]>`
      SELECT
        DATE(rb."createdAt") AS date,
        SUM(rb."panelsCleaned")::int AS "panelsCleaned"
      FROM "RobotData" rb
      WHERE rb."applicationId" = ${applicationId}
        AND rb."createdAt" >= CURRENT_DATE - INTERVAL '5 days'
        AND rb."createdAt" < CURRENT_DATE
      GROUP BY DATE(rb."createdAt")
      ORDER BY DATE(rb."createdAt");
    `;
  }

  /**
   * Today's panels cleaned for one application.
   */
  static async getApplicationTodayPanelsCleaned(applicationId: string) {
    return prisma.$queryRaw<PanelsCleanedHistoryRow[]>`
      SELECT
        DATE(rb."createdAt") AS date,
        SUM(rb."panelsCleaned")::int AS "panelsCleaned"
      FROM "RobotData" rb
      WHERE rb."applicationId" = ${applicationId}
        AND rb."createdAt" >= CURRENT_DATE
        AND rb."createdAt" < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY DATE(rb."createdAt");
    `;
  }

  /**
   * Monthly panels cleaned for one application.
   */
  static async getApplicationMonthlyPanelsCleaned(applicationId: string) {
    return prisma.$queryRaw`
      SELECT
        month.month,
        COALESCE(SUM(rb."panelsCleaned"), 0)::int AS "panelsCleaned"
      FROM generate_series(
        DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
        DATE_TRUNC('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS month

      LEFT JOIN "RobotData" rb
        ON DATE_TRUNC('month', rb."createdAt") = month.month
        AND rb."applicationId" = ${applicationId}

      GROUP BY month.month
      ORDER BY month.month;
    `;
  }

  // =========================================================
  // Gateway
  // =========================================================

  /**
   * Returns all gateway states.
   */
  static async getGatewayStates() {
    return prisma.gatewayState.findMany();
  }

  // =========================================================
  // Applications
  // =========================================================

  /**
   * Returns all Active & Pending applications.
   */
  static async getActiveApplications() {
    return prisma.$queryRaw`
      SELECT *
      FROM "ChirpstackApplication"
      WHERE "status" IN (${Status.ACTIVE}::"Status", ${Status.PENDING}::"Status");
    `;
  }
}

export default DashboardService;