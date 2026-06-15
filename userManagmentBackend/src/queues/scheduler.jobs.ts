// queues/scheduler.jobs.ts

import schedulerQueue from "./scheduler.queue";
import loggers from "../config/logger";
import { prisma } from "../config/primsaConfig";
import moment from "moment-timezone";


class JobSchedulerService {

  // ONE TIME JOB
  async addOneTimeJob(data: any) {
    let  delay = new Date(data.time).getTime() - Date.now();


    // what if client tries to schedule a job for tommorow for one time but here i am negalting that and throwing error?
    // so we will add +1  ,so that it will tigger in nextday of scheduled time

    if (delay < 0) {
      // if delay  is neagative then it is schedulaed for tomorrow so we will add 24 hours to it
      delay += 24 * 60 * 60 * 1000;
      loggers.warn(`Scheduled time for one-time job ${data.id} is in the past. Adjusting to trigger tomorrow.`);
    }



    await schedulerQueue.add(
      "scheduler:one-time",
      {
        schedulerId: data.id,
        payload: data.data,
        groupIds: data.groupId,
        applicationId: data.applicationId,
      },
      {
        delay,
        jobId: `one-time-${data.id}`, 
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
      }
    );

    loggers.info(`One-time job added: ${data.id}`);
  }

  // DAILY REPEATABLE JOB
 async addDailyJob(data: any) {
  const date = moment(data.time).tz("Asia/Kolkata");

  const hour = date.hour();
  const minute = date.minute();

  // Runs every day at the specified time
  const cronPattern = `${minute} ${hour} * * *`;

  const schedulerIdforDelay = `entry-${data.id}`;

  await schedulerQueue.upsertJobScheduler(
    schedulerIdforDelay,
    {
      pattern: cronPattern,
      tz: "Asia/Kolkata",
    },
    {
      name: "scheduler:daily",
      data: {
        schedulerId: data.id,
        payload: data.data,
        groupIds: data.groupId,
        applicationId: data.applicationId,
      },
      opts: {
        removeOnComplete: true,
        removeOnFail: 100,
      },
    },
  );

  loggers.info(
    `Daily scheduler created: ${schedulerIdforDelay} (${cronPattern})`,
  );
}

  // REMOVE ONE TIME JOB
  async removeOneTimeJob(id: string) {
    console.log("Removing one-time job for scheduler ID:", id);

    // Formulate the precise target string
    const targetJobId = `one-time-${id}`;
    const job = await schedulerQueue.getJob(targetJobId);

    if (job) {
      await job.remove();
      loggers.info(`One-time job removed from BullMQ: ${targetJobId}`);
    } else {
      loggers.warn(`One-time job not found or already executed: ${targetJobId}`);
    }
  }

  // REMOVE DAILY JOB
async removeDailyJob(id: string) {
  await schedulerQueue.removeJobScheduler(`entry-${id}`);
  loggers.info(`Daily job schedule removed successfully: ${id}`);
}
  

  // SYSTEM BOOTSTRAPPER SYNCRONIZER
  // "yella schedular recover agbeku amele restart admele..." -> Yes! This recovers cleanly.
  async syncAllSchedulers() {
    loggers.info("Starting boot synchronizer step: Rebuilding active scheduler memory...");
    const schedulers = await prisma.schedularData.findMany();

    for (const scheduler of schedulers) {
      try {
        if (scheduler.jobType === "ONE_TIME") {
          if (new Date(scheduler.time).getTime() < Date.now()) {
            loggers.warn(`Skipping stale historical one-time job registration: ${scheduler.id}`);
            continue;
          }

          const existing = await schedulerQueue.getJob(`one-time-${scheduler.id}`);
if (!existing) {
  await this.addOneTimeJob(scheduler);
} else {
          loggers.info(`One-time job already registered and pending: ${scheduler.id}`);
}
        } else {
          // Re-registering daily repeatable jobs handles overrides atomically.
          await this.addDailyJob(scheduler);
        }
      } catch (error) {
        loggers.error(`Failed syncing scheduler registration ${scheduler.id}:`, error);
      }
    }

    loggers.info("All schedulers synchronized cleanly from system state database memory.");
  }
}

export const jobSchedulerService = new JobSchedulerService();