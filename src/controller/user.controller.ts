import { instanceToPlain } from "class-transformer";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRequest } from "../common/userRequest.interface";
import { userRole } from "../common/userRole.enum";
import { asyncHandler, HttpError } from "../middlewares/error.middleware";
import {
    createUser,
    getAllUsers,
    updateUserRole,
} from "../services/user.services";

export const createUserController = asyncHandler(
    async (req: userRequest, res) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to create users",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const { email, password } = req.body;

        const newUser = await createUser({ email, password });

        res.status(HttpStatusCode.CREATED).json({
            message: "User created succesfully",
            data: { user: instanceToPlain(newUser) },
        });
    },
);

export const getAllUsersController = asyncHandler(
    async (req: userRequest, res) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to fetch users",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const users = await getAllUsers();

        res.status(HttpStatusCode.OK).json({
            message: "Users fetched succesfully",
            data: { users: instanceToPlain(users) },
        });
    },
);

export const updateUserRoleController = asyncHandler(
    async (req: userRequest, res) => {
        if (req.JWTrole !== userRole.ADMIN) {
            throw new HttpError(
                "You are not authorized to update user roles",
                HttpStatusCode.FORBIDDEN,
            );
        }

        const userId = parseInt(req.params.id);
        const updatedUser = await updateUserRole(userId, req.JWTrole);

        res.status(HttpStatusCode.OK).json({
            message: "User role updated succesfully",
            data: { user: instanceToPlain(updatedUser) },
        });
    },
);
