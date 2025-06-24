import { hash } from "bcrypt";
import { SALT_ROUNDS } from "../config/env";

const hashPassword = async (password: string): Promise<string> => {
    const hashedPassword = await hash(password, SALT_ROUNDS);
    return hashedPassword;
};

export default hashPassword;
