import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import hashPassword from "../common/hashPassword";
import { enqueueWelcomeEmail } from "../queues/user.queue";
import { User } from "../entities/User";
import { userRole } from "../common/userRole.enum";

export const createUser = async ({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<User> => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new HttpError("User already exists", HttpStatusCode.BAD_REQUEST);
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await userRepository.createAndSave({
        email,
        password: hashedPassword,
    });

    await enqueueWelcomeEmail(newUser);

    return newUser;
};

export const getAllUsers = async (): Promise<User[]> => {
    return userRepository.findAll();
};

export const updateUserRole = async (
    userId: number,
    role: userRole,
): Promise<User> => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);
    }
    const updatedUser = await userRepository.updateUserRole(user, role);
    return updatedUser;
};

