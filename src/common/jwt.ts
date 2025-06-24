import jwt from "jsonwebtoken";
import { JWT_EXPIRATION, JWT_SECRET } from "../config/env";
import { HttpError } from "../middlewares/error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userJWTPayload } from "./jwtPayload.interface";

export const generateToken = ({ id }: userJWTPayload) => {
    const generatedToken = jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
    });
    return generatedToken;
};

export const validateToken = (token: string) => {
    try {
        const validToken = jwt.verify(token, JWT_SECRET) as userJWTPayload;
        return validToken;
    } catch (error) {
        throw new HttpError("Invalid JWT Token", HttpStatusCode.CONFLICT);
    }
};
