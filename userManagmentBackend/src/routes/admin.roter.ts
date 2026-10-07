import express from "express";
import { adminControllerInstance } from "../controllers/admin.controller";
 

const adminRouter = express.Router();


adminRouter.get("/admin/getTodaysPannelsCleaned", adminControllerInstance.getTodaysPannelsCleanedController);
adminRouter.get("/admin/getLast5DaysPannelsCleaned", adminControllerInstance.getLast5DaysPannelsCleanedController);
adminRouter.get("/admin/getMontlyPannelCLeand", adminControllerInstance.getMontlyPannelCLeandController);
adminRouter.get("/admin/getYearlyPannelsCleaned", adminControllerInstance.getYearlyPannelsCleanedController);
adminRouter.get("/admin/getOnlineOfflineCount", adminControllerInstance.getOnlineOfflineCountController);
adminRouter.get("/admin/getGatewayStats", adminControllerInstance.getGatewayStatsController);
adminRouter.get("/admin/getApplicationStats", adminControllerInstance.getApplicationStatsController);


export default adminRouter;