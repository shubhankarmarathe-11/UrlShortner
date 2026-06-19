import ioredis from "ioredis";

const subscribe = new ioredis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export { subscribe };
