import {  Queue } from "bullmq";
import redisConnection from "../config/redisConnection";
import { QUEUE_NAME } from "../config/env";

// Setup recurring reminder queue
const reminderQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

export const scheduleDailyReminders = async () => {
  await reminderQueue.add(
    "sendDailyReminders",
    {},
    {
      repeat: {
        pattern: "0 9 * * *", // 9 AM daily
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};
