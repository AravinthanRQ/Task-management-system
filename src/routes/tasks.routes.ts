import { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import { taskService } from "../services/tasks.services";

const router = Router();

router.post("/projects/:projectId/tasks", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("Only admin can create tasks", HttpStatusCode.FORBIDDEN);
    }

    const dto = plainToInstance(CreateTaskDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new HttpError("Invalid task data", HttpStatusCode.BAD_REQUEST);

    const projectId = parseInt(req.params.projectId, 10);
    const task = await taskService.createTask(projectId, req.id!, dto);

    res.status(HttpStatusCode.CREATED).json({ message: "Task created", data: { task: instanceToPlain(task) } });
}));

router.get("/projects/:projectId/tasks", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    const projectId = parseInt(req.params.projectId, 10);
    const tasks = await taskService.getTasksByProject(projectId, req.JWTrole!, req.id!);

    res.status(HttpStatusCode.OK).json({ message: "Tasks fetched", data: { tasks: instanceToPlain(tasks) } });
}));

router.patch("/:id", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    const taskId = parseInt(req.params.id, 10);
    
    const dto = plainToInstance(UpdateTaskDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new HttpError("Invalid update data: status is required", HttpStatusCode.BAD_REQUEST);
    
    const task = await taskService.updateTaskStatus(taskId, req.id!, req.JWTrole!, dto);

    res.status(HttpStatusCode.OK).json({ message: "Task updated", data: { task: instanceToPlain(task) } });
}));

router.delete("/:id", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("Only admin can delete tasks", HttpStatusCode.FORBIDDEN);
    }
    
    const taskId = parseInt(req.params.id, 10);
    await taskService.deleteTask(taskId);

    res.status(HttpStatusCode.OK).json({ message: "Task deleted" });
}));

export default router;