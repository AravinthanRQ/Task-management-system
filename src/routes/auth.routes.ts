import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { HttpError, asyncHandler } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRepository } from "../repositories/repository";
import { generateToken } from "../common/jwt";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginUserDto } from "../dto/login-user.dto";
import { instanceToPlain } from "class-transformer";
import comparePassword from "../common/comparePassword";
import { userRequest } from "../common/userRequest.interface";

const router = Router();

router.post("/register", authenticate, roleIdentifier, asyncHandler(async (req, res) => {
    const { email, password, role } = req.body as RegisterUserDto;
    const user = userRepository.create({ email, password, role: role });
    await userRepository.save(user);
    const token = generateToken({ id: user.id });
    res.json({
        message: "User registered succesfully with role: " + role,
        data: { user: instanceToPlain(user), token },
    });
}));

router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginUserDto;
    if (!email || !password) {
        throw new HttpError("Missing required fields", HttpStatusCode.BAD_REQUEST);
    }
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
    }
    const token = generateToken({ id: user.id });
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new HttpError("Invalid password", HttpStatusCode.BAD_REQUEST);
    }
    res.json({
        message: "User logged in succesfully",
        data: { user: instanceToPlain(user), token },
    });
}));

router.get("/profile", authenticate, roleIdentifier, asyncHandler(async (req, res) => {
    const { id } = req as userRequest;
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
    }
    res.json({ message: "User profile fetched succesfully", data: { user: instanceToPlain(user) } });
}));

export default router;