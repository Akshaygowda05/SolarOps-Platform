import express from "express";
import authenticate from "../middlewares/auth.middlware";
import SchedulerController from "../controllers/schedular.contoller";

const Schedularrouter = express.Router();
const schedulerController = new SchedulerController();

// Use arrow functions so 'schedulerController' stays on the left of the dot!
Schedularrouter.post(
  "/create/scheduler",
  authenticate,
  (req, res, next) => schedulerController.createScheduler(req, res).catch(next)
);

Schedularrouter.delete(
  "/delete/scheduler/:id",
  authenticate,
  (req, res, next) => schedulerController.deleteScheduler(req, res).catch(next)
);

Schedularrouter.get(
  "/get/schedulers",
  authenticate,
  (req, res, next) => schedulerController.getSchedulers(req, res).catch(next)
);



// this is for testing purpose only
Schedularrouter.get(
  "/testing",
  (req, res, next) => schedulerController.testing(req, res).catch(next)
);

export default Schedularrouter;