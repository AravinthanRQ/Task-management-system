import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { RegisterUserDto } from "../dto/register-user.dto";
import { userRole } from "../common/userRole.enum";

const ormRepository = AppDataSource.getRepository(User);

export const userRepository = {
    findByEmail(email: string): Promise<User | null> {
        return ormRepository.findOne({ where: { email } });
    },

    findById(id: number): Promise<User | null> {
        return ormRepository.findOne({ where: { id } });
    },

    findAll(): Promise<User[]> {
        return ormRepository.find();
    },

    async createAndSave(userData: Omit<RegisterUserDto, 'password'> & {password: string}): Promise<User> {
        const newUser = ormRepository.create(userData);
        return ormRepository.save(newUser);
    },
    
    async updateUserRole(user: User, role: userRole): Promise<User> {
        user.role = role;
        return ormRepository.save(user);
    }
};