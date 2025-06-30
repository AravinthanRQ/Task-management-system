import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import {
    createUserController,
    getAllUsersController,
    updateUserRoleController,
} from "../controller/user.controller";
import validationMiddleware from "../middlewares/validate.middleware";
import { RegisterUserDto } from "../dto/register-user.dto";

const router = Router();

router.post(
    "/",
    authenticate,
    roleIdentifier,
    validationMiddleware(RegisterUserDto),
    createUserController,
);

router.get("/", authenticate, roleIdentifier, getAllUsersController);

router.put("/:id/role", authenticate, roleIdentifier, updateUserRoleController);

export default router;

