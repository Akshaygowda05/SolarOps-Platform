// workers/scheduler.worker.ts

import { Worker } from "bullmq";
import envconfig from "../config/envConfig";
import loggers from "../config/logger";
import { prisma } from "../config/primsaConfig";
import { JobType } from "@prisma/client";
import { sendDownlink, sendMulticastDownlink, sendUnicastDownlink } from "../services/schedularDownlink.service";
import {storeApplicationEvents} from "../config/redis"




//function to process the job when it is added to the queue

// first is send downlink throuhg unicast



const worker = new Worker(

  "schedulerQueue",

  async (job) => {

    // so job start aythu

    loggers.info(
      `🔥 Running Job: ${job.name}`
    );

    loggers.info(
      `Job data: ${JSON.stringify(job.data)}`
    );  

    const {
      schedulerId,
      applicationId,
    } = job.data;

    try {
      // first find wheather it is there or not 
      const scheduler = await prisma.schedularData.findUnique({
          where: {
            id: Number(schedulerId),
          },select:{
            jobType:true,
            groupName:true,
            groupId:true,
            data:true,
            time:true,

          }
        });
       // if not there then do not do anything and log it
      if (!scheduler) {

        loggers.warn(
          `Scheduler not found  while executing job: ${schedulerId}`
        );

        return;
      }

      // if schedular exit then we need to find out what is the triggerig action 

      const siteConfig = await prisma.siteConfiguration.findFirst({
          where: {
            applicationId,
          },
          select: {
            triggeringAction: true,
          },
        });

        loggers.info(
          `Site configuration for application ${applicationId}: ${JSON.stringify(siteConfig)}`)
;
 


  

      switch (siteConfig?.triggeringAction) {
        case "MULTICAST":

          await sendMulticastDownlink(
            scheduler.groupId as [string],
            scheduler.groupName as [string],
            scheduler.data,
            applicationId
          );

        case "BOTH":

          await sendUnicastDownlink(
            scheduler.groupId as [string],
            scheduler.data,
            applicationId
          );
      
        case "UNICAST":

          await sendDownlink(
            scheduler.groupId as [string],
            scheduler.data,
            applicationId
          );


          default:

            loggers.warn(
              `Unknown triggering action for application ${applicationId}: ${siteConfig?.triggeringAction}`
            );
         
      }

        
      if (
        scheduler.jobType === JobType.ONE_TIME
       
      ) {

         loggers.info(
          `One-time job completed, removing scheduler: ${schedulerId}`
        );

        await prisma.schedularData.delete({
          where: {
            id: Number(schedulerId),
          },
        });

        loggers.info(
          `🗑️ One-time scheduler deleted`
        );
      }

      await storeApplicationEvents(
        applicationId,
        JSON.stringify({
          type: "SCHEDULER_EXECUTED",
          name: scheduler.groupName,
          timeStamp: new Date().toISOString(),
        })
      );

      

    } catch (error: any) {

      loggers.error(
        `❌ Scheduler execution failed`
      );

      loggers.error(error);

       await storeApplicationEvents(
        applicationId,
        JSON.stringify({
          type: "ERROR",
          timeStamp: new Date().toISOString(),
        })
      );


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

worker.on("completed", (job) => {

  loggers.info(
    `✅ Job completed: ${job.id}`
  );
});

worker.on("failed", (job, err) => {

  loggers.error(
    `❌ Job failed: ${job?.id}`
  );

  loggers.error(err);
});

export default worker;