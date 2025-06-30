import { Response } from "express";
import { instanceToPlain } from "class-transformer";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import { ProjectDto } from "../dto/project.dto";
import * as projectService from "../services/projects.services";

export const createProject = asyncHandler(
    async (req: userRequest, res: Response) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to create projects",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const projectDto = req.body as ProjectDto;
        const project = await projectService.createProject(projectDto, req.id!);

        res.status(HttpStatusCode.CREATED).json({
            message: "Project created successfully",
            data: { project: instanceToPlain(project) },
        });
    },
);

export const getAllProjects = asyncHandler(
    async (req: userRequest, res: Response) => {
        const projects = await projectService.getProjects(
            req.JWTrole!,
            req.id!,
        );

        res.status(HttpStatusCode.OK).json({
            message: "Projects fetched successfully",
            data: { projects: instanceToPlain(projects) },
        });
    },
);

export const getProjectById = asyncHandler(
    async (req: userRequest, res: Response) => {
        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) {
            throw new HttpError(
                "Invalid project ID provided",
                HttpStatusCode.BAD_REQUEST,
            );
        }

        const project = await projectService.getProjectById(
            projectId,
            req.JWTrole!,
            req.id!,
        );

        res.status(HttpStatusCode.OK).json({
            message: "Project fetched successfully",
            data: { project: instanceToPlain(project) },
        });
    },
);

export const updateProject = asyncHandler(
    async (req: userRequest, res: Response) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to update projects",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) {
            throw new HttpError(
                "Invalid project ID provided",
                HttpStatusCode.BAD_REQUEST,
            );
        }

        const projectDto = req.body as Partial<ProjectDto>;
        const updatedProject = await projectService.updateProject(
            projectId,
            projectDto,
        );

        res.status(HttpStatusCode.OK).json({
            message: "Project updated successfully",
            data: { project: instanceToPlain(updatedProject) },
        });
    },
);

export const deleteProject = asyncHandler(
    async (req: userRequest, res: Response) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to delete projects",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const projectId = parseInt(req.params.id);
        if (isNaN(projectId)) {
            throw new HttpError(
                "Invalid project ID provided",
                HttpStatusCode.BAD_REQUEST,
            );
        }

        await projectService.deleteProject(projectId);

        res.status(HttpStatusCode.OK).json({
            message: "Project deleted successfully",
        });
    },
);
