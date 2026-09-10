import { Redis } from "ioredis";
import loggers from "./logger";
import envconfig from "./envConfig";
const MAX_EVENTS = 12;

let redis: Redis;

const getSocketIo = () => {
  try {
    const { io } = require("../server");
    return io;
  } catch {
    return null;
  }
};

export const getRedisClient = () => {
  if (!redis) {
    redis = new Redis({
      host: String(envconfig.getRedisHost()) || "localhost",
      port: Number(envconfig.getRedisPort()) || 6379,
      maxRetriesPerRequest: null,
    });

    redis.on("connect", () => {
      loggers.info("✅ Redis connected");
    });

    redis.on("ready", () => {
      loggers.info("✅ Redis READY (fully connected)");
    });

    redis.on("error", (err) => {
      loggers.error("❌ Redis error:", err);
    });
  }

  return redis;
};

export const storeApplicationEvents = async (applicationId: string, event: string) => {
  const redisClient = getRedisClient();
  const key = `app:${applicationId}:events`;
  await redisClient.lpush(key, event);
  await redisClient.ltrim(key, 0, MAX_EVENTS - 1);

  const socketIo = getSocketIo();
  if (socketIo) {
    socketIo.to(applicationId).emit("applicationEvent", JSON.parse(event));
  }
};

export const getApplicationEvents = async (applicationID: string) => {
  const redis = getRedisClient();

  const key = `app:${applicationID}:events`;

  const data = await redis.lrange(key, 0, MAX_EVENTS - 1);

  return data.map((item) => JSON.parse(item));
};