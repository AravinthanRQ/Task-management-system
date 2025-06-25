import { Router } from "express";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { userRequest } from "../common/userRequest.interface";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { plainToInstance, instanceToPlain } from "class-transformer";
import { validate } from "class-validator";
import { userRole } from "../common/userRole.enum";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import { projectRepository, taskRepository, userRepository } from "../repositories/repository";
import redisConnection from "../config/redisConnection";

const router = Router();

router.post(
  "/projects/:projectId/tasks",
  authenticate,
  roleIdentifier,
  asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN)
      throw new HttpError("Only admin can create tasks", HttpStatusCode.FORBIDDEN);

    const dto = plainToInstance(CreateTaskDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) throw new HttpError("Invalid task data", HttpStatusCode.BAD_REQUEST);

    const project = await projectRepository.findOneBy({ id: parseInt(req.params.projectId, 10) });
    if (!project) throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);

    const user = await userRepository.findOneBy({ id: req.id });
    const task = taskRepository.create({ ...dto, createdBy: user!, project });
    await taskRepository.save(task);

    await redisConnection.del(`tasks:${project.id}:${user?.id}`);

    res.status(HttpStatusCode.CREATED).json({ message: "Task created", data: { task: instanceToPlain(task) } });
  })
);

router.get(
  "/projects/:projectId/tasks",
  authenticate,
  roleIdentifier,
  asyncHandler(async (req: userRequest, res) => {
    const projectId = parseInt(req.params.projectId, 10);
    const key = `tasks:${projectId}:${req.id}`;

    const cached = await redisConnection.get(key);
    if (cached) {
      return res.status(HttpStatusCode.OK).json({ message: "Fetched from cache", data: { tasks: JSON.parse(cached) } });
    }

    const tasks = req.JWTrole === userRole.ADMIN
      ? await taskRepository.find({ where: { project: { id: projectId } }, relations: ["createdBy", "project"] })
      : await taskRepository.find({ where: { project: { id: projectId }, createdBy: { id: req.id } }, relations: ["project"] });

    const plainTasks = instanceToPlain(tasks);
    await redisConnection.set(key, JSON.stringify(plainTasks), "EX", 60 * 60);

    res.json({ message: "Tasks fetched", data: { tasks: plainTasks } });
  })
);

router.patch(
  "/tasks/:id",
  authenticate,
  roleIdentifier,
  asyncHandler(async (req: userRequest, res) => {
    const task = await taskRepository.findOne({ where: { id: parseInt(req.params.id, 10) }, relations: ["createdBy", "project"] });
    if (!task) throw new HttpError("Task not found", HttpStatusCode.NOT_FOUND);

    if (req.JWTrole === userRole.USER && task.createdBy.id !== req.id)
      throw new HttpError("Unauthorized", HttpStatusCode.FORBIDDEN);

    const dto = plainToInstance(UpdateTaskDto, req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) throw new HttpError("Invalid update data", HttpStatusCode.BAD_REQUEST);

    task.status = dto.status;
    await taskRepository.save(task);

    await redisConnection.del(`tasks:${task.project.id}:${task.createdBy.id}`);

    res.json({ message: "Task updated", data: { task: instanceToPlain(task) } });
  })
);

router.delete(
  "/tasks/:id",
  authenticate,
  roleIdentifier,
  asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN)
      throw new HttpError("Only admin can delete tasks", HttpStatusCode.FORBIDDEN);

    const task = await taskRepository.findOne({ where: { id: parseInt(req.params.id, 10) }, relations: ["project", "createdBy"] });
    if (!task) throw new HttpError("Task not found", HttpStatusCode.NOT_FOUND);

    await taskRepository.remove(task);
    await redisConnection.del(`tasks:${task.project.id}:${task.createdBy.id}`);

    res.json({ message: "Task deleted" });
  })
);

export default router;
