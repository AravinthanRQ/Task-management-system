import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { asyncHandler } from "../middlewares/error.middleware";
import { projectRepository, userRepository } from "../repositories/repository";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { ProjectDto } from "../dto/project.dto";
import { validate } from "class-validator";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import redisConnection from "../config/redisConnection";
import { addMessageJob } from "../queues/message.producer";

const router = Router();

const getProjectCacheKey = (role: userRole, userId: number) => {
    if (role === userRole.ADMIN) {
        return `projects:admin`;
    } else {
        return `projects:user:${userId}`;
    }
};

router.post(
    "/",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req: userRequest, res) => {
        const dto = plainToInstance(ProjectDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            throw new HttpError(
                "Invalid project data",
                HttpStatusCode.BAD_REQUEST
            );
        }
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to create projects",
                HttpStatusCode.FORBIDDEN
            );
        }

        const user = await userRepository.findOne({ where: { id: req.id } });
        if (!user) {
            throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);
        }

        const project = projectRepository.create({ ...dto, createdBy: user });
        await projectRepository.save(project);

        await redisConnection.del("projects:admin", "projects:all");

        await addMessageJob("createDefaultTask", { projectId: project.id, userId: user.id });

        res.status(HttpStatusCode.CREATED).json({
            message: "Project created successfully",
            data: { project: instanceToPlain(project) },
        });
    })
);

router.get(
    "/",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req: userRequest, res) => {
        const { JWTrole, id: userId } = req;

        const cacheKey =
            JWTrole === userRole.ADMIN
                ? "projects:admin"
                : `projects:user:${userId}`;

        const cachedProjects = await redisConnection.get(cacheKey);
        if (cachedProjects) {
            return res.status(HttpStatusCode.OK).json({
                message: "Projects fetched successfully (from cache)",
                data: { projects: JSON.parse(cachedProjects) },
            });
        }

        const projects =
            JWTrole === userRole.ADMIN
                ? await projectRepository.find({ relations: ["tasks", "createdBy"] })
                : await projectRepository.find({
                      where: { createdBy: { id: userId } },
                      relations: ["tasks", "createdBy"],
                  });

        const plainProjects = instanceToPlain(projects);
        await redisConnection.set(cacheKey, JSON.stringify(plainProjects), "EX", 60 * 60 * 24);

        res.status(HttpStatusCode.OK).json({
            message: "Projects fetched successfully",
            data: { projects: plainProjects },
        });
    })
);


router.get(
    "/:id",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req: userRequest, res) => {
        const projectId = parseInt(req.params.id);
        const { JWTrole, id: userId } = req;

        const cacheKey = `project:${projectId}`;
        const cachedProject = await redisConnection.get(cacheKey);
        if (cachedProject) {
            const project = JSON.parse(cachedProject);
            if (JWTrole !== userRole.ADMIN && project.createdBy.id !== userId) {
                throw new HttpError("Access denied", HttpStatusCode.FORBIDDEN);
            }
            return res.status(HttpStatusCode.OK).json({
                message: "Project fetched successfully",
                data: { project },
            });
        }

        const project = await projectRepository.findOne({
            where: { id: projectId },
            relations: ["tasks", "createdBy"],
        });

        if (!project) {
            throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
        }

        if (JWTrole !== userRole.ADMIN && project.createdBy.id !== userId) {
            throw new HttpError("Access denied", HttpStatusCode.FORBIDDEN);
        }

        const plainProject = instanceToPlain(project);
        await redisConnection.set(cacheKey, JSON.stringify(plainProject), "EX", 60 * 60 * 24);

        res.status(HttpStatusCode.OK).json({
            message: "Project fetched successfully",
            data: { project: plainProject },
        });
    })
);


router.patch("/:id", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to update projects", HttpStatusCode.FORBIDDEN);
    }
    
    const projectId = parseInt(req.params.id);
    const dto = plainToInstance(ProjectDto, req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length > 0) {
        const validationErrors = errors.map(e => Object.values(e.constraints || {})).flat();
        throw new HttpError(`Validation failed: ${validationErrors.join(', ')}`, HttpStatusCode.BAD_REQUEST);
    }

    const project = await projectRepository.findOneBy({ id: projectId });
    if (!project) {
        throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
    }
    
    projectRepository.merge(project, dto);
    const updatedProject = await projectRepository.save(project);

    await redisConnection.del("projects:admin", "projects:all", `project:${projectId}`);

    res.status(HttpStatusCode.OK).json({
        message: "Project updated successfully",
        data: { project: instanceToPlain(updatedProject) },
    });
}));

router.delete(
    "/:id",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req: userRequest, res) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError("You are not authorized to delete projects", HttpStatusCode.FORBIDDEN);
        }

        const projectId = parseInt(req.params.id);
        const project = await projectRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["tasks"],
        });
        if (!project) {
            throw new HttpError("Project not found", HttpStatusCode.NOT_FOUND);
        }

        await projectRepository.remove(project);
        await redisConnection.del("projects:admin", "projects:all", `project:${projectId}`);

        res.status(HttpStatusCode.OK).json({
            message: "Project deleted successfully",
        });
    })
);

export default router;
