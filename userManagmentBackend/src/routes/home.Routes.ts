import express from "express";
import authenticate from "../middlewares/auth.middlware";
import { homeController } from "../controllers/home.controller";
import { ApplicationContext } from "../middlewares/applicationContext";



const homeRouter = express.Router();

homeRouter.get('/home/pannels-data',authenticate,ApplicationContext,homeController.prototype.getPannlesData)
homeRouter.get('/home/active-inactive-count',authenticate,ApplicationContext,homeController.prototype.getDeviceActiveInactiveCount)
homeRouter.get('/home/avg-battery-discharge',authenticate,ApplicationContext,homeController.prototype.getAvgbatteryDischarge)

// this  last 5 days data 

export default homeRouter;
