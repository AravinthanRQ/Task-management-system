import { Response } from "express";
import { instanceToPlain } from "class-transformer";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import * as taskService from "../services/tasks.services";

export const createTaskController = asyncHandler(
    async (req: userRequest, res: Response) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "Only admin can create tasks",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const projectId = parseInt(req.params.projectId, 10);
        const dto = req.body as CreateTaskDto;

        const task = await taskService.createTask(projectId, req.id!, dto);

        res.status(HttpStatusCode.CREATED).json({
            message: "Task created",
            data: { task: instanceToPlain(task) },
        });
    },
);

export const getTasksByProjectController = asyncHandler(
    async (req: userRequest, res: Response) => {
        const projectId = parseInt(req.params.projectId, 10);

        const tasks = await taskService.getTasksByProject(
            projectId,
            req.JWTrole!,
            req.id!,
        );

        res.status(HttpStatusCode.OK).json({
            message: "Tasks fetched",
            data: { tasks: instanceToPlain(tasks) },
        });
    },
);

export const updateTaskStatusController = asyncHandler(
    async (req: userRequest, res: Response) => {
        const taskId = parseInt(req.params.id, 10);
        const dto = req.body as UpdateTaskDto;

        const task = await taskService.updateTaskStatus(
            taskId,
            req.id!,
            req.JWTrole!,
            dto,
        );

        res.status(HttpStatusCode.OK).json({
            message: "Task updated",
            data: { task: instanceToPlain(task) },
        });
    },
);

export const deleteTaskController = asyncHandler(
    async (req: userRequest, res: Response) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "Only admin can delete tasks",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const taskId = parseInt(req.params.id, 10);
        await taskService.deleteTask(taskId);

        res.status(HttpStatusCode.OK).json({ message: "Task deleted" });
    },
);
