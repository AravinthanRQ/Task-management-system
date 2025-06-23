import { Queue } from "bullmq";
import redisConnection from "../config/redisConnection";
import { QUEUE_NAME } from "../config/env";

export const messageQueue = new Queue(QUEUE_NAME, {
    connection: redisConnection,
});
