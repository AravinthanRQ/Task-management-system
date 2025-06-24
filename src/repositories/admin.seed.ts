import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config/env";
import { userRepository } from "./repository";
import hashPassword from "../common/hashPassword";
import log from "../common/log";

const seedAdminUser = async () => {
    const existingAdmin = await userRepository.findOneBy({
        email: ADMIN_EMAIL,
    });
    if (existingAdmin) {
        log("SEED", "Admin user already exists");
        return;
    }

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    const adminUser = userRepository.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
    });

    await userRepository.save(adminUser);

    log("SEED", "Admin user created");
};

export default seedAdminUser;
