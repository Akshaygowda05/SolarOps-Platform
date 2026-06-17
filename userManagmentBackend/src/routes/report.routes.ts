import express  from "express";
import { reportControllerInstance } from "../controllers/reports.controller";
import authenticate from "../middlewares/auth.middlware";
import { ApplicationContext } from "../middlewares/applicationContext";


const reportRouter =  express.Router();


reportRouter.get("/reports/data",authenticate,ApplicationContext,reportControllerInstance.getdataByRange);
reportRouter.get("/reports/total-panels-cleaned",authenticate,ApplicationContext,reportControllerInstance.getTotalRobots);

export default reportRouter;