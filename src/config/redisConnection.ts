import log from "../common/log";
import { Redis, RedisOptions } from "ioredis";
import { REDIS_HOST, REDIS_PORT } from "./env";
import { logT } from "../common/logT.enum";

const redisOption: RedisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisOption);

log(logT.Log, "Redis connected Successfully");

export default redisConnection;
