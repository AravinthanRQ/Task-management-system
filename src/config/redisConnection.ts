import { Redis, RedisOptions } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./env";

const redisOption: RedisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisOption);

console.log("[LOG] Redis connected Successfully");

export default redisConnection;
