import { plainToInstance, ClassConstructor } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { HttpError } from "./error.middleware";
import { HttpStatusCode } from "../common/httpStatus.enum";

/** Defining Union type for RequestSource to be from body, query or params */
type RequestSource = "body" | "query" | "params";
/**
 * Recursively Formatting Error messages
 * @param errors - Complex error messages raised on validation
 * @returns - Flat array of readable strings
 */
function formatErrors(errors: ValidationError[]): string[] {
    /**Flatten arrays of array into one array*/
    return errors.flatMap((err) => {
        /**Contains validation error messgaes*/
        if (err.constraints) {
            return Object.values(err.constraints);
        }
        /**Used for nested objects (e.g. validating field inside another object)*/
        if (err.children && err.children.length > 0) {
            return formatErrors(err.children);
        }
        return [];
    });
}

/**
 * Generic middleware function for validating inputs based on DTO class
 * @param dto - The class to validate against
 * @param source - where the request to get data (body, query, params)
 * @param skipMissingProperties - whether to ignore missing fields during validation
 * @returns - middleware function with validation logic
 * NOTE: To write a middleware that accepts input on routes, the function has to accept parameters (dto, source and skipMissingProperties) then return a middleware with requesthandler. In case of a middleware with no input paramters then a simple function should suffice
 */
const validationMiddleware = <T extends object>(
    dto: ClassConstructor<T>,
    source: RequestSource = "body",
    skipMissingProperties = false,
): RequestHandler => {
    /** Returns the actual middleware function */
    return (req, res, next) => {
        /** Converts req[source] to an instance of the given DTO class. This is required for decorators to work */
        const dtoObject = plainToInstance(dto, req[source]);

        validate(dtoObject, {
            skipMissingProperties,
            whitelist: true, // Remove any properties not in the DTO
            forbidNonWhitelisted: true, // Extra fields not in the DTO cause errors
        }).then((errors: ValidationError[]) => {
            if (errors.length > 0) {
                /** Formatting the errors and return 400 BAD_REQUEST with the formatted error messages*/
                const errorMessages = formatErrors(errors);
                throw new HttpError(
                    errorMessages.join("\n"),
                    HttpStatusCode.BAD_REQUEST,
                );
            } else {
                /**If no errors, we replace req[source] with the validated and cleaned DTO object*/
                req[source] = dtoObject;
                next();
            }
        });
    };
};

export default validationMiddleware;
