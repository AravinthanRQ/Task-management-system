import { LoginUserDto } from "../dto/login-user.dto";
import { userRepository } from "../repositories/user.repository";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import comparePassword from "../common/comparePassword";
import { generateToken } from "../common/jwt";
import { User } from "../entities/User";

export const authService = {
    async login(loginDto: LoginUserDto): Promise<{ user: User, token: string }> {
        const user = await userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
        }

        const isPasswordValid = await comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new HttpError("Invalid password", HttpStatusCode.BAD_REQUEST);
        }
        
        const token = generateToken({ id: user.id });
        return { user, token };
    },

    async getProfile(userId: number): Promise<User> {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new HttpError("User not found", HttpStatusCode.NOT_FOUND);
        }
        return user;
    }
};