// workers/scheduler.worker.ts

// @ts-ignore: BullMQ package or type declarations may not be present in this environment
import { Worker, Job } from "bullmq";
import envconfig from "../config/envConfig";
import loggers from "../config/logger";
import { prisma } from "../config/primsaConfig";
import { JobType } from "@prisma/client";
import { 
  sendDownlink, 
  sendMulticastDownlink, 
  sendUnicastDownlink 
} from "../services/schedularDownlink.service";
import { storeApplicationEvents } from "../config/redis";

// Define strict interface for job data structure
interface SchedulerJobData {
  schedulerId: string | number;
  applicationId: string;
}

const worker = new Worker<SchedulerJobData>(
  "schedulerQueue",
  async (job: Job<SchedulerJobData>) => {
    loggers.info(`🔥 Running Job: ${job.name}`);
    loggers.info(`Job data: ${JSON.stringify(job.data)}`);  

    const {
  schedulerId,
  applicationId,
} = job.data;

    try {
      // 1. Fetch scheduler details
      const scheduler = await prisma.schedularData.findUnique({
        where: {
          id: Number(schedulerId),
        },
        select: {
          jobType: true,
          groupName: true,
          groupId: true,
          data: true,
          time: true,
        }
      });

      if (!scheduler) {
        loggers.warn(`Scheduler not found while executing job: ${schedulerId}`);
        return;
      }

      // 2. Fetch site configuration to determine the downlink action
      const siteConfig = await prisma.siteConfiguration.findFirst({
        where: { applicationId },
        select: { triggeringAction: true },
      });

      loggers.info(`Site config for application ${applicationId}: ${JSON.stringify(siteConfig)}`);

      const triggeringAction = siteConfig?.triggeringAction;

      // 3. Process action based on configuration strategy
      switch (triggeringAction) {
        case "MULTICAST":
          await sendMulticastDownlink(
            scheduler.groupId as string[],
            scheduler.groupName as string[],
            scheduler.data,
            applicationId
          );
          break;

        case "UNICAST":
          await sendUnicastDownlink(
            scheduler.groupId as string[],
            scheduler.data,
            applicationId
          );
          break;

        case "BOTH":
          await sendDownlink(
            scheduler.groupId as string[],
            scheduler.data,
            applicationId
          );
          break;
      
        default:
          loggers.warn(
            `Unknown or missing triggering action for application ${applicationId}: ${triggeringAction}`
          );
      }

      // 4. Handle self-cleaning logic for One-Time schedules
      if (scheduler.jobType === JobType.ONE_TIME) {
        loggers.info(`One-time job completed, removing scheduler: ${schedulerId}`);

        await prisma.schedularData.delete({
          where: {
            id: Number(schedulerId),
          },
        });

        loggers.info(`🗑️ One-time scheduler deleted`);
      }

      // 5. Audit log successful execution to Redis
      await storeApplicationEvents(
        applicationId,
        JSON.stringify({
          type: "SCHEDULER_EXECUTED",
          name: scheduler.groupName,
          timeStamp: new Date().toISOString(),
        })
      );

    } catch (error: any) {
      loggers.error(`❌ Scheduler execution failed`);
      loggers.error(error);

      // Audit log error state to Redis
      await storeApplicationEvents(
        applicationId,
        JSON.stringify({
          type: "ERROR",
          timeStamp: new Date().toISOString(),
        })
      );

      // Re-throw so BullMQ handles retry or failure mechanisms correctly
      throw error;
    }
  },
  {
    connection: {
      host: envconfig.getRedisHost(),
      port: Number(envconfig.getRedisPort()),
    },
  }
);

  

worker.on("completed", (job: Job) => {
  loggers.info(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job: Job | undefined, err: Error) => {
  loggers.error(`❌ Job failed: ${job?.id}. Error: ${err.message}`);
});

export default worker;