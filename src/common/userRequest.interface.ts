import { Request } from "express";
import { userRole } from "./userRole.enum";

export interface userRequest extends Request {
    id?: number;
    role?: userRole;
}
