import ioredis from "ioredis";
import { SendMessage } from "../email.services.ts";
import { RedisCli } from "./redis.ts";

const subscribe = new ioredis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export { subscribe };
