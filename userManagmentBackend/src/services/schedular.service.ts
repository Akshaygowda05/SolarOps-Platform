// services/scheduler.service.ts

import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/primsaConfig";
import AppError from "../utils/AppError";
import loggers from "../config/logger";
import { jobSchedulerService } from "../queues/scheduler.jobs";
import { JobType } from "@prisma/client";
import schedulerQueue from "../queues/scheduler.queue";

type CreateSchedulerDTO = {
  time: string;
  data: string;
  groups: { id: string; name: string }[];
  jobType: JobType;
};

class SchedulerService {

  async createScheduler(applicationId: string, dto: CreateSchedulerDTO) {
    if (!dto.groups || !Array.isArray(dto.groups) || dto.groups.length === 0) {
      throw new AppError("At least one group is required", StatusCodes.BAD_REQUEST);
    }

    if (!dto.time) {
      throw new AppError("Time is required", StatusCodes.BAD_REQUEST);
    }

    if (!dto.data || dto.data.trim() === "") {
      throw new AppError("Payload data is required", StatusCodes.BAD_REQUEST);
    }

    const scheduledDate = new Date(dto.time);
    if (isNaN(scheduledDate.getTime())) {
      throw new AppError("Invalid scheduled date", StatusCodes.BAD_REQUEST);
    }

    // Reject past times for one-time jobs upfront
    // if (dto.jobType === JobType.ONE_TIME && scheduledDate.getTime() < Date.now()) {
    //   throw new AppError("Scheduled time cannot be in the past", StatusCodes.BAD_REQUEST);
    // }

    const groupName = dto.groups.map((g) => g.name);
    const groupId = dto.groups.map((g) => g.id);

    const result = await prisma.schedularData.create({
      data: {
        applicationId,
        time: scheduledDate,
        data: dto.data,
        groupName,
        groupId,
        jobType: dto.jobType ?? JobType.ONE_TIME,
      },
    });

    // If queue insertion fails, roll back the DB record
    try {
      if (result.jobType === JobType.ONE_TIME) {
        await jobSchedulerService.addOneTimeJob(result);
        loggers.info(`One-time job scheduled for scheduler: ${result.id}`);
      } else {
        await jobSchedulerService.addDailyJob(result);
        loggers.info(`Daily job scheduled for scheduler: ${result.id}`);
      }
    } catch (error) {
      loggers.error(`Queue insertion failed for scheduler ${result.id}, rolling back DB record:`, error);
      await prisma.schedularData.delete({ where: { id: result.id } });
      throw new AppError("Failed to schedule job. Please try again.", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return result;
  }

  async getScheduler(applicationId: string) {
    const result = await prisma.chirpstackApplication.findUnique({
      where: { chirpstackId: applicationId },
      include: { SchedularData: true },
    });

    if (!result) {
      throw new AppError("Application not found", StatusCodes.NOT_FOUND);
    }

    return result.SchedularData;
  }

  async deleteScheduler(id: number) {
    const existing = await prisma.schedularData.findUnique({
      where: { id },
      select: { id: true, jobType: true },
    });

    if (!existing) {
      throw new AppError("Scheduler not found", StatusCodes.NOT_FOUND);
    }

    const stringId = String(id);

    // Remove from queue FIRST — if this throws, DB record stays intact
    try {
      if (existing.jobType === JobType.ONE_TIME) {
        await jobSchedulerService.removeOneTimeJob(stringId);
      } else {
        await jobSchedulerService.removeDailyJob(stringId);
      }
    } catch (error) {
      loggers.error(`Failed to remove job ${id} from queue:`, error);
      throw new AppError("Failed to cancel scheduled job. DB record kept intact.", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Only delete from DB after queue removal succeeds
    const result = await prisma.schedularData.delete({ where: { id } });
    loggers.info(`Scheduler ${id} removed from both queue and database`);
    return result;
  }

  
  async testing() {
    loggers.info("Testing scheduler service method");
    const result = await schedulerQueue.getDelayed(0, -1);
    return result;
  }


 
}

export const SchedulerServiceInstance = new SchedulerService();