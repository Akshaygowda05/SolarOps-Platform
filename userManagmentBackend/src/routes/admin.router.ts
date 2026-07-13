import { Router } from "express";
import { DashboardController } from "../controllers/admin.controller";


const adminRouter = Router();


adminRouter.get(
  "/counts",
  DashboardController.getDashboardCounts
);

// Last 5 days panels cleaned history
adminRouter.get(
  "/history-panels-cleaned",
  DashboardController.getHistoryPanelsCleaned
);

// Today's panels cleaned
adminRouter.get(
  "/today-panels-cleaned",
  DashboardController.getTodayPanelsCleaned
);

// Gateway data
adminRouter.get(
  "/gateway-data",
  DashboardController.getGatewayData
);

// Active/Pending Chirpstack applications
adminRouter.get(
  "/active/applications",
  DashboardController.getTrueApplication
);

export default adminRouter;