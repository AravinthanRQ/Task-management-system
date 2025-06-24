import { Request } from "express";

export interface userRequest extends Request {
    id?: number;
}
