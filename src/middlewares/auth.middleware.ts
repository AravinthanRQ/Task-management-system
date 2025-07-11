import { Response, NextFunction } from "express";
import { HttpError } from "./error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";
import { userRequest } from "../common/userRequest.interface";
import { validateToken } from "../common/jwt";

/**
 * Authenticating middleware for JWT
 * @params req - request handler of type userRequest that extends Request of Express to include role and id
 * @params  next - next function of Express to jump to the next middleware
 */
const authenticate = (req: userRequest, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken)
        throw new HttpError(
            "Bearer Token is missing or undefined in authorization header",
            HttpStatusCode.UNAUTHORIZED,
        );
    const token = bearerToken.split(" ")[1];
    if (!token)
        throw new HttpError(
            "Token is missing or undefined in bearer token",
            HttpStatusCode.UNAUTHORIZED,
        );

    const { id } = validateToken(token);
    req.id = id;
    next();
};

export default authenticate;
