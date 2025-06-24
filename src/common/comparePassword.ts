import { compare } from "bcrypt";

const comparePassword = async (password: string, hashedPassword: string) => {
    return await compare(password, hashedPassword);
};

export default comparePassword;