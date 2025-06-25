/*
 * Job: a type representing a job that is added to a queue
 * Worker: a class that processes jobs from a queue
 */
import { Job, Worker } from "bullmq";
import log from "../common/log";
import { QUEUE_NAME } from "../config/env";
import redisConnection from "../config/redisConnection";
import { logT } from "../common/logT.enum";
import { AppDataSource } from "../config/data-source";
import { projectRepository, taskRepository, userRepository } from "../repositories/repository";

const startWorker = async () => {
    try {
        await AppDataSource.initialize();
        log(logT.Log, "Database connected successfully for worker.");
    } catch (error) {
        log(logT.Error, `Worker failed to connect to database: ${error}`);
        process.exit(1);
    }

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
            log(logT.Job, `[JOB] Processing Job '${job.name}' (${job.id}) with data: ${JSON.stringify(job.data)}`);

            switch (job.name) {
                case "createDefaultTask":
                    const { projectId, userId } = job.data;
                    const project = await projectRepository.findOneBy({ id: projectId });
                    const user = await userRepository.findOneBy({ id: userId });

                    if (!project || !user) {
                        throw new Error(`Project or User not found for job ${job.id}. ProjectID: ${projectId}, UserID: ${userId}`);
                    }

                    const defaultTask = taskRepository.create({
                        name: "Welcome Task",
                        description: "This is a default task created for your new project.",
                        project: project,
                        createdBy: user
                    });
                    await taskRepository.save(defaultTask);
                    log(logT.Job, `Default task created for project ${projectId}`);
                    break;
                
                case "send_message":
                    log(logT.Job, `Processing send_message job with data: ${JSON.stringify(job.data)}`);
                    break;

                default:
                    log(logT.Job, `No handler for job name ${job.name}`);
                    break;
            }
        },
        {
            connection: redisConnection,
            concurrency,
        },
    );

    worker.on("completed", (job) => {
        log(logT.Job, `Job ${job.id} (${job.name}) completed`);
    });

    worker.on("failed", (job, error) => {
        log(logT.Error, `Job ${job?.id} (${job?.name}) failed with Error: ${error.message}`);
    });

    log(logT.Job, `Worker started with concurrency: ${concurrency}`);
};

startWorker();