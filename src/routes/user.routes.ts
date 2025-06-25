import { Router } from "express";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import authenticate from "../middlewares/auth.middleware";
import roleIdentifier from "../middlewares/role.middleare";
import { HttpError, asyncHandler } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRole } from "../common/userRole.enum";
import { userRequest } from "../common/userRequest.interface";
import { RegisterUserDto } from "../dto/register-user.dto";
import { UpdateUserRoleDto } from "../dto/update-user-role.dto";
import { userService } from "../services/user.services";

const router = Router();

router.post("/", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to create users", HttpStatusCode.FORBIDDEN);
    }

    const dto = plainToInstance(RegisterUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        const messages = errors.map(e => Object.values(e.constraints || {})).flat();
        throw new HttpError(`Validation failed: ${messages.join(', ')}`, HttpStatusCode.BAD_REQUEST);
    }
    
    const newUser = await userService.createUser(dto);

    res.status(HttpStatusCode.CREATED).json({
        message: "User created succesfully",
        data: { user: instanceToPlain(newUser) },
    });
}));

router.get("/", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to fetch users", HttpStatusCode.FORBIDDEN);
    }
    
    const users = await userService.getAllUsers();
    
    res.status(HttpStatusCode.OK).json({
        message: "Users fetched succesfully",
        data: { users: instanceToPlain(users) },
    });
}));

router.put("/:id/role", authenticate, roleIdentifier, asyncHandler(async (req: userRequest, res) => {
    if (req.JWTrole !== userRole.ADMIN) {
        throw new HttpError("You are not authorized to update user roles", HttpStatusCode.FORBIDDEN);
    }

    const dto = plainToInstance(UpdateUserRoleDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        throw new HttpError("Validation failed: Role is required", HttpStatusCode.BAD_REQUEST);
    }

    const userId = parseInt(req.params.id);
    const updatedUser = await userService.updateUserRole(userId, dto);

    res.status(HttpStatusCode.OK).json({
        message: "User role updated succesfully",
        data: { user: instanceToPlain(updatedUser) },
    });
}));

export default router;