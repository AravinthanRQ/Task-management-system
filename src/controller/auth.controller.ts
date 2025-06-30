import { instanceToPlain } from "class-transformer";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { asyncHandler } from "../middlewares/error.middleware";
import { getProfile, loginUser, registerUser } from "../services/auth.services";
import { userRequest } from "../common/userRequest.interface";

export const registerUserController = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const { token, user } = await registerUser({
        email,
        password,
        role,
    });
    res.status(HttpStatusCode.CREATED).json({
        message: "User registered successfully with role" + role,
        data: { token, user: instanceToPlain(user) },
    });
});

export const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { token, user } = await loginUser({ email, password });
    res.status(HttpStatusCode.OK).json({
        message: "User logged in succesfully",
        data: { token, user: instanceToPlain(user) },
    });
});

export const getProfileController = asyncHandler(
    async (req: userRequest, res) => {
        const user = await getProfile(req.id!);

        res.status(HttpStatusCode.OK).json({
            message: "User profile fetched succesfully",
            data: { user: instanceToPlain(user) },
        });
    },
);
