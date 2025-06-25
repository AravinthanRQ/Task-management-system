import { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import { ProjectDto } from "../dto/project.dto";
import { projectService } from "../services/projects.services";

const router = Router();

router.post("/", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to create projects", HttpStatusCode.FORBIDDEN);
    }

    const dto = plainToInstance(ProjectDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        throw new HttpError("Invalid project data", HttpStatusCode.BAD_REQUEST);
    }

    const project = await projectService.createProject(dto, req.id!);
    
    res.status(HttpStatusCode.CREATED).json({
        message: "Project created successfully",
        data: { project: instanceToPlain(project) },
    });
}));

router.get("/", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    const projects = await projectService.getProjects(req.JWTrole!, req.id!);

    res.status(HttpStatusCode.OK).json({
        message: "Projects fetched successfully",
        data: { projects: instanceToPlain(projects) },
    });
}));

router.get("/:id", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    const projectId = parseInt(req.params.id);
    const project = await projectService.getProjectById(projectId, req.JWTrole!, req.id!);

    res.status(HttpStatusCode.OK).json({
        message: "Project fetched successfully",
        data: { project: instanceToPlain(project) },
    });
}));

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

    const updatedProject = await projectService.updateProject(projectId, dto);
    
    res.status(HttpStatusCode.OK).json({
        message: "Project updated successfully",
        data: { project: instanceToPlain(updatedProject) },
    });
}));

router.delete("/:id", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to delete projects", HttpStatusCode.FORBIDDEN);
    }

    const projectId = parseInt(req.params.id);
    await projectService.deleteProject(projectId);

    res.status(HttpStatusCode.OK).json({ message: "Project deleted successfully" });
}));

export default router;