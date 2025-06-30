import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { RegisterUserDto } from "../dto/register-user.dto";
import { userRole } from "../common/userRole.enum";
import { userCreds } from "../common/userCreds.interface";

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

    createAndSave({ email, password, role }: userCreds): Promise<User> {
        const newUser = ormRepository.create({ email, password, role });
        return ormRepository.save(newUser);
    },

    updateUserRole(user: User, role: userRole): Promise<User> {
        user.role = role;
        return ormRepository.save(user);
    },
};

