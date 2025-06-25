import { RegisterUserDto } from "../dto/register-user.dto";
import { UpdateUserRoleDto } from "../dto/update-user-role.dto";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import hashPassword from "../common/hashPassword";
import { enqueueWelcomeEmail } from "../queues/user.queue";
import { User } from "../entities/User";

export const userService = {
    async createUser(registerDto: RegisterUserDto): Promise<User> {
        const existingUser = await userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new HttpError("User already exists", HttpStatusCode.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(registerDto.password);
        const newUser = await userRepository.createAndSave({ ...registerDto, password: hashedPassword });
        
        await enqueueWelcomeEmail(newUser);
        
        return newUser;
    },

    async getAllUsers(): Promise<User[]> {
        return userRepository.findAll();
    },

    async updateUserRole(userId: number, roleDto: UpdateUserRoleDto): Promise<User> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);
        }
        return userRepository.updateUserRole(user, roleDto.role);
    }
};