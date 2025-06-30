import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import validationMiddleware from "../middlewares/validate.middleware";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import {
    createTaskController,
    deleteTaskController,
    getTasksByProjectController,
    updateTaskStatusController,
} from "../controller/tasks.controller";

const router = Router();

router.post(
    "/projects/:projectId/tasks",
    authenticate,
    roleIdentifier,
    validationMiddleware(CreateTaskDto),
    createTaskController,
);

router.get(
    "/projects/:projectId/tasks",
    authenticate,
    roleIdentifier,
    getTasksByProjectController,
);

router.patch(
    "/:id",
    authenticate,
    roleIdentifier,
    validationMiddleware(UpdateTaskDto),
    updateTaskStatusController,
);

router.delete("/:id", authenticate, roleIdentifier, deleteTaskController);

export default router;

