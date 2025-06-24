import { Response, NextFunction } from "express";
import { userRequest } from "../common/userRequest.interface";
import { userRole } from "../common/userRole.enum";
import { userRepository } from "../repositories/repository";
import { HttpError } from "./error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";

const roleIdentifier = async (
    req: userRequest,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req;
    if (!id) {
        throw new HttpError("User ID is missing", HttpStatusCode.BAD_REQUEST);
    }
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
        throw new HttpError("User not found", HttpStatusCode.BAD_REQUEST);
    }
    if (user?.role === userRole.ADMIN) {
        req.role = userRole.ADMIN;
    } else {
        req.role = userRole.USER;
    }
    next();
};

export default roleIdentifier;