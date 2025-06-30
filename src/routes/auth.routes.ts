import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import roleIdentifier from "../middlewares/role.middleare";
import validationMiddleware from "../middlewares/validate.middleware";
import {
    getProfileController,
    loginUserController,
    registerUserController,
} from "../controller/auth.controller";

const router = Router();

router.post(
    "/register",
    authenticate,
    roleIdentifier,
    validationMiddleware(RegisterUserDto, "body", false),
    registerUserController,
);

router.post(
    "/login",
    validationMiddleware(LoginUserDto, "body", false),
    loginUserController,
);

router.get("/profile", authenticate, getProfileController);

export default router;
