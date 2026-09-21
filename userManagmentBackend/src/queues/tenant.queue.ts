import { Queue } from "bullmq";
import envconfig from "../config/envConfig";


export const syncQueue = new Queue("syncQueue", {
  connection: {
    host: envconfig.getRedisHost(),
    port: envconfig.getRedisPort(),
  },
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});