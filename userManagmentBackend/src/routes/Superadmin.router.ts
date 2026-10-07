import { Router } from "express";
import { DashboardController } from "../controllers/SuperAdmin.controller";

const SuperadminRouter = Router();

// ======================================================
// Dashboard (All Active & Pending Applications)
// ======================================================

// Device Counts
SuperadminRouter.get(
  "/dashboard/device-counts",
  DashboardController.getDashboardDeviceCounts
);

// Last 5 Days Panels Cleaned
SuperadminRouter.get(
  "/dashboard/panels/daily",
  DashboardController.getDashboardDailyPanelsCleaned
);

// Today's Panels Cleaned
SuperadminRouter.get(
  "/dashboard/panels/today",
  DashboardController.getDashboardTodayPanelsCleaned
);

// Monthly Panels Cleaned
SuperadminRouter.get(
  "/dashboard/panels/monthly",
  DashboardController.getDashboardMonthlyPanelsCleaned
);

// Yearly Panels Cleaned
SuperadminRouter.get(
  "/dashboard/panels/yearly",
  DashboardController.getDashboardYearlyPanelsCleaned
);

// Gateway States
SuperadminRouter.get(
  "/dashboard/gateways",
  DashboardController.getGatewayStates
);

// Active & Pending Applications
SuperadminRouter.get(
  "/dashboard/applications",
  DashboardController.getActiveApplications
);

// ======================================================
// Application Specific
// ======================================================

// Device Counts
SuperadminRouter.get(
  "/applications/:applicationId/device-counts",
  DashboardController.getApplicationDeviceCounts
);

// Last 5 Days Panels Cleaned
SuperadminRouter.get(
  "/applications/:applicationId/panels/daily",
  DashboardController.getApplicationDailyPanelsCleaned
);

// Today's Panels Cleaned
SuperadminRouter.get(
  "/applications/:applicationId/panels/today",
  DashboardController.getApplicationTodayPanelsCleaned
);

// Monthly Panels Cleaned
SuperadminRouter.get(
  "/applications/:applicationId/panels/monthly",
  DashboardController.getApplicationMonthlyPanelsCleaned
);

// Yearly Panels Cleaned
SuperadminRouter.get(
  "/applications/:applicationId/panels/yearly",
  DashboardController.getApplicationYearlyPanelsCleaned
);

export default SuperadminRouter;