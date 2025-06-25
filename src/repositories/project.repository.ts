import { AppDataSource } from "../config/data-source";
import { Project } from "../entities/Project";
import redisConnection from "../config/redisConnection";
import { instanceToPlain } from "class-transformer";
import { ProjectDto } from "../dto/project.dto";
import { User } from "../entities/User";

const ormRepository = AppDataSource.getRepository(Project);

export const projectRepository = {
    getAdminCacheKey: () => "projects:admin",
    getUserCacheKey: (userId: number) => `projects:user:${userId}`,
    getSingleProjectCacheKey: (projectId: number) => `project:${projectId}`,

    async getFromCache<T>(key: string): Promise<T | null> {
        const cached = await redisConnection.get(key);
        return cached ? JSON.parse(cached) : null;
    },

    async setCache(key: string, data: any): Promise<void> {
        const plainData = instanceToPlain(data);
        await redisConnection.set(key, JSON.stringify(plainData), "EX", 60 * 60 * 24); // 24-hour expiry
    },

    async clearCache(projectId?: number, userId?: number): Promise<void> {
        const keysToDelete: string[] = [this.getAdminCacheKey()];
        if (userId) keysToDelete.push(this.getUserCacheKey(userId));
        if (projectId) keysToDelete.push(this.getSingleProjectCacheKey(projectId));

        if (keysToDelete.length > 0) {
            await redisConnection.del(...keysToDelete);
        }
    },
    
    async create(projectData: ProjectDto, user: User): Promise<Project> {
        const project = ormRepository.create({ ...projectData, createdBy: user });
        return ormRepository.save(project);
    },

    findAllForAdmin(): Promise<Project[]> {
        return ormRepository.find({ relations: ["tasks", "createdBy"] });
    },

    findAllForUser(userId: number): Promise<Project[]> {
        return ormRepository.find({
            where: { createdBy: { id: userId } },
            relations: ["tasks", "createdBy"],
        });
    },

    findById(id: number): Promise<Project | null> {
        return ormRepository.findOne({
            where: { id },
            relations: ["tasks", "createdBy"],
        });
    },

    async update(project: Project, data: Partial<ProjectDto>): Promise<Project> {
        ormRepository.merge(project, data);
        return ormRepository.save(project);
    },

    remove(project: Project): Promise<Project> {
        return ormRepository.remove(project);
    },
};