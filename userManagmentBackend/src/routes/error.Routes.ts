import express  from "express";
import errorController from "../controllers/error.controller";
import authenticate from "../middlewares/auth.middlware";
import { ApplicationContext } from "../middlewares/applicationContext";

const applicationError = express.Router();


applicationError.get("/errors",authenticate,ApplicationContext ,errorController.getErrors);
applicationError.get("/warnings", authenticate, ApplicationContext, errorController.getWarningDevices);
applicationError.get("/critical", authenticate, ApplicationContext, errorController.getCriticalDevices);

export default applicationError;1983