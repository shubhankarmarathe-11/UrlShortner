import ioredis from "ioredis";

const RedisCli = new ioredis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

RedisCli.on("connect", () => {
  console.log("Redis connected");
});

RedisCli.on("error", (err) => {
  console.error("Redis error:", err);
});

export { RedisCli };
