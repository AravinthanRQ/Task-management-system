import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
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
        if (error instanceof TokenExpiredError) {
            throw new HttpError(
                "JWT Token has expired",
                HttpStatusCode.UNAUTHORIZED,
            );
        }
        if (error instanceof JsonWebTokenError) {
            throw new HttpError("Invalid JWT Token", HttpStatusCode.UNAUTHORIZED);
        }
        throw new HttpError(
            "An unexpected error occurred with JWT Token",
            HttpStatusCode.INTERNAL_SERVER_ERROR,
        );
    }
};
