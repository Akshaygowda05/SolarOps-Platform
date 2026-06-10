
import { Request, Response } from "express";
import AppError from "../utils/AppError";
import { StatusCodes } from "http-status-codes";
import  { SchedulerServiceInstance } from "../services/schedular.service";
import { jobSchedulerService } from "../queues/scheduler.jobs";

 class SchedulerController {
  
// this will help me ti  create a new schedukar
  async createScheduler(req: Request, res: Response) {
    const applicationId = req.applicationId;
    const data = req.body;

    if (!applicationId) {
      throw new AppError("Session expired", StatusCodes.BAD_REQUEST);
    }

    if (!data.time || !data.groups) {
      throw new AppError("Invalid request body", StatusCodes.BAD_REQUEST);
    }


    const result = await SchedulerServiceInstance.createScheduler(applicationId, data);

    res.status(StatusCodes.CREATED).json({
      message: "Scheduler created successfully",
      data: result,
    });
  }

  async deleteScheduler(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError("Invalid scheduler ID", StatusCodes.BAD_REQUEST);
    }

    await SchedulerServiceInstance.deleteScheduler(id);

    res.status(StatusCodes.OK).json({
      message: "Scheduler deleted successfully",
    });
  }

  async getSchedulers(req: Request, res: Response) {
    const applicationId = req.applicationId;

    if (!applicationId) {
      throw new AppError("Session expired", StatusCodes.BAD_REQUEST);
    }

    const result = await SchedulerServiceInstance.getScheduler(applicationId);
    res.status(StatusCodes.OK).json({
      message: "Schedulers retrieved successfully",
      data: result,
    });
  }
 // this is for testing purpose only
  async testing(req: Request, res: Response) {
    const result = await SchedulerServiceInstance.testing();
    res.status(StatusCodes.OK).json({
      message: "Testing completed",
      data: result,
    });
  }
}

export default SchedulerController;