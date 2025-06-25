import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Tasks";
import { Project } from "../entities/Project";
import { User } from "../entities/User";
import { CreateTaskDto } from "../dto/task.dto";
import redisConnection from "../config/redisConnection";
import { instanceToPlain } from "class-transformer";
import { taskStatus } from "../common/taskStatus.enum";

const ormRepository = AppDataSource.getRepository(Task);

export const taskRepository = {
    getCacheKey: (projectId: number, userId: number) => `tasks:${projectId}:${userId}`,

    async getFromCache<T>(key: string): Promise<T | null> {
        const cached = await redisConnection.get(key);
        return cached ? JSON.parse(cached) : null;
    },

    async setCache(key: string, data: any): Promise<void> {
        const plainData = instanceToPlain(data);
        await redisConnection.set(key, JSON.stringify(plainData), "EX", 60 * 60); // 1-hour expiry
    },

    async clearCache(projectId: number, userId: number): Promise<void> {
        await redisConnection.del(this.getCacheKey(projectId, userId));
    },

    async create(taskData: CreateTaskDto, project: Project, user: User): Promise<Task> {
        const task = ormRepository.create({ ...taskData, project, createdBy: user });
        return ormRepository.save(task);
    },

    findByProjectIdForAdmin(projectId: number): Promise<Task[]> {
        return ormRepository.find({
            where: { project: { id: projectId } },
            relations: ["createdBy", "project"],
        });
    },

    findByProjectIdForUser(projectId: number, userId: number): Promise<Task[]> {
        return ormRepository.find({
            where: { project: { id: projectId }, createdBy: { id: userId } },
            relations: ["project"],
        });
    },

    findById(id: number): Promise<Task | null> {
        return ormRepository.findOne({
            where: { id },
            relations: ["createdBy", "project"],
        });
    },

    async updateStatus(task: Task, status: taskStatus): Promise<Task> {
        task.status = status;
        return ormRepository.save(task);
    },

    remove(task: Task): Promise<Task> {
        return ormRepository.remove(task);
    },
};