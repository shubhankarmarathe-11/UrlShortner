import { Redis } from "ioredis";

const RedisCli = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port:
    parseInt(process.env.REDIS_PORT ? process.env.REDIS_PORT : "6379") || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

RedisCli.on("connect", () => {
  console.log("Redis connected");
});

RedisCli.on("error", (err: any) => {
  console.error("Redis error:", err);
});

export { RedisCli };
