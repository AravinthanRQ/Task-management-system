import { projectRepository } from "../repositories/project.repository";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { ProjectDto } from "../dto/project.dto";
import { addMessageJob } from "../queues/message.producer";
import { Project } from "../entities/Project";

export const projectService = {
    async createProject(projectDto: ProjectDto, userId: number): Promise<Project> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new HttpError("User creator not found", HttpStatusCode.NOT_FOUND);
        }
        
        const project = await projectRepository.create(projectDto, user);
        
        await projectRepository.clearCache();
        await addMessageJob("createDefaultTask", { projectId: project.id, userId: user.id });
        
        return project;
    },

    async getProjects(role: userRole, userId: number): Promise<Project[]> {
        const cacheKey = role === userRole.ADMIN 
            ? projectRepository.getAdminCacheKey() 
            : projectRepository.getUserCacheKey(userId);

        const cachedProjects = await projectRepository.getFromCache<Project[]>(cacheKey);
        if (cachedProjects) return cachedProjects;

        const projects = role === userRole.ADMIN 
            ? await projectRepository.findAllForAdmin()
            : await projectRepository.findAllForUser(userId);
        
        await projectRepository.setCache(cacheKey, projects);
        return projects;
    },

    async getProjectById(projectId: number, role: userRole, userId: number): Promise<Project> {
        const cacheKey = projectRepository.getSingleProjectCacheKey(projectId);
        const cachedProject = await projectRepository.getFromCache<Project>(cacheKey);

        if (cachedProject) {
            if (role !== userRole.ADMIN && cachedProject.createdBy.id !== userId) {
                throw new HttpError("Access denied", HttpStatusCode.FORBIDDEN);
            }
            return cachedProject;
        }

        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
        }

        if (role !== userRole.ADMIN && project.createdBy.id !== userId) {
            throw new HttpError("Access denied", HttpStatusCode.FORBIDDEN);
        }
        
        await projectRepository.setCache(cacheKey, project);
        return project;
    },

    async updateProject(projectId: number, projectDto: Partial<ProjectDto>): Promise<Project> {
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
        }

        const updatedProject = await projectRepository.update(project, projectDto);
        await projectRepository.clearCache(projectId, project.createdBy.id);
        
        return updatedProject;
    },

    async deleteProject(projectId: number): Promise<void> {
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
        }

        await projectRepository.remove(project);
        await projectRepository.clearCache(projectId, project.createdBy.id);
    }
};