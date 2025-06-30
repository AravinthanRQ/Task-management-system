import { Queue } from "bullmq";
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
                pattern: "* * * * *",
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    );
};
