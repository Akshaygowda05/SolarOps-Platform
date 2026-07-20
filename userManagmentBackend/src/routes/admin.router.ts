import { Router } from "express";
import { DashboardController } from "../controllers/admin.controller";

const adminRouter = Router();

// Device Counts
adminRouter.get(
  "/dashboard/device-counts",
  DashboardController.getDashboardDeviceCounts
);

// Last 5 Days Panels Cleaned
adminRouter.get(
  "/dashboard/panels/daily",
  DashboardController.getDashboardDailyPanelsCleaned
);

// Today's Panels Cleaned
adminRouter.get(
  "/dashboard/panels/today",
  DashboardController.getDashboardTodayPanelsCleaned
);

// Monthly Panels Cleaned
adminRouter.get(
  "/dashboard/panels/monthly",
  DashboardController.getDashboardMonthlyPanelsCleaned
);

// Gateway States
adminRouter.get(
  "/dashboard/gateways",
  DashboardController.getGatewayStates
);

// Active & Pending Applications
adminRouter.get(
  "/dashboard/applications",
  DashboardController.getActiveApplications
);

// ======================================================
// Application Specific
// ======================================================

// Device Counts
adminRouter.get(
  "/applications/:applicationId/device-counts",
  DashboardController.getApplicationDeviceCounts
);

// Last 5 Days Panels Cleaned
adminRouter.get(
  "/applications/:applicationId/panels/daily",
  DashboardController.getApplicationDailyPanelsCleaned
);

// Today's Panels Cleaned
adminRouter.get(
  "/applications/:applicationId/panels/today",
  DashboardController.getApplicationTodayPanelsCleaned
);

// Monthly Panels Cleaned
adminRouter.get(
  "/applications/:applicationId/panels/monthly",
  DashboardController.getApplicationMonthlyPanelsCleaned
);

export default adminRouter;