import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { asyncHandler } from "../middlewares/error.middleware";
import { userRepository } from "../repositories/repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { RegisterUserDto } from "../dto/register-user.dto";
import { userRole } from "../common/userRole.enum";
import { enqueueWelcomeEmail } from "../queues/user.queue";
import { userRequest } from "../common/userRequest.interface";
import hashPassword from "../common/hashPassword";
import { validate } from "class-validator";
import { UpdateUserRoleDto } from "../dto/update-user-role.dto";

const router = Router();

router.post(
    "/",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req, res) => {
        const dto = plainToInstance(RegisterUserDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            const messages = errors.map(e => Object.values(e.constraints || {})).flat();
            throw new HttpError(
                `Validation failed: ${messages.join(', ')}`,
                HttpStatusCode.BAD_REQUEST
            );
        }
        const { JWTrole } = req as userRequest;
        if (JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to create users",
                HttpStatusCode.FORBIDDEN
            );
        }
        const { email, password, role } = dto;
        const user = await userRepository.findOne({ where: { email } });
        if (user) {
            throw new HttpError(
                "User already exists",
                HttpStatusCode.BAD_REQUEST
            );
        }
        const hashedPassword = await hashPassword(password);
        const newUser = userRepository.create({
            email,
            password: hashedPassword,
            role,
        });
        await userRepository.save(newUser);
        await enqueueWelcomeEmail(newUser);
        res.status(HttpStatusCode.CREATED).json({
            message: "User created succesfully",
            data: { user: instanceToPlain(newUser) },
        });
    })
);

router.get(
    "/",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req, res) => {
        const { JWTrole } = req as userRequest;
        if (JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to fetch users",
                HttpStatusCode.FORBIDDEN
            );
        }
        const users = await userRepository.find();
        res.json({
            message: "Users fetched succesfully",
            data: { users: instanceToPlain(users) },
        });
    })
);

router.put(
    "/:id/role",
    authenticate,
    roleIdentifier,
    asyncHandler(async (req, res) => {
        const dto = plainToInstance(UpdateUserRoleDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            throw new HttpError("Validation failed", HttpStatusCode.BAD_REQUEST);
        }
        const { id } = req.params;
        const { JWTrole } = req as userRequest;
        if (JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to update user roles",
                HttpStatusCode.FORBIDDEN
            );
        }
        const user = await userRepository.findOne({
            where: { id: parseInt(id) },
        });
        if (!user) {
            throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
        }
        user.role = dto.role;
        await userRepository.save(user);
        res.json({
            message: "User role updated succesfully",
            data: { user: instanceToPlain(user) },
        });
    })
);

export default router;