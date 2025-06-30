import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import validationMiddleware from "../middlewares/validate.middleware";
import { ProjectDto } from "../dto/project.dto";
import {
    createProject,
    deleteProject,
    getAllProjects,
    getProjectById,
    updateProject,
} from "../controller/projects.controller";

const router = Router();

router.post(
    "/",
    authenticate,
    roleIdentifier,
    validationMiddleware(ProjectDto, "body"),
    createProject,
);

router.get("/", authenticate, roleIdentifier, getAllProjects);

router.get("/:id", authenticate, roleIdentifier, getProjectById);

router.patch(
    "/:id",
    authenticate,
    roleIdentifier,
    validationMiddleware(ProjectDto, "body", true),
    updateProject,
);

router.delete("/:id", authenticate, roleIdentifier, deleteProject);

export default router;

