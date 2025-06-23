/*
 * Job: a type representing a job that is added to a queue
 * Worker: a class that processes jobs from a queue
 */
import { Job, Worker } from "bullmq";
import { QUEUE_NAME } from "../config/env";
import redisConnection from "../config/redisConnection";

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
        console.log(`[JOB] Processing Job ${job.id} with data: ${job.data}`);
    },
    {
        connection: redisConnection,
        concurrency,
    },
);

worker.on("completed", (job) => {
    console.log(`[JOB] Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.log(`[JOB] Job ${job?.id} failed with Error: ${error}`);
});

console.log(`[LOG] Worker started with concurrency: ${concurrency}`);
