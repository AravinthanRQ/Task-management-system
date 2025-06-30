import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import { taskRepository } from "../repositories/task.repository";
import { projectRepository } from "../repositories/project.repository";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { Task } from "../entities/Tasks";

export async function createTask(
    projectId: number,
    userId: number,
    taskDto: CreateTaskDto,
): Promise<Task> {
    const project = await projectRepository.findById(projectId);
    if (!project)
        throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);

    const user = await userRepository.findById(userId);
    if (!user) throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);

    const task = await taskRepository.create(taskDto, project, user);
    await taskRepository.clearCache(projectId, userId);

    return task;
}

export async function getTasksByProject(
    projectId: number,
    role: userRole,
    userId: number,
): Promise<Task[]> {
    const cacheKey = taskRepository.getCacheKey(projectId, userId);
    const cachedTasks = await taskRepository.getFromCache<Task[]>(cacheKey);
    if (cachedTasks) return cachedTasks;

    const tasks =
        role === userRole.ADMIN
            ? await taskRepository.findByProjectIdForAdmin(projectId)
            : await taskRepository.findByProjectIdForUser(projectId, userId);

    await taskRepository.setCache(cacheKey, tasks);
    return tasks;
}

export async function updateTaskStatus(
    taskId: number,
    userId: number,
    role: userRole,
    taskDto: UpdateTaskDto,
): Promise<Task> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new HttpError("Task not found", HttpStatusCode.NOT_FOUND);

    if (role === userRole.USER && task.createdBy.id !== userId) {
        throw new HttpError(
            "Unauthorized to update this task",
            HttpStatusCode.FORBIDDEN,
        );
    }

    const updatedTask = await taskRepository.updateStatus(task, taskDto.status);
    await taskRepository.clearCache(task.project.id, task.createdBy.id);

    return updatedTask;
}

export async function deleteTask(taskId: number): Promise<void> {
    const task = await taskRepository.findById(taskId);
    if (!task) throw new HttpError("Task not found", HttpStatusCode.NOT_FOUND);

    await taskRepository.remove(task);
    await taskRepository.clearCache(task.project.id, task.createdBy.id);
}

