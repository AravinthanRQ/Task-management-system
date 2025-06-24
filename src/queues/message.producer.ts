import { messageQueue } from "./queue";
import log from "../common/log";

// addMessageJob accepts the data to enqueue a job
export const addMessageJob = async (data: any) => {
    // Adds a job to the messageQueue with a name 'send_message' (job identifier) and payload data
    await messageQueue.add("send_message", data, {
        attempts: 3, // The job will retry up to 3 times if it fails
        backoff: {
            /* Retry strategy :>
             * - After a failure, the job will wait before retrying: first retry after 1s, then longer (exponential)
             * - Prevents hammering the system with constant retries; more graceful
             */
            type: "exponential",
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    });
    log("LOG", "Job added to Queue");
};
