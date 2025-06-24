/*
 * Job: a type representing a job that is added to a queue
 * Worker: a class that processes jobs from a queue
 */
import { Job, Worker } from "bullmq";
import log from "../common/log";
import { QUEUE_NAME } from "../config/env";
import redisConnection from "../config/redisConnection";
import { logT } from "../common/logT.enum";

const concurrency = 2; // Setting number of jobs the worker can process at the same time

/*
 * Creating a new worker that will start listening for jobs in the given queue that gets:
 * => Queue name to listen to the queue
 * => Async function that will be called for every job
 * => Configuration option - connection and concurrency
 */
const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
        log(logT.Job, `[JOB] Processing Job ${job.id} with data: ${job.data}`);
    },
    {
        connection: redisConnection,
        concurrency,
    },
);

worker.on("completed", (job) => {
    log(logT.Job, `Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    log(logT.Error, `Job ${job?.id} failed with Error: ${error}`);
});

log(logT.Job, `Worker started with concurrency: ${concurrency}`);
