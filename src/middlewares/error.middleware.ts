import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../common/httpStatus.enum";

// Add an optional statusCode to Error object to return in case of an error
interface AppError extends Error {
    statusCode?: number;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // If error has status code, we use it or else have a generic INTERNAL_SERVER_ERROR i.e. "Something went wrong"
    const statusCode = err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR;

    /* Creating a response object to send back that includes:
     * 1. error message, if not present then default to "An unexpected error occurred"
     * 2. statusCode from Error
     * 3. error stack trace if the node environemnt is in development
     */
    const response = {
        message: err.message || "An unexpected error occurred",
        statusCode,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

/*
 * A helper higher order function as in Express, asynchronous route handlers don't automatically send errors to the error handler, and requires try/catch in every route
 * Instead of repeating try/catch everywhere, we can wrap the async functions with asynchandler. We can implement it with the asyncHandler below that:
 * - Takes an async function (fn) i.e. route handler
 * - Returns a new function that Express can use as middleware
 * - Runs the original function and if it throws an error (or rejects), it catches the error and passes it to next(), which tells Express to handle it i.e. with the error handler above.
 */
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);

/*
 * asyncHandler make sure async errors don't crash the app
 * next(err) forwards the error
 * app.use(errorHandler) handles it and sends the response
 */

// Creating our own error type, we can throw errors with both a message and a status code (like 400, 404)
export class HttpError extends Error {
    statusCode: HttpStatusCode; // Adding a new property called statusCode to the error

    // The constructor runs when a new HTTPEror is created that accepts a message and a statusCode
    constructor(
        message: string,
        statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    ) {
        super(message); // Call the parent class (Error) constructor and sets the message
        this.statusCode = statusCode; // Saves the statusCode inside the object to access it later

        Object.setPrototypeOf(this, HttpError.prototype); // Makes sure the custom error behaves like a true HttpError helping err instanceof HttpError work correctly

        Error.captureStackTrace(this, this.constructor); // Grabs the place in the code where the error happened and removes unnecessary clutter from the stack trace (like the constructor itself)
    }
}
