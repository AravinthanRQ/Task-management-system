import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/env";
import { userRepository } from "./repository";
import hashPassword from "../common/hashPassword";
import log from "../common/log";
import { logT } from "../common/logT.enum";
import { userRole } from "../common/userRole.enum";

const seedAdminUser = async () => {
    const existingAdmin = await userRepository.findOneBy({
        email: ADMIN_EMAIL,
    });
    if (existingAdmin) {
        log(logT.Seed, "Admin user already exists");
        return;
    }

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    const adminUser = userRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: userRole.ADMIN,
    });

    await userRepository.save(adminUser);

    log(logT.Seed, "Admin user created");
};

export default seedAdminUser;
