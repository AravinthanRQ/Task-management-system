import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import comparePassword from "../common/comparePassword";
import { generateToken } from "../common/jwt";
import { User } from "../entities/User";
import hashPassword from "../common/hashPassword";
import { userCreds } from "../common/userCreds.interface";

export const registerUser = async ({
    email,
    password,
    role,
}: userCreds): Promise<{
    token: string;
    user: User;
}> => {
    const hashedPassword = await hashPassword(password);
    const user = await userRepository.createAndSave({
        email,
        password: hashedPassword,
        role,
    });
    const token = generateToken({ id: user.id });
    return { token, user };
};

export const loginUser = async ({
    email,
    password,
}: userCreds): Promise<{ user: User; token: string }> => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new HttpError("Invalid password", HttpStatusCode.BAD_REQUEST);
    }

    const token = generateToken({ id: user.id });
    return { token, user };
};

export const getProfile = async (userId: number): Promise<User> => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);
    }
    return user;
};
