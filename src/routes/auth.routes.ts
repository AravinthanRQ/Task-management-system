import { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import authenticate from "../middlewares/auth.middleware";
import { HttpError, asyncHandler } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { LoginUserDto } from "../dto/login-user.dto";
import { userRequest } from "../common/userRequest.interface";
import { authService } from "../services/auth.services";

const router = Router();

router.post("/login", asyncHandler(async (req, res) => {
    const dto = plainToInstance(LoginUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        throw new HttpError("Missing required fields: email, password", HttpStatusCode.BAD_REQUEST);
    }

    const { user, token } = await authService.login(dto);

    res.status(HttpStatusCode.OK).json({
        message: "User logged in succesfully",
        data: { user: instanceToPlain(user), token },
    });
}));

router.get("/profile", authenticate, asyncHandler(async (req: userRequest, res) => {
    const user = await authService.getProfile(req.id!);

    res.status(HttpStatusCode.OK).json({
        message: "User profile fetched succesfully",
        data: { user: instanceToPlain(user) }
    });
}));

export default router;